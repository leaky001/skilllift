import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaPlay, 
  FaFileAlt, 
  FaQuestionCircle, 
  FaTasks, 
  FaBook,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUnlock,
  FaSpinner
} from 'react-icons/fa';
import { apiService } from '../services/api';

/**
 * SIMPLIFIED LESSON MANAGEMENT COMPONENT
 * 
 * Key Simplifications:
 * 1. Single component for all lesson management
 * 2. Simple CRUD operations
 * 3. Clean, intuitive interface
 * 4. Easy to understand and maintain
 */
const SimpleLessonManagement = ({ courseId, course }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'video',
    order: 1,
    videoUrl: '',
    videoDuration: 0,
    videoThumbnail: '',
    documentUrl: '',
    documentName: '',
    quizQuestions: [],
    quizTimeLimit: 10,
    assignmentInstructions: '',
    assignmentDueDate: '',
    isFree: false,
    isPreview: false,
    difficulty: 'easy'
  });

  useEffect(() => {
    loadLessons();
  }, [courseId]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/simple-lessons/course/${courseId}`);
      if (response.data.success) {
        setLessons(response.data.data);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const lessonData = {
        courseId,
        ...formData,
        order: lessons.length + 1
      };

      let response;
      if (editingLesson) {
        response = await apiService.put(`/simple-lessons/${editingLesson._id}`, lessonData);
      } else {
        response = await apiService.post('/simple-lessons', lessonData);
      }

      if (response.data.success) {
        await loadLessons();
        resetForm();
        setShowCreateForm(false);
        setEditingLesson(null);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  const handleDelete = async (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await apiService.delete(`/simple-lessons/${lessonId}`);
        await loadLessons();
      } catch (error) {
        console.error('Error deleting lesson:', error);
      }
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description,
      contentType: lesson.contentType,
      order: lesson.order,
      videoUrl: lesson.videoUrl || '',
      videoDuration: lesson.videoDuration || 0,
      videoThumbnail: lesson.videoThumbnail || '',
      documentUrl: lesson.documentUrl || '',
      documentName: lesson.documentName || '',
      quizQuestions: lesson.quizQuestions || [],
      quizTimeLimit: lesson.quizTimeLimit || 10,
      assignmentInstructions: lesson.assignmentInstructions || '',
      assignmentDueDate: lesson.assignmentDueDate || '',
      isFree: lesson.isFree,
      isPreview: lesson.isPreview,
      difficulty: lesson.difficulty
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      contentType: 'video',
      order: 1,
      videoUrl: '',
      videoDuration: 0,
      videoThumbnail: '',
      documentUrl: '',
      documentName: '',
      quizQuestions: [],
      quizTimeLimit: 10,
      assignmentInstructions: '',
      assignmentDueDate: '',
      isFree: false,
      isPreview: false,
      difficulty: 'easy'
    });
  };

  const addQuizQuestion = () => {
    setFormData(prev => ({
      ...prev,
      quizQuestions: [...prev.quizQuestions, {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }]
    }));
  };

  const updateQuizQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      quizQuestions: prev.quizQuestions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeQuizQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      quizQuestions: prev.quizQuestions.filter((_, i) => i !== index)
    }));
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video': return <FaPlay className="text-blue-600" />;
      case 'document': return <FaFileAlt className="text-green-600" />;
      case 'quiz': return <FaQuestionCircle className="text-purple-600" />;
      case 'assignment': return <FaTasks className="text-orange-600" />;
      default: return <FaBook className="text-gray-600" />;
    }
  };

  const getContentTypeLabel = (type) => {
    switch (type) {
      case 'video': return 'Video Lesson';
      case 'document': return 'Document';
      case 'quiz': return 'Quiz';
      case 'assignment': return 'Assignment';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-2xl text-blue-600" />
        <span className="ml-2">Loading lessons...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Lessons</h2>
          <p className="text-gray-600">Manage lessons for "{course?.title}"</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
            setEditingLesson(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add Lesson
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">
            {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type *
                </label>
                <select
                  value={formData.contentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="video">Video Lesson</option>
                  <option value="document">Document</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                required
              />
            </div>

            {/* Content-specific fields */}
            {formData.contentType === 'video' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL *
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.videoDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoDuration: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
            )}

            {formData.contentType === 'document' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document URL *
                  </label>
                  <input
                    type="url"
                    value={formData.documentUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Name
                  </label>
                  <input
                    type="text"
                    value={formData.documentName}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {formData.contentType === 'quiz' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Quiz Questions</h4>
                  <button
                    type="button"
                    onClick={addQuizQuestion}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add Question
                  </button>
                </div>
                
                {formData.quizQuestions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Question {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeQuizQuestion(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuizQuestion(index, 'question', e.target.value)}
                      placeholder="Enter question..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                    />
                    
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuizQuestion(index, 'correctAnswer', optionIndex)}
                            className="mr-2"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.options];
                              newOptions[optionIndex] = e.target.value;
                              updateQuizQuestion(index, 'options', newOptions);
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.contentType === 'assignment' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Instructions *
                  </label>
                  <textarea
                    value={formData.assignmentInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignmentInstructions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.assignmentDueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignmentDueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Free Lesson</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPreview}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPreview: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Preview</span>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingLesson(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingLesson ? 'Update Lesson' : 'Create Lesson'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Lessons List */}
      <div className="space-y-4">
        {lessons.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FaBook className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
            <p className="text-gray-600 mb-4">Create your first lesson to get started</p>
            <button
              onClick={() => {
                resetForm();
                setShowCreateForm(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create First Lesson
            </button>
          </div>
        ) : (
          lessons.map((lesson, index) => (
            <motion.div
              key={lesson._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getContentTypeIcon(lesson.contentType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {lesson.title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        Lesson {lesson.order}
                      </span>
                      {lesson.isFree && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Free
                        </span>
                      )}
                      {lesson.isPreview && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Preview
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{lesson.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{getContentTypeLabel(lesson.contentType)}</span>
                      <span>{lesson.durationMinutes} minutes</span>
                      <span className="capitalize">{lesson.difficulty}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(lesson)}
                    className="p-2 text-gray-600 hover:text-blue-600"
                    title="Edit lesson"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(lesson._id)}
                    className="p-2 text-gray-600 hover:text-red-600"
                    title="Delete lesson"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SimpleLessonManagement;
