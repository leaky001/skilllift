import React, { useState, useEffect } from 'react';
import { FaUpload, FaVideo, FaPlay, FaSpinner, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getTutorCourses } from '../../services/tutorService';
import { apiService } from '../../services/api';
import { config } from '../../config/environment';

const TutorReplays = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [replays, setReplays] = useState([]);
  const [replaysLoading, setReplaysLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    topic: '',
    replayFile: null
  });

  // Load tutor's courses and replays on component mount
  useEffect(() => {
    loadCourses();
    loadReplays();
  }, []);

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      console.log('🔄 Loading tutor courses for replays...');
      console.log('👤 Current user:', user);
      console.log('🔑 Token check:', token ? 'Present' : 'Missing');
      
      const response = await getTutorCourses();
      console.log('📚 Courses response:', response);
      
      if (response.success) {
        const courseData = response.data || [];
        console.log('✅ Courses loaded successfully:', courseData);
        console.log('📊 Number of courses:', courseData.length);
        setCourses(courseData);
      } else {
        console.error('❌ Failed to load courses:', response.message);
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadReplays = async () => {
    try {
      setReplaysLoading(true);
      console.log('🔄 Loading tutor replays...');
      const { data: result } = await apiService.get('/tutor/replays');
      if (result.success) {
        setReplays(result.data || []);
        console.log('✅ Replays loaded successfully:', result.data?.length || 0, 'replays');
      } else {
        console.error('❌ Failed to load replays:', result.message);
        setReplays([]);
      }
    } catch (error) {
      console.error('❌ Error loading replays:', error);
      setReplays([]);
    } finally {
      setReplaysLoading(false);
    }
  };

  const handleDeleteReplay = async (replayId) => {
    try {
      const { data: result } = await apiService.delete(`/tutor/replays/${replayId}`);
      if (result.success) {
        alert('Replay deleted successfully!');
        loadReplays(); // Reload the replays list
      } else {
        alert('Failed to delete replay: ' + result.message);
      }
    } catch (error) {
      console.error('❌ Error deleting replay:', error);
      alert('Failed to delete replay. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseId || !formData.topic || !formData.replayFile) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate file size before upload (2GB = 2 * 1024 * 1024 * 1024 bytes)
    const maxFileSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (formData.replayFile.size > maxFileSize) {
      const fileSizeMB = (formData.replayFile.size / 1024 / 1024).toFixed(2);
      alert(`File is too large! Maximum file size is 2GB. Your file is ${fileSizeMB} MB (${(fileSizeMB / 1024).toFixed(2)} GB).`);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Uploading replay:', formData);
      
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('courseId', formData.courseId);
      uploadData.append('topic', formData.topic);
      uploadData.append('replayFile', formData.replayFile);

      // Upload to the API endpoint
      console.log('🔑 Token from useAuth:', token ? 'Present' : 'Missing');
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'None');
      console.log('🔑 Full Authorization header:', `Bearer ${token}`);
      
      // Use apiService.upload method which has timeout built-in
      // Add upload progress tracking
      const fileSizeMB = (formData.replayFile.size / 1024 / 1024).toFixed(2);
      const fileSizeGB = (formData.replayFile.size / 1024 / 1024 / 1024).toFixed(2);
      console.log('📤 Starting file upload...', {
        fileName: formData.replayFile.name,
        fileSize: `${fileSizeMB} MB (${fileSizeGB} GB)`,
        fileType: formData.replayFile.type,
        timeout: '10 minutes',
        estimatedTime: `${Math.ceil(parseFloat(fileSizeMB) / 10)} minutes (estimated at 10 MB/s)`
      });
      
      const response = await apiService.upload('/tutor/replays/upload', uploadData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            const loadedMB = (progressEvent.loaded / 1024 / 1024).toFixed(2);
            const totalMB = (progressEvent.total / 1024 / 1024).toFixed(2);
            console.log(`📤 Upload progress: ${percentCompleted}% (${loadedMB} MB / ${totalMB} MB)`);
          } else {
            console.log(`📤 Upload progress: ${(progressEvent.loaded / 1024 / 1024).toFixed(2)} MB uploaded`);
          }
        }
      });
      
      const result = response.data;
      console.log('📡 Upload result:', result);
      
      if (!result?.success) {
        throw new Error(result?.message || 'Upload failed');
      }
      
      console.log('✅ Replay uploaded successfully');
      alert('Replay uploaded successfully! Students will be notified.');
      
      // Reset form and reload replays
      setFormData({
        courseId: '',
        topic: '',
        replayFile: null
      });
      // Reset file input
      const fileInput = document.getElementById('replayFile');
      if (fileInput) {
        fileInput.value = '';
      }
      loadReplays(); // Reload the replays list
    } catch (error) {
      console.error('❌ Error uploading replay:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      console.error('❌ Error response headers:', error.response?.headers);
      console.error('❌ Full error object:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      let errorMessage = 'Failed to upload replay. ';
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        const fileSizeGB = (formData.replayFile.size / 1024 / 1024 / 1024).toFixed(2);
        errorMessage = `Upload timed out! Your file is ${fileSizeGB} GB, which is very large. `;
        if (parseFloat(fileSizeGB) > 2) {
          errorMessage += `The file exceeds the 2GB limit. Please compress or split the video into smaller parts.`;
        } else {
          errorMessage += `Please check your internet connection and try again. Large files may take several minutes to upload.`;
        }
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('too large')) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check your connection and try again.';
      }
      
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Class Replays</h1>
          <p className="text-slate-600 text-lg">Upload and manage your live class recordings</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mr-3 shadow-md">
              <FaUpload className="text-primary-600" />
            </div>
            Upload New Replay
          </h2>
          
          {courses.length === 0 && !coursesLoading && (
            <div className="mb-6 p-4 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl">
              <p className="text-amber-800 text-sm font-semibold">
                <strong>No courses found!</strong> You need to create at least one course before you can upload replays. 
                <a href="/tutor/courses/create" className="text-amber-600 hover:text-amber-700 underline ml-1 font-bold">
                  Create your first course here
                </a>
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Course *
                </label>
                {coursesLoading ? (
                  <div className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2 text-primary-600" />
                    <span className="text-slate-600">Loading your courses...</span>
                  </div>
                ) : (
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white font-medium"
                    required
                  >
                    <option value="">Choose a course...</option>
                    {courses.length === 0 ? (
                      <option disabled>No courses found. Create a course first.</option>
                    ) : (
                      courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title} ({course.status === 'published' ? 'Published' : 'Draft'})
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What topic did you cover? *
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g., Introduction to React Hooks, CSS Grid Layout..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Upload Video File *
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-200 cursor-pointer">
                <input
                  type="file"
                  id="replayFile"
                  accept="video/*"
                  onChange={(e) => setFormData(prev => ({ ...prev, replayFile: e.target.files[0] }))}
                  className="hidden"
                />
                <label htmlFor="replayFile" className="cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <FaUpload className="h-6 w-6 text-primary-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    {formData.replayFile ? 'Change Video File' : 'Click to upload video'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    MP4, AVI, MOV, WMV up to 2GB
                  </p>
                  {formData.replayFile && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-semibold" style={{ 
                        color: formData.replayFile.size > 2 * 1024 * 1024 * 1024 ? '#dc2626' : '#059669' 
                      }}>
                        File size: {(formData.replayFile.size / 1024 / 1024).toFixed(2)} MB 
                        ({(formData.replayFile.size / 1024 / 1024 / 1024).toFixed(2)} GB)
                        {formData.replayFile.size > 2 * 1024 * 1024 * 1024 && (
                          <span className="block text-red-600 font-bold mt-1">
                            ⚠️ File exceeds 2GB limit!
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || coursesLoading || courses.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload className="mr-2" />
                    Upload Replay
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Replays */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center mr-3 shadow-md">
              <FaPlay className="text-secondary-600" />
            </div>
            Your Replays ({replays.length})
          </h2>
          
          {replaysLoading ? (
            <div className="flex items-center justify-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <FaSpinner className="animate-spin mr-3 text-primary-600 h-6 w-6" />
              <span className="text-slate-600 font-medium">Loading replays...</span>
            </div>
          ) : replays.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <FaVideo className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No replays yet</h3>
              <p className="text-slate-600 font-medium">Upload your first replay to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {replays.map((replay) => (
                <div key={replay._id} className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 mb-1 line-clamp-2">
                        {replay.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2 font-medium">{replay.courseTitle || replay.course?.title || 'Unknown Course'}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        replay.status === 'ready' ? 'bg-green-100 text-green-800 border-green-200' :
                        replay.status === 'processing' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        replay.status === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {replay.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between font-medium">
                      <span>Uploaded: {new Date(replay.uploadDate).toLocaleDateString()}</span>
                      <span className="text-primary-600 font-semibold">{replay.viewCount || 0} views</span>
                    </div>
                    {replay.fileSize && (
                      <div className="mt-2 text-xs font-medium">
                        Size: {(replay.fileSize / (1024 * 1024)).toFixed(1)} MB
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // Construct proper URL for backend server
                        // Use the API base URL from config
                        const apiBaseUrl = config.apiUrl.replace('/api', ''); // Remove /api suffix
                        const videoUrl = replay.fileUrl.startsWith('http') 
                          ? replay.fileUrl 
                          : `${apiBaseUrl}${replay.fileUrl.startsWith('/') ? replay.fileUrl : '/' + replay.fileUrl}`;
                        console.log('🎥 Opening video URL:', videoUrl);
                        window.open(videoUrl, '_blank');
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-semibold"
                    >
                      <FaPlay className="mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this replay?')) {
                          handleDeleteReplay(replay._id);
                        }
                      }}
                      className="px-4 py-2.5 text-red-600 hover:text-red-700 border border-red-300 rounded-xl hover:bg-red-50 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-semibold"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  {replay.deleteAt && (
                    <div className="mt-3 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                      Auto-deletes: {new Date(replay.deleteAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorReplays;