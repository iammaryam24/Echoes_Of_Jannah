// server.js - COMPLETE WORKING VERSION FOR PORT 3000
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import axios from 'axios';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ 
  origin: 'http://localhost:3000', 
  credentials: true 
}));
app.use(express.json());

// ============================================
// CONFIGURATION - YOUR TEST CREDENTIALS
// ============================================
const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
const CLIENT_SECRET = 'oESUyMXqqRSkQP8HBRmATrZlwp';
const REDIRECT_URI = 'http://localhost:3000/';
const AUTH_BASE = 'https://prelive-oauth2.quran.foundation';

console.log('🔐 Quran Foundation Auth Server');
console.log(`   Client ID: ${CLIENT_ID}`);
console.log(`   Redirect URI: ${REDIRECT_URI}`);
console.log(`   Auth Base: ${AUTH_BASE}\n`);

// Store PKCE data in memory
const pkceStore = new Map();

// Clean old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pkceStore.entries()) {
    if (now - value.createdAt > 600000) {
      pkceStore.delete(key);
    }
  }
}, 300000);

// ============================================
// ENDPOINT 1: Get Login URL
// ============================================
app.get('/api/auth/login-url', (req, res) => {
  console.log('\n📡 GET /api/auth/login-url');
  
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  const codeChallenge = hash.toString('base64url');
  const state = crypto.randomBytes(16).toString('hex');
  
  pkceStore.set(state, { 
    codeVerifier, 
    createdAt: Date.now() 
  });
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'openid offline_access user note post',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  
  const authUrl = `${AUTH_BASE}/oauth2/auth?${params.toString()}`;
  
  console.log('✅ Auth URL generated');
  console.log('   Redirect URI:', REDIRECT_URI);
  
  res.json({ url: authUrl });
});

// ============================================
// ENDPOINT 2: Exchange Code for Tokens
// ============================================
app.post('/api/auth/exchange', async (req, res) => {
  console.log('\n📡 POST /api/auth/exchange');
  
  const { code, state } = req.body;
  
  if (!code || !state) {
    console.error('❌ Missing code or state');
    return res.status(400).json({ error: 'Missing code or state' });
  }
  
  const pkceData = pkceStore.get(state);
  if (!pkceData) {
    console.error('❌ Invalid or expired state');
    return res.status(400).json({ error: 'Invalid or expired state' });
  }
  
  pkceStore.delete(state);
  
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('code_verifier', pkceData.codeVerifier);
    
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(
      `${AUTH_BASE}/oauth2/token`,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        }
      }
    );
    
    const tokenData = response.data;
    
    let user = null;
    if (tokenData.id_token) {
      try {
        const payload = tokenData.id_token.split('.')[1];
        user = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
        console.log(`✅ User authenticated: ${user.email || user.sub}`);
      } catch (e) {
        console.error('   Failed to decode id_token');
      }
    }
    
    console.log('✅ Token exchange successful');
    
    res.json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      idToken: tokenData.id_token,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      user: user
    });
    
  } catch (error) {
    console.error('❌ Token exchange failed:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Token exchange failed',
      details: error.response?.data 
    });
  }
});

// ============================================
// ENDPOINT 3: Refresh Token
// ============================================
app.post('/api/auth/refresh', async (req, res) => {
  console.log('\n📡 POST /api/auth/refresh');
  
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ error: 'Missing refresh token' });
  }
  
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(
      `${AUTH_BASE}/oauth2/token`,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        }
      }
    );
    
    console.log('✅ Token refresh successful');
    
    res.json({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || refreshToken,
      expiresIn: response.data.expires_in
    });
    
  } catch (error) {
    console.error('❌ Refresh failed:', error.response?.data || error.message);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// ============================================
// ENDPOINT 4: Health Check
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    config: {
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      authBase: AUTH_BASE
    }
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`\n✅ Auth Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Endpoints:`);
  console.log(`   GET  /api/auth/login-url`);
  console.log(`   POST /api/auth/exchange`);
  console.log(`   POST /api/auth/refresh`);
  console.log(`   GET  /api/health`);
  console.log(`\n🚀 Frontend should run on: http://localhost:3000`);
  console.log(`   Callback registered: ${REDIRECT_URI}\n`);
});
