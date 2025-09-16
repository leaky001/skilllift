import { createContext, useContext, useReducer, useEffect } from 'react';
import { showSuccess, showError, showWarning, showInfo } from '../services/toastService.jsx';
import { useAuth } from './AuthContext';

const MentorshipContext = createContext();

const initialState = {
  mentorships: [],
  availableMentors: [],
  isLoading: false,
  error: null,
};

const mentorshipReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'FETCH_MENTORSHIPS_SUCCESS':
      return {
        ...state,
        mentorships: action.payload,
        isLoading: false,
        error: null,
      };
    case 'FETCH_MENTORS_SUCCESS':
      return {
        ...state,
        availableMentors: action.payload,
        isLoading: false,
        error: null,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'REQUEST_MENTORSHIP':
      return {
        ...state,
        mentorships: [...state.mentorships, action.payload],
        isLoading: false,
        error: null,
      };
    case 'UPDATE_MENTORSHIP':
      return {
        ...state,
        mentorships: state.mentorships.map(m =>
          m._id === action.payload._id ? action.payload : m
        ),
        isLoading: false,
        error: null,
      };
    case 'DELETE_MENTORSHIP':
      return {
        ...state,
        mentorships: state.mentorships.filter(m => m._id !== action.payload),
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const MentorshipProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mentorshipReducer, initialState);
  const { user } = useAuth();

  // Fetch user's mentorships
  const fetchMentorships = async () => {
    if (!user) return;
    
    dispatch({ type: 'FETCH_START' });
    try {
      // TODO: Replace with actual API call
      // const response = await mentorshipAPI.getMentorships();
      // dispatch({ type: 'FETCH_MENTORSHIPS_SUCCESS', payload: response });
      
      // Mock data for now
      const mockMentorships = [
        {
          _id: 'mentorship1',
          mentor: {
            _id: 'mentor1',
            name: 'Mistura Rokibat',
            expertise: 'Makeup Artistry',
            rating: 4.8,
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          },
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          sessions: [
            {
              _id: 'session1',
              date: new Date().toISOString(),
              duration: 60,
              notes: 'Introduction and goal setting',
            },
          ],
        },
      ];
      
      dispatch({ type: 'FETCH_MENTORSHIPS_SUCCESS', payload: mockMentorships });
    } catch (error) {
      dispatch({ type: 'FETCH_FAILURE', payload: error.message });
    }
  };

  // Fetch available mentors
  const fetchAvailableMentors = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      // TODO: Replace with actual API call
      // const response = await mentorshipAPI.getAvailableMentors();
      // dispatch({ type: 'FETCH_MENTORS_SUCCESS', payload: response });
      
      // Mock data for now
      const mockMentors = [
        {
          _id: 'mentor1',
          name: 'Mistura Rokibat',
          expertise: 'Makeup Artistry',
          rating: 4.8,
          experience: '5+ years',
          hourlyRate: 5000,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          bio: 'Professional makeup artist with expertise in bridal, editorial, and commercial makeup.',
          specialties: ['Bridal Makeup', 'Editorial', 'Commercial'],
          availability: ['Monday', 'Wednesday', 'Friday'],
        },
        {
          _id: 'mentor2',
          name: 'Muiz Abass',
          expertise: 'Barbering',
          rating: 4.9,
          experience: '8+ years',
          hourlyRate: 4000,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'Master barber specializing in modern cuts and traditional techniques.',
          specialties: ['Modern Cuts', 'Traditional Styles', 'Beard Grooming'],
          availability: ['Tuesday', 'Thursday', 'Saturday'],
        },
      ];
      
      dispatch({ type: 'FETCH_MENTORS_SUCCESS', payload: mockMentors });
    } catch (error) {
      dispatch({ type: 'FETCH_FAILURE', payload: error.message });
    }
  };

  // Request mentorship
  const requestMentorship = async (mentorId, requestData) => {
    dispatch({ type: 'FETCH_START' });
    try {
      // TODO: Replace with actual API call
      // const response = await mentorshipAPI.requestMentorship(mentorId, requestData);
      // dispatch({ type: 'REQUEST_MENTORSHIP', payload: response });
      
      // Mock response
      const mockMentorship = {
        _id: `mentorship${Date.now()}`,
        mentor: state.availableMentors.find(m => m._id === mentorId),
        status: 'pending',
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        sessions: [],
        requestData,
      };
      
      dispatch({ type: 'REQUEST_MENTORSHIP', payload: mockMentorship });
              showSuccess('🤝 Mentorship request sent successfully!');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'FETCH_FAILURE', payload: error.message });
              showError(error.message || 'Failed to request mentorship');
      return { success: false, error: error.message };
    }
  };

  // Update mentorship
  const updateMentorship = async (mentorshipId, updateData) => {
    dispatch({ type: 'FETCH_START' });
    try {
      // TODO: Replace with actual API call
      // const response = await mentorshipAPI.updateMentorship(mentorshipId, updateData);
      // dispatch({ type: 'UPDATE_MENTORSHIP', payload: response });
      
      // Mock response
      const updatedMentorship = {
        ...state.mentorships.find(m => m._id === mentorshipId),
        ...updateData,
      };
      
      dispatch({ type: 'UPDATE_MENTORSHIP', payload: updatedMentorship });
              showSuccess('✅ Mentorship updated successfully');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'FETCH_FAILURE', payload: error.message });
              showError(error.message || 'Failed to update mentorship');
      return { success: false, error: error.message };
    }
  };

  // Cancel mentorship
  const cancelMentorship = async (mentorshipId) => {
    dispatch({ type: 'FETCH_START' });
    try {
      // TODO: Replace with actual API call
      // await mentorshipAPI.cancelMentorship(mentorshipId);
      // dispatch({ type: 'DELETE_MENTORSHIP', payload: mentorshipId });
      
      dispatch({ type: 'DELETE_MENTORSHIP', payload: mentorshipId });
             showSuccess('❌ Mentorship cancelled successfully');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'FETCH_FAILURE', payload: error.message });
             showError(error.message || 'Failed to cancel mentorship');
      return { success: false, error: error.message };
    }
  };

  // Get mentorship by ID
  const getMentorshipById = (mentorshipId) => {
    return state.mentorships.find(m => m._id === mentorshipId);
  };

  // Get active mentorships
  const getActiveMentorships = () => {
    return state.mentorships.filter(m => m.status === 'active');
  };

  // Get pending mentorships
  const getPendingMentorships = () => {
    return state.mentorships.filter(m => m.status === 'pending');
  };

  useEffect(() => {
    if (user) {
      fetchMentorships();
      fetchAvailableMentors();
    }
  }, [user]);

  const value = {
    ...state,
    fetchMentorships,
    fetchAvailableMentors,
    requestMentorship,
    updateMentorship,
    cancelMentorship,
    getMentorshipById,
    getActiveMentorships,
    getPendingMentorships,
  };

  return (
    <MentorshipContext.Provider value={value}>
      {children}
    </MentorshipContext.Provider>
  );
};

export const useMentorship = () => {
  const context = useContext(MentorshipContext);
  if (!context) {
    throw new Error('useMentorship must be used within a MentorshipProvider');
  }
  return context;
};
