// Application Configuration
export const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  },

  // WebSocket Configuration
  websocket: {
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:5001',
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
    pingInterval: 30000,
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'SkillLift',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    debug: import.meta.env.VITE_DEBUG_MODE === 'true',
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
    payments: import.meta.env.VITE_ENABLE_PAYMENTS !== 'false',
  },

  // External Services
  services: {
    cloudinary: {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    },
  },

  // Development
  development: {
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },
};

// Environment check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    profile: '/auth/profile',
    changePassword: '/auth/change-password',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    refreshToken: '/auth/refresh-token',
  },
  users: {
    all: '/users',
    byId: (id) => `/users/${id}`,
    search: '/users/search',
    stats: '/users/stats',
    export: '/users/export',
    bulkUpdate: '/users/bulk-update',
    activity: (id) => `/users/${id}/activity`,
    notifications: (id) => `/users/${id}/notifications`,
  },
  kyc: {
    submit: '/kyc/submit',
    status: '/kyc/status',
    details: '/kyc/details',
    update: '/kyc/update',
    uploadDocuments: '/kyc/upload-documents',
    applications: '/kyc/applications',
    approve: (id) => `/kyc/applications/${id}/approve`,
    reject: (id) => `/kyc/applications/${id}/reject`,
    requestDocuments: (id) => `/kyc/applications/${id}/request-documents`,
    stats: '/kyc/stats',
    export: '/kyc/export',
    bulkOperation: '/kyc/bulk-operation',
    requirements: '/kyc/requirements',
    eligibility: '/kyc/eligibility',
  },
  assignments: {
    all: '/assignments',
    byId: (id) => `/assignments/${id}`,
    course: (courseId) => `/assignments/course/${courseId}`,
    submissions: (id) => `/assignments/${id}/submissions`,
    publish: (id) => `/assignments/${id}/publish`,
    unpublish: (id) => `/assignments/${id}/unpublish`,
    stats: (id) => `/assignments/${id}/stats`,
    analytics: (id) => `/assignments/${id}/analytics`,
    bulkOperation: '/assignments/bulk-operation',
    export: '/assignments/export',
    templates: '/assignments/templates',
    saveTemplate: (id) => `/assignments/${id}/save-template`,
    duplicate: (id) => `/assignments/${id}/duplicate`,
  },
  payments: {
    initialize: '/payments/initialize',
    verify: '/payments/verify',
    history: '/payments/history',
    byId: (id) => `/payments/${id}`,
    stats: '/payments/stats',
    refund: (id) => `/payments/${id}/refund`,
    refundStatus: (id) => `/payments/refunds/${id}`,
    all: '/payments/all',
    adminStats: '/payments/admin/stats',
    export: '/payments/export',
    processRefund: (id) => `/payments/${id}/process-refund`,
    analytics: '/payments/analytics',
    methods: '/payments/methods',
    savedMethods: '/payments/methods/saved',
    deleteMethod: (id) => `/payments/methods/${id}`,
    webhooks: '/payments/webhooks',
    retry: (id) => `/payments/${id}/retry`,
    disputes: '/payments/disputes',
    resolveDispute: (id) => `/payments/disputes/${id}/resolve`,
  },
  courses: {
    all: '/courses',
    byId: (id) => `/courses/${id}`,
    enroll: (id) => `/courses/${id}/enroll`,
    unenroll: (id) => `/courses/${id}/unenroll`,
    progress: (id) => `/courses/${id}/progress`,
    content: (id) => `/courses/${id}/content`,
    reviews: (id) => `/courses/${id}/reviews`,
    addReview: (id) => `/courses/${id}/reviews`,
  },
  enrollments: {
    all: '/enrollments',
    byId: (id) => `/enrollments/${id}`,
    user: '/enrollments/user',
    course: (courseId) => `/enrollments/course/${courseId}`,
    progress: (id) => `/enrollments/${id}/progress`,
    updateProgress: (id) => `/enrollments/${id}/progress`,
  },
  certificates: {
    all: '/certificates',
    byId: (id) => `/certificates/${id}`,
    user: '/certificates/user',
    course: (courseId) => `/certificates/course/${courseId}`,
    generate: '/certificates/generate',
    download: (id) => `/certificates/${id}/download`,
    verify: '/certificates/verify',
  },
  notifications: {
    all: '/notifications',
    byId: (id) => `/notifications/${id}`,
    user: '/notifications/user',
    markRead: (id) => `/notifications/${id}/read`,
    markAllRead: '/notifications/mark-all-read',
    preferences: '/notifications/preferences',
    updatePreferences: '/notifications/preferences',
  },
  ratings: {
    all: '/ratings',
    byId: (id) => `/ratings/${id}`,
    course: (courseId) => `/ratings/course/${courseId}`,
    user: '/ratings/user',
    add: '/ratings',
    update: (id) => `/ratings/${id}`,
    delete: (id) => `/ratings/${id}`,
  },
  mentorship: {
    all: '/mentorship',
    byId: (id) => `/mentorship/${id}`,
    user: '/mentorship/user',
    requests: '/mentorship/requests',
    apply: '/mentorship/apply',
    accept: (id) => `/mentorship/${id}/accept`,
    reject: (id) => `/mentorship/${id}/reject`,
    sessions: (id) => `/mentorship/${id}/sessions`,
    scheduleSession: (id) => `/mentorship/${id}/sessions`,
  },
};

export default config;
