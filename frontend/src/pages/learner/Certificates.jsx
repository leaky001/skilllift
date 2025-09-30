import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCertificate,
  FaDownload,
  FaEye,
  FaFileAlt,
  FaGithub,
  FaExternalLinkAlt,
  FaUpload,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaStar,
  FaCalendarAlt,
  FaUserGraduate,
  FaBookOpen,
  FaCode,
  FaGlobe
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

const LearnerCertificates = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('certificates');
  const [certificates, setCertificates] = useState([]);
  const [projectSubmissions, setProjectSubmissions] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [projectNotifications, setProjectNotifications] = useState([]);
  const [submission, setSubmission] = useState({
    title: '',
    description: '',
    githubLink: '',
    liveDemoLink: '',
    notes: '',
    files: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Starting to load data...');
      await Promise.all([
        loadCertificates(),
        loadProjectSubmissions(),
        loadAssignedProjects(),
        loadCourses(),
        loadProjectNotifications()
      ]);
      console.log('🔍 Finished loading data');
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectNotifications = async () => {
    try {
      const response = await apiService.get('/project-notifications/learner');
      if (response.data.success) {
        setProjectNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading project notifications:', error);
      setProjectNotifications([]);
    }
  };

  const loadCertificates = async () => {
    try {
      const response = await apiService.get('/certificates/learner');
      if (response.data.success) {
        setCertificates(response.data.certificates || []);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  const loadProjectSubmissions = async () => {
    try {
      const response = await apiService.get('/project-submissions/learner');
      if (response.data.success) {
        setProjectSubmissions(response.data.submissions || []);
      }
    } catch (error) {
      console.error('Error loading project submissions:', error);
    }
  };

  const loadAssignedProjects = async () => {
    try {
      const response = await apiService.get('/project-submissions/learner-assigned');
      if (response.data.success) {
        setAssignedProjects(response.data.projects || []);
      }
    } catch (error) {
      console.error('Error loading assigned projects:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await apiService.get('/courses/enrolled');
      if (response.data.success) {
        // Find courses that need project submission
        const coursesNeedingProjects = response.data.courses.filter(course => 
          course.isCompleted && !course.hasProjectSubmission
        );
        if (coursesNeedingProjects.length > 0) {
          setSelectedCourse(coursesNeedingProjects[0]);
        }
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      name: file.name,
      type: file.type,
      file: file
    }));
    setSubmission(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    
    if (!selectedProject || !submission.title || !submission.description) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', submission.title);
      formData.append('description', submission.description);
      formData.append('githubLink', submission.githubLink);
      formData.append('liveDemoLink', submission.liveDemoLink);
      formData.append('projectId', selectedProject.id || selectedProject._id);
      formData.append('courseId', selectedProject.courseId);

      // Upload files
      submission.files.forEach((fileObj, index) => {
        formData.append('files', fileObj.file);
      });

      const response = await apiService.upload('/project-submissions/submit', formData);
      
      if (response.data.success) {
        alert('Project submitted successfully!');
        setSubmission({
          title: '',
          description: '',
          githubLink: '',
          liveDemoLink: '',
          notes: '',
          files: []
        });
        setShowSubmissionModal(false);
        setSelectedProject(null);
        loadProjectSubmissions();
        loadAssignedProjects(); // Refresh assigned projects
      } else {
        alert(response.data.message || 'Failed to submit project');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Error submitting project');
    } finally {
      setSubmitting(false);
    }
  };

  const generateCertificate = (certificate) => {
    const certificateHTML = `
      <div style="text-align: center; padding: 40px; border: 3px solid #gold; background: #f9f9f9; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #333; font-size: 2.5em; margin-bottom: 20px;">🎓 Certificate of Completion</h1>
        
        <p style="font-size: 1.2em; color: #666; margin-bottom: 10px;">This certifies that</p>
        <h2 style="color: #2c5aa0; font-size: 2em; margin: 20px 0;">${certificate.learnerName}</h2>
        
        <p style="font-size: 1.2em; color: #666; margin-bottom: 10px;">has successfully completed the course</p>
        <h3 style="color: #2c5aa0; font-size: 1.5em; margin: 20px 0;">${certificate.courseName}</h3>
        
        <p style="font-size: 1.1em; color: #666; margin-bottom: 10px;">with the project</p>
        <h4 style="color: #333; font-size: 1.3em; margin: 15px 0;">${certificate.projectName}</h4>
        
        <p style="font-size: 1.1em; color: #666; margin-bottom: 10px;">taught by ${certificate.tutorName}</p>
        <p style="font-size: 1.1em; color: #666; margin-bottom: 10px;">Grade: ${certificate.grade}/100</p>
        <p style="font-size: 1.1em; color: #666; margin-bottom: 30px;">Completed on: ${certificate.completionDate}</p>
        
        <div style="border-top: 2px solid #ddd; padding-top: 20px; margin-top: 30px;">
          <p style="font-size: 12px; color: #666;">
            Verification Code: ${certificate.verificationCode}
          </p>
          <p style="font-size: 12px; color: #666;">
            This certificate can be verified at: ${window.location.origin}/verify/${certificate.id}
          </p>
        </div>
      </div>
    `;

    // Open in new window for printing
    const newWindow = window.open('', '_blank');
    newWindow.document.write(certificateHTML);
    newWindow.document.close();
    newWindow.print();
  };

  const CertificateCard = ({ certificate }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <FaCertificate className="text-white text-6xl" />
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {certificate.grade}/100
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{certificate.courseName}</h3>
          <p className="text-slate-600 mb-3">{certificate.projectName}</p>
          <p className="text-sm text-slate-500 mb-2">Certificate: {certificate.id}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-slate-600">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2 text-indigo-500" />
            <span>Completed: {new Date(certificate.completionDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <FaStar className="mr-2 text-amber-500" />
            <span>Grade: {certificate.grade}/100</span>
          </div>
          <div className="flex items-center">
            <FaCertificate className="mr-2 text-emerald-500" />
            <span>Issued: {new Date(certificate.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <FaUserGraduate className="mr-2 text-indigo-500" />
            <span>Tutor: {certificate.tutorName}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => generateCertificate(certificate)}
            className="flex-1 bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center"
          >
            <FaEye className="mr-2" />
            View Certificate
          </button>
          <button
            onClick={() => generateCertificate(certificate)}
            className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" />
            Download
          </button>
        </div>
      </div>
    </motion.div>
  );

  const ProjectSubmissionCard = ({ submission }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{submission.title}</h3>
            <p className="text-slate-600 mb-3">{submission.courseName}</p>
            <p className="text-sm text-slate-500">
              Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            submission.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
            submission.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
            submission.status === 'approved' ? 'bg-green-100 text-green-800' :
            submission.status === 'needs_revision' ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            {submission.status.replace('_', ' ')}
          </span>
        </div>

        <div className="mb-4">
          <p className="text-slate-700">{submission.description}</p>
        </div>

        <div className="space-y-2 mb-4">
          {submission.githubLink && (
            <div className="flex items-center">
              <FaGithub className="mr-2 text-slate-500" />
              <a href={submission.githubLink} target="_blank" rel="noopener noreferrer"
                 className="text-indigo-600 hover:text-indigo-700 flex items-center">
                View Repository <FaExternalLinkAlt className="ml-1 text-xs" />
              </a>
            </div>
          )}
          {submission.liveDemoLink && (
            <div className="flex items-center">
              <FaGlobe className="mr-2 text-slate-500" />
              <a href={submission.liveDemoLink} target="_blank" rel="noopener noreferrer"
                 className="text-indigo-600 hover:text-indigo-700 flex items-center">
                View Demo <FaExternalLinkAlt className="ml-1 text-xs" />
              </a>
            </div>
          )}
        </div>

        {submission.grade && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-medium">Grade:</span>
              <span className="text-lg font-bold text-indigo-600">{submission.grade}/100</span>
            </div>
            {submission.feedback && (
              <div className="mt-2">
                <p className="text-sm text-slate-600 font-medium">Feedback:</p>
                <p className="text-sm text-slate-700">{submission.feedback}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center">
          {submission.status === 'approved' ? (
            <div className="flex items-center text-green-600">
              <FaCheckCircle className="mr-2" />
              <span className="font-medium">Certificate Available!</span>
            </div>
          ) : submission.status === 'needs_revision' ? (
            <div className="flex items-center text-orange-600">
              <FaExclamationTriangle className="mr-2" />
              <span className="font-medium">Revision Required</span>
            </div>
          ) : (
            <div className="flex items-center text-blue-600">
              <FaClock className="mr-2" />
              <span className="font-medium">Under Review</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Certificates</h1>
              <p className="text-slate-600 mt-1">View your certificates and submit projects</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8">
          {['certificates', 'projects'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <FaSpinner className="text-6xl text-slate-300 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-medium text-slate-900 mb-2">Loading certificates...</h3>
                <p className="text-slate-600">Please wait while we fetch your certificates.</p>
              </div>
            ) : certificates.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {certificates.map((certificate) => (
                  <CertificateCard key={certificate.id} certificate={certificate} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaCertificate className="text-6xl text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-900 mb-2">No certificates yet</h3>
                <p className="text-slate-600">Complete courses and submit projects to earn certificates</p>
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            {/* Assigned Projects */}
            {console.log('🔍 Rendering assigned projects:', assignedProjects.length, assignedProjects)}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">📋 Assigned Projects</h2>
              <div className="mb-4 text-sm text-slate-600">
                Debug: Found {assignedProjects.length} assigned projects
              </div>
              {assignedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assignedProjects.map((project, index) => (
                    <div key={`project-${project.id}-${index}`} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-slate-900 text-lg">{project.title}</h3>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Active
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{project.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-slate-500">
                          <span className="font-medium">Course:</span>
                          <span className="ml-2">{project.courseName}</span>
                        </div>
                        <div className="flex items-center text-slate-500">
                          <span className="font-medium">Tutor:</span>
                          <span className="ml-2">{project.tutorName}</span>
                        </div>
                        {project.deadline && (
                          <div className="flex items-center text-slate-500">
                            <span className="font-medium">Deadline:</span>
                            <span className="ml-2">{new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center text-slate-500">
                          <span className="font-medium">Assigned:</span>
                          <span className="ml-2">{new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium text-slate-900 mb-2">Requirements:</h4>
                        <p className="text-slate-600 text-sm">{project.requirements}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setShowSubmissionModal(true);
                          }}
                          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                          📝 Submit Project
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-400 text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No assigned projects</h3>
                  <p className="text-slate-600">Your tutor hasn't assigned any projects yet.</p>
                </div>
              )}
            </div>

            {/* Project Notifications */}
            {projectNotifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">🔔 Project Notifications</h2>
                <div className="space-y-3">
                  {projectNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        notification.isRead 
                          ? 'bg-slate-50 border-slate-300' 
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-medium ${
                            notification.isRead ? 'text-slate-700' : 'text-blue-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className={`text-sm mt-1 ${
                            notification.isRead ? 'text-slate-600' : 'text-blue-700'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center mt-2 space-x-4 text-xs text-slate-500">
                            <span>Course: {notification.courseName}</span>
                            <span>Project: {notification.projectTitle}</span>
                            {notification.deadline && (
                              <span>Deadline: {new Date(notification.deadline).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        {!notification.isRead && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Submission Form */}
            {selectedCourse && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">📝 Submit Project for Certificate</h2>
                <p className="text-slate-600 mb-6">
                  Complete your project for <strong>{selectedCourse.title}</strong> to earn your certificate.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Project Title *</label>
                    <input
                      type="text"
                      value={submission.title}
                      onChange={(e) => setSubmission(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter your project title"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Project Description *</label>
                    <textarea
                      value={submission.description}
                      onChange={(e) => setSubmission(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-slate-300 rounded-lg h-32 focus:ring-2 focus:ring-indigo-500"
                      placeholder="Describe your project, what you built, technologies used, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-2">GitHub Repository</label>
                      <input
                        type="url"
                        value={submission.githubLink}
                        onChange={(e) => setSubmission(prev => ({ ...prev, githubLink: e.target.value }))}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://github.com/username/project-name"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-2">Live Demo Link</label>
                      <input
                        type="url"
                        value={submission.liveDemoLink}
                        onChange={(e) => setSubmission(prev => ({ ...prev, liveDemoLink: e.target.value }))}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://your-project-demo.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Upload Files</label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      accept=".zip,.pdf,.doc,.docx,.txt"
                    />
                    <p className="text-slate-500 text-sm mt-1">
                      Upload project files, documentation, screenshots, etc.
                    </p>
                  </div>

                  {/* Uploaded Files */}
                  {submission.files.length > 0 && (
                    <div>
                      <h3 className="text-slate-700 font-medium mb-2">Uploaded Files:</h3>
                      <div className="space-y-2">
                        {submission.files.map((file, index) => (
                          <div key={index} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                            <span className="text-slate-700">{file.name}</span>
                            <button
                              onClick={() => setSubmission(prev => ({
                                ...prev,
                                files: prev.files.filter((_, i) => i !== index)
                              }))}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSubmitProject}
                    disabled={submitting || !submission.title || !submission.description}
                    className="w-full bg-indigo-500 text-white py-3 rounded-lg font-medium hover:bg-indigo-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaUpload className="mr-2" />
                        Submit Project
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Project Submissions */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">📋 My Project Submissions</h2>
              {projectSubmissions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {projectSubmissions.map((submission) => (
                    <ProjectSubmissionCard key={submission.id} submission={submission} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                  <FaFileAlt className="text-6xl text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-900 mb-2">No project submissions yet</h3>
                  <p className="text-slate-600">Submit your first project to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Project Submission Modal */}
      {showSubmissionModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Submit Project</h2>
                <button
                  onClick={() => {
                    setShowSubmissionModal(false);
                    setSelectedProject(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Project Details */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-slate-900 mb-2">{selectedProject.title}</h3>
                <p className="text-slate-600 text-sm mb-2">{selectedProject.description}</p>
                <div className="text-sm text-slate-500">
                  <span className="font-medium">Course:</span> {selectedProject.courseName}
                </div>
              </div>

              {/* Submission Form */}
              <form onSubmit={handleSubmitProject} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={submission.title}
                    onChange={(e) => setSubmission({...submission, title: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your project title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    name="description"
                    value={submission.description}
                    onChange={(e) => setSubmission({...submission, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Describe your project implementation, features, and approach..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    GitHub Repository Link
                  </label>
                  <input
                    type="url"
                    name="githubLink"
                    value={submission.githubLink}
                    onChange={(e) => setSubmission({...submission, githubLink: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://github.com/username/repository"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Live Demo Link
                  </label>
                  <input
                    type="url"
                    name="demoLink"
                    value={submission.liveDemoLink}
                    onChange={(e) => setSubmission({...submission, liveDemoLink: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://your-demo-site.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={submission.notes || ''}
                    onChange={(e) => setSubmission({...submission, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Any additional information about your project..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmissionModal(false);
                      setSelectedProject(null);
                    }}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Submit Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerCertificates;
