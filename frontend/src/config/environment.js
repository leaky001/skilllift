// Environment configuration (Vite)
const env = typeof import.meta !== 'undefined' ? (import.meta.env || {}) : {};
const isDevelopment = env.MODE === 'development';
const isProduction = env.MODE === 'production';

export const config = {
  // API Configuration
  API_BASE_URL: env.VITE_API_URL || 'http://localhost:3002/api',
  
  // WebSocket Configuration
  WEBSOCKET_URL: env.VITE_WEBSOCKET_URL || 'http://localhost:3002',
  
  // Debug Configuration
  ENABLE_CONSOLE_LOGS: isDevelopment,
  ENABLE_DEBUG_MODE: isDevelopment,
  
  // Performance Configuration
  API_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  POLLING_INTERVAL: 30 * 1000, // 30 seconds
  
  // Feature Flags
  ENABLE_WEBSOCKET: !isProduction, // Disable WebSocket in production until backend is ready
  ENABLE_REAL_TIME_NOTIFICATIONS: !isProduction,
  
  // Stream SDK Configuration (client-safe keys only)
  STREAM_API_KEY: env.VITE_STREAM_API_KEY,
  
  // Payment Configuration
  PAYSTACK_PUBLIC_KEY: env.VITE_PAYSTACK_PUBLIC_KEY,
};

// Console logging utility
export const logger = {
  log: (...args) => {
    if (config.ENABLE_CONSOLE_LOGS) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (config.ENABLE_CONSOLE_LOGS) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    if (config.ENABLE_CONSOLE_LOGS) {
      console.error(...args);
    }
  },
  debug: (...args) => {
    if (config.ENABLE_DEBUG_MODE) {
      console.debug(...args);
    }
  }
};

export default config;
