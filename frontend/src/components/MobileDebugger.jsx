import React, { useState, useEffect } from 'react';
import { config } from '../config/environment';

const MobileDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      screenSize: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      touchSupport: 'ontouchstart' in window,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      language: navigator.language,
      apiUrl: config.apiUrl,
      originalEnvUrl: import.meta.env.VITE_API_URL
    };
    setDebugInfo(info);
  }, []);

  const testRegistration = async () => {
    const testData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      phone: '+1234567890',
      password: 'testpass123',
      role: 'learner'
    };

    console.log('🧪 Testing registration with:', testData);

    try {
      const response = await fetch(`${debugInfo.apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      console.log('🧪 Registration test result:', result);
      
      if (response.ok) {
        alert('✅ Registration test successful!');
      } else {
        alert(`❌ Registration test failed: ${result.message}`);
      }
    } catch (error) {
      console.error('🧪 Registration test error:', error);
      alert(`❌ Registration test error: ${error.message}`);
    }
  };

  const testLogin = async () => {
    const testData = {
      email: 'test@example.com',
      password: 'testpass123',
      role: 'learner'
    };

    console.log('🧪 Testing login with:', testData);

    try {
      const response = await fetch(`${debugInfo.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      console.log('🧪 Login test result:', result);
      
      if (response.ok) {
        alert('✅ Login test successful!');
      } else {
        alert(`❌ Login test failed: ${result.message}`);
      }
    } catch (error) {
      console.error('🧪 Login test error:', error);
      alert(`❌ Login test error: ${error.message}`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>📱 Mobile Debug Info</h4>
      <div style={{ marginBottom: '10px' }}>
        <strong>Mobile:</strong> {debugInfo.isMobile ? 'Yes' : 'No'}<br/>
        <strong>Touch:</strong> {debugInfo.touchSupport ? 'Yes' : 'No'}<br/>
        <strong>Online:</strong> {debugInfo.onLine ? 'Yes' : 'No'}<br/>
        <strong>API URL:</strong> {debugInfo.apiUrl}<br/>
        <strong>Screen:</strong> {debugInfo.screenSize?.width}x{debugInfo.screenSize?.height}<br/>
        <strong>Viewport:</strong> {debugInfo.viewport?.width}x{debugInfo.viewport?.height}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={testRegistration} style={{ marginRight: '5px', fontSize: '10px' }}>
          Test Registration
        </button>
        <button onClick={testLogin} style={{ fontSize: '10px' }}>
          Test Login
        </button>
      </div>
      
      <details>
        <summary>Full Debug Info</summary>
        <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '200px' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default MobileDebugger;
