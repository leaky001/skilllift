import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPlay, 
  FaFileAlt, 
  FaQuestionCircle, 
  FaTasks, 
  FaBook, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaUpload,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaClock,
  FaUsers,
  FaChartLine
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';

const LessonManagement = ({ courseId, course }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lessonNumber: '',
    type: 'video',
    content: {},
    completionCriteria: 'watch-90-percent',
    requiredForCompletion: true,
    isFree: false,
    isPreview: false,
    tags: '',
    difficulty: 'beginner'
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadLessons();
  }, [courseId]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/lessons/course/${courseId}`);
      setLessons(response.data.data || []);
    } catch (error) {
      console.error('Error loading lessons:', error);
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.lessonNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('course', courseId);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('lessonNumber', formData.lessonNumber);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('completionCriteria', formData.completionCriteria);
      formDataToSend.append('requiredForCompletion', formData.requiredForCompletion);
      formDataToSend.append('isFree', formData.isFree);
      formDataToSend.append('isPreview', formData.isPreview);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('difficulty', formData.difficulty);

      // Add content based on lesson type
      if (formData.type === 'video' && formData.content.video) {
        formDataToSend.append('video', formData.content.video);
      }
      if (formData.type === 'document' && formData.content.document) {
        formDataToSend.append('document', formData.content.document);
      }
      if (formData.type === 'quiz') {
        formDataToSend.append('content', JSON.stringify(formData.content));
      }
      if (formData.type === 'assignment') {
        formDataToSend.append('content', JSON.stringify(formData.content));
      }

      const endpoint = editingLesson ? `/lessons/${editingLesson._id}` : '/lessons';
      const method = editingLesson ? 'PUT' : 'POST';
      
      const response = await apiService[method.toLowerCase()](endpoint, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(editingLesson ? 'Lesson updated successfully' : 'Lesson created successfully');
      setShowCreateForm(false);
      setEditingLesson(null);
      resetForm();
      loadLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Failed to save lesson');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      lessonNumber: '',
      type: 'video',
      content: {},
      completionCriteria: 'watch-90-percent',
      requiredForCompletion: true,
      isFree: false,
      isPreview: false,
      tags: '',
      difficulty: 'beginner'
    });
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description,
      lessonNumber: lesson.lessonNumber,
      type: lesson.type,
      content: lesson.content || {},
      completionCriteria: lesson.completionCriteria,
      requiredForCompletion: lesson.requiredForCompletion,
      isFree: lesson.isFree,
      isPreview: lesson.isPreview,
      tags: lesson.tags?.join(', ') || '',
      difficulty: lesson.difficulty
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    try {
      await apiService.delete(`/lessons/${lessonId}`);
      toast.success('Lesson deleted successfully');
      loadLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Failed to delete lesson');
    }
  };

  const toggleLessonStatus = async (lesson) => {
    try {
      const newStatus = lesson.status === 'published' ? 'draft' : 'published';
      await apiService.put(`/lessons/${lesson._id}`, { status: newStatus });
      toast.success(`Lesson ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      loadLessons();
    } catch (error) {
      console.error('Error updating lesson status:', error);
      toast.error('Failed to update lesson status');
    }
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

  const getLessonTypeColor = (type) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'quiz': return 'bg-green-100 text-green-800';
      case 'assignment': return 'bg-purple-100 text-purple-800';
      case 'reading': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-2xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Lessons</h2>
          <p className="text-gray-600">Manage lessons for {course?.title}</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <FaPlus /> Add Lesson
        </button>
      </div>

      {/* Lessons List */}
      <div className="grid gap-4">
        {lessons.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
            <p className="text-gray-600 mb-4">Create your first lesson to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Lesson
            </button>
          </div>
        ) : (
          lessons.map((lesson) => (
            <motion.div
              key={lesson._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-2xl">{getLessonIcon(lesson.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Lesson {lesson.lessonNumber}: {lesson.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLessonTypeColor(lesson.type)}`}>
                        {lesson.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lesson.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lesson.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{lesson.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaClock />
                        {lesson.durationMinutes || 0} min
                      </div>
                      <div className="flex items-center gap-1">
                        <FaUsers />
                        {lesson.totalViews || 0} views
                      </div>
                      <div className="flex items-center gap-1">
                        <FaChartLine />
                        {lesson.completionRate || 0}% completion
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLessonStatus(lesson)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title={lesson.status === 'published' ? 'Unpublish' : 'Publish'}
                  >
                    {lesson.status === 'published' ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button
                    onClick={() => handleEdit(lesson)}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Edit lesson"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(lesson._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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

      {/* Create/Edit Lesson Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingLesson(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lesson Number *
                    </label>
                    <input
                      type="number"
                      value={formData.lessonNumber}
                      onChange={(e) => setFormData({ ...formData, lessonNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lesson Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, content: {} })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="video">Video</option>
                      <option value="document">Document</option>
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Assignment</option>
                      <option value="reading">Reading</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Content based on lesson type */}
                {formData.type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video File
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        content: { ...formData.content, video: e.target.files[0] }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}

                {formData.type === 'document' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document File
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        content: { ...formData.content, document: e.target.files[0] }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}

                {formData.type === 'quiz' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quiz Questions (JSON format)
                    </label>
                    <textarea
                      value={JSON.stringify(formData.content.quizQuestions || [], null, 2)}
                      onChange={(e) => {
                        try {
                          const questions = JSON.parse(e.target.value);
                          setFormData({ 
                            ...formData, 
                            content: { ...formData.content, quizQuestions: questions }
                          });
                        } catch (error) {
                          // Invalid JSON, keep current value
                        }
                      }}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                      placeholder='[{"question": "What is...?", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "points": 1}]'
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completion Criteria
                    </label>
                    <select
                      value={formData.completionCriteria}
                      onChange={(e) => setFormData({ ...formData, completionCriteria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="watch-90-percent">Watch 90%</option>
                      <option value="watch-complete">Watch Complete</option>
                      <option value="pass-quiz">Pass Quiz</option>
                      <option value="submit-assignment">Submit Assignment</option>
                      <option value="read-complete">Read Complete</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiredForCompletion}
                      onChange={(e) => setFormData({ ...formData, requiredForCompletion: e.target.checked })}
                      className="mr-2"
                    />
                    Required for completion
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFree}
                      onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                      className="mr-2"
                    />
                    Free lesson
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPreview}
                      onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
                      className="mr-2"
                    />
                    Preview lesson
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingLesson(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LessonManagement;
