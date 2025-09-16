import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaArrowRight, 
  FaShieldAlt,
  FaBookOpen,
  FaChalkboardTeacher,
  FaStar,
  FaCheckCircle
} from 'react-icons/fa';

const RoleSelection = () => {
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action') || 'login';

  const roles = [
    {
      id: 'learner',
      title: 'Learner',
      icon: FaGraduationCap,
      description: 'I want to learn new skills and advance my career',
      features: [
        'Access to 500+ courses',
        'Learn at your own pace',
        'Get certificates upon completion',
        'Join live sessions with experts'
      ],
      color: 'primary',
      gradient: 'from-primary-500 to-primary-600'
    },
    {
      id: 'tutor',
      title: 'Tutor',
      icon: FaUsers,
      description: 'I want to share my expertise and earn by teaching',
      features: [
        'Create and sell your courses',
        'Earn from course sales',
        'Conduct live sessions',
        'Manage student assignments'
      ],
      color: 'secondary',
      gradient: 'from-secondary-500 to-secondary-600'
    }
  ];

  const getActionUrl = (role) => {
    return action === 'login' ? `/login?role=${role}` : `/register?role=${role}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <FaGraduationCap className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                SkillLift
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="text-neutral-600 font-medium">
                {action === 'login' ? 'Sign In' : 'Create Account'}
              </span>
              <Link 
                to={action === 'login' ? '/role-selection?action=register' : '/role-selection?action=login'}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {action === 'login' ? 'Need an account?' : 'Already have an account?'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4"
          >
            {action === 'login' ? 'Welcome Back!' : 'Join SkillLift Today'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-neutral-600 max-w-2xl mx-auto"
          >
            {action === 'login' 
              ? 'Choose how you want to access your account'
              : 'Choose how you want to start your learning journey'
            }
          </motion.p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-primary-200 transition-all duration-300 hover:shadow-xl">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 p-8 rounded-t-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${role.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="text-white text-2xl" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">{role.title}</h3>
                    <p className="text-neutral-600">{role.description}</p>
                  </div>

                  {/* Features */}
                  <div className="p-8">
                    <h4 className="font-semibold text-neutral-900 mb-4 flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      What you'll get:
                    </h4>
                    <ul className="space-y-3 mb-8">
                      {role.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <FaStar className="text-yellow-400 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-neutral-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <Link
                      to={getActionUrl(role.id)}
                      className={`w-full bg-gradient-to-r ${role.gradient} text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group`}
                    >
                      {action === 'login' ? 'Sign In' : 'Get Started'} as {role.title}
                      <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Admin Access Note */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 p-6 bg-neutral-50 rounded-xl max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center mb-2">
            <FaShieldAlt className="text-neutral-400 mr-2" />
            <span className="text-sm font-medium text-neutral-600">Administrator Access</span>
          </div>
          <p className="text-sm text-neutral-500 mb-3">
            Need admin access? Contact your system administrator or use the direct admin portal.
          </p>
          <Link 
            to="/admin/login" 
            className="text-xs text-neutral-400 hover:text-primary-600 transition-colors"
          >
            Direct Admin Portal →
          </Link>
        </motion.div>

        {/* Back to Home */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <Link 
            to="/" 
            className="text-neutral-600 hover:text-primary-600 transition-colors font-medium"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelection;
