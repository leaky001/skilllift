import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUpload, 
  FaVideo, 
  FaBell, 
  FaPlay,
  FaArrowRight,
  FaCheckCircle,
  FaUsers,
  FaBookOpen
} from 'react-icons/fa';

const ReplaySystemDemo = () => {
  const features = [
    {
      icon: FaUpload,
      title: 'Simple Upload',
      description: 'Tutors just select course, write topic, and upload video',
      color: 'primary'
    },
    {
      icon: FaBell,
      title: 'Auto Notifications',
      description: 'Enrolled students get notified instantly when replay is uploaded',
      color: 'secondary'
    },
    {
      icon: FaPlay,
      title: 'Easy Access',
      description: 'Students can watch replays anytime from their dashboard',
      color: 'accent'
    },
    {
      icon: FaUsers,
      title: 'Course Tracking',
      description: 'System tracks which students are enrolled in each course',
      color: 'error'
    }
  ];

  const steps = [
    {
      step: 1,
      title: 'Tutor Uploads Replay',
      description: 'After live class, tutor goes to upload page, selects course, writes topic, uploads video',
      icon: FaUpload,
      color: 'primary'
    },
    {
      step: 2,
      title: 'System Notifies Students',
      description: 'All students enrolled in that course get notification about new replay',
      icon: FaBell,
      color: 'secondary'
    },
    {
      step: 3,
      title: 'Students Watch Replay',
      description: 'Students can access replays from their dashboard and watch anytime',
      icon: FaPlay,
      color: 'accent'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Simple Class Replay System
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            A streamlined solution for tutors to share live class recordings with enrolled students. 
            No complex fields, just course selection, topic, and video upload.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                feature.color === 'primary' ? 'bg-primary-100' :
                feature.color === 'secondary' ? 'bg-secondary-100' :
                feature.color === 'accent' ? 'bg-accent-100' :
                'bg-error-100'
              }`}>
                <feature.icon className={`text-2xl ${
                  feature.color === 'primary' ? 'text-primary-600' :
                  feature.color === 'secondary' ? 'text-secondary-600' :
                  feature.color === 'accent' ? 'text-accent-600' :
                  'text-error-600'
                }`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            How It Works
          </h2>
          
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex items-center space-x-6"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                  step.color === 'primary' ? 'bg-primary-600' :
                  step.color === 'secondary' ? 'bg-secondary-500' :
                  'bg-accent-500'
                }`}>
                  {step.step}
                </div>
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  step.color === 'primary' ? 'bg-primary-100' :
                  step.color === 'secondary' ? 'bg-secondary-100' :
                  'bg-accent-100'
                }`}>
                  <step.icon className={`text-2xl ${
                    step.color === 'primary' ? 'text-primary-600' :
                    step.color === 'secondary' ? 'text-secondary-600' :
                    'text-accent-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600">
                    {step.description}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <FaArrowRight className="text-slate-300 text-xl" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Demo Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tutor Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUpload className="text-2xl text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                For Tutors
              </h3>
              <p className="text-slate-600 mb-6">
                Upload replays with just 3 simple steps: select course, write topic, upload video.
              </p>
              <Link
                to="/tutor/simple-replay-upload"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Upload Demo
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </motion.div>

          {/* Student Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPlay className="text-2xl text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                For Students
              </h3>
              <p className="text-slate-600 mb-6">
                Get notified when new replays are available and watch them anytime.
              </p>
              <Link
                to="/learner/replays"
                className="inline-flex items-center px-6 py-3 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
              >
                View Replays Demo
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Benefits */}
        <div className="mt-16 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Key Benefits
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <FaCheckCircle className="text-3xl text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Minimal Fields</h3>
              <p className="text-slate-600 text-sm">Only course, topic, and video file required</p>
            </div>
            
            <div className="text-center">
              <FaUsers className="text-3xl text-secondary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Auto Notifications</h3>
              <p className="text-slate-600 text-sm">Students get notified automatically</p>
            </div>
            
            <div className="text-center">
              <FaBookOpen className="text-3xl text-accent-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Course Tracking</h3>
              <p className="text-slate-600 text-sm">System knows which students are enrolled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplaySystemDemo;
