import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FaUsers, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaDownload,
  FaEye,
  FaSearch,
  FaFilter,
  FaSort
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { showError, showSuccess } from '../../services/toastService.jsx';
import { getEnrolledStudents } from '../../services/liveClassService';

const EnrolledStudents = () => {
  const { sessionId } = useParams();
  const [students, setStudents] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadEnrolledStudents();
  }, [sessionId]);

  const loadEnrolledStudents = async () => {
    try {
      setLoading(true);
      const response = await getEnrolledStudents(sessionId);
      if (response.success) {
        setStudents(response.data.enrolledStudents);
        setSession(response.data.session);
      } else {
        showError('Failed to load enrolled students');
      }
    } catch (error) {
      console.error('Error loading enrolled students:', error);
      showError('Error loading enrolled students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || student.attendanceStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'enrollmentDate':
        return new Date(b.enrollmentDate) - new Date(a.enrollmentDate);
      case 'attendanceStatus':
        return a.attendanceStatus.localeCompare(b.attendanceStatus);
      case 'duration':
        return b.duration - a.duration;
      default:
        return 0;
    }
  });

  const getAttendanceStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <FaCheckCircle className="text-green-500" />;
      case 'late':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'absent':
        return <FaTimesCircle className="text-red-500" />;
      case 'left-early':
        return <FaExclamationTriangle className="text-orange-500" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const getAttendanceStatusText = (status) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'late':
        return 'Late';
      case 'absent':
        return 'Absent';
      case 'left-early':
        return 'Left Early';
      default:
        return 'Not Attended';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const exportAttendanceReport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Enrollment Date', 'Attendance Status', 'Join Time', 'Leave Time', 'Duration'],
      ...sortedStudents.map(student => [
        student.name,
        student.email,
        student.phone || 'N/A',
        new Date(student.enrollmentDate).toLocaleDateString(),
        getAttendanceStatusText(student.attendanceStatus),
        student.joinTime ? new Date(student.joinTime).toLocaleString() : 'N/A',
        student.leaveTime ? new Date(student.leaveTime).toLocaleString() : 'N/A',
        formatDuration(student.duration)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${session?.title}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showSuccess('Attendance report downloaded successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enrolled students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enrolled Students</h1>
              <p className="mt-2 text-gray-600">
                {session?.title} • {students.length} students enrolled
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportAttendanceReport}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <FaDownload className="text-sm" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* Session Info */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <FaUsers className="text-blue-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Total Enrolled</p>
                  <p className="text-lg font-semibold">{students.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="text-green-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Present</p>
                  <p className="text-lg font-semibold">
                    {students.filter(s => s.attendanceStatus === 'present').length}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaExclamationTriangle className="text-yellow-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Late/Absent</p>
                  <p className="text-lg font-semibold">
                    {students.filter(s => s.attendanceStatus === 'late' || s.attendanceStatus === 'absent').length}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaClock className="text-gray-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-500">Available Spots</p>
                  <p className="text-lg font-semibold">{session?.availableSpots || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="left-early">Left Early</option>
                  <option value="not-attended">Not Attended</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <FaSort className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="enrollmentDate">Sort by Enrollment Date</option>
                  <option value="attendanceStatus">Sort by Attendance</option>
                  <option value="duration">Sort by Duration</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {student.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={student.avatar}
                              alt={student.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <FaUser className="text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {student.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <FaEnvelope className="text-gray-400" />
                          <span>{student.email}</span>
                        </div>
                        {student.phone && (
                          <div className="flex items-center space-x-2 mt-1">
                            <FaPhone className="text-gray-400" />
                            <span className="text-sm text-gray-500">{student.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(student.enrollmentDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getAttendanceStatusIcon(student.attendanceStatus)}
                        <span className={`text-sm font-medium ${
                          student.attendanceStatus === 'present' ? 'text-green-800' :
                          student.attendanceStatus === 'late' ? 'text-yellow-800' :
                          student.attendanceStatus === 'absent' ? 'text-red-800' :
                          'text-gray-800'
                        }`}>
                          {getAttendanceStatusText(student.attendanceStatus)}
                        </span>
                      </div>
                      {student.joinTime && (
                        <div className="text-xs text-gray-500 mt-1">
                          Joined: {new Date(student.joinTime).toLocaleTimeString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDuration(student.duration)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                        <FaEye className="text-sm" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedStudents.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No students have enrolled in this session yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrolledStudents;
