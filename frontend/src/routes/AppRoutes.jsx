import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import NotFound from '../pages/Notfound';
import TestPage from '../pages/TestPage';
import RoleSelection from '../pages/auth/RoleSelection';

// Layouts
import TutorLayout from '../layouts/TutorLayout';
import LearnerLayout from '../layouts/LearnerLayout';
import AdminLayout from '../layouts/AdminLayout';

// Learner Pages
import LearnerDashboard from '../pages/learner/Dashboard';
import LearnerCourses from '../pages/learner/Courses';
import LearnerCourseDetail from '../pages/learner/CourseDetail';
import LearnerLiveClasses from '../pages/learner/LiveClasses';
import LearnerLiveClassRoom from '../pages/learner/LearnerLiveClassRoom';
import BrowseLiveSessions from '../pages/learner/BrowseLiveSessions';
import LearnerLiveSession from '../pages/learner/LiveSession';
import LearnerAssignments from '../pages/learner/Assignments';
import AssignmentSubmission from '../pages/learner/AssignmentSubmission';
import LearnerReplays from '../pages/learner/Replays';
import LearnerRatings from '../pages/learner/Ratings';
import RateCourses from '../pages/learner/RateCourses';
import LearnerMentors from '../pages/learner/Mentorship';
import LearnerPayments from '../pages/learner/Payments';
import LearnerNotifications from '../pages/learner/Notifications';
import LearnerTutorMessaging from '../pages/learner/LearnerTutorMessaging';
import TutorFeedback from '../pages/learner/TutorFeedback';
import LearnerProfile from '../pages/learner/Profile';
import LearnerSettings from '../pages/learner/Settings';
import LearnerComplaints from '../pages/learner/Complaints';
import LiveSessionPage from '../pages/learner/LiveSessionPage';
import PaymentVerification from '../pages/PaymentVerification';
import DashboardDebug from '../pages/DashboardDebug';
import DashboardTest from '../pages/DashboardTest';

// Tutor Pages
import TutorDashboard from '../pages/tutor/Dashboard';
import TutorCourses from '../pages/tutor/Courses';
import TutorLearners from '../pages/tutor/Learners';
import TutorLiveClasses from '../pages/tutor/LiveClasses';
import LiveClassRoom from '../pages/tutor/LiveClassRoom';
import TutorAssignments from '../pages/tutor/Assignments';
import TutorPayments from '../pages/tutor/Payments';
import TutorReplays from '../pages/tutor/Replays';
import TutorLearnerMessaging from '../pages/tutor/TutorLearnerMessaging';
import TutorAdminMessaging from '../pages/tutor/TutorAdminMessaging';
import TutorNotifications from '../pages/tutor/Notifications';
import TutorProfile from '../pages/tutor/Profile';
import TutorSettings from '../pages/tutor/Settings';
import TutorComplaints from '../pages/tutor/Complaints';
import KYCSubmission from '../pages/tutor/KYCSubmission';

// Tutor Creation Pages
import CreateCourse from '../pages/tutor/CreateCourse';
import CreateAssignment from '../pages/tutor/CreateAssignment';
import CreateLiveClass from '../pages/tutor/CreateLiveClass';
import ViewCourse from '../pages/tutor/ViewCourse';
import EditCourse from '../pages/tutor/EditCourse';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminRatings from '../pages/admin/Ratings';
import AdminTutorMessaging from '../pages/admin/AdminTutorMessaging';
import AdminSettings from '../pages/admin/Settings';
import AdminPaymentDashboard from '../pages/admin/AdminPaymentDashboard';
import KYCManagement from '../pages/admin/KYCManagement';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import EmailVerification from '../pages/auth/EmailVerification';

// Protected Route Component
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/email-verification" element={<EmailVerification />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/payment/verify" element={<PaymentVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/test" element={<TestPage />} />

      {/* Test admin route for debugging */}
      <Route path="/admin-test" element={<AdminDashboard />} />

      {/* Protected Learner Routes */}
      <Route
        path="/learner/*"
        element={
          <ProtectedRoute allowedRoles={['learner']}>
            <LearnerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<LearnerDashboard />} />
        <Route path="courses" element={<LearnerCourses />} />
        <Route path="courses/:courseId" element={<LearnerCourseDetail />} />
        <Route path="live-classes" element={<LearnerLiveClasses />} />
        <Route path="live-classes/:classId/room" element={<LearnerLiveClassRoom />} />
        <Route path="live-sessions" element={<BrowseLiveSessions />} />
        <Route path="live-sessions/:sessionId" element={<LearnerLiveSession />} />
        <Route path="live-session/:sessionId" element={<LiveSessionPage />} />
        <Route path="assignments" element={<LearnerAssignments />} />
        <Route path="assignments/:assignmentId" element={<AssignmentSubmission />} />
        <Route path="replays" element={<LearnerReplays />} />
        <Route path="ratings" element={<LearnerRatings />} />
        <Route path="rate-courses" element={<RateCourses />} />
        <Route path="mentors" element={<LearnerMentors />} />
        <Route path="payments" element={<LearnerPayments />} />
        <Route path="notifications" element={<LearnerNotifications />} />
        <Route path="messages" element={<LearnerTutorMessaging />} />
        <Route path="complaints" element={<LearnerComplaints />} />
        <Route path="tutor-feedback" element={<TutorFeedback />} />
        <Route path="profile" element={<LearnerProfile />} />
        <Route path="settings" element={<LearnerSettings />} />
      </Route>

      {/* Protected Tutor Routes */}
      <Route
        path="/tutor/*"
        element={
          <ProtectedRoute allowedRoles={['tutor']}>
            <TutorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<TutorDashboard />} />
        <Route path="kyc-submission" element={<KYCSubmission />} />
        <Route path="courses" element={<TutorCourses />} />
        <Route path="courses/create" element={<CreateCourse />} />
        <Route path="courses/:courseId" element={<ViewCourse />} />
        <Route path="courses/:courseId/edit" element={<EditCourse />} />
        <Route path="learners" element={<TutorLearners />} />
        <Route path="live-classes" element={<TutorLiveClasses />} />
        <Route path="live-classes/:classId/room" element={<LiveClassRoom />} />
        <Route path="live-classes/create" element={<CreateLiveClass />} />
        <Route path="assignments" element={<TutorAssignments />} />
        <Route path="assignments/create" element={<CreateAssignment />} />
        <Route path="payments" element={<TutorPayments />} />
        <Route path="replays" element={<TutorReplays />} />
        <Route path="messages" element={<TutorLearnerMessaging />} />
        <Route path="student-messages" element={<TutorLearnerMessaging />} />
        <Route path="admin-messages" element={<TutorAdminMessaging />} />
        <Route path="notifications" element={<TutorNotifications />} />
        <Route path="complaints" element={<TutorComplaints />} />
        <Route path="profile" element={<TutorProfile />} />
        <Route path="settings" element={<TutorSettings />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="kyc" element={<KYCManagement />} />
        <Route path="ratings" element={<AdminRatings />} />
        <Route path="tutor-messages" element={<AdminTutorMessaging />} />
        <Route path="payments" element={<AdminPaymentDashboard />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Debug Route */}
      <Route path="/debug" element={<DashboardDebug />} />
      
      {/* Dashboard Test Route */}
      <Route path="/dashboard-test" element={<DashboardTest />} />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
