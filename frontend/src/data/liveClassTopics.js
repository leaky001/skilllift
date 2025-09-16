// Predefined topics for live classes based on course categories
export const LIVE_CLASS_TOPICS = {
  'Web Development': [
    'HTML Fundamentals',
    'CSS Styling & Layout',
    'JavaScript Basics',
    'Advanced JavaScript',
    'React Components',
    'Node.js Backend',
    'Database Integration',
    'API Development',
    'Authentication & Security',
    'Deployment & Hosting',
    'Testing & Debugging',
    'Performance Optimization'
  ],
  'Digital Marketing': [
    'Digital Marketing Fundamentals',
    'SEO Optimization',
    'Social Media Marketing',
    'Content Marketing',
    'Email Marketing',
    'Google Ads',
    'Facebook Advertising',
    'Analytics & Tracking',
    'Conversion Optimization',
    'Brand Building',
    'Influencer Marketing',
    'Marketing Automation'
  ],
  'Data Science': [
    'Python Basics',
    'Data Analysis with Pandas',
    'Data Visualization',
    'Machine Learning Fundamentals',
    'Statistical Analysis',
    'SQL for Data Science',
    'Deep Learning',
    'Natural Language Processing',
    'Computer Vision',
    'Big Data Processing',
    'Data Engineering',
    'Model Deployment'
  ],
  'Design': [
    'UI/UX Fundamentals',
    'Adobe Photoshop',
    'Adobe Illustrator',
    'Figma Design',
    'Color Theory',
    'Typography',
    'Layout Design',
    'Prototyping',
    'User Research',
    'Design Systems',
    'Motion Graphics',
    'Brand Identity'
  ],
  'Business': [
    'Business Fundamentals',
    'Project Management',
    'Leadership Skills',
    'Financial Planning',
    'Marketing Strategy',
    'Sales Techniques',
    'Customer Service',
    'Team Building',
    'Strategic Planning',
    'Risk Management',
    'Entrepreneurship',
    'Business Analytics'
  ],
  'Photography': [
    'Camera Basics',
    'Composition Techniques',
    'Lighting Fundamentals',
    'Portrait Photography',
    'Landscape Photography',
    'Street Photography',
    'Photo Editing',
    'Color Grading',
    'Studio Photography',
    'Event Photography',
    'Product Photography',
    'Photography Business'
  ],
  'default': [
    'Introduction Session',
    'Fundamentals Review',
    'Advanced Concepts',
    'Practical Application',
    'Q&A Session',
    'Project Discussion',
    'Troubleshooting',
    'Best Practices',
    'Industry Insights',
    'Career Guidance',
    'Tool Demonstration',
    'Case Study Analysis'
  ]
};

// Get topics for a specific course category
export const getTopicsForCategory = (category) => {
  return LIVE_CLASS_TOPICS[category] || LIVE_CLASS_TOPICS.default;
};

// Get all available topics
export const getAllTopics = () => {
  const allTopics = [];
  Object.values(LIVE_CLASS_TOPICS).forEach(topics => {
    allTopics.push(...topics);
  });
  return [...new Set(allTopics)]; // Remove duplicates
};

// Get topic suggestions based on course title and description
export const getTopicSuggestions = (courseTitle, courseDescription, category) => {
  const categoryTopics = getTopicsForCategory(category);
  const suggestions = [];
  
  // Simple keyword matching for suggestions
  const titleLower = courseTitle.toLowerCase();
  const descLower = courseDescription.toLowerCase();
  
  categoryTopics.forEach(topic => {
    const topicLower = topic.toLowerCase();
    
    // Check if topic keywords match course content
    if (topicLower.includes('fundamental') && (titleLower.includes('basic') || titleLower.includes('intro'))) {
      suggestions.push(topic);
    } else if (topicLower.includes('advanced') && (titleLower.includes('advanced') || titleLower.includes('expert'))) {
      suggestions.push(topic);
    } else if (topicLower.includes('javascript') && (titleLower.includes('javascript') || titleLower.includes('js'))) {
      suggestions.push(topic);
    } else if (topicLower.includes('react') && titleLower.includes('react')) {
      suggestions.push(topic);
    } else if (topicLower.includes('marketing') && titleLower.includes('marketing')) {
      suggestions.push(topic);
    }
  });
  
  // If no specific matches, return first 3 topics from category
  if (suggestions.length === 0) {
    return categoryTopics.slice(0, 3);
  }
  
  return suggestions.slice(0, 3);
};

