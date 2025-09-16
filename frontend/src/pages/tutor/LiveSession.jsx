import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaVideo, 
  FaMicrophone, 
  FaHandPaper, 
  FaSignOutAlt, 
  FaUser, 
  FaClock, 
  FaComments, 
  FaQuestionCircle, 
  FaUsers, 
  FaSmile, 
  FaPaperPlane,
  FaGraduationCap,
  FaShare,
  FaDesktop,
  FaRecordVinyl,
  FaPause,
  FaStop,
  FaCog,
  FaBell,
  FaChartBar,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaCamera,
  FaVideoSlash,
  FaMobile,
  FaTimes,
  FaCheck,
  FaReply
} from 'react-icons/fa';

const TutorLiveSession = () => {
  const [activeTab, setActiveTab] = useState('participants');
  const [message, setMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    duration: '00:45:23',
    participants: 45,
    engagement: 87,
    questions: 12,
    reactions: 156
  });

  // Mock data
  const sessionData = {
    title: "Advanced React Development - Live Session",
    tutor: {
      name: "Muiz Abass",
      role: "Senior React Developer",
      avatar: "MA",
      rating: 4.9,
      students: 1200
    },
    startTime: "45 mins ago",
    participants: 45,
    maxParticipants: 50,
    topic: "React Hooks & Performance Optimization",
    level: "Advanced"
  };

  const participants = [
    { id: 1, name: "Muiz Abass", role: "Tutor", isOnline: true, isSpeaking: true, avatar: "MA", status: "presenting" },
    { id: 2, name: "Ridwan Idris", role: "Learner", isOnline: true, isSpeaking: false, avatar: "RI", status: "listening" },
    { id: 3, name: "Mistura Rokibat", role: "Learner", isOnline: true, isSpeaking: false, avatar: "MR", status: "listening" },
    { id: 4, name: "Rodiyat Kabir", role: "Learner", isOnline: false, isSpeaking: false, avatar: "RK", status: "away" },
    { id: 5, name: "Aisha Bello", role: "Learner", isOnline: true, isSpeaking: false, avatar: "AB", status: "listening" }
  ];

  const chatMessages = [
    {
      id: 1,
      name: "Ridwan Idris",
      time: "2:34 PM",
      message: "Great explanation about useCallback!",
      isTutor: false,
      avatar: "RI"
    },
    {
      id: 2,
      name: "Mistura Rokibat",
      time: "2:36 PM", 
      message: "Can you share the code example?",
      isTutor: false,
      avatar: "MR"
    },
    {
      id: 3,
      name: "Muiz Abass",
      time: "2:37 PM",
      message: "Yes, I'll share it in the chat now.",
      isTutor: true,
      avatar: "MA"
    }
  ];

  const questions = [
    {
      id: 1,
      name: "Aisha Bello",
      question: "How do we handle state management in large React apps?",
      time: "2:30 PM",
      answered: false,
      upvotes: 5,
      avatar: "AB"
    },
    {
      id: 2,
      name: "Ridwan Idris",
      question: "What's the difference between useMemo and useCallback?",
      time: "2:32 PM",
      answered: true,
      upvotes: 8,
      avatar: "RI"
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add message to chat
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'presenting': return 'bg-green-500';
      case 'listening': return 'bg-blue-500';
      case 'away': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'presenting': return 'Presenting';
      case 'listening': return 'Listening';
      case 'away': return 'Away';
      default: return 'Unknown';
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        {/* Left side - Logo and Session Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <FaGraduationCap className="text-white text-lg" />
            </motion.div>
            <span className="text-xl font-bold text-gray-900">SkillLift</span>
          </div>
          <div className="text-gray-400">•</div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {sessionData.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <FaClock className="text-blue-500" />
                <span>Started {sessionData.startTime}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FaUsers className="text-green-500" />
                <span>{sessionData.participants}/{sessionData.maxParticipants} participants</span>
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {sessionData.level}
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Session Stats and Controls */}
        <div className="flex items-center space-x-6">
          {/* Live Stats */}
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{sessionStats.duration}</div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{sessionStats.engagement}%</div>
              <div className="text-xs text-gray-500">Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{sessionStats.questions}</div>
              <div className="text-xs text-gray-500">Questions</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <FaCog className="text-lg" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <FaBell className="text-lg" />
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-600 transition-colors">
              <FaSignOutAlt className="text-sm" />
              <span>End Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Video Stream */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Enhanced Video Stream Area */}
          <div className="flex-1 flex items-center justify-center relative p-6">
            <div className="w-full h-full max-w-5xl bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-20 h-20 bg-blue-500 rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 bg-purple-500 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500 rounded-full"></div>
              </div>
              
              <motion.div 
                className="relative z-10 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <FaVideo className="text-white text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Live Video Stream</h2>
                <p className="text-gray-600 mb-4">HD Quality • 1080p • 60fps</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </span>
                  <span>•</span>
                  <span>45 participants watching</span>
                  <span>•</span>
                  <span>Low latency</span>
                </div>
              </motion.div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{sessionStats.reactions}</div>
                  <div className="text-xs text-gray-500">Reactions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{sessionStats.engagement}%</div>
                  <div className="text-xs text-gray-500">Engagement</div>
                </div>
              </div>
            </div>

            {/* Recording Indicator */}
            {isRecording && (
              <motion.div 
                className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <FaRecordVinyl className="text-sm" />
                <span className="text-sm font-medium">REC</span>
              </motion.div>
            )}
          </div>

          {/* Enhanced Bottom Controls */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mute Button */}
                <motion.button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMuted ? <FaVolumeMute className="text-xl" /> : <FaMicrophone className="text-xl" />}
                </motion.button>

                {/* Video Button */}
                <motion.button 
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                    !isVideoOn ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {!isVideoOn ? <FaVideoSlash className="text-xl" /> : <FaCamera className="text-xl" />}
                </motion.button>

                {/* Screen Share Button */}
                <motion.button 
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                    isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaDesktop className="text-xl" />
                </motion.button>

                {/* Recording Button */}
                <motion.button 
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                    isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaRecordVinyl className="text-xl" />
                </motion.button>
              </div>

              {/* Center Controls */}
              <div className="flex items-center space-x-4">
                <button className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg">
                  <FaShare className="text-lg" />
                </button>
                <button className="p-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors shadow-lg">
                  <FaChartBar className="text-lg" />
                </button>
                <button className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-lg">
                  <FaDownload className="text-lg" />
                </button>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {sessionData.participants} Participants
                </div>
                <button className="p-3 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors">
                  <FaExpand className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Enhanced Chat/Q&A/Participants */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Enhanced Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[
              { id: 'participants', label: 'Participants', icon: FaUsers, count: participants.length },
              { id: 'chat', label: 'Chat', icon: FaComments, count: chatMessages.length },
              { id: 'questions', label: 'Q&A', icon: FaQuestionCircle, count: questions.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-3 flex flex-col items-center space-y-1 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="text-lg" />
                <span className="text-xs font-medium">{tab.label}</span>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'participants' && (
              <div className="p-4 space-y-3">
                {participants.map((participant) => (
                  <motion.div 
                    key={participant.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {participant.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(participant.status)} rounded-full border-2 border-white`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{participant.name}</h4>
                        {participant.isSpeaking && (
                          <motion.div 
                            className="w-2 h-2 bg-green-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          participant.role === 'Tutor' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {participant.role}
                        </span>
                        <span className="text-gray-500">{getStatusText(participant.status)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {participant.role === 'Learner' && (
                        <>
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <FaEye className="text-sm" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                            <FaMicrophone className="text-sm" />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {chatMessages.map((msg) => (
                    <motion.div 
                      key={msg.id}
                      className={`flex space-x-3 ${msg.isTutor ? 'flex-row-reverse space-x-reverse' : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {msg.avatar}
                      </div>
                      <div className={`max-w-xs ${msg.isTutor ? 'text-right' : ''}`}>
                        <div className={`inline-block p-3 rounded-2xl ${
                          msg.isTutor 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${msg.isTutor ? 'text-right' : ''}`}>
                          {msg.time}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <motion.button
                      onClick={handleSendMessage}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaPaperPlane className="text-sm" />
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="p-4 space-y-4">
                {questions.map((q) => (
                  <motion.div 
                    key={q.id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {q.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{q.name}</h4>
                          <span className="text-xs text-gray-500">{q.time}</span>
                          {q.answered && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Answered
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3">{q.question}</p>
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                            <FaThumbsUp className="text-sm" />
                            <span className="text-sm">{q.upvotes}</span>
                          </button>
                          <button className="text-gray-500 hover:text-green-600 transition-colors">
                            <FaCheck className="text-sm" />
                          </button>
                          <button className="text-gray-500 hover:text-purple-600 transition-colors">
                            <FaReply className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorLiveSession;
