import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { apiService } from '../../services/api';
import LiveSession from '../../components/LiveSession';

const LiveSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('participant');

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      
      // Check if sessionId exists
      if (!sessionId) {
        toast.error('No session ID provided');
        navigate('/learner/live-classes');
        return;
      }
      
      const response = await apiService.get(`/live-classes/${sessionId}`);
      if (response.data.success) {
        setSession(response.data.data);
        
        // Determine user role based on session data
        const currentUser = JSON.parse(localStorage.getItem('skilllift_user') || '{}');
        if (response.data.data.tutor._id === currentUser._id) {
          setUserRole('tutor');
        } else {
          setUserRole('participant');
        }
      } else {
        toast.error('Session not found');
        navigate('/learner/courses');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
      navigate('/learner/courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-2xl text-indigo-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h2>
          <p className="text-gray-600 mb-6">The session you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/learner/courses')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
            <div className="text-sm text-gray-500">
              {userRole === 'tutor' ? 'Tutor View' : 'Learner View'}
            </div>
          </div>
        </div>
      </div>

      {/* Live Session Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LiveSession sessionId={sessionId} userRole={userRole} />
      </div>
    </div>
  );
};

export default LiveSessionPage;
