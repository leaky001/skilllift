import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TutorLiveClassDashboard from './TutorLiveClassDashboard';
import LearnerLiveClassDashboard from './LearnerLiveClassDashboard';

const GoogleMeetLiveClass = () => {
  const { courseId } = useParams();
  const { user, getToken } = useAuth();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🎯 GoogleMeetLiveClass mounted with courseId:', courseId);
    console.log('🎯 User:', user);
    console.log('🎯 AuthContext getToken function:', typeof getToken);
    
    if (!courseId) {
      console.error('❌ No courseId provided in URL params');
      setIsLoading(false);
      return;
    }
    
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      console.log('🔍 Fetching course details for courseId:', courseId);
      
      const token = getToken();
      console.log('🔑 Token from AuthContext:', token ? `${token.substring(0, 50)}...` : 'null');
      
      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 Course API response status:', response.status);
      console.log('📡 Course API response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Course data received:', data);
        setCourse(data.data); // Backend returns { success: true, data: course }
      } else {
        console.error('❌ Course API error:', response.status, response.statusText);
        
        // Try to get error message
        let errorMessage = `Course not found (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.warn('Could not parse error response as JSON');
        }
        
        console.error('❌ Course fetch failed:', errorMessage);
        setCourse(null);
      }
    } catch (error) {
      console.error('❌ Error fetching course details:', error);
      setCourse(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading live class...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
          <p className="text-gray-600">The requested course could not be found.</p>
        </div>
      </div>
    );
  }

  // Check if user is enrolled (learner) or owns the course (tutor)
  const currentUserId = (user?._id || user?.id || '').toString();
  const courseTutorId = (course?.tutor?._id || course?.tutor || course?.tutorId || '').toString();
  const enrolledArray = course?.enrolledStudents || course?.enrolledLearners || [];
  const enrolledIds = Array.isArray(enrolledArray)
    ? enrolledArray.map((e) => (typeof e === 'object' && e !== null ? (e._id || e.id || e).toString() : e?.toString?.() || ''))
    : [];
  const isEnrolled = enrolledIds.includes(currentUserId);
  const isOwner = courseTutorId === currentUserId;

  if (!isEnrolled && !isOwner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You are not enrolled in this course.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-1">Live Class & Replay Sessions</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.role === 'tutor' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.role === 'tutor' ? 'Tutor' : 'Learner'}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {user.role === 'tutor' && isOwner ? (
          <TutorLiveClassDashboard 
            courseId={courseId} 
            courseTitle={course.title}
          />
        ) : (
          <LearnerLiveClassDashboard 
            courseId={courseId} 
            courseTitle={course.title}
          />
        )}
      </div>
    </div>
  );
};

export default GoogleMeetLiveClass;
