import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaComments, 
  FaCircle,
  FaUserTie,
  FaPaperPlane,
  FaTimes,
  FaGraduationCap
} from 'react-icons/fa';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { 
  getTutorLearners,
  getConversations,
  createConversation,
  getOnlineUsers
} from '../../services/messageService';
import TutorStudentChat from '../../components/TutorStudentChat';

const TutorLearnerMessaging = () => {
  // Simple states - no complex filtering or tabs
  const [learners, setLearners] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleTypingChange = (typing) => {
    console.log('📱 TutorLearnerMessaging: Typing status changed:', typing);
    setIsTyping(typing);
  };

  useEffect(() => {
    loadLearners();
    loadConversations();
    loadOnlineUsers();
  }, []);

  const loadLearners = async () => {
    try {
      setLoading(true);
      const response = await getTutorLearners();
      if (response.success) {
        setLearners(response.data);
      }
    } catch (error) {
      console.error('Error loading learners:', error);
      showError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadOnlineUsers = async () => {
    try {
      const response = await getOnlineUsers();
      if (response.success) {
        setOnlineUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  };

  const startChat = async (learner) => {
    try {
      // Check if conversation already exists
      let conversation = conversations.find(conv => 
        conv.participants.some(p => p._id === learner._id)
      );

      if (!conversation) {
        // Create new conversation
        const response = await createConversation(learner._id);
        if (response.success) {
          conversation = response.data;
          setConversations(prev => [...prev, conversation]);
        }
      }

      setActiveChat({
        conversationId: conversation._id,
        otherUser: learner
      });
      setShowChatModal(true);
    } catch (error) {
      console.error('Error starting chat:', error);
      showError('Failed to start chat');
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(user => user._id === userId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Simple Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaComments className="text-blue-600 text-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Chat</h1>
                <p className="text-gray-600">Communicate with your students about courses and assignments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaGraduationCap className="mr-2 text-blue-600" />
              Your Students ({learners.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading students...</p>
            </div>
          ) : learners.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FaUserTie className="text-4xl mx-auto mb-3 text-gray-300" />
              <p>No students enrolled in your courses yet</p>
              <p className="text-sm mt-2">Students will appear here once they enroll in your courses</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {learners.map((learner) => (
                <motion.div
                  key={learner._id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => startChat(learner)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUserTie className="text-blue-600" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          isUserOnline(learner._id) ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          <FaCircle className="w-full h-full" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{learner.name}</h3>
                        <p className="text-sm text-gray-600">{learner.email}</p>
                        {learner.courses && learner.courses.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-blue-600">
                              Enrolled in: {learner.courses.map(course => course.title).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isUserOnline(learner._id) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isUserOnline(learner._id) ? 'Online' : 'Offline'}
                      </span>
                      <FaPaperPlane className="text-blue-600" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Modal */}
        {showChatModal && activeChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUserTie className="text-blue-600" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      isUserOnline(activeChat.otherUser._id) ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      <FaCircle className="w-full h-full" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{activeChat.otherUser.name}</h3>
                    <p className="text-sm text-gray-600">
                      {console.log('🔍 Status check - isTyping:', isTyping, 'isOnline:', isUserOnline(activeChat.otherUser._id))}
                      {isTyping ? (
                        <span className="flex items-center text-blue-600">
                          <div className="flex space-x-1 mr-2">
                            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          typing...
                        </span>
                      ) : (
                        isUserOnline(activeChat.otherUser._id) ? 'Online' : 'Offline'
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <TutorStudentChat
                  conversationId={activeChat.conversationId}
                  otherUser={activeChat.otherUser}
                  onClose={() => setShowChatModal(false)}
                  onTypingChange={handleTypingChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorLearnerMessaging;