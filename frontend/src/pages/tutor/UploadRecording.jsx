import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUpload, 
  FaVideo, 
  FaClock, 
  FaLink, 
  FaSave, 
  FaTimes, 
  FaCheckCircle,
  FaExternalLinkAlt,
  FaTrash,
  FaEdit
} from 'react-icons/fa';
import { uploadRecording, deleteRecording } from '../../services/liveClassService';
import { showSuccess, showError } from '../../services/toastService';

const UploadRecording = ({ liveClass, onRecordingAdded, onClose }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    duration: '',
    quality: 'HD',
    source: 'google-meet'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.url.trim()) {
      showError('Title and URL are required');
      return;
    }

    setLoading(true);
    try {
      const response = await uploadRecording(id, formData);
      showSuccess('Recording uploaded successfully!');
      
      if (onRecordingAdded) {
        onRecordingAdded(response.data.recording);
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        url: '',
        duration: '',
        quality: 'HD',
        source: 'google-meet'
      });
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      showError(error.message || 'Failed to upload recording');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecording = async (recordingId) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) {
      return;
    }

    try {
      await deleteRecording(id, recordingId);
      showSuccess('Recording deleted successfully');
      
      if (onRecordingAdded) {
        // Refresh recordings list
        window.location.reload();
      }
    } catch (error) {
      showError(error.message || 'Failed to delete recording');
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaVideo className="mr-3 text-blue-600" />
                Upload Recording
              </h1>
              <p className="text-gray-600 mt-1">
                Add recordings for: <span className="font-semibold">{liveClass?.title}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUpload className="mr-2 text-green-600" />
              Add New Recording
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recording Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Full Session Recording"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the recording content..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recording URL *
                </label>
                <div className="flex items-center">
                  <FaLink className="mr-2 text-gray-400" />
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://drive.google.com/file/d/... or https://youtube.com/watch?v=..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Paste the link to your Google Drive, YouTube, or other video platform
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="90"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality
                  </label>
                  <select
                    name="quality"
                    value={formData.quality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="HD">HD (1080p)</option>
                    <option value="FHD">Full HD (1440p)</option>
                    <option value="4K">4K (2160p)</option>
                    <option value="SD">SD (720p)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recording Source
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="google-meet">Google Meet</option>
                  <option value="zoom">Zoom</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="screen-recording">Screen Recording</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Upload Recording
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>

          {/* Existing Recordings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaVideo className="mr-2 text-purple-600" />
              Existing Recordings
            </h2>

            {liveClass?.recordings && liveClass.recordings.length > 0 ? (
              <div className="space-y-4">
                {liveClass.recordings.map((recording, index) => (
                  <div key={recording._id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {recording.title}
                        </h3>
                        {recording.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {recording.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <FaClock className="mr-1" />
                            {formatDuration(recording.duration)}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {recording.quality}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {recording.source}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <a
                          href={recording.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Recording"
                        >
                          <FaExternalLinkAlt />
                        </a>
                        <button
                          onClick={() => handleDeleteRecording(recording._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Recording"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaVideo className="text-4xl mx-auto mb-3 text-gray-300" />
                <p>No recordings uploaded yet</p>
                <p className="text-sm">Upload your first recording using the form</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <FaCheckCircle className="mr-2" />
            How to Upload Recordings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">For Google Meet:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Record your session in Google Meet</li>
                <li>Upload the recording to Google Drive</li>
                <li>Set sharing permissions to "Anyone with the link"</li>
                <li>Copy the shareable link and paste it here</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Screen Recording:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Use OBS, Loom, or similar software</li>
                <li>Upload to YouTube (unlisted) or Google Drive</li>
                <li>Copy the video URL</li>
                <li>Paste the link in the form above</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadRecording;
