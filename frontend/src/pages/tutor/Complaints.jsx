import React from 'react';
import ComplaintsManagement from '../../components/ComplaintsManagement';

const TutorComplaintsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ComplaintsManagement userRole="tutor" />
      </div>
    </div>
  );
};

export default TutorComplaintsPage;
