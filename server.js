import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import axios from 'axios';

const app = express();

// CORS - Local aur production dono ke liye
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://echoes-of-jannah-wrpl.vercel.app'],
  credentials: true 
}));
app.use(express.json());

// Environment variables se le raha hai (Vercel pe set karna)
const CLIENT_ID = process.env.QF_CLIENT_ID || '911c5b21-975f-4610-be81-f7158e7e6047';
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET || 'oESUyMXqqRSkQP8HBRmATrZlwp';
const REDIRECT_URI = process.env.QF_REDIRECT_URI || 'https://echoes-of-jannah-wrpl.vercel.app/auth/callback';
const AUTH_BASE = process.env.QF_AUTH_BASE || 'https://prelive-oauth2.quran.foundation';

const pkceStore = new Map();

// Clean old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pkceStore.entries()) {
    if (now - value.createdAt > 600000) {
      pkceStore.delete(key);
    }
  }
}, 300000);

// ============= API ENDPOINTS =============

// 1. Get login URL
app.get('/api/auth/login-url', (req, res) => {
  console.log('📡 GET /api/auth/login-url');
  
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  const codeChallenge = hash.toString('base64url');
  const state = crypto.randomBytes(16).toString('hex');
  
  pkceStore.set(state, { codeVerifier, createdAt: Date.now() });
  
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
  console.log('✅ Auth URL generated:', url);
  res.json({ url });
});

// 2. Exchange code for tokens
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
    
    const response = await axios.post(`${AUTH_BASE}/oauth2/token`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      }
    });
    
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
    
    console.log('✅ Token exchange successful');
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

// 3. Refresh token
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
    
    const response = await axios.post(`${AUTH_BASE}/oauth2/token`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      }
    });
    
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

// 4. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ✅ Vercel serverless ke liye export (NO app.listen!)
export default app;