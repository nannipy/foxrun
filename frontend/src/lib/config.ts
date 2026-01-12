export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // Strava Configuration
  stravaClientId: import.meta.env.VITE_STRAVA_CLIENT_ID,
  stravaRedirectUri: import.meta.env.VITE_STRAVA_REDIRECT_URI || 'http://localhost:3000/auth/callback',
  
  // Development Configuration
  isDevelopment: import.meta.env.DEV,
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_STRAVA_CLIENT_ID,
  
  // App Configuration
  appName: 'Strava Run Analyzer',
  appVersion: '1.0.0',
  
  // Features
  features: {
    mockData: true,
    stravaAuth: true,
    activitySync: true,
    analytics: true,
  }
};

export default config; 