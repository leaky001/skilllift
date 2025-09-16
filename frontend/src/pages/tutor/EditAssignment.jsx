import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { showSuccess, showError } from '../../services/toastService.jsx';
import { getAssignment, updateAssignment } from '../../services/assignmentService';
import { getCourse } from '../../services/courseService';

const EditAssignment = () => {
  const navigate = useNavigate();
  const { courseId, assignmentId } = useParams();
  const [course, setCourse] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignmentType: 'homework',
    instructions: '',
    dueDate: '',
    points: 100,
    weight: 10,
    submissionType: 'file',
    allowLateSubmission: false,
    latePenalty: 10
  });

  useEffect(() => {
    if (courseId && assignmentId) {
      loadCourse();
      loadAssignment();
    }
  }, [courseId, assignmentId]);

  const loadCourse = async () => {
    try {
      setCourseLoading(true);
      const response = await getCourse(courseId);
      if (response.success) {
        setCourse(response.data);
      } else {
        showError('Failed to load course');
        navigate('/tutor/courses');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      showError('Failed to load course');
      navigate('/tutor/courses');
    } finally {
      setCourseLoading(false);
    }
  };

  const loadAssignment = async () => {
    try {
      setAssignmentLoading(true);
      const response = await getAssignment(assignmentId);
      if (response.success) {
        const assignmentData = response.data;
        setAssignment(assignmentData);
        
        // Convert date to local datetime string for input field
        const dueDate = new Date(assignmentData.dueDate);
        const localDateTime = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);

        setFormData({
          title: assignmentData.title || '',
          description: assignmentData.description || '',
          assignmentType: assignmentData.assignmentType || 'homework',
          instructions: assignmentData.instructions || '',
          dueDate: localDateTime,
          points: assignmentData.points || 100,
          weight: assignmentData.weight || 10,
          submissionType: assignmentData.submissionType || 'file',
          allowLateSubmission: assignmentData.allowLateSubmission || false,
          latePenalty: assignmentData.latePenalty || 10
        });
      } else {
        showError('Failed to load assignment');
        navigate(`/tutor/courses/${courseId}/assignments`);
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      showError('Failed to load assignment');
      navigate(`/tutor/courses/${courseId}/assignments`);
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await updateAssignment(assignmentId, formData);

      if (response.success) {
        showSuccess('Assignment updated successfully!');
        navigate(`/tutor/courses/${courseId}/assignments/${assignmentId}`);
      } else {
        showError(response.message || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      showError('Failed to update assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (courseLoading || assignmentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course || !assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Assignment Not Found</h1>
            <button
              onClick={() => navigate(`/tutor/courses/${courseId}/assignments`)}
              className="btn-primary"
            >
              Back to Assignments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(`/tutor/courses/${courseId}/assignments/${assignmentId}`)}
                className="btn-outline mb-4"
              >
                ← Back to Assignment
              </button>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Edit Assignment</h1>
              <p className="text-neutral-600">Update assignment "{assignment.title}"</p>
            </div>
          </div>
        </div>

        {/* Course Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-soft mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <div className="text-primary-600 text-xl">📚</div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">{course.title}</h3>
              <p className="text-neutral-600">{course.category} • {course.level}</p>
            </div>
          </div>
        </div>

        {/* Assignment Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-soft p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Assignment Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter assignment title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Assignment Type *
              </label>
              <select
                name="assignmentType"
                value={formData.assignmentType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="homework">📚 Homework</option>
                <option value="project">🎯 Project</option>
                <option value="quiz">📝 Quiz</option>
                <option value="assessment">📊 Assessment</option>
                <option value="reading">📖 Reading</option>
                <option value="discussion">💬 Discussion</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief description of the assignment"
                required
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Instructions *
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Detailed instructions for students"
                required
              />
            </div>

            {/* Due Date and Points */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Due Date *
              </label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Points *
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleInputChange}
                min="1"
                max="1000"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Weight (%) *
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Submission Type *
              </label>
              <select
                name="submissionType"
                value={formData.submissionType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="file">📁 File Upload</option>
                <option value="text">✏️ Text Input</option>
                <option value="multiple-choice">☑️ Multiple Choice</option>
                <option value="link">🔗 Link/URL</option>
                <option value="none">❌ No Submission</option>
              </select>
            </div>

            {/* Late Submission Settings */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="allowLateSubmission"
                    checked={formData.allowLateSubmission}
                    onChange={handleInputChange}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">Allow Late Submissions</span>
                </label>
              </div>
              
              {formData.allowLateSubmission && (
                <div className="mt-4 ml-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Late Penalty (% per day)
                  </label>
                  <input
                    type="number"
                    name="latePenalty"
                    value={formData.latePenalty}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => navigate(`/tutor/courses/${courseId}/assignments/${assignmentId}`)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Assignment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssignment;
