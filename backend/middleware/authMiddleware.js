const jwt = require('jsonwebtoken');
const User = require('../models/User');
// const logger = require('../utils/logger');

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  
  console.log('🔐 Auth middleware processing', { 
    url: req.originalUrl, 
    method: req.method,
    hasAuthHeader: !!req.headers.authorization,
    authHeader: req.headers.authorization ? 'Present' : 'Missing',
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 20) + '...'
  });
  
  if (!token) {
    console.warn('❌ Authentication failed: No token provided', { 
      url: req.originalUrl, 
      ip: req.ip 
    });
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully', { userId: decoded.id });
    
    req.user = await User.findById(decoded.id).select('-password').maxTimeMS(10000);
    
    if (!req.user) {
      console.warn('❌ Authentication failed: User not found', { userId: decoded.id });
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('✅ User authenticated successfully', { 
      userId: req.user._id, 
      role: req.user.role,
      email: req.user.email,
      name: req.user.name
    });
    
    next();
  } catch (error) {
    console.error('❌ Token verification failed', { 
      error: error.message, 
      token: token ? 'present' : 'missing',
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
    });
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

// Role-based authorization middleware
// Usage: authorize('admin'), authorize('tutor', 'admin'), authorize(['learner', 'tutor'])
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('❌ Authorization failed: No user in request');
      return res.status(401).json({ message: 'Not authorized' });
    }

    const userRole = req.user.role;
    
    // Flatten the allowedRoles array to handle both formats:
    // authorize('tutor') -> ['tutor']
    // authorize('tutor', 'admin') -> ['tutor', 'admin'] 
    // authorize(['learner', 'tutor']) -> ['learner', 'tutor']
    const flattenedRoles = allowedRoles.flat();
    
    const isAuthorized = flattenedRoles.includes(userRole);

    console.log('🔐 Authorization check:', {
      userId: req.user._id,
      userRole: userRole,
      allowedRoles: allowedRoles,
      flattenedRoles: flattenedRoles,
      isAuthorized: isAuthorized,
      url: req.originalUrl
    });

    if (!isAuthorized) {
      console.log('❌ Access denied:', {
        userRole: userRole,
        allowedRoles: allowedRoles,
        flattenedRoles: flattenedRoles,
        userId: req.user._id,
        url: req.originalUrl
      });
      return res.status(403).json({ 
        message: 'Access denied',
        userRole: userRole,
        allowedRoles: flattenedRoles
      });
    }

    console.log('✅ Authorization successful for role:', userRole);
    next();
  };
};