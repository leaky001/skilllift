import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppContent from './components/AppContent';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white font-sans">
        <AppContent />
      </div>
    </Router>
  );
};

export default App;
