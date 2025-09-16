import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  generateCertificate
} from '../../services/tutorService';
import { showSuccess, showError } from '../../services/toastService.jsx';

const TutorCertificates = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Load certificates data
  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await getTutorCertificates();
      if (response.success) {
        setCertificates(response.data || []);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      showError('Error loading certificates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (learnerId, courseId) => {
    try {
      setGenerating(true);
      const response = await generateCertificate(learnerId, courseId);
      if (response.success) {
        showSuccess('Certificate generated successfully');
        loadCertificates(); // Reload data
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      showError('Error generating certificate. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Default data for loading state
  const defaultCertificates = [
    {
      id: 1,
      studentName: 'Emma Wilson',
      studentEmail: 'emma.wilson@email.com',
      course: 'Advanced Makeup Artistry',
      courseCompletionDate: '2024-01-20',
      certificateNumber: 'CERT-2024-001',
      status: 'issued',
      issuedDate: '2024-01-21',
      score: 87,
      grade: 'B+',
      certificateUrl: 'https://example.com/certificates/emma-wilson-makeup.pdf',
      thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=200&fit=crop',
      isDownloaded: true,
      isEmailed: true,
      notes: 'Excellent performance in practical assignments. Strong foundation in makeup techniques.'
    }
  ];

  // Use real data or default for loading
  const displayCertificates = loading ? defaultCertificates : certificates;

  const courses = ['all', 'Advanced Makeup Artistry', 'Digital Marketing Mastery', 'Web Development Bootcamp'];
  const statuses = ['all', 'issued', 'pending', 'revoked'];
  const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

  const [filteredCertificates, setFilteredCertificates] = useState(certificates);

  useEffect(() => {
    filterCertificates();
  }, [searchQuery, selectedCourse, selectedStatus, certificates]);

  const filterCertificates = () => {
    let filtered = certificates;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(certificate =>
        certificate.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        certificate.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
        certificate.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Course filter
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(certificate => certificate.course === selectedCourse);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(certificate => certificate.status === selectedStatus);
    }

    setFilteredCertificates(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not issued';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'issued': 'bg-emerald-100 text-emerald-800',
      'pending': 'bg-amber-100 text-amber-800',
      'revoked': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-emerald-600';
    if (grade.startsWith('B')) return 'text-indigo-600';
    if (grade.startsWith('C')) return 'text-amber-600';
    if (grade.startsWith('D')) return 'text-orange-600';
    if (grade === 'F') return 'text-red-600';
    return 'text-slate-600';
  };

  const CertificateCard = ({ certificate }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative">
        <img 
          src={certificate.thumbnail} 
          alt={certificate.course}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(certificate.status)}`}>
            {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {certificate.grade}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{certificate.studentName}</h3>
            <p className="text-slate-600 mb-3">{certificate.course}</p>
            <p className="text-sm text-slate-500 mb-2">Certificate: {certificate.certificateNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-slate-600">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2 text-indigo-500" />
            <span>Completed: {formatDate(certificate.courseCompletionDate)}</span>
          </div>
          <div className="flex items-center">
            <FaStar className="mr-2 text-amber-500" />
            <span>Score: {certificate.score}/100</span>
          </div>
          <div className="flex items-center">
            <FaCertificate className="mr-2 text-emerald-500" />
            <span>Issued: {formatDate(certificate.issuedDate)}</span>
          </div>
          <div className="flex items-center">
            <FaUserGraduate className="mr-2 text-indigo-500" />
            <span className={getGradeColor(certificate.grade)}>Grade: {certificate.grade}</span>
          </div>
        </div>

        {certificate.notes && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">{certificate.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSelectedCertificate(certificate);
                setShowPreviewModal(true);
              }}
              className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <FaEye className="mr-2" />
              Preview
            </button>
            {certificate.status === 'pending' && (
              <button
                onClick={() => {
                  setEditingCertificate(certificate);
                  setShowCreateModal(true);
                }}
                className="flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <FaEdit className="mr-2" />
                Generate
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {certificate.status === 'issued' && (
              <>
                <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center">
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center">
                  <FaEnvelope className="mr-2" />
                  Email
                </button>
              </>
            )}
            <button className="bg-red-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors">
              <FaTrash />
            </button>
          </div>
        </div>
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Student Name</label>
                <input
                  type="text"
                  defaultValue={editingCertificate?.studentName || ''}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter student name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Student Email</label>
                <input
                  type="email"
                  defaultValue={editingCertificate?.studentEmail || ''}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter student email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option>Select Course</option>
                  {courses.slice(1).map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Course Completion Date</label>
                <input
                  type="date"
                  defaultValue={editingCertificate?.courseCompletionDate || ''}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Final Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={editingCertificate?.score || ''}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Grade</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Certificate Number</label>
                <input
                  type="text"
                  defaultValue={editingCertificate?.certificateNumber || ''}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Auto-generated"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Certificate Notes</label>
              <textarea
                rows={4}
                defaultValue={editingCertificate?.notes || ''}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Add any special notes or achievements..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Certificate Template</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option>Professional Certificate Template</option>
                <option>Academic Certificate Template</option>
                <option>Custom Certificate Template</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCertificate(null);
                }}
                className="flex-1 bg-slate-500 text-white py-3 rounded-lg font-medium hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
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
          <div className="bg-gradient-to-br from-amber-50 to-indigo-50 border-2 border-amber-200 rounded-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCertificate className="text-white text-4xl" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Certificate of Completion</h1>
              <p className="text-lg text-slate-600">This is to certify that</p>
            </div>

            <div className="mb-6">
              <h2 className="text-4xl font-bold text-indigo-900 mb-2">{selectedCertificate?.studentName}</h2>
              <p className="text-xl text-slate-700">has successfully completed the course</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-2">{selectedCertificate?.course}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-center">
              <div>
                <p className="text-sm text-slate-600">Completion Date</p>
                <p className="text-lg font-bold text-slate-900">{formatDate(selectedCertificate?.courseCompletionDate)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Final Score</p>
                <p className="text-lg font-bold text-slate-900">{selectedCertificate?.score}/100</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Grade</p>
                <p className={`text-lg font-bold ${getGradeColor(selectedCertificate?.grade)}`}>{selectedCertificate?.grade}</p>
              </div>
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Certificates</h1>
              <p className="text-slate-600 mt-1">Generate and manage student certificates</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-80"
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-600 transition-colors flex items-center"
              >
                <FaPlus className="mr-2" />
                Generate Certificate
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {courses.map(course => (
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
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="w-full bg-slate-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8">
          {['all', 'issued', 'pending', 'revoked'].map((tab) => (
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

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            Showing {filteredCertificates.length} of {certificates.length} certificates
          </p>
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="text-6xl text-slate-300 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">Loading certificates...</h3>
            <p className="text-slate-600">Please wait while we fetch the data.</p>
          </div>
        ) : filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredCertificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaCertificate className="text-6xl text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">No certificates found</h3>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Create/Edit Certificate Modal */}
      {showCreateModal && <CreateCertificateModal />}

      {/* Certificate Preview Modal */}
      {showPreviewModal && selectedCertificate && <CertificatePreviewModal />}
    </div>
  );
};

export default TutorCertificates;
