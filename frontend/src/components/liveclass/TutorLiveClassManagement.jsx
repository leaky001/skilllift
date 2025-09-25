import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { liveClassService } from '../../services/liveClassService';
import StreamVideoCall from './StreamVideoCall';
import { toast } from 'react-toastify';
import { 
  FaVideo, 
  FaVideoSlash, 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaStop, 
  FaArrowLeft,
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaPlay,
  FaEdit,
  FaTrash,
  FaTimes
} from 'react-icons/fa';

const TutorLiveClassManagement = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [liveClasses, setLiveClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [streamToken, setStreamToken] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    duration: 60,
    settings: {
      allowScreenShare: true,
      allowChat: true,
      allowLearnerScreenShare: false,
      maxParticipants: 50,
      autoRecord: true
    }
  });

  useEffect(() => {
    loadLiveClasses();
  }, [courseId]);

  const loadLiveClasses = async () => {
    try {
      setIsLoading(true);
      const response = await liveClassService.getCourseLiveClasses(courseId);
      setLiveClasses(response.data);
    } catch (error) {
      console.error('Error loading live classes:', error);
      setError('Failed to load live classes');
      toast.error('Failed to load live classes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLiveClass = async (e) => {
    e.preventDefault();
    try {
      const response = await liveClassService.createLiveClass({
        ...formData,
        courseId,
        scheduledDate: new Date(formData.scheduledDate).toISOString()
      });

      toast.success('Live class created successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        scheduledDate: '',
        duration: 60,
        settings: {
          allowScreenShare: true,
          allowChat: true,
          allowLearnerScreenShare: false,
          maxParticipants: 50,
          autoRecord: true
        }
      });
      loadLiveClasses();
    } catch (error) {
      console.error('Error creating live class:', error);
      toast.error('Failed to create live class');
    }
  };

  const handleStartLiveClass = async (liveClassId) => {
    try {
      // Check if the live class is already live
      const liveClass = liveClasses.find(lc => lc._id === liveClassId);
      
      if (liveClass && liveClass.status === 'live') {
        // If already live, join the existing session
        const response = await liveClassService.joinLiveClassAsTutor(liveClassId);
        setActiveCall(response.data.liveClass);
        setStreamToken(response.data.streamToken);
        toast.success('Joining live class...');
      } else if (liveClass && (liveClass.status === 'ready' || liveClass.status === 'scheduled')) {
        // Start a new live class
        const response = await liveClassService.startLiveClass(liveClassId);
        setActiveCall(response.data.liveClass);
        setStreamToken(response.data.streamToken);
        toast.success('Live class started! Learners will be notified.');
        // Reload live classes to update the status
        loadLiveClasses();
      }
    } catch (error) {
      console.error('Error starting/joining live class:', error);
      toast.error('Failed to start/join live class');
    }
  };

  const handleEndLiveClass = async () => {
    if (!activeCall) return;
    
    try {
      await liveClassService.endLiveClass(activeCall._id);
      setActiveCall(null);
      setStreamToken(null);
      toast.success('Live class ended successfully!');
      loadLiveClasses();
    } catch (error) {
      console.error('Error ending live class:', error);
      toast.error('Failed to end live class');
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
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-yellow-100 text-yellow-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (activeCall) {
    return (
      <StreamVideoCall
        callId={activeCall.callId}
        streamToken={streamToken}
        isHost={true}
        onCallEnd={handleEndLiveClass}
        settings={activeCall.settings}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Class Management</h1>
            <p className="text-gray-600">Manage live classes for your course</p>
          </div>
        </div>
        <button
          onClick={() => {
            console.log('🎯 Create Live Class button clicked');
            console.log('🎯 Current showCreateForm state:', showCreateForm);
            setShowCreateForm(true);
            console.log('🎯 Set showCreateForm to true');
          }}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
        >
          <FaVideo />
          <span>Create Live Class</span>
        </button>
      </div>

      {/* Create Live Class Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {console.log('🎯 Modal is rendering, showCreateForm:', showCreateForm)}
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create New Live Class</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleCreateLiveClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="15"
                    max="480"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Settings</h3>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowScreenShare"
                    checked={formData.settings.allowScreenShare}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, allowScreenShare: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="allowScreenShare" className="text-sm text-gray-700">
                    Allow screen sharing
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowChat"
                    checked={formData.settings.allowChat}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, allowChat: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="allowChat" className="text-sm text-gray-700">
                    Enable chat
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowLearnerScreenShare"
                    checked={formData.settings.allowLearnerScreenShare}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, allowLearnerScreenShare: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="allowLearnerScreenShare" className="text-sm text-gray-700">
                    Allow learners to share screen
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoRecord"
                    checked={formData.settings.autoRecord}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, autoRecord: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="autoRecord" className="text-sm text-gray-700">
                    Auto-record sessions
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Create Live Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Classes List */}
      <div className="space-y-6">
        {liveClasses.length === 0 ? (
          <div className="text-center py-12">
            <FaVideo className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Live Classes Yet</h3>
            <p className="text-gray-500 mb-6">Create your first live class to get started.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Create Live Class
            </button>
          </div>
        ) : (
          liveClasses.map((liveClass) => (
            <div key={liveClass._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{liveClass.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(liveClass.status)}`}>
                      {liveClass.status.charAt(0).toUpperCase() + liveClass.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{liveClass.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt />
                      <span>{formatDate(liveClass.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaClock />
                      <span>{liveClass.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaUsers />
                      <span>{liveClass.attendees?.length || 0} attendees</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {liveClass.status === 'ready' || liveClass.status === 'scheduled' ? (
                    <button
                      onClick={() => handleStartLiveClass(liveClass._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    >
                      <FaPlay />
                      <span>Start Live Class</span>
                    </button>
                  ) : liveClass.status === 'live' ? (
                    <button
                      onClick={() => handleStartLiveClass(liveClass._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <FaVideo />
                      <span>Join Live Class</span>
                    </button>
                  ) : null}

                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <FaEdit />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TutorLiveClassManagement;
