// Simple Replay Service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const replayService = {
  // Upload replay for tutors
  async uploadReplay(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/replays/upload`, {
        method: 'POST',
        body: formData, // FormData with file
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to upload replay');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading replay:', error);
      throw error;
    }
  },

  // Get replays for tutors
  async getTutorReplays() {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/replays`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch replays');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching replays:', error);
      throw error;
    }
  },

  // Get replays for learners
  async getLearnerReplays() {
    try {
      const response = await fetch(`${API_BASE_URL}/learner/replays`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch replays');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching replays:', error);
      throw error;
    }
  },

  // Get replay details
  async getReplayDetails(replayId) {
    try {
      const response = await fetch(`${API_BASE_URL}/learner/replays/${replayId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch replay details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching replay details:', error);
      throw error;
    }
  }
};

export default replayService;
