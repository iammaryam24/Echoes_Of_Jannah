// src/api/auth.js
import { getCurrentConfig } from './config';

let cachedToken = null;
let tokenExpiry = null;

// Get OAuth2 access token
export const getAccessToken = async () => {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  const config = getCurrentConfig();
  
  try {
    const response = await fetch(config.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: config.CLIENT_ID,
        client_secret: config.CLIENT_SECRET,
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    const expiresIn = data.expires_in || 3600;
    tokenExpiry = Date.now() + expiresIn * 1000;
    
    console.log(`✅ ${config.NAME} - New access token obtained`);
    return cachedToken;
  } catch (error) {
    console.error('❌ Failed to get access token:', error);
    throw error;
  }
};

// Clear cached token (for logout or refresh)
export const clearToken = () => {
  cachedToken = null;
  tokenExpiry = null;
};

// Check if token is valid
export const isTokenValid = () => {
  return cachedToken && tokenExpiry && Date.now() < tokenExpiry;
};

export default { getAccessToken, clearToken, isTokenValid };