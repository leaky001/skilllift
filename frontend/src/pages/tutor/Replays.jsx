import React, { useState, useEffect } from 'react';
import { FaUpload, FaVideo, FaPlay, FaSpinner, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getTutorCourses } from '../../services/tutorService';
import apiService from '../../services/api';

const TutorReplays = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [replays, setReplays] = useState([]);
  const [replaysLoading, setReplaysLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    topic: '',
    replayFile: null
  });

  // Load tutor's courses and replays on component mount
  useEffect(() => {
    loadCourses();
    loadReplays();
  }, []);

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      console.log('🔄 Loading tutor courses for replays...');
      console.log('👤 Current user:', user);
      console.log('🔑 Token check:', token ? 'Present' : 'Missing');
      
      const response = await getTutorCourses();
      console.log('📚 Courses response:', response);
      
      if (response.success) {
        const courseData = response.data || [];
        console.log('✅ Courses loaded successfully:', courseData);
        console.log('📊 Number of courses:', courseData.length);
        setCourses(courseData);
      } else {
        console.error('❌ Failed to load courses:', response.message);
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadReplays = async () => {
    try {
      setReplaysLoading(true);
      console.log('🔄 Loading tutor replays...');
      const { data: result } = await apiService.get('/tutor/replays');
      if (result.success) {
        setReplays(result.data || []);
        console.log('✅ Replays loaded successfully:', result.data?.length || 0, 'replays');
      } else {
        console.error('❌ Failed to load replays:', result.message);
        setReplays([]);
      }
    } catch (error) {
      console.error('❌ Error loading replays:', error);
      setReplays([]);
    } finally {
      setReplaysLoading(false);
    }
  };

  const handleDeleteReplay = async (replayId) => {
    try {
      const { data: result } = await apiService.delete(`/tutor/replays/${replayId}`);
      if (result.success) {
        alert('Replay deleted successfully!');
        loadReplays(); // Reload the replays list
      } else {
        alert('Failed to delete replay: ' + result.message);
      }
    } catch (error) {
      console.error('❌ Error deleting replay:', error);
      alert('Failed to delete replay. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseId || !formData.topic || !formData.replayFile) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Uploading replay:', formData);
      
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('courseId', formData.courseId);
      uploadData.append('topic', formData.topic);
      uploadData.append('replayFile', formData.replayFile);

      // Upload to the API endpoint
      console.log('🔑 Token from useAuth:', token ? 'Present' : 'Missing');
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'None');
      console.log('🔑 Full Authorization header:', `Bearer ${token}`);
      
      const { data: result } = await apiService.post('/tutor/replays/upload', uploadData);
      console.log('📡 Upload result:', result);
      if (!result?.success) throw new Error(result?.message || 'Upload failed');
      
      console.log('✅ Replay uploaded successfully');
      alert('Replay uploaded successfully! Students will be notified.');
      
      // Reset form and reload replays
      setFormData({
        courseId: '',
        topic: '',
        replayFile: null
      });
      loadReplays(); // Reload the replays list
    } catch (error) {
      console.error('❌ Error uploading replay:', error);
      alert('Failed to upload replay. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Class Replays</h1>
          <p className="text-slate-600">Upload and manage your live class recordings</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
            <FaUpload className="mr-2 text-primary-600" />
            Upload New Replay
          </h2>
          
          {courses.length === 0 && !coursesLoading && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                <strong>No courses found!</strong> You need to create at least one course before you can upload replays. 
                <a href="/tutor/courses/create" className="text-amber-600 hover:text-amber-700 underline ml-1">
                  Create your first course here
                </a>
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Course *
                </label>
                {coursesLoading ? (
                  <div className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2 text-primary-600" />
                    <span className="text-slate-600">Loading your courses...</span>
                  </div>
                ) : (
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  >
                    <option value="">Choose a course...</option>
                    {courses.length === 0 ? (
                      <option disabled>No courses found. Create a course first.</option>
                    ) : (
                      courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title} ({course.status === 'published' ? 'Published' : 'Draft'})
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What topic did you cover? *
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g., Introduction to React Hooks, CSS Grid Layout..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload Video File *
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  id="replayFile"
                  accept="video/*"
                  onChange={(e) => setFormData(prev => ({ ...prev, replayFile: e.target.files[0] }))}
                  className="hidden"
                />
                <label htmlFor="replayFile" className="cursor-pointer">
                  <FaUpload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    {formData.replayFile ? 'Change Video File' : 'Click to upload video'}
                  </p>
                  <p className="text-xs text-slate-500">
                    MP4, AVI, MOV, WMV up to 2GB
                  </p>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || coursesLoading || courses.length === 0}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload className="mr-2" />
                    Upload Replay
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Replays */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
            <FaPlay className="mr-2 text-secondary-600" />
            Your Replays ({replays.length})
          </h2>
          
          {replaysLoading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin mr-3 text-primary-600" />
              <span className="text-slate-600">Loading replays...</span>
            </div>
          ) : replays.length === 0 ? (
            <div className="text-center py-12">
              <FaVideo className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No replays yet</h3>
              <p className="text-slate-600">Upload your first replay to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {replays.map((replay) => (
                <div key={replay._id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                        {replay.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">{replay.course?.title}</p>
                    </div>
                    <div className="ml-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        replay.status === 'ready' ? 'bg-green-100 text-green-800' :
                        replay.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        replay.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {replay.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-500 mb-3">
                    <div className="flex items-center justify-between">
                      <span>Uploaded: {new Date(replay.uploadDate).toLocaleDateString()}</span>
                      <span>{replay.viewCount || 0} views</span>
                    </div>
                    {replay.fileSize && (
                      <div className="mt-1">
                        Size: {(replay.fileSize / (1024 * 1024)).toFixed(1)} MB
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // Construct proper URL for backend server
                        // Remove leading slash if present to avoid double slashes
                        const cleanFileUrl = replay.fileUrl.startsWith('/') 
                          ? replay.fileUrl.substring(1) 
                          : replay.fileUrl;
                        const videoUrl = `http://localhost:3001/${cleanFileUrl}`;
                        console.log('🎥 Opening video URL:', videoUrl);
                        window.open(videoUrl, '_blank');
                      }}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      <FaPlay className="mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this replay?')) {
                          handleDeleteReplay(replay._id);
                        }
                      }}
                      className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  {replay.deleteAt && (
                    <div className="mt-2 text-xs text-amber-600">
                      Auto-deletes: {new Date(replay.deleteAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorReplays;