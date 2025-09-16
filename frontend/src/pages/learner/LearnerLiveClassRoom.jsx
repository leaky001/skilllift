import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleLiveClassRoom from './SimpleLiveClassRoom';
import { useAuth } from '../../context/AuthContext';

const LearnerLiveClassRoom = () => {
  const { classId } = useParams();
  const { isAuthenticated, isInitialized } = useAuth();

  // Use the simple version for now to test basic functionality
  return <SimpleLiveClassRoom />;
};

export default LearnerLiveClassRoom;