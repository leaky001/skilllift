// Stream.IO Configuration
// This file provides Stream.IO configuration for the frontend

export const STREAM_CONFIG = {
  apiKey: 'j86qtfj4kzaf', // Stream.io API Key (public, safe to expose)
  options: {
    // Enhanced logging for debugging
    loggerLevel: 'debug',
  }
};

export const getStreamApiKey = () => {
  // Try environment variable first
  const envKey = import.meta.env.VITE_STREAM_API_KEY;
  
  if (envKey) {
    console.log('🔑 Stream API Key from environment:', envKey);
    return envKey;
  }
  
  // Fallback to config file
  console.log('🔑 Stream API Key from config:', STREAM_CONFIG.apiKey);
  return STREAM_CONFIG.apiKey;
};
