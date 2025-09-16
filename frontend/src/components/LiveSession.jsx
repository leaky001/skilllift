import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaVideo, 
  FaVideoSlash, 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaHandPaper, 
  FaComments, 
  FaQuestionCircle, 
  FaPoll, 
  FaShare, 
  FaUsers, 
  FaClock, 
  FaPlay, 
  FaPause, 
  FaStop,
  FaSpinner,
  FaTimes,
  FaCheck,
  FaThumbsUp,
  FaThumbsDown,
  FaPaperPlane,
  FaVolumeUp,
  FaVolumeMute
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';

const LiveSession = ({ sessionId, userRole = 'participant' }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [question, setQuestion] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [showQnA, setShowQnA] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [polls, setPolls] = useState([]);
  const [recording, setRecording] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);

  const videoRef = useRef(null);
  const chatRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    loadSession();
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [sessionId]);

  useEffect(() => {
    if (joined) {
      // Start polling for updates
      pollIntervalRef.current = setInterval(() => {
        loadSession();
      }, 2000);
    }
  }, [joined]);

  const loadSession = async () => {
    try {
      const response = await apiService.get(`/live-classes/${sessionId}`);
      setSession(response.data.data);
      setParticipants(response.data.data.participants || []);
      setChatMessages(response.data.data.chatMessages || []);
      setQuestions(response.data.data.questions || []);
      setPolls(response.data.data.polls || []);
      setRecording(response.data.data.recording?.isRecording || false);
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async () => {
    try {
      const response = await apiService.post(`/live-classes/${sessionId}/join`);
      setSessionToken(response.data.data.sessionToken);
      setJoined(true);
      toast.success('Joined session successfully');
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join session');
    }
  };

  const leaveSession = async () => {
    try {
      await apiService.post(`/live-classes/${sessionId}/leave`);
      setJoined(false);
      setSessionToken(null);
      toast.success('Left session successfully');
    } catch (error) {
      console.error('Error leaving session:', error);
      toast.error('Failed to leave session');
    }
  };

  const startSession = async () => {
    try {
      await apiService.post(`/live-classes/${sessionId}/start`);
      toast.success('Session started successfully');
      loadSession();
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    }
  };

  const endSession = async () => {
    try {
      await apiService.post(`/live-classes/${sessionId}/end`);
      toast.success('Session ended successfully');
      loadSession();
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      await apiService.post(`/live-classes/${sessionId}/chat`, {
        message: chatMessage,
        messageType: 'message'
      });
      setChatMessage('');
      loadSession();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    try {
      await apiService.post(`/live-classes/${sessionId}/questions`, {
        question
      });
      setQuestion('');
      toast.success('Question submitted successfully');
      loadSession();
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to submit question');
    }
  };

  const answerQuestion = async (questionId, answer) => {
    try {
        await apiService.post(`/live-classes/${sessionId}/questions/${questionId}/answer`, {
        answer
      });
      toast.success('Answer submitted successfully');
      loadSession();
    } catch (error) {
      console.error('Error answering question:', error);
      toast.error('Failed to submit answer');
    }
  };

  const raiseHand = async () => {
    try {
      if (handRaised) {
        await apiService.post(`/live-classes/${sessionId}/lower-hand`);
        setHandRaised(false);
        toast.success('Hand lowered');
      } else {
        await apiService.post(`/live-classes/${sessionId}/raise-hand`);
        setHandRaised(true);
        toast.success('Hand raised');
      }
      loadSession();
    } catch (error) {
      console.error('Error raising/lowering hand:', error);
      toast.error('Failed to update hand status');
    }
  };

  const createPoll = async () => {
    const question = prompt('Enter poll question:');
    if (!question) return;

    const options = [];
    let option;
    do {
      option = prompt('Enter poll option (leave empty to finish):');
      if (option) options.push(option);
    } while (option);

    if (options.length < 2) {
      toast.error('Poll must have at least 2 options');
      return;
    }

    try {
      await apiService.post(`/live-classes/${sessionId}/polls`, {
        question,
        options
      });
      toast.success('Poll created successfully');
      loadSession();
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll');
    }
  };

  const voteOnPoll = async (pollId, optionIndex) => {
    try {
      await apiService.post(`/live-classes/${sessionId}/polls/${pollId}/vote`, {
        optionIndex
      });
      toast.success('Vote submitted successfully');
      loadSession();
    } catch (error) {
      console.error('Error voting on poll:', error);
      toast.error('Failed to submit vote');
    }
  };

  const startRecording = async () => {
    try {
      await apiService.post(`/live-classes/${sessionId}/recording/start`);
      setRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      await apiService.post(`/live-classes/${sessionId}/recording/stop`);
      setRecording(false);
      toast.success('Recording stopped');
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to stop recording');
    }
  };

  const getSessionStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-2xl text-indigo-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Session not found</h3>
        <p className="text-gray-600">This session may have been cancelled or you don't have access to it.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Session Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{session.title}</h1>
            <p className="text-gray-600 mb-3">{session.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FaClock />
                {formatTime(session.scheduledStartTime)}
              </div>
              <div className="flex items-center gap-1">
                <FaUsers />
                {participants.length} participants
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(session.status)}`}>
                {session.status}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {userRole === 'tutor' && (
              <>
                {session.status === 'scheduled' && (
                  <button
                    onClick={startSession}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <FaPlay />
                    Start Session
                  </button>
                )}
                {session.status === 'live' && (
                  <button
                    onClick={endSession}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <FaStop />
                    End Session
                  </button>
                )}
              </>
            )}
            
            {!joined && session.status === 'live' && (
              <button
                onClick={joinSession}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <FaVideo />
                Join Session
              </button>
            )}
            
            {joined && (
              <button
                onClick={leaveSession}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FaTimes />
                Leave Session
              </button>
            )}
          </div>
        </div>

        {/* Recording Status */}
        {recording && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-800 font-medium">Recording in progress</span>
            </div>
          </div>
        )}
      </div>

      {joined && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-3">
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <FaVideo className="mx-auto text-4xl mb-2" />
                  <p>Live Video Stream</p>
                  <p className="text-sm text-gray-400">WebRTC connection will be established here</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-900 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
                  </button>
                  
                  <button
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                  </button>
                  
                  <button
                    onClick={raiseHand}
                    className={`p-2 rounded-lg transition-colors ${
                      handRaised ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <FaHandPaper />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className={`p-2 rounded-lg transition-colors ${
                      showChat ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <FaComments />
                  </button>
                  
                  <button
                    onClick={() => setShowQnA(!showQnA)}
                    className={`p-2 rounded-lg transition-colors ${
                      showQnA ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <FaQuestionCircle />
                  </button>
                  
                  {userRole === 'tutor' && (
                    <button
                      onClick={() => setShowPolls(!showPolls)}
                      className={`p-2 rounded-lg transition-colors ${
                        showPolls ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <FaPoll />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Participants ({participants.length})</h3>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{participant.user?.name || 'Participant'}</span>
                    {participant.handRaised && <FaHandPaper className="text-yellow-500 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <h3 className="font-semibold text-gray-900 mb-3">Chat</h3>
                  
                  <div ref={chatRef} className="h-64 overflow-y-auto space-y-2 mb-3">
                    {chatMessages.map((message, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {message.user?.name || 'User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{message.message}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    />
                    <button
                      onClick={sendChatMessage}
                      className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Q&A */}
            <AnimatePresence>
              {showQnA && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <h3 className="font-semibold text-gray-900 mb-3">Q&A</h3>
                  
                  <div className="space-y-3 mb-3">
                    {questions.map((q, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {q.user?.name || 'User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(q.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{q.question}</p>
                        
                        {q.answer && (
                          <div className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                            <p className="text-sm text-green-800">{q.answer}</p>
                            <p className="text-xs text-green-600 mt-1">
                              Answered by {q.answeredBy?.name || 'Tutor'}
                            </p>
                          </div>
                        )}
                        
                        {userRole === 'tutor' && !q.answer && (
                          <button
                            onClick={() => {
                              const answer = prompt('Enter your answer:');
                              if (answer) answerQuestion(q._id, answer);
                            }}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                          >
                            Answer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask a question..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                    <button
                      onClick={askQuestion}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Ask Question
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Polls */}
            <AnimatePresence>
              {showPolls && userRole === 'tutor' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900">Polls</h3>
                    <button
                      onClick={createPoll}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                    >
                      <FaPoll />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {polls.map((poll, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{poll.question}</h4>
                        <div className="space-y-1">
                          {poll.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">{option.text}</span>
                              <span className="text-xs text-gray-500">{option.votes.length} votes</span>
                            </div>
                          ))}
                        </div>
                        {poll.isActive && (
                          <button
                            onClick={() => {
                              const optionIndex = prompt('Enter option index (0-based):');
                              if (optionIndex !== null) voteOnPoll(poll._id, parseInt(optionIndex));
                            }}
                            className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors mt-2"
                          >
                            Vote
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSession;
