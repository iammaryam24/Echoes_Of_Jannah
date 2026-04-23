// src/api/config.js
const config = {
  useProduction: import.meta.env.VITE_USE_PRODUCTION === 'true',
  
  get clientId() {
    return this.useProduction 
      ? import.meta.env.VITE_PROD_CLIENT_ID 
      : import.meta.env.VITE_CLIENT_ID;
  },
  
  get clientSecret() {
    return this.useProduction 
      ? import.meta.env.VITE_PROD_CLIENT_SECRET 
      : import.meta.env.VITE_CLIENT_SECRET;
  },
  
  get tokenUrl() {
    return this.useProduction 
      ? import.meta.env.VITE_PROD_TOKEN_URL 
      : import.meta.env.VITE_TOKEN_URL;
  },
  
  get apiBaseUrl() {
    return this.useProduction 
      ? import.meta.env.VITE_PROD_API_BASE_URL 
      : import.meta.env.VITE_API_BASE_URL;
  },
  
  // Fallback to preprod if not set
  fallback: {
    clientId: '911c5b21-975f-4610-be81-f7158e7e6047',
    clientSecret: 'oESUyMXqqRSkQP8HBRmATrZlwp',
    tokenUrl: 'https://prelive-oauth2.quran.foundation/token',
    apiBaseUrl: 'https://prelive-api.quran.foundation'
  }
};

export default config;