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
// Usage: authorize('admin'), authorize('tutor', 'admin')
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('❌ Authorization failed: No user in request');
      return res.status(401).json({ message: 'Not authorized' });
    }

    const userRole = req.user.role;
    console.log('🔐 Authorization check:', {
      userId: req.user._id,
      userRole: userRole,
      allowedRoles: allowedRoles,
      isAuthorized: allowedRoles.includes(userRole),
      url: req.originalUrl
    });

    if (!allowedRoles.includes(userRole)) {
      console.log('❌ Access denied:', {
        userRole: userRole,
        allowedRoles: allowedRoles,
        userId: req.user._id,
        url: req.originalUrl
      });
      return res.status(403).json({ 
        message: 'Access denied',
        userRole: userRole,
        allowedRoles: allowedRoles
      });
    }

    console.log('✅ Authorization successful for role:', userRole);
    next();
  };
};