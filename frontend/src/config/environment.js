// Environment Configuration Helper
export const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // Clean up the URL if it contains fallback syntax
  let cleanUrl = envUrl;
  if (envUrl && envUrl.includes('||')) {
    // Split by || and take the first part
    cleanUrl = envUrl.split('||')[0].trim();
  }
  
  // Default fallback
  const defaultUrl = 'https://skilllift.onrender.com/api';
  
  const finalUrl = cleanUrl || defaultUrl;
  
  console.log('🔧 API URL Resolution:', {
    originalEnv: envUrl,
    cleanedUrl: cleanUrl,
    finalUrl: finalUrl,
    isProduction: import.meta.env.PROD
  });
  
  return finalUrl;
};

// Logger utility
export const logger = {
  info: (message, data) => {
    console.log(`ℹ️ ${message}`, data || '');
  },
  error: (message, error) => {
    console.error(`❌ ${message}`, error || '');
  },
  warn: (message, data) => {
    console.warn(`⚠️ ${message}`, data || '');
  },
  success: (message, data) => {
    console.log(`✅ ${message}`, data || '');
  },
  debug: (message, data) => {
    if (import.meta.env.DEV) {
      console.log(`🐛 ${message}`, data || '');
    }
  }
};

export const config = {
  apiUrl: getApiUrl(),
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  appName: import.meta.env.VITE_APP_NAME || 'SkillLift',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0'
};