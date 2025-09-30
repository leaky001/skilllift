import React from 'react';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { PaymentProvider } from '../context/PaymentContext';
import { EmailVerificationProvider } from '../context/EmailVerificationContext';
import AppRoutes from '../routes/AppRoutes';
import LiveClassNotification from './liveclass/LiveClassNotification';
import 'react-toastify/dist/ReactToastify.css';

const AppContent = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <PaymentProvider>
          <EmailVerificationProvider>
              <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
                <AppRoutes />
                <LiveClassNotification />
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                  toastClassName="bg-white border border-green-200 shadow-lg"
                  progressClassName="bg-green-500"
                />
              </div>
          </EmailVerificationProvider>
        </PaymentProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default AppContent;
