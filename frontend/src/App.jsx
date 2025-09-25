import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppContent from './components/AppContent';

const App = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white font-sans">
        <AppContent />
      </div>
    </Router>
  );
};

export default App;
