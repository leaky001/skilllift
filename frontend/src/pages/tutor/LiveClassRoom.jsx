import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EnhancedVideoChat from '../../components/EnhancedVideoChat';
import { useAuth } from '../../context/AuthContext';
import { showError } from '../../services/toastService.jsx';
import { apiService } from '../../services/api';

const LiveClassRoom = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isInitialized } = useAuth();
  
  const [liveClass, setLiveClass] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isInitialized) {
      loadLiveClass();
    }
  }, [classId, isInitialized]);

  const loadLiveClass = async () => {
    try {
      setIsLoading(true);
      console.log('🎥 Tutor loading live class:', classId);
      console.log('👤 Current user:', user);
      
      // Load live class data with timeout
      console.log('🎥 Making API call to:', `/live-classes/${classId}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('⏰ API call timed out after 10 seconds');
      }, 10000);
      
      const response = await apiService.get(`/live-classes/${classId}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      console.log('📚 Full API response:', response);
      const liveClassData = response.data.data || response.data;
      console.log('📚 Live class data:', liveClassData);
      setLiveClass(liveClassData);
      
      // Check if user is authorized to join as host
      console.log('🔍 Checking authorization:');
      console.log('  - Live class tutorId:', liveClassData.tutorId);
      console.log('  - Live class tutorId type:', typeof liveClassData.tutorId);
      console.log('  - Current user._id:', user._id);
      console.log('  - Current user._id type:', typeof user._id);
      console.log('  - User object:', user);
      console.log('  - Match (strict):', liveClassData.tutorId === user._id);
      console.log('  - Match (loose):', liveClassData.tutorId == user._id);
      
      // Handle both string and object tutorId
      const tutorId = typeof liveClassData.tutorId === 'object' ? liveClassData.tutorId._id : liveClassData.tutorId;
      console.log('  - Extracted tutorId:', tutorId);
      console.log('  - Final match:', tutorId === user._id);
      
      // Check authorization with proper ID handling
      if (tutorId !== user._id) {
        console.log('❌ Authorization failed - user not authorized');
        console.log('❌ Expected tutor ID:', tutorId);
        console.log('❌ Current user ID:', user._id);
        setError(`You are not authorized to host this live class. Expected tutor: ${tutorId}, Current user: ${user._id}`);
        return;
      }
      
      console.log('✅ Authorization passed - loading video chat');
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error loading live class:', error);
      setError('Failed to load live class: ' + error.message);
      setIsLoading(false);
    }
  };

  // Show loading while authentication is being initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Initializing...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-lg">Please login to access the live class</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading live class...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-lg">{error}</p>
          <button 
            onClick={() => navigate('/tutor/live-classes')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Live Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Live Class Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{liveClass?.title}</h1>
            <p className="text-gray-300 text-sm">{liveClass?.description}</p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <span><strong>Duration:</strong> {liveClass?.duration} min</span>
            <span><strong>Max Participants:</strong> {liveClass?.maxParticipants}</span>
            <span><strong>Status:</strong> {liveClass?.status}</span>
          </div>
        </div>
      </div>

      {/* Video Chat Component */}
      <EnhancedVideoChat 
        classId={classId}
        isHost={true}
        userName={user?.name || 'Tutor'}
        userId={user?._id}
        token={token}
        liveClassData={liveClass}
      />
    </div>
  );
};

export default LiveClassRoom;