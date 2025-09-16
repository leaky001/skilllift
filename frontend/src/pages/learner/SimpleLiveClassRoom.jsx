import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showError, showSuccess } from '../../services/toastService.jsx';
import { apiService } from '../../services/api';
import EnhancedVideoChat from '../../components/EnhancedVideoChat';

const SimpleLiveClassRoom = () => {
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
      console.log('🎥 Loading live class:', classId);
      
      // Load live class data
      const response = await apiService.get(`/live-classes/${classId}`);
      console.log('📚 Full API response:', response);
      console.log('📚 Response data:', response.data);
      
      // The API returns { success: true, data: liveClass }
      const liveClassData = response.data.data || response.data;
      console.log('📚 Live class data:', liveClassData);
      console.log('📚 Available fields:', Object.keys(liveClassData));
      setLiveClass(liveClassData);
      
      // Check if user is enrolled in the course
      if (liveClassData.courseId && liveClassData.courseId._id) {
        console.log('📝 Checking enrollment for course:', liveClassData.courseId._id);
        const enrollmentResponse = await apiService.get(`/enrollments/check-status/${liveClassData.courseId._id}`);
        console.log('✅ Enrollment status:', enrollmentResponse.data);
        
        if (!enrollmentResponse.data.data.isEnrolled) {
          setError('You are not enrolled in this course');
          return;
        }
      } else {
        console.warn('No courseId found in live class data:', liveClassData);
        console.warn('Available fields:', Object.keys(liveClassData));
        // For now, skip enrollment check and proceed
        console.log('⚠️ Skipping enrollment check for now');
      }
      
      setIsLoading(false);
      showSuccess('Live class loaded successfully!');
      
    } catch (error) {
      console.error('Error loading live class:', error);
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
          <p className="text-lg">Please login to join the live class</p>
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
          <p className="mt-4 text-lg">Joining live class...</p>
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
            onClick={() => navigate('/learner/live-classes')}
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
            <span><strong>Tutor:</strong> {liveClass?.tutorId?.name}</span>
            <span><strong>Duration:</strong> {liveClass?.duration} min</span>
            <span><strong>Status:</strong> {liveClass?.status}</span>
          </div>
        </div>
      </div>

      {/* Video Chat Component */}
      <EnhancedVideoChat 
        classId={classId}
        isHost={false}
        userName={user?.name || 'Learner'}
        userId={user?._id}
        token={token}
        liveClassData={liveClass}
      />
    </div>
  );
};

export default SimpleLiveClassRoom;
