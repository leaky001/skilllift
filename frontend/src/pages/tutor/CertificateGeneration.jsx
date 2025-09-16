import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  FaCertificate, 
  FaUser, 
  FaCheckCircle, 
  FaTimes, 
  FaClock, 
  FaEye, 
  FaDownload, 
  FaCreditCard,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaGraduationCap,
  FaSpinner,
  FaExclamationTriangle,
  FaThumbsUp,
  FaThumbsDown,
  FaComments,
  FaFileAlt,
  FaStar,
  FaMoneyBillWave
} from 'react-icons/fa';

const TutorCertificateGeneration = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [certificateData, setCertificateData] = useState({
    studentName: '',
    studentEmail: '',
    courseTitle: '',
    completionDate: '',
    score: '',
    notes: ''
  });

  // Mock students data with course completion info
  useEffect(() => {
    const mockStudents = [
      {
        id: 1,
        name: 'Muiz Abass',
        email: 'muiz.abass@gmail.com',
        phone: '+234 801 234 5678',
        enrolledDate: '2024-01-15',
        courses: [
          {
            id: 1,
            title: 'Web Development Fundamentals',
            completionRate: 95,
            avgScore: 92,
            assignmentsCompleted: 8,
            totalAssignments: 8,
            liveClassesAttended: 6,
            totalLiveClasses: 6,
            replaysWatched: 10,
            totalReplays: 10,
            lastActive: '2 hours ago',
            certificateEligible: true,
            certificateStatus: 'not_generated'
          },
          {
            id: 2,
            title: 'React.js Complete Guide',
            completionRate: 88,
            avgScore: 87,
            assignmentsCompleted: 6,
            totalAssignments: 7,
            liveClassesAttended: 4,
            totalLiveClasses: 5,
            replaysWatched: 8,
            totalReplays: 9,
            lastActive: '1 day ago',
            certificateEligible: true,
            certificateStatus: 'pending_approval'
          }
        ]
      },
      {
        id: 2,
        name: 'Mistura Rokibat',
        email: 'mistura.rokibat@gmail.com',
        phone: '+234 802 345 6789',
        enrolledDate: '2024-01-20',
        courses: [
          {
            id: 1,
            title: 'Web Development Fundamentals',
            completionRate: 100,
            avgScore: 95,
            assignmentsCompleted: 8,
            totalAssignments: 8,
            liveClassesAttended: 6,
            totalLiveClasses: 6,
            replaysWatched: 10,
            totalReplays: 10,
            lastActive: '30 minutes ago',
            certificateEligible: true,
            certificateStatus: 'approved'
          }
        ]
      },
      {
        id: 3,
        name: 'Ridwan Idris',
        email: 'ridwan.idris@gmail.com',
        phone: '+234 803 456 7890',
        enrolledDate: '2023-12-10',
        courses: [
          {
            id: 1,
            title: 'Web Development Fundamentals',
            completionRate: 75,
            avgScore: 78,
            assignmentsCompleted: 6,
            totalAssignments: 8,
            liveClassesAttended: 4,
            totalLiveClasses: 6,
            replaysWatched: 7,
            totalReplays: 10,
            lastActive: '1 week ago',
            certificateEligible: false,
            certificateStatus: 'not_eligible'
          }
        ]
      }
    ];
    setStudents(mockStudents);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getCertificateStatusColor = (status) => {
    switch (status) {
      case 'not_generated':
        return 'bg-slate-100 text-slate-800';
      case 'pending_approval':
        return 'bg-amber-100 text-amber-800';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'not_eligible':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getCertificateStatusIcon = (status) => {
    switch (status) {
      case 'not_generated':
        return <FaCertificate className="w-4 h-4" />;
      case 'pending_approval':
        return <FaClock className="w-4 h-4" />;
      case 'approved':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <FaTimes className="w-4 h-4" />;
      case 'not_eligible':
        return <FaExclamationTriangle className="w-4 h-4" />;
      default:
        return <FaCertificate className="w-4 h-4" />;
    }
  };

  const handleGenerateCertificate = (student, course) => {
    console.log('🎯 Generating certificate for:', student.name, 'Course:', course.title);
    setSelectedStudent({ student, course });
    setCertificateData({
      studentName: student.name,
      studentEmail: student.email,
      courseTitle: course.title,
      completionDate: new Date().toISOString().split('T')[0],
      score: course.avgScore,
      notes: `Completed ${course.completionRate}% of course content with ${course.avgScore}% average score.`
    });
    setShowGenerateModal(true);
  };

  const handleSubmitCertificate = async () => {
    try {
      setLoading(true);
      
      console.log('📋 Certificate Data State:', certificateData);
      console.log('👤 Selected Student:', selectedStudent);
      
      // Simulate API call to generate certificate
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newCertificate = {
        id: Date.now(), // Generate unique ID
        studentId: selectedStudent.student.id,
        studentName: selectedStudent.student.name,
        studentEmail: selectedStudent.student.email,
        tutorId: user?.id, // Current tutor ID
        tutorName: user?.name || 'Current Tutor',
        courseId: selectedStudent.course.id,
        courseTitle: selectedStudent.course.title,
        completionDate: certificateData.completionDate,
        score: certificateData.score,
        notes: certificateData.notes,
        status: 'pending_approval',
        certificatePrice: 1500,
        currency: 'NGN',
        submittedDate: new Date().toISOString()
      };
      
      console.log('✅ Certificate generated successfully:', newCertificate);
      
      // IMPORTANT: No notification sent to student yet!
      // Only admin gets notified for review
      alert(`Certificate generated successfully for ${selectedStudent.student.name}! Admin will review and approve before student is notified.`);
      
      setShowGenerateModal(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudentDetails = (student) => {
    setSelectedStudent({ student });
    setShowStudentModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Certificate Generation</h1>
          <p className="text-slate-600">Generate certificates for students who have completed course requirements</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaFilter className="text-slate-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Students</option>
                <option value="eligible">Certificate Eligible</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{student.name}</h3>
                      <p className="text-slate-600">{student.email}</p>
                      <p className="text-sm text-slate-500">Enrolled: {student.enrolledDate}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewStudentDetails(student)}
                    className="px-4 py-2 text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors flex items-center"
                  >
                    <FaEye className="mr-2" />
                    View Details
                  </button>
                </div>

                {/* Courses */}
                <div className="space-y-4">
                  {student.courses.map((course) => (
                    <div key={course.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-slate-900">{course.title}</h4>
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getCertificateStatusColor(course.certificateStatus)}`}>
                          {getCertificateStatusIcon(course.certificateStatus)}
                          <span className="ml-2 capitalize">{course.certificateStatus.replace('_', ' ')}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{course.completionRate}%</div>
                          <div className="text-sm text-slate-600">Completion</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{course.avgScore}%</div>
                          <div className="text-sm text-slate-600">Avg Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">
                            {course.assignmentsCompleted}/{course.totalAssignments}
                          </div>
                          <div className="text-sm text-slate-600">Assignments</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">
                            {course.liveClassesAttended}/{course.totalLiveClasses}
                          </div>
                          <div className="text-sm text-slate-600">Live Classes</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                          Last active: {course.lastActive}
                        </div>
                        <div className="flex space-x-2">
                          {course.certificateEligible && course.certificateStatus === 'not_generated' && (
                            <button
                              onClick={() => handleGenerateCertificate(student, course)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                            >
                              <FaCertificate className="mr-2" />
                              Generate Certificate
                            </button>
                          )}
                          {course.certificateStatus === 'pending_approval' && (
                            <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm">
                              Awaiting Admin Approval
                            </span>
                          )}
                          {course.certificateStatus === 'approved' && (
                            <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg text-sm">
                              Ready for Student Payment
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Generate Certificate Modal */}
        {showGenerateModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">Generate Certificate</h3>
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Student Info */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                      <FaUser className="mr-2 text-indigo-600" />
                      Student Information (Auto-tracked)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={certificateData.studentName}
                          onChange={(e) => setCertificateData(prev => ({ ...prev, studentName: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-emerald-50"
                          readOnly
                        />
                        <p className="text-xs text-emerald-600 mt-1">✓ Automatically tracked from student selection</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={certificateData.studentEmail}
                          onChange={(e) => setCertificateData(prev => ({ ...prev, studentEmail: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-emerald-50"
                          readOnly
                        />
                        <p className="text-xs text-emerald-600 mt-1">✓ Automatically tracked from student selection</p>
                      </div>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Course Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                        <input
                          type="text"
                          value={certificateData.courseTitle}
                          onChange={(e) => setCertificateData(prev => ({ ...prev, courseTitle: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Completion Date</label>
                        <input
                          type="date"
                          value={certificateData.completionDate}
                          onChange={(e) => setCertificateData(prev => ({ ...prev, completionDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Final Score</label>
                        <input
                          type="number"
                          value={certificateData.score}
                          onChange={(e) => setCertificateData(prev => ({ ...prev, score: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
                    <textarea
                      value={certificateData.notes}
                      onChange={(e) => setCertificateData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add any additional notes about the student's performance..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowGenerateModal(false)}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitCertificate}
                      disabled={loading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FaCertificate className="mr-2" />
                          Generate Certificate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Details Modal */}
        {showStudentModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">Student Details</h3>
                  <button
                    onClick={() => setShowStudentModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Student Profile */}
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {selectedStudent.student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900">{selectedStudent.student.name}</h4>
                      <p className="text-slate-600">{selectedStudent.student.email}</p>
                      <p className="text-slate-500">{selectedStudent.student.phone}</p>
                    </div>
                  </div>

                  {/* Course Progress */}
                  <div className="space-y-4">
                    <h5 className="text-lg font-semibold text-slate-900">Course Progress</h5>
                    {selectedStudent.student.courses.map((course) => (
                      <div key={course.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="text-lg font-semibold text-slate-900">{course.title}</h6>
                          <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getCertificateStatusColor(course.certificateStatus)}`}>
                            {getCertificateStatusIcon(course.certificateStatus)}
                            <span className="ml-2 capitalize">{course.certificateStatus.replace('_', ' ')}</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-slate-900">{course.completionRate}%</div>
                            <div className="text-sm text-slate-600">Completion</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-slate-900">{course.avgScore}%</div>
                            <div className="text-sm text-slate-600">Avg Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-slate-900">
                              {course.assignmentsCompleted}/{course.totalAssignments}
                            </div>
                            <div className="text-sm text-slate-600">Assignments</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-slate-900">
                              {course.liveClassesAttended}/{course.totalLiveClasses}
                            </div>
                            <div className="text-sm text-slate-600">Live Classes</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorCertificateGeneration;
