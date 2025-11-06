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
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'ready':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'scheduled':
        return 'bg-primary-100 text-primary-800 border border-primary-200';
      case 'ended':
        return 'bg-slate-100 text-slate-800 border border-slate-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-primary-100 text-primary-800 border border-primary-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-md p-8 border border-slate-100">
          <FaSpinner className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">Loading live classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-md border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTimes className="text-2xl text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Live Classes</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={loadLiveClasses}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Live Classes</h1>
              <p className="text-slate-600 text-lg">Join live classes from your enrolled courses</p>
            </div>
            <button
              onClick={() => loadLiveClasses(true)}
              className="inline-flex items-center bg-secondary-600 hover:bg-secondary-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              title="Force refresh live classes"
            >
              <FaSpinner className="w-4 h-4 mr-2" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Live Classes Grid */}
        {liveClasses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaVideo className="text-4xl text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No Live Classes Available</h3>
            <p className="text-slate-600 text-lg mb-6 max-w-md mx-auto">
              There are no live classes available at the moment. Check back later or contact your tutors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveClasses.map((liveClass) => (
              <div key={liveClass._id} className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                {/* Course Image */}
                <div className="h-48 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 flex items-center justify-center relative overflow-hidden">
                  <FaBook className="text-6xl text-white opacity-90 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${getStatusColor(liveClass.status)}`}>
                      {liveClass.status?.toUpperCase() || 'SCHEDULED'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <FaUsers className="w-4 h-4 mr-1.5 text-primary-600" />
                      <span className="font-medium">{liveClass.attendees?.length || 0} participants</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                    {liveClass.title || 'Live Class'}
                  </h3>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {liveClass.description || 'Join this live class to learn and interact with your tutor and fellow learners.'}
                  </p>

                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center text-sm text-slate-600">
                      <FaCalendarAlt className="w-4 h-4 mr-2 text-primary-600" />
                      <span>{formatDate(liveClass.startTime || liveClass.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <FaClock className="w-4 h-4 mr-2 text-primary-600" />
                      <span>{liveClass.duration || 60} minutes</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinLiveClass(liveClass)}
                    disabled={liveClass.status !== 'live'}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      liveClass.status === 'live'
                        ? 'bg-gradient-to-r from-secondary-600 to-secondary-700 text-white hover:shadow-lg hover:scale-[1.02]'
                        : liveClass.status === 'ended' || liveClass.status === 'completed'
                        ? 'bg-slate-400 text-white cursor-not-allowed'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {liveClass.status === 'live' ? (
                      <>
                        <FaPlay className="w-4 h-4 mr-2" />
                        Join Live Class
                        <FaArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : liveClass.status === 'ended' || liveClass.status === 'completed' ? (
                      <>
                        <FaStop className="w-4 h-4 mr-2" />
                        Live Class Ended
                      </>
                    ) : liveClass.status === 'ready' || liveClass.status === 'scheduled' ? (
                      <>
                        <FaClock className="w-4 h-4 mr-2" />
                        Waiting for Tutor to Start
                      </>
                    ) : (
                      <>
                        <FaTimes className="w-4 h-4 mr-2" />
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
