import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { liveClassService } from '../../services/liveClassService';
import apiService from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaVideo, 
  FaBook, 
  FaUsers, 
  FaCalendarAlt,
  FaClock,
  FaPlay,
  FaArrowRight,
  FaSpinner,
  FaStop,
  FaTimes
} from 'react-icons/fa';

const LearnerLiveClasses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLiveClasses();
    
    // Refresh live classes every 5 seconds to catch status changes quickly
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing live classes for learner...');
      loadLiveClasses();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadLiveClasses = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setLoading(true);
        console.log('🔄 Force refreshing live classes...');
      }
      
      // Use the Google Meet system for active sessions
      let liveClassesWithSessions = [];
      try {
        // First, get active sessions from Google Meet system
        const activeSessionsResponse = await apiService.get('/google-meet/live/learner/active');
        if (activeSessionsResponse.data.success) {
          const activeSessions = activeSessionsResponse.data.data || [];
          console.log('🔍 Active Google Meet sessions:', activeSessions.length);
          
          // Convert Google Meet sessions to live class format
          liveClassesWithSessions = activeSessions.map(session => ({
            _id: session.sessionId,
            courseId: session.courseId,
            title: `${session.courseTitle} - Live Session`,
            description: `Live class for ${session.courseTitle}`,
            status: 'live',
            startTime: session.startTime,
            duration: 60, // Default duration
            tutorName: session.tutorName,
            meetLink: session.meetLink,
            participants: 0 // Will be updated if needed
          }));
        }
      } catch (error) {
        console.error('❌ Error fetching active Google Meet sessions:', error);
      }
      
      // Fallback: Also check the original live classes endpoint
      try {
        const response = await liveClassService.getLiveClasses();
        if (response.success) {
          const originalLiveClasses = (response.data || []).map(lc => ({
            _id: lc._id,
            courseId: lc.courseId._id,
            title: lc.title,
            description: lc.description,
            status: lc.status || 'scheduled',
            startTime: lc.scheduledDate,
            duration: lc.duration,
            tutorName: lc.tutorId?.name,
            meetLink: lc.meetLink,
            participants: lc.participants?.length || 0
          }));
          
          // Merge with Google Meet sessions, prioritizing Google Meet data
          const mergedClasses = [...liveClassesWithSessions];
          originalLiveClasses.forEach(originalClass => {
            const existsInGoogleMeet = liveClassesWithSessions.some(
              gmClass => gmClass.courseId === originalClass.courseId
            );
            if (!existsInGoogleMeet) {
              mergedClasses.push(originalClass);
            }
          });
          
          liveClassesWithSessions = mergedClasses;
        }
      } catch (error) {
        console.error('❌ Error fetching original live classes:', error);
      }
      
      console.log('🎯 Live classes found:', liveClassesWithSessions.length);
      console.log('🔍 Live classes details:', liveClassesWithSessions.map(lc => ({
        title: lc.title,
        status: lc.status,
        courseId: lc.courseId,
        meetLink: lc.meetLink ? 'Present' : 'Missing'
      })));
      
      // Check if any live class status has changed
      const statusChanged = liveClassesWithSessions.some((lc, index) => {
        const oldStatus = liveClasses[index]?.status;
        const newStatus = lc.status;
        return oldStatus !== newStatus;
      });
      
      if (statusChanged) {
        console.log('🔄 Live class status changed, updating UI...');
        console.log('Previous statuses:', liveClasses.map(lc => lc.status));
        console.log('New statuses:', liveClassesWithSessions.map(lc => lc.status));
        
        // Show toast notification for status change
        const liveClass = liveClassesWithSessions.find(lc => lc.status === 'live');
        if (liveClass) {
          toast.success(`Live class "${liveClass.title}" is now active! You can join now.`);
        }
      }
      
      setLiveClasses(liveClassesWithSessions);
      
      // Expose function to window for manual testing
      if (typeof window !== 'undefined') {
        window.forceRefreshLiveClasses = () => {
          console.log('🔄 Manual force refresh triggered');
          loadLiveClasses(true);
        };
      }
      
    } catch (error) {
      console.error('Error loading live classes:', error);
      setError('Failed to load live classes');
      toast.error('Failed to load live classes');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLiveClass = async (liveClass) => {
    if (liveClass.status === 'live') {
      try {
        console.log('🎯 Learner joining Google Meet live class:', liveClass.title);
        
        // Open Google Meet link directly
        if (liveClass.meetLink) {
          window.open(liveClass.meetLink, '_blank');
          toast.success('Opening Google Meet live class!');
        } else {
          console.warn('⚠️ No meet link found in liveClass:', liveClass);
          toast.error('Unable to join live class - no meeting link available');
        }
      } catch (error) {
        console.error('Error joining live class:', error);
        toast.error(error.response?.data?.message || 'Failed to join live class');
      }
    } else {
      toast.info('Live class is not active yet');
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'bg-secondary-100 text-secondary-800';
      case 'active':
        return 'bg-secondary-100 text-secondary-800';
      case 'ready':
        return 'bg-primary-100 text-primary-800';
      case 'scheduled':
        return 'bg-primary-100 text-primary-800';
      case 'ended':
        return 'bg-primary-100 text-primary-800';
      case 'cancelled':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-primary-100 text-primary-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-background-light p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="animate-spin text-4xl text-primary-600" />
            <span className="ml-3 text-lg text-text-secondary">Loading live classes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-background-light p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-error-50 border border-error-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-error-800 mb-2">Error Loading Live Classes</h2>
            <p className="text-error-600 mb-4">{error}</p>
            <button
              onClick={loadLiveClasses}
              className="bg-error-600 text-white px-4 py-2 rounded-lg hover:bg-error-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-background-light p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Live Classes</h1>
              <p className="text-text-secondary">Join live classes from your enrolled courses</p>
            </div>
            <button
              onClick={() => loadLiveClasses(true)}
              className="bg-secondary-600 text-white px-4 py-2 rounded-lg hover:bg-secondary-700 flex items-center space-x-2 transition-colors"
              title="Force refresh live classes"
            >
              <FaSpinner className="text-sm" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Live Classes Grid */}
        {liveClasses.length === 0 ? (
          <div className="bg-background-surface rounded-lg shadow-sm border border-primary-200 p-8 text-center">
            <FaVideo className="text-6xl text-primary-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Live Classes Available</h3>
            <p className="text-text-secondary mb-4">
              There are no live classes available at the moment. Check back later or contact your tutors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveClasses.map((liveClass) => (
              <div key={liveClass._id} className="bg-background-surface rounded-lg shadow-sm border border-primary-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Course Image */}
                <div className="h-48 bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
                  <FaBook className="text-6xl text-white opacity-80" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(liveClass.status)}`}>
                      {liveClass.status}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {liveClass.attendees?.length || 0} participants
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {liveClass.title || 'Live Class'}
                  </h3>

                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {liveClass.description || 'Join this live class to learn and interact with your tutor and fellow learners.'}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-text-secondary">
                      <FaCalendarAlt className="mr-2" />
                      {formatDate(liveClass.scheduledDate)}
                    </div>
                    <div className="flex items-center text-sm text-text-secondary">
                      <FaClock className="mr-2" />
                      {liveClass.duration || 60} minutes
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinLiveClass(liveClass)}
                    disabled={liveClass.status !== 'live'}
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      liveClass.status === 'live'
                        ? 'bg-secondary-600 text-white hover:bg-secondary-700'
                        : liveClass.status === 'ended' || liveClass.status === 'completed'
                        ? 'bg-gray-500 text-white cursor-not-allowed'
                        : 'bg-primary-300 text-primary-500 cursor-not-allowed'
                    }`}
                  >
                    {liveClass.status === 'live' ? (
                      <>
                        <FaPlay className="mr-2" />
                        Join Live Class
                        <FaArrowRight className="ml-2" />
                      </>
                    ) : liveClass.status === 'ended' || liveClass.status === 'completed' ? (
                      <>
                        <FaStop className="mr-2" />
                        Live Class Ended
                      </>
                    ) : liveClass.status === 'ready' || liveClass.status === 'scheduled' ? (
                      <>
                        <FaClock className="mr-2" />
                        Waiting for Tutor to Start
                      </>
                    ) : (
                      <>
                        <FaTimes className="mr-2" />
                        Not Available
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerLiveClasses;
