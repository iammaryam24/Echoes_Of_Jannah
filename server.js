import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import axios from 'axios';

const app = express();

// CORS - Production ke liye bhi
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://echoes-of-jannah-wrpl.vercel.app'],
  credentials: true 
}));
app.use(express.json());

const CLIENT_ID = process.env.QF_CLIENT_ID || '911c5b21-975f-4610-be81-f7158e7e6047';
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET || 'oESUyMXqqRSkQP8HBRmATrZlwp';
const REDIRECT_URI = process.env.QF_REDIRECT_URI || 'https://echoes-of-jannah-wrpl.vercel.app/auth/callback';
const AUTH_BASE = process.env.QF_AUTH_BASE || 'https://prelive-oauth2.quran.foundation';

const pkceStore = new Map();

// Clean old entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pkceStore.entries()) {
    if (now - value.createdAt > 600000) {
      pkceStore.delete(key);
    }
  }
}, 300000);

app.get('/api/auth/login-url', (req, res) => {
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
  
  res.json({ url: `${AUTH_BASE}/oauth2/auth?${params.toString()}` });
});

app.post('/api/auth/exchange', async (req, res) => {
  const { code, state } = req.body;
  const pkceData = pkceStore.get(state);
  
  if (!pkceData) return res.status(400).json({ error: 'Invalid state' });
  pkceStore.delete(state);
  
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('code_verifier', pkceData.codeVerifier);
    
    const response = await axios.post(`${AUTH_BASE}/oauth2/token`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      }
    });
    
    const tokenData = response.data;
    let user = null;
    
    if (tokenData.id_token) {
      const payload = tokenData.id_token.split('.')[1];
      user = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    }
    
    res.json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    
    const response = await axios.post(`${AUTH_BASE}/oauth2/token`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      }
    });
    
    res.json({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || refreshToken,
      expiresIn: response.data.expires_in
    });
  } catch (error) {
    res.status(500).json({ error: 'Refresh failed' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ✅ Vercel ke liye export (NO app.listen!)
export default app;