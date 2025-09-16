import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaFileAlt, 
  FaVideo, 
  FaImage, 
  FaLink, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCopy,
  FaCheckCircle,
  FaTimes,
  FaSave,
  FaBookOpen,
  FaLaptopCode,
  FaPalette,
  FaCalculator,
  FaLanguage,
  FaFlask,
  FaChartLine
} from 'react-icons/fa';

const AssignmentTemplates = ({ onSelectTemplate, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Assignment templates for different course types
  const templates = [
    // Programming & Development
    {
      id: 1,
      name: 'Coding Project Template',
      category: 'programming',
      icon: FaLaptopCode,
      description: 'Standard template for coding assignments with code review requirements',
      requirements: [
        'Working code that compiles and runs',
        'Code documentation and comments',
        'README file with setup instructions',
        'Unit tests (if applicable)',
        'Git repository with commit history'
      ],
      submissionTypes: ['files', 'links'],
      maxScore: 100,
      estimatedTime: '2-3 weeks',
      difficulty: 'Intermediate'
    },
    {
      id: 2,
      name: 'Web Development Portfolio',
      category: 'programming',
      icon: FaLaptopCode,
      description: 'Complete website portfolio showcasing skills and projects',
      requirements: [
        'Responsive design for all devices',
        'At least 3 project showcases',
        'Contact form functionality',
        'SEO optimization',
        'Performance optimization',
        'Deployed live website'
      ],
      submissionTypes: ['files', 'links'],
      maxScore: 100,
      estimatedTime: '3-4 weeks',
      difficulty: 'Advanced'
    },

    // Design & Creative
    {
      id: 3,
      name: 'Design Portfolio Template',
      category: 'design',
      icon: FaPalette,
      description: 'Professional design portfolio with multiple project showcases',
      requirements: [
        '10-15 high-quality design pieces',
        'Process documentation for each project',
        'Brand identity guidelines',
        'Case studies (2-3 projects)',
        'Professional presentation layout'
      ],
      submissionTypes: ['files', 'images', 'links'],
      maxScore: 100,
      estimatedTime: '4-5 weeks',
      difficulty: 'Advanced'
    },
    {
      id: 4,
      name: 'Logo Design Assignment',
      category: 'design',
      icon: FaPalette,
      description: 'Complete logo design process from concept to final delivery',
      requirements: [
        'Brand research and analysis',
        '3-5 initial concepts',
        'Refined final design',
        'Brand guidelines document',
        'Mockups in various applications',
        'Vector files (AI/SVG)'
      ],
      submissionTypes: ['files', 'images'],
      maxScore: 100,
      estimatedTime: '1-2 weeks',
      difficulty: 'Intermediate'
    },

    // Business & Marketing
    {
      id: 5,
      name: 'Business Plan Template',
      category: 'business',
      icon: FaChartLine,
      description: 'Comprehensive business plan with financial projections',
      requirements: [
        'Executive summary',
        'Market analysis and research',
        'Marketing strategy',
        'Financial projections (3 years)',
        'Risk analysis',
        'Implementation timeline'
      ],
      submissionTypes: ['files'],
      maxScore: 100,
      estimatedTime: '3-4 weeks',
      difficulty: 'Advanced'
    },
    {
      id: 6,
      name: 'Digital Marketing Campaign',
      category: 'business',
      icon: FaChartLine,
      description: 'Complete digital marketing campaign with analytics',
      requirements: [
        'Campaign strategy document',
        'Content calendar',
        'Social media posts (2 weeks)',
        'Email marketing sequence',
        'Analytics report',
        'ROI calculations'
      ],
      submissionTypes: ['files', 'links'],
      maxScore: 100,
      estimatedTime: '2-3 weeks',
      difficulty: 'Intermediate'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: FaBookOpen },
    { id: 'programming', name: 'Programming', icon: FaLaptopCode },
    { id: 'design', name: 'Design', icon: FaPalette },
    { id: 'business', name: 'Business', icon: FaChartLine },
    { id: 'science', name: 'Science', icon: FaFlask },
    { id: 'language', name: 'Language', icon: FaLanguage },
    { id: 'mathematics', name: 'Mathematics', icon: FaCalculator }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = (template) => {
    onSelectTemplate(template);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Assignment Templates</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex space-x-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg border transition-all flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <motion.div
              key={template.id}
              whileHover={{ y: -5 }}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Icon className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.category}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <FaCopy size={16} />
                </button>
              </div>

              <p className="text-gray-600 text-sm mb-4">{template.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Max Score:</span>
                  <span className="font-medium">{template.maxScore} points</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium">{template.estimatedTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Difficulty:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                    {template.difficulty}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {template.submissionTypes.map((type) => (
                    <span key={type} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {type}
                    </span>
                  ))}
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Use Template
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FaBookOpen className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-500">No templates found matching your criteria.</p>
        </div>
      )}
    </motion.div>
  );
};

export default AssignmentTemplates;
