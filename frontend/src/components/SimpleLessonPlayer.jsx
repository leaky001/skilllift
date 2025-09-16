import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPlay, 
  FaPause, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaExpand, 
  FaCheck, 
  FaClock, 
  FaFileAlt, 
  FaQuestionCircle, 
  FaTasks, 
  FaBook,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaDownload
} from 'react-icons/fa';
import { apiService } from '../services/api';

/**
 * SIMPLIFIED LESSON PLAYER COMPONENT
 * 
 * Key Simplifications:
 * 1. Single component for all lesson types
 * 2. Simple progress tracking
 * 3. Clean, intuitive UI
 * 4. Easy to maintain and extend
 */
const SimpleLessonPlayer = ({ courseId, lessonId, onLessonComplete, onNextLesson }) => {
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [assignmentText, setAssignmentText] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const videoRef = React.useRef(null);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/simple-lessons/${lessonId}`);
      if (response.data.success) {
        setLesson(response.data.data.lesson);
        setProgress(response.data.data.progress);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (progressData) => {
    try {
      const response = await apiService.put(`/simple-lessons/${lessonId}/progress`, progressData);
      if (response.data.success) {
        setProgress(response.data.data);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleVideoProgress = (e) => {
    const video = e.target;
    const progress = (video.currentTime / video.duration) * 100;
    setCurrentTime(video.currentTime);
    setDuration(video.duration);
    
    // Update progress every 10 seconds
    if (Math.floor(video.currentTime) % 10 === 0) {
      updateProgress({ watchPercentage: Math.round(progress) });
    }
  };

  const handleQuizSubmit = async () => {
    try {
      setSubmittingQuiz(true);
      const answers = Object.values(quizAnswers);
      const response = await apiService.post(`/simple-lessons/${lessonId}/quiz`, { answers });
      
      if (response.data.success) {
        setProgress(response.data.data.progress);
        if (response.data.data.passed) {
          onLessonComplete && onLessonComplete(lessonId);
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleAssignmentSubmit = async () => {
    try {
      setSubmittingAssignment(true);
      const response = await apiService.post(`/simple-lessons/${lessonId}/assignment`, {
        submissionText: assignmentText
      });
      
      if (response.data.success) {
        setProgress(response.data.data);
        onLessonComplete && onLessonComplete(lessonId);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleReadingProgress = (progress) => {
    setReadingProgress(progress);
    updateProgress({ readPercentage: progress });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-2xl text-blue-600" />
        <span className="ml-2">Loading lesson...</span>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Lesson not found</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (lesson.contentType) {
      case 'video':
        return (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-auto rounded-lg shadow-lg"
              controls
              onTimeUpdate={handleVideoProgress}
              onLoadedMetadata={(e) => setDuration(e.target.duration)}
            >
              <source src={lesson.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Progress indicator */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {progress?.watchPercentage || 0}%</span>
                <span>{lesson.videoDuration} minutes</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress?.watchPercentage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{lesson.documentName}</h3>
                <a
                  href={lesson.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <FaDownload className="mr-2" />
                  Download
                </a>
              </div>
              <p className="text-gray-600">{lesson.description}</p>
            </div>
            
            {/* Reading progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Reading Progress: {readingProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${readingProgress}%` }}
                ></div>
              </div>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => handleReadingProgress(25)}
                  className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  25%
                </button>
                <button
                  onClick={() => handleReadingProgress(50)}
                  className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  50%
                </button>
                <button
                  onClick={() => handleReadingProgress(75)}
                  className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  75%
                </button>
                <button
                  onClick={() => handleReadingProgress(100)}
                  className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  100%
                </button>
              </div>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaQuestionCircle className="mr-2" />
                Quiz: {lesson.title}
              </h3>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
              <div className="text-sm text-gray-500">
                Time Limit: {lesson.quizTimeLimit} minutes | 
                Questions: {lesson.quizQuestions.length} | 
                Passing Score: 70%
              </div>
            </div>

            <div className="space-y-6">
              {lesson.quizQuestions.map((question, index) => (
                <div key={index} className="bg-white border rounded-lg p-6">
                  <h4 className="font-semibold mb-4">
                    Question {index + 1}: {question.question}
                  </h4>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={optionIndex}
                          checked={quizAnswers[index] === optionIndex}
                          onChange={(e) => setQuizAnswers({
                            ...quizAnswers,
                            [index]: parseInt(e.target.value)
                          })}
                          className="mr-3"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {progress?.quizAttempts > 0 && (
                  <span>Previous Score: {progress.quizScore}%</span>
                )}
              </div>
              <button
                onClick={handleQuizSubmit}
                disabled={submittingQuiz || Object.keys(quizAnswers).length !== lesson.quizQuestions.length}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submittingQuiz ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaCheck className="mr-2" />
                )}
                Submit Quiz
              </button>
            </div>
          </div>
        );

      case 'assignment':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaTasks className="mr-2" />
                Assignment: {lesson.title}
              </h3>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
              <div className="text-sm text-gray-500">
                Due Date: {lesson.assignmentDueDate ? new Date(lesson.assignmentDueDate).toLocaleDateString() : 'No due date'}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold mb-4">Instructions:</h4>
              <div className="prose max-w-none">
                <p>{lesson.assignmentInstructions}</p>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold mb-4">Your Submission:</h4>
              <textarea
                value={assignmentText}
                onChange={(e) => setAssignmentText(e.target.value)}
                placeholder="Write your assignment submission here..."
                className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {progress?.assignmentSubmitted && (
                  <span className="text-green-600">✓ Assignment Submitted</span>
                )}
              </div>
              <button
                onClick={handleAssignmentSubmit}
                disabled={submittingAssignment || !assignmentText.trim() || progress?.assignmentSubmitted}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submittingAssignment ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaCheck className="mr-2" />
                )}
                {progress?.assignmentSubmitted ? 'Already Submitted' : 'Submit Assignment'}
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Unsupported lesson type</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Lesson Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Lesson {lesson.order}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              progress?.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : progress?.status === 'in-progress'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {progress?.status === 'completed' ? 'Completed' : 
               progress?.status === 'in-progress' ? 'In Progress' : 'Not Started'}
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
        <p className="text-gray-600 mb-4">{lesson.description}</p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <FaClock className="mr-1" />
            {lesson.durationMinutes} minutes
          </span>
          <span className="flex items-center">
            <FaFileAlt className="mr-1" />
            {lesson.contentType}
          </span>
          {lesson.isFree && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              Free
            </span>
          )}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {renderContent()}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => window.history.back()}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft className="mr-2" />
          Previous
        </button>
        
        <button
          onClick={onNextLesson}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Next Lesson
          <FaArrowRight className="ml-2" />
        </button>
      </div>
    </motion.div>
  );
};

export default SimpleLessonPlayer;
