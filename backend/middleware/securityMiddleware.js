const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.paystack.co"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Request size limiting middleware
const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  
  // Different limits for different types of requests
  let maxSize;
  if (req.path.includes('/upload') || req.path.includes('/replays')) {
    maxSize = 2 * 1024 * 1024 * 1024; // 2GB for file uploads
  } else {
    maxSize = 50 * 1024 * 1024; // 50MB for JSON requests
  }
  
  console.log(`🔍 Request size check: ${req.path}, Content-Length: ${contentLength}, Max: ${maxSize}`);
  
  if (contentLength > maxSize) {
    console.log(`❌ Request too large: ${contentLength} > ${maxSize}`);
    // Add CORS headers even for rejected requests
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    return res.status(413).json({
      success: false,
      message: 'Request entity too large'
    });
  }
  
  next();
};

// API rate limiting for different endpoints
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limiters
const authLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes (reduced from 15)
  20, // 20 attempts
  'Too many authentication attempts, please try again later.'
);

const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  process.env.NODE_ENV === 'development' ? 50000 : 10000, // Much higher limit for development
  'Too many API requests, please try again later.'
);

const uploadLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  50, // 50 uploads
  'Too many file uploads, please try again later.'
);

// Dashboard-specific rate limiter (very lenient for development)
const dashboardLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  process.env.NODE_ENV === 'development' ? 10000 : 200, // Very high limit for development
  'Too many dashboard requests, please try again later.'
);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      // Local development
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      // Production Vercel domain
      'https://skilllift-lyart.vercel.app',
      // Production Render backend domain
      
      // Environment variable
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow any Vercel domain
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      console.log('✅ Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-auth-token',
    'x-requested-with'
  ],
  exposedHeaders: ['x-auth-token']
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(`${logLevel} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};

// Error sanitization middleware
const sanitizeErrors = (err, req, res, next) => {
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    // Generic error for production
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
  
  // In development, show full error details
  next(err);
};

module.exports = {
  securityHeaders,
  requestSizeLimit,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  dashboardLimiter,
  corsOptions,
  requestLogger,
  sanitizeErrors
};
