import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import StreamVideoCall from './StreamVideoCall';
import { useAuth } from '../../context/AuthContext';
import { liveClassService } from '../../services/liveClassService';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

const TutorLiveClassRoom = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { liveClassId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { liveClass: stateLiveClass, streamToken: stateStreamToken, callId: stateCallId, sessionId: stateSessionId } = location.state || {};

  // Debug logging
  console.log('🎯 TutorLiveClassRoom Debug:', {
    liveClassId,
    locationState: location.state,
    stateLiveClass,
    stateStreamToken: stateStreamToken ? 'Present' : 'Missing',
    stateCallId,
    stateSessionId,
    user: user ? 'Present' : 'Missing'
  });

  useEffect(() => {
    const initializeLiveClass = async () => {
      try {
        setIsLoading(true);
        
        // If we have state data, use it
        if (stateLiveClass && stateStreamToken && stateCallId) {
          console.log('🎯 Using state data');
          setIsLoading(false);
          return;
        }

        // If we don't have state data but have liveClassId, fetch it
        if (liveClassId && !stateLiveClass) {
          console.log('🎯 Fetching live class data for ID:', liveClassId);
          const response = await liveClassService.startLiveClass(liveClassId);
          console.log('🎯 Fetched data:', response.data);
          
          // Update the location state with the fetched data
          navigate(`/live-class/${liveClassId}`, { 
            state: { 
              liveClass: response.data.liveClass,
              streamToken: response.data.streamToken,
              callId: response.data.callId,
              sessionId: response.data.sessionId
            },
            replace: true
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('🎯 Error initializing live class:', error);
        setError('Failed to load live class data');
        setIsLoading(false);
      }
    };

    initializeLiveClass();
  }, [liveClassId, stateLiveClass, stateStreamToken, stateCallId, navigate]);

  const handleCallEnd = () => {
    toast.success('Live class ended');
    navigate('/tutor/live-classes');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading live class...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-xl mb-4">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => navigate('/tutor/live-classes')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Live Classes
          </button>
        </div>
      </div>
    );
  }

  if (!stateLiveClass || !stateStreamToken || !stateCallId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-xl mb-4">Missing Live Class Data</h2>
          <p className="text-gray-300 mb-4">Please start the live class again.</p>
          <button
            onClick={() => navigate('/tutor/live-classes')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Live Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white text-xl font-semibold">{stateLiveClass.title}</h1>
          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
            Live
          </span>
        </div>
        <button
          onClick={handleCallEnd}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <FaTimes />
          <span>End Class</span>
        </button>
      </div>

      {/* Video Call */}
      <div className="h-[calc(100vh-80px)]">
        <StreamVideoCall
          callId={stateCallId}
          streamToken={stateStreamToken}
          isHost={true}
          onCallEnd={handleCallEnd}
          settings={{
            allowScreenShare: true,
            allowChat: true,
            allowLearnerScreenShare: false,
            maxParticipants: 50,
            autoRecord: true
          }}
        />
      </div>
    </div>
  );
};

export default TutorLiveClassRoom;
