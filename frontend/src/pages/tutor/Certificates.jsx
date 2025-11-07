import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaDownload, 
  FaUpload,
  FaFileAlt,
  FaSearch,
  FaFilter,
  FaTimes,
  FaSave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserGraduate,
  FaCertificate,
  FaCalendarAlt,
  FaBookOpen,
  FaStar,
  FaPrint,
  FaShare,
  FaEnvelope,
  FaSpinner
} from 'react-icons/fa';
import { 
  getTutorCertificates,
  generateCertificate,
  getTutorCourses,
  getTutorLearners
} from '../../services/tutorService';
import { apiService } from '../../services/api';
import TutorKycRequired from '../../components/common/TutorKycRequired';

const TutorCertificates = () => {
  
  const { user } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState('all');
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [projectSubmissions, setProjectSubmissions] = useState([]);
  const [learnerSubmissions, setLearnerSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    requirements: '',
    deadline: '',
    courseId: ''
  });
  const [courses, setCourses] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [review, setReview] = useState({
    status: 'approved',
    grade: '',
    feedback: ''
  });
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [certificateForm, setCertificateForm] = useState({
    studentName: '',
    studentEmail: '',
    courseName: '',
    grade: '',
    completionDate: '',
    notes: ''
  });

  const kycStatusRaw = (user?.tutorProfile?.kycStatus || user?.accountStatus || 'pending').toString().toLowerCase();
  const isKycApproved = ['approved', 'active'].includes(kycStatusRaw);

  // No mock data - using real API calls only

  // Helper function to get auth token
  const getAuthToken = () => {
    // Get tab ID for tab-specific storage
    const getTabId = () => {
      let tabId = sessionStorage.getItem('skilllift_tab_id');
      if (!tabId) {
        tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('skilllift_tab_id', tabId);
      }
      return tabId;
    };

    const getStorageKey = (key) => {
      const tabId = getTabId();
      return `skilllift_${tabId}_${key}`;
    };

    // Try tab-specific sessionStorage first (current auth system)
    const sessionToken = sessionStorage.getItem(getStorageKey('token'));
    if (sessionToken) {
      console.log('🔑 Found tab-specific token');
      return sessionToken;
    }
    
    // Try to get from user data
    const userData = sessionStorage.getItem(getStorageKey('user'));
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.token) {
          console.log('🔑 Found token in user data');
          return user.token;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Fallback to localStorage (old system)
    const localToken = localStorage.getItem('token');
    if (localToken) {
      console.log('🔑 Found localStorage token');
      return localToken;
    }
    
    console.log('❌ No token found');
    return null;
  };

  // Load data functions
  const loadCertificates = async () => {
    if (!isKycApproved) {
      return;
    }
    try {
      setLoading(true);
      const response = await apiService.get('/certificates/tutor');
      if (response.data.success) {
        setCertificates(response.data.certificates || []);
      } else {
        setCertificates([]);
      }
    } catch (error) {
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectSubmissions = async () => {
    if (!isKycApproved) {
      return;
    }
    try {
      const response = await apiService.get('/project-submissions/tutor-projects');
      if (response.data.success) {
        setProjectSubmissions(response.data.projects || []);
      } else {
        setProjectSubmissions([]);
      }
    } catch (error) {
      setProjectSubmissions([]);
    }
  };

  const loadLearnerSubmissions = async () => {
    if (!isKycApproved) {
      return;
    }
    try {
      console.log('🔄 Loading learner submissions...');
      const response = await apiService.get('/project-submissions/tutor');
      if (response.data.success) {
        console.log('✅ Learner submissions loaded:', response.data);
        setLearnerSubmissions(response.data.submissions || []);
      } else {
        console.log('⚠️ No learner submissions found');
        setLearnerSubmissions([]);
      }
    } catch (error) {
      console.error('❌ Error loading learner submissions:', error);
      setLearnerSubmissions([]);
    }
  };

  const loadCourses = async () => {
    if (!isKycApproved) {
      return;
    }
    try {
      console.log('🔄 Loading tutor courses...');
      const response = await getTutorCourses();
      if (response.success) {
        console.log('✅ Tutor courses loaded:', response.data);
        setCourses(response.data.map(course => ({
          id: course._id,
          title: course.title
        })));
      } else {
        console.log('⚠️ No courses found, using empty array');
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      // Use empty array instead of mock data
      setCourses([]);
    }
  };

  const loadEnrolledStudents = async () => {
    if (!isKycApproved) {
      return;
    }
    try {
      console.log('🔄 Loading enrolled students...');
      const response = await getTutorLearners();
      if (response.success) {
        console.log('✅ Enrolled students loaded:', response.data);
        setEnrolledStudents(response.data);
      } else {
        console.log('⚠️ No enrolled students found');
        setEnrolledStudents([]);
      }
    } catch (error) {
      console.error('❌ Error loading enrolled students:', error);
      setEnrolledStudents([]);
    }
  };

  // Load data
  useEffect(() => {
    if (!isKycApproved) {
      setCertificates([]);
      setFilteredCertificates([]);
      setCourses([]);
      setEnrolledStudents([]);
      setProjectSubmissions([]);
      setLearnerSubmissions([]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      await Promise.all([
        loadCertificates(),
        loadProjectSubmissions(),
        loadLearnerSubmissions(),
        loadCourses(),
        loadEnrolledStudents()
      ]);
    };
    
    loadData();
  }, [isKycApproved]); // Re-run when KYC status changes

  const handleProjectReview = async () => {
    try {
      console.log('🔄 Submitting project review...');
      console.log('🔍 Selected submission:', selectedSubmission);
      console.log('🔍 Submission ID:', selectedSubmission?.id);
      console.log('🔍 Submission _id:', selectedSubmission?._id);
      
      if (!selectedSubmission) {
        alert('Please select a submission to review');
        return;
      }

      // Use id or _id as fallback
      const submissionId = selectedSubmission.id || selectedSubmission._id;
      console.log('🔍 Using submission ID for review:', submissionId);

      console.log('🔍 Sending review data:', review);
      
      const response = await apiService.put(`/project-submissions/${submissionId}/review`, review);

      if (response.data.success) {
        console.log('✅ Review submitted successfully:', response.data);
        alert('Review submitted successfully!');
        // Reload project submissions
        loadProjectSubmissions();
      } else {
        console.error('❌ Error submitting review:', response.data);
        alert(`Error submitting review: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      alert('Error submitting review');
    }
  };

  const handleGenerateProjectCertificate = async (submissionId) => {
    try {
      // Use id or _id as fallback
      const finalSubmissionId = submissionId || selectedSubmission?.id || selectedSubmission?._id;
      
      // Pre-fill the form with submission data
      if (selectedSubmission) {
        // Find the learner's email from enrolled students
        let learnerEmail = '';
        const learner = enrolledStudents.find(student => 
          student.name === selectedSubmission.learnerName
        );
        if (learner) {
          learnerEmail = learner.email;
        }
        
        setCertificateForm({
          studentName: selectedSubmission.learnerName || '',
          studentEmail: learnerEmail,
          courseName: selectedSubmission.courseName || '',
          grade: review.grade || '',
          completionDate: new Date().toISOString().split('T')[0],
          notes: review.feedback || ''
        });
      }
      
      // Show the certificate form modal
      setShowCertificateForm(true);
    } catch (error) {
      alert('Error opening certificate form');
    }
  };

  const handleSubmitCertificateForm = async () => {
    try {
      console.log('🔄 Submitting certificate form:', certificateForm);
      
      // Validate required fields
      if (!certificateForm.studentName || !certificateForm.courseName) {
        alert('Please fill in all required fields (Student Name, Course)');
        return;
      }

      // Check authentication
      const token = getAuthToken();
      if (!token) {
        alert('You must be logged in to generate a certificate. Please log in and try again.');
        return;
      }

      // Call the backend API to generate certificate
      const response = await apiService.post('/certificates', certificateForm);

      if (response.data.success) {
        console.log('✅ Certificate generated successfully:', response.data);
        alert('Certificate generated successfully!');
        // Close modal and reload certificates
        setShowCertificateForm(false);
        setCertificateForm({
          studentName: '',
          studentEmail: '',
          courseName: '',
          grade: '',
          completionDate: '',
          notes: ''
        });
        loadCertificates();
      } else {
        console.error('❌ Error generating certificate:', response.data);
        alert(`Error generating certificate: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error generating certificate:', error);
      alert('Error generating certificate');
    }
  };

  const handleGenerateCertificate = async (formData) => {
    try {
      console.log('🔄 Generating certificate:', formData);
      
      // Check authentication
      const token = getAuthToken();
      if (!token) {
        alert('You must be logged in to generate a certificate. Please log in and try again.');
        return;
      }

      // Validate required fields
      if (!formData.studentName || !formData.courseName) {
        alert('Please fill in all required fields (Student Name, Course)');
        return;
      }

      // Call the backend API to generate certificate
      const response = await apiService.post('/certificates', formData);

      if (response.data.success) {
        console.log('✅ Certificate generated successfully:', response.data);
        alert('Certificate generated successfully!');
        // Close modal and reload certificates
        setShowCreateModal(false);
        loadCertificates();
      } else {
        console.error('❌ Error generating certificate:', response.data);
        alert(`Error generating certificate: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error generating certificate:', error);
      alert('Error generating certificate');
    }
  };

  const handleCreateProject = async () => {
    try {
      console.log('🔄 Creating project:', newProject);
      
      // Check authentication
      const token = getAuthToken();
      console.log('🔑 Auth token:', token ? 'Found' : 'Not found');
      
      // Debug: Check all possible token locations
      console.log('🔍 Debug - Checking all token locations:');
      console.log('🔍 sessionStorage keys:', Object.keys(sessionStorage));
      console.log('🔍 localStorage keys:', Object.keys(localStorage));
      
      // Check tab-specific storage
      const getTabId = () => {
        let tabId = sessionStorage.getItem('skilllift_tab_id');
        if (!tabId) {
          tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('skilllift_tab_id', tabId);
        }
        return tabId;
      };
      const getStorageKey = (key) => {
        const tabId = getTabId();
        return `skilllift_${tabId}_${key}`;
      };
      
      console.log('🔍 Tab ID:', getTabId());
      console.log('🔍 Token key:', getStorageKey('token'));
      console.log('🔍 User key:', getStorageKey('user'));
      console.log('🔍 Tab-specific token:', sessionStorage.getItem(getStorageKey('token')));
      console.log('🔍 Tab-specific user:', sessionStorage.getItem(getStorageKey('user')));
      
      if (!token) {
        alert('You must be logged in to create a project. Please log in and try again.');
        return;
      }
      
      // Validate required fields
      if (!newProject.title || !newProject.description || !newProject.courseId) {
        alert('Please fill in all required fields (Title, Description, Course)');
        return;
      }
      
      console.log('🔍 Selected course ID:', newProject.courseId);
      console.log('🔍 Available courses:', courses);

      // Call the backend API to create project
      const response = await apiService.post('/project-submissions', newProject);

      if (response.data.success) {
        console.log('✅ Project created successfully:', response.data);
        alert('Project created successfully!');
        setShowCreateProjectModal(false);
        setNewProject({
          title: '',
          description: '',
          requirements: '',
          deadline: '',
          courseId: ''
        });
        // Reload project submissions to show the new project
        loadProjectSubmissions();
      } else {
        console.error('❌ Error creating project:', response.data);
        alert(`Error creating project: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error creating project:', error);
      alert('Error creating project');
    }
  };

  // Use real data
  const displayCertificates = certificates;

  const courseOptions = ['all', ...courses.map(course => course.title)];
  const statuses = ['all', 'issued', 'pending', 'revoked'];
  const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

  useEffect(() => {
    filterCertificates();
  }, [searchQuery, selectedCourse, selectedStatus, certificates]);

  const filterCertificates = () => {
    let filtered = certificates;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(certificate =>
        certificate.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        certificate.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        certificate.verificationCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Course filter
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(certificate => certificate.courseName === selectedCourse);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(certificate => certificate.status === selectedStatus);
    }

    setFilteredCertificates(filtered);
  };

  const CertificateCard = ({ certificate }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-slate-100 p-6 hover:shadow-xl transition-all duration-300 w-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
            <FaCertificate className="text-primary-600 text-xl" />
        </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{certificate.studentName}</h3>
            <p className="text-slate-600 font-medium">{certificate.courseName}</p>
        </div>
      </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
            certificate.status === 'issued' ? 'bg-green-100 text-green-800 border-green-200' :
            certificate.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
            'bg-red-100 text-red-800 border-red-200'
          }`}>
            {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
          </span>
          </div>
        </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-slate-600">
          <FaCalendarAlt className="mr-2" />
          <span>Completed: {new Date(certificate.completionDate).toLocaleDateString()}</span>
          </div>
        <div className="flex items-center text-sm text-slate-600">
          <FaBookOpen className="mr-2" />
          <span>Certificate #: {certificate.certificateNumber}</span>
          </div>
        <div className="flex items-center text-sm text-slate-600">
          <FaStar className="mr-2" />
          <span>Grade: {certificate.grade}</span>
          </div>
        </div>

        {certificate.notes && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">{certificate.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedCertificate(certificate);
              setShowPreviewModal(true);
            }}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
          >
            <FaEye className="mr-2" />
            Preview
          </button>
          
          <button className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 border border-red-200 flex items-center">
            <FaTrash className="mr-2" />
            Delete
          </button>
        </div>
    </motion.div>
  );

  const CreateCertificateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-2xl font-bold text-slate-900">
            {editingCertificate ? 'Edit Certificate' : 'Generate New Certificate'}
          </h3>
          <button
            onClick={() => {
              setShowCreateModal(false);
              setEditingCertificate(null);
            }}
            className="text-slate-500 hover:text-slate-700"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        <div className="p-6">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Student Name *</label>
                <select
                  name="studentName"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  defaultValue={editingCertificate?.studentName || ''}
                >
                  <option value="">Select Enrolled Student</option>
                  {enrolledStudents.map(student => (
                    <option key={student._id} value={student.name}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
                {enrolledStudents.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    No enrolled students found. Students must be enrolled in your courses to generate certificates.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Student Email</label>
                <input
                  name="studentEmail"
                  type="email"
                  defaultValue={editingCertificate?.studentEmail || ''}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Email will be auto-filled when student is selected"
                  readOnly
                />
                <p className="text-xs text-slate-500 mt-1">
                  Email is automatically filled when you select a student above
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
                <select 
                  name="courseName"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Course</option>
                  {courseOptions.slice(1).map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Course Completion Date</label>
                <input
                  name="completionDate"
                  type="date"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Grade</label>
                <select 
                  name="grade"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Certificate Number</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Auto-generated"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
              <textarea
                name="notes"
                rows={4}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Add any additional notes or comments..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCertificate(null);
                }}
                className="flex-1 bg-slate-500 text-white py-3 rounded-lg font-bold hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  // Get form data from the form
                  const form = document.querySelector('form');
                  const formData = new FormData(form);
                  const certificateData = {
                    studentName: formData.get('studentName') || document.querySelector('select[name="studentName"]')?.value,
                    studentEmail: formData.get('studentEmail') || document.querySelector('input[name="studentEmail"]')?.value,
                    courseName: formData.get('courseName') || document.querySelector('select[name="courseName"]')?.value,
                    grade: formData.get('grade') || document.querySelector('select[name="grade"]')?.value,
                    completionDate: formData.get('completionDate') || document.querySelector('input[name="completionDate"]')?.value,
                    notes: formData.get('notes') || document.querySelector('textarea[name="notes"]')?.value
                  };
                  handleGenerateCertificate(certificateData);
                }}
                className="flex-1 bg-indigo-500 text-white py-3 rounded-lg font-bold hover:bg-indigo-600 transition-colors"
              >
                <FaSave className="mr-2 inline" />
                {editingCertificate ? 'Update Certificate' : 'Generate Certificate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const CertificatePreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-2xl font-bold text-slate-900">
            Certificate Preview - {selectedCertificate?.studentName}
          </h3>
          <button
            onClick={() => {
              setShowPreviewModal(false);
              setSelectedCertificate(null);
            }}
            className="text-slate-500 hover:text-slate-700"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-8 text-center">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Certificate of Completion</h1>
              <p className="text-lg text-slate-600">This is to certify that</p>
            </div>

            <div className="mb-6">
              <h2 className="text-3xl font-bold text-indigo-600 mb-2">{selectedCertificate?.studentName}</h2>
              <p className="text-lg text-slate-600">has successfully completed the course</p>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">{selectedCertificate?.courseName}</h3>
              <p className="text-lg text-slate-600">with a grade of <span className="font-bold text-indigo-600">{selectedCertificate?.grade}</span></p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-slate-600">Certificate Number</p>
              <p className="text-lg font-mono text-slate-900">{selectedCertificate?.certificateNumber}</p>
            </div>

            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaUserGraduate className="text-slate-600 text-xl" />
                </div>
                <p className="text-sm text-slate-600">Tutor Signature</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaCertificate className="text-slate-600 text-xl" />
                </div>
                <p className="text-sm text-slate-600">Platform Seal</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button className="flex-1 bg-indigo-500 text-white py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center">
              <FaPrint className="mr-2" />
              Print Certificate
            </button>
            <button className="flex-1 bg-emerald-500 text-white py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center">
              <FaDownload className="mr-2" />
              Download PDF
            </button>
            <button className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center justify-center">
              <FaEnvelope className="mr-2" />
              Email to Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isKycApproved) {
    return (
      <TutorKycRequired
        description="Your KYC must be approved before you can issue or manage certificates. Please complete your KYC verification and wait for admin approval."
        featureList={[
          'Generate certificates for learners',
          'Review and approve learner projects',
          'Download and share certified achievements'
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50">
      
      {/* Header */}
      <div className="bg-white shadow-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Certificates</h1>
              <p className="text-slate-600 text-lg">Generate and manage student certificates</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
              >
                <FaPlus className="mr-2" />
                Generate Certificate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
              >
                {courseOptions.map(course => (
                  <option key={course} value={course}>
                    {course === 'all' ? 'All Courses' : course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 focus:bg-white"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCourse('all');
                  setSelectedStatus('all');
                }}
                className="w-full bg-slate-500 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 mb-6">
          <div className="flex space-x-1 p-1">
            {['all', 'issued', 'pending', 'revoked', 'projects'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            {activeTab === 'projects' 
              ? `Showing ${learnerSubmissions.length} learner submissions`
              : `Showing ${filteredCertificates.length} of ${certificates.length} certificates`
            }
          </p>
        </div>

        {/* Project Review Section */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Enrolled Students Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">👥 Enrolled Students</h2>
              <p className="text-slate-600 mb-4">
                These are the students enrolled in your courses who can submit projects and receive certificates.
              </p>
              
              {enrolledStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrolledStudents.map(student => (
                    <div key={student._id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-sm">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {student.email}
                          </p>
                          <p className="text-xs text-indigo-600 mt-1">
                            {student.courses?.length || 0} course(s) enrolled
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-400 text-4xl mb-2">👥</div>
                  <p className="text-slate-500">No enrolled students found</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Students need to enroll in your courses to appear here
                  </p>
                </div>
              )}
            </div>

            {/* Create Project Button */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">📋 Project Management</h2>
                  <p className="text-slate-600 mt-1">Create projects for your courses and review submissions</p>
                </div>
                <button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center"
                >
                  <FaPlus className="mr-2" />
                  Create Project
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Submissions List */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">📝 Project Submissions</h3>
                <div className="space-y-4">
                  {learnerSubmissions.map((submission) => (
                    <div
                      key={submission.id || submission._id}
                      onClick={() => {
                        console.log('🔍 Clicking submission:', submission);
                        console.log('🔍 Submission ID:', submission.id);
                        console.log('🔍 Submission _id:', submission._id);
                        setSelectedSubmission(submission);
                      }}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        (selectedSubmission?.id === submission.id) || (selectedSubmission?._id === submission._id)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{submission.projectTitle}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {submission.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{submission.learnerName} • {submission.courseName}</p>
                      <p className="text-sm text-slate-500">{submission.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Panel */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">📋 Review Submission</h3>
                {selectedSubmission ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-900">{selectedSubmission.projectTitle}</h4>
                      <p className="text-sm text-slate-600">{selectedSubmission.learnerName}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                      <select
                        value={review.status}
                        onChange={(e) => setReview(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Grade</label>
                      <select
                        value={review.grade}
                        onChange={(e) => setReview(prev => ({ ...prev, grade: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select Grade</option>
                        {grades.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Feedback</label>
                      <textarea
                        value={review.feedback}
                        onChange={(e) => setReview(prev => ({ ...prev, feedback: e.target.value }))}
                        rows={4}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Provide detailed feedback..."
                      />
                    </div>

                    {selectedSubmission.githubLink && (
                      <div>
                        <a
                          href={selectedSubmission.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          View Repository
                        </a>
                      </div>
                    )}

                    {selectedSubmission.liveDemoLink && (
                      <div>
                        <a
                          href={selectedSubmission.liveDemoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          View Demo
                        </a>
                      </div>
                    )}

                    <div>
                      {review.status === 'approved' ? (
                        <button
                          onClick={() => handleGenerateProjectCertificate(selectedSubmission.id || selectedSubmission._id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Generate Certificate
                        </button>
                      ) : review.status === 'rejected' ? (
                        <div className="space-y-2">
                          <button
                            onClick={handleProjectReview}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Submit Rejection
                          </button>
                          <p className="text-sm text-red-600">
                            This project will be marked as rejected and the learner will need to resubmit.
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={handleProjectReview}
                          className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                        >
                          Submit Review
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500">
                    <FaFileAlt className="text-4xl mx-auto mb-2" />
                    <p>Select a submission to review</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Certificates Grid */}
        {activeTab !== 'projects' && (loading ? (
          <div className="bg-white rounded-xl shadow-md border border-slate-100 text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Loading certificates...</h3>
            <p className="text-slate-600 text-lg">Please wait while we fetch the data.</p>
          </div>
        ) : filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-slate-100 text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCertificate className="text-4xl text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No certificates found</h3>
            <p className="text-slate-600 text-lg">Try adjusting your search or filters</p>
          </div>
        ))}

      {/* Create/Edit Certificate Modal */}
      {showCreateModal && <CreateCertificateModal />}

      {/* Certificate Preview Modal */}
      {showPreviewModal && selectedCertificate && <CertificatePreviewModal />}

        {/* Create Project Modal */}
        {showCreateProjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-2xl font-bold text-slate-900">Create New Project</h3>
                <button
                  onClick={() => setShowCreateProjectModal(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              
              <div className="p-6">
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Course *</label>
                    <select
                      value={newProject.courseId}
                      onChange={(e) => setNewProject(prev => ({ ...prev, courseId: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select Course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                    {courses.length === 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        No courses available. Please create a course first.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Project Title *</label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter project title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe the project requirements and objectives"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Requirements</label>
                    <textarea
                      value={newProject.requirements}
                      onChange={(e) => setNewProject(prev => ({ ...prev, requirements: e.target.value }))}
                      rows={3}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="List specific requirements and deliverables"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Deadline (Optional)</label>
                    <input
                      type="date"
                      value={newProject.deadline}
                      onChange={(e) => setNewProject(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateProjectModal(false)}
                      className="flex-1 bg-slate-500 text-white py-3 rounded-lg font-bold hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateProject}
                      className="flex-1 bg-indigo-500 text-white py-3 rounded-lg font-bold hover:bg-indigo-600 transition-colors"
                    >
                      <FaSave className="mr-2 inline" />
                      Create Project
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Form Modal */}
        {showCertificateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-2xl font-bold text-slate-900">Generate Certificate</h3>
                <button
                  onClick={() => setShowCertificateForm(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              
              <div className="p-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Student Name *</label>
                      <input
                        type="text"
                        value={certificateForm.studentName}
                        onChange={(e) => setCertificateForm(prev => ({ ...prev, studentName: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter student name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Student Email</label>
                      <input
                        type="email"
                        value={certificateForm.studentEmail}
                        onChange={(e) => setCertificateForm(prev => ({ ...prev, studentEmail: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter student email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Course *</label>
                      <input
                        type="text"
                        value={certificateForm.courseName}
                        onChange={(e) => setCertificateForm(prev => ({ ...prev, courseName: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter course name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Course Completion Date</label>
                      <input
                        type="date"
                        value={certificateForm.completionDate}
                        onChange={(e) => setCertificateForm(prev => ({ ...prev, completionDate: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Grade</label>
                      <select
                        value={certificateForm.grade}
                        onChange={(e) => setCertificateForm(prev => ({ ...prev, grade: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select Grade</option>
                        {grades.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Certificate Number</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Auto-generated"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                    <textarea
                      value={certificateForm.notes}
                      onChange={(e) => setCertificateForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Add any additional notes or comments..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCertificateForm(false)}
                      className="flex-1 bg-slate-500 text-white py-3 rounded-lg font-bold hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitCertificateForm}
                      className="flex-1 bg-indigo-500 text-white py-3 rounded-lg font-bold hover:bg-indigo-600 transition-colors"
                    >
                      <FaSave className="mr-2 inline" />
                      Generate Certificate
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorCertificates;