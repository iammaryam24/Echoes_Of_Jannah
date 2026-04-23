// auth-server.js 
// auth-server.js
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
const CLIENT_SECRET = 'oESUyMXqqRSkQP8HBRmATrZlwp';
const REDIRECT_URI = 'http://localhost:5173/auth/callback';
const AUTH_BASE = 'https://prelive-oauth2.quran.foundation';

// Store PKCE in memory (will reset on server restart, fine for local dev)
const pkceStore = new Map();

// Clean old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pkceStore.entries()) {
    if (now - value.createdAt > 600000) { // 10 minutes
      pkceStore.delete(key);
    }
  }
}, 300000);

// Login URL endpoint
app.get('/api/auth/login-url', (req, res) => {
  console.log('📡 GET /api/auth/login-url');
  
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
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  
  const url = `${AUTH_BASE}/oauth2/auth?${params.toString()}`;
  console.log('✅ Auth URL generated');
  res.json({ url });
});

// Exchange code for tokens
app.post('/api/auth/exchange', async (req, res) => {
  console.log('📡 POST /api/auth/exchange');
  
  const { code, state } = req.body;
  
  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }
  
  const pkceData = pkceStore.get(state);
  if (!pkceData) {
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
      } catch (e) {
        console.error('Failed to decode id_token:', e);
      }
    }
    
    console.log(`✅ User authenticated: ${user?.email || 'unknown'}`);
    
    res.json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      idToken: tokenData.id_token,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      user
    });
    
  } catch (error) {
    console.error('❌ Token exchange failed:', error.response?.data || error.message);
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

// Refresh token
app.post('/api/auth/refresh', async (req, res) => {
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n✅ Auth Server running on http://localhost:${PORT}`);
  console.log(`   GET  /api/auth/login-url`);
  console.log(`   POST /api/auth/exchange`);
  console.log(`   POST /api/auth/refresh`);
  console.log(`   GET  /api/health`);
  console.log(`\n🚀 Ready for sign in!\n`);
});