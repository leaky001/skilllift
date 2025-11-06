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
  getLearnerTutors,
  getConversations,
  createConversation,
  getOnlineUsers
} from '../../services/messageService';
import LearnerTutorChat from '../../components/LearnerTutorChat';

const LearnerTutorMessaging = () => {
  // Simple states - no complex filtering or tabs
  const [tutors, setTutors] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleTypingChange = (typing) => {
    console.log('📱 LearnerTutorMessaging: Typing status changed:', typing);
    setIsTyping(typing);
  };

  useEffect(() => {
    loadTutors();
    loadConversations();
    loadOnlineUsers();
  }, []);

  const loadTutors = async () => {
    try {
      setLoading(true);
      const response = await getLearnerTutors();
      if (response.success) {
        setTutors(response.data);
      }
    } catch (error) {
      console.error('Error loading tutors:', error);
      showError('Failed to load tutors');
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

  const startChat = async (tutor) => {
    try {
      // Check if conversation already exists
      let conversation = conversations.find(conv => 
        conv.participants.some(p => p._id === tutor._id)
      );

      if (!conversation) {
        // Create new conversation
        const response = await createConversation(tutor._id);
        if (response.success) {
          conversation = response.data;
          setConversations(prev => [...prev, conversation]);
        }
      }

      setActiveChat({
        conversationId: conversation._id,
        otherUser: tutor
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Simple Header */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-md">
                <FaComments className="text-primary-600 text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tutor Chat</h1>
                <p className="text-slate-600 text-lg">Chat with your course tutors for help and support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tutors List */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center mr-3 shadow-md">
                <FaGraduationCap className="text-secondary-600" />
              </div>
              Your Course Tutors ({tutors.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 m-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-3 text-slate-600 font-medium">Loading tutors...</p>
            </div>
          ) : tutors.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 m-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <FaUserTie className="text-4xl text-primary-600" />
              </div>
              <p className="text-slate-900 font-bold text-lg mb-2">No tutors found for your enrolled courses</p>
              <p className="text-sm text-slate-600 font-medium">Tutors will appear here once you enroll in courses</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {tutors.map((tutor) => (
                <motion.div
                  key={tutor._id}
                  className="p-5 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                  onClick={() => startChat(tutor)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center shadow-md">
                          <FaUserTie className="text-primary-600" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-md ${
                          isUserOnline(tutor._id) ? 'bg-green-500' : 'bg-slate-400'
                        }`}>
                          <FaCircle className="w-full h-full" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{tutor.name}</h3>
                        <p className="text-sm text-slate-600 font-medium">{tutor.email}</p>
                        {tutor.courses && tutor.courses.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-primary-600 font-semibold">
                              Teaching: {tutor.courses.map(course => course.title).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${
                        isUserOnline(tutor._id) 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {isUserOnline(tutor._id) ? 'Online' : 'Offline'}
                      </span>
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center shadow-md">
                        <FaPaperPlane className="text-primary-600" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Modal */}
        {showChatModal && activeChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-primary-50 to-primary-100/50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center shadow-md">
                      <FaUserTie className="text-primary-600" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md ${
                      isUserOnline(activeChat.otherUser._id) ? 'bg-green-500' : 'bg-slate-400'
                    }`}>
                      <FaCircle className="w-full h-full" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{activeChat.otherUser.name}</h3>
                    <p className="text-sm text-slate-600 font-medium">
                      {console.log('🔍 Status check - isTyping:', isTyping, 'isOnline:', isUserOnline(activeChat.otherUser._id))}
                      {isTyping ? (
                        <span className="flex items-center text-primary-600">
                          <div className="flex space-x-1 mr-2">
                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors shadow-sm hover:shadow-md"
                >
                  <FaTimes className="text-slate-600" />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <LearnerTutorChat
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

export default LearnerTutorMessaging;