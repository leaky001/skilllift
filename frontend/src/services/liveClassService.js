import api from './api';

// Live Class Services
export const createLiveClass = async (liveClassData) => {
  try {
    const response = await api.post('/tutor/live-classes', liveClassData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getTutorLiveClasses = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.courseId) queryParams.append('courseId', params.courseId);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await api.get(`/tutor/live-classes?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getLiveClass = async (liveClassId) => {
  try {
    const response = await api.get(`/tutor/live-classes/${liveClassId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateLiveClass = async (liveClassId, updateData) => {
  try {
    const response = await api.put(`/tutor/live-classes/${liveClassId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteLiveClass = async (liveClassId) => {
  try {
    const response = await api.delete(`/tutor/live-classes/${liveClassId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const startLiveClass = async (liveClassId, meetingData) => {
  try {
    const response = await api.post(`/tutor/live-classes/${liveClassId}/start`, meetingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const endLiveClass = async (liveClassId, recordingData) => {
  try {
    const response = await api.post(`/tutor/live-classes/${liveClassId}/end`, recordingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const answerQuestion = async (liveClassId, questionId, answer) => {
  try {
    const response = await api.post(`/tutor/live-classes/${liveClassId}/questions/${questionId}/answer`, {
      answer
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Live Class Types
export const LIVE_CLASS_TYPES = [
  { value: 'lecture', label: 'Lecture', icon: 'FaChalkboardTeacher' },
  { value: 'workshop', label: 'Workshop', icon: 'FaTools' },
  { value: 'qna', label: 'Q&A Session', icon: 'FaQuestionCircle' },
  { value: 'review', label: 'Review Session', icon: 'FaClipboardCheck' },
  { value: 'demo', label: 'Demo', icon: 'FaPlay' }
];

export const LIVE_CLASS_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'green' },
  { value: 'intermediate', label: 'Intermediate', color: 'yellow' },
  { value: 'advanced', label: 'Advanced', color: 'red' }
];

export const LIVE_CLASS_STATUSES = [
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'live', label: 'Live', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
];

// Utility functions
export const formatLiveClassDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const formatLiveClassDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getLiveClassStatusColor = (status) => {
  const statusConfig = LIVE_CLASS_STATUSES.find(s => s.value === status);
  return statusConfig ? statusConfig.color : 'gray';
};

export const isLiveClassUpcoming = (scheduledDate) => {
  return new Date(scheduledDate) > new Date();
};

export const isLiveClassLive = (status, scheduledDate) => {
  return status === 'live' || (status === 'scheduled' && new Date(scheduledDate) <= new Date());
};

// Learner-specific functions
export const getMyLiveClasses = async () => {
  try {
    const response = await api.get('/learner/live-classes');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const enrollInLiveSession = async (liveClassId) => {
  try {
    const response = await api.post(`/learner/live-classes/${liveClassId}/enroll`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const browseLiveSessions = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.level) queryParams.append('level', params.level);
    if (params.type) queryParams.append('type', params.type);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await api.get(`/learner/live-classes/browse?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Recording management functions
export const uploadRecording = async (liveClassId, recordingData) => {
  try {
    const response = await api.post(`/tutor/live-classes/${liveClassId}/upload-recording`, recordingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRecordings = async (liveClassId) => {
  try {
    const response = await api.get(`/live-classes/${liveClassId}/recordings`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteRecording = async (liveClassId, recordingId) => {
  try {
    const response = await api.delete(`/tutor/live-classes/${liveClassId}/recordings/${recordingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Alias for browseLiveSessions (used in some components)
export const getPublicLiveSessions = browseLiveSessions;

// Alias for createLiveClass (used in some components)
export const createLiveSession = createLiveClass;