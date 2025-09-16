import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebug = () => {
  const { user, isAuthenticated, isInitialized, token } = useAuth();
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h4>Auth Debug</h4>
      <p>Initialized: {isInitialized ? '✅' : '❌'}</p>
      <p>Authenticated: {isAuthenticated ? '✅' : '❌'}</p>
      <p>User: {user ? user.name : 'None'}</p>
      <p>Token: {token ? 'Present' : 'None'}</p>
    </div>
  );
};

export default AuthDebug;
