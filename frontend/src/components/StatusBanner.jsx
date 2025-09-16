import React from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const StatusBanner = () => {
  const { user } = useAuth();

  if (!user || user.accountStatus === 'approved') {
    return null;
  }

  const getStatusInfo = () => {
    switch (user.accountStatus) {
      case 'pending':
        return {
          icon: FaClock,
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          iconColor: 'text-yellow-500',
          title: 'Account Pending Approval',
          message: 'Your account is currently pending admin approval. Some features may be limited until approved.',
          features: user.role === 'tutor' 
            ? ['Cannot create courses', 'Cannot receive payments', 'Limited dashboard access']
            : ['Cannot enroll in courses', 'Cannot make payments', 'Limited course access']
        };
      case 'blocked':
        return {
          icon: FaTimesCircle,
          color: 'bg-red-50 border-red-200 text-red-800',
          iconColor: 'text-red-500',
          title: 'Account Blocked',
          message: 'Your account has been blocked. Please contact support for assistance.',
          features: ['All features disabled', 'Cannot access platform', 'Contact support required']
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  const IconComponent = statusInfo.icon;

  return (
    <div className={`border-l-4 ${statusInfo.color} p-4 mb-6`}>
      <div className="flex items-start">
        <IconComponent className={`h-5 w-5 ${statusInfo.iconColor} mt-0.5 mr-3 flex-shrink-0`} />
        <div className="flex-1">
          <h3 className="text-sm font-medium">{statusInfo.title}</h3>
          <p className="text-sm mt-1">{statusInfo.message}</p>
          
          {user.accountStatus === 'pending' && (
            <div className="mt-3">
              <p className="text-xs font-medium mb-2">Limited Features:</p>
              <ul className="text-xs space-y-1">
                {statusInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusBanner;
