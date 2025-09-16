import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPlay, 
  FaPause, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaExpand, 
  FaBookmark, 
  FaStickyNote, 
  FaCheck, 
  FaClock, 
  FaFileAlt, 
  FaQuestionCircle, 
  FaTasks, 
  FaBook,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';

const LessonPlayer = ({ courseId, lessonId, onLessonComplete, onNextLesson }) => {
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newBookmark, setNewBookmark] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [assignmentFiles, setAssignmentFiles] = useState([]);
  const [assignmentText, setAssignmentText] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    loadLesson();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/lessons/${lessonId}?includeProgress=true`);
      setLesson(response.data.data);
      setProgress(response.data.data.progress);
      
      // Start lesson if not started
      if (!response.data.data.progress || response.data.data.progress.status === 'not-started') {
        await startLesson();
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const startLesson = async () => {
    try {
      await apiService.put(`/lessons/${lessonId}/progress`, { action: 'start' });
    } catch (error) {
      console.error('Error starting lesson:', error);
    }
  };

  const updateProgress = async (watchPercentage, watchTime, position) => {
    try {
      await apiService.put(`/lessons/${lessonId}/progress`, {
        action: 'video_progress',
        watchPercentage,
        watchTime,
        position
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const updateReadingProgress = async (readPercentage, readTime, position) => {
    try {
      await apiService.put(`/lessons/${lessonId}/progress`, {
        action: 'reading_progress',
        readPercentage,
        readTime,
        position
      });
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      await apiService.post(`/lessons/${lessonId}/notes`, {
        content: newNote,
        timestamp: currentTime
      });
      toast.success('Note added successfully');
      setNewNote('');
      loadLesson(); // Reload to get updated notes
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const addBookmark = async () => {
    if (!newBookmark.trim()) return;

    try {
      await apiService.post(`/lessons/${lessonId}/bookmarks`, {
        title: newBookmark,
        timestamp: currentTime
      });
      toast.success('Bookmark added successfully');
      setNewBookmark('');
      loadLesson(); // Reload to get updated bookmarks
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast.error('Failed to add bookmark');
    }
  };

  const submitQuiz = async () => {
    if (!lesson.content.quizQuestions) return;

    const answers = Object.entries(quizAnswers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    try {
      setSubmittingQuiz(true);
      const response = await apiService.post(`/lessons/${lessonId}/quiz/submit`, { answers });
      
      toast.success(`Quiz submitted! Score: ${response.data.data.score}%`);
      
      if (response.data.data.passed) {
        toast.success('Congratulations! You passed the quiz.');
        if (onLessonComplete) onLessonComplete();
      } else {
        toast.error('You need to score 70% or higher to pass. Try again!');
      }
      
      loadLesson(); // Reload to get updated progress
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const submitAssignment = async () => {
    try {
      setSubmittingAssignment(true);
      
      const formData = new FormData();
      formData.append('text', assignmentText);
      
      assignmentFiles.forEach((file, index) => {
        formData.append('files', file);
      });

      await apiService.post(`/lessons/${lessonId}/assignment/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Assignment submitted successfully');
      setAssignmentText('');
      setAssignmentFiles([]);
      loadLesson(); // Reload to get updated progress
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAssignmentFiles([...assignmentFiles, ...files]);
  };

  const removeFile = (index) => {
    setAssignmentFiles(assignmentFiles.filter((_, i) => i !== index));
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <FaPlay className="text-red-500" />;
      case 'document': return <FaFileAlt className="text-blue-500" />;
      case 'quiz': return <FaQuestionCircle className="text-green-500" />;
      case 'assignment': return <FaTasks className="text-purple-500" />;
      case 'reading': return <FaBook className="text-orange-500" />;
      default: return <FaFileAlt className="text-gray-500" />;
    }
  };

  const getProgressColor = () => {
    if (!progress) return 'bg-gray-200';
    if (progress.status === 'completed') return 'bg-green-500';
    if (progress.status === 'in-progress') return 'bg-blue-500';
    return 'bg-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-2xl text-indigo-600" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lesson not found</h3>
        <p className="text-gray-600">This lesson may have been removed or you don't have access to it.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Lesson Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="text-3xl">{getLessonIcon(lesson.type)}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Lesson {lesson.lessonNumber}: {lesson.title}
              </h1>
              <p className="text-gray-600 mb-3">{lesson.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FaClock />
                  {lesson.durationMinutes || 0} min
                </div>
                <div className="flex items-center gap-1">
                  <FaEye />
                  {lesson.totalViews || 0} views
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Notes"
            >
              <FaStickyNote />
            </button>
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Bookmarks"
            >
              <FaBookmark />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progress?.completionPercentage || 0}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress: {progress?.completionPercentage || 0}%</span>
          <span>Status: {progress?.status || 'Not started'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {lesson.type === 'video' && (
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <video
                ref={videoRef}
                src={lesson.content.videoUrl}
                className="w-full h-96"
                onTimeUpdate={(e) => {
                  const video = e.target;
                  const currentTime = video.currentTime;
                  const duration = video.duration;
                  
                  setCurrentTime(currentTime);
                  setDuration(duration);
                  
                  if (duration > 0) {
                    const watchPercentage = (currentTime / duration) * 100;
                    updateProgress(watchPercentage, currentTime, currentTime);
                  }
                }}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => {
                  setPlaying(false);
                  if (onLessonComplete) onLessonComplete();
                }}
              />
              
              {/* Video Controls */}
              <div className="bg-gray-900 text-white p-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (playing) {
                        videoRef.current.pause();
                      } else {
                        videoRef.current.play();
                      }
                    }}
                    className="text-2xl hover:text-gray-300"
                  >
                    {playing ? <FaPause /> : <FaPlay />}
                  </button>
                  
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-100"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  
                  <span className="text-sm">
                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / 
                    {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
                  </span>
                  
                  <button
                    onClick={() => setMuted(!muted)}
                    className="hover:text-gray-300"
                  >
                    {muted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  
                  <button className="hover:text-gray-300">
                    <FaExpand />
                  </button>
                </div>
              </div>
            </div>
          )}

          {lesson.type === 'document' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="text-center">
                <FaFileAlt className="mx-auto text-4xl text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {lesson.title}
                </h3>
                <p className="text-gray-600 mb-4">{lesson.description}</p>
                
                <a
                  href={lesson.content.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaDownload />
                  Download Document
                </a>
              </div>
            </div>
          )}

          {lesson.type === 'reading' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="prose max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: lesson.content.readingText }}
                  onScroll={(e) => {
                    const element = e.target;
                    const scrollTop = element.scrollTop;
                    const scrollHeight = element.scrollHeight - element.clientHeight;
                    const scrollPercentage = (scrollTop / scrollHeight) * 100;
                    
                    setReadingProgress(scrollPercentage);
                    updateReadingProgress(scrollPercentage, 0, scrollTop);
                  }}
                />
              </div>
            </div>
          )}

          {lesson.type === 'quiz' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz</h3>
              
              {lesson.content.quizQuestions?.map((question, index) => (
                <div key={question._id || index} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {index + 1}. {question.question}
                  </h4>
                  
                  {question.type === 'multiple-choice' && (
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            onChange={(e) => setQuizAnswers({
                              ...quizAnswers,
                              [question._id || index]: e.target.value
                            })}
                            className="mr-2"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'true-false' && (
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value="true"
                          onChange={(e) => setQuizAnswers({
                            ...quizAnswers,
                            [question._id || index]: e.target.value
                          })}
                          className="mr-2"
                        />
                        True
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value="false"
                          onChange={(e) => setQuizAnswers({
                            ...quizAnswers,
                            [question._id || index]: e.target.value
                          })}
                          className="mr-2"
                        />
                        False
                      </label>
                    </div>
                  )}
                  
                  {question.type === 'short-answer' && (
                    <input
                      type="text"
                      value={quizAnswers[question._id || index] || ''}
                      onChange={(e) => setQuizAnswers({
                        ...quizAnswers,
                        [question._id || index]: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Your answer..."
                    />
                  )}
                </div>
              ))}
              
              <button
                onClick={submitQuiz}
                disabled={submittingQuiz}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submittingQuiz ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                Submit Quiz
              </button>
            </div>
          )}

          {lesson.type === 'assignment' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: lesson.content.assignmentInstructions }} />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Submission
                  </label>
                  <textarea
                    value={assignmentText}
                    onChange={(e) => setAssignmentText(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Write your assignment here..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Files
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  
                  {assignmentFiles.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {assignmentFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={submitAssignment}
                  disabled={submittingAssignment}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingAssignment ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                  Submit Assignment
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notes Panel */}
          {showNotes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
              
              <div className="space-y-3 mb-4">
                {lesson.notes?.map((note, index) => (
                  <div key={index} className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-sm text-gray-700">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <button
                  onClick={addNote}
                  className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                >
                  Add Note
                </button>
              </div>
            </div>
          )}

          {/* Bookmarks Panel */}
          {showBookmarks && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Bookmarks</h3>
              
              <div className="space-y-2 mb-4">
                {lesson.bookmarks?.map((bookmark, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{bookmark.title}</p>
                    <p className="text-xs text-gray-500">
                      {Math.floor(bookmark.timestamp / 60)}:{(bookmark.timestamp % 60).toFixed(0).padStart(2, '0')}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={newBookmark}
                  onChange={(e) => setNewBookmark(e.target.value)}
                  placeholder="Bookmark title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <button
                  onClick={addBookmark}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Add Bookmark
                </button>
              </div>
            </div>
          )}

          {/* Lesson Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Navigation</h3>
            <div className="flex justify-between">
              <button
                onClick={() => {/* Navigate to previous lesson */}}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <FaArrowLeft />
                Previous
              </button>
              <button
                onClick={() => {/* Navigate to next lesson */}}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Next
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
