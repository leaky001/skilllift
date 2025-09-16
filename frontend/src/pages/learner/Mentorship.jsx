import React, { useState, useEffect } from 'react';
import { 
  FaUserTie, 
  FaSearch, 
  FaFilter, 
  FaStar, 
  FaClock, 
  FaVideo, 
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaTwitter,
  FaBookOpen,
  FaGraduationCap,
  FaBriefcase,
  FaUsers,
  FaCheckCircle,
  FaTimes,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaThumbsUp,
  FaThumbsDown,
  FaComment,
  FaHeart
} from 'react-icons/fa';

const LearnerMentorship = () => {
  const [mentors, setMentors] = useState([]);
  const [myMentors, setMyMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('find');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // Mock mentors data
  useEffect(() => {
    const mockMentors = [
      {
        id: 1,
        name: 'Dr. Mistura Rokibat',
        title: 'Senior Software Engineer at Google',
        expertise: ['React', 'Node.js', 'System Design', 'Career Growth'],
        rating: 4.9,
        reviews: 127,
        hourlyRate: 150,
        currency: 'USD',
        experience: '8+ years',
        education: 'PhD Computer Science, Stanford',
        company: 'Google',
        location: 'San Francisco, CA',
        availability: 'Mon-Fri, 6-9 PM PST',
        languages: ['English', 'Spanish'],
        bio: 'Passionate software engineer with expertise in full-stack development and system architecture. I love helping developers grow their skills and advance their careers.',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        isAvailable: true,
        responseTime: '2 hours',
        totalSessions: 89,
        successRate: 98,
        verified: true,
        featured: true
      },
      {
        id: 2,
        name: 'Muiz Abass',
        title: 'UX/UI Design Lead at Airbnb',
        expertise: ['UI/UX Design', 'Figma', 'Design Systems', 'User Research'],
        rating: 4.8,
        reviews: 94,
        hourlyRate: 120,
        currency: 'USD',
        experience: '6+ years',
        education: 'MFA Design, Parsons',
        company: 'Airbnb',
        location: 'New York, NY',
        availability: 'Weekends, 10 AM-6 PM EST',
        languages: ['English', 'Mandarin'],
        bio: 'Creative designer focused on creating intuitive and beautiful user experiences. I specialize in helping designers build their portfolios and improve their skills.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        isAvailable: true,
        responseTime: '4 hours',
        totalSessions: 67,
        successRate: 95,
        verified: true,
        featured: false
      },
      {
        id: 3,
        name: 'Rodiyat Kabir',
        title: 'Data Scientist at Netflix',
        expertise: ['Python', 'Machine Learning', 'Data Analysis', 'SQL'],
        rating: 4.7,
        reviews: 156,
        hourlyRate: 140,
        currency: 'USD',
        experience: '7+ years',
        education: 'MS Data Science, MIT',
        company: 'Netflix',
        location: 'Los Angeles, CA',
        availability: 'Tue-Thu, 7-10 PM PST',
        languages: ['English', 'Portuguese'],
        bio: 'Data scientist passionate about turning data into actionable insights. I help students and professionals master data science concepts and build real-world projects.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        isAvailable: true,
        responseTime: '3 hours',
        totalSessions: 112,
        successRate: 97,
        verified: true,
        featured: true
      },
      {
        id: 4,
        name: 'Abdullah Sofiyat',
        title: 'Product Manager at Microsoft',
        expertise: ['Product Strategy', 'Agile', 'User Research', 'Go-to-Market'],
        rating: 4.6,
        reviews: 78,
        hourlyRate: 130,
        currency: 'USD',
        experience: '5+ years',
        education: 'MBA, Harvard Business School',
        company: 'Microsoft',
        location: 'Seattle, WA',
        availability: 'Mon-Wed, 5-8 PM PST',
        languages: ['English', 'Korean'],
        bio: 'Product manager with experience launching successful products. I help aspiring PMs understand the role and prepare for interviews.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isAvailable: false,
        responseTime: '24 hours',
        totalSessions: 45,
        successRate: 92,
        verified: true,
        featured: false
      }
    ];

    const mockMyMentors = [
      {
        id: 1,
        mentorId: 1,
        name: 'Dr. Mistura Rokibat',
        title: 'Senior Software Engineer at Google',
        expertise: ['React', 'Node.js', 'System Design'],
        rating: 4.9,
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        status: 'active',
        nextSession: '2024-01-25T18:00:00',
        totalSessions: 12,
        lastSession: '2024-01-18T18:00:00',
        progress: 75
      }
    ];

    const mockSessions = [
      {
        id: 1,
        mentorId: 1,
        mentorName: 'Dr. Mistura Rokibat',
        title: 'React Performance Optimization',
        date: '2024-01-25T18:00:00',
        duration: 60,
        status: 'upcoming',
        type: 'video',
        notes: 'Focus on React.memo, useMemo, and useCallback hooks',
        price: 150,
        currency: 'USD'
      },
      {
        id: 2,
        mentorId: 1,
        mentorName: 'Dr. Mistura Rokibat',
        title: 'System Design Interview Prep',
        date: '2024-01-18T18:00:00',
        duration: 90,
        status: 'completed',
        type: 'video',
        notes: 'Covered distributed systems, scalability patterns',
        price: 225,
        currency: 'USD',
        rating: 5,
        feedback: 'Excellent session! Mistura explained complex concepts clearly.'
      }
    ];

    setMentors(mockMentors);
    setMyMentors(mockMyMentors);
    setSessions(mockSessions);
  }, []);

  const getStatusColor = (status) => {
    const colorMap = {
      active: 'text-green-600 bg-green-50 border-green-200',
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      completed: 'text-blue-600 bg-blue-50 border-blue-200',
      cancelled: 'text-red-600 bg-red-50 border-red-200'
    };
    return colorMap[status] || colorMap.pending;
  };

  const getSessionStatusColor = (status) => {
    const colorMap = {
      upcoming: 'text-blue-600 bg-blue-50 border-blue-200',
      completed: 'text-green-600 bg-green-50 border-green-200',
      cancelled: 'text-red-600 bg-red-50 border-red-200',
      rescheduled: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    };
    return colorMap[status] || colorMap.upcoming;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`text-sm ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleConnect = (mentorId) => {
    console.log('Connect with mentor:', mentorId);
    // Implement connection logic
  };

  const handleBookSession = (mentorId) => {
    console.log('Book session with mentor:', mentorId);
    // Implement booking logic
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'all' || 
                         (filter === 'available' && mentor.isAvailable) ||
                         (filter === 'featured' && mentor.featured);
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return a.hourlyRate - b.hourlyRate;
      case 'experience':
        return parseInt(b.experience) - parseInt(a.experience);
      case 'reviews':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  const MentorCard = ({ mentor }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
          />
          {mentor.verified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
              <FaCheckCircle className="text-xs" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>
              <p className="text-gray-600">{mentor.title}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                ${mentor.hourlyRate}
              </div>
              <div className="text-sm text-gray-500">per hour</div>
            </div>
          </div>

          {/* Rating and Stats */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-1">
              {renderStars(mentor.rating)}
              <span className="text-sm text-gray-600 ml-1">
                {mentor.rating} ({mentor.reviews} reviews)
              </span>
            </div>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">{mentor.experience} experience</span>
          </div>

          {/* Expertise */}
          <div className="flex flex-wrap gap-2 mb-3">
            {mentor.expertise.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
            {mentor.expertise.length > 4 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{mentor.expertise.length - 4} more
              </span>
            )}
          </div>

          {/* Company and Location */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            <span className="flex items-center space-x-1">
              <FaBriefcase className="text-gray-400" />
              {mentor.company}
            </span>
            <span className="flex items-center space-x-1">
              <FaMapMarkerAlt className="text-gray-400" />
              {mentor.location}
            </span>
            <span className="flex items-center space-x-1">
              <FaClock className="text-gray-400" />
              {mentor.responseTime} response
            </span>
          </div>

          {/* Bio */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">{mentor.bio}</p>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleConnect(mentor.id)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Connect
            </button>
            <button
              onClick={() => handleBookSession(mentor.id)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Book Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const MyMentorCard = ({ mentor }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-4">
        <img
          src={mentor.avatar}
          alt={mentor.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{mentor.name}</h3>
          <p className="text-gray-600 text-sm">{mentor.title}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="flex items-center space-x-1 text-sm text-gray-500">
              <FaStar className="text-yellow-400" />
              {mentor.rating}
            </span>
            <span className="text-sm text-gray-500">{mentor.totalSessions} sessions</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(mentor.status)}`}>
              {mentor.status}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Next Session</div>
          <div className="font-medium text-gray-900">
            {new Date(mentor.nextSession).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );

  const SessionCard = ({ session }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{session.title}</h3>
          <p className="text-gray-600">{session.mentorName}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getSessionStatusColor(session.status)}`}>
          {session.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FaCalendarAlt />
          <span>{new Date(session.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FaClock />
          <span>{session.duration} minutes</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FaVideo />
          <span>{session.type}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>${session.price}</span>
        </div>
      </div>

      {session.notes && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Notes:</div>
          <p className="text-sm text-gray-600">{session.notes}</p>
        </div>
      )}

      {session.status === 'completed' && session.rating && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Your rating:</span>
          {renderStars(session.rating)}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Mentorship</h2>
            <p className="text-gray-600">Connect with mentors and get personalized guidance</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Request Mentorship
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2">
          <div className="flex space-x-1">
            {[
              { key: 'find', label: 'Find Mentors', icon: FaSearch },
              { key: 'my', label: 'My Mentors', icon: FaUsers },
              { key: 'sessions', label: 'Sessions', icon: FaCalendarAlt }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="text-sm" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'find' && (
          <>
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'All Mentors' },
                    { key: 'available', label: 'Available Now' },
                    { key: 'featured', label: 'Featured' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search mentors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="rating">Sort by Rating</option>
                    <option value="price">Sort by Price</option>
                    <option value="experience">Sort by Experience</option>
                    <option value="reviews">Sort by Reviews</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mentors Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>

            {filteredMentors.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FaUserTie className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No mentors found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'my' && (
          <div className="space-y-4">
            {myMentors.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No mentors yet</h3>
                <p className="text-gray-500">Connect with mentors to start your mentorship journey</p>
              </div>
            ) : (
              myMentors.map((mentor) => (
                <MyMentorCard key={mentor.id} mentor={mentor} />
              ))
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No sessions yet</h3>
                <p className="text-gray-500">Book your first mentorship session to get started</p>
              </div>
            ) : (
              sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerMentorship;
