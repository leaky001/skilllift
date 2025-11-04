import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaCircle, FaSpinner } from 'react-icons/fa';
import apiService from '../../services/api';

/**
 * AutoRecorder Component
 * Automatically records live class video/audio streams
 * Uploads recording when class ends
 */
const AutoRecorder = ({ stream, sessionId, courseId, courseTitle, onRecordingComplete }) => {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const durationIntervalRef = useRef(null);

  useEffect(() => {
    if (stream && sessionId && !isRecording) {
      startRecording();
    }

    return () => {
      stopRecording();
    };
  }, [stream, sessionId]);

  const startRecording = async () => {
    try {
      console.log('🎬 Starting automatic recording...');
      
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        console.error('❌ MediaRecorder not supported in this browser');
        toast.error('Recording not supported in your browser. Please use Chrome or Firefox.');
        return;
      }

      // Determine the best codec
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      console.log('📹 Using mimeType:', mimeType);

      const options = {
        mimeType: mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps - good quality
        audioBitsPerSecond: 128000   // 128 kbps - good audio
      };

      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log(`📦 Chunk received: ${event.data.size} bytes`);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('⏹️ Recording stopped');
        clearInterval(durationIntervalRef.current);
        
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          console.log(`✅ Recording complete: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
          await uploadRecording(blob);
        } else {
          console.warn('⚠️ No recording data captured');
        }
      };

      mediaRecorder.onerror = (error) => {
        console.error('❌ MediaRecorder error:', error);
        toast.error('Recording error occurred');
      };

      // Start recording with timeslice (capture data every second)
      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      console.log('✅ Recording started automatically');
      toast.success('🎥 Recording started automatically!', { autoClose: 2000 });

    } catch (error) {
      console.error('❌ Error starting recording:', error);
      toast.error('Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('🛑 Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(durationIntervalRef.current);
    }
  };

  const uploadRecording = async (blob) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      const fileName = `recording-${sessionId}-${Date.now()}.webm`;
      formData.append('recording', blob, fileName);
      formData.append('sessionId', sessionId);
      formData.append('courseId', courseId);
      formData.append('courseTitle', courseTitle || 'Live Class');
      formData.append('duration', recordingDuration);

      console.log('📤 Uploading recording...', {
        size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
        fileName,
        sessionId,
        courseId
      });

      toast.info('📤 Uploading recording... This may take a few minutes.', {
        autoClose: false,
        toastId: 'upload-progress'
      });

      const response = await apiService.post('/recordings/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          console.log(`📊 Upload progress: ${percentCompleted}%`);
        }
      });

      if (response.data.success) {
        console.log('✅ Recording uploaded successfully:', response.data.recordingUrl);
        
        toast.dismiss('upload-progress');
        toast.success('✅ Recording uploaded! Available in replay section.', {
          autoClose: 5000
        });

        // Clear chunks to free memory
        chunksRef.current = [];
        
        // Callback
        if (onRecordingComplete) {
          onRecordingComplete(response.data.recordingUrl);
        }
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ Upload failed:', error);
      
      toast.dismiss('upload-progress');
      toast.error('Failed to upload recording. Recording may be lost.', {
        autoClose: 8000
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording && !isUploading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isRecording && (
        <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-pulse">
          <FaCircle className="text-white animate-pulse" />
          <div>
            <div className="font-semibold">Recording</div>
            <div className="text-xs">{formatDuration(recordingDuration)}</div>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <FaSpinner className="animate-spin" />
            <div>
              <div className="font-semibold">Uploading Recording</div>
              <div className="text-xs">{uploadProgress}% complete</div>
            </div>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoRecorder;

