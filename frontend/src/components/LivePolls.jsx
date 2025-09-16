import React, { useState, useEffect } from 'react';
import { 
  FaPoll, 
  FaPlus, 
  FaTrash, 
  FaCheck, 
  FaTimes,
  FaChartBar,
  FaEye,
  FaEyeSlash,
  FaClock,
  FaUsers,
  FaShare,
  FaCopy
} from 'react-icons/fa';
import { showError, showSuccess } from '../../services/toastService.jsx';

const LivePolls = ({ sessionId, userRole, isActive = true }) => {
  const [polls, setPolls] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    duration: 60,
    isAnonymous: false,
    allowMultiple: false
  });

  // Mock polls data
  const mockPolls = [
    {
      id: 1,
      question: 'How familiar are you with React?',
      options: [
        { id: 1, text: 'Beginner', votes: 12, percentage: 40 },
        { id: 2, text: 'Intermediate', votes: 15, percentage: 50 },
        { id: 3, text: 'Advanced', votes: 3, percentage: 10 }
      ],
      totalVotes: 30,
      duration: 120,
      isActive: false,
      isAnonymous: true,
      allowMultiple: false,
      createdAt: new Date(Date.now() - 3600000),
      endedAt: new Date(Date.now() - 3480000)
    },
    {
      id: 2,
      question: 'Which topic should we cover next?',
      options: [
        { id: 1, text: 'State Management', votes: 8, percentage: 32 },
        { id: 2, text: 'Hooks', votes: 12, percentage: 48 },
        { id: 3, text: 'Performance', votes: 5, percentage: 20 }
      ],
      totalVotes: 25,
      duration: 180,
      isActive: true,
      isAnonymous: false,
      allowMultiple: true,
      createdAt: new Date(Date.now() - 600000),
      endsAt: new Date(Date.now() + 120000)
    }
  ];

  useEffect(() => {
    setPolls(mockPolls);
    setActivePoll(mockPolls.find(poll => poll.isActive));
  }, []);

  const handleCreatePoll = () => {
    if (!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())) {
      showError('Please fill in all fields');
      return;
    }

    const pollData = {
      id: Date.now(),
      question: newPoll.question,
      options: newPoll.options.map((text, index) => ({
        id: index + 1,
        text: text.trim(),
        votes: 0,
        percentage: 0
      })),
      totalVotes: 0,
      duration: newPoll.duration,
      isActive: true,
      isAnonymous: newPoll.isAnonymous,
      allowMultiple: newPoll.allowMultiple,
      createdAt: new Date(),
      endsAt: new Date(Date.now() + newPoll.duration * 1000)
    };

    setPolls(prev => [pollData, ...prev]);
    setActivePoll(pollData);
    setShowCreatePoll(false);
    setNewPoll({ question: '', options: ['', ''], duration: 60, isAnonymous: false, allowMultiple: false });
    showSuccess('Poll created successfully!');
  };

  const handleVote = (pollId, optionId) => {
    const updatedPolls = polls.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map(option => {
          if (option.id === optionId) {
            return { ...option, votes: option.votes + 1 };
          }
          return option;
        });

        const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0);
        const optionsWithPercentage = updatedOptions.map(option => ({
          ...option,
          percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
        }));

        return {
          ...poll,
          options: optionsWithPercentage,
          totalVotes
        };
      }
      return poll;
    });

    setPolls(updatedPolls);
    setActivePoll(updatedPolls.find(poll => poll.id === pollId));
    showSuccess('Vote submitted!');
  };

  const handleEndPoll = (pollId) => {
    const updatedPolls = polls.map(poll => 
      poll.id === pollId ? { ...poll, isActive: false } : poll
    );
    setPolls(updatedPolls);
    setActivePoll(null);
    showSuccess('Poll ended successfully!');
  };

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index, value) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const PollCard = ({ poll }) => {
    const isTutor = userRole === 'tutor';
    const hasVoted = false; // TODO: Track user votes

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FaPoll className="text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">{poll.question}</h3>
          </div>
          <div className="flex items-center space-x-2">
            {poll.isActive && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Active
              </span>
            )}
            {poll.isAnonymous && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                Anonymous
              </span>
            )}
            {poll.allowMultiple && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                Multiple
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {poll.options.map((option) => (
            <div key={option.id} className="relative">
              <button
                onClick={() => poll.isActive && !hasVoted && handleVote(poll.id, option.id)}
                disabled={!poll.isActive || hasVoted}
                className={`w-full p-3 text-left rounded-lg border transition-all ${
                  poll.isActive && !hasVoted
                    ? 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                } ${!poll.isActive || hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{option.text}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{option.votes} votes</span>
                    <span className="text-sm font-medium text-blue-600">{option.percentage}%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${option.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>{poll.totalVotes} total votes</span>
            {poll.isActive && (
              <span className="flex items-center space-x-1">
                <FaClock className="text-xs" />
                <span>{formatTimeRemaining(poll.endsAt)}</span>
              </span>
            )}
          </div>
          
          {isTutor && poll.isActive && (
            <button
              onClick={() => handleEndPoll(poll.id)}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
            >
              End Poll
            </button>
          )}
        </div>
      </div>
    );
  };

  const CreatePollForm = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Poll</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
          <input
            type="text"
            value={newPoll.question}
            onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
            placeholder="Enter your question..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
          <div className="space-y-2">
            {newPoll.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {newPoll.options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                )}
              </div>
            ))}
            {newPoll.options.length < 6 && (
              <button
                onClick={addOption}
                className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
              >
                <FaPlus className="text-sm" />
                <span>Add Option</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
            <select
              value={newPoll.duration}
              onChange={(e) => setNewPoll(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={120}>2 minutes</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              checked={newPoll.isAnonymous}
              onChange={(e) => setNewPoll(prev => ({ ...prev, isAnonymous: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
              Anonymous poll
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="multiple"
              checked={newPoll.allowMultiple}
              onChange={(e) => setNewPoll(prev => ({ ...prev, allowMultiple: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="multiple" className="ml-2 text-sm text-gray-700">
              Allow multiple votes
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <button
            onClick={() => setShowCreatePoll(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreatePoll}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <FaPoll className="text-sm" />
            <span>Create Poll</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Live Polls</h2>
        {userRole === 'tutor' && isActive && (
          <button
            onClick={() => setShowCreatePoll(!showCreatePoll)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <FaPlus className="text-sm" />
            <span>Create Poll</span>
          </button>
        )}
      </div>

      {/* Create Poll Form */}
      {showCreatePoll && <CreatePollForm />}

      {/* Active Poll */}
      {activePoll && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-900">Active Poll</h3>
            <div className="flex items-center space-x-2">
              <FaClock className="text-blue-500 animate-pulse" />
              <span className="text-sm text-blue-700">
                {formatTimeRemaining(activePoll.endsAt)} remaining
              </span>
            </div>
          </div>
          <PollCard poll={activePoll} />
        </div>
      )}

      {/* Previous Polls */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Polls</h3>
        {polls.filter(poll => !poll.isActive).map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>

      {polls.filter(poll => !poll.isActive).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FaPoll className="text-4xl mx-auto mb-4 text-gray-300" />
          <p>No polls created yet</p>
        </div>
      )}
    </div>
  );
};

export default LivePolls;
