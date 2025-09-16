import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaPlay, 
  FaPause, 
  FaStop,
  FaUsers,
  FaClock,
  FaCalendarAlt,
  FaVideo,
  FaMicrophone,
  FaComments,
  FaShare,
  FaEye,
  FaSave,
  FaTimes,
  FaLink,
  FaCopy,
  FaUpload,
  FaSpinner,
  FaCheckCircle
} from 'react-icons/fa';
import { 
  getTutorLiveClasses,
  createLiveClass,
  updateLiveClass,
  deleteLiveClass
} from '../../services/liveClassService';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { getThumbnailUrl, getPlaceholderImage } from '../../utils/fileUtils';

const LiveClasses = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedClass, setSelectedClass] = useState(null);
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter classes by status
  const upcomingClasses = liveClasses.filter(cls => cls.status === 'scheduled' || cls.status === 'upcoming');
  const ongoingClasses = liveClasses.filter(cls => cls.status === 'ongoing' || cls.status === 'live');
  const completedClasses = liveClasses.filter(cls => cls.status === 'completed' || cls.status === 'ended');

  // Load live classes data
  useEffect(() => {
    loadLiveClasses();
  }, []);

  const loadLiveClasses = async () => {
    try {
      setLoading(true);
      const response = await getTutorLiveClasses();
      if (response.success) {
        setLiveClasses(response.data || []);
      } else {
        showError('Failed to load live classes');
      }
    } catch (error) {
      console.error('Error loading live classes:', error);
      showError('Error loading live classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const classForm = {
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    duration: '',
    maxStudents: '',
    price: '',
    thumbnail: null
  };

  const ClassCard = ({ classData, showActions = true }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="relative">
        <img 
          src={getThumbnailUrl(classData.course?.thumbnail) || getPlaceholderImage(classData.course?.category) || '/images/default-course.jpg'} 
          alt={classData.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = '/images/default-course.jpg';
          }}
        />
        <div className="absolute top-3 right-3 flex space-x-2">
          {classData.status === 'live' && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              LIVE
            </div>
          )}
          {showActions && (
            <>
              <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                <FaEye className="text-gray-600" />
              </button>
              <button 
                onClick={() => console.log('Edit class:', classData)}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
              >
                <FaEdit className="text-gray-600" />
              </button>
              <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                <FaTrash className="text-gray-600" />
              </button>
            </>
          )}
        </div>
        <div className="absolute bottom-3 left-3 bg-primary-500 text-white px-3 py-1 rounded-full font-bold text-sm">
          {classData.course?.category || classData.category}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{classData.title}</h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{classData.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-slate-500">
          <div className="flex items-center space-x-1">
            <FaCalendarAlt className="text-primary-500" />
            <span>{new Date(classData.scheduledDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaClock className="text-primary-500" />
            <span>{classData.duration} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaUsers className="text-primary-500" />
            <span>{classData.attendees?.length || 0}/{classData.maxParticipants}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaVideo className="text-primary-500" />
            <span>{classData.status}</span>
          </div>
        </div>
        
        {/* Additional class info */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full font-medium">
              {classData.level}
            </span>
            {classData.price && (
              <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full font-medium">
                ${classData.price}
              </span>
            )}
          </div>
          {classData.instructor && (
            <span className="text-slate-600 font-medium">
              {classData.instructor}
            </span>
          )}
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            {classData.status === 'scheduled' && (
              <Link
                to={`/tutor/live-classes/${classData._id}/room`}
                className="flex-1 bg-primary-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
              >
                <FaPlay />
                <span>Start Class</span>
              </Link>
            )}
            {classData.status === 'live' && (
              <button className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center space-x-2">
                <FaStop />
                <span>End Class</span>
              </button>
            )}
                         {classData.status === 'completed' && (
               <div className="flex-1 space-y-2">
                 <button className="w-full bg-primary-500 text-white font-bold py-2 px-4 rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2">
                   <FaVideo />
                   <span>View Recording</span>
                 </button>
                 {classData.attendance && (
                   <div className="text-center text-xs text-slate-500">
                     Attendance: {classData.attendance}/{classData.enrolledStudents}
                   </div>
                 )}
               </div>
             )}
            <button className="px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">
              <FaEdit />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  const LiveClassRoom = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{selectedClass?.title}</h3>
          <button
            onClick={() => setSelectedClass(null)}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <FaTimes className="text-white" />
          </button>
        </div>
        
        <div className="flex h-96">
          {/* Main Video Area */}
          <div className="flex-1 bg-slate-800 flex items-center justify-center">
            <div className="text-center text-white">
              <FaVideo className="mx-auto h-16 w-16 text-slate-600 mb-4" />
              <p className="text-lg">Video feed will appear here</p>
              <p className="text-sm text-slate-400">Camera and microphone access required</p>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-80 bg-slate-100 p-4 space-y-4">
            {/* Controls */}
            <div className="space-y-2">
              <button className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2">
                <FaStop />
                <span>End Class</span>
              </button>
              <button className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2">
                <FaVideo />
                <span>Record</span>
              </button>
              <button className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2">
                <FaShare />
                <span>Share Screen</span>
              </button>
              <button className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2">
                <FaMicrophone />
                <span>Mute All</span>
              </button>
            </div>
            
            {/* Class Info */}
            <div className="bg-white rounded-lg p-3">
              <h4 className="font-semibold text-slate-900 mb-2">Class Info</h4>
              <div className="space-y-1 text-sm text-slate-600">
                <div>Duration: {selectedClass?.duration}</div>
                <div>Students: {selectedClass?.attendees?.length || 0}/{selectedClass?.maxParticipants}</div>
                <div>Category: {selectedClass?.category}</div>
                <div>Level: {selectedClass?.level}</div>
              </div>
            </div>
            
            {/* Participants */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Participants ({selectedClass?.attendees?.length || 0})</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Array.from({ length: Number(selectedClass?.attendees?.length) || 0 }, (_, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-white rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-slate-700">Student {i + 1}</span>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-1 bg-primary-100 text-primary-600 rounded hover:bg-primary-200">
                        <FaMicrophone className="text-xs" />
                      </button>
                      <button className="p-1 bg-primary-100 text-primary-600 rounded hover:bg-primary-200">
                        <FaVideo className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Chat */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Chat</h4>
              <div className="bg-white border border-slate-300 rounded-lg p-2 h-32 overflow-y-auto">
                <div className="text-xs text-slate-500 text-center">Chat messages will appear here</div>
              </div>
              <div className="flex space-x-2 mt-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button className="bg-primary-500 text-white px-3 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                  <FaComments className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Live Class Management</h1>
              <p className="text-slate-600 mt-1">Schedule, host, and manage your live classes</p>
            </div>
            <Link
              to="/tutor/live-classes/create"
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-3 px-6 rounded-xl hover:from-primary-400 hover:to-primary-500 transition-all duration-200 flex items-center space-x-2"
            >
              <FaPlus />
              <span>Create Class</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8">
          {['upcoming', 'ongoing', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Classes
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'upcoming' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Upcoming Classes</h2>
            {upcomingClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingClasses.map((classData) => (
                  <ClassCard key={classData._id || classData.id} classData={classData} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaVideo className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Upcoming Classes</h3>
                <p className="text-gray-500 mb-6">Create your first live class to get started</p>
                <Link
                  to="/tutor/live-classes/create"
                  className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Create Class
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ongoing' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Ongoing Classes</h2>
            {ongoingClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingClasses.map((classData) => (
                  <ClassCard key={classData._id || classData.id} classData={classData} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaPlay className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Ongoing Classes</h3>
                <p className="text-gray-500">No classes are currently live</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Completed Classes</h2>
            {completedClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedClasses.map((classData) => (
                  <ClassCard key={classData._id || classData.id} classData={classData} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaCheckCircle className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Completed Classes</h3>
                <p className="text-gray-500">Completed classes will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Class Room */}
      {selectedClass && <LiveClassRoom />}
    </div>
  );
};

export default LiveClasses;
