import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaUpload, 
  FaFileAlt, 
  FaTrash,
  FaPlus,
  FaTimes,
  FaSpinner,
  FaCalendarAlt,
  FaArrowLeft,
  FaCheckCircle
} from 'react-icons/fa';
import { showSuccess, showError, showWarning, showInfo } from '../../services/toastService.jsx';
import { getAssignment } from '../../services/assignmentService';
import { submitAssignment, getMySubmissions } from '../../services/assignmentSubmissionService';

const AssignmentSubmission = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState({
    content: '',
    files: [],
    links: [],
    submissionNotes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);

  useEffect(() => {
    loadAssignmentDetails();
  }, [assignmentId]);

  // Debug log for state changes
  useEffect(() => {
    console.log('🔄 State changed - alreadySubmitted:', alreadySubmitted);
  }, [alreadySubmitted]);

  const loadAssignmentDetails = async () => {
    try {
      setLoading(true);
      const response = await getAssignment(assignmentId);
      if (response.success) {
        setAssignment(response.data);
        // Load existing submission
        await loadExistingSubmission();
      } else {
        showError('Failed to load assignment details');
        navigate('/learner/assignments');
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      showError('Error loading assignment details');
      navigate('/learner/assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingSubmission = async () => {
    try {
      const response = await getMySubmissions();
      if (response.success) {
        const existingSub = response.data.find(sub => 
          sub.assignment._id === assignmentId || sub.assignment === assignmentId
        );
        if (existingSub) {
          setExistingSubmission(existingSub);
          setAlreadySubmitted(true);
          // Populate the form with existing submission data
          setSubmission({
            content: existingSub.content || '',
            files: existingSub.attachments || [],
            links: existingSub.links || [],
            submissionNotes: existingSub.submissionNotes || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading existing submission:', error);
    }
  };

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files);
    setSubmission(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setSubmission(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const addLink = () => {
    setSubmission(prev => ({
      ...prev,
      links: [...prev.links, { title: '', url: '', description: '' }]
    }));
  };

  const updateLink = (index, field, value) => {
    setSubmission(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeLink = (index) => {
    setSubmission(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!submission.content && submission.files.length === 0 && submission.links.length === 0) {
      showWarning('Please provide some content, files, or links for your submission');
      return;
    }

    try {
      setSubmitting(true);
      console.log('📤 Submitting assignment with data:', {
        assignmentId,
        content: submission.content,
        files: submission.files.length,
        links: submission.links.length,
        submissionNotes: submission.submissionNotes
      });
      
      const response = await submitAssignment({
        assignmentId,
        ...submission
      });

      console.log('📥 Submission response:', response);

      if (response.success) {
        console.log('✅ Submission successful, setting alreadySubmitted to true');
        showSuccess('Assignment submitted successfully!');
        setAlreadySubmitted(true);
        // Don't navigate away immediately, let user see the success state
      } else {
        if (response.alreadySubmitted || response.message === 'Assignment already submitted') {
          console.log('⚠️ Assignment already submitted, setting alreadySubmitted to true');
          showWarning('Assignment already submitted');
          setAlreadySubmitted(true);
        } else {
          showError(response.message || 'Failed to submit assignment');
        }
      }
    } catch (error) {
      console.error('❌ Error submitting assignment:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Show detailed error information
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        console.error('❌ Detailed validation errors:', error.response.data.errors);
        const errorMessages = error.response.data.errors.join(', ');
        showError(`Validation failed: ${errorMessages}`);
      } else if (error.response?.data?.message === 'Assignment already submitted') {
        console.log('⚠️ Assignment already submitted (from error), setting alreadySubmitted to true');
        showWarning('Assignment already submitted');
        setAlreadySubmitted(true);
      } else {
        showError('Error submitting assignment: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/learner/assignments')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back to Assignments</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
          <p className="text-gray-600">{assignment.course?.title}</p>
        </div>

        {/* Grade Details Section */}
        {existingSubmission && existingSubmission.status === 'graded' && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
              <FaCheckCircle className="mr-2" />
              Grade Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Score</h3>
                <p className="text-2xl font-bold text-green-600">
                  {existingSubmission.score}/{existingSubmission.maxScore || assignment.points}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Grade</h3>
                <p className="text-2xl font-bold text-green-600">
                  {existingSubmission.grade || 'N/A'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Status</h3>
                <p className="text-lg font-semibold text-green-600 capitalize">
                  {existingSubmission.status}
                </p>
              </div>
            </div>
            {existingSubmission.tutorFeedback && (
              <div className="mt-4 bg-white rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Tutor Feedback</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {existingSubmission.tutorFeedback}
                </p>
              </div>
            )}
            <div className="mt-4 text-sm text-green-700">
              <p>Submitted: {new Date(existingSubmission.submittedAt).toLocaleString()}</p>
              {existingSubmission.gradedAt && (
                <p>Graded: {new Date(existingSubmission.gradedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignment Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Description</h4>
                  <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Instructions</h4>
                  <p className="text-sm text-gray-600 mt-1">{assignment.instructions}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Due Date</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <FaCalendarAlt className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Points</h4>
                  <p className="text-sm text-gray-600 mt-1">{assignment.points} points</p>
                </div>

                {assignment.allowedFileTypes && assignment.allowedFileTypes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900">Allowed File Types</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {assignment.allowedFileTypes.map(type => (
                        <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {type.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {assignment.maxFileSize && (
                  <div>
                    <h4 className="font-medium text-gray-900">Max File Size</h4>
                    <p className="text-sm text-gray-600 mt-1">{assignment.maxFileSize}MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Submit Assignment</h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Text Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Content
                  </label>
                  <textarea
                    value={submission.content}
                    onChange={(e) => setSubmission(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your assignment content here..."
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Files
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop files here, or click to select files
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Choose Files
                    </label>
                  </div>

                  {/* File List */}
                  {submission.files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {submission.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FaFileAlt className="text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Links */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Links
                    </label>
                    <button
                      onClick={addLink}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <FaPlus className="inline mr-1" />
                      Add Link
                    </button>
                  </div>
                  
                  {submission.links.length > 0 && (
                    <div className="space-y-4">
                      {submission.links.map((link, index) => (
                        <div key={index} className="border border-gray-300 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Link Title
                              </label>
                              <input
                                type="text"
                                value={link.title}
                                onChange={(e) => updateLink(index, 'title', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="Enter link title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL
                              </label>
                              <input
                                type="url"
                                value={link.url}
                                onChange={(e) => updateLink(index, 'url', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="https://example.com"
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={link.description}
                              onChange={(e) => updateLink(index, 'description', e.target.value)}
                              rows={2}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="Brief description of the link"
                            />
                          </div>
                          <button
                            onClick={() => removeLink(index)}
                            className="mt-2 text-red-500 hover:text-red-700 text-sm"
                          >
                            <FaTrash className="inline mr-1" />
                            Remove Link
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submission Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Notes (Optional)
                  </label>
                  <textarea
                    value={submission.submissionNotes}
                    onChange={(e) => setSubmission(prev => ({ ...prev, submissionNotes: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional notes for your tutor..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => navigate('/learner/assignments')}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔘 Button clicked, alreadySubmitted:', alreadySubmitted);
                      handleSubmit();
                    }}
                    disabled={submitting || alreadySubmitted}
                    className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                      alreadySubmitted 
                        ? 'bg-green-500 text-white cursor-default' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : alreadySubmitted ? (
                      <>
                        <FaCheckCircle />
                        <span>Assignment Submitted</span>
                      </>
                    ) : (
                      <>
                        <FaUpload />
                        <span>Submit Assignment</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSubmission;
