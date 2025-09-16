import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { handleAnchorClick } from '../utils/smoothScroll';
import { getThumbnailUrl, getPlaceholderImage } from '../utils/fileUtils';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaVideo, 
  FaShieldAlt, 
  FaCertificate, 
  FaCreditCard, 
  FaClock,
  FaStar,
  FaArrowRight,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaBookOpen,
  FaGlobe,
  FaCheckCircle,
  FaChartLine,
  FaAward,
  FaHeart
} from 'react-icons/fa';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const { isAuthenticated, user, logout } = useAuth();

  // Course categories with icons
  const categories = [
    { id: 'all', name: 'All Categories', icon: FaBookOpen, count: '500+' },
    { id: 'beauty', name: 'Beauty & Fashion', icon: FaHeart, count: '89' },
    { id: 'business', name: 'Business', icon: FaChartLine, count: '156' },
    { id: 'technology', name: 'Technology', icon: FaGlobe, count: '234' },
    { id: 'health', name: 'Health & Wellness', icon: FaCheckCircle, count: '78' },
    { id: 'arts', name: 'Arts & Design', icon: FaStar, count: '112' },
    { id: 'education', name: 'Education', icon: FaGraduationCap, count: '95' },
    { id: 'marketing', name: 'Marketing', icon: FaChartLine, count: '134' }
  ];

  // Statistics data
  const stats = [
    { number: '50,000+', label: 'Active Learners', icon: FaUsers },
    { number: '2,500+', label: 'Expert Tutors', icon: FaGraduationCap },
    { number: '500+', label: 'Courses Available', icon: FaBookOpen },
    { number: '98%', label: 'Success Rate', icon: FaAward }
  ];

  // Success stories
  const successStories = [
    {
      name: 'Mistura Rokibat',
      role: 'Makeup Artist',
      story: 'Started with basic skills, now running a successful beauty business with 50+ clients monthly.',
      before: 'Basic makeup knowledge',
      after: 'Professional makeup artist',
      earnings: '₦150,000/month',
      avatar: 'MR'
    },
    {
      name: 'Muiz Abass',
      role: 'Web Developer',
      story: 'Learned web development on SkillLift, now working remotely for international companies.',
      before: 'No coding experience',
      after: 'Full-stack developer',
      earnings: '₦300,000/month',
      avatar: 'MA'
    },
    {
      name: 'Ridwan Idris',
      role: 'Digital Marketer',
      story: 'Transformed from unemployed to running a digital marketing agency with 20+ clients.',
      before: 'Unemployed graduate',
      after: 'Marketing agency owner',
      earnings: '₦200,000/month',
      avatar: 'RI'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaGraduationCap className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                SkillLift
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={(e) => handleAnchorClick(e, 'about')} 
                className="text-slate-700 hover:text-primary-600 transition-colors font-medium"
              >
                About
              </button>
              <button 
                onClick={(e) => handleAnchorClick(e, 'features')} 
                className="text-slate-700 hover:text-primary-600 transition-colors font-medium"
              >
                Features
              </button>
              <button 
                onClick={(e) => handleAnchorClick(e, 'courses')} 
                className="text-slate-700 hover:text-primary-600 transition-colors font-medium"
              >
                Courses
              </button>
              <button 
                onClick={(e) => handleAnchorClick(e, 'success')} 
                className="text-slate-700 hover:text-primary-600 transition-colors font-medium"
              >
                Success Stories
              </button>
              
              {/* Auth-aware actions */}
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/role-selection?action=login"
                    className="text-slate-700 hover:text-primary-600 transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/role-selection?action=register"
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'tutor' ? '/tutor/dashboard' : '/learner/dashboard'}
                    className="text-slate-700 hover:text-primary-600 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="bg-secondary-500 text-white px-6 py-2 rounded-lg hover:bg-secondary-600 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-700 hover:text-primary-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200">
            <div className="px-4 py-2 space-y-1">
              <button 
                onClick={(e) => {
                  handleAnchorClick(e, 'about');
                  setIsMenuOpen(false);
                }} 
                className="block w-full text-left px-3 py-2 text-slate-700 hover:text-primary-600 transition-colors"
              >
                About
              </button>
              <button 
                onClick={(e) => {
                  handleAnchorClick(e, 'features');
                  setIsMenuOpen(false);
                }} 
                className="block w-full text-left px-3 py-2 text-slate-700 hover:text-primary-600 transition-colors"
              >
                Features
              </button>
              <button 
                onClick={(e) => {
                  handleAnchorClick(e, 'courses');
                  setIsMenuOpen(false);
                }} 
                className="block w-full text-left px-3 py-2 text-slate-700 hover:text-primary-600 transition-colors"
              >
                Courses
              </button>
              <button 
                onClick={(e) => {
                  handleAnchorClick(e, 'success');
                  setIsMenuOpen(false);
                }} 
                className="block w-full text-left px-3 py-2 text-slate-700 hover:text-primary-600 transition-colors"
              >
                Success Stories
              </button>
              <div className="border-t border-slate-200 pt-2 mt-2">
                {!isAuthenticated ? (
                  <>
                    <Link 
                      to="/role-selection?action=login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-slate-700 hover:text-primary-600 transition-colors"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/role-selection?action=register" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-slate-700 hover:text-primary-600 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'tutor' ? '/tutor/dashboard' : '/learner/dashboard'}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-slate-700 hover:text-primary-600 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => { setIsMenuOpen(false); logout(); }}
                      className="block w-full text-left px-3 py-2 text-white bg-secondary-500 rounded-lg hover:bg-secondary-600 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-slate-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Lift Your Skills to New Heights
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Connect with top tutors. Learn anytime, anywhere. Transform your life with in-demand skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg flex items-center justify-center"
                >
                  <FaGraduationCap className="mr-2" />
                  Start Learning Free
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-secondary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-secondary-600 transition-colors shadow-lg flex items-center justify-center"
                >
                  <FaUsers className="mr-2" />
                  Become a Tutor
                </motion.button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="w-96 h-96 bg-gradient-to-br from-lime/10 to-lime/20 rounded-2xl flex items-center justify-center shadow-xl">
                  <div className="text-center">
                    <FaGraduationCap className="text-6xl text-lime mx-auto mb-4" />
                    <p className="text-limeDark text-lg font-medium">New Learning Revolution</p>
                  </div>
                </div>
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-accent-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <FaStar className="text-white text-xl" />
                </motion.div>
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-success-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <FaCheckCircle className="text-white text-lg" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <stat.icon className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.number}</div>
                <div className="text-slate-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose SkillLift?
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to accelerate your learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FaVideo,
                title: "Live & Recorded Classes",
                description: "Access interactive live sessions and convenient replays anytime."
              },
              {
                icon: FaShieldAlt,
                title: "Verified Tutors",
                description: "Learn from qualified and certified expert instructors."
              },
              {
                icon: FaCertificate,
                title: "Certification on Completion",
                description: "Earn recognized certificates to boost your career."
              },
              {
                icon: FaUsers,
                title: "Membership & Community",
                description: "Connect with mentors and join learning communities."
              },
              {
                icon: FaCreditCard,
                title: "Flexible Payment Options",
                description: "Choose from multiple payment plans that suit your budget."
              },
              {
                icon: FaClock,
                title: "Learn at Your Pace",
                description: "Create a study schedule to fit your lifestyle and commitments."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Explore Course Categories
            </h2>
            <p className="text-xl text-slate-600">
              Find the perfect course to advance your career and skills.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'border-lime bg-primary-600/10 text-limeDark'
                    : 'border-neutral-200 hover:border-lime/30 hover:bg-neutral-50'
                }`}
              >
                <category.icon className="text-2xl mx-auto mb-3" />
                <div className="font-medium text-sm">{category.name}</div>
                <div className="text-xs text-neutral-500 mt-1">{category.count} courses</div>
              </motion.button>
            ))}
          </div>

          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg flex items-center mx-auto"
            >
              Browse All Courses
              <FaArrowRight className="ml-2" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="success" className="py-20 bg-gradient-to-br from-success-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-slate-600">
              See how SkillLift has transformed lives and careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    {story.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{story.name}</h4>
                    <p className="text-success-600 font-medium">{story.role}</p>
                  </div>
                </div>
                
                <p className="text-neutral-700 mb-6 italic">"{story.story}"</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Before:</span>
                    <span className="text-neutral-700 font-medium">{story.before}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">After:</span>
                    <span className="text-success-600 font-medium">{story.after}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Earnings:</span>
                    <span className="text-success-600 font-bold">{story.earnings}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-slate-600">
              Join Thousands of learners and tutors who trust SkillLift.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Learner",
                avatar: "SJ",
                quote: "SkillLift has transformed my learning experience. The tutors are amazing and the platform is so easy to use!",
                rating: 5
              },
              {
                name: "Mike Green",
                role: "Tutor",
                avatar: "MG",
                quote: "As a tutor, I love how SkillLift connects me with motivated learners. The platform is intuitive and professional.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                    <p className="text-slate-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-neutral-700 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 w-5 h-5" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-lime to-limeDark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Start Your Skill Journey Today!
            </h2>
            <p className="text-xl text-lime-100 mb-8">
              Join Thousands of learners and expert tutors on SkillLift.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-lime px-8 py-4 rounded-lg text-lg font-semibold hover:bg-neutral-100 transition-colors shadow-lg flex items-center justify-center"
              >
                <FaGraduationCap className="mr-2" />
                Start Learning
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-lime transition-colors shadow-lg flex items-center justify-center"
              >
                <FaUsers className="mr-2" />
                Become a Tutor
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FaGraduationCap className="text-white text-xl" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                  SkillLift
                </span>
              </div>
              <p className="text-slate-600 mb-4 max-w-md">
                Empowering learners and tutors to achieve their goals through innovative online education.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-neutral-400 hover:text-lime transition-colors">
                  <FaLinkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-neutral-400 hover:text-lime transition-colors">
                  <FaTwitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-neutral-400 hover:text-lime transition-colors">
                  <FaFacebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-600 hover:text-lime transition-colors">About</a></li>
                <li><a href="#" className="text-slate-600 hover:text-lime transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-600 hover:text-lime transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-600 hover:text-lime transition-colors">Partners</a></li>
                <li><a href="#" className="text-slate-600 hover:text-lime transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-600 hover:text-lime transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-600 hover:text-lime transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-slate-600 hover:text-lime transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-600 hover:text-lime transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-8 pt-8 text-center">
            <p className="text-slate-600">© 2024 SkillLift. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
