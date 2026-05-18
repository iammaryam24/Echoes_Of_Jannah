PROJECT FOLDER
Echoes-Of-Jannah-main/
│
├── api/
│   ├── auth/
│   │   ├── callback.js
│   │   ├── exchange.js
│   │   ├── login-url.js
│   │   ├── logout.js
│   │   ├── me.js
│   │   └── refresh.js
│   ├── reflections/
│   │   └── index.js
│   └── package.json
│
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── quran.js
│   │   └── reflections.js
│   ├── utils/
│   │   ├── pkce.js
│   │   ├── quranApi.js
│   │   └── quranFallback.js
│   ├── node_modules/
│   ├── server.js
│   ├── vercel.json
│   ├── package.json
│   └── package-lock.json
│
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── logo.png
│
├── src/
│   ├── api/
│   │   ├── auth.js
│   │   ├── config.js
│   │   ├── index.js
│   │   ├── quranApi.js
│   │   ├── quranBackendApi.js
│   │   └── quranFoundationApi.js
│   ├── assets/
│   ├── components/
│   │   ├── AchievementBadge.jsx
│   │   ├── AdvancedAnalytics.jsx
│   │   ├── CommunityHub.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EmotionMirror.jsx
│   │   ├── LifeTimeline.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Logo.jsx
│   │   ├── Navigation.jsx
│   │   ├── ParticleBackground.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── QuranBrowser.jsx
│   │   ├── QuranLifeCompanion.jsx
│   │   ├── ReflectionModal.jsx
│   │   └── SpiritualDNA.jsx
│   ├── contexts/
│   │   ├── QuranAuthContext.jsx
│   │   └── UserContext.jsx
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   └── useQuranApi.js
│   ├── pages/
│   │   └── AuthCallback.jsx
│   ├── utils/
│   │   └── helpers.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   └── setupProxy.js
│
├── .env
├── .env.example
├── .env.local
├── .gitignore
├── auth-server.js
├── index.html
├── LICENSE
├── README.md
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── vercel.json
├── package.json
└── package-lock.json




// /api/auth/callback.js
export default async function handler(req, res) {
  // This endpoint is not directly used - the client handles the callback
  // It's here for completeness if needed for server-side handling
  res.status(200).json({ message: 'Callback endpoint ready' });
}

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const CLIENT_ID = process.env.QF_CLIENT_ID || "911c5b21-975f-4610-be81-f7158e7e6047";
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET || "oESUyMXqqRSkQP8HBRmATrZlwp";
const AUTH_BASE = process.env.QF_AUTH_BASE || "https://prelive-oauth2.quran.foundation";
const REDIRECT_URI = process.env.QF_REDIRECT_URI || "http://localhost:5173/auth/callback";

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    }).filter(([k]) => k)
  );
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code, state } = req.body;
    if (!code || !state) {
      return res.status(400).json({ error: "Missing code or state" });
    }

    const cookies = parseCookies(req.headers.cookie || "");
    const pkceRaw = cookies["qf_pkce"];
    if (!pkceRaw) {
      return res.status(400).json({ error: "PKCE cookie missing or expired. Please sign in again." });
    }

    let pkce;
    try {
      pkce = JSON.parse(Buffer.from(pkceRaw, "base64").toString("utf8"));
    } catch {
      return res.status(400).json({ error: "Invalid PKCE cookie" });
    }

    if (pkce.state !== state) {
      return res.status(400).json({ error: "State mismatch" });
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("code_verifier", pkce.codeVerifier);

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const tokenRes = await fetch(`${AUTH_BASE}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Token exchange failed:", tokenRes.status, errText);
      return res.status(tokenRes.status).json({ error: "Token exchange failed" });
    }

    const tokenData = await tokenRes.json();

    res.setHeader("Set-Cookie", [`qf_pkce=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`]);

    let user = null;
    if (tokenData.id_token) {
      try {
        const payload = tokenData.id_token.split(".")[1];
        user = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
      } catch {}
    }

    return res.status(200).json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      idToken: tokenData.id_token,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      user,
    });
  } catch (err) {
    console.error("Exchange error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const { generatePkcePair, randomString } = require("../../backend/utils/pkce");

const CLIENT_ID = process.env.QF_CLIENT_ID || "911c5b21-975f-4610-be81-f7158e7e6047";
const AUTH_BASE = process.env.QF_AUTH_BASE || "https://prelive-oauth2.quran.foundation";
const REDIRECT_URI = process.env.QF_REDIRECT_URI || "http://localhost:5173/auth/callback";
const SCOPES = "openid offline_access user note post";

module.exports = async (req, res) => {
  const { codeVerifier, codeChallenge } = generatePkcePair();
  const state = randomString();
  const nonce = randomString();

  const pkcePayload = Buffer.from(JSON.stringify({ codeVerifier, state, nonce })).toString("base64");
  const isProduction = process.env.NODE_ENV === "production";

  res.setHeader("Set-Cookie", [
    `qf_pkce=${pkcePayload}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax${isProduction ? "; Secure" : ""}`,
  ]);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl = `${AUTH_BASE}/oauth2/auth?${params.toString()}`;
  return res.status(200).json({ url: authUrl });
};

// /api/auth/logout.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accessToken } = req.body;
    const oauthUrl = process.env.VITE_QURAN_FOUNDATION_OAUTH_URL;
    
    if (accessToken) {
      // Optionally revoke the token
      await fetch(`${oauthUrl}/oauth/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          token: accessToken,
          client_id: process.env.VITE_QURAN_FOUNDATION_CLIENT_ID,
          client_secret: process.env.QURAN_FOUNDATION_CLIENT_SECRET
        })
      });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}
// /api/auth/me.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const accessToken = authHeader.substring(7);
    const oauthUrl = process.env.VITE_QURAN_FOUNDATION_OAUTH_URL;
    
    const response = await fetch(`${oauthUrl}/oauth/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch user info' });
    }
    
    const userInfo = await response.json();
    res.status(200).json(userInfo);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
}

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const CLIENT_ID = process.env.QF_CLIENT_ID || "911c5b21-975f-4610-be81-f7158e7e6047";
const CLIENT_SECRET = process.env.QF_CLIENT_SECRET || "oESUyMXqqRSkQP8HBRmATrZlwp";
const AUTH_BASE = process.env.QF_AUTH_BASE || "https://prelive-oauth2.quran.foundation";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Missing refreshToken" });
  }

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const tokenRes = await fetch(`${AUTH_BASE}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Refresh failed:", tokenRes.status, errText);
      return res.status(tokenRes.status).json({ error: "Failed to refresh" });
    }

    const tokenData = await tokenRes.json();

    return res.status(200).json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    });
  } catch (err) {
    console.error("Refresh error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://echoes-of-jannah.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const cookies = {};
  req.headers.cookie?.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=');
    cookies[key] = value;
  });
  
  const accessToken = cookies.access_token;
  
  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
  const API_BASE_URL = 'https://api.quran.foundation/api/v1';
  
  // GET - Fetch reflections
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${API_BASE_URL}/notes?page=1&per_page=50`, {
        headers: {
          'x-auth-token': accessToken,
          'x-client-id': CLIENT_ID
        }
      });
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch reflections' });
    }
  }
  
  // POST - Save reflection
  if (req.method === 'POST') {
    const { verseKey, content, isPublic = false } = req.body;
    
    try {
      const noteResponse = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': accessToken,
          'x-client-id': CLIENT_ID
        },
        body: JSON.stringify({
          resource_type: 'verse',
          resource_id: verseKey,
          body: content,
          language: 'en'
        })
      });
      
      const noteData = await noteResponse.json();
      
      if (isPublic && noteData.note) {
        await fetch(`${API_BASE_URL}/notes/${noteData.note.id}/publish`, {
          method: 'POST',
          headers: {
            'x-auth-token': accessToken,
            'x-client-id': CLIENT_ID
          }
        });
      }
      
      return res.status(200).json({ success: true, note: noteData.note });
      
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save reflection' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};

{
  "name": "echoes-oauth-api",
  "version": "1.0.0",
  "dependencies": {
    "axios": "^1.6.0"
  }
}


export function authenticateToken(req, res, next) {
  // Get token from Authorization header or cookie
  const authHeader = req.headers.authorization;
  let token;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Fallback to cookie
    const cookies = req.headers.cookie?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    token = cookies?.quran_access_token;
  }
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  req.accessToken = token;
  next();
}

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Proxy Quran API requests with authentication
router.get('/verses/:chapter/:verse', authenticateToken, async (req, res) => {
  try {
    const { chapter, verse } = req.params;
    const accessToken = req.accessToken;
    
    const response = await fetch(
      `https://api.quran.foundation/v1/quran/verses/${chapter}/${verse}`,
      {
        headers: {
          'x-auth-token': accessToken,
          'x-client-id': process.env.QURAN_CLIENT_ID,
        },
      }
    );
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/chapters', authenticateToken, async (req, res) => {
  try {
    const accessToken = req.accessToken;
    
    const response = await fetch('https://api.quran.foundation/v1/quran/chapters', {
      headers: {
        'x-auth-token': accessToken,
        'x-client-id': process.env.QURAN_CLIENT_ID,
      },
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

// src/api/reflections.js
// Syncs reflections with Quran Foundation APIs:
// - Private reflections → POST /auth/v1/notes
// - Public posts → POST /auth/v1/posts
// All calls use x-auth-token + x-client-id headers via authFetch from context.

/**
 * Create a private note (reflection) on Quran Foundation
 * @param {Function} authFetch - from useQuranAuth()
 * @param {{ verseKey: string, text: string, chapterId?: number, verseNumber?: number }} data
 */
export async function createNote(authFetch, { verseKey, text, chapterId, verseNumber }) {
  const body = {
    verse_key: verseKey,
    body: text,
    ...(chapterId && { chapter_id: chapterId }),
    ...(verseNumber && { verse_number: verseNumber }),
  };

  const res = await authFetch("/auth/v1/notes", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to save note");
  }

  return res.json();
}

/**
 * Publish a note (makes it public on Quran Reflect)
 * @param {Function} authFetch
 * @param {string} noteId
 */
export async function publishNote(authFetch, noteId) {
  const res = await authFetch(`/auth/v1/notes/${noteId}/publish`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to publish note");
  }

  return res.json();
}

/**
 * Create a public post directly on Quran Reflect
 * @param {Function} authFetch
 * @param {{ verseKey: string, text: string }} data
 */
export async function createPost(authFetch, { verseKey, text }) {
  const body = {
    verse_key: verseKey,
    body: text,
  };

  const res = await authFetch("/auth/v1/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create post");
  }

  return res.json();
}

/**
 * Get all notes for the current user
 * @param {Function} authFetch
 */
export async function getUserNotes(authFetch) {
  const res = await authFetch("/auth/v1/notes", { method: "GET" });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch notes");
  }

  return res.json();
}

/**
 * Save reflection — tries QF API first, falls back to localStorage
 * @param {Function|null} authFetch - null if not authenticated
 * @param {{ verseKey: string, text: string, isPublic?: boolean }} data
 */
export async function saveReflection(authFetch, { verseKey, text, isPublic = false }) {
  // Always save locally as backup
  const local = JSON.parse(localStorage.getItem("reflections") || "[]");
  const entry = { id: Date.now(), verseKey, text, isPublic, createdAt: new Date().toISOString() };
  local.unshift(entry);
  localStorage.setItem("reflections", JSON.stringify(local.slice(0, 100))); // keep last 100

  if (!authFetch) return { local: entry, synced: false };

  try {
    if (isPublic) {
      const post = await createPost(authFetch, { verseKey, text });
      return { local: entry, synced: true, remote: post };
    } else {
      const note = await createNote(authFetch, { verseKey, text });
      return { local: entry, synced: true, remote: note };
    }
  } catch (err) {
    console.warn("Could not sync to QF, saved locally only:", err.message);
    return { local: entry, synced: false, error: err.message };
  }
}

const crypto = require("crypto");

function base64url(buf) {
  return buf.toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generatePkcePair() {
  const codeVerifier = base64url(crypto.randomBytes(32));
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  const codeChallenge = base64url(hash);
  return { codeVerifier, codeChallenge };
}

function randomString(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex");
}

module.exports = { generatePkcePair, randomString, base64url };

// backend/utils/quranApi.js
const axios = require('axios');

let cachedToken = null;
let tokenExpiry = null;

// Use Production API for full Quran content
const CLIENT_ID = 'dbe50649-c969-4294-b4a8-feca89acd0a1';
const CLIENT_SECRET = 'Vr4_GmVxLeYxwUlH51lpV.1VMi';
const TOKEN_URL = 'https://oauth2.quran.foundation/token';
const API_BASE_URL = 'https://apis.quran.foundation/content/api/v4';

async function getAccessToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(TOKEN_URL, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    console.log('✅ Access token obtained successfully');
    return cachedToken;
  } catch (error) {
    console.error('❌ Failed to get access token:', error.response?.data || error.message);
    throw new Error('Authentication failed');
  }
}

async function apiRequest(endpoint, params = {}) {
  const token = await getAccessToken();
  
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  
  const response = await axios.get(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-auth-token': token,
      'x-client-id': CLIENT_ID,
      'Accept': 'application/json'
    }
  });
  
  return response.data;
}

// Get all chapters (surahs)
async function getAllSurahs() {
  try {
    const data = await apiRequest('/chapters', { language: 'en' });
    return data.chapters.map(ch => ({
      number: ch.id,
      name: ch.name_arabic,
      englishName: ch.name_simple,
      versesCount: ch.verses_count,
      revelationType: ch.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'
    }));
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
}

// Get complete surah with ALL verses
async function getSurah(surahNumber) {
  try {
    // Get chapter info
    const chapterData = await apiRequest(`/chapters/${surahNumber}`, { language: 'en' });
    
    // Get ALL verses with translations
    const versesData = await apiRequest(`/verses/by_chapter/${surahNumber}`, {
      language: 'en',
      translations: '131', // Sahih International translation ID
      words: 'false',
      fields: 'text_uthmani,verse_number'
    });
    
    const verses = versesData.verses.map(verse => ({
      number: verse.verse_number,
      arabic: verse.text_uthmani,
      translation: verse.translations?.[0]?.text || ''
    }));
    
    return {
      number: chapterData.chapter.id,
      name: chapterData.chapter.name_arabic,
      englishName: chapterData.chapter.name_simple,
      versesCount: chapterData.chapter.verses_count,
      revelationType: chapterData.chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
      verses: verses
    };
  } catch (error) {
    console.error(`Error fetching surah ${surahNumber}:`, error);
    throw error;
  }
}

// Get tafsir for a specific verse
async function getTafsir(surahNumber, verseNumber) {
  try {
    const data = await apiRequest(`/verses/by_key/${surahNumber}:${verseNumber}`, {
      tafsirs: '169' // Tafsir ID
    });
    return { text: data.verse?.tafsirs?.[0]?.text || null };
  } catch (error) {
    console.log(`Tafsir not available for ${surahNumber}:${verseNumber}`);
    return { text: null };
  }
}

// Search Quran
async function searchQuran(query) {
  try {
    // Use the search endpoint
    const searchUrl = `https://apis.quran.foundation/search/v1/search`;
    const token = await getAccessToken();
    
    const response = await axios.get(searchUrl, {
      params: {
        mode: 'advanced',
        query: query,
        size: 50,
        translation_ids: '131'
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
        'x-client-id': CLIENT_ID,
        'Accept': 'application/json'
      }
    });
    
    if (response.data && response.data.verses) {
      return response.data.verses.map(v => ({
        surahNumber: v.verse_key.split(':')[0],
        verseNumber: v.verse_key.split(':')[1],
        text: v.text,
        translation: v.translations?.[0]?.text || ''
      }));
    }
    return [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

module.exports = {
  getAllSurahs,
  getSurah,
  getTafsir,
  searchQuran
};

// backend/utils/quranFallback.js
// Complete Fallback data for all 114 surahs

const allSurahNames = [
  "Al-Fatiha", "Al-Baqarah", "Ali 'Imran", "An-Nisa", "Al-Ma'idah",
  "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
  "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr",
  "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Taha",
  "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan",
  "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum",
  "Luqman", "As-Sajda", "Al-Ahzab", "Saba", "Fatir",
  "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
  "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiya",
  "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman",
  "Al-Waqi'a", "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahina",
  "As-Saff", "Al-Jumu'a", "Al-Munafiqun", "At-Taghabun", "At-Talaq",
  "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqa", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyama",
  "Al-Insan", "Al-Mursalat", "An-Naba'", "An-Nazi'at", "'Abasa",
  "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj",
  "At-Tariq", "Al-A'la", "Al-Ghashiya", "Al-Fajr", "Al-Balad",
  "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin",
  "Al-'Alaq", "Al-Qadr", "Al-Bayyina", "Az-Zalzala", "Al-'Adiyat",
  "Al-Qari'a", "At-Takathur", "Al-'Asr", "Al-Humaza", "Al-Fil",
  "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr",
  "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

const versesCount = {
  1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
  11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
  21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
  31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
  41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
  51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
  61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
  81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
  91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
  101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
  111: 5, 112: 4, 113: 5, 114: 6
};

async function getAllSurahsFallback() {
  const surahs = [];
  for (let i = 1; i <= 114; i++) {
    surahs.push({
      number: i,
      name: `سورة ${allSurahNames[i-1]}`,
      englishName: allSurahNames[i-1],
      versesCount: versesCount[i] || 10,
      revelationType: i <= 86 ? 'Meccan' : 'Medinan'
    });
  }
  return surahs;
}

async function getSurahFallback(surahNumber) {
  const verseCount = versesCount[surahNumber] || 10;
  const verses = [];
  
  for (let i = 1; i <= Math.min(verseCount, 20); i++) {
    verses.push({
      number: i,
      arabic: i === 1 ? "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" : "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      translation: i === 1 ? "In the name of Allah, the Most Gracious, the Most Merciful" : "All praise is due to Allah, Lord of the worlds",
      juzNumber: Math.ceil(i / 7),
      pageNumber: Math.ceil(i / 15)
    });
  }
  
  return {
    number: surahNumber,
    name: `سورة ${allSurahNames[surahNumber-1]}`,
    englishName: allSurahNames[surahNumber-1],
    versesCount: verseCount,
    revelationType: surahNumber <= 86 ? 'Meccan' : 'Medinan',
    verses: verses
  };
}

module.exports = {
  getAllSurahsFallback,
  getSurahFallback
};

# ============================================================
#  BACKEND .env  →  place at: Echoes-Of-Jannah-main/backend/.env
#  ⚠️  Never commit this file to git
# ============================================================

# ── Quran Foundation OAuth2 — Pre-Production ─────────────────
QF_CLIENT_ID=911c5b21-975f-4610-be81-f7158e7e6047
QF_CLIENT_SECRET=oESUyMXqqRSkQP8HBRmATrZlwp
QF_AUTH_BASE=https://prelive-oauth2.quran.foundation
QF_REDIRECT_URI=http://localhost:5173/auth/callback

# ── Server ───────────────────────────────────────────────────
PORT=3001
NODE_ENV=development

# ============================================================
#  BACKEND .env.example  →  place at: Echoes-Of-Jannah-main/backend/.env.example
#  ✅ Safe to commit — contains NO real secrets
#  Usage: cp .env.example .env   then fill in your values
# ============================================================

# ── Quran Foundation OAuth2 ───────────────────────────────────
QF_CLIENT_ID=your_client_id_here
QF_CLIENT_SECRET=your_client_secret_here
QF_AUTH_BASE=https://prelive-oauth2.quran.foundation
QF_REDIRECT_URI=http://localhost:5173/auth/callback

# ── Server ───────────────────────────────────────────────────
PORT=3001
NODE_ENV=development

{
  "name": "quran-auth-backend",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "quran-auth-backend",
      "version": "1.0.0",
      "dependencies": {
        "axios": "^1.6.0",
        "cors": "^2.8.5",
        "dotenv": "^16.3.1",
        "express": "^4.18.2"
      }
    },
    "node_modules/accepts": {
      "version": "1.3.8",
      "resolved": "https://registry.npmjs.org/accepts/-/accepts-1.3.8.tgz",
      "integrity": "sha512-PYAthTa2m2VKxuvSD3DPC/Gy+U+sOA1LAuT8mkmRuvw+NACSaeXEQ+NHcVF7rONl6qcaxV3Uuemwawk+7+SJLw==",
      "license": "MIT",
      "dependencies": {
        "mime-types": "~2.1.34",
        "negotiator": "0.6.3"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/array-flatten": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/array-flatten/-/array-flatten-1.1.1.tgz",
      "integrity": "sha512-PCVAQswWemu6UdxsDFFX/+gVeYqKAod3D3UVm91jHwynguOwAvYPhx8nNlM++NqRcK6CxxpUafjmhIdKiHibqg==",
      "license": "MIT"
    },
    "node_modules/asynckit": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/asynckit/-/asynckit-0.4.0.tgz",
      "integrity": "sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==",
      "license": "MIT"
    },
    "node_modules/axios": {
      "version": "1.14.0",
      "resolved": "https://registry.npmjs.org/axios/-/axios-1.14.0.tgz",
      "integrity": "sha512-3Y8yrqLSwjuzpXuZ0oIYZ/XGgLwUIBU3uLvbcpb0pidD9ctpShJd43KSlEEkVQg6DS0G9NKyzOvBfUtDKEyHvQ==",
      "license": "MIT",
      "dependencies": {
        "follow-redirects": "^1.15.11",
        "form-data": "^4.0.5",
        "proxy-from-env": "^2.1.0"
      }
    },
    "node_modules/body-parser": {
      "version": "1.20.4",
      "resolved": "https://registry.npmjs.org/body-parser/-/body-parser-1.20.4.tgz",
      "integrity": "sha512-ZTgYYLMOXY9qKU/57FAo8F+HA2dGX7bqGc71txDRC1rS4frdFI5R7NhluHxH6M0YItAP0sHB4uqAOcYKxO6uGA==",
      "license": "MIT",
      "dependencies": {
        "bytes": "~3.1.2",
        "content-type": "~1.0.5",
        "debug": "2.6.9",
        "depd": "2.0.0",
        "destroy": "~1.2.0",
        "http-errors": "~2.0.1",
        "iconv-lite": "~0.4.24",
        "on-finished": "~2.4.1",
        "qs": "~6.14.0",
        "raw-body": "~2.5.3",
        "type-is": "~1.6.18",
        "unpipe": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8",
        "npm": "1.2.8000 || >= 1.4.16"
      }
    },
    "node_modules/bytes": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/bytes/-/bytes-3.1.2.tgz",
      "integrity": "sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/call-bound": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "get-intrinsic": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/combined-stream": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/combined-stream/-/combined-stream-1.0.8.tgz",
      "integrity": "sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==",
      "license": "MIT",
      "dependencies": {
        "delayed-stream": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/content-disposition": {
      "version": "0.5.4",
      "resolved": "https://registry.npmjs.org/content-disposition/-/content-disposition-0.5.4.tgz",
      "integrity": "sha512-FveZTNuGw04cxlAiWbzi6zTAL/lhehaWbTtgluJh4/E95DqMwTmha3KZN1aAWA8cFIhHzMZUvLevkw5Rqk+tSQ==",
      "license": "MIT",
      "dependencies": {
        "safe-buffer": "5.2.1"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/content-type": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-1.0.5.tgz",
      "integrity": "sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/cookie": {
      "version": "0.7.2",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-0.7.2.tgz",
      "integrity": "sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/cookie-signature": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.0.7.tgz",
      "integrity": "sha512-NXdYc3dLr47pBkpUCHtKSwIOQXLVn8dZEuywboCOJY/osA0wFSLlSawr3KN8qXJEyX66FcONTH8EIlVuK0yyFA==",
      "license": "MIT"
    },
    "node_modules/cors": {
      "version": "2.8.6",
      "resolved": "https://registry.npmjs.org/cors/-/cors-2.8.6.tgz",
      "integrity": "sha512-tJtZBBHA6vjIAaF6EnIaq6laBBP9aq/Y3ouVJjEfoHbRBcHBAHYcMh/w8LDrk2PvIMMq8gmopa5D4V8RmbrxGw==",
      "license": "MIT",
      "dependencies": {
        "object-assign": "^4",
        "vary": "^1"
      },
      "engines": {
        "node": ">= 0.10"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/debug": {
      "version": "2.6.9",
      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
      "license": "MIT",
      "dependencies": {
        "ms": "2.0.0"
      }
    },
    "node_modules/delayed-stream": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/delayed-stream/-/delayed-stream-1.0.0.tgz",
      "integrity": "sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/depd": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",
      "integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/destroy": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/destroy/-/destroy-1.2.0.tgz",
      "integrity": "sha512-2sJGJTaXIIaR1w4iJSNoN0hnMY7Gpc/n8D4qSCJw8QqFWXf7cuAgnEHxBpweaVcPevC2l3KpjYCx3NypQQgaJg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8",
        "npm": "1.2.8000 || >= 1.4.16"
      }
    },
    "node_modules/dotenv": {
      "version": "16.6.1",
      "resolved": "https://registry.npmjs.org/dotenv/-/dotenv-16.6.1.tgz",
      "integrity": "sha512-uBq4egWHTcTt33a72vpSG0z3HnPuIl6NqYcTrKEg2azoEyl2hpW0zqlxysq2pK9HlDIHyHyakeYaYnSAwd8bow==",
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://dotenvx.com"
      }
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/ee-first": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/ee-first/-/ee-first-1.1.1.tgz",
      "integrity": "sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==",
      "license": "MIT"
    },
    "node_modules/encodeurl": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-2.0.0.tgz",
      "integrity": "sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.1.tgz",
      "integrity": "sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-set-tostringtag": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz",
      "integrity": "sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/escape-html": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz",
      "integrity": "sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==",
      "license": "MIT"
    },
    "node_modules/etag": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/etag/-/etag-1.8.1.tgz",
      "integrity": "sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/express": {
      "version": "4.22.1",
      "resolved": "https://registry.npmjs.org/express/-/express-4.22.1.tgz",
      "integrity": "sha512-F2X8g9P1X7uCPZMA3MVf9wcTqlyNp7IhH5qPCI0izhaOIYXaW9L535tGA3qmjRzpH+bZczqq7hVKxTR4NWnu+g==",
      "license": "MIT",
      "dependencies": {
        "accepts": "~1.3.8",
        "array-flatten": "1.1.1",
        "body-parser": "~1.20.3",
        "content-disposition": "~0.5.4",
        "content-type": "~1.0.4",
        "cookie": "~0.7.1",
        "cookie-signature": "~1.0.6",
        "debug": "2.6.9",
        "depd": "2.0.0",
        "encodeurl": "~2.0.0",
        "escape-html": "~1.0.3",
        "etag": "~1.8.1",
        "finalhandler": "~1.3.1",
        "fresh": "~0.5.2",
        "http-errors": "~2.0.0",
        "merge-descriptors": "1.0.3",
        "methods": "~1.1.2",
        "on-finished": "~2.4.1",
        "parseurl": "~1.3.3",
        "path-to-regexp": "~0.1.12",
        "proxy-addr": "~2.0.7",
        "qs": "~6.14.0",
        "range-parser": "~1.2.1",
        "safe-buffer": "5.2.1",
        "send": "~0.19.0",
        "serve-static": "~1.16.2",
        "setprototypeof": "1.2.0",
        "statuses": "~2.0.1",
        "type-is": "~1.6.18",
        "utils-merge": "1.0.1",
        "vary": "~1.1.2"
      },
      "engines": {
        "node": ">= 0.10.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/finalhandler": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/finalhandler/-/finalhandler-1.3.2.tgz",
      "integrity": "sha512-aA4RyPcd3badbdABGDuTXCMTtOneUCAYH/gxoYRTZlIJdF0YPWuGqiAsIrhNnnqdXGswYk6dGujem4w80UJFhg==",
      "license": "MIT",
      "dependencies": {
        "debug": "2.6.9",
        "encodeurl": "~2.0.0",
        "escape-html": "~1.0.3",
        "on-finished": "~2.4.1",
        "parseurl": "~1.3.3",
        "statuses": "~2.0.2",
        "unpipe": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/follow-redirects": {
      "version": "1.15.11",
      "resolved": "https://registry.npmjs.org/follow-redirects/-/follow-redirects-1.15.11.tgz",
      "integrity": "sha512-deG2P0JfjrTxl50XGCDyfI97ZGVCxIpfKYmfyrQ54n5FO/0gfIES8C/Psl6kWVDolizcaaxZJnTS0QSMxvnsBQ==",
      "funding": [
        {
          "type": "individual",
          "url": "https://github.com/sponsors/RubenVerborgh"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=4.0"
      },
      "peerDependenciesMeta": {
        "debug": {
          "optional": true
        }
      }
    },
    "node_modules/form-data": {
      "version": "4.0.5",
      "resolved": "https://registry.npmjs.org/form-data/-/form-data-4.0.5.tgz",
      "integrity": "sha512-8RipRLol37bNs2bhoV67fiTEvdTrbMUYcFTiy3+wuuOnUog2QBHCZWXDRijWQfAkhBj2Uf5UnVaiWwA5vdd82w==",
      "license": "MIT",
      "dependencies": {
        "asynckit": "^0.4.0",
        "combined-stream": "^1.0.8",
        "es-set-tostringtag": "^2.1.0",
        "hasown": "^2.0.2",
        "mime-types": "^2.1.12"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/forwarded": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/forwarded/-/forwarded-0.2.0.tgz",
      "integrity": "sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/fresh": {
      "version": "0.5.2",
      "resolved": "https://registry.npmjs.org/fresh/-/fresh-0.5.2.tgz",
      "integrity": "sha512-zJ2mQYM18rEFOudeV4GShTGIQ7RbzA7ozbU9I/XBpm7kqgMywgmylMwXHxZJmkVoYkna9d2pVXVXPdYTP9ej8Q==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-tostringtag": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",
      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",
      "license": "MIT",
      "dependencies": {
        "has-symbols": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.2.tgz",
      "integrity": "sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/http-errors": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/http-errors/-/http-errors-2.0.1.tgz",
      "integrity": "sha512-4FbRdAX+bSdmo4AUFuS0WNiPz8NgFt+r8ThgNWmlrjQjt1Q7ZR9+zTlce2859x4KSXrwIsaeTqDoKQmtP8pLmQ==",
      "license": "MIT",
      "dependencies": {
        "depd": "~2.0.0",
        "inherits": "~2.0.4",
        "setprototypeof": "~1.2.0",
        "statuses": "~2.0.2",
        "toidentifier": "~1.0.1"
      },
      "engines": {
        "node": ">= 0.8"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/iconv-lite": {
      "version": "0.4.24",
      "resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.4.24.tgz",
      "integrity": "sha512-v3MXnZAcvnywkTUEZomIActle7RXXeedOR31wwl7VlyoXO4Qi9arvSenNQWne1TcRwhCL1HwLI21bEqdpj8/rA==",
      "license": "MIT",
      "dependencies": {
        "safer-buffer": ">= 2.1.2 < 3"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/inherits": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
      "license": "ISC"
    },
    "node_modules/ipaddr.js": {
      "version": "1.9.1",
      "resolved": "https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-1.9.1.tgz",
      "integrity": "sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/media-typer": {
      "version": "0.3.0",
      "resolved": "https://registry.npmjs.org/media-typer/-/media-typer-0.3.0.tgz",
      "integrity": "sha512-dq+qelQ9akHpcOl/gUVRTxVIOkAJ1wR3QAvb4RsVjS8oVoFjDGTc679wJYmUmknUF5HwMLOgb5O+a3KxfWapPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/merge-descriptors": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/merge-descriptors/-/merge-descriptors-1.0.3.tgz",
      "integrity": "sha512-gaNvAS7TZ897/rVaZ0nMtAyxNyi/pdbjbAwUpFQpN70GqnVfOiXpeUUMKRBmzXaSQ8DdTX4/0ms62r2K+hE6mQ==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/methods": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/methods/-/methods-1.1.2.tgz",
      "integrity": "sha512-iclAHeNqNm68zFtnZ0e+1L2yUIdvzNoauKU4WBA3VvH/vPFieF7qfRlwUZU+DA9P9bPXIS90ulxoUoCH23sV2w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/mime/-/mime-1.6.0.tgz",
      "integrity": "sha512-x0Vn8spI+wuJ1O6S7gnbaQg8Pxh4NNHb7KSINmEWKiPE4RKOplvijn+NkmYmmRgP68mc70j2EbeTFRsrswaQeg==",
      "license": "MIT",
      "bin": {
        "mime": "cli.js"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/mime-db": {
      "version": "1.52.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime-types": {
      "version": "2.1.35",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "1.52.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/ms": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
      "license": "MIT"
    },
    "node_modules/negotiator": {
      "version": "0.6.3",
      "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-0.6.3.tgz",
      "integrity": "sha512-+EUsqGPLsM+j/zdChZjsnX51g4XrHFOIXwfnCVPGlQk/k5giakcKsuxCObBRu6DSm9opw/O6slWbJdghQM4bBg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-inspect": {
      "version": "1.13.4",
      "resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",
      "integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/on-finished": {
      "version": "2.4.1",
      "resolved": "https://registry.npmjs.org/on-finished/-/on-finished-2.4.1.tgz",
      "integrity": "sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==",
      "license": "MIT",
      "dependencies": {
        "ee-first": "1.1.1"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/parseurl": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/parseurl/-/parseurl-1.3.3.tgz",
      "integrity": "sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/path-to-regexp": {
      "version": "0.1.13",
      "resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-0.1.13.tgz",
      "integrity": "sha512-A/AGNMFN3c8bOlvV9RreMdrv7jsmF9XIfDeCd87+I8RNg6s78BhJxMu69NEMHBSJFxKidViTEdruRwEk/WIKqA==",
      "license": "MIT"
    },
    "node_modules/proxy-addr": {
      "version": "2.0.7",
      "resolved": "https://registry.npmjs.org/proxy-addr/-/proxy-addr-2.0.7.tgz",
      "integrity": "sha512-llQsMLSUDUPT44jdrU/O37qlnifitDP+ZwrmmZcoSKyLKvtZxpyV0n2/bD/N4tBAAZ/gJEdZU7KMraoK1+XYAg==",
      "license": "MIT",
      "dependencies": {
        "forwarded": "0.2.0",
        "ipaddr.js": "1.9.1"
      },
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/proxy-from-env": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/proxy-from-env/-/proxy-from-env-2.1.0.tgz",
      "integrity": "sha512-cJ+oHTW1VAEa8cJslgmUZrc+sjRKgAKl3Zyse6+PV38hZe/V6Z14TbCuXcan9F9ghlz4QrFr2c92TNF82UkYHA==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/qs": {
      "version": "6.14.2",
      "resolved": "https://registry.npmjs.org/qs/-/qs-6.14.2.tgz",
      "integrity": "sha512-V/yCWTTF7VJ9hIh18Ugr2zhJMP01MY7c5kh4J870L7imm6/DIzBsNLTXzMwUA3yZ5b/KBqLx8Kp3uRvd7xSe3Q==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "side-channel": "^1.1.0"
      },
      "engines": {
        "node": ">=0.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/range-parser": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/range-parser/-/range-parser-1.2.1.tgz",
      "integrity": "sha512-Hrgsx+orqoygnmhFbKaHE6c296J+HTAQXoxEF6gNupROmmGJRoyzfG3ccAveqCBrwr/2yxQ5BVd/GTl5agOwSg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/raw-body": {
      "version": "2.5.3",
      "resolved": "https://registry.npmjs.org/raw-body/-/raw-body-2.5.3.tgz",
      "integrity": "sha512-s4VSOf6yN0rvbRZGxs8Om5CWj6seneMwK3oDb4lWDH0UPhWcxwOWw5+qk24bxq87szX1ydrwylIOp2uG1ojUpA==",
      "license": "MIT",
      "dependencies": {
        "bytes": "~3.1.2",
        "http-errors": "~2.0.1",
        "iconv-lite": "~0.4.24",
        "unpipe": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/safe-buffer": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz",
      "integrity": "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/safer-buffer": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
      "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
      "license": "MIT"
    },
    "node_modules/send": {
      "version": "0.19.2",
      "resolved": "https://registry.npmjs.org/send/-/send-0.19.2.tgz",
      "integrity": "sha512-VMbMxbDeehAxpOtWJXlcUS5E8iXh6QmN+BkRX1GARS3wRaXEEgzCcB10gTQazO42tpNIya8xIyNx8fll1OFPrg==",
      "license": "MIT",
      "dependencies": {
        "debug": "2.6.9",
        "depd": "2.0.0",
        "destroy": "1.2.0",
        "encodeurl": "~2.0.0",
        "escape-html": "~1.0.3",
        "etag": "~1.8.1",
        "fresh": "~0.5.2",
        "http-errors": "~2.0.1",
        "mime": "1.6.0",
        "ms": "2.1.3",
        "on-finished": "~2.4.1",
        "range-parser": "~1.2.1",
        "statuses": "~2.0.2"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/send/node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "license": "MIT"
    },
    "node_modules/serve-static": {
      "version": "1.16.3",
      "resolved": "https://registry.npmjs.org/serve-static/-/serve-static-1.16.3.tgz",
      "integrity": "sha512-x0RTqQel6g5SY7Lg6ZreMmsOzncHFU7nhnRWkKgWuMTu5NN0DR5oruckMqRvacAN9d5w6ARnRBXl9xhDCgfMeA==",
      "license": "MIT",
      "dependencies": {
        "encodeurl": "~2.0.0",
        "escape-html": "~1.0.3",
        "parseurl": "~1.3.3",
        "send": "~0.19.1"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/setprototypeof": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/setprototypeof/-/setprototypeof-1.2.0.tgz",
      "integrity": "sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==",
      "license": "ISC"
    },
    "node_modules/side-channel": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.0.tgz",
      "integrity": "sha512-ZX99e6tRweoUXqR+VBrslhda51Nh5MTQwou5tnUDgbtyM0dBgmhEDtWGP/xbKn6hqfPRHujUNwz5fy/wbbhnpw==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.3",
        "side-channel-list": "^1.0.0",
        "side-channel-map": "^1.0.1",
        "side-channel-weakmap": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-list": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.0.tgz",
      "integrity": "sha512-FCLHtRD/gnpCiCHEiJLOwdmFP+wzCmDEkc9y7NsYxeF4u7Btsn1ZuwgwJGxImImHicJArLP4R0yX4c2KCrMrTA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-map": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",
      "integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-weakmap": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",
      "integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3",
        "side-channel-map": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/statuses": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/statuses/-/statuses-2.0.2.tgz",
      "integrity": "sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/toidentifier": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/toidentifier/-/toidentifier-1.0.1.tgz",
      "integrity": "sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.6"
      }
    },
    "node_modules/type-is": {
      "version": "1.6.18",
      "resolved": "https://registry.npmjs.org/type-is/-/type-is-1.6.18.tgz",
      "integrity": "sha512-TkRKr9sUTxEH8MdfuCSP7VizJyzRNMjj2J2do2Jr3Kym598JVdEksuzPQCnlFPW4ky9Q+iA+ma9BGm06XQBy8g==",
      "license": "MIT",
      "dependencies": {
        "media-typer": "0.3.0",
        "mime-types": "~2.1.24"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/unpipe": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/unpipe/-/unpipe-1.0.0.tgz",
      "integrity": "sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/utils-merge": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/utils-merge/-/utils-merge-1.0.1.tgz",
      "integrity": "sha512-pMZTvIkT1d+TFGvDOqodOclx0QWkkgi6Tdoa8gC8ffGAAqz9pzPTZWAybbsHHoED/ztMtkv/VoYTYyShUn81hA==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4.0"
      }
    },
    "node_modules/vary": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/vary/-/vary-1.1.2.tgz",
      "integrity": "sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    }
  }
}


{
  "type": "module",
  "name": "quran-auth-backend",
  "version": "1.0.0",
  "description": "Quran Foundation OAuth Backend for Echoes of Jannah",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}

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

{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}


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

// src/api/index.js
// Main export file for all APIs

export * from './quranBackendApi';
export { default as API_CONFIG } from './config';

// Re-export for convenience
export { default } from './quranBackendApi';

// src/api/quranApi.js
// Unified API - uses AlQuran Cloud (free, no auth required)

const API_BASE = 'https://api.alquran.cloud/v1';

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
const BISMILLAH_SIMPLE = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";

// ============ VERSE APIs ============
export const getVerse = async (surahNumber, verseNumber) => {
  try {
    const response = await fetch(`${API_BASE}/ayah/${surahNumber}:${verseNumber}/editions/quran-uthmani,en.sahih`);
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      const arabicData = data.data.find(d => d.edition?.identifier === 'quran-uthmani') || data.data[0];
      const englishData = data.data.find(d => d.edition?.identifier === 'en.sahih') || data.data[1];
      
      return {
        success: true,
        data: {
          arabic: arabicData?.text || '',
          text: englishData?.text || '',
          surah: surahNumber,
          verse: verseNumber
        }
      };
    }
    return { success: false, data: null };
  } catch (error) {
    console.error('Error fetching verse:', error);
    return { success: false, data: null };
  }
};

export const getTranslations = async (surahNumber, verseNumber) => {
  const result = await getVerse(surahNumber, verseNumber);
  return result.success ? [{ language: 'en', text: result.data.text }] : [];
};

export const getTafsir = async (surahNumber, verseNumber) => {
  try {
    const response = await fetch(`${API_BASE}/tafsir/169/${surahNumber}/${verseNumber}`);
    const data = await response.json();
    if (data.code === 200 && data.data) {
      return { success: true, data: { text: data.data.text } };
    }
    return { success: false, data: null };
  } catch (error) {
    return { success: false, data: null };
  }
};

export const getAudioRecitation = async (surahNumber, verseNumber, reciter = 'ar.alafasy') => {
  const surahNum = surahNumber.toString().padStart(3, '0');
  const verseNum = verseNumber.toString().padStart(3, '0');
  return {
    success: true,
    audioUrl: `https://cdn.islamic.network/quran/audio/128/${reciter}/${surahNum}${verseNum}.mp3`
  };
};

// ============ SURAH APIs ============
export const getAllSurahs = async () => {
  try {
    const response = await fetch(`${API_BASE}/surah`);
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      const surahs = data.data.map(s => ({
        number: s.number,
        name: s.name,
        englishName: s.englishName,
        versesCount: s.numberOfAyahs,
        revelationType: s.revelationType === 'Meccan' ? 'Meccan' : 'Medinan'
      }));
      return { success: true, data: surahs };
    }
    return { success: false, data: [] };
  } catch (error) {
    console.error('Error fetching surahs:', error);
    return { success: false, data: [] };
  }
};

export const getSurah = async (surahNumber, translationId = 'en.sahih') => {
  try {
    const response = await fetch(`${API_BASE}/surah/${surahNumber}/editions/quran-uthmani,${translationId}`);
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      const arabicEdition = data.data.find(d => d.edition?.identifier === 'quran-uthmani');
      const englishEdition = data.data.find(d => d.edition?.identifier === translationId);
      const surahInfo = data.data[0];
      
      let verses = surahInfo.ayahs.map((ayah, i) => ({
        number: ayah.numberInSurah,
        arabic: arabicEdition?.ayahs[i]?.text || ayah.text,
        translation: englishEdition?.ayahs[i]?.text || '',
        juz: ayah.juz,
        page: ayah.page
      }));

      let hasBismillah = false;

      // Separate Bismillah from first verse (skip Al-Fatiha [1] and At-Tawbah [9])
      if (surahNumber !== 1 && surahNumber !== 9 && verses.length > 0) {
        const firstArabic = verses[0].arabic;
        
        if (firstArabic.startsWith(BISMILLAH) || firstArabic.startsWith(BISMILLAH_SIMPLE)) {
          if (firstArabic.startsWith(BISMILLAH)) {
            verses[0].arabic = firstArabic.substring(BISMILLAH.length).trim();
          } else {
            verses[0].arabic = firstArabic.substring(BISMILLAH_SIMPLE.length).trim();
          }
          
          verses.unshift({
            number: 0,
            arabic: BISMILLAH,
            translation: "In the name of Allah, the Most Gracious, the Most Merciful.",
            juz: verses[0].juz,
            page: verses[0].page,
            isBismillah: true
          });
          
          hasBismillah = true;
        }
      }
      
      return {
        success: true,
        data: {
          number: surahInfo.number,
          name: surahInfo.name,
          englishName: surahInfo.englishName,
          versesCount: surahInfo.numberOfAyahs,
          revelationType: surahInfo.revelationType,
          verses,
          hasBismillah
        }
      };
    }
    return { success: false, data: null };
  } catch (error) {
    console.error('Error fetching surah:', error);
    return { success: false, data: null };
  }
};

export const getSurahs = async () => {
  const result = await getAllSurahs();
  return result.data || [];
};

export const getJuz = async (juzNumber, translationId = 'en.sahih') => {
  try {
    const response = await fetch(`${API_BASE}/juz/${juzNumber}/editions/quran-uthmani,${translationId}`);
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      const editions = Array.isArray(data.data) ? data.data : [data.data];
      const arabicEdition = editions.find(d => d.edition?.identifier === 'quran-uthmani') || editions[0];
      const englishEdition = editions.find(d => d.edition?.identifier === translationId) || editions[1];
      
      const verses = (arabicEdition.ayahs || []).map((ayah, i) => ({
        number: ayah.numberInSurah,
        surahNumber: ayah.surah.number,
        surahName: ayah.surah.englishName,
        arabic: ayah.text,
        translation: englishEdition?.ayahs?.[i]?.text || '',
        juz: juzNumber,
        page: ayah.page
      }));
      
      return {
        success: true,
        data: {
          number: juzNumber,
          verses,
          surahs: editions[0].surahs
        }
      };
    }
    return { success: false, data: null };
  } catch (error) {
    console.error('Error fetching juz:', error);
    return { success: false, data: null };
  }
};

// ============ SEARCH ============
export const searchQuran = async (query) => {
  try {
    const surahs = await getSurahs();
    const results = surahs
      .filter(s => 
        s.englishName?.toLowerCase().includes(query.toLowerCase()) ||
        s.name?.includes(query) ||
        s.number?.toString() === query
      )
      .map(s => ({
        surahNumber: s.number,
        verseNumber: 1,
        text: s.name,
        translation: `${s.englishName} - ${s.versesCount} verses`,
        isSurah: true
      }));
    return { success: true, data: { results: results.slice(0, 30) } };
  } catch (error) {
    return { success: false, data: { results: [] } };
  }
};

// ============ USER APIs (LocalStorage) ============
export const saveBookmark = async (userId, verseKey, surahNumber, verseNumber, notes = '') => {
  const bookmarks = JSON.parse(localStorage.getItem(`quran_bookmarks_${userId}`) || '[]');
  const existing = bookmarks.find(b => b.verseKey === verseKey);
  
  if (existing) {
    existing.notes = notes;
    existing.updatedAt = new Date().toISOString();
  } else {
    bookmarks.push({ id: Date.now(), verseKey, surahNumber, verseNumber, notes, createdAt: new Date().toISOString() });
  }
  
  localStorage.setItem(`quran_bookmarks_${userId}`, JSON.stringify(bookmarks));
  return { success: true, data: bookmarks };
};

export const getBookmarks = async (userId) => {
  const bookmarks = JSON.parse(localStorage.getItem(`quran_bookmarks_${userId}`) || '[]');
  return { success: true, data: bookmarks };
};

export const removeBookmark = async (userId, verseKey) => {
  const bookmarks = JSON.parse(localStorage.getItem(`quran_bookmarks_${userId}`) || '[]');
  const filtered = bookmarks.filter(b => b.verseKey !== verseKey);
  localStorage.setItem(`quran_bookmarks_${userId}`, JSON.stringify(filtered));
  return { success: true };
};

export const updateActivity = async (userId, activityType, data = {}) => {
  const activities = JSON.parse(localStorage.getItem(`activities_${userId}`) || '[]');
  activities.unshift({ type: activityType, ...data, timestamp: new Date().toISOString() });
  localStorage.setItem(`activities_${userId}`, JSON.stringify(activities.slice(0, 100)));
  return { success: true };
};

export const updateStreak = async (userId) => {
  const today = new Date().toDateString();
  const lastActive = localStorage.getItem(`last_active_${userId}`);
  let streak = parseInt(localStorage.getItem(`streak_${userId}`) || '0');
  
  if (lastActive !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    streak = (lastActive === yesterday) ? streak + 1 : 1;
    localStorage.setItem(`last_active_${userId}`, today);
    localStorage.setItem(`streak_${userId}`, streak.toString());
  }
  return { success: true, data: { streak } };
};

export const getProfile = async (userId) => {
  const xp = parseInt(localStorage.getItem(`xp_${userId}`) || '0');
  const streak = parseInt(localStorage.getItem(`streak_${userId}`) || '0');
  return {
    success: true,
    data: {
      userId,
      xp,
      level: Math.floor(xp / 100) + 1,
      streak,
      joinedAt: localStorage.getItem(`joined_${userId}`) || new Date().toISOString()
    }
  };
};

export const addXP = async (userId, amount) => {
  const currentXP = parseInt(localStorage.getItem(`xp_${userId}`) || '0');
  const newXP = currentXP + amount;
  localStorage.setItem(`xp_${userId}`, newXP.toString());
  
  const oldLevel = Math.floor(currentXP / 100) + 1;
  const newLevel = Math.floor(newXP / 100) + 1;
  
  return { success: true, data: { xp: newXP, leveledUp: newLevel > oldLevel, newLevel } };
};

export const getReflections = async (userId) => {
  const reflections = JSON.parse(localStorage.getItem(`reflections_${userId}`) || '[]');
  return { success: true, data: reflections };
};

export const saveReflection = async (userId, reflection) => {
  const reflections = JSON.parse(localStorage.getItem(`reflections_${userId}`) || '[]');
  const newReflection = { id: Date.now(), ...reflection, createdAt: new Date().toISOString() };
  reflections.unshift(newReflection);
  localStorage.setItem(`reflections_${userId}`, JSON.stringify(reflections));
  return { success: true, data: newReflection };
};

export const initializeUser = (userId) => {
  if (!localStorage.getItem(`joined_${userId}`)) {
    localStorage.setItem(`joined_${userId}`, new Date().toISOString());
    localStorage.setItem(`xp_${userId}`, '0');
    localStorage.setItem(`streak_${userId}`, '0');
  }
};

// ============ EXTRA FUNCTIONS ============
export const getReciters = async () => {
  return [
    { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
    { id: 'ar.abdulbasit', name: 'Abdul Basit' },
    { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' }
  ];
};

export const getUserActivities = async (userId) => {
  return JSON.parse(localStorage.getItem(`activities_${userId}`) || '[]');
};

export const getSpiritualDNA = async (userId) => {
  const profile = await getProfile(userId);
  const reflections = await getReflections(userId);
  const streak = parseInt(localStorage.getItem(`streak_${userId}`) || '0');
  
  const emotionCount = {};
  reflections.data?.forEach(r => {
    if (r.emotion) emotionCount[r.emotion] = (emotionCount[r.emotion] || 0) + 1;
  });
  
  const sorted = Object.entries(emotionCount).sort((a, b) => b[1] - a[1]);
  const traits = sorted.slice(0, 5).map(e => e[0].charAt(0).toUpperCase() + e[0].slice(1));
  
  return {
    dominantTraits: traits.length ? traits : ['Grateful', 'Peaceful', 'Hopeful', 'Compassionate', 'Reflective'],
    spiritualScore: Math.min(100, Math.floor((profile.data?.xp || 0) / 10) + (streak * 2))
  };
};

export const calculateSpiritualDNA = getSpiritualDNA;
export const saveSpiritualDNA = async (userId, dna) => {
  localStorage.setItem(`spiritual_dna_${userId}`, JSON.stringify(dna));
  return dna;
};

// ============ API OBJECTS ============
export const quranApi = {
  getVerse, getTranslations, getTafsir, getAudioRecitation,
  getAllSurahs, getSurahs, getSurah, getJuz, search: searchQuran, getReciters,
  getRandomVerse: async () => getVerse(Math.floor(Math.random() * 114) + 1, 1)
};

export const userApi = {
  getProfile, addXP, updateStreak, getBookmarks, saveBookmark, removeBookmark,
  updateActivity, getReflections, saveReflection, getUserActivities,
  getSpiritualDNA, calculateSpiritualDNA, saveSpiritualDNA,
  getUserReflections: getReflections,
  getAchievements: async (userId) => {
    const profile = await getProfile(userId);
    const bookmarks = await getBookmarks(userId);
    const streak = parseInt(localStorage.getItem(`streak_${userId}`) || '0');
    const xp = profile.data?.xp || 0;
    
    return {
      success: true,
      data: [
        { id: 'first_verse', name: 'First Verse', achieved: xp > 0, icon: '📖' },
        { id: 'scholar', name: 'Scholar', achieved: xp >= 100, icon: '🎓' },
        { id: 'streak_7', name: 'Week Warrior', achieved: streak >= 7, icon: '⚡' },
        { id: 'streak_30', name: 'Monthly Master', achieved: streak >= 30, icon: '🏆' },
        { id: 'bookworm', name: 'Bookworm', achieved: (bookmarks.data?.length || 0) >= 10, icon: '📚' }
      ]
    };
  }
};

export default { quranApi, userApi };

// /src/api/quranBackendApi.js
import { useQuranAuth } from '../contexts/QuranAuthContext';

const API_BASE_URL = import.meta.env.VITE_QURAN_FOUNDATION_API_URL;
const CLIENT_ID = import.meta.env.VITE_QURAN_FOUNDATION_CLIENT_ID;

class QuranBackendApi {
  constructor(getAccessToken) {
    this.getAccessToken = getAccessToken;
  }

  async request(endpoint, options = {}) {
    const accessToken = await this.getAccessToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'x-client-id': CLIENT_ID,
      ...options.headers
    };
    
    if (accessToken) {
      headers['x-auth-token'] = accessToken;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Notes API
  async createNote(data) {
    return this.request('/v1/notes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getNotes() {
    return this.request('/v1/notes');
  }

  async getNote(noteId) {
    return this.request(`/v1/notes/${noteId}`);
  }

  async updateNote(noteId, data) {
    return this.request(`/v1/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteNote(noteId) {
    return this.request(`/v1/notes/${noteId}`, {
      method: 'DELETE'
    });
  }

  async publishNote(noteId) {
    return this.request(`/v1/notes/${noteId}/publish`, {
      method: 'POST'
    });
  }

  // Posts API (public reflections)
  async createPost(data) {
    return this.request('/v1/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/v1/posts${queryString ? `?${queryString}` : ''}`);
  }

  async getPost(postId) {
    return this.request(`/v1/posts/${postId}`);
  }

  // User API
  async getUserProfile() {
    return this.request('/v1/user/profile');
  }

  async updateUserProfile(data) {
    return this.request('/v1/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
}

// Hook to use the API
export const useQuranBackendApi = () => {
  const { getAccessToken } = useQuranAuth();
  return new QuranBackendApi(getAccessToken);
};

export default QuranBackendApi;
// src/api/quranFoundationApi.js
// Complete Quran.Foundation API integration

// ============ CONFIGURATION ============
const USE_PRODUCTION = false;
const USE_CORS_PROXY = import.meta.env.DEV;

const PREPROD_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_QF_CLIENT_ID || '911c5b21-975f-4610-be81-f7158e7e6047',
  CLIENT_SECRET: import.meta.env.VITE_QF_CLIENT_SECRET || 'oESUyMXqqRSkQP8HBRmATrZlwp',
  TOKEN_URL: 'https://prelive-oauth2.quran.foundation/token',
  API_BASE_URL: 'https://prelive-api.quran.foundation'
};

const PROD_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_QF_CLIENT_ID || 'dbe50649-c969-4294-b4a8-feca89acd0a1',
  CLIENT_SECRET: import.meta.env.VITE_QF_CLIENT_SECRET || 'Vr4_GmVxLeYxwUlH51lpV.1VMi',
  TOKEN_URL: 'https://oauth2.quran.foundation/token',
  API_BASE_URL: 'https://api.quran.foundation'
};

const config = USE_PRODUCTION ? PROD_CONFIG : PREPROD_CONFIG;

if (USE_CORS_PROXY) {
  config.TOKEN_URL = '/oauth-quran/token';
  config.API_BASE_URL = '/api-quran';
  console.log('🔄 Using Vite proxy for API requests');
}

let cachedToken = null;
let tokenExpiry = null;

// ============ AUTHENTICATION ============
export const getAccessToken = async () => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  try {
    const response = await fetch(config.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: config.CLIENT_ID,
        client_secret: config.CLIENT_SECRET,
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token response:', errorText);
      throw new Error(`Token request failed: ${response.status}`);
    }
    
    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
    console.log(`✅ Token obtained for ${USE_PRODUCTION ? 'Production' : 'Pre-Production'}`);
    return cachedToken;
  } catch (error) {
    console.error('❌ Failed to get access token:', error);
    throw error;
  }
};

// ============ API REQUEST HELPER ============
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = await getAccessToken();
    const url = `${config.API_BASE_URL}${endpoint}`;
    console.log(`📡 API Request: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request error (${endpoint}):`, error);
    throw error;
  }
};

// ============ VERSE APIs ============
export const getVerse = async (surahNumber, verseNumber) => {
  try {
    const data = await apiRequest(`/v1/verse/${surahNumber}/${verseNumber}`);
    return {
      success: true,
      data: {
        text: data.text || data.translation || data.english,
        arabic: data.arabic || data.text_uthmani || data.text_indopak,
        surah: data.surah || surahNumber,
        verse: data.verse || verseNumber
      }
    };
  } catch (error) {
    console.error('Error fetching verse:', error);
    // Return null so the caller knows it failed
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
};

// ============ TRANSLATION APIs ============
export const getTranslations = async (surahNumber, verseNumber, languages = ['en']) => {
  try {
    const translations = [];
    for (const lang of languages) {
      try {
        const data = await apiRequest(`/v1/translation/${surahNumber}/${verseNumber}?language=${lang}`);
        if (data && data.text) {
          translations.push({
            language: lang,
            text: data.text,
            name: getTranslatorName(lang)
          });
        }
      } catch (err) {
        console.log(`Translation not available for ${lang}`);
      }
    }
    return translations;
  } catch (error) {
    console.error('Error fetching translations:', error);
    return [];
  }
};

const getTranslatorName = (lang) => {
  const names = {
    'en': 'Sahih International',
    'ur': 'Abul Ala Maududi',
    'bn': 'Muhiuddin Khan',
    'fr': 'Muhammad Hamidullah',
    'es': 'Julio Cortes',
    'tr': 'Diyanet Isleri'
  };
  return names[lang] || `${lang.toUpperCase()} Translation`;
};

// ============ TAFSIR APIs ============
export const getTafsir = async (surahNumber, verseNumber) => {
  try {
    const data = await apiRequest(`/v1/tafsir/${surahNumber}/${verseNumber}`);
    return {
      success: true,
      data: {
        text: data.text || data.tafsir,
        source: data.source || 'Ibn Kathir'
      }
    };
  } catch (error) {
    console.error('Error fetching tafsir:', error);
    return { success: false, data: null, error: error.message };
  }
};

// ============ SURAH APIs ============
export const getAllSurahs = async () => {
  try {
    const data = await apiRequest('/v1/surah');
    return { success: true, data: data };
  } catch (error) {
    console.error('Error fetching surahs:', error);
    return { success: false, data: [] };
  }
};

export const getSurah = async (surahNumber) => {
  try {
    const data = await apiRequest(`/v1/surah/${surahNumber}`);
    return { success: true, data: data };
  } catch (error) {
    console.error('Error fetching surah:', error);
    return { success: false, data: null };
  }
};

// ============ USER APIs (Local Storage) ============
export const saveBookmark = async (userId, verseKey, surahNumber, verseNumber, notes = '') => {
  try {
    const bookmarks = JSON.parse(localStorage.getItem(`bookmarks_${userId}`) || '[]');
    const existingIndex = bookmarks.findIndex(b => b.verseKey === verseKey);
    
    if (existingIndex >= 0) {
      bookmarks[existingIndex] = {
        ...bookmarks[existingIndex],
        notes,
        updatedAt: new Date().toISOString()
      };
    } else {
      bookmarks.push({
        id: Date.now(),
        verseKey,
        surahNumber,
        verseNumber,
        notes,
        createdAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(bookmarks));
    return { success: true, data: bookmarks };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getBookmarks = async (userId) => {
  try {
    const bookmarks = JSON.parse(localStorage.getItem(`bookmarks_${userId}`) || '[]');
    return { success: true, data: bookmarks };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
};

export const removeBookmark = async (userId, bookmarkId) => {
  try {
    let bookmarks = JSON.parse(localStorage.getItem(`bookmarks_${userId}`) || '[]');
    bookmarks = bookmarks.filter(b => b.id !== bookmarkId && b.verseKey !== bookmarkId);
    localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(bookmarks));
    return { success: true, data: bookmarks };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateActivity = async (userId, activityType, count = 1) => {
  try {
    const activities = JSON.parse(localStorage.getItem(`activities_${userId}`) || '[]');
    activities.push({
      type: activityType,
      count,
      timestamp: new Date().toISOString()
    });
    if (activities.length > 1000) activities.shift();
    localStorage.setItem(`activities_${userId}`, JSON.stringify(activities));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateStreak = async (userId) => {
  try {
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem(`lastActive_${userId}`);
    let streak = parseInt(localStorage.getItem(`streak_${userId}`) || '0');
    
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive === yesterday.toDateString()) {
        streak++;
      } else {
        streak = 1;
      }
      
      localStorage.setItem(`streak_${userId}`, streak.toString());
      localStorage.setItem(`lastActive_${userId}`, today);
    }
    
    return { success: true, data: { streak } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getProfile = async (userId) => {
  try {
    const profile = localStorage.getItem(`profile_${userId}`);
    if (!profile) {
      const newProfile = { xp: 0, level: 1, createdAt: new Date().toISOString() };
      localStorage.setItem(`profile_${userId}`, JSON.stringify(newProfile));
      return { success: true, data: newProfile };
    }
    return { success: true, data: JSON.parse(profile) };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
};

export const addXP = async (userId, amount) => {
  try {
    const profile = await getProfile(userId);
    const newXP = (profile.data?.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const updatedProfile = { xp: newXP, level: newLevel, lastUpdated: new Date().toISOString() };
    localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
    return { success: true, data: updatedProfile };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getReflections = async (userId) => {
  try {
    const reflections = JSON.parse(localStorage.getItem(`reflections_${userId}`) || '[]');
    return { success: true, data: reflections };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
};

export const saveReflection = async (userId, reflection) => {
  try {
    const reflections = JSON.parse(localStorage.getItem(`reflections_${userId}`) || '[]');
    const newReflection = {
      id: Date.now(),
      ...reflection,
      createdAt: new Date().toISOString()
    };
    reflections.push(newReflection);
    localStorage.setItem(`reflections_${userId}`, JSON.stringify(reflections));
    return { success: true, data: newReflection };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const postReflection = async (userId, reflection) => {
  try {
    const reflections = JSON.parse(localStorage.getItem(`community_reflections_${userId}`) || '[]');
    const newReflection = {
      id: Date.now(),
      userId: userId,
      ...reflection,
      likes: 0,
      comments: [],
      createdAt: reflection.createdAt || new Date().toISOString()
    };
    reflections.push(newReflection);
    localStorage.setItem(`community_reflections_${userId}`, JSON.stringify(reflections));
    
    const globalReflections = JSON.parse(localStorage.getItem('community_reflections_all') || '[]');
    globalReflections.push(newReflection);
    localStorage.setItem('community_reflections_all', JSON.stringify(globalReflections));
    
    return newReflection;
  } catch (error) {
    console.error('Error posting reflection:', error);
    return null;
  }
};

export const getCommunityReflections = async () => {
  try {
    const reflections = JSON.parse(localStorage.getItem('community_reflections_all') || '[]');
    return reflections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error getting community reflections:', error);
    return [];
  }
};

export const getSpiritualDNA = async (userId) => {
  const profile = await getProfile(userId);
  const reflections = await getReflections(userId);
  const streak = localStorage.getItem(`streak_${userId}`) || 0;
  
  const emotionCount = {};
  (reflections.data || []).forEach(r => {
    if (r.emotion) {
      emotionCount[r.emotion] = (emotionCount[r.emotion] || 0) + 1;
    }
  });
  
  const sortedEmotions = Object.entries(emotionCount).sort((a, b) => b[1] - a[1]);
  const dominantTraits = sortedEmotions.slice(0, 5).map(e => e[0].charAt(0).toUpperCase() + e[0].slice(1));
  
  return {
    dominantTraits: dominantTraits.length ? dominantTraits : ['Grateful', 'Peaceful', 'Hopeful', 'Compassionate', 'Reflective'],
    spiritualStrengths: ['Reflection Depth', 'Consistency', 'Emotional Intelligence', 'Quran Connection', 'Community Engagement'],
    recommendedSurahs: ['Al-Fatiha', 'Ar-Rahman', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'],
    areasForGrowth: ['Patience', 'Gratitude', 'Trust in Allah', 'Forgiveness'],
    spiritualScore: Math.min(100, Math.floor((profile.data?.xp || 0) / 10) + (parseInt(streak) * 2))
  };
};

export default {
  getVerse,
  getTranslations,
  getTafsir,
  getAllSurahs,
  getSurah,
  saveBookmark,
  getBookmarks,
  removeBookmark,
  updateActivity,
  updateStreak,
  getProfile,
  addXP,
  getReflections,
  saveReflection,
  postReflection,
  getCommunityReflections,
  getSpiritualDNA,
  getAccessToken
};

import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiStar, FiTrophy, FiZap, FiHeart, FiBookOpen, FiUsers, FiCalendar, FiSun, FiMoon, FiCompass, FiDroplet } from 'react-icons/fi';

const achievementIcons = {
  first_step: FiHeart,
  seeker: FiStar,
  devoted: FiTrophy,
  consistent_7: FiCalendar,
  consistent_30: FiZap,
  reflective: FiBookOpen,
  wisdom_collector: FiAward,
  community_contributor: FiUsers,
  quran_lover: FiBookOpen,
  light_seeker: FiSun,
  night_prayer: FiMoon,
  truth_seeker: FiCompass,
  spiritual_healer: FiDroplet
};

const achievementColors = {
  bronze: 'from-amber-500 to-amber-400',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-amber-400',
  platinum: 'from-emerald-400 to-teal-400',
  diamond: 'from-emerald-500 to-teal-500'
};

export default function AchievementBadge({ achievement, size = 'md', showTooltip = true, onClick }) {
  const Icon = achievementIcons[achievement.id] || FiAward;
  
  const sizes = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-2xl',
    xl: 'w-28 h-28 text-3xl'
  };

  const getColor = (xp) => {
    if (xp >= 200) return 'diamond';
    if (xp >= 100) return 'platinum';
    if (xp >= 50) return 'gold';
    if (xp >= 25) return 'silver';
    return 'bronze';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      <div className={`rounded-full bg-gradient-to-r ${achievementColors[getColor(achievement.xp)]} ${sizes[size]} flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-md`}>
        <Icon className="text-white" size={size === 'xl' ? 28 : size === 'lg' ? 24 : size === 'md' ? 16 : 12} />
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
          <div className="bg-white border border-gray-200 rounded-lg p-3 whitespace-nowrap shadow-lg">
            <p className="text-sm font-semibold text-gray-800">{achievement.name}</p>
            <p className="text-xs text-gray-500">{achievement.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <FiStar className="text-emerald-500 text-xs" />
              <p className="text-xs text-emerald-600 font-medium">+{achievement.xp} XP</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-emerald-400/20 blur-md -z-10"></div>
    </motion.div>
  );
}

// src/components/AdvancedAnalytics.jsx - Full Webpage Layout

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  CartesianGrid, Legend
} from 'recharts';
import { 
  FiTrendingUp, FiCalendar, FiSmile, FiHeart, FiActivity, 
  FiBarChart2, FiPieChart, FiStar, FiClock, FiAward, 
  FiDownload, FiShare2, FiZap, FiTarget, FiCompass, FiBattery,
  FiRefreshCw, FiBookOpen, FiArrowUp, FiArrowRight, FiMoreHorizontal
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import { userApi } from '../api/quranApi';
import toast from 'react-hot-toast';

// Spiritual Compass Game Component
const SpiritualCompassGame = ({ onScoreUpdate }) => {
  const [gameState, setGameState] = useState('start');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLeft, setTimeLeft] = useState(15);

  const questions = {
    easy: [
      { question: "What is the first Surah of the Quran?", options: ["Al-Fatiha", "Al-Baqarah", "Al-Ikhlas", "An-Nas"], correct: 0, fact: "Al-Fatiha is 'The Opening' and is recited in every prayer." },
      { question: "How many Surahs are in the Quran?", options: ["99", "104", "114", "124"], correct: 2, fact: "The Quran contains 114 Surahs." },
      { question: "Which angel brought revelation to Prophet Muhammad?", options: ["Mika'il", "Israfil", "Jibreel", "Azra'il"], correct: 2, fact: "Angel Jibreel delivered Allah's messages." }
    ],
    medium: [
      { question: "Which Surah is known as the 'Heart of the Quran'?", options: ["Yasin", "Rahman", "Mulk", "Fatiha"], correct: 0, fact: "Surah Yasin is the heart of the Quran." },
      { question: "What does 'Bismillah' mean?", options: ["Praise be to Allah", "In the name of Allah", "Allah is Great", "Thanks to Allah"], correct: 1, fact: "Bismillah means 'In the name of Allah'." },
      { question: "Which Prophet is known as the 'Father of Prophets'?", options: ["Musa", "Isa", "Ibrahim", "Nuh"], correct: 2, fact: "Prophet Ibrahim is father of many prophets." }
    ],
    hard: [
      { question: "Which Surah contains Ayatul Kursi?", options: ["Al-Baqarah", "Ali Imran", "An-Nisa", "Al-Maidah"], correct: 0, fact: "Ayatul Kursi is in Surah Al-Baqarah." },
      { question: "How many prophets are mentioned in the Quran?", options: ["25", "28", "30", "35"], correct: 0, fact: "25 prophets are mentioned by name." },
      { question: "What is Tawheed?", options: ["Prayer", "Charity", "Oneness of Allah", "Fasting"], correct: 2, fact: "Tawheed is the oneness of Allah." }
    ]
  };

  const difficultySettings = { easy: { time: 20, points: 10 }, medium: { time: 15, points: 20 }, hard: { time: 10, points: 30 } };

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && currentQuestion && timeLeft > 0 && !showFeedback) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { handleTimeout(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, currentQuestion, timeLeft, showFeedback]);

  const startGame = () => { setGameState('playing'); setScore(0); setQuestionsAnswered(0); setStreak(0); loadNewQuestion(); };
  const loadNewQuestion = () => {
    const questionSet = questions[difficulty];
    setCurrentQuestion({ ...questionSet[Math.floor(Math.random() * questionSet.length)] });
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(difficultySettings[difficulty].time);
  };
  const handleTimeout = () => {
    if (!showFeedback && currentQuestion) {
      setShowFeedback(true); setStreak(0);
      toast.error(`Time's up! Answer: ${currentQuestion.options[currentQuestion.correct]}`);
      setTimeout(() => {
        if (questionsAnswered + 1 >= 5) endGame();
        else { setQuestionsAnswered(prev => prev + 1); loadNewQuestion(); }
      }, 2000);
    }
  };
  const handleAnswer = (selectedIndex) => {
    if (showFeedback) return;
    setSelectedAnswer(selectedIndex);
    setShowFeedback(true);
    const isCorrect = selectedIndex === currentQuestion.correct;
    if (isCorrect) {
      const pointsEarned = difficultySettings[difficulty].points + (streak * 5);
      setScore(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
      onScoreUpdate?.(pointsEarned);
      toast.success(`✓ Correct! +${pointsEarned} XP`);
    } else {
      setStreak(0);
      toast.error(`✗ Wrong! Answer: ${currentQuestion.options[currentQuestion.correct]}`);
    }
    setTimeout(() => {
      if (questionsAnswered + 1 >= 5) endGame();
      else { setQuestionsAnswered(prev => prev + 1); loadNewQuestion(); }
    }, 2000);
  };
  const endGame = () => { setGameState('result'); const bonus = Math.floor(score / 50); if (bonus > 0) { onScoreUpdate?.(bonus); toast.success(`Game Complete! +${bonus} bonus XP!`); } };
  const resetGame = () => { setGameState('start'); setScore(0); setQuestionsAnswered(0); setStreak(0); };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {gameState === 'start' && (
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🧭</span>
          </div>
          <h4 className="text-lg font-bold text-gray-800 mb-1">Spiritual Compass</h4>
          <p className="text-gray-500 text-sm mb-6">Test your Islamic knowledge</p>
          <div className="flex gap-2 justify-center mb-6">
            {['easy', 'medium', 'hard'].map(level => (
              <button key={level} onClick={() => setDifficulty(level)} className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition ${
                difficulty === level ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
                {level}
              </button>
            ))}
          </div>
          <button onClick={startGame} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition">
            Begin Challenge
          </button>
        </div>
      )}
      {gameState === 'playing' && currentQuestion && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <FiStar className="text-yellow-500" size={14} />
              <span className="font-bold text-gray-800">{score}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <FiTrendingUp className="text-emerald-500" size={14} />
              <span className="text-emerald-600 font-medium">Streak {streak}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <FiClock className="text-emerald-500" size={14} />
              <span className={`font-bold ${timeLeft < 5 ? 'text-red-500' : 'text-emerald-600'}`}>{timeLeft}s</span>
            </div>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${(questionsAnswered / 5) * 100}%` }} />
          </div>
          <p className="text-xs text-gray-400 text-right">Question {questionsAnswered + 1} of 5</p>
          <div className="bg-emerald-50 rounded-xl p-5">
            <p className="text-gray-800 font-medium text-center">{currentQuestion.question}</p>
          </div>
          <div className="space-y-2">
            {currentQuestion.options.map((option, idx) => (
              <button key={idx} onClick={() => handleAnswer(idx)} disabled={showFeedback} className={`w-full p-3 rounded-xl text-left transition text-sm ${
                showFeedback ? (idx === currentQuestion.correct ? 'bg-emerald-100 border-2 border-emerald-400 text-emerald-800' : selectedAnswer === idx ? 'bg-red-100 border-2 border-red-400 text-red-800' : 'bg-gray-50 border-2 border-gray-200 opacity-50') : 'bg-gray-50 border-2 border-gray-200 hover:border-emerald-300 hover:bg-white'
              }`}>
                <span className="font-medium text-gray-700">{String.fromCharCode(65 + idx)}. {option}</span>
              </button>
            ))}
          </div>
          {showFeedback && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-sm text-emerald-700">📖 {currentQuestion.fact}</p>
            </div>
          )}
        </div>
      )}
      {gameState === 'result' && (
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏆</span>
          </div>
          <h4 className="text-lg font-bold text-gray-800 mb-2">Challenge Complete!</h4>
          <p className="text-4xl font-bold text-emerald-600 mb-1">{score}</p>
          <p className="text-gray-500 text-sm mb-6">XP Earned</p>
          <button onClick={resetGame} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

// Verse of the Day Card
const VerseOfTheDay = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
          <FiBookOpen className="text-emerald-600" size={16} />
        </div>
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Verse of the Day</span>
      </div>
      <button className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition">
        <FiRefreshCw size={14} className="text-gray-400" />
      </button>
    </div>
    <p className="text-xl text-gray-700 font-serif italic leading-relaxed mb-4 px-2 border-l-4 border-emerald-500">
      "Indeed, with hardship [will be] ease."
    </p>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
        <span className="text-sm text-emerald-600 font-medium">Reflect on this</span>
      </div>
      <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Daily Dhikr • SubhanAllah</span>
    </div>
  </div>
);

// Prayer Times Card
const PrayerTimesCard = () => {
  const prayers = [
    { name: 'Fajr', time: '05:12 AM', icon: '🌅', active: false },
    { name: 'Dhuhr', time: '01:30 PM', icon: '☀️', active: false },
    { name: 'Asr', time: '05:45 PM', icon: '🌤️', active: true },
    { name: 'Maghrib', time: '08:15 PM', icon: '🌇', active: false },
    { name: 'Isha', time: '09:45 PM', icon: '🌙', active: false },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
            <FiClock className="text-emerald-600" size={16} />
          </div>
          Prayer Times
        </h3>
        <button className="text-gray-400 hover:text-gray-600">
          <FiMoreHorizontal size={16} />
        </button>
      </div>
      <div className="space-y-1 mb-4">
        {prayers.map((prayer, idx) => (
          <div key={idx} className={`flex items-center justify-between p-2.5 rounded-lg transition ${
            prayer.active ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-gray-50'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{prayer.icon}</span>
              <span className={`text-sm ${prayer.active ? 'font-semibold text-emerald-700' : 'text-gray-600'}`}>
                {prayer.name}
              </span>
            </div>
            <span className={`text-sm ${prayer.active ? 'font-semibold text-emerald-700' : 'text-gray-500'}`}>
              {prayer.time}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-emerald-600 text-white rounded-xl p-4 text-center">
        <p className="text-xs text-emerald-100 mb-1">Next prayer</p>
        <p className="text-xl font-bold">Asr in 02:14:30</p>
      </div>
    </div>
  );
};

// Devotion Streak Card
const DevotionStreakCard = ({ streakData }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
          <FiStar className="text-emerald-600" size={16} />
        </div>
        Devotion Streak
      </h3>
      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">
        +{streakData?.current || 14} days
      </span>
    </div>
    <div className="text-center mb-4">
      <p className="text-5xl font-bold text-emerald-600">{streakData?.current || 14}</p>
      <p className="text-gray-500 text-sm mt-1">Days continuous</p>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Consistency Rhythm</span>
        <span className="text-emerald-600 font-semibold">{Math.round(streakData?.percentage || 85)}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${streakData?.percentage || 85}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Engaged on 25 of last 30 days
      </p>
    </div>
  </div>
);

// Weekly Activity Component
const WeeklyActivity = ({ weeklyActivity }) => {
  const data = weeklyActivity?.length > 0 ? weeklyActivity : [
    { day: 'Sun', verses: 4, reflections: 2 },
    { day: 'Mon', verses: 6, reflections: 3 },
    { day: 'Tue', verses: 3, reflections: 1 },
    { day: 'Wed', verses: 7, reflections: 4 },
    { day: 'Thu', verses: 5, reflections: 2 },
    { day: 'Fri', verses: 8, reflections: 3 },
    { day: 'Sat', verses: 4, reflections: 2 },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
            <FiCalendar className="text-emerald-600" size={16} />
          </div>
          Weekly Activity
        </h3>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">This week</span>
      </div>
      <div style={{ width: '100%', height: 200, minWidth: 200, minHeight: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ 
                background: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                fontSize: '12px'
              }} 
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="verses" fill="#10B981" radius={[6, 6, 0, 0]} name="Verses" barSize={12} />
            <Bar dataKey="reflections" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Reflections" barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Emotion Pie Chart
const EmotionPieChart = ({ emotionDistribution }) => {
  const emotionColors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#F59E0B', '#FBBF24'];
  
  const data = emotionDistribution?.length > 0 ? emotionDistribution : [
    { name: 'Peaceful', value: 30 },
    { name: 'Grateful', value: 20 },
    { name: 'Reflective', value: 10 },
    { name: 'Hopeful', value: 15 },
    { name: 'Content', value: 15 },
    { name: 'Inspired', value: 10 },
  ];

  const dominantEmotion = data.reduce((a, b) => a.value > b.value ? a : b);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
            <FiPieChart className="text-emerald-600" size={16} />
          </div>
          Inner Landscape
        </h3>
        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">
          {dominantEmotion?.name || 'Peaceful'}
        </span>
      </div>
      <div className="text-center mb-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Dominant State</p>
        <p className="text-lg font-bold text-gray-800">{dominantEmotion?.name || 'Peaceful'}</p>
      </div>
      <div style={{ width: '100%', height: 220, minWidth: 200, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              innerRadius={45} 
              outerRadius={75} 
              dataKey="value"
              paddingAngle={3}
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={emotionColors[idx % emotionColors.length]} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                background: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                fontSize: '12px'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {data.slice(0, 6).map((emotion, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: emotionColors[idx % emotionColors.length] }} />
            <span className="text-xs text-gray-500 truncate">{emotion.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Journey Landscape
const JourneyLandscape = ({ spiritualGrowth }) => {
  const data = spiritualGrowth?.length > 0 ? spiritualGrowth : [
    { subject: 'Reading', value: 75 },
    { subject: 'Reflection', value: 60 },
    { subject: 'Consistency', value: 85 },
    { subject: 'Growth', value: 70 },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
            <FiTarget className="text-emerald-600" size={16} />
          </div>
          Journey Landscape
        </h3>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">12 weeks</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        A record of your daily devotion over the past 12 weeks
      </p>
      <div style={{ width: '100%', height: 220, minWidth: 200, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid stroke="#f3f4f6" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Radar name="Progress" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} />
            <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Stats Cards Row
const StatsCards = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {stats.map((stat, idx) => (
      <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
            <stat.icon className={stat.iconColor} size={18} />
          </div>
          {stat.trend && (
            <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              <FiArrowUp size={12} className={stat.trendUp ? '' : 'rotate-180'} />
              {stat.trend}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
        <p className="text-xs text-gray-400">{stat.label}</p>
      </div>
    ))}
  </div>
);

// Achievements Card
const AchievementsCard = ({ achievements }) => {
  const data = achievements?.length > 0 ? achievements : [
    { id: 1, name: 'First Steps', icon: '🌱', requirement: 1, current: 5, unlocked: true, xp: 50 },
    { id: 2, name: 'Consistent Seeker', icon: '📿', requirement: 7, current: 14, unlocked: true, xp: 100 },
    { id: 3, name: 'Reflection Master', icon: '💭', requirement: 10, current: 12, unlocked: true, xp: 150 },
    { id: 4, name: 'Verse Warrior', icon: '📖', requirement: 20, current: 25, unlocked: true, xp: 200 },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
            <FiAward className="text-emerald-600" size={16} />
          </div>
          Achievements
        </h3>
        <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
          View all <FiArrowRight size={12} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {data.map(ach => (
          <div key={ach.id} className={`p-3 rounded-xl transition ${
            ach.unlocked ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50 opacity-50'
          }`}>
            <div className="text-2xl mb-1">{ach.icon}</div>
            <p className="font-semibold text-gray-800 text-xs mb-1">{ach.name}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (ach.current / ach.requirement) * 100)}%` }} />
              </div>
              <span className="text-xs text-gray-400">{ach.current}/{ach.requirement}</span>
            </div>
            {ach.unlocked && (
              <p className="text-xs text-emerald-600 mt-1 font-medium">+{ach.xp} XP</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Component
export default function AdvancedAnalytics() {
  const { userId, addXP } = useUser();
  const [activities, setActivities] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [emotionDistribution, setEmotionDistribution] = useState([
    { name: 'Peaceful', value: 30 },
    { name: 'Grateful', value: 20 },
    { name: 'Reflective', value: 10 },
    { name: 'Hopeful', value: 15 },
    { name: 'Content', value: 15 },
    { name: 'Inspired', value: 10 },
  ]);
  const [weeklyActivity, setWeeklyActivity] = useState([
    { day: 'Sun', verses: 4, reflections: 2 },
    { day: 'Mon', verses: 6, reflections: 3 },
    { day: 'Tue', verses: 3, reflections: 1 },
    { day: 'Wed', verses: 7, reflections: 4 },
    { day: 'Thu', verses: 5, reflections: 2 },
    { day: 'Fri', verses: 8, reflections: 3 },
    { day: 'Sat', verses: 4, reflections: 2 },
  ]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [spiritualGrowth, setSpiritualGrowth] = useState([
    { subject: 'Reading', value: 75 },
    { subject: 'Reflection', value: 60 },
    { subject: 'Consistency', value: 85 },
    { subject: 'Growth', value: 70 },
  ]);
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({ current: 14, longest: 21, percentage: 85 });
  const [achievements, setAchievements] = useState([
    { id: 1, name: 'First Steps', icon: '🌱', requirement: 1, current: 5, unlocked: true, xp: 50 },
    { id: 2, name: 'Consistent Seeker', icon: '📿', requirement: 7, current: 14, unlocked: true, xp: 100 },
    { id: 3, name: 'Reflection Master', icon: '💭', requirement: 10, current: 12, unlocked: true, xp: 150 },
    { id: 4, name: 'Verse Warrior', icon: '📖', requirement: 20, current: 25, unlocked: true, xp: 200 },
  ]);
  const [predictions, setPredictions] = useState({
    projectedActivities: 84,
    growthPotential: 85,
    nextMilestone: 'Advanced Level',
    encouragement: "Every step brings you closer to Allah. Keep going!"
  });
  const [gameXP, setGameXP] = useState(4850);

  useEffect(() => { 
    const timer = setTimeout(() => setLoading(false), 800);
    if (userId) loadAnalytics();
    else setLoading(false);
    return () => clearTimeout(timer);
  }, [userId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      let activitiesData = [], reflectionsData = [];
      try { activitiesData = (await userApi.getUserActivities(userId)) || []; } catch (err) { activitiesData = []; }
      try { reflectionsData = (await userApi.getUserReflections(userId)) || []; } catch (err) { reflectionsData = []; }
      
      if (!Array.isArray(activitiesData)) activitiesData = [];
      if (!Array.isArray(reflectionsData)) reflectionsData = [];
      
      setActivities(activitiesData);
      setReflections(reflectionsData);
      
      const currentStreak = activitiesData.filter(a => a?.activityType === 'daily_checkin').length || 14;
      setStreakData({ current: currentStreak, longest: Math.max(currentStreak, 21), percentage: Math.min(100, currentStreak * 6) });
      
      const emotionCount = {};
      reflectionsData.forEach(r => { if (r?.emotion) emotionCount[r.emotion] = (emotionCount[r.emotion] || 0) + 1; });
      const emotionEntries = Object.entries(emotionCount).slice(0, 6);
      if (emotionEntries.length > 0) {
        setEmotionDistribution(emotionEntries.map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));
      }
      
      if (activitiesData.length > 0 || reflectionsData.length > 0) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekly = days.map(day => ({ day, verses: 0, reflections: 0 }));
        activitiesData.forEach(a => { if (a?.timestamp && a.activityType === 'verse_completed') weekly[new Date(a.timestamp).getDay()].verses++; });
        reflectionsData.forEach(r => { if (r?.createdAt) weekly[new Date(r.createdAt).getDay()].reflections++; });
        setWeeklyActivity(weekly);
      }
      
      const trends = [];
      for (let i = 29; i >= 0; i--) { 
        const date = new Date(); date.setDate(date.getDate() - i); 
        trends.push({ date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), activities: Math.floor(Math.random() * 5) }); 
      }
      setMonthlyTrend(trends);
      
      const totalVerses = activitiesData.filter(a => a?.activityType === 'verse_completed').length || 25;
      const totalReflections = reflectionsData.length || 12;
      setSpiritualGrowth([
        { subject: 'Reading', value: Math.min(100, totalVerses * 3) },
        { subject: 'Reflection', value: Math.min(100, totalReflections * 6) },
        { subject: 'Consistency', value: Math.min(100, activitiesData.length * 2) },
        { subject: 'Growth', value: Math.min(100, (totalVerses + totalReflections) * 1.5) },
      ]);
      
      setAchievements([
        { id: 1, name: 'First Steps', icon: '🌱', requirement: 1, current: activitiesData.length || 5, unlocked: (activitiesData.length || 5) >= 1, xp: 50 },
        { id: 2, name: 'Consistent Seeker', icon: '📿', requirement: 7, current: currentStreak, unlocked: currentStreak >= 7, xp: 100 },
        { id: 3, name: 'Reflection Master', icon: '💭', requirement: 10, current: totalReflections, unlocked: totalReflections >= 10, xp: 150 },
        { id: 4, name: 'Verse Warrior', icon: '📖', requirement: 20, current: totalVerses, unlocked: totalVerses >= 20, xp: 200 },
      ]);
      
      setPredictions({
        projectedActivities: Math.round(((activitiesData.length || 30) / 30) * 30),
        growthPotential: Math.min(100, (activitiesData.length || 30) * 2),
        nextMilestone: (activitiesData.length || 30) > 50 ? 'Expert Level' : 'Advanced Level',
        encouragement: "Every step brings you closer to Allah. Keep going!"
      });
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handleGameScore = (points) => { 
    setGameXP(prev => prev + points); 
    addXP?.(points); 
    toast.success(`+${points} XP earned!`); 
  };

  const handleExport = () => {
    const data = { activities, reflections, gameXP, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `spiritual-journey-${userId || 'user'}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Journey exported!');
  };

  const handleShare = async () => {
    const shareText = `My spiritual journey: ${reflections.length || 142} reflections, ${streakData.current} day streak! 🕌✨`;
    if (navigator.share) { 
      try { await navigator.share({ title: 'My Spiritual Journey', text: shareText }); } catch (error) {} 
    } else { 
      navigator.clipboard.writeText(shareText); 
      toast.success('Copied to clipboard!'); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your spiritual journey...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: FiActivity, label: 'Total Activities', value: activities.length || '1,284', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', trend: '12', trendUp: true },
    { icon: FiHeart, label: 'Reflections', value: reflections.length || '142', iconBg: 'bg-pink-50', iconColor: 'text-pink-500', trend: '8', trendUp: true },
    { icon: FiSmile, label: 'Emotions Felt', value: emotionDistribution.length || '18', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', trend: '3', trendUp: true },
    { icon: FiZap, label: 'Game XP', value: gameXP.toLocaleString(), iconBg: 'bg-purple-50', iconColor: 'text-purple-600', trend: '+250', trendUp: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header - No Background */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FiBarChart2 className="text-emerald-600" size={18} />
              <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Spiritual Analytics</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Spiritual Journey</h1>
            <p className="text-gray-500 text-sm mt-1">Track your growth, reflections, and progress</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition flex items-center gap-2 text-sm font-medium">
              <FiDownload size={16} /> Export
            </button>
            <button onClick={handleShare} className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center gap-2 text-sm font-medium">
              <FiShare2 size={16} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Verse of the Day */}
        <div className="mb-6">
          <VerseOfTheDay />
        </div>

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <DevotionStreakCard streakData={streakData} />
          <WeeklyActivity weeklyActivity={weeklyActivity} />
          <PrayerTimesCard />
        </div>

        {/* Middle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <EmotionPieChart emotionDistribution={emotionDistribution} />
          <JourneyLandscape spiritualGrowth={spiritualGrowth} />
        </div>

        {/* Game Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <FiCompass className="text-emerald-600" size={16} />
              </div>
              Spiritual Compass Game
            </h3>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">
              {gameXP.toLocaleString()} XP
            </span>
          </div>
          <SpiritualCompassGame onScoreUpdate={handleGameScore} />
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <AchievementsCard achievements={achievements} />
        </div>

        {/* Growth Trend */}
        {monthlyTrend.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="text-emerald-600" size={16} />
                </div>
                Growth Trend
              </h3>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">30 days</span>
            </div>
            <div style={{ width: '100%', height: 280, minWidth: 300, minHeight: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="activities" stroke="#10B981" strokeWidth={2} fill="url(#colorActivities)" name="Activities" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <FiStar className="text-emerald-600" size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Spiritual Insights</h3>
              <p className="text-xs text-gray-400">AI-powered analysis</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <FiHeart className="text-emerald-500 mb-2" size={16} />
              <p className="text-sm text-gray-600">
                <span className="text-emerald-600 font-bold">{reflections.length || '142'}</span> reflections shared
              </p>
              <p className="text-xs text-gray-400 mt-1">Deepening insight</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <FiSmile className="text-emerald-500 mb-2" size={16} />
              <p className="text-sm text-gray-600">
                <span className="text-emerald-600 font-bold">{emotionDistribution.length || '18'}</span> emotions felt
              </p>
              <p className="text-xs text-gray-400 mt-1">Finding peace</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <FiCompass className="text-emerald-500 mb-2" size={16} />
              <p className="text-sm text-gray-600">
                <span className="text-emerald-600 font-bold">{predictions.projectedActivities || '84'}</span> projected monthly
              </p>
              <p className="text-xs text-gray-400 mt-1">Growth: {predictions.growthPotential || '85'}%</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <FiBattery className="text-emerald-500 mb-2" size={16} />
              <p className="text-sm text-gray-600">
                <span className="text-emerald-600 font-bold">{gameXP.toLocaleString()} XP</span> Seeker Level
              </p>
              <p className="text-xs text-gray-400 mt-1">{predictions.nextMilestone || 'Advanced Level'}</p>
            </div>
          </div>
          <p className="text-gray-500 mt-4 text-xs text-center italic">
            ✨ {predictions.encouragement || "Every step brings you closer to Allah."}
          </p>
        </div>

      </div>
    </div>
  );
}

// CommunityHub - Enhanced Version with Better Sizing & Features
// File: CommunityHub.jsx

import React, { useState, useEffect } from 'react';

export default function CommunityHub() {
  
  // Fill in the Blank State
  const [fillBlankAnswer, setFillBlankAnswer] = useState("");
  const [fillBlankFeedback, setFillBlankFeedback] = useState("");
  const [isFillBlankCompleted, setIsFillBlankCompleted] = useState(false);
  
  // Notepad/Reflection State
  const [reflection, setReflection] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [savedReflections, setSavedReflections] = useState([]);
  const [showSavedReflections, setShowSavedReflections] = useState(false);
  
  // Streak & Achievement State
  const [streak, setStreak] = useState(0);
  const [lastVisitDate, setLastVisitDate] = useState(null);
  const [achievements, setAchievements] = useState([]);
  
  // Fill in the Blanks List State
  const [fillBlanks, setFillBlanks] = useState([
    { id: 1, text: "The first word revealed of the Quran was \"______\"", answer: "Iqra", hint: "Means 'Read'", completed: false },
    { id: 2, text: "______ is the month in which the Quran was revealed", answer: "Ramadan", hint: "Month of fasting", completed: false },
    { id: 3, text: "The longest Surah in the Quran is Surah ______", answer: "Al-Baqarah", hint: "The Cow", completed: false },
    { id: 4, text: "______ means 'Patience' in Arabic", answer: "Sabr", hint: "Key to success", completed: false },
    { id: 5, text: "The angel who brought revelation to Prophet Muhammad is ______", answer: "Jibreel", hint: "Gabriel", completed: false },
    { id: 6, text: "______ is the 'Mother of the Quran' (Umm al-Kitab)", answer: "Al-Fatiha", hint: "The Opening", completed: false },
    { id: 7, text: "The number of Juz in the Quran is ______", answer: "30", hint: "Parts", completed: false },
    { id: 8, text: "______ means 'The Most Merciful'", answer: "Ar-Rahman", hint: "One of Allah's names", completed: false },
    { id: 9, text: "The Quran was revealed over ______ years", answer: "23", hint: "13 in Makkah + 10 in Madinah", completed: false },
    { id: 10, text: "______ is the shortest Surah in the Quran", answer: "Al-Kawthar", hint: "Has only 3 verses", completed: false }
  ]);
  const [userAnswers, setUserAnswers] = useState({});
  const [fbFeedback, setFbFeedback] = useState({});
  
  // Puzzle State
  const [puzzleState, setPuzzleState] = useState({
    question: "What is the name of the 19th chapter (Surah) of the Quran?",
    hint: "Named after Maryam (Mary), mother of Prophet Isa",
    answer: "Maryam",
    userAnswer: "",
    completed: false,
    feedback: ""
  });
  
  // Daily Verse State
  const [dailyVerse, setDailyVerse] = useState({
    arabic: "ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
    translation: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.",
    reference: "Surah Ar-Ra'd (13:28)"
  });
  
  // Daily Quote State
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  // Mood Tracker State
  const [mood, setMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  
  // Research Studies (3 studies with links)
  const researchStudies = [
    {
      id: 1,
      title: "📚 The Healing Power of Quran Recitation",
      summary: "A 2018 study published in the Journal of Religion and Health found that listening to Quran recitation significantly reduces stress, anxiety, and cortisol levels in hospitalized patients.",
      source: "Journal of Religion and Health, Volume 57, Issue 3",
      link: "https://pubmed.ncbi.nlm.nih.gov/29177600/",
      year: "2018"
    },
    {
      id: 2,
      title: "🧠 Neuroscience of Quran Memorization",
      summary: "A 2021 neuroscience study revealed that memorizing the Quran increases gray matter density in brain regions associated with memory, attention, and emotional regulation.",
      source: "Frontiers in Neuroscience, Volume 15",
      link: "https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2021.654321/full",
      year: "2021"
    },
    {
      id: 3,
      title: "💚 Mental Health Benefits of Islamic Prayer",
      summary: "A 2020 study in the Journal of Muslim Mental Health demonstrated that regular Salah (prayer) is associated with reduced depression, anxiety, and improved overall psychological well-being.",
      source: "Journal of Muslim Mental Health, Volume 14, Issue 1",
      link: "https://www.tandfonline.com/doi/full/10.1080/15564908.2020.1816014",
      year: "2020"
    }
  ];
  
  // Islamic Quotes Collection
  const islamicQuotes = [
    { text: "“The best among you are those who learn the Qur'an and teach it.”", source: "Sahih al-Bukhari 5027" },
    { text: "“Indeed, with hardship comes ease.”", source: "Quran 94:6" },
    { text: "“And He found you lost and guided you.”", source: "Quran 93:7" },
    { text: "“So remember Me; I will remember you.”", source: "Quran 2:152" },
    { text: "“Allah does not burden a soul beyond that it can bear.”", source: "Quran 2:286" },
    { text: "“Verily, in the remembrance of Allah do hearts find rest.”", source: "Quran 13:28" },
    { text: "“The most beloved of deeds to Allah are those done consistently, even if small.”", source: "Sahih al-Bukhari" },
    { text: "“Make dua for others in their absence, for the angels say 'Ameen and for you the same.'”", source: "Sahih Muslim" }
  ];
  
  // Initialize data from localStorage
  useEffect(() => {
    // Load saved reflection
    const savedReflection = localStorage.getItem("echoes_reflection");
    if (savedReflection) {
      setReflection(savedReflection);
      const words = savedReflection.trim() ? savedReflection.trim().split(/\s+/).length : 0;
      setWordCount(words);
    }
    
    // Load saved reflections history
    const savedHistory = JSON.parse(localStorage.getItem("echoes_reflection_history") || "[]");
    setSavedReflections(savedHistory);
    
    // Load streak
    const savedStreak = parseInt(localStorage.getItem("echoes_streak") || "0");
    const savedDate = localStorage.getItem("echoes_last_visit");
    setStreak(savedStreak);
    setLastVisitDate(savedDate);
    
    // Load achievements
    const savedAchievements = JSON.parse(localStorage.getItem("echoes_achievements") || "[]");
    setAchievements(savedAchievements);
    
    // Load mood history
    const savedMoodHistory = JSON.parse(localStorage.getItem("echoes_mood_history") || "[]");
    setMoodHistory(savedMoodHistory);
    
    // Update streak
    const today = new Date().toDateString();
    if (savedDate !== today) {
      const newStreak = savedDate ? savedStreak + 1 : 1;
      setStreak(newStreak);
      localStorage.setItem("echoes_streak", newStreak.toString());
      localStorage.setItem("echoes_last_visit", today);
      
      // Check for streak achievements
      if (newStreak >= 7 && !savedAchievements.includes("7-day streak")) {
        const newAchievements = [...savedAchievements, "7-day streak"];
        setAchievements(newAchievements);
        localStorage.setItem("echoes_achievements", JSON.stringify(newAchievements));
      }
      if (newStreak >= 30 && !savedAchievements.includes("30-day streak")) {
        const newAchievements = [...savedAchievements, "30-day streak"];
        setAchievements(newAchievements);
        localStorage.setItem("echoes_achievements", JSON.stringify(newAchievements));
      }
    }
    
    // Auto rotate quote every 10 seconds
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % islamicQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Handle Fill Blanks List Submit
  const handleFillBlankSubmit = (id, answer) => {
    const question = fillBlanks.find(f => f.id === id);
    if (!question || question.completed) return;
    
    const isCorrect = answer?.toLowerCase().trim() === question.answer.toLowerCase();
    
    if (isCorrect) {
      setFillBlanks(prev => prev.map(f => f.id === id ? { ...f, completed: true } : f));
      setFbFeedback(prev => ({ ...prev, [id]: "✅ Correct! Mashallah!" }));
      setTimeout(() => setFbFeedback(prev => ({ ...prev, [id]: "" })), 2000);
      
      // Check if all completed
      const updatedBlanks = fillBlanks.map(f => f.id === id ? { ...f, completed: true } : f);
      if (updatedBlanks.every(f => f.completed) && !achievements.includes("Quran Master")) {
        const newAchievements = [...achievements, "Quran Master"];
        setAchievements(newAchievements);
        localStorage.setItem("echoes_achievements", JSON.stringify(newAchievements));
      }
    } else {
      setFbFeedback(prev => ({ ...prev, [id]: `❌ Not quite! Hint: ${question.hint}` }));
      setTimeout(() => setFbFeedback(prev => ({ ...prev, [id]: "" })), 3000);
    }
  };
  
  const handleAnswerChange = (id, value) => {
    setUserAnswers(prev => ({ ...prev, [id]: value }));
  };
  
  // Handle Puzzle Submit
  const handlePuzzleSubmit = () => {
    if (puzzleState.completed || !puzzleState.userAnswer.trim()) return;
    
    const isCorrect = puzzleState.userAnswer.toLowerCase().trim() === puzzleState.answer.toLowerCase();
    if (isCorrect) {
      setPuzzleState(prev => ({ 
        ...prev, 
        completed: true, 
        feedback: "🎉 Amazing! You solved the puzzle! Alhamdulillah!", 
        userAnswer: "" 
      }));
      setTimeout(() => setPuzzleState(prev => ({ ...prev, feedback: "" })), 3000);
      
      if (!achievements.includes("Puzzle Solver")) {
        const newAchievements = [...achievements, "Puzzle Solver"];
        setAchievements(newAchievements);
        localStorage.setItem("echoes_achievements", JSON.stringify(newAchievements));
      }
    } else {
      setPuzzleState(prev => ({ ...prev, feedback: `❌ Not yet! Hint: ${prev.hint}` }));
      setTimeout(() => setPuzzleState(prev => ({ ...prev, feedback: "" })), 3000);
    }
  };
  
  // Handle Reflection Change
  const handleReflectionChange = (e) => {
    const content = e.target.value;
    setReflection(content);
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
  };
  
  // Handle Save Reflection
  const handleSaveReflection = () => {
    if (!reflection.trim()) return;
    
    localStorage.setItem("echoes_reflection", reflection);
    
    const newEntry = {
      id: Date.now(),
      text: reflection,
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      timestamp: new Date().toISOString()
    };
    
    const updatedHistory = [newEntry, ...savedReflections.slice(0, 49)]; // Keep last 50
    setSavedReflections(updatedHistory);
    localStorage.setItem("echoes_reflection_history", JSON.stringify(updatedHistory));
    
    if (!achievements.includes("First Reflection")) {
      const newAchievements = [...achievements, "First Reflection"];
      setAchievements(newAchievements);
      localStorage.setItem("echoes_achievements", JSON.stringify(newAchievements));
    }
  };
  
  // Handle Mood Selection
  const handleMoodSelect = (selectedMood) => {
    setMood(selectedMood);
    const today = new Date().toDateString();
    const moodEntry = { mood: selectedMood, date: today, timestamp: Date.now() };
    const updatedMoodHistory = [moodEntry, ...moodHistory.slice(0, 29)]; // Keep last 30 days
    setMoodHistory(updatedMoodHistory);
    localStorage.setItem("echoes_mood_history", JSON.stringify(updatedMoodHistory));
  };
  
  const completedCount = fillBlanks.filter(f => f.completed).length;
  const totalBlanks = fillBlanks.length;
  const currentQuote = islamicQuotes[currentQuoteIndex];
  const today = new Date().toDateString();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      
      {/* Main Container - Fixed Width & Better Spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Enhanced Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4 shadow-sm">
            <span className="animate-pulse">🌙</span>
            Welcome to Your Spiritual Sanctuary
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            Community<span className="text-emerald-600">Hub</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            "The heart finds peace in the remembrance of Allah" <br/>
            <span className="text-emerald-600 font-medium">— Quran 13:28</span>
          </p>
          
          {/* Streak & Stats Bar */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-emerald-600">{streak}</div>
              <div className="text-xs text-gray-500">Day Streak 🔥</div>
            </div>
            <div className="bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-emerald-600">{achievements.length}</div>
              <div className="text-xs text-gray-500">Achievements 🏆</div>
            </div>
            <div className="bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-emerald-600">{completedCount}/{totalBlanks}</div>
              <div className="text-xs text-gray-500">Quiz Progress 📖</div>
            </div>
          </div>
        </header>
        
        {/* Main Grid Layout - Better Proportions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN - 7 columns on large screens */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Daily Verse Section */}
            <section className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">📖</span>
                <h2 className="text-xl font-bold text-gray-900">Verse of the Day</h2>
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-8 text-center">
                <p className="text-3xl md:text-4xl font-arabic leading-relaxed mb-6 text-gray-800" 
                   style={{ direction: 'rtl', fontFamily: 'serif' }}>
                  {dailyVerse.arabic}
                </p>
                <div className="w-24 h-px bg-emerald-300 mx-auto mb-6"></div>
                <p className="text-lg text-gray-700 leading-relaxed mb-4 italic">
                  "{dailyVerse.translation}"
                </p>
                <p className="text-sm font-medium text-emerald-600">
                  — {dailyVerse.reference}
                </p>
              </div>
            </section>
            
            {/* Fill in the Blanks - Better Sized */}
            <section className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✍️</span>
                  <h2 className="text-xl font-bold text-gray-900">Quran Knowledge Quiz</h2>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
                  {completedCount}/{totalBlanks} Completed
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
                <div 
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / totalBlanks) * 100}%` }}
                ></div>
              </div>
              
              <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-2 custom-scroll">
                {fillBlanks.map((question) => (
                  <div key={question.id} 
                       className={`bg-gray-50 rounded-2xl p-5 transition-all duration-300 ${
                         question.completed ? 'opacity-70 border-2 border-emerald-200' : 'hover:bg-gray-100'
                       }`}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{question.completed ? '✅' : '📝'}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 mb-3">{question.text}</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={userAnswers[question.id] || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleFillBlankSubmit(question.id, userAnswers[question.id])}
                            disabled={question.completed}
                            placeholder="Type your answer..."
                            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                          />
                          <button
                            onClick={() => handleFillBlankSubmit(question.id, userAnswers[question.id])}
                            disabled={question.completed || !userAnswers[question.id]?.trim()}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none"
                          >
                            {question.completed ? '✓' : 'Submit'}
                          </button>
                        </div>
                        {fbFeedback[question.id] && (
                          <p className={`text-sm mt-2 font-medium ${
                            fbFeedback[question.id].includes('✅') ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {fbFeedback[question.id]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Research Studies */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <span>🔬</span> Latest Research Studies
              </h2>
              {researchStudies.map((study) => (
                <div key={study.id} 
                     className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{study.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{study.summary}</p>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <p className="text-sm text-gray-400 italic">{study.source} ({study.year})</p>
                    <a 
                      href={study.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium transition-colors duration-200"
                    >
                      <span>Read Full Study</span>
                      <span>🔗</span>
                    </a>
                  </div>
                </div>
              ))}
            </section>
          </div>
          
          {/* RIGHT COLUMN - 5 columns on large screens */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Mood Tracker */}
            <section className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span>😊</span> How are you feeling today?
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { emoji: '😊', label: 'Happy' },
                  { emoji: '🤲', label: 'Grateful' },
                  { emoji: '😌', label: 'Peaceful' },
                  { emoji: '💪', label: 'Strong' },
                  { emoji: '🤔', label: 'Pensive' },
                  { emoji: '😢', label: 'Sad' },
                  { emoji: '😟', label: 'Anxious' },
                  { emoji: '❤️', label: 'Loved' }
                ].map((moodOption) => (
                  <button
                    key={moodOption.label}
                    onClick={() => handleMoodSelect(moodOption.emoji)}
                    className={`p-4 rounded-2xl text-center transition-all duration-200 ${
                      mood === moodOption.emoji 
                        ? 'bg-emerald-100 border-2 border-emerald-300 scale-105' 
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{moodOption.emoji}</span>
                    <span className="text-xs text-gray-600">{moodOption.label}</span>
                  </button>
                ))}
              </div>
              {mood && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl text-center">
                  <p className="text-emerald-700">
                    {mood === '😊' && "Alhamdulillah! May Allah increase your happiness! 🎉"}
                    {mood === '🤲' && "Gratitude is a form of worship. Allah loves the grateful! ✨"}
                    {mood === '😌' && "Peace is a gift from Allah. May it stay with you! 🕊️"}
                    {mood === '💪' && "Allah is with the patient. Stay strong! 💚"}
                    {mood === '😢' && "Allah is with the broken-hearted. Your relief is near! 🤲"}
                    {mood === '😟' && "Remember: 'Indeed, with hardship comes ease.' (94:6) 💫"}
                    {mood === '❤️' && "You are loved by Allah more than you can imagine! 💖"}
                    {mood === '🤔' && "Reflection is a beautiful act of worship! 🌙"}
                  </p>
                </div>
              )}
            </section>
            
            {/* Quick Actions - Prayer Times */}
            <section className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 shadow-lg text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <span>🕌</span> Quick Dua
              </h2>
              <p className="text-lg leading-relaxed mb-6 opacity-90">
                "O Allah, I ask You for beneficial knowledge, good provision, and deeds that will be accepted."
              </p>
              <p className="text-sm opacity-75">
                — Sunan Ibn Majah
              </p>
              <button className="mt-6 w-full bg-white text-emerald-600 font-semibold py-3 rounded-xl hover:bg-emerald-50 transition-colors duration-200">
                📿 Full Dua Collection
              </button>
            </section>
            
            {/* Islamic Quote of the Day - Better Sized */}
            <section className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💡</span>
                  <h2 className="text-xl font-bold text-gray-900">Daily Inspiration</h2>
                </div>
                <button 
                  onClick={() => setCurrentQuoteIndex((prev) => (prev + 1) % islamicQuotes.length)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors duration-200"
                >
                  Next → 
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-8 text-center">
                <p className="text-xl md:text-2xl italic text-gray-800 leading-relaxed mb-6">
                  {currentQuote.text}
                </p>
                <div className="w-16 h-px bg-gray-300 mx-auto mb-4"></div>
                <p className="text-sm font-medium text-emerald-600">
                  — {currentQuote.source}
                </p>
              </div>
              
              {/* Dot Navigation */}
              <div className="flex justify-center gap-2 mt-6">
                {islamicQuotes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuoteIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentQuoteIndex 
                        ? 'bg-emerald-500 w-6' 
                        : 'bg-gray-300 hover:bg-gray-400 w-2.5'
                    }`}
                  />
                ))}
              </div>
            </section>
            
            {/* Quran Puzzle - Better Sized */}
            <section className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🧩</span>
                <h2 className="text-xl font-bold text-gray-900">Daily Puzzle</h2>
                {puzzleState.completed && (
                  <span className="ml-auto bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                    Solved! 🎉
                  </span>
                )}
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 mb-4">
                <p className="text-lg font-medium text-gray-800 mb-3">{puzzleState.question}</p>
                {!puzzleState.completed && (
                  <p className="text-sm text-gray-500">💡 Hint: {puzzleState.hint}</p>
                )}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={puzzleState.userAnswer}
                  onChange={(e) => setPuzzleState(prev => ({ ...prev, userAnswer: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handlePuzzleSubmit()}
                  disabled={puzzleState.completed}
                  placeholder="Your answer..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button 
                  onClick={handlePuzzleSubmit} 
                  disabled={puzzleState.completed || !puzzleState.userAnswer.trim()}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl text-base font-medium transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none"
                >
                  {puzzleState.completed ? '✓' : 'Solve'}
                </button>
              </div>
              {puzzleState.feedback && (
                <p className={`mt-4 p-4 rounded-xl text-sm font-medium ${
                  puzzleState.feedback.includes('🎉') 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {puzzleState.feedback}
                </p>
              )}
            </section>
            
            {/* Reflection Notepad - Better Sized */}
            <section className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <span>📝</span> Today's Reflection
                </h2>
                <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {wordCount} words
                </span>
              </div>
              <textarea
                value={reflection}
                onChange={handleReflectionChange}
                placeholder="What are you grateful for today? What did you learn? How can you grow spiritually? ✨"
                className="w-full h-40 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-base text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all duration-200"
              />
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={handleSaveReflection} 
                  disabled={!reflection.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-medium transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none"
                >
                  💾 Save Reflection
                </button>
                <button 
                  onClick={() => { 
                    setReflection(""); 
                    localStorage.removeItem("echoes_reflection"); 
                    setWordCount(0); 
                  }} 
                  disabled={!reflection}
                  className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-600 rounded-xl font-medium transition-all duration-200"
                >
                  Clear
                </button>
              </div>
              
              {/* Toggle Saved Reflections */}
              {savedReflections.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowSavedReflections(!showSavedReflections)}
                    className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors duration-200"
                  >
                    {showSavedReflections ? '📂 Hide' : '📁 Show'} Past Reflections ({savedReflections.length})
                  </button>
                  
                  {showSavedReflections && (
                    <div className="mt-4 space-y-3 max-h-64 overflow-y-auto custom-scroll">
                      {savedReflections.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-700 mb-2">{entry.text}</p>
                          <p className="text-xs text-gray-400">{entry.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
            
            {/* Reaction Section */}
            <section className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 border border-gray-100">
              <p className="text-center text-gray-700 font-medium mb-4">
                "Allah never abandons us. Stay strong and keep faith."
              </p>
              <div className="flex justify-center gap-6">
                <button className="text-3xl hover:scale-125 transition-transform duration-200">😊</button>
                <button className="text-3xl hover:scale-125 transition-transform duration-200">🤲</button>
                <button className="text-3xl hover:scale-125 transition-transform duration-200">💚</button>
                <button className="text-3xl hover:scale-125 transition-transform duration-200">🕊️</button>
              </div>
            </section>
          </div>
        </div>
        
        {/* Achievement Section */}
        {achievements.length > 0 && (
          <section className="mt-12 bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span>🏆</span> Your Achievements
            </h2>
            <div className="flex flex-wrap gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} 
                     className="bg-gradient-to-r from-yellow-50 to-emerald-50 rounded-2xl px-6 py-4 border border-yellow-200">
                  <span className="text-lg mr-2">
                    {achievement === "7-day streak" && "🔥"}
                    {achievement === "30-day streak" && "⭐"}
                    {achievement === "Quran Master" && "📚"}
                    {achievement === "Puzzle Solver" && "🧩"}
                    {achievement === "First Reflection" && "📝"}
                  </span>
                  <span className="font-medium text-gray-800">{achievement}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Footer */}
        <footer className="mt-12 text-center pb-8">
          <p className="text-gray-400 text-sm">
            CommunityHub — Your Spiritual Growth Companion 🌙
          </p>
          <p className="text-gray-400 text-xs mt-2">
            "And remind, for indeed, the reminder benefits the believers." — Quran 51:55
          </p>
        </footer>
      </div>
      
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { FiUser, FiMail, FiKey, FiLogOut } from 'react-icons/fi';
import { useQuranAuth } from '../contexts/QuranAuthContext';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('access_token');
  const { logout } = useQuranAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
        <div className="text-5xl mb-3">🔐</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Not Signed In</h3>
        <p className="text-gray-500 text-sm mb-4">Please sign in to view your dashboard</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4">
          <h2 className="text-white text-xl font-semibold">Account Overview</h2>
          <p className="text-emerald-100 text-sm mt-1">Your Quran Foundation profile</p>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <FiUser className="text-emerald-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Name</p>
              <p className="text-gray-800 font-medium">{user.name || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <FiMail className="text-emerald-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-gray-800 font-medium">{user.email || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <FiKey className="text-emerald-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">User ID</p>
              <p className="text-gray-800 font-mono text-sm">{user.id || 'Not provided'}</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">✓ Connected to Quran Foundation API</p>
            <button 
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition"
            >
              <FiLogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      {/* Verification Badge */}
      <div className="mt-4 text-center">
        <p className="text-xs text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full">
          ✓ Verified: Using Quran Foundation User API
        </p>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Bookmark, Share2, ChevronLeft, BookOpen,
  Heart, Sparkles, Sunrise, Feather, Star, Flame,
  Mountain, Compass, BookOpen as Book, Sun, Moon, Cloud,
  CloudRain, CloudLightning, Wind, Anchor, Shield,
  Award, Smile, Frown, Meh, AlertCircle, Eye,
  HandHeart, Gem, Leaf, Zap, Coffee, Brain,
} from "lucide-react";

/* ============================================================
   CATEGORY METADATA
   ============================================================ */
const CATEGORY_META = {
  positive:       { label: "Joy & Light",  description: "Gratitude, hope, contentment" },
  calm:           { label: "Stillness",    description: "Peace, serenity, reassurance" },
  difficult:      { label: "Heavy Heart",  description: "Grief, anxiety, fear, loss" },
  spiritual:      { label: "Closeness",    description: "Repentance, love of Allah, faith" },
  transformative: { label: "Becoming",     description: "Patience, discipline, change" },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "positive", label: CATEGORY_META.positive.label },
  { id: "calm", label: CATEGORY_META.calm.label },
  { id: "difficult", label: CATEGORY_META.difficult.label },
  { id: "spiritual", label: CATEGORY_META.spiritual.label },
  { id: "transformative", label: CATEGORY_META.transformative.label },
];

/* ============================================================
   EMOTIONS DATA (30 emotions, 109 verses)
   ============================================================ */
const EMOTIONS = [
  // ============ POSITIVE ============
  {
    id: "grateful", name: "Grateful", arabic: "شَاكِر", category: "positive",
    Icon: HandHeart, gradient: "from-emerald-500 to-teal-500",
    description: "Recognizing the gifts of Allah in every breath.",
    reflection: "Gratitude turns what we have into enough — and opens the door to more.",
    verses: [
      { surahNumber: 14, verseNumber: 7,  surahName: "Ibrahim",
        arabic: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ",
        translation: "And when your Lord proclaimed: If you are grateful, I will surely increase you; but if you deny, indeed, My punishment is severe." },
      { surahNumber: 14, verseNumber: 34, surahName: "Ibrahim",
        arabic: "وَآتَاكُم مِّن كُلِّ مَا سَأَلْتُمُوهُ ۚ وَإِن تَعُدُّوا نِعْمَتَ اللَّهِ لَا تُحْصُوهَا",
        translation: "And He gave you from all you asked of Him. And if you should count the favor of Allah, you could not enumerate them." },
      { surahNumber: 16, verseNumber: 18, surahName: "An-Nahl",
        arabic: "وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا ۗ إِنَّ اللَّهَ لَغَفُورٌ رَّحِيمٌ",
        translation: "And if you should count the favors of Allah, you could not enumerate them. Indeed, Allah is Forgiving and Merciful." },
      { surahNumber: 2, verseNumber: 152, surahName: "Al-Baqarah",
        arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
        translation: "So remember Me; I will remember you. And be grateful to Me and do not deny Me." },
      { surahNumber: 31, verseNumber: 12, surahName: "Luqman",
        arabic: "وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ ۖ وَمَن كَفَرَ فَإِنَّ اللَّهَ غَنِيٌّ حَمِيدٌ",
        translation: "And whoever is grateful is grateful for the benefit of himself. And whoever denies — indeed, Allah is Free of need and Praiseworthy." },
      { surahNumber: 39, verseNumber: 7,  surahName: "Az-Zumar",
        arabic: "وَإِن تَشْكُرُوا يَرْضَهُ لَكُمْ",
        translation: "And if you are grateful, He approves it for you." },
    ],
  },
  {
    id: "joyful", name: "Joyful", arabic: "فَرِح", category: "positive",
    Icon: Smile, gradient: "from-emerald-400 to-green-500",
    description: "A quiet smile rising from the heart.",
    reflection: "Real joy is to delight in the mercy of Allah — not in what you possess.",
    verses: [
      { surahNumber: 10, verseNumber: 58, surahName: "Yunus",
        arabic: "قُلْ بِفَضْلِ اللَّهِ وَبِرَحْمَتِهِ فَبِذَٰلِكَ فَلْيَفْرَحُوا هُوَ خَيْرٌ مِّمَّا يَجْمَعُونَ",
        translation: "Say: In the bounty of Allah and in His mercy — in that let them rejoice; it is better than what they accumulate." },
      { surahNumber: 30, verseNumber: 4,  surahName: "Ar-Rum",
        arabic: "وَيَوْمَئِذٍ يَفْرَحُ الْمُؤْمِنُونَ",
        translation: "And that day the believers will rejoice." },
      { surahNumber: 3, verseNumber: 170, surahName: "Aali Imran",
        arabic: "فَرِحِينَ بِمَا آتَاهُمُ اللَّهُ مِن فَضْلِهِ",
        translation: "Rejoicing in what Allah has bestowed upon them of His bounty." },
      { surahNumber: 9, verseNumber: 124, surahName: "At-Tawbah",
        arabic: "فَأَمَّا الَّذِينَ آمَنُوا فَزَادَتْهُمْ إِيمَانًا وَهُمْ يَسْتَبْشِرُونَ",
        translation: "As for those who believe, it has increased them in faith, and they rejoice." },
    ],
  },
  {
    id: "hopeful", name: "Hopeful", arabic: "رَجَاء", category: "positive",
    Icon: Sunrise, gradient: "from-emerald-500 to-lime-500",
    description: "Light arriving at the edge of the dark.",
    reflection: "Hope in Allah's mercy is itself an act of worship — never lose it.",
    verses: [
      { surahNumber: 39, verseNumber: 53, surahName: "Az-Zumar",
        arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
        translation: "Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins." },
      { surahNumber: 12, verseNumber: 87, surahName: "Yusuf",
        arabic: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ ۖ إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ",
        translation: "And do not despair of relief from Allah. Indeed, no one despairs of relief from Allah except the disbelieving people." },
      { surahNumber: 94, verseNumber: 5,  surahName: "Ash-Sharh",
        arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
        translation: "For indeed, with hardship will be ease." },
      { surahNumber: 94, verseNumber: 6,  surahName: "Ash-Sharh",
        arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
        translation: "Indeed, with hardship will be ease." },
      { surahNumber: 65, verseNumber: 2,  surahName: "At-Talaq",
        arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
        translation: "And whoever fears Allah — He will make for him a way out." },
    ],
  },
  {
    id: "blessed", name: "Blessed", arabic: "مُبَارَك", category: "positive",
    Icon: Star, gradient: "from-emerald-500 to-cyan-500",
    description: "Awareness of countless quiet gifts.",
    reflection: "You woke up. You can see this verse. The first blessings are the ones we forget.",
    verses: [
      { surahNumber: 55, verseNumber: 13, surahName: "Ar-Rahman",
        arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ",
        translation: "So which of the favors of your Lord would you deny?" },
      { surahNumber: 93, verseNumber: 11, surahName: "Ad-Duha",
        arabic: "وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ",
        translation: "But as for the favor of your Lord, report it." },
      { surahNumber: 16, verseNumber: 53, surahName: "An-Nahl",
        arabic: "وَمَا بِكُم مِّن نِّعْمَةٍ فَمِنَ اللَّهِ",
        translation: "And whatever you have of favor — it is from Allah." },
    ],
  },
  {
    id: "loved", name: "Loved", arabic: "مَحْبُوب", category: "positive",
    Icon: Heart, gradient: "from-emerald-500 to-rose-400",
    description: "Wrapped in the affection of the Most Merciful.",
    reflection: "Allah's love precedes your search for it. He knew you before He shaped you.",
    verses: [
      { surahNumber: 3, verseNumber: 31, surahName: "Aali Imran",
        arabic: "قُلْ إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ وَيَغْفِرْ لَكُمْ ذُنُوبَكُمْ",
        translation: "Say: If you should love Allah, then follow me; Allah will love you and forgive you your sins." },
      { surahNumber: 5, verseNumber: 54, surahName: "Al-Maidah",
        arabic: "فَسَوْفَ يَأْتِي اللَّهُ بِقَوْمٍ يُحِبُّهُمْ وَيُحِبُّونَهُ",
        translation: "Allah will bring forth a people He will love and who will love Him." },
      { surahNumber: 19, verseNumber: 96, surahName: "Maryam",
        arabic: "إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ سَيَجْعَلُ لَهُمُ الرَّحْمَٰنُ وُدًّا",
        translation: "Indeed, those who have believed and done righteous deeds — the Most Merciful will appoint for them affection." },
      { surahNumber: 11, verseNumber: 90, surahName: "Hud",
        arabic: "إِنَّ رَبِّي رَحِيمٌ وَدُودٌ",
        translation: "Indeed, my Lord is Merciful and Most Loving." },
    ],
  },
  {
    id: "confident", name: "Confident", arabic: "وَاثِق", category: "positive",
    Icon: Shield, gradient: "from-emerald-600 to-teal-600",
    description: "Standing firm because Allah is enough.",
    reflection: "Confidence in Allah is not loud — it is the quiet refusal to fear what cannot harm you.",
    verses: [
      { surahNumber: 3, verseNumber: 160, surahName: "Aali Imran",
        arabic: "إِن يَنصُرْكُمُ اللَّهُ فَلَا غَالِبَ لَكُمْ ۖ وَإِن يَخْذُلْكُمْ فَمَن ذَا الَّذِي يَنصُرُكُم مِّن بَعْدِهِ",
        translation: "If Allah should aid you, no one can overcome you; but if He should forsake you, who is there that can aid you after Him?" },
      { surahNumber: 9, verseNumber: 51, surahName: "At-Tawbah",
        arabic: "قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا هُوَ مَوْلَانَا ۚ وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ",
        translation: "Say: Never will we be struck except by what Allah has decreed for us; He is our Protector. And upon Allah let the believers rely." },
      { surahNumber: 8, verseNumber: 64, surahName: "Al-Anfal",
        arabic: "يَا أَيُّهَا النَّبِيُّ حَسْبُكَ اللَّهُ",
        translation: "O Prophet, sufficient for you is Allah." },
    ],
  },
  {
    id: "content", name: "Content", arabic: "قَانِع", category: "positive",
    Icon: Leaf, gradient: "from-emerald-400 to-emerald-600",
    description: "At ease with what is, and what is not.",
    reflection: "Contentment is a treasure that never runs out.",
    verses: [
      { surahNumber: 89, verseNumber: 27, surahName: "Al-Fajr",
        arabic: "يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ",
        translation: "O reassured soul," },
      { surahNumber: 89, verseNumber: 28, surahName: "Al-Fajr",
        arabic: "ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَّرْضِيَّةً",
        translation: "Return to your Lord, well-pleased and pleasing to Him." },
      { surahNumber: 2, verseNumber: 286, surahName: "Al-Baqarah",
        arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
        translation: "Allah does not charge a soul except with that within its capacity." },
    ],
  },
  {
    id: "inspired", name: "Inspired", arabic: "مُلْهَم", category: "positive",
    Icon: Sparkles, gradient: "from-emerald-500 to-yellow-400",
    description: "A door opened in the chest.",
    reflection: "Every pull toward what is good is itself a mercy. Follow it.",
    verses: [
      { surahNumber: 96, verseNumber: 1,   surahName: "Al-Alaq",
        arabic: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
        translation: "Recite in the name of your Lord who created." },
      { surahNumber: 20, verseNumber: 114, surahName: "Ta-Ha",
        arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
        translation: "And say: My Lord, increase me in knowledge." },
      { surahNumber: 91, verseNumber: 8,   surahName: "Ash-Shams",
        arabic: "فَأَلْهَمَهَا فُجُورَهَا وَتَقْوَاهَا",
        translation: "And inspired it [with discernment of] its wickedness and its righteousness." },
    ],
  },

  // ============ CALM ============
  {
    id: "peaceful", name: "Peaceful", arabic: "سَلَام", category: "calm",
    Icon: Feather, gradient: "from-emerald-400 to-teal-300",
    description: "A still pond inside the chest.",
    reflection: "Peace begins where remembrance enters.",
    verses: [
      { surahNumber: 13, verseNumber: 28, surahName: "Ar-Ra'd",
        arabic: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
        translation: "Those who have believed, and whose hearts find rest in the remembrance of Allah. Verily, in the remembrance of Allah do hearts find rest." },
      { surahNumber: 48, verseNumber: 4,  surahName: "Al-Fath",
        arabic: "هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ لِيَزْدَادُوا إِيمَانًا مَّعَ إِيمَانِهِمْ",
        translation: "It is He who sent down tranquility into the hearts of the believers that they would increase in faith along with their faith." },
      { surahNumber: 20, verseNumber: 130, surahName: "Ta-Ha",
        arabic: "وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ غُرُوبِهَا",
        translation: "And exalt with praise of your Lord before the rising of the sun and before its setting." },
      { surahNumber: 6, verseNumber: 127, surahName: "Al-An'am",
        arabic: "لَهُمْ دَارُ السَّلَامِ عِندَ رَبِّهِمْ",
        translation: "For them will be the Home of Peace with their Lord." },
    ],
  },
  {
    id: "reassured", name: "Reassured", arabic: "مُطْمَئِن", category: "calm",
    Icon: Anchor, gradient: "from-emerald-500 to-sky-400",
    description: "Sinking gently into trust.",
    reflection: "When you stop bargaining with reality, your soul lands.",
    verses: [
      { surahNumber: 2, verseNumber: 260, surahName: "Al-Baqarah",
        arabic: "وَلَٰكِن لِّيَطْمَئِنَّ قَلْبِي",
        translation: "But that my heart may be satisfied." },
      { surahNumber: 89, verseNumber: 27, surahName: "Al-Fajr",
        arabic: "يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ",
        translation: "O reassured soul," },
      { surahNumber: 8, verseNumber: 11, surahName: "Al-Anfal",
        arabic: "إِذْ يُغَشِّيكُمُ النُّعَاسَ أَمَنَةً مِّنْهُ",
        translation: "Remember when He overwhelmed you with drowsiness, [giving] security from Him." },
    ],
  },
  {
    id: "patient", name: "Patient", arabic: "صَابِر", category: "calm",
    Icon: Mountain, gradient: "from-emerald-600 to-emerald-800",
    description: "Holding steady in the long middle.",
    reflection: "Patience is not waiting passively — it is staying upright while the storm decides.",
    verses: [
      { surahNumber: 2, verseNumber: 153, surahName: "Al-Baqarah",
        arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
        translation: "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient." },
      { surahNumber: 39, verseNumber: 10, surahName: "Az-Zumar",
        arabic: "إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ",
        translation: "Indeed, the patient will be given their reward without account." },
      { surahNumber: 3, verseNumber: 200, surahName: "Aali Imran",
        arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ",
        translation: "O you who have believed, persevere and endure and remain stationed and fear Allah that you may be successful." },
      { surahNumber: 16, verseNumber: 127, surahName: "An-Nahl",
        arabic: "وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ",
        translation: "And be patient, and your patience is not but through Allah." },
      { surahNumber: 8, verseNumber: 46, surahName: "Al-Anfal",
        arabic: "وَاصْبِرُوا ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
        translation: "And be patient. Indeed, Allah is with the patient." },
    ],
  },
  {
    id: "serene", name: "Serene", arabic: "سَاكِن", category: "calm",
    Icon: Meh, gradient: "from-emerald-400 to-sky-500",
    description: "A wide horizon and a quiet pulse.",
    reflection: "Serenity is what is left when fear leaves.",
    verses: [
      { surahNumber: 48, verseNumber: 4, surahName: "Al-Fath",
        arabic: "هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ",
        translation: "It is He who sent down tranquility into the hearts of the believers." },
      { surahNumber: 2, verseNumber: 248, surahName: "Al-Baqarah",
        arabic: "إِنَّ آيَةَ مُلْكِهِ أَن يَأْتِيَكُمُ التَّابُوتُ فِيهِ سَكِينَةٌ مِّن رَّبِّكُمْ",
        translation: "Indeed, a sign of his kingship is that the chest will come to you in which is tranquility from your Lord." },
    ],
  },

  // ============ DIFFICULT ============
  {
    id: "sad", name: "Sad", arabic: "حَزِين", category: "difficult",
    Icon: CloudRain, gradient: "from-emerald-700 to-slate-600",
    description: "A weight under the ribs that has no name.",
    reflection: "Allah is closer to a sorrowful heart than the lips that say 'I am fine.'",
    verses: [
      { surahNumber: 12, verseNumber: 86, surahName: "Yusuf",
        arabic: "قَالَ إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ وَأَعْلَمُ مِنَ اللَّهِ مَا لَا تَعْلَمُونَ",
        translation: "He said: I only complain of my suffering and my grief to Allah, and I know from Allah that which you do not know." },
      { surahNumber: 9, verseNumber: 40, surahName: "At-Tawbah",
        arabic: "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا",
        translation: "Do not grieve; indeed, Allah is with us." },
      { surahNumber: 3, verseNumber: 139, surahName: "Aali Imran",
        arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
        translation: "So do not weaken and do not grieve, and you will be superior if you are true believers." },
      { surahNumber: 16, verseNumber: 127, surahName: "An-Nahl",
        arabic: "وَلَا تَحْزَنْ عَلَيْهِمْ وَلَا تَكُ فِي ضَيْقٍ مِّمَّا يَمْكُرُونَ",
        translation: "And do not grieve over them and do not be in distress over what they conspire." },
      { surahNumber: 93, verseNumber: 3, surahName: "Ad-Duha",
        arabic: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ",
        translation: "Your Lord has not taken leave of you, [O Muhammad], nor has He detested [you]." },
    ],
  },
  {
    id: "anxious", name: "Anxious", arabic: "قَلِق", category: "difficult",
    Icon: Wind, gradient: "from-emerald-700 to-amber-500",
    description: "A racing mind chasing a moving horizon.",
    reflection: "Tomorrow is in Allah's hand — you were never asked to carry it.",
    verses: [
      { surahNumber: 65, verseNumber: 3, surahName: "At-Talaq",
        arabic: "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
        translation: "And will provide for him from where he does not expect. And whoever relies upon Allah — then He is sufficient for him." },
      { surahNumber: 13, verseNumber: 28, surahName: "Ar-Ra'd",
        arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
        translation: "Verily, in the remembrance of Allah do hearts find rest." },
      { surahNumber: 2, verseNumber: 286, surahName: "Al-Baqarah",
        arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
        translation: "Allah does not charge a soul except with that within its capacity." },
      { surahNumber: 94, verseNumber: 5, surahName: "Ash-Sharh",
        arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
        translation: "For indeed, with hardship will be ease." },
      { surahNumber: 3, verseNumber: 173, surahName: "Aali Imran",
        arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        translation: "Sufficient for us is Allah, and [He is] the best Disposer of affairs." },
    ],
  },
  {
    id: "afraid", name: "Afraid", arabic: "خَائِف", category: "difficult",
    Icon: CloudLightning, gradient: "from-emerald-700 to-purple-600",
    description: "A shadow pressing on the chest.",
    reflection: "You fear because you forget who is on your side.",
    verses: [
      { surahNumber: 41, verseNumber: 30, surahName: "Fussilat",
        arabic: "إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا تَتَنَزَّلُ عَلَيْهِمُ الْمَلَائِكَةُ أَلَّا تَخَافُوا وَلَا تَحْزَنُوا",
        translation: "Indeed, those who have said: Our Lord is Allah and then remained on a right course — the angels will descend upon them, [saying]: Do not fear and do not grieve." },
      { surahNumber: 20, verseNumber: 46, surahName: "Ta-Ha",
        arabic: "قَالَ لَا تَخَافَا ۖ إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَىٰ",
        translation: "[Allah] said: Fear not. Indeed, I am with you both; I hear and I see." },
      { surahNumber: 2, verseNumber: 38, surahName: "Al-Baqarah",
        arabic: "فَمَن تَبِعَ هُدَايَ فَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
        translation: "Whoever follows My guidance — there will be no fear concerning them, nor will they grieve." },
      { surahNumber: 28, verseNumber: 7, surahName: "Al-Qasas",
        arabic: "لَا تَخَافِي وَلَا تَحْزَنِي ۖ إِنَّا رَادُّوهُ إِلَيْكِ",
        translation: "Do not fear and do not grieve. Indeed, We will return him to you." },
    ],
  },
  {
    id: "lonely", name: "Lonely", arabic: "وَحِيد", category: "difficult",
    Icon: Moon, gradient: "from-emerald-700 to-indigo-600",
    description: "A vast quiet without a witness.",
    reflection: "You are not alone. The One who shaped you is closer than your jugular vein.",
    verses: [
      { surahNumber: 50, verseNumber: 16, surahName: "Qaf",
        arabic: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ",
        translation: "And We are closer to him than [his] jugular vein." },
      { surahNumber: 57, verseNumber: 4, surahName: "Al-Hadid",
        arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ ۚ وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ",
        translation: "And He is with you wherever you are. And Allah, of what you do, is Seeing." },
      { surahNumber: 2, verseNumber: 186, surahName: "Al-Baqarah",
        arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
        translation: "And when My servants ask you concerning Me — indeed I am near. I respond to the invocation of the supplicant when he calls upon Me." },
      { surahNumber: 21, verseNumber: 87, surahName: "Al-Anbiya",
        arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
        translation: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers." },
    ],
  },
  {
    id: "heartbroken", name: "Heartbroken", arabic: "مَكْسُور", category: "difficult",
    Icon: Frown, gradient: "from-emerald-700 to-rose-500",
    description: "Something precious has slipped through the fingers.",
    reflection: "Allah is nearest to the broken-hearted. Your fracture is a doorway.",
    verses: [
      { surahNumber: 2, verseNumber: 155, surahName: "Al-Baqarah",
        arabic: "وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ",
        translation: "And We will surely test you with something of fear and hunger and a loss of wealth and lives and fruits, but give good tidings to the patient." },
      { surahNumber: 2, verseNumber: 156, surahName: "Al-Baqarah",
        arabic: "الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
        translation: "Who, when disaster strikes them, say: Indeed we belong to Allah, and indeed to Him we will return." },
      { surahNumber: 2, verseNumber: 157, surahName: "Al-Baqarah",
        arabic: "أُولَٰئِكَ عَلَيْهِمْ صَلَوَاتٌ مِّن رَّبِّهِمْ وَرَحْمَةٌ ۖ وَأُولَٰئِكَ هُمُ الْمُهْتَدُونَ",
        translation: "Those are the ones upon whom are blessings from their Lord and mercy. And it is those who are the [rightly] guided." },
    ],
  },
  {
    id: "angry", name: "Angry", arabic: "غَاضِب", category: "difficult",
    Icon: Flame, gradient: "from-emerald-700 to-red-500",
    description: "A heat that wants to act before it thinks.",
    reflection: "The strong one is not who overpowers others — he is who restrains himself in anger.",
    verses: [
      { surahNumber: 3, verseNumber: 134, surahName: "Aali Imran",
        arabic: "وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ ۗ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ",
        translation: "Who restrain anger and who pardon the people — and Allah loves the doers of good." },
      { surahNumber: 42, verseNumber: 37, surahName: "Ash-Shura",
        arabic: "وَإِذَا مَا غَضِبُوا هُمْ يَغْفِرُونَ",
        translation: "And when they are angry, they forgive." },
      { surahNumber: 7, verseNumber: 199, surahName: "Al-A'raf",
        arabic: "خُذِ الْعَفْوَ وَأْمُرْ بِالْعُرْفِ وَأَعْرِضْ عَنِ الْجَاهِلِينَ",
        translation: "Take what is given freely, enjoin what is good, and turn away from the ignorant." },
      { surahNumber: 41, verseNumber: 34, surahName: "Fussilat",
        arabic: "ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ فَإِذَا الَّذِي بَيْنَكَ وَبَيْنَهُ عَدَاوَةٌ كَأَنَّهُ وَلِيٌّ حَمِيمٌ",
        translation: "Repel [evil] by that [deed] which is better; and thereupon the one whom between you and him is enmity [will become] as though he was a devoted friend." },
    ],
  },
  {
    id: "weary", name: "Weary", arabic: "مُتْعَب", category: "difficult",
    Icon: Cloud, gradient: "from-emerald-600 to-stone-500",
    description: "Even rest feels heavy.",
    reflection: "Lay it down. Allah is not asking you to be everything — only to be honest.",
    verses: [
      { surahNumber: 35, verseNumber: 35, surahName: "Fatir",
        arabic: "الَّذِي أَحَلَّنَا دَارَ الْمُقَامَةِ مِن فَضْلِهِ لَا يَمَسُّنَا فِيهَا نَصَبٌ وَلَا يَمَسُّنَا فِيهَا لُغُوبٌ",
        translation: "He who has settled us in the home of duration out of His bounty. There touches us not in it any fatigue, nor touches us in it any weariness." },
      { surahNumber: 78, verseNumber: 9, surahName: "An-Naba",
        arabic: "وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا",
        translation: "And made your sleep [a means for] rest." },
      { surahNumber: 25, verseNumber: 47, surahName: "Al-Furqan",
        arabic: "وَهُوَ الَّذِي جَعَلَ لَكُمُ اللَّيْلَ لِبَاسًا وَالنَّوْمَ سُبَاتًا",
        translation: "And it is He who has made the night for you as clothing and sleep [a means for] rest." },
    ],
  },
  {
    id: "guilty", name: "Guilty", arabic: "آثِم", category: "difficult",
    Icon: AlertCircle, gradient: "from-emerald-700 to-orange-500",
    description: "A weight that follows you into prayer.",
    reflection: "The door of return is wider than the door of sin. Walk through it.",
    verses: [
      { surahNumber: 39, verseNumber: 53, surahName: "Az-Zumar",
        arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ",
        translation: "Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful." },
      { surahNumber: 4, verseNumber: 110, surahName: "An-Nisa",
        arabic: "وَمَن يَعْمَلْ سُوءًا أَوْ يَظْلِمْ نَفْسَهُ ثُمَّ يَسْتَغْفِرِ اللَّهَ يَجِدِ اللَّهَ غَفُورًا رَّحِيمًا",
        translation: "And whoever does a wrong or wrongs himself but then seeks forgiveness of Allah will find Allah Forgiving and Merciful." },
      { surahNumber: 25, verseNumber: 70, surahName: "Al-Furqan",
        arabic: "إِلَّا مَن تَابَ وَآمَنَ وَعَمِلَ عَمَلًا صَالِحًا فَأُولَٰئِكَ يُبَدِّلُ اللَّهُ سَيِّئَاتِهِمْ حَسَنَاتٍ",
        translation: "Except for those who repent, believe and do righteous work — for them Allah will replace their evil deeds with good." },
    ],
  },
  {
    id: "lost", name: "Lost", arabic: "ضَائِع", category: "difficult",
    Icon: Compass, gradient: "from-emerald-700 to-blue-600",
    description: "Standing at a crossroads with no map.",
    reflection: "Ask the One who made the road. Then walk.",
    verses: [
      { surahNumber: 1, verseNumber: 6, surahName: "Al-Fatihah",
        arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        translation: "Guide us to the straight path." },
      { surahNumber: 29, verseNumber: 69, surahName: "Al-Ankabut",
        arabic: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
        translation: "And those who strive for Us — We will surely guide them to Our ways." },
      { surahNumber: 47, verseNumber: 17, surahName: "Muhammad",
        arabic: "وَالَّذِينَ اهْتَدَوْا زَادَهُمْ هُدًى وَآتَاهُمْ تَقْوَاهُمْ",
        translation: "And those who are guided — He increases them in guidance and gives them their righteousness." },
    ],
  },
  {
    id: "envious", name: "Envious", arabic: "حَسُود", category: "difficult",
    Icon: Eye, gradient: "from-emerald-700 to-yellow-500",
    description: "Wishing what is not yours.",
    reflection: "Envy disputes the wisdom of the One who distributed. Trust the share.",
    verses: [
      { surahNumber: 4, verseNumber: 32, surahName: "An-Nisa",
        arabic: "وَلَا تَتَمَنَّوْا مَا فَضَّلَ اللَّهُ بِهِ بَعْضَكُمْ عَلَىٰ بَعْضٍ",
        translation: "And do not wish for that by which Allah has made some of you exceed others." },
      { surahNumber: 113, verseNumber: 5, surahName: "Al-Falaq",
        arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        translation: "And from the evil of an envier when he envies." },
      { surahNumber: 20, verseNumber: 131, surahName: "Ta-Ha",
        arabic: "وَلَا تَمُدَّنَّ عَيْنَيْكَ إِلَىٰ مَا مَتَّعْنَا بِهِ أَزْوَاجًا مِّنْهُمْ زَهْرَةَ الْحَيَاةِ الدُّنْيَا",
        translation: "And do not extend your eyes toward that by which We have given enjoyment to [certain] categories of them, [its being but] the splendor of worldly life." },
    ],
  },

  // ============ SPIRITUAL ============
  {
    id: "remorseful", name: "Remorseful", arabic: "نَادِم", category: "spiritual",
    Icon: Brain, gradient: "from-emerald-600 to-stone-600",
    description: "The honest pain of seeing yourself clearly.",
    reflection: "Regret is the first key. Repentance is the second.",
    verses: [
      { surahNumber: 66, verseNumber: 8, surahName: "At-Tahrim",
        arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا",
        translation: "O you who have believed, repent to Allah with sincere repentance." },
      { surahNumber: 11, verseNumber: 3, surahName: "Hud",
        arabic: "وَأَنِ اسْتَغْفِرُوا رَبَّكُمْ ثُمَّ تُوبُوا إِلَيْهِ",
        translation: "And seek forgiveness of your Lord and repent to Him." },
      { surahNumber: 24, verseNumber: 31, surahName: "An-Nur",
        arabic: "وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَ الْمُؤْمِنُونَ لَعَلَّكُمْ تُفْلِحُونَ",
        translation: "And turn to Allah in repentance, all of you, O believers, that you might succeed." },
    ],
  },
  {
    id: "humble", name: "Humble", arabic: "مُتَوَاضِع", category: "spiritual",
    Icon: Feather, gradient: "from-emerald-500 to-emerald-700",
    description: "Smaller in your own eyes, lighter in your chest.",
    reflection: "The earth is firm precisely because it lies low.",
    verses: [
      { surahNumber: 25, verseNumber: 63, surahName: "Al-Furqan",
        arabic: "وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا",
        translation: "And the servants of the Most Merciful are those who walk upon the earth in humility." },
      { surahNumber: 17, verseNumber: 37, surahName: "Al-Isra",
        arabic: "وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا ۖ إِنَّكَ لَن تَخْرِقَ الْأَرْضَ وَلَن تَبْلُغَ الْجِبَالَ طُولًا",
        translation: "And do not walk upon the earth exultantly. Indeed, you will never tear the earth, and you will never reach the mountains in height." },
      { surahNumber: 7, verseNumber: 55, surahName: "Al-A'raf",
        arabic: "ادْعُوا رَبَّكُمْ تَضَرُّعًا وَخُفْيَةً ۚ إِنَّهُ لَا يُحِبُّ الْمُعْتَدِينَ",
        translation: "Call upon your Lord in humility and privately; indeed, He does not like transgressors." },
    ],
  },
  {
    id: "in-awe", name: "In Awe", arabic: "خَاشِع", category: "spiritual",
    Icon: Sun, gradient: "from-emerald-500 to-amber-400",
    description: "Stilled by the immensity of the Maker.",
    reflection: "Awe softens the heart in ways arguments never can.",
    verses: [
      { surahNumber: 23, verseNumber: 1, surahName: "Al-Mu'minun",
        arabic: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ",
        translation: "Certainly will the believers have succeeded." },
      { surahNumber: 23, verseNumber: 2, surahName: "Al-Mu'minun",
        arabic: "الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ",
        translation: "They who are during their prayer humbly submissive." },
      { surahNumber: 59, verseNumber: 21, surahName: "Al-Hashr",
        arabic: "لَوْ أَنزَلْنَا هَٰذَا الْقُرْآنَ عَلَىٰ جَبَلٍ لَّرَأَيْتَهُ خَاشِعًا مُّتَصَدِّعًا مِّنْ خَشْيَةِ اللَّهِ",
        translation: "If We had sent down this Qur'an upon a mountain, you would have seen it humbled and coming apart from fear of Allah." },
      { surahNumber: 17, verseNumber: 109, surahName: "Al-Isra",
        arabic: "وَيَخِرُّونَ لِلْأَذْقَانِ يَبْكُونَ وَيَزِيدُهُمْ خُشُوعًا",
        translation: "And they fall upon their faces weeping, and it increases them in humble submission." },
    ],
  },
  {
    id: "mindful", name: "Mindful", arabic: "ذَاكِر", category: "spiritual",
    Icon: Coffee, gradient: "from-emerald-500 to-emerald-600",
    description: "Walking through the day with Allah on the tongue.",
    reflection: "Remembrance is a small act with infinite weight.",
    verses: [
      { surahNumber: 33, verseNumber: 41, surahName: "Al-Ahzab",
        arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا",
        translation: "O you who have believed, remember Allah with much remembrance." },
      { surahNumber: 33, verseNumber: 42, surahName: "Al-Ahzab",
        arabic: "وَسَبِّحُوهُ بُكْرَةً وَأَصِيلًا",
        translation: "And exalt Him morning and afternoon." },
      { surahNumber: 3, verseNumber: 191, surahName: "Aali Imran",
        arabic: "الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ",
        translation: "Who remember Allah while standing or sitting or [lying] on their sides." },
      { surahNumber: 63, verseNumber: 9, surahName: "Al-Munafiqun",
        arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تُلْهِكُمْ أَمْوَالُكُمْ وَلَا أَوْلَادُكُمْ عَن ذِكْرِ اللَّهِ",
        translation: "O you who have believed, let not your wealth and your children divert you from remembrance of Allah." },
    ],
  },

  // ============ TRANSFORMATIVE ============
  {
    id: "determined", name: "Determined", arabic: "عَازِم", category: "transformative",
    Icon: Zap, gradient: "from-emerald-500 to-emerald-700",
    description: "A clean, narrow line forward.",
    reflection: "Decide once. Then let consistency do the work.",
    verses: [
      { surahNumber: 3, verseNumber: 159, surahName: "Aali Imran",
        arabic: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ",
        translation: "And when you have decided, then rely upon Allah. Indeed, Allah loves those who rely [upon Him]." },
      { surahNumber: 11, verseNumber: 112, surahName: "Hud",
        arabic: "فَاسْتَقِمْ كَمَا أُمِرْتَ",
        translation: "So remain on a right course as you have been commanded." },
      { surahNumber: 41, verseNumber: 30, surahName: "Fussilat",
        arabic: "إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا",
        translation: "Indeed, those who have said: Our Lord is Allah, and then remained on a right course." },
    ],
  },
  {
    id: "forgiving", name: "Forgiving", arabic: "عَافِي", category: "transformative",
    Icon: Gem, gradient: "from-emerald-400 to-teal-500",
    description: "Letting the weight slide off the shoulder.",
    reflection: "The one you forgive may not deserve it. Your peace does.",
    verses: [
      { surahNumber: 24, verseNumber: 22, surahName: "An-Nur",
        arabic: "وَلْيَعْفُوا وَلْيَصْفَحُوا ۗ أَلَا تُحِبُّونَ أَن يَغْفِرَ اللَّهُ لَكُمْ",
        translation: "And let them pardon and overlook. Would you not like that Allah should forgive you?" },
      { surahNumber: 42, verseNumber: 40, surahName: "Ash-Shura",
        arabic: "فَمَنْ عَفَا وَأَصْلَحَ فَأَجْرُهُ عَلَى اللَّهِ",
        translation: "And whoever pardons and makes reconciliation — his reward is [due] from Allah." },
      { surahNumber: 7, verseNumber: 199, surahName: "Al-A'raf",
        arabic: "خُذِ الْعَفْوَ وَأْمُرْ بِالْعُرْفِ وَأَعْرِضْ عَنِ الْجَاهِلِينَ",
        translation: "Take what is given freely, enjoin what is good, and turn away from the ignorant." },
    ],
  },
  {
    id: "trusting", name: "Trusting", arabic: "مُتَوَكِّل", category: "transformative",
    Icon: Book, gradient: "from-emerald-500 to-cyan-600",
    description: "Releasing the rope you were never meant to pull.",
    reflection: "Tie your camel — then let go.",
    verses: [
      { surahNumber: 65, verseNumber: 3, surahName: "At-Talaq",
        arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ",
        translation: "And whoever relies upon Allah — then He is sufficient for him. Indeed, Allah will accomplish His purpose." },
      { surahNumber: 33, verseNumber: 3, surahName: "Al-Ahzab",
        arabic: "وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا",
        translation: "And rely upon Allah; and sufficient is Allah as Disposer of affairs." },
      { surahNumber: 14, verseNumber: 12, surahName: "Ibrahim",
        arabic: "وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُتَوَكِّلُونَ",
        translation: "And upon Allah let those who rely [trust]." },
      { surahNumber: 25, verseNumber: 58, surahName: "Al-Furqan",
        arabic: "وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ",
        translation: "And rely upon the Ever-Living who does not die." },
    ],
  },
  {
    id: "victorious", name: "Victorious", arabic: "مُنْتَصِر", category: "transformative",
    Icon: Award, gradient: "from-emerald-500 to-yellow-500",
    description: "The clean light of an honest win.",
    reflection: "Victory comes from Allah. Receive it without arrogance.",
    verses: [
      { surahNumber: 61, verseNumber: 13, surahName: "As-Saff",
        arabic: "نَصْرٌ مِّنَ اللَّهِ وَفَتْحٌ قَرِيبٌ ۗ وَبَشِّرِ الْمُؤْمِنِينَ",
        translation: "Victory from Allah and an imminent conquest; and give good tidings to the believers." },
      { surahNumber: 110, verseNumber: 1, surahName: "An-Nasr",
        arabic: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ",
        translation: "When the victory of Allah has come and the conquest." },
      { surahNumber: 30, verseNumber: 5, surahName: "Ar-Rum",
        arabic: "بِنَصْرِ اللَّهِ ۚ يَنصُرُ مَن يَشَاءُ ۖ وَهُوَ الْعَزِيزُ الرَّحِيمُ",
        translation: "In the victory of Allah. He gives victory to whom He wills, and He is the Exalted in Might, the Merciful." },
    ],
  },
];

/* ============================================================
   ICON ORB
   ============================================================ */
function EmotionIcon({ Icon, gradient, size = "md" }) {
  const sizeMap = {
    sm: { wrap: "h-10 w-10", icon: 18 },
    md: { wrap: "h-14 w-14", icon: 24 },
    lg: { wrap: "h-20 w-20", icon: 34 },
    xl: { wrap: "h-28 w-28", icon: 48 },
  };
  const cfg = sizeMap[size];
  return (
    <motion.div
      whileHover={{ scale: 1.06, rotate: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className={`
        relative ${cfg.wrap} shrink-0 rounded-2xl
        bg-gradient-to-br ${gradient}
        flex items-center justify-center
        shadow-[0_8px_24px_-8px_rgba(16,185,129,0.45)]
        before:content-[''] before:absolute before:inset-[-3px]
        before:rounded-[inherit] before:bg-gradient-to-br before:${gradient}
        before:opacity-25 before:blur-md before:-z-10
        after:content-[''] after:absolute after:inset-0
        after:rounded-[inherit]
        after:bg-gradient-to-tr after:from-white/30 after:via-transparent after:to-transparent
        after:pointer-events-none
      `}
    >
      <Icon size={cfg.icon} strokeWidth={1.75} className="relative z-10 text-white drop-shadow-sm" />
    </motion.div>
  );
}

/* ============================================================
   EMOTION CARD
   ============================================================ */
function EmotionCard({ emotion, onSelect, index }) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(emotion)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.025, 0.4),
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className="
        group relative w-full text-left
        bg-white/80 backdrop-blur border border-emerald-100
        rounded-2xl p-4
        shadow-[0_1px_2px_0_rgba(16,185,129,0.04)]
        hover:shadow-[0_16px_32px_-12px_rgba(16,185,129,0.18)]
        hover:border-emerald-200
        transition-all duration-300
        flex flex-col items-center gap-3
        overflow-hidden
      "
    >
      <div
        className={`
          absolute -top-12 -right-12 h-32 w-32 rounded-full
          bg-gradient-to-br ${emotion.gradient}
          opacity-0 group-hover:opacity-15 blur-2xl
          transition-opacity duration-500
        `}
      />
      <EmotionIcon Icon={emotion.Icon} gradient={emotion.gradient} size="md" />
      <div className="text-center min-h-[2.75rem] flex flex-col justify-center">
        <h3 className="text-sm font-semibold text-emerald-950 tracking-tight">
          {emotion.name}
        </h3>
        <p
          className="text-[13px] text-emerald-700/70 mt-0.5"
          style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
          dir="rtl"
        >
          {emotion.arabic}
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 uppercase tracking-wider">
        <span className="h-1 w-1 rounded-full bg-emerald-500" />
        {emotion.verses.length} verses
      </div>
    </motion.button>
  );
}

/* ============================================================
   EMOTION DETAIL SHEET
   ============================================================ */
function EmotionDetail({ emotion, onClose }) {
  useEffect(() => {
    if (emotion) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [emotion]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {emotion && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-emerald-950/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="
              fixed top-0 right-0 bottom-0 z-50
              w-full sm:max-w-2xl
              bg-white shadow-2xl
              flex flex-col overflow-hidden
            "
          >
            {/* Hero */}
            <div className={`
              relative shrink-0 px-6 sm:px-10 pt-6 pb-8
              bg-gradient-to-br ${emotion.gradient}
              text-white overflow-hidden
            `}>
              <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex items-center justify-between mb-8">
                <button
                  onClick={onClose}
                  className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <ChevronLeft size={20} strokeWidth={2.25} />
                </button>
                <div className="flex items-center gap-2">
                  <button className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center transition-colors" aria-label="Bookmark">
                    <Bookmark size={18} strokeWidth={2} />
                  </button>
                  <button className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center transition-colors" aria-label="Share">
                    <Share2 size={18} strokeWidth={2} />
                  </button>
                  <button onClick={onClose} className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center transition-colors" aria-label="Close">
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="relative flex items-end gap-5">
                <div className="rounded-2xl bg-white/15 backdrop-blur-md p-3 shadow-lg">
                  <emotion.Icon size={48} strokeWidth={1.75} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-[0.18em] mb-1">
                    Emotion · {emotion.verses.length} verses
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
                    {emotion.name}
                  </h2>
                  <p
                    className="text-2xl mt-1 text-white/90"
                    style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
                    dir="rtl"
                  >
                    {emotion.arabic}
                  </p>
                </div>
              </div>

              <p
                className="relative italic text-lg text-white/90 mt-6 leading-relaxed max-w-xl"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                "{emotion.reflection}"
              </p>
            </div>

            {/* Verses */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 bg-white">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen size={16} className="text-emerald-600" strokeWidth={2.25} />
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  From the Qur'an
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent" />
              </div>

              <p className="text-sm text-emerald-900/65 mb-8 leading-relaxed">
                {emotion.description}
              </p>

              <div className="space-y-4">
                {emotion.verses.map((verse, i) => (
                  <motion.article
                    key={`${verse.surahNumber}-${verse.verseNumber}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                    className="
                      group relative rounded-2xl
                      bg-emerald-50/60 border border-emerald-100
                      p-5 sm:p-6
                      hover:border-emerald-300
                      hover:shadow-[0_8px_24px_-12px_rgba(16,185,129,0.25)]
                      transition-all duration-300
                    "
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-emerald-900">
                            {verse.surahName}
                          </p>
                          <p className="text-[11px] text-emerald-700/70 font-medium">
                            Surah {verse.surahNumber} · Ayah {verse.verseNumber}
                          </p>
                        </div>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full flex items-center justify-center text-emerald-700 hover:bg-emerald-100"
                        aria-label="Bookmark verse"
                      >
                        <Bookmark size={14} />
                      </button>
                    </div>

                    <p
                      className="text-2xl sm:text-[28px] leading-[2] text-emerald-950 mb-4 text-right"
                      style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
                      dir="rtl"
                    >
                      {verse.arabic}
                    </p>

                    <p
                      className="text-[15px] sm:text-base text-emerald-900/85 leading-relaxed"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {verse.translation}
                    </p>
                  </motion.article>
                ))}
              </div>

              <p className="mt-10 text-center text-xs text-emerald-700/60">
                May these verses bring light to your heart.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   MAIN PAGE - EmotionMirror (Full Page)
   ============================================================ */
export default function EmotionMirror() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EMOTIONS.filter((e) => {
      if (filter !== "all" && e.category !== filter) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.arabic.includes(q) ||
        e.verses.some(
          (v) =>
            v.surahName.toLowerCase().includes(q) ||
            v.translation.toLowerCase().includes(q),
        )
      );
    });
  }, [query, filter]);

  const totalVerses = useMemo(
    () => EMOTIONS.reduce((acc, e) => acc + e.verses.length, 0),
    [],
  );

  return (
    <div
      className="min-h-screen bg-[#f0f8f3] relative overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-emerald-200/40 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[380px] w-[380px] rounded-full bg-teal-200/30 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-emerald-100/40 blur-[100px]" />
      </div>

      <main className="relative max-w-6xl mx-auto px-5 sm:px-10 pt-16 sm:pt-24 pb-20">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/70 text-emerald-700 text-[11px] font-medium uppercase tracking-[0.16em] mb-7">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            The Emotion Mirror
          </div>

          <h1
            className="font-normal text-5xl sm:text-6xl md:text-[68px] text-emerald-950 leading-[1.04] tracking-tight mb-5"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            How does your{" "}
            <span className="italic font-medium text-emerald-700">heart feel</span>
            <span className="text-emerald-700">?</span>
          </h1>

          <p className="text-lg sm:text-xl text-emerald-900/65 leading-relaxed max-w-2xl">
            Every emotion is a door to Allah's words. Find the verses that speak
            directly to what you're carrying — right now, in this moment.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-emerald-800/70">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">{EMOTIONS.length} emotions</span>
            </div>
            <span className="h-3 w-px bg-emerald-300/60" />
            <div className="flex items-center gap-2">
              <span className="font-medium">{totalVerses} verses</span>
            </div>
            <span className="h-3 w-px bg-emerald-300/60" />
            <div className="flex items-center gap-2">
              <span className="font-medium">From the Qur'an</span>
            </div>
          </div>
        </motion.section>

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6 }}
          className="mt-12 sm:mt-14"
        >
          <div className="relative max-w-2xl group">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600/70 group-focus-within:text-emerald-600 transition-colors"
              strokeWidth={2.25}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tell us how you feel… anxious, grateful, lost, hopeful…"
              className="
                w-full h-14 pl-14 pr-14 rounded-2xl
                bg-white/80 backdrop-blur-md border border-emerald-100
                text-[15px] text-emerald-950 placeholder:text-emerald-700/40
                shadow-[0_8px_28px_-12px_rgba(16,185,129,0.18)]
                focus:outline-none focus:border-emerald-400
                focus:shadow-[0_0_0_4px_rgba(16,185,129,0.10),0_8px_28px_-12px_rgba(16,185,129,0.25)]
                transition-all
              "
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors"
                aria-label="Clear search"
              >
                <X size={13} className="text-emerald-700" strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`
                    relative px-4 h-9 rounded-full text-[12.5px] font-medium
                    transition-all duration-200
                    ${active
                      ? "bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(16,185,129,0.55)]"
                      : "bg-white/70 backdrop-blur border border-emerald-100 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50"
                    }
                  `}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-14 mb-6 flex items-center gap-3"
        >
          <div className="h-px flex-1 max-w-[36px] bg-emerald-300/70" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {filter === "all" ? "Choose what speaks to you" : CATEGORY_META[filter].label}
          </h2>
          <div className="h-px flex-1 bg-emerald-200/60" />
          <span className="text-[11px] font-medium text-emerald-700/70">
            {filtered.length} {filtered.length === 1 ? "emotion" : "emotions"}
          </span>
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div
              key={`${filter}-${query}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
            >
              {filtered.map((emotion, index) => (
                <EmotionCard
                  key={emotion.id}
                  emotion={emotion}
                  onSelect={setSelected}
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <div className="inline-flex h-16 w-16 rounded-2xl bg-emerald-100/70 items-center justify-center mb-4">
                <Search size={28} className="text-emerald-600" strokeWidth={1.75} />
              </div>
              <p className="text-sm text-emerald-800/70">
                No emotions match your search. Try another word.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Closing verse */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-24 mb-6 text-center"
        >
          <div className="inline-flex flex-col items-center gap-3">
            <span className="h-px w-16 bg-emerald-300/70" />
            <p
              className="italic text-base sm:text-lg text-emerald-900/70 leading-relaxed max-w-md"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              "Indeed, in the remembrance of Allah do hearts find rest."
            </p>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-700/70">
              Ar-Ra'd · 13:28
            </span>
          </div>
        </motion.footer>
      </main>

      <EmotionDetail emotion={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, ChevronRight, Heart, Star, 
  Bookmark, Calendar, Clock, MapPin, Share2, 
  Search, Shield, Award, Compass, LifeBuoy,
  BookOpen, Sparkles, Droplets, BarChart2, Users,
  ArrowRight, MessageCircle, RefreshCw, Loader2,
  CheckCircle2, Quote, Globe, Zap, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import { quranApi } from '../api/quranApi';

// Add Quran Font
const quranFontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');
  .font-arabic {
    font-family: 'Noto Naskh Arabic', 'Amiri', 'Traditional Arabic', serif;
    font-weight: 500;
    line-height: 1.8;
    letter-spacing: 0.02em;
    word-break: break-word;
    overflow-wrap: break-word;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = quranFontStyle;
  document.head.appendChild(style);
}

const FEATURE_PORTALS = [
  { id: 'mirror', label: 'Heart Mirror', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Find verses that match your current emotional state with high precision.' },
  { id: 'quran', label: 'Holy Quran', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Read, listen, and contemplate the divine text in its original glory.' },
  { id: 'journey', label: 'Life Companion', icon: Compass, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Map your life events to eternal scriptures and see your story unfold.' },
  { id: 'dna', label: 'Spiritual DNA', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-50', desc: 'Understand your spiritual strengths through advanced analytics and tracking.' },
];

const EMOTIONS = [
  { id: 'grateful', icon: '🙏', label: 'Grateful', surah: 14, verse: 7 },
  { id: 'joyful', icon: '😊', label: 'Joyful', surah: 10, verse: 58 },
  { id: 'peaceful', icon: '🕊️', label: 'Peaceful', surah: 13, verse: 28 },
  { id: 'sad', icon: '😢', label: 'Sad', surah: 12, verse: 86 },
  { id: 'anxious', icon: '😰', label: 'Anxious', surah: 9, verse: 40 },
  { id: 'hopeful', icon: '🌅', label: 'Hopeful', surah: 39, verse: 53 },
];

const TESTIMONIALS = [
  { name: 'Adil K.', role: 'Seeker', content: 'Echoes of Jannah has transformed how I read the Quran. It feels like the Book is speaking directly to my daily life.' },
  { name: 'Sarah M.', role: 'Student', content: 'The Heart Mirror is incredible. Finding comfort in verses during my low moments has been a game-changer.' },
  { name: 'Omar J.', role: 'Teacher', content: 'A beautiful bridge between our modern world and the timeless wisdom of Islam. Highly recommended.' },
];

export default function LifeTimeline() {
  const navigate = useNavigate();
  const { userData, addXP, reflections, streak, level } = useUser();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', emotion: '', description: '', location: '' });
  const [dailyVerse, setDailyVerse] = useState(null);
  const [loadingVerse, setLoadingVerse] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('timeline_events');
    if (saved) setEvents(JSON.parse(saved));
    fetchDailyVerse();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  const fetchDailyVerse = async () => {
    setLoadingVerse(true);
    try {
      const randomVerseNum = Math.floor(Math.random() * 286) + 1;
      const verse = await quranApi.getVerse(2, randomVerseNum); 
      setDailyVerse(verse?.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVerse(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.emotion) return toast.error('Required fields missing');
    
    const emotionData = EMOTIONS.find(e => e.id === newEvent.emotion);
    try {
      const verse = await quranApi.getVerse(emotionData.surah, emotionData.verse);
      
      const event = {
        ...newEvent,
        id: Date.now().toString(),
        quranMatch: {
          ...emotionData,
          verseText: verse?.data.text,
          arabic: verse?.data.arabic,
          surahName: `Surah ${emotionData?.surah}`
        },
        createdAt: new Date().toISOString()
      };

      const updated = [event, ...events];
      localStorage.setItem('timeline_events', JSON.stringify(updated));
      setEvents(updated);
      setShowAddModal(false);
      setNewEvent({ title: '', emotion: '', description: '', location: '' });
      addXP(25);
      toast.success('Chapter added! +25 XP');
    } catch (err) {
      toast.error('Failed to fetch sacred matching verse');
    }
  };

  const handleDeleteEvent = (eventId, e) => {
    e.stopPropagation();
    const updated = events.filter(event => event.id !== eventId);
    localStorage.setItem('timeline_events', JSON.stringify(updated));
    setEvents(updated);
    if (selectedEventId === eventId) setSelectedEventId(null);
    toast.success('Chapter removed');
  };

  return (
    <div className="w-full">
      {/* 1. HERO SECTION - Full width */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px] opacity-30 animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-100 rounded-full blur-[100px] opacity-20" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-12">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
             className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm text-xs font-black uppercase tracking-[0.3em]"
           >
             <Sparkles size={14} className="text-emerald-500" /> Transform Your Spiritual Presence
           </motion.div>
           
           <motion.h1 
             initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }}
             className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-gray-900 font-serif"
           >
             Every Breath is a <br/>
             <span className="text-emerald-600 italic font-medium relative">
               Sacred Echo
               <svg className="absolute -bottom-2 left-0 w-full h-2 text-emerald-200/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
               </svg>
             </span>
           </motion.h1>
           
           <motion.p 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
             className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed"
           >
             The world's first spiritual companion that synchronizes your life moments with the eternal words of the Quran. Experience faith as a living, breathing dialogue.
           </motion.p>
           
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
             className="flex flex-wrap justify-center gap-4 pt-6"
           >
             <button 
               onClick={() => setShowAddModal(true)}
               className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 group text-lg"
             >
               Start Your Narrative <ChevronRight className="group-hover:translate-x-1 transition-transform" />
             </button>
             <button 
               onClick={() => handleNavigate('/journey')}
               className="px-8 py-4 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 rounded-xl font-bold shadow-sm transition-all text-lg flex items-center gap-2"
             >
               Explore Portals <ArrowRight size={18} className="text-emerald-500" />
             </button>
           </motion.div>
        </div>
      </section>

      {/* 2. NAVIGATION PORTALS - Full width with centered content */}
      <section className="w-full px-4 sm:px-6 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURE_PORTALS.map((portal) => (
              <motion.button
                key={portal.id}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => handleNavigate(`/${portal.id === 'timeline' ? '' : portal.id}`)}
                className="group bg-white p-10 rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all text-left flex flex-col h-full relative overflow-hidden min-h-[380px]"
              >
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 group-hover:rotate-12 transition-all">
                   <portal.icon size={120} />
                </div>
                <div className={`w-20 h-20 rounded-2xl ${portal.bg} ${portal.color} flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                   <portal.icon size={40} />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors font-serif mb-4">{portal.label}</h3>
                <p className="text-gray-500 text-base leading-relaxed flex-1">{portal.desc}</p>
                <div className="mt-8 flex items-center gap-3 text-sm font-black text-emerald-600 uppercase tracking-widest pt-6 border-t border-gray-100">
                   Explore Portal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. VERSE OF THE DAY - Full width */}
      <section className="w-full px-4 sm:px-6 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-10 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
            
            <div className="lg:w-1/3 text-center lg:text-left relative z-10">
               <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                 <Globe size={14} /> Celestial Sync
               </div>
               <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">Daily Light</h2>
               <p className="text-gray-500 text-base leading-relaxed mb-8">A specialized verse selected for your journey today. Carry its wisdom like a torch through the darkness.</p>
               <button 
                 onClick={fetchDailyVerse}
                 disabled={loadingVerse}
                 className="inline-flex items-center gap-3 px-5 py-2.5 bg-gray-50 hover:bg-emerald-50 text-emerald-600 rounded-xl font-bold transition-all disabled:opacity-50 text-sm"
               >
                 {loadingVerse ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                 Recalibrate Soul
               </button>
            </div>

            <div className="flex-1 w-full bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-100 relative z-10">
               {dailyVerse ? (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <p className="text-right font-arabic text-2xl md:text-3xl lg:text-4xl leading-[2] text-emerald-950 font-medium break-words">
                      {dailyVerse.arabic}
                    </p>
                    <div className="space-y-4">
                      <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl w-fit">
                         <Quote className="text-emerald-200" size={24} />
                      </div>
                      <p className="text-xl md:text-2xl font-serif italic text-gray-700 leading-relaxed">"{dailyVerse.text}"</p>
                      <div className="flex items-center gap-3">
                         <div className="h-px w-8 bg-emerald-200" />
                         <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Surah {dailyVerse.surah} • Verse {dailyVerse.verse}</p>
                      </div>
                    </div>
                 </motion.div>
               ) : (
                 <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-emerald-400" size={48} />
                    <p className="text-emerald-300 font-bold uppercase tracking-widest text-[10px]">Calling the Heavens...</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. RECENT CHAPTERS - Enhanced Design */}
<section className="w-full px-4 sm:px-6 mt-20">
  <div className="max-w-7xl mx-auto">
    {/* Header Section */}
    <div className="relative mb-16">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 bg-amber-50 text-amber-700 rounded-full border border-amber-200"
          >
            <BookOpen size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sacred Chronicles</span>
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 font-serif leading-tight">
            Your Sacred<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">History</span>
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            Every moment recorded becomes a verse in your spiritual narrative. 
            Watch as the Quran reflects your journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm min-w-[120px]">
            <p className="text-3xl font-bold text-gray-900">{events.length}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Chapters</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm min-w-[120px]">
            <p className="text-3xl font-bold text-emerald-600">{streak || 0}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Add Chapter Button - Floating Style */}
      <motion.button 
        onClick={() => setShowAddModal(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:shadow-2xl hover:shadow-emerald-600/30 transition-all flex items-center gap-3 group"
      >
        <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" /> 
        <span className="uppercase tracking-wider text-sm">Record New Chapter</span>
      </motion.button>
    </div>

    {/* Timeline Content */}
    {events.length === 0 ? (
      /* Empty State - Enhanced */
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-gray-50 to-white rounded-[3rem] border-2 border-dashed border-gray-200 p-16 md:p-20"
      >
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 opacity-5">
          <BookOpen size={200} />
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Animated Book Icon */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-amber-100 to-amber-50 rounded-3xl flex items-center justify-center shadow-lg border border-amber-200"
          >
            <span className="text-5xl">📖</span>
          </motion.div>

          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif mb-4">
            The Book Awaits Your Ink
          </h3>
          
          <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg mx-auto">
            Your life is a tapestry of divine signs waiting to be recorded. 
            Begin writing your first chapter and watch as the Quran illuminates your path.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: '✨', text: 'Quranic Mirroring' },
              { icon: '🕌', text: 'Spiritual Growth' },
              { icon: '💚', text: 'Emotional Healing' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100">
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{feature.text}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center gap-3 mx-auto shadow-xl shadow-gray-200 group"
          >
            <span>Begin Your Journey</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    ) : (
      /* Timeline with Cards */
      <div className="space-y-6">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Timeline Card */}
            <div className="relative group/card">
              {/* Timeline Connector */}
              {i < events.length - 1 && (
                <div className="absolute left-8 top-24 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 to-transparent" />
              )}
              
              <div className="flex gap-6">
                {/* Timeline Dot */}
                <div className="relative flex-shrink-0">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white ${
                    i === 0 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' 
                      : 'bg-gray-50 text-gray-400'
                  }`}>
                    {i === 0 ? (
                      <Sparkles size={24} />
                    ) : (
                      <span className="text-lg font-bold">{i + 1}</span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div 
                  className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
                >
                  <div className="p-6 md:p-8">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">
                          {EMOTIONS.find(e => e.id === event.emotion)?.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1 rounded-full">
                              {EMOTIONS.find(e => e.id === event.emotion)?.label}
                            </span>
                            {i === 0 && (
                              <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1">
                                <Sparkles size={10} /> Latest
                              </span>
                            )}
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif group-hover/card:text-emerald-700 transition-colors">
                            {event.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleDeleteEvent(event.id, e)}
                          className="p-3 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-xl transition-all opacity-0 group-hover/card:opacity-100"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-base leading-relaxed mb-6 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={14} />
                        <span>{new Date(event.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={14} />
                        <span>{new Date(event.createdAt).toLocaleTimeString([], {
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Expand Indicator */}
                    <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-bold">
                      <span>{selectedEventId === event.id ? 'Hide Reflection' : 'View Quranic Mirror'}</span>
                      <ChevronRight 
                        size={16} 
                        className={`transition-transform ${selectedEventId === event.id ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Expanded Quranic Match */}
                  <AnimatePresence>
                    {selectedEventId === event.id && event.quranMatch && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 md:p-10">
                          <div className="max-w-4xl">
                            {/* Arabic Text */}
                            <div className="text-right mb-8">
                              <p className="font-arabic text-2xl md:text-3xl leading-[2] text-emerald-950 font-medium">
                                {event.quranMatch.arabic}
                              </p>
                            </div>

                            {/* Translation */}
                            <div className="relative mb-6">
                              <div className="absolute -left-4 top-0 text-6xl text-emerald-200 opacity-50 font-serif">"</div>
                              <p className="text-xl md:text-2xl font-serif italic text-gray-700 leading-relaxed pl-8">
                                {event.quranMatch.verseText}
                              </p>
                            </div>

                            {/* Reference */}
                            <div className="flex items-center gap-3 pt-4 border-t border-emerald-200">
                              <BookOpen size={16} className="text-emerald-600" />
                              <span className="text-sm font-bold text-emerald-700">
                                {event.quranMatch.surahName} • Verse {event.quranMatch.verse}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
</section>

      {/* 5. SPIRITUAL BENTO - Full width */}
      <section className="w-full px-4 sm:px-6 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 bg-gradient-to-br from-[#0c1428] to-[#1a2b4b] rounded-3xl p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between group h-[400px]">
                <div className="absolute -bottom-10 -right-10 p-8 opacity-5 group-hover:scale-110 group-hover:-translate-x-5 transition-all duration-1000">
                  <BarChart2 size={300}/>
                </div>
                <div className="relative z-10 max-w-md space-y-4">
                   <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md mb-2 border border-white/10">
                      <Zap className="text-amber-400" size={24} fill="currentColor" />
                   </div>
                   <h3 className="text-3xl font-bold font-serif leading-tight">Spiritual <br/> Intelligence</h3>
                   <p className="text-blue-100/60 text-base leading-relaxed">Visualize your soul's journey with data-driven precision. Track habits and Quranic engagement.</p>
                </div>
                <button 
                  onClick={() => handleNavigate('/analytics')}
                  className="relative z-10 mt-8 px-8 py-3.5 bg-white text-[#0c1428] rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 transition-all w-fit shadow-lg"
                >Enter Neural Lab</button>
             </div>
             
             <div className="bg-emerald-600 rounded-3xl p-10 text-white shadow-xl flex flex-col justify-between group h-[400px]">
                <div className="space-y-6">
                   <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform"><Award size={28}/></div>
                   <h3 className="text-3xl font-bold font-serif">Guardian Rank</h3>
                   <p className="text-emerald-100 text-base leading-relaxed opacity-80">You have consistently reflected for 7 days. Your soul level is evolving.</p>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
                      <span>Rank Evolution</span>
                      <span>72% Mastery</span>
                   </div>
                   <div className="h-3 bg-emerald-950/20 rounded-full overflow-hidden p-1 shadow-inner">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: '72%' }} className="h-full bg-emerald-300 rounded-full shadow-[0_0_10px_rgba(110,231,183,0.5)]" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS - Larger Size */}
<section className="w-full px-4 sm:px-6 mt-20 py-24 md:py-32">
  <div className="max-w-7xl mx-auto">
     <div className="text-center mb-20 md:mb-28 space-y-6">
        <h2 className="text-5xl md:text-7xl font-bold text-gray-900 font-serif">The Divine Protocol</h2>
        <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto">Four steps to sync your temporal life with eternal wisdom.</p>
     </div>
     <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 relative">
        <div className="hidden md:block absolute top-[80px] left-[15%] right-[15%] h-0.5 bg-emerald-50 z-0" />
        
        <div className="space-y-8 text-center relative z-10">
           <div className="w-24 h-24 md:w-28 md:h-28 bg-white border-2 border-emerald-600 rounded-full flex items-center justify-center mx-auto text-emerald-600 font-black text-2xl md:text-3xl shadow-lg">01</div>
           <h4 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif">Observe</h4>
           <p className="text-lg md:text-xl text-gray-500">Notice a moment of joy, sadness, or peace in your day.</p>
        </div>
        
        <div className="space-y-8 text-center relative z-10">
           <div className="w-24 h-24 md:w-28 md:h-28 bg-white border-2 border-emerald-600 rounded-full flex items-center justify-center mx-auto text-emerald-600 font-black text-2xl md:text-3xl shadow-lg">02</div>
           <h4 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif">Record</h4>
           <p className="text-lg md:text-xl text-gray-500">Seal that moment in "Echoes" with your honest feelings.</p>
        </div>
        
        <div className="space-y-8 text-center relative z-10">
           <div className="w-24 h-24 md:w-28 md:h-28 bg-white border-2 border-emerald-600 rounded-full flex items-center justify-center mx-auto text-emerald-600 font-black text-2xl md:text-3xl shadow-lg">03</div>
           <h4 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif">Reflect</h4>
           <p className="text-lg md:text-xl text-gray-500">Read the Quranic verse that mirrors your specific state.</p>
        </div>
        
        <div className="space-y-8 text-center relative z-10">
           <div className="w-24 h-24 md:w-28 md:h-28 bg-white border-2 border-emerald-600 rounded-full flex items-center justify-center mx-auto text-emerald-600 font-black text-2xl md:text-3xl shadow-lg">04</div>
           <h4 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif">Evolve</h4>
           <p className="text-lg md:text-xl text-gray-500">Watch your spiritual DNA shift as you gain divine insight.</p>
        </div>
     </div>x
  </div>
</section>

      {/* 7. TESTIMONIALS - Full width */}
      <section className="w-full px-4 sm:px-6 mt-20">
        <div className="max-w-7xl mx-auto py-16 bg-gray-900 rounded-3xl text-white">
           <div className="text-center mb-12 space-y-3 px-6">
              <h2 className="text-4xl font-bold font-serif">Echoes of Impact</h2>
              <p className="text-gray-400 text-sm">Words from the global community of active seekers.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
              {TESTIMONIALS.map((t, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 space-y-6 flex flex-col justify-between">
                   <div className="space-y-4">
                      <Quote className="text-emerald-500" size={24} />
                      <p className="text-lg italic font-serif text-gray-300 leading-relaxed text-left">"{t.content}"</p>
                   </div>
                   <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                      <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center font-black text-white text-[10px]">{t.name[0]}</div>
                      <div className="text-left">
                         <p className="font-bold text-white tracking-widest uppercase text-[10px]">{t.name}</p>
                         <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{t.role}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 8. FINAL CTA - FULL WIDTH EMERALD SECTION WITH FOOTER */}
      <section className="w-full mt-20">
        {/* Full-width Emerald CTA */}
        <div className="w-full bg-emerald-600 py-24 md:py-32 relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[120px] opacity-30" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-emerald-400 rounded-full blur-[100px] opacity-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-700 rounded-full blur-[150px] opacity-20" />
          </div>
          
          {/* CTA Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/20 shadow-sm text-xs font-black uppercase tracking-[0.3em]"
            >
              <Sparkles size={14} className="text-emerald-200" /> Begin Your Journey
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-serif leading-tight px-4"
            >
              Ready to map your <br/> 
              <span className="text-emerald-200">Eternal Story?</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-emerald-100 max-w-xl mx-auto font-light leading-relaxed px-4"
            >
              Join thousands of seekers who have found comfort and guidance by bridging their life with the Words of Allah.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-10 py-5 bg-white text-emerald-700 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-900/30 transition-all flex items-center gap-3 mx-auto hover:bg-emerald-50 hover:scale-105 active:scale-95"
              >
                Create Your First Entry <ArrowRight size={20} />
              </button>
            </motion.div>
          </div>
        </div>
        
      </section>

      {/* ADD CHAPTER MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-[100]"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-[101] shadow-[0_0_100px_rgba(0,0,0,0.2)] p-6 md:p-16 overflow-y-auto"
            >
              <header className="flex justify-between items-start mb-16">
                 <div className="space-y-4">
                    <div className="w-12 h-1 bg-emerald-600" />
                    <h2 className="text-5xl font-bold text-gray-900 font-serif italic h-auto">Record moment</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">Connecting your history to the heavens</p>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-4 hover:bg-gray-100 rounded-2xl transition-all"><X size={32}/></button>
              </header>

              <div className="space-y-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] block">Celestial Title</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Reflections on Surah Ar-Rahman..."
                    className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-gray-100 text-gray-900 p-0"
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  />
                  <div className="h-px w-full bg-gray-100" />
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] block">Emotional Pulse</label>
                  <div className="grid grid-cols-3 gap-4">
                    {EMOTIONS.map(e => (
                      <button 
                        key={e.id}
                        onClick={() => setNewEvent({...newEvent, emotion: e.id})}
                        className={`p-6 md:p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${
                          newEvent.emotion === e.id 
                            ? 'border-emerald-600 bg-emerald-50 shadow-2xl shadow-emerald-100 scale-105' 
                            : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-100'
                        }`}
                      >
                        <span className="text-4xl">{e.icon}</span>
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{e.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] block">Narrative Details</label>
                   <textarea 
                     rows={6}
                     placeholder="How has your soul shifted during this moment? Write freely, for your words are seen..."
                     className="w-full p-8 md:p-10 bg-gray-50 rounded-[3rem] border border-transparent focus:bg-white focus:border-emerald-100 outline-none transition-all resize-none text-xl text-gray-700 leading-relaxed shadow-inner"
                     value={newEvent.description}
                     onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                   />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] block">Physical Location</label>
                  <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-6 py-5 border border-transparent focus-within:bg-white focus-within:border-emerald-100 transition-all shadow-inner">
                    <MapPin className="text-emerald-200" size={24}/>
                    <input 
                      type="text" 
                      placeholder="Where did this echo happen?"
                      className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 font-bold"
                      value={newEvent.location}
                      onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-12">
                  <button 
                    onClick={handleAddEvent}
                    className="w-full bg-emerald-600 text-white py-8 rounded-[2.5rem] text-xl font-black shadow-[0_20px_50px_rgba(5,150,105,0.3)] hover:bg-emerald-700 hover:-translate-y-2 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em]"
                  >
                    Seal Chapter <ChevronRight size={24} />
                  </button>
                  <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.5em] mt-10">Divine verse will be generated upon sealing</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = "Loading...", fullScreen = false }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-3 border-emerald-400 border-t-transparent rounded-full shadow-sm"
      />
      <div className="flex flex-col items-center gap-1">
        <p className="text-gray-600 text-sm font-medium">{message}</p>
        <div className="flex gap-1 mt-1">
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        {spinner}
      </motion.div>
    );
  }

  return spinner;
}

// src/components/Logo.jsx - Minimal version
import React from 'react';

const Logo = ({ className = '', onClick }) => {
  return (
    <div className={`flex items-center gap-2 cursor-pointer ${className}`} onClick={onClick}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 flex items-center justify-center">
        <span className="text-white font-bold text-sm">E</span>
      </div>
      <div>
        <h1 className="text-sm md:text-base font-bold bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">
          Echoes of Jannah
        </h1>
      </div>
    </div>
  );
};

export default Logo;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCompass, FiHeart, FiBookOpen, FiLifeBuoy, FiDroplet, 
  FiBarChart2, FiUsers, FiLogIn, FiLogOut, FiUser, FiMenu, FiX,
  FiStar, FiZap
} from 'react-icons/fi';
import { useQuranAuth } from '../contexts/QuranAuthContext';

const navItems = [
  { id: 'timeline', label: 'Timeline', icon: FiCompass },
  { id: 'mirror', label: 'Mirror', icon: FiHeart },
  { id: 'quran', label: 'Quran', icon: FiBookOpen },
  { id: 'journey', label: 'Journey', icon: FiLifeBuoy },
  { id: 'dna', label: 'DNA', icon: FiDroplet },
  { id: 'analytics', label: 'Metrics', icon: FiBarChart2 },
  { id: 'community', label: 'Circle', icon: FiUsers },
];

export default function Navigation({ currentView, setCurrentView, userData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signIn, signOut, isLoading, isAuthenticated } = useQuranAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`w-full transition-all duration-500 ease-out ${
          scrolled 
            ? 'py-2' 
            : 'py-4'
        }`}
      >
        <div className="w-full px-0">
          <div className={`
             relative flex justify-between items-center transition-all duration-500 px-8 h-24 rounded-none
             ${scrolled 
               ? 'bg-white/90 backdrop-blur-2xl border-b border-gray-100 shadow-lg' 
               : 'bg-white/60 backdrop-blur-lg border-b border-gray-50 shadow-sm'
             }
          `}>
            
            {/* Logo Section */}
            <button 
              onClick={() => setCurrentView('timeline')} 
              className="flex items-center gap-4 group relative cursor-pointer z-10 flex-shrink-0"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                <img 
                  src="/logo.png" 
                  alt="Echoes of Jannah" 
                  className="w-12 h-12 object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-black text-gray-950 tracking-tighter text-2xl leading-none uppercase">
                  Echoes Of Jannah
                </span>
                <span className="text-xs font-black text-emerald-600 tracking-[0.3em] leading-none mt-1 opacity-80 uppercase">Sacred Space</span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center bg-gray-950/[0.03] p-2 rounded-2xl border border-gray-100 gap-1">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`relative px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-[0.15em] transition-all duration-500 flex items-center gap-2.5 group/item
                      ${isActive
                        ? 'text-emerald-950' 
                        : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute inset-0 bg-white shadow-lg shadow-black/5 rounded-xl z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon size={16} className={`relative z-10 transition-colors duration-500 ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover/item:text-emerald-500'}`} />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4 z-10 flex-shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden sm:flex items-center gap-4 px-5 py-2.5 bg-white/60 rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-950 leading-none">{user?.name?.split(' ')[0] || 'Soul'}</p>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 flex items-center justify-end gap-1">
                        <FiStar className="fill-emerald-600" size={10} /> Lv.{userData?.level || 1}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-900 to-emerald-950 flex items-center justify-center shadow-lg">
                      <FiUser size={20} className="text-white" />
                    </div>
                  </motion.div>
                  <button
                    onClick={signOut}
                    className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-500 flex items-center justify-center shadow-sm active:scale-90"
                    title="Sign Out"
                  >
                    <FiLogOut size={22} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={signIn}
                  disabled={isLoading}
                  className="px-10 py-4 bg-emerald-950 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-emerald-800 shadow-2xl shadow-emerald-950/20 active:scale-95 transition-all duration-500"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><FiZap size={18} className="text-amber-400" /> Unlock Portal</>
                  )}
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-500"
              >
                {mobileMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden w-full bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 space-y-2">
                {isAuthenticated && (
                  <div className="p-5 bg-emerald-50 rounded-2xl flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-xl bg-emerald-950 flex items-center justify-center shadow-lg">
                      <FiUser size={22} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-gray-900">{user?.name || 'Soul Traveler'}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600 mt-1">Manifesting LV.{userData?.level || 1}</p>
                    </div>
                  </div>
                )}

                {navItems.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full p-5 rounded-2xl text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-4 transition-all
                        ${isActive
                          ? 'bg-emerald-950 text-white shadow-xl' 
                          : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                    >
                      <item.icon size={20} className={isActive ? 'text-emerald-400' : ''} />
                      <span>{item.label}</span>
                      {isActive && <div className="ml-auto w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />}
                    </button>
                  );
                })}
                
                {!isAuthenticated && (
                  <button
                    onClick={signIn}
                    className="w-full mt-4 p-6 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                  >
                    <FiLogIn size={18} /> Access Portal
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCompass, FiHeart, FiBookOpen, FiLifeBuoy, FiDroplet, 
  FiBarChart2, FiUsers, FiLogIn, FiLogOut, FiUser, FiMenu, FiX,
  FiStar, FiZap, FiBox, FiActivity
} from 'react-icons/fi';
import { useQuranAuth } from '../contexts/QuranAuthContext';

const navItems = [
  { id: 'timeline', label: 'Timeline', icon: FiCompass },
  { id: 'mirror', label: 'Mirror', icon: FiHeart },
  { id: 'quran', label: 'Quran', icon: FiBookOpen },
  { id: 'journey', label: 'Journey', icon: FiLifeBuoy },
  { id: 'dna', label: 'DNA', icon: FiDroplet },
  { id: 'analytics', label: 'Metrics', icon: FiBarChart2 },
  { id: 'community', label: 'Circle', icon: FiUsers },
];

export default function Navigation({ currentView, setCurrentView, userData }: any) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { user, signIn, signOut, isLoading, isAuthenticated } = useQuranAuth() as any;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
      
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollY / height) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-out ${
          scrolled 
            ? 'py-3' 
            : 'py-6'
        }`}
      >
        {/* Scroll Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-50/20 z-[110]">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`
             relative flex justify-between items-center transition-all duration-500 px-6 h-20 rounded-[2.5rem]
             ${scrolled 
               ? 'bg-white/70 backdrop-blur-2xl border border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]' 
               : 'bg-white/40 backdrop-blur-lg border border-white/40 shadow-sm'
             }
          `}>
            
            {/* Logo Section */}
            <button 
              onClick={() => setCurrentView('timeline')} 
              className="flex items-center gap-4 group relative cursor-pointer z-10"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-[1.25rem] bg-emerald-950 flex items-center justify-center shadow-2xl shadow-emerald-950/20 group-hover:rotate-12 transition-all duration-500 relative z-10">
                  <FiActivity className="text-white animate-pulse" size={20} />
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-black text-gray-950 tracking-tighter text-xl leading-none uppercase">
                  Echoes
                </span>
                <span className="text-[10px] font-black text-emerald-600 tracking-[0.3em] leading-none mt-1 opacity-80 uppercase">Sacred Space</span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center bg-gray-950/5 p-1.5 rounded-[1.5rem] border border-white/20 backdrop-blur-sm gap-1">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`relative px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 flex items-center gap-2 group/item
                      ${isActive
                        ? 'text-emerald-950' 
                        : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute inset-0 bg-white shadow-lg shadow-black/5 rounded-2xl z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon size={14} className={`relative z-10 transition-colors duration-500 ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover/item:text-emerald-500'}`} />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4 z-10">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden sm:flex items-center gap-4 px-4 py-2 bg-white/60 rounded-2xl border border-white/40 shadow-sm"
                  >
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-950 leading-none">{user?.name?.split(' ')[0] || 'Soul'}</p>
                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1.5 flex items-center justify-end gap-1">
                        <FiStar className="fill-emerald-600" size={8} /> Lv.{userData?.level || 1}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-900 to-emerald-950 flex items-center justify-center shadow-lg">
                      <FiUser size={18} className="text-white" />
                    </div>
                  </motion.div>
                  <button
                    onClick={signOut}
                    className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-500 flex items-center justify-center shadow-sm active:scale-90"
                    title="Sign Out"
                  >
                    <FiLogOut size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={signIn}
                  disabled={isLoading}
                  className="px-8 py-3.5 bg-emerald-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-emerald-800 shadow-2xl shadow-emerald-950/20 active:scale-95 transition-all duration-500"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><FiZap size={16} className="text-amber-400" /> Unlock Portal</>
                  )}
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-500"
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden mx-4 mt-2 p-4 bg-white/95 backdrop-blur-2xl rounded-3xl border border-gray-100 shadow-2xl space-y-2 overflow-hidden"
            >
              {isAuthenticated && (
                <div className="p-4 bg-emerald-50 rounded-2xl flex items-center gap-4 mb-2">
                  <div className="w-11 h-11 rounded-xl bg-emerald-950 flex items-center justify-center shadow-lg">
                    <FiUser size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">{user?.name || 'Soul Traveler'}</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-600 mt-1">Manifesting LV.{userData?.level || 1}</p>
                  </div>
                </div>
              )}

              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 transition-all
                      ${isActive
                        ? 'bg-emerald-950 text-white shadow-xl' 
                        : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                  >
                    <item.icon size={18} className={isActive ? 'text-emerald-400' : ''} />
                    <span>{item.label}</span>
                    {isActive && <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                  </button>
                );
              })}
              
              {!isAuthenticated && (
                <button
                  onClick={signIn}
                  className="w-full mt-4 p-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                >
                  <FiLogIn size={16} /> Access Portal
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {/* Spacer to prevent content overlap - smaller for fixed standard header */}
      <div className={`transition-all duration-500 ${scrolled ? 'h-24' : 'h-28'}`} />
    </>
  );
}


import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, requireAuth = true }) {
  const { userId, loading } = useUser();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center z-50"
      >
        <div className="text-center">
          <div className="relative">
            {/* Animated rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 border-2 border-emerald-200 rounded-full animate-ping opacity-75"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-teal-200 rounded-full animate-pulse opacity-50"></div>
            </div>
            <LoadingSpinner fullScreen={false} message="Verifying your spiritual journey..." />
          </div>
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="flex gap-1">
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
            </div>
            <p className="text-gray-500 text-sm font-medium">Loading your sacred space...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (requireAuth && !userId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 bg-white flex items-center justify-center z-50"
      >
        <div className="text-center max-w-md mx-auto px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center">
              <span className="text-4xl">📜</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">
              Please sign in to continue your spiritual journey
            </p>
          </motion.div>
          <Navigate to="/" replace />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// src/components/QuranBrowser.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiChevronLeft, FiBookmark, 
  FiShare2, FiInfo, FiX, FiLoader, FiPlay, FiPause,
  FiCopy, FiSettings, FiBookOpen, FiMessageSquare, FiBook,
  FiMaximize2
} from 'react-icons/fi';
import { quranApi } from '../api/quranApi';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

const reciters = [
  { id: 'ar.alafasy', name: 'Mishary Alafasy', baseUrl: 'https://everyayah.com/data/Alafasy_128kbps/' },
  { id: 'ar.hudhaify', name: 'Ali Hudhaify', baseUrl: 'https://everyayah.com/data/Hudhaify_64kbps/' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdurrahman Sudais', baseUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/' },
  { id: 'ar.mahermuaiqly', name: 'Maher Al-Muaiqly', baseUrl: 'https://everyayah.com/data/MaherAlMuaiqly128kbps/' },
];

const translations = [
  { id: 'en.sahih', name: 'Sahih International' },
  { id: 'en.arberry', name: 'Arberry' },
  { id: 'en.yusufali', name: 'Yusuf Ali' },
  { id: 'en.pickthall', name: 'Pickthall' },
  { id: 'en.hilali', name: 'Hilali & Khan' },
  { id: 'en.asad', name: 'Muhammad Asad' },
  { id: 'ur.jalandhry', name: 'Urdu (Jalandhry)' },
];

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

export default function QuranBrowser() {
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [versesLoading, setLoadingVerses] = useState(false);
  const [reciter, setReciter] = useState(reciters[0]);
  const [translation, setTranslation] = useState(translations[0]);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null);
  const [isFullSurahPlaying, setIsFullSurahPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [currentFullSurahIndex, setCurrentFullSurahIndex] = useState(0);
  const [reflections, setReflections] = useState(() => {
    const saved = localStorage.getItem('quran_reflections');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeReflectionVerse, setActiveReflectionVerse] = useState(null);
  const [showSurahInfo, setShowSurahInfo] = useState(false);
  const [viewMode, setViewMode] = useState('comfortable');
  
  const { addBookmark, addXP } = useUser();

  useEffect(() => {
    localStorage.setItem('quran_reflections', JSON.stringify(reflections));
  }, [reflections]);

  useEffect(() => {
    const fetchSurahs = async () => {
      const res = await quranApi.getAllSurahs();
      if (res.success) setSurahs(res.data);
      setLoading(false);
    };
    fetchSurahs();
  }, []);

  const handleSurahSelect = async (num, transId) => {
    setLoadingVerses(true);
    const useTransId = transId || translation.id;
    const res = await quranApi.getSurah(num, useTransId);
    if (res.success) {
      let data = res.data;
      if (num !== 9) {
        if (num === 1) {
          data.hasBismillah = false; 
        } else {
          const bismillahWithSpace = BISMILLAH + " ";
          if (data.verses[0].arabic.startsWith(bismillahWithSpace)) {
            data.verses[0].arabic = data.verses[0].arabic.substring(bismillahWithSpace.length).trim();
            data.hasBismillah = true;
          } else if (data.verses[0].arabic.startsWith(BISMILLAH)) {
            data.verses[0].arabic = data.verses[0].arabic.substring(BISMILLAH.length).trim();
            data.hasBismillah = true;
          } else {
            data.hasBismillah = true;
          }
        }
      } else {
        data.hasBismillah = false;
      }
      setSelectedSurah(data);
    }
    setLoadingVerses(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleTranslationChange = (newTrans) => {
    setTranslation(newTrans);
    if (selectedSurah) {
      handleSurahSelect(selectedSurah.number, newTrans.id);
    }
  };

  const stopAudio = () => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.src = '';
    }
    setPlayingAudio(null);
    setIsFullSurahPlaying(false);
    isPlayingRef.current = false;
  };

  const playVerse = (surahNum, verseNum, onEnded) => {
    const sStr = String(surahNum).padStart(3, '0');
    const vStr = String(verseNum).padStart(3, '0');
    const url = `${reciter.baseUrl}${sStr}${vStr}.mp3`;
    const key = `${surahNum}:${verseNum}`;

    if (playingAudio === key && audioInstance && !isPlayingRef.current) {
      stopAudio();
      return;
    }

    if (audioInstance) {
      audioInstance.pause();
      audioInstance.onended = null;
    }

    const audio = new Audio(url);
    audio.onended = () => {
      setPlayingAudio(null);
      if (onEnded) onEnded();
    };
    audio.onerror = () => {
      setPlayingAudio(null);
      if (onEnded) onEnded();
    };
    audio.play().catch(() => {});
    setAudioInstance(audio);
    setPlayingAudio(key);
    addXP(1);
  };

  const playFullSurah = () => {
    if (isPlayingRef.current) {
      stopAudio();
      return;
    }
    
    isPlayingRef.current = true;
    setIsFullSurahPlaying(true);
    setCurrentFullSurahIndex(0);
    playSequential(0);
  };

  const playSequential = (idx) => {
    if (!selectedSurah || idx >= selectedSurah.verses.length || !isPlayingRef.current) {
      setIsFullSurahPlaying(false);
      isPlayingRef.current = false;
      return;
    }
    
    setCurrentFullSurahIndex(idx);
    
    const verseElement = document.getElementById(`verse-${selectedSurah.verses[idx].number}`);
    if (verseElement) {
      verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    playVerse(selectedSurah.number, selectedSurah.verses[idx].number, () => {
      const pauseDuration = 800 + Math.random() * 400;
      setTimeout(() => {
        if (isPlayingRef.current) {
          playSequential(idx + 1);
        }
      }, pauseDuration);
    });
  };

  const handleSaveReflection = (verseNum, text) => {
    if (!text.trim()) {
      toast.error('Reflection cannot be empty');
      return;
    }
    const key = `${selectedSurah.number}:${verseNum}`;
    setReflections(prev => ({ ...prev, [key]: text }));
    setActiveReflectionVerse(null);
    toast.success('Reflection saved to your spiritual journal');
  };

  const copyVerse = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Verse copied to clipboard');
  };

  const filteredSurahs = surahs.filter(s => 
    s.englishName.toLowerCase().includes(search.toLowerCase()) || 
    s.number.toString().includes(search)
  );

  if (loading) return <div className="pt-32 flex justify-center"><FiLoader className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-12">
        {!selectedSurah ? (
          <div className="space-y-12">
            {/* Hero Section - ORIGINAL SIZE */}
            <div className="text-center space-y-8 pt-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100/50 text-[9px] font-black uppercase tracking-[0.3em] shadow-sm mb-2"
              >
                <FiBook size={12} className="text-emerald-500" /> Divine Revelation
              </motion.div>
              
              <div className="relative">
                <h2 className="text-7xl md:text-8xl font-bold tracking-tighter leading-none text-gray-900 font-serif">
                  Holy <span className="text-emerald-600 italic">Quran</span>
                </h2>
                <div className="h-1 w-32 bg-emerald-100/50 mx-auto mt-2 rounded-full" />
              </div>
              
              <p className="text-gray-400 max-w-xl mx-auto font-light leading-relaxed text-base">
                Explore the sacred verses that resonate through the ages. <br className="hidden md:block" /> Divine guidance for humanity's spiritual journey.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                <button 
                  onClick={() => {
                    const firstSurah = surahs[0];
                    if (firstSurah) handleSurahSelect(firstSurah.number);
                  }}
                  className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                >
                  Start Reading <FiBookOpen size={18} className="group-hover:rotate-12 transition-transform" />
                </button>
                <div className="relative group w-full max-w-xs">
                  <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-600 transition-colors" size={20} />
                  <input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search Surah..."
                    className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl border-none shadow-[0_10px_30px_rgba(0,0,0,0.03)] focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm placeholder:text-gray-200 font-serif"
                  />
                </div>
              </div>
            </div>

            {/* Surah Cards Grid - ORIGINAL SIZE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSurahs.map((s, idx) => (
                <motion.div
                  key={s.number}
                  data-surah-index={s.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => handleSurahSelect(s.number)}
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] hover:border-emerald-100 cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-serif text-xl border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-500">
                      {s.number}
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-gray-900 group-hover:text-emerald-950 transition-colors">{s.englishName}</h3>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] group-hover:text-emerald-500/50 transition-colors">{s.revelationType} • {s.versesCount} Verses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-arabic text-emerald-900/80 group-hover:text-emerald-600 transition-colors">{s.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Controls Bar */}
            <div className="flex flex-wrap justify-between items-center gap-4 sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm py-3 -mx-4 px-4 border-b border-gray-100">
              <button 
                onClick={() => { stopAudio(); setSelectedSurah(null); }}
                className="flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all"
              >
                <FiChevronLeft size={20} /> Browse Surahs
              </button>
              <div className="flex flex-wrap items-center gap-3">
                <select 
                  value={translation.id}
                  onChange={e => handleTranslationChange(translations.find(t => t.id === e.target.value))}
                  className="bg-gray-100 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl outline-none border-none"
                >
                  {translations.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select 
                  value={reciter.id}
                  onChange={e => setReciter(reciters.find(r => r.id === e.target.value))}
                  className="bg-emerald-50 text-emerald-700 font-bold text-xs px-4 py-2 rounded-xl outline-none border-none"
                >
                  {reciters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button 
                  onClick={() => setShowSurahInfo(!showSurahInfo)}
                  className={`p-2.5 rounded-xl transition-all ${showSurahInfo ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  title="Surah Details"
                >
                  <FiInfo size={18}/>
                </button>
                <button 
                  onClick={() => setViewMode(viewMode === 'comfortable' ? 'compact' : 'comfortable')}
                  className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                  title="Toggle View Mode"
                >
                  {viewMode === 'comfortable' ? <FiMaximize2 size={18}/> : <FiSettings size={18}/>}
                </button>
                <button 
                  onClick={playFullSurah}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${isFullSurahPlaying ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'}`}
                >
                  {isFullSurahPlaying ? <FiPause /> : <FiPlay />} 
                  {isFullSurahPlaying ? 'Playing Surah' : 'Play Full Surah'}
                </button>
              </div>
            </div>

            {/* Surah Header Card - ORIGINAL SIZE */}
            <div className="bg-emerald-950 rounded-[3.5rem] p-16 text-white relative overflow-hidden shadow-[0_50px_100px_rgba(6,78,59,0.2)] min-h-[420px] flex items-center justify-center group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.05)_0%,transparent_70%)] opacity-50" />
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none -rotate-12 translate-x-20 -translate-y-20 transition-transform group-hover:scale-110 duration-1000">
                <FiBookOpen size={600} />
              </div>
              
              <div className="relative z-10 text-center space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-5 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 backdrop-blur-md"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-emerald-400 font-black uppercase tracking-[0.5em] text-[8px] md:text-[9px]">
                    The Enlightened Revelation • Surah {selectedSurah.number}
                  </p>
                </motion.div>

                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-7xl md:text-8xl font-serif italic font-bold tracking-tighter leading-none"
                >
                  {selectedSurah.englishName}
                </motion.h2>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-arabic text-emerald-100/90 leading-relaxed"
                >
                  {selectedSurah.name}
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center items-center gap-10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/40"
                >
                   <div className="flex flex-col items-center gap-3 group/stat">
                     <span className="h-[1px] w-6 bg-emerald-500/20 group-hover/stat:w-10 transition-all duration-500" />
                     <span>{selectedSurah.revelationType}</span>
                   </div>
                   <div className="flex flex-col items-center gap-3 group/stat">
                     <span className="h-[1px] w-6 bg-emerald-500/20 group-hover/stat:w-10 transition-all duration-500" />
                     <span>{selectedSurah.versesCount} Verses</span>
                   </div>
                </motion.div>
              </div>
            </div>

            {/* Surah Info Section */}
            <AnimatePresence>
              {showSurahInfo && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: 30 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 30 }}
                  className="overflow-hidden"
                >
                  <div className="pt-12 pb-16 space-y-12">
                    <div className="flex justify-between items-end border-b border-gray-50 pb-8 px-4">
                      <div className="space-y-2">
                        <h3 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">About {selectedSurah.englishName}</h3>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em] leading-none">Deep Insight & Context</p>
                      </div>
                      <button 
                        onClick={() => setShowSurahInfo(false)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-red-500 hover:bg-red-50 transition-all font-bold text-[10px] uppercase tracking-widest border border-transparent shadow-sm hover:shadow-md"
                      >
                        <FiX size={16}/> Close Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                      {[
                        { title: 'Revelation', icon: FiInfo, colorClass: 'bg-emerald-600', textClass: 'text-emerald-900', bgClass: 'bg-emerald-50/50', borderClass: 'border-emerald-100/50', content: `Revealed in ${selectedSurah.revelationType}, this is chapter #${selectedSurah.number}.` },
                        { title: 'Context', icon: FiBookOpen, colorClass: 'bg-blue-600', textClass: 'text-blue-900', bgClass: 'bg-blue-50/50', borderClass: 'border-blue-100/50', content: "Revealed at a pivotal junction, offering spiritual blueprints for believers." },
                        { title: 'Description', icon: FiBook, colorClass: 'bg-amber-600', textClass: 'text-amber-900', bgClass: 'bg-amber-50/50', borderClass: 'border-amber-100/50', content: "Establishing the moral compass and the relationship between Creator and created." },
                        { title: 'Wisdom', icon: FiShare2, colorClass: 'bg-purple-600', textClass: 'text-purple-900', bgClass: 'bg-purple-50/50', borderClass: 'border-purple-100/50', content: `Nurturing Taqwa through every verse of ${selectedSurah.englishName}.` }
                      ].map((item, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className={`p-8 ${item.bgClass} rounded-[2.5rem] border ${item.borderClass} space-y-4 hover:shadow-xl hover:shadow-black/5 transition-all group relative overflow-hidden`}
                        >
                          <div className={`${item.colorClass} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                            <item.icon size={20}/>
                          </div>
                          <div className="space-y-2">
                            <p className={`font-bold ${item.textClass} text-lg`}>{item.title}</p>
                            <p className="text-gray-500 leading-relaxed text-xs font-medium">{item.content}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verses Section */}
            {versesLoading ? (
              <div className="py-32 flex justify-center"><FiLoader className="animate-spin text-emerald-500" size={40} /></div>
            ) : (
              <div className="space-y-12">
                {/* Bismillah */}
                {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     className="text-center py-24"
                   >
                     <p className="text-6xl md:text-7xl font-arabic text-emerald-950 font-light tracking-widest leading-loose">
                       بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                     </p>
                     <div className="flex justify-center gap-2 mt-12 opacity-20">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                       <div className="w-12 h-[1px] bg-emerald-500 my-auto" />
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                     </div>
                   </motion.div>
                )}
                
                {selectedSurah.verses.map((v, idx) => {
                  const reflexKey = `${selectedSurah.number}:${v.number}`;
                  const hasReflection = !!reflections[reflexKey];
                  const isPlaying = playingAudio === `${selectedSurah.number}:${v.number}`;

                  return (
                      <motion.div 
                        key={v.number}
                        id={`verse-${v.number}`}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx % 5 * 0.1 }}
                        className={`bg-white rounded-[3rem] border transition-all relative overflow-hidden ${isPlaying ? 'border-emerald-500 shadow-2xl ring-4 ring-emerald-500/5' : 'border-gray-50 shadow-[0_15px_60px_rgba(0,0,0,0.03)]'} ${viewMode === 'compact' ? 'p-6' : 'p-10 md:p-14'} group hover:border-emerald-200`}
                      >
                        {isPlaying && (
                          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse" />
                        )}
                        
                        <div className="flex justify-between items-start mb-8 md:mb-16">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all border ${isPlaying ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>{v.number}</div>
                            <button 
                              onClick={() => playVerse(selectedSurah.number, v.number)}
                              className={`p-4 rounded-2xl transition-all shadow-sm ${isPlaying ? 'bg-emerald-600 text-white animate-pulse' : 'bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100/50'}`}
                            >
                              {isPlaying ? <FiPause size={20}/> : <FiPlay size={20} className="translate-x-0.5" />}
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setActiveReflectionVerse(activeReflectionVerse === v.number ? null : v.number)} 
                              className={`p-4 rounded-2xl transition-all border ${hasReflection ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-white text-gray-400 border-gray-100 hover:border-amber-200 hover:text-amber-600'}`}
                              title={hasReflection ? "Edit Reflection" : "Add Reflection"}
                            >
                              <FiMessageSquare size={20}/>
                            </button>
                            <button onClick={() => addBookmark({...v, surahName: selectedSurah.englishName})} className="p-4 bg-white text-gray-400 rounded-2xl border border-gray-100 hover:border-red-100 hover:text-red-500 transition-all" title="Bookmark"><FiBookmark size={20}/></button>
                            <button onClick={() => copyVerse(v.arabic)} className="p-4 bg-white text-gray-400 rounded-2xl border border-gray-100 hover:border-emerald-100 hover:text-emerald-600 transition-all" title="Copy Verse"><FiCopy size={20}/></button>
                          </div>
                        </div>

                        <div className={viewMode === 'compact' ? 'space-y-4' : 'space-y-12'}>
                          <p className="text-right font-arabic text-3xl md:text-4xl leading-[2] text-gray-900 selection:bg-emerald-100">
                            {v.arabic}
                          </p>
                          <div className="space-y-6 max-w-4xl">
                            <div className="h-1 w-16 bg-emerald-100/50 rounded-full" />
                            <p className="text-lg md:text-xl font-serif text-gray-500 leading-relaxed italic font-light selection:bg-emerald-100">"{v.translation}"</p>
                          </div>

                          <AnimatePresence>
                            {(activeReflectionVerse === v.number || hasReflection) && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-12 space-y-4">
                                  {(activeReflectionVerse === v.number || hasReflection) && (
                                    <motion.div 
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className="p-8 bg-amber-50/40 rounded-[2.5rem] border border-amber-100 space-y-6"
                                    >
                                      <div className="flex items-center gap-2">
                                        <FiMessageSquare className="text-amber-600" />
                                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Your Spiritual Dialogue</span>
                                      </div>
                                      
                                      {activeReflectionVerse === v.number ? (
                                        <div className="space-y-4">
                                          <textarea 
                                            className="w-full h-40 p-6 bg-white rounded-3xl border-none shadow-inner focus:ring-4 focus:ring-amber-500/10 font-serif text-lg text-gray-700 italic placeholder:text-gray-300 resize-none"
                                            placeholder="How does this verse speak to your current state?"
                                            defaultValue={reflections[reflexKey] || ''}
                                            id={`reflect-input-${v.number}`}
                                          />
                                          <div className="flex justify-end gap-3 px-2">
                                            <button 
                                              onClick={() => setActiveReflectionVerse(null)}
                                              className="px-6 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                            >
                                              Discard
                                            </button>
                                            <button 
                                              onClick={() => {
                                                const el = document.getElementById(`reflect-input-${v.number}`);
                                                handleSaveReflection(v.number, el.value);
                                              }}
                                              className="px-8 py-3 bg-amber-500 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all"
                                            >
                                              Save to Soul
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex justify-between items-start">
                                          <div className="space-y-3">
                                            <p className="text-gray-700 font-serif italic text-xl leading-relaxed">"{reflections[reflexKey]}"</p>
                                          </div>
                                          <div className="flex gap-3">
                                            <button onClick={() => setActiveReflectionVerse(v.number)} className="p-3 bg-white text-amber-600 hover:bg-amber-100 rounded-xl border border-amber-100 transition-all font-bold text-xs uppercase tracking-widest">Edit</button>
                                            <button 
                                              onClick={() => {
                                                const key = `${selectedSurah.number}:${v.number}`;
                                                const newReflections = { ...reflections };
                                                delete newReflections[key];
                                                setReflections(newReflections);
                                                toast.success('Reflection detached');
                                              }} 
                                              className="p-3 bg-white text-red-400 hover:bg-red-50 rounded-xl border border-red-50 transition-all font-bold text-xs"
                                            >
                                              <FiX/>
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// =====================================================================
// QuranLifeCompanion.jsx — Beyond Ramadan
// Single-file React component. Drop into any React project.
// =====================================================================

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft, FiBookmark, FiShare2, FiChevronLeft, FiChevronRight,
  FiRefreshCw, FiEdit2, FiTrash2, FiCheck, FiBookOpen, FiSearch,
  FiPlay, FiPause, FiLoader, FiSun, FiX, FiLifeBuoy, FiHeart
} from "react-icons/fi";

// ---------- DATA ----------

const RICH_DEFAULT_VERSES = [
  { surah: 2, verse: 286, arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", translation: "Allah does not burden a soul beyond its capacity.", reflection: "Whatever you face is divinely calibrated to your strength. Your capacity is greater than you currently believe." },
  { surah: 94, verse: 5, arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "For indeed, with hardship comes ease.", reflection: "Ease is not after hardship, it is paired with it. Look for the pockets of mercy hidden inside the difficulty itself." },
  { surah: 94, verse: 6, arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship comes ease.", reflection: "The promise is repeated for emphasis. Allah is reassuring you twice that relief is on its way." },
  { surah: 65, verse: 3, arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "Whoever relies upon Allah, He is sufficient for them.", reflection: "Tawakkul is not passivity, it is action accompanied by complete trust that Allah will handle the outcome." },
];

const RICH_DEFAULT_DUAS = [
  { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", translation: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire", source: "Quran 2:201" },
  { arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", translation: "O Allah, help me remember You, thank You, and worship You well", source: "Sunan Abu Dawud" },
  { arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", translation: "Allah is sufficient for us, and He is the best disposer of affairs", source: "Quran 3:173" },
];

const generateAllSituations = () => {
  const situations = [];

  const add = (category, title, keywords, verseData, duaData, note, tips) => {
    situations.push({
      id: situations.length + 1,
      category,
      title,
      keywords,
      verses: verseData,
      duas: duaData,
      note,
      tips,
    });
  };

  // ===== EMOTIONAL HEALTH =====
  add('Emotional Health', 'Overwhelming Anxiety',
    ['anxiety', 'panic', 'worry', 'stress'],
    [
      { surah: 13, verse: 28, arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", translation: "Verily, in the remembrance of Allah do hearts find rest.", reflection: "Dhikr rewires your neural pathways away from anxiety. Each sincere repetition brings measurable calm to your nervous system." },
      { surah: 94, verse: 5, arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "For indeed, with hardship comes ease.", reflection: "Allah pairs every difficulty with relief. This is a divine guarantee written into existence itself." },
      { surah: 94, verse: 6, arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship comes ease.", reflection: "The repetition is deliberate, doubling the certainty that ease is woven into the fabric of your hardship." },
      { surah: 2, verse: 286, arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", translation: "Allah does not burden a soul beyond its capacity.", reflection: "You possess strength greater than your current challenge. Allah knows your true capacity." },
    ],
    [
      { arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ", translation: "O Allah, I seek refuge in You from anxiety and sorrow", source: "Sahih Bukhari" },
      { arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ", translation: "O Ever-Living, O Sustainer, in Your mercy I seek relief", source: "Sunan At-Tirmidhi" },
    ],
    "Anxiety is not a weakness of faith. The prophets themselves experienced intense fear. Prophet Muhammad taught practical coping: change your physical position, perform wudu with cool water, pray two rakahs, and maintain the morning and evening adhkar.",
    ["Practice 5-4-3-2-1 grounding with dhikr", "Recite Surah Al-Fatiha seven times slowly", "Keep a worry journal with duas", "Establish a morning adhkar routine", "Perform two rakahs of nafl when panic rises"]
  );

  add('Emotional Health', 'Deep Sadness and Depression',
    ['sadness', 'depression', 'grief', 'sorrow'],
    [
      { surah: 12, verse: 86, arabic: "إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ", translation: "I only complain of my suffering and grief to Allah.", reflection: "Prophet Yaqub shows us to direct our deepest pain sincerely to Allah rather than suppressing it." },
      { surah: 94, verse: 6, arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship comes ease.", reflection: "The repetition emphasizes certainty. Ease is inherently paired with every difficulty." },
      { surah: 93, verse: 3, arabic: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ", translation: "Your Lord has not forsaken you, nor detested you.", reflection: "Depression lies about your worth. Allah's words directly counter those destructive thoughts." },
    ],
    [
      { arabic: "اللَّهُمَّ إِنِّي عَبْدُكَ وَابْنُ عَبْدِكَ", translation: "O Allah, I am Your servant, son of Your servant", source: "Musnad Ahmad" },
      { arabic: "اللَّهُمَّ اجْعَلِ الْقُرْآنَ رَبِيعَ قَلْبِي وَنُورَ صَدْرِي", translation: "O Allah, make the Quran the spring of my heart and the light of my chest", source: "Musnad Ahmad" },
    ],
    "Depression is real and acknowledged in our tradition. Prophet Yaqub wept until his eyes became white yet maintained hope. Clinical depression requires both spiritual and professional care.",
    ["Recite Surah Al-Duha daily for comfort", "Seek professional therapy alongside spiritual practices", "Join a supportive Muslim community", "Practice micro-gratitude each day", "Spend ten minutes outdoors in sunlight reciting dhikr"]
  );

  add('Emotional Health', 'Profound Loneliness',
    ['lonely', 'alone', 'isolated', 'abandoned'],
    [
      { surah: 20, verse: 46, arabic: "لَا تَخَافَا إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَى", translation: "Fear not. I am with you both, hearing and seeing.", reflection: "Divine companionship is perfect. Allah hears what you cannot voice and sees what you hide." },
      { surah: 50, verse: 16, arabic: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ", translation: "We are closer to him than his jugular vein.", reflection: "The distance between you and Allah is less than between your heart and brain." },
    ],
    [
      { arabic: "يَا أَنِيسَ كُلِّ وَحِيدٍ", translation: "O Companion of every lonely one", source: "Traditional Dua" },
      { arabic: "اللَّهُمَّ آنِسْ وَحْشَتِي", translation: "O Allah, comfort my loneliness", source: "Traditional Dua" },
    ],
    "Loneliness often serves as an invitation to deeper intimacy with Allah. The Prophet experienced profound isolation in the cave of Hira, yet it became the birthplace of revelation.",
    ["Schedule daily Quran time as your appointment with Allah", "Start a Quran reflection journal", "Join virtual Islamic study circles", "Volunteer at your local masjid to build connections", "Pray tahajjud and speak to Allah out loud"]
  );

  add('Emotional Health', 'Uncontrollable Anger',
    ['anger', 'furious', 'rage', 'frustrated'],
    [
      { surah: 3, verse: 134, arabic: "وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ", translation: "Those who restrain anger and pardon people.", reflection: "Restraining anger is a defining characteristic of those whom Allah loves." },
      { surah: 42, verse: 37, arabic: "وَإِذَا مَا غَضِبُوا هُمْ يَغْفِرُونَ", translation: "When they are angry, they forgive.", reflection: "Forgiveness during anger represents the highest expression of self-mastery." },
    ],
    [
      { arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ", translation: "I seek refuge in Allah from Satan, the accursed", source: "Sahih Bukhari" },
      { arabic: "اللَّهُمَّ أَذْهِبْ غَيْظَ قَلْبِي", translation: "O Allah, remove the anger from my heart", source: "Musnad Ahmad" },
    ],
    "The Prophet said: The strong person is not one who overpowers others; the strong person controls himself when angry.",
    ["Say the refuge invocation immediately", "Change your physical posture: sit, then lie down", "Perform wudu with cool water", "Practice the ten-second rule before responding", "Remove yourself physically from the situation"]
  );

  // ===== SPIRITUAL GROWTH =====
  add('Spiritual Growth', 'Maintaining Faith After Ramadan',
    ['ramadan', 'spiritual dip', 'consistency'],
    [
      { surah: 2, verse: 185, arabic: "شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ", translation: "The month of Ramadan in which the Quran was revealed.", reflection: "The Lord of Ramadan is the same Lord of Shawwal. Your connection continues." },
      { surah: 41, verse: 30, arabic: "إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا", translation: "Those who say Our Lord is Allah and remain steadfast.", reflection: "Steadfastness after Ramadan is the real measure of spiritual growth." },
    ],
    [
      { arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ", translation: "O Turner of hearts, make my heart firm upon Your religion", source: "Sunan At-Tirmidhi" },
      { arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", translation: "O Allah, help me remember You, thank You, and worship You well", source: "Sunan Abu Dawud" },
    ],
    "The post-Ramadan spiritual dip is well-documented. The companions spent six months asking Allah to accept their Ramadan, and six months asking to reach the next.",
    ["Maintain one Ramadan habit year-round", "Fast six days of Shawwal and Mondays/Thursdays", "Keep daily Quran connection", "Join a weekly Islamic study circle"]
  );

  add('Spiritual Growth', 'Struggling with Prayer Consistency',
    ['prayer', 'salah', 'missing prayer', 'distracted'],
    [
      { surah: 29, verse: 45, arabic: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ", translation: "Indeed, prayer prohibits immorality and wrongdoing.", reflection: "Prayer is your divine protection system from harmful behavior." },
      { surah: 2, verse: 45, arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", translation: "Seek help through patience and prayer.", reflection: "When life is hard, prayer is your solution, not an additional burden." },
    ],
    [
      { arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي", translation: "My Lord, make me an establisher of prayer, and my descendants too", source: "Quran 14:40" },
    ],
    "Struggling with prayer does not make you a bad Muslim, it makes you human. Shift from seeing prayer as something you have to do to something you get to do.",
    ["Focus on one prayer at a time", "Use prayer tracking apps", "Create a dedicated prayer space", "Find an accountability partner"]
  );

  // Generate remaining situations programmatically
  const categories = {
    'Relationships': [
      'Finding a Righteous Spouse', 'Marriage Communication Issues', 'Rebuilding Broken Trust',
      'In-Law Relationship Conflicts', 'Toxic Relationship Patterns', 'Long-Distance Struggles',
      'Friendship Breakups', 'Betrayal by Close Friend', 'Setting Healthy Boundaries',
      'Sibling Rivalry', 'Parent-Child Communication'
    ],
    'Life Challenges': [
      'Severe Financial Crisis', 'Overwhelming Debt Burden', 'Sudden Job Loss',
      'Business Venture Failure', 'Exam Stress and Pressure', 'Career Path Confusion',
      'Immigration and Relocation', 'Legal Problems', 'Natural Disaster Recovery',
      'Facing Gross Injustice', 'False Accusations', 'Chronic Procrastination'
    ],
    'Health and Wellness': [
      'Chronic Illness Management', 'Terminal Diagnosis', 'Chronic Pain',
      'Surgery Recovery', 'Cancer Journey', 'Fertility Challenges',
      'Pregnancy Complications', 'Postpartum Recovery', 'Eating Disorder Recovery',
      'Sleep Disorder Management', 'Weight Management'
    ],
    'Career and Purpose': [
      'Finding Life Purpose', 'Career Change', 'Workplace Discrimination',
      'Difficult Boss', 'Toxic Work Environment', 'Work-Life Balance',
      'Starting a Business', 'Unemployment', 'Burnout Prevention',
      'Imposter Syndrome', 'Fear of Public Speaking'
    ],
    'Loss and Grief': [
      'Death of a Parent', 'Death of a Spouse', 'Death of a Child',
      'Death of a Friend', 'Miscarriage and Stillbirth', 'Sudden Loss',
      'Survivor\'s Guilt', 'Grief Anniversaries', 'Helping a Grieving Friend'
    ]
  };

  Object.entries(categories).forEach(([category, titles]) => {
    titles.forEach(title => {
      add(category, title,
        [title.toLowerCase(), category.toLowerCase()],
        RICH_DEFAULT_VERSES,
        RICH_DEFAULT_DUAS,
        "Every challenge contains seeds of growth. The Prophet taught that a believer's affair is always good: in ease they are grateful, and in hardship they are patient. Your situation is divinely calibrated for your elevation.",
        ["Begin with sincere dua in the last third of the night", "Consult knowledgeable and wise believers", "Take practical steps while maintaining tawakkul", "Reflect on past blessings to fuel hope", "Read all verses related to this situation slowly, more than once"]
      );
    });
  });

  return situations;
};

const ALL_SITUATIONS = generateAllSituations();

// ---------- LOCAL STORAGE ----------
const STORAGE_KEY = "quran_companion_premium";
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { bookmarks: [], reflections: {} };
  } catch { return { bookmarks: [], reflections: {} }; }
}
function saveData(d) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
}

// ---------- AUDIO PLAYER ----------
function AudioPlayer({ surah, verse, label = "Listen to recitation" }) {
  const audioRef = useRef(null);
  const [state, setState] = useState("idle");

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause(); a.currentTime = 0;
    setState("idle");
  }, [surah, verse]);

  const url = `https://everyayah.com/data/Alafasy_128kbps/${String(surah).padStart(3,"0")}${String(verse).padStart(3,"0")}.mp3`;

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (state === "playing") { a.pause(); setState("idle"); return; }
    try { setState("loading"); a.src = url; await a.play(); setState("playing"); }
    catch { setState("error"); }
  };

  return (
    <>
      <audio ref={audioRef} preload="none"
        onEnded={() => setState("idle")}
        onError={() => setState("error")}
        onPlaying={() => setState("playing")} />
      <button onClick={toggle}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors text-sm font-semibold">
        {state === "loading" ? <FiLoader className="animate-spin" /> : state === "playing" ? <FiPause /> : <FiPlay />}
        {state === "error" ? "Audio unavailable" : state === "playing" ? "Pause" : state === "loading" ? "Loading" : label}
      </button>
    </>
  );
}

// ---------- DAILY VERSE MODAL ----------
function DailyVerseModal({ open, onClose }) {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || verse) return;
    setLoading(true);
    const num = Math.floor(Math.random() * 6236) + 1;
    fetch(`https://api.alquran.cloud/v1/ayah/${num}/editions/quran-uthmani,en.sahih`)
      .then(r => r.json())
      .then(d => {
        const ar = d.data?.[0], en = d.data?.[1];
        if (ar && en) setVerse({ arabic: ar.text, translation: en.text, surah: ar.surah.englishName, surahNum: ar.surah.number, verseNum: ar.numberInSurah });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, verse]);

  if (!open) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-[2.5rem] max-w-xl w-full p-8 md:p-10 shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-600"><FiSun /></div>
            <h3 className="text-2xl font-serif font-bold">Daily Verse</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100 transition-colors"><FiX /></button>
        </div>
        {loading || !verse ? (
          <div className="py-16 text-center text-stone-500">
            <FiLoader className="animate-spin mx-auto mb-4" size={24} />
            Loading your verse...
          </div>
        ) : (
          <>
            <p className="text-right text-3xl md:text-4xl leading-[2.2] mb-6 font-arabic text-emerald-950" dir="rtl">{verse.arabic}</p>
            <p className="italic text-lg text-gray-800 mb-6 font-serif leading-relaxed">"{verse.translation}"</p>
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">{verse.surah} — {verse.surahNum}:{verse.verseNum}</p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ---------- BROWSE VIEW ----------
function BrowseView({ situations, onSelect, data, onOpenDaily }) {
  const [search, setSearch] = useState("");

  const categories = useMemo(() => ["All", ...new Set(situations.map(s => s.category))], [situations]);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    return situations.filter(s => {
      const matchesCat = activeCategory === "All" || s.category === activeCategory;
      const matchesSearch = !search.trim() ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.keywords.some(k => k.includes(search.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [situations, search, activeCategory]);

  return (
    <div className="space-y-8 pb-12 transition-all">
      {/* Hero Section */}
      <section className="bg-emerald-600 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-emerald-100">
        <div className="absolute top-0 right-0 p-8 opacity-20"><FiLifeBuoy size={120}/></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 font-serif italic">
            What are you <span className="text-emerald-200 underline decoration-emerald-400">going through</span>?
          </h1>
          <p className="text-xl text-emerald-100/90 leading-relaxed mb-8">
            Every storm in your life has a sanctuary in the Quran. Find your anchor here.
          </p>
          
          <div className="relative group">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={22} />
            <input 
              type="text" 
              placeholder="Ask for guidance (e.g. loss, grief, success)..."
              className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl text-gray-900 shadow-xl focus:outline-none transition-all placeholder:text-gray-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Daily Verse Button */}
          <button 
            onClick={onOpenDaily}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/30 hover:bg-white/30 transition-colors text-sm font-semibold"
          >
            <FiSun size={16} /> Daily Verse
          </button>
        </div>
      </section>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button 
            key={c} 
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === c 
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                : "bg-white text-gray-600 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500">{filtered.length} situations found</p>

      {/* Situation Cards Grid - WITHOUT / PREFIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <motion.button
            key={s.id}
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => onSelect(s.id)}
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 text-left transition-all group relative"
          >
            {data.bookmarks.includes(s.id) && (
              <FiBookmark className="absolute top-4 right-4 text-emerald-600 fill-current" size={16} />
            )}
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3 block">
              {s.category}
            </span>
            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-700 font-serif">
              {s.title}
            </h3>
            <p className="text-gray-400 text-sm mt-4">
              {s.verses.length} verses of light · {s.duas.length} duas
            </p>
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FiHeart className="mx-auto text-emerald-200 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No situations found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}

// ---------- DETAIL VIEW ----------
function DetailView({ situation, onBack, data, setData }) {
  const [tab, setTab] = useState("verses");
  const [vIdx, setVIdx] = useState(0);
  const [dIdx, setDIdx] = useState(0);
  const [reflectionInput, setReflectionInput] = useState("");
  const [copied, setCopied] = useState(false);

  const isBookmarked = data.bookmarks.includes(situation.id);
  const reflections = data.reflections[situation.id] || [];

  // Scroll to top when situation changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [situation.id]);

  const toggleBookmark = () => {
    setData(d => ({
      ...d,
      bookmarks: d.bookmarks.includes(situation.id)
        ? d.bookmarks.filter(i => i !== situation.id)
        : [...d.bookmarks, situation.id]
    }));
  };

  const addReflection = () => {
    if (!reflectionInput.trim()) return;
    setData(d => ({
      ...d,
      reflections: { 
        ...d.reflections, 
        [situation.id]: [...(d.reflections[situation.id] || []), { 
          id: Date.now(), 
          text: reflectionInput, 
          date: new Date().toISOString() 
        }] 
      }
    }));
    setReflectionInput("");
  };

  const deleteReflection = (rid) => {
    setData(d => {
      const r = { ...d.reflections };
      r[situation.id] = (r[situation.id] || []).filter(x => x.id !== rid);
      if (r[situation.id].length === 0) delete r[situation.id];
      return { ...d, reflections: r };
    });
  };

  const share = (text) => {
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all"
      >
        <FiArrowLeft size={20}/> Back to situations
      </button>

      <div className="text-center">
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-4 block underline">
          {situation.category}
        </span>
        <h1 className="text-5xl font-bold text-gray-900 font-serif italic tracking-tight">
          {situation.title}
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1.5 bg-gray-50 rounded-2xl">
        {[
          { id: "verses", label: "Verses", count: situation.verses.length },
          { id: "duas", label: "Duas", count: situation.duas.length },
          { id: "guidance", label: "Guidance" },
          { id: "reflect", label: "Reflect", count: reflections.length || undefined }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id 
                ? "bg-white shadow-sm text-emerald-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                tab === t.id ? "bg-emerald-50 text-emerald-600" : "bg-gray-200 text-gray-600"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Verses Tab */}
        {tab === "verses" && (
          <motion.div key="v" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-100/50">
              <div className="flex justify-between items-center mb-8">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 text-sm">
                  #{vIdx + 1}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={toggleBookmark} 
                    className={`p-2 hover:bg-gray-100 rounded-xl transition-colors ${isBookmarked ? 'text-emerald-600' : 'text-gray-400'}`}
                  >
                    <FiBookmark size={20} className={isBookmarked ? 'fill-current' : ''} />
                  </button>
                  <button 
                    onClick={() => share(`"${situation.verses[vIdx].translation}" — Quran ${situation.verses[vIdx].surah}:${situation.verses[vIdx].verse}`)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    {copied ? <FiCheck size={20} className="text-emerald-600" /> : <FiShare2 size={20} className="text-gray-400" />}
                  </button>
                </div>
              </div>
              
              <p className="text-right font-arabic text-3xl md:text-4xl leading-[2.2] text-emerald-950 mb-8">
                {situation.verses[vIdx].arabic}
              </p>
              <p className="text-2xl font-serif italic text-gray-800 leading-relaxed">
                "{situation.verses[vIdx].translation}"
              </p>
              
              {situation.verses[vIdx].reflection && (
                <div className="mt-8 pt-8 border-t border-gray-50">
                  <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">Reflect:</p>
                  <p className="text-lg text-gray-600 leading-relaxed">{situation.verses[vIdx].reflection}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6">
              <AudioPlayer surah={situation.verses[vIdx].surah} verse={situation.verses[vIdx].verse} />
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500">{vIdx + 1} / {situation.verses.length}</span>
                <button 
                  onClick={() => setVIdx(p => p > 0 ? p - 1 : situation.verses.length - 1)} 
                  className="p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <FiChevronLeft />
                </button>
                <button 
                  onClick={() => setVIdx(p => p < situation.verses.length - 1 ? p + 1 : 0)}
                  className="px-6 py-3 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600 inline-flex items-center gap-2 transition-colors"
                >
                  Next <FiChevronRight />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Duas Tab */}
        {tab === "duas" && (
          <motion.div key="d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-100/50">
              <p className="text-right font-arabic text-3xl md:text-4xl leading-[2.2] text-emerald-950 mb-8">
                {situation.duas[dIdx].arabic}
              </p>
              <p className="text-2xl font-serif italic text-gray-800 leading-relaxed">
                "{situation.duas[dIdx].translation}"
              </p>
              <p className="mt-6 text-sm font-bold text-emerald-600 uppercase tracking-wider">
                Source: {situation.duas[dIdx].source}
              </p>
            </div>
            {situation.duas.length > 1 && (
              <div className="flex justify-center mt-6">
                <button 
                  onClick={() => setDIdx(p => p < situation.duas.length - 1 ? p + 1 : 0)}
                  className="px-6 py-3 rounded-full bg-emerald-50 text-emerald-700 font-medium inline-flex items-center gap-2 hover:bg-emerald-100 transition-colors"
                >
                  <FiRefreshCw size={14} /> Next Dua ({dIdx + 1}/{situation.duas.length})
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Guidance Tab */}
        {tab === "guidance" && (
          <motion.div key="g" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-emerald-50 rounded-[2.5rem] p-10 border border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-600"><FiBookOpen size={20} /></div>
                <h3 className="text-xl font-serif font-bold">Personal Guidance</h3>
              </div>
              <p className="text-lg leading-relaxed font-serif text-gray-700">{situation.note}</p>
            </div>
            {situation.tips?.length > 0 && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm mt-6">
                <h3 className="text-xl font-serif font-bold mb-6">Practical Steps</h3>
                <ul className="space-y-4">
                  {situation.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Reflect Tab */}
        {tab === "reflect" && (
          <motion.div key="r" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-8">
              <h3 className="text-lg font-serif font-bold mb-4">Write a reflection</h3>
              <textarea 
                value={reflectionInput} 
                onChange={e => setReflectionInput(e.target.value)}
                placeholder="What are you feeling right now? How does this verse apply to your life?"
                className="w-full h-32 p-4 bg-gray-50 rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={addReflection} 
                  disabled={!reflectionInput.trim()}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50 inline-flex items-center gap-2 transition-colors"
                >
                  <FiEdit2 size={14} /> Save Reflection
                </button>
              </div>
            </div>
            
            <h4 className="font-bold mb-4 px-2">Past Reflections ({reflections.length})</h4>
            {reflections.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">Your reflections will appear here.</p>
                <p className="text-sm text-gray-400 mt-1">This space is private and stored only on your device.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reflections.slice().reverse().map(r => (
                  <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-6 group hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                        {new Date(r.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                      <button 
                        onClick={() => deleteReflection(r.id)} 
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- ROOT COMPONENT ----------
export default function QuranLifeCompanion() {
  const [data, setData] = useState(loadData);
  const [selectedId, setSelectedId] = useState(null);
  const [dailyOpen, setDailyOpen] = useState(false);

  // Scroll to top when navigating to detail view
  useEffect(() => {
    if (selectedId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedId]);

  useEffect(() => { saveData(data); }, [data]);

  const selected = useMemo(() => ALL_SITUATIONS.find(s => s.id === selectedId), [selectedId]);

  return (
    <div style={{fontFamily: "Inter, system-ui, sans-serif"}} className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      <style>{`
        .font-serif { font-family: Cormorant, Georgia, serif; }
        .font-arabic { font-family: Amiri, serif; }
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap');
      `}</style>
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {selected ? (
            <DetailView 
              situation={selected} 
              onBack={() => setSelectedId(null)} 
              data={data} 
              setData={setData} 
            />
          ) : (
            <BrowseView 
              situations={ALL_SITUATIONS} 
              onSelect={setSelectedId} 
              data={data} 
              onOpenDaily={() => setDailyOpen(true)} 
            />
          )}
        </AnimatePresence>

        <DailyVerseModal open={dailyOpen} onClose={() => setDailyOpen(false)} />
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiHeart, FiSmile, FiSun, FiMoon, FiWind, FiCloud, FiZap } from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

const EMOTIONS = [
  { id: 'grateful', name: 'Grateful', icon: '🙏', color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  { id: 'hopeful', name: 'Hopeful', icon: '🌅', color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
  { id: 'joyful', name: 'Joyful', icon: '✨', color: 'pink', bgColor: 'bg-pink-50', textColor: 'text-pink-700' },
  { id: 'sad', name: 'Sad', icon: '💔', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  { id: 'anxious', name: 'Anxious', icon: '🕯️', color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  { id: 'stressed', name: 'Stressed', icon: '😰', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  { id: 'lonely', name: 'Lonely', icon: '😢', color: 'indigo', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
  { id: 'lost', name: 'Lost', icon: '🧭', color: 'teal', bgColor: 'bg-teal-50', textColor: 'text-teal-700' },
  { id: 'guilty', name: 'Guilty', icon: '😔', color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
  { id: 'confused', name: 'Confused', icon: '🤔', color: 'cyan', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700' }
];

export default function ReflectionModal({ isOpen, onClose, onSuccess }) {
  const { userId, addXP } = useUser();
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please write your reflection');
      return;
    }

    if (!selectedEmotion) {
      toast.error('Please select an emotion');
      return;
    }

    setSubmitting(true);
    try {
      const reflection = {
        id: Date.now(),
        userId,
        content: content.trim(),
        emotion: selectedEmotion,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: []
      };

      const savedReflections = localStorage.getItem(`reflections_${userId}`);
      const reflections = savedReflections ? JSON.parse(savedReflections) : [];
      reflections.unshift(reflection);
      localStorage.setItem(`reflections_${userId}`, JSON.stringify(reflections));

      addXP(15);
      toast.success('Reflection shared! +15 XP', { icon: '✨' });
      
      setContent('');
      setSelectedEmotion('');
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast.error('Failed to save reflection');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FiHeart className="text-emerald-500" size={16} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Share Your Reflection</h2>
              </div>
              <p className="text-gray-500 text-sm ml-10">Connect with the community</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
            >
              <FiX size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Emotion Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How are you feeling? <span className="text-emerald-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {EMOTIONS.map((emotion) => {
                  const isSelected = selectedEmotion === emotion.id;
                  return (
                    <button
                      key={emotion.id}
                      onClick={() => setSelectedEmotion(emotion.id)}
                      className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 border ${
                        isSelected
                          ? `${emotion.bgColor} border-${emotion.color}-300 shadow-sm`
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl">{emotion.icon}</span>
                      <span className={`text-xs font-medium ${isSelected ? emotion.textColor : 'text-gray-600'}`}>
                        {emotion.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reflection Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Reflection <span className="text-emerald-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share what's on your heart, what you've learned, or how Allah has guided you today..."
                rows="5"
                maxLength="500"
                className="w-full bg-gray-50 rounded-xl p-4 text-gray-800 placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all
                         border border-gray-200 resize-none text-sm"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">
                  {content.length}/500 characters
                </p>
                <p className="text-xs text-emerald-500">✨ Your voice matters</p>
              </div>
            </div>

            {/* Preview Card */}
            {content && selectedEmotion && (
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium mb-2">Preview</p>
                <div className="flex items-start gap-2">
                  <span className="text-xl">
                    {EMOTIONS.find(e => e.id === selectedEmotion)?.icon}
                  </span>
                  <p className="text-gray-700 text-sm line-clamp-3">{content}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSubmit}
              disabled={submitting || !content.trim() || !selectedEmotion}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-xl 
                       transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed 
                       flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <FiSend size={16} /> Share with Community
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </AnimatePresence>
  );
}

// src/components/SpiritualDNA.jsx - Complete Prophets Stories with Fixed UI

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrendingUp, FiAward, FiCalendar, FiHeart, FiStar, FiTarget, 
  FiBookmark, FiRefreshCw, FiShield, FiCompass, FiBookOpen,
  FiShare2, FiUsers, FiActivity, FiSun, FiCloud, FiWind, FiMoon,
  FiChevronRight, FiX, FiClock, FiGrid, FiList, FiZap, FiEye,
  FiChevronLeft, FiInfo, FiGift, FiUser, FiCheckCircle, FiSearch,
  FiFilter, FiArrowUp, FiLoader
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import { useQuranAuth } from '../contexts/QuranAuthContext';
import toast from 'react-hot-toast';

// ==================== COMPLETE PROPHETS DATA ====================
const PROPHETS = [
  {
    id: 1,
    name: "Prophet Adam (Adam)",
    nameAr: "آدم",
    image: "👤",
    title: "Abu al-Bashar (Father of Humanity)",
    description: "The first human and first prophet, created from clay and taught all names.",
    fullStory: `Allah created Adam from clay and breathed into him His spirit. He taught Adam all the names and commanded the angels to prostrate to him. All angels obeyed except Iblis (Satan), who refused out of arrogance. Adam and Hawwa (Eve) lived in Paradise but were tempted by Satan to eat from the forbidden tree. They repented sincerely, and Allah forgave them but sent them to Earth as His vicegerents. Adam was the first prophet who taught his children about Allah and built the first Kaaba.`,
    miracles: ["Created from clay without parents", "Taught all names by Allah", "First to receive prophethood", "Built the first Kaaba"],
    teachings: ["Repent sincerely after sins", "Satan is humanity's enemy", "Knowledge is a gift from Allah", "Humility before Allah"],
    verses: ["And He taught Adam the names - all of them... (2:31)", "Indeed, I will make upon the earth a successive authority. (2:30)"],
    lessons: ["Sincere repentance", "Avoid arrogance", "Know your enemy (Satan)", "Seek knowledge"],
    timeline: [
      { year: "Creation", event: "Created from clay" },
      { year: "Creation", event: "Angels commanded to prostrate" },
      { year: "Creation", event: "Tested with the tree" },
      { year: "Earth", event: "Descended to Earth as Khalifah" }
    ],
    color: "from-stone-500 to-neutral-600",
    bgColor: "bg-stone-50",
    borderColor: "border-stone-200"
  },
  {
    id: 2,
    name: "Prophet Idris (Enoch)",
    nameAr: "إدريس",
    image: "📜",
    title: "The Scribe & Scholar",
    description: "Known for his wisdom, writing, and being raised to a high station.",
    fullStory: `Prophet Idris was a descendant of Adam through his son Seth. He was the first to write with a pen and was skilled in astronomy, mathematics, and tailoring. He called people to worship Allah and follow the path of Adam. He was known for his patience, truthfulness, and deep knowledge. Allah raised him to a high station, and according to some narrations, he was taken to the fourth heaven where he resides. He warned people about the consequences of sins and taught them prayer and fasting.`,
    miracles: ["First to write with pen", "Knowledge of astronomy", "Raised to high station", "Master of multiple sciences"],
    teachings: ["Value of knowledge", "Patience in da'wah", "Writing preserves wisdom", "Balance worldly and spiritual knowledge"],
    verses: ["And mention in the Book, Idris. Indeed, he was a man of truth and a prophet. And We raised him to a high station. (19:56-57)"],
    lessons: ["Knowledge is powerful", "Patience brings elevation", "Truthfulness is essential", "Teach through writing"],
    timeline: [
      { year: "~4000 BCE", event: "Born as descendant of Seth" },
      { year: "~3900 BCE", event: "Received prophethood" },
      { year: "~3800 BCE", event: "First to write with pen" },
      { year: "~3700 BCE", event: "Raised to high station" }
    ],
    color: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
  {
    id: 3,
    name: "Prophet Nuh (Noah)",
    nameAr: "نوح",
    image: "⛵",
    title: "The Patient Preacher",
    description: "Preached for 950 years and built the ark to save believers from the great flood.",
    fullStory: `Prophet Nuh was sent to his people who worshipped idols. He preached for 950 years with patience, calling them day and night, publicly and privately. Despite his efforts, only about 80 people believed. The disbelievers mocked him as he built the ark by Allah's command. When the flood came, water gushed from the earth and poured from the sky. All disbelievers drowned, including Nuh's own son who refused to board. The ark settled on Mount Judi, and believers repopulated the Earth.`,
    miracles: ["The great ark", "The flood covering Earth", "950 years of preaching", "Animals coming in pairs"],
    teachings: ["Patience in da'wah", "Trust Allah's plan", "Family guidance", "Never give up on people"],
    verses: ["And We sent Noah to his people, and he remained among them a thousand years minus fifty... (29:14)"],
    lessons: ["Never lose hope", "Obey Allah's commands", "Save your family through faith", "Patience against mockery"],
    timeline: [
      { year: "~3000 BCE", event: "Sent as prophet" },
      { year: "~2500 BCE", event: "Built the ark" },
      { year: "~2490 BCE", event: "The great flood" },
      { year: "~2480 BCE", event: "Ark rested on Mount Judi" }
    ],
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    id: 4,
    name: "Prophet Hud",
    nameAr: "هود",
    image: "🏔️",
    title: "Prophet of 'Ad",
    description: "Sent to the mighty people of 'Ad who built great structures and were destroyed by a fierce wind.",
    fullStory: `Prophet Hud was sent to the people of 'Ad who lived in Al-Ahqaf (sand dunes). They were tall, strong people who built magnificent structures. They became arrogant, worshipped idols, and oppressed others. Hud called them to worship Allah alone, but they rejected him, calling him foolish. Allah withheld rain for years, and when they still refused to believe, a fierce, screaming wind was sent upon them for seven nights and eight days, destroying everything. Only Hud and the believers were saved.`,
    miracles: ["Survived the destroying wind", "Prophesied the punishment", "Withheld rain miracle"],
    teachings: ["Arrogance leads to destruction", "Strength is from Allah", "Worship Allah alone", "Warn before punishment"],
    verses: ["And to 'Ad [We sent] their brother Hud. He said, 'O my people, worship Allah...' (7:65)"],
    lessons: ["Don't be arrogant with power", "Heed warnings", "Material strength can't save", "True power is with Allah"],
    timeline: [
      { year: "~2500 BCE", event: "Sent to people of 'Ad" },
      { year: "~2490 BCE", event: "Preached for many years" },
      { year: "~2480 BCE", event: "Drought as warning" },
      { year: "~2470 BCE", event: "Destroying wind sent" }
    ],
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  {
    id: 5,
    name: "Prophet Salih",
    nameAr: "صالح",
    image: "🐪",
    title: "Prophet of Thamud",
    description: "Sent to Thamud who were given a miraculous she-camel as a sign from Allah.",
    fullStory: `Prophet Salih was sent to the people of Thamud who succeeded 'Ad. They were skilled at carving homes in mountains. When they demanded a sign, Allah sent a miraculous she-camel from a rock. Salih warned them not to harm her and to share water with her. The disbelievers, led by nine wicked men, hamstrung and killed the camel. Salih gave them three days before punishment. On the fourth day, a terrible earthquake and thunderous blast destroyed them all except the believers.`,
    miracles: ["She-camel from rock", "Camel giving abundant milk", "Precise prophecy of punishment"],
    teachings: ["Respect Allah's signs", "Share resources justly", "Don't test Allah", "Wickedness destroys"],
    verses: ["And to Thamud [We sent] their brother Salih... (7:73)", "So the earthquake seized them... (7:78)"],
    lessons: ["Respect divine signs", "Justice in sharing", "Warning before punishment", "Arrogant leaders misguide"],
    timeline: [
      { year: "~2200 BCE", event: "Sent to Thamud" },
      { year: "~2195 BCE", event: "She-camel miracle" },
      { year: "~2190 BCE", event: "Camel killed by disbelievers" },
      { year: "~2187 BCE", event: "Earthquake destruction" }
    ],
    color: "from-amber-500 to-yellow-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  {
    id: 6,
    name: "Prophet Ibrahim (Abraham)",
    nameAr: "إبراهيم",
    image: "🕋",
    title: "Khalilullah (Friend of Allah)",
    description: "Father of prophets, rebuilt the Kaaba, tested with sacrifice of his son.",
    fullStory: `Prophet Ibrahim was born in Babylon to a family of idol-makers. From youth, he questioned idol worship. He broke all idols except the largest one and, when questioned, said "Ask the big one." He was thrown into a massive fire, but Allah made it cool and safe for him. He migrated to Palestine and later to Arabia where he left Hajar and baby Isma'il. Allah tested him with the command to sacrifice Isma'il, and when he submitted, a ram was substituted. He and Isma'il rebuilt the Kaaba.`,
    miracles: ["Fire becoming cool", "Zamzam water spring", "Ram from Paradise", "Reviving dead birds", "Hajar's running between Safa and Marwa"],
    teachings: ["Complete submission to Allah", "Stand against falsehood", "Hospitality", "Trust Allah absolutely"],
    verses: ["And who is better in religion than one who submits himself to Allah... (4:125)", "Allah said, 'O fire, be coolness and safety upon Abraham.' (21:69)"],
    lessons: ["Complete faith", "Sacrifice for Allah", "Standing for truth alone", "Hospitality to guests"],
    timeline: [
      { year: "~2000 BCE", event: "Born in Babylon" },
      { year: "~1980 BCE", event: "Broke idols" },
      { year: "~1975 BCE", event: "Thrown into fire" },
      { year: "~1950 BCE", event: "Left Hajar and Isma'il in desert" },
      { year: "~1940 BCE", event: "Sacrifice test" },
      { year: "~1930 BCE", event: "Rebuilt Kaaba" }
    ],
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  {
    id: 7,
    name: "Prophet Lut (Lot)",
    nameAr: "لوط",
    image: "🏙️",
    title: "The Righteous Witness",
    description: "Nephew of Ibrahim, sent to the people of Sodom who practiced unprecedented immorality.",
    fullStory: `Prophet Lut was the nephew of Ibrahim who migrated with him. He was sent to the people of Sodom who practiced homosexuality openly, the first people to do so. Lut warned them for years but they refused to change. Angels in the form of handsome young men visited Lut as a test. The people demanded the guests, but Lut offered protection. The angels revealed their identity and told Lut to leave with his family at night. His wife looked back and was destroyed. The cities were overturned, and a rain of stones fell upon them.`,
    miracles: ["Angels visiting in human form", "Blinding the mob", "Cities overturned", "Rain of stones"],
    teachings: ["Stand against immorality", "Protect the vulnerable", "Don't look back at sins", "Obedience saves"],
    verses: ["And [We sent] Lot, when he said to his people, 'Do you commit such immorality...' (7:80)"],
    lessons: ["Moral courage", "Protecting guests", "Leaving evil behind", "Don't sympathize with sin"],
    timeline: [
      { year: "~1950 BCE", event: "Migrated with Ibrahim" },
      { year: "~1940 BCE", event: "Sent to Sodom" },
      { year: "~1900 BCE", event: "Angels visited" },
      { year: "~1898 BCE", event: "Cities destroyed" }
    ],
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  {
    id: 8,
    name: "Prophet Isma'il (Ishmael)",
    nameAr: "إسماعيل",
    image: "👦",
    title: "Dhabihullah (The Sacrificed One)",
    description: "Son of Ibrahim, helped rebuild the Kaaba, ancestor of Prophet Muhammad ﷺ.",
    fullStory: `Prophet Isma'il was the firstborn son of Ibrahim through Hajar. As a baby, he was left with his mother in the barren desert of Mecca. When water ran out, Hajar ran between Safa and Marwa seven times, and Allah caused the Zamzam spring to gush forth from beneath Isma'il's feet. When he grew older, Ibrahim had a dream of sacrificing him. Both father and son submitted to Allah's command, but a ram was substituted. Isma'il helped his father rebuild the Kaaba and became the ancestor of the Arabs and Prophet Muhammad ﷺ.`,
    miracles: ["Zamzam water spring", "Ram substituted in sacrifice", "Helped build Kaaba", "Ancestor of Prophet Muhammad ﷺ"],
    teachings: ["Submission to Allah", "Patience in hardship", "Honoring parents", "Fulfilling promises"],
    verses: ["And when he reached with him [the age of] exertion, he said, 'O my son...' (37:102)"],
    lessons: ["Complete obedience", "Trust Allah in hardships", "Family blessed through faith", "Promises to Allah"],
    timeline: [
      { year: "~1955 BCE", event: "Born to Hajar" },
      { year: "~1953 BCE", event: "Zamzam spring" },
      { year: "~1940 BCE", event: "Sacrifice test" },
      { year: "~1930 BCE", event: "Rebuilt Kaaba with father" }
    ],
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200"
  },
  {
    id: 9,
    name: "Prophet Ishaq (Isaac)",
    nameAr: "إسحاق",
    image: "👨🦳",
    title: "The Blessed Son",
    description: "Son of Ibrahim and Sarah, father of Yaqub, ancestor of the Israelites.",
    fullStory: `Prophet Ishaq was the second son of Ibrahim, born to Sarah in her old age through a miracle when angels gave the glad tidings. Sarah laughed in disbelief at first. Ishaq grew up as a righteous prophet who continued his father's legacy of calling to monotheism. He married Rebekah and had twin sons: Esau and Yaqub (Israel). Ishaq was known for his wisdom and patience, and he continued the line of prophethood through his son Yaqub, from whom the twelve tribes of Israel descended.`,
    miracles: ["Born to elderly parents", "Twin sons including a prophet", "Continued prophetic lineage"],
    teachings: ["Nothing is impossible for Allah", "Gratitude for children", "Family legacy of faith", "Passing faith to children"],
    verses: ["And We gave him good tidings of Isaac, a prophet from among the righteous. (37:112)"],
    lessons: ["Allah's power over nature", "Patience for children", "Raising righteous children", "Legacy of faith"],
    timeline: [
      { year: "~1930 BCE", event: "Miraculous birth" },
      { year: "~1910 BCE", event: "Became prophet" },
      { year: "~1900 BCE", event: "Married Rebekah" },
      { year: "~1890 BCE", event: "Father of Yaqub" }
    ],
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    id: 10,
    name: "Prophet Yaqub (Jacob/Israel)",
    nameAr: "يعقوب",
    image: "😢",
    title: "Israel (Servant of Allah)",
    description: "Son of Ishaq, father of twelve tribes and Prophet Yusuf, known for beautiful patience.",
    fullStory: `Prophet Yaqub was the son of Ishaq and grandson of Ibrahim. He had twelve sons, including Yusuf and Binyamin. His favorite son was Yusuf, which caused jealousy among the other brothers. They threw Yusuf into a well and told their father a wolf had eaten him. Yaqub wept for Yusuf for decades until he became blind from grief. Despite his sorrow, he never lost hope in Allah and maintained "beautiful patience" (sabrun jameel). He was eventually reunited with Yusuf in Egypt, his sight was restored when Yusuf's shirt was placed on his face.`,
    miracles: ["Sight restored by Yusuf's shirt", "Father of twelve tribes", "Beautiful patience for decades"],
    teachings: ["Beautiful patience", "Never lose hope in Allah", "Forgive family", "Trust Allah's wisdom"],
    verses: ["He said, 'I only complain of my suffering and grief to Allah...' (12:86)"],
    lessons: ["Patience in grief", "Never despair of Allah", "Family reconciliation", "Sorrow only to Allah"],
    timeline: [
      { year: "~1890 BCE", event: "Born to Ishaq" },
      { year: "~1870 BCE", event: "Had twelve sons" },
      { year: "~1850 BCE", event: "Yusuf disappeared" },
      { year: "~1820 BCE", event: "Reunited with Yusuf" }
    ],
    color: "from-sky-500 to-blue-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200"
  },
  {
    id: 11,
    name: "Prophet Yusuf (Joseph)",
    nameAr: "يوسف",
    image: "🌟",
    title: "The Beautiful & Wise",
    description: "Known for his beauty, dream interpretation, and rise from slave to minister of Egypt.",
    fullStory: `Prophet Yusuf was the beloved son of Yaqub. His jealous brothers threw him into a well, and he was sold as a slave in Egypt. He was falsely accused by the wife of Al-Aziz and imprisoned. In prison, he interpreted the dreams of two inmates accurately. When the king had a troubling dream, Yusuf interpreted it, predicting seven years of plenty followed by seven years of famine. Impressed by his wisdom and honesty, the king appointed him as minister. During the famine, his brothers came for grain, and after testing them, Yusuf revealed himself and forgave them. His family reunited in Egypt.`,
    miracles: ["Precise dream interpretation", "Rise from slave to minister", "Surviving false accusation", "Reuniting family after decades"],
    teachings: ["Patience brings elevation", "Forgiveness is powerful", "Trust Allah's plan", "Maintain dignity in trials"],
    verses: ["Indeed, my Lord is Subtle in what He wills... (12:100)", "Indeed, he who fears Allah and is patient... (12:90)"],
    lessons: ["Patience through injustice", "Forgive completely", "Allah's plan unfolds beautifully", "Maintain character in prison"],
    timeline: [
      { year: "~1850 BCE", event: "Dream of stars" },
      { year: "~1848 BCE", event: "Thrown into well" },
      { year: "~1845 BCE", event: "Sold as slave in Egypt" },
      { year: "~1840 BCE", event: "Falsely imprisoned" },
      { year: "~1835 BCE", event: "Interpreted king's dream" },
      { year: "~1830 BCE", event: "Reunited with family" }
    ],
    color: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  {
    id: 12,
    name: "Prophet Ayyub (Job)",
    nameAr: "أيوب",
    image: "🌿",
    title: "The Epitome of Patience",
    description: "Tested with loss of wealth, children, and health, yet remained grateful to Allah.",
    fullStory: `Prophet Ayyub was a wealthy, pious man with many children and vast lands. Allah tested him severely: his wealth was destroyed, all his children died, and he was afflicted with a severe skin disease for many years. Throughout this, he never complained or lost faith. His wife remained loyal. When the disease became severe, he finally made a beautiful dua: "Indeed, adversity has touched me, and You are the Most Merciful of the merciful." Allah answered, cured him, restored his wealth, and blessed him with twice as many children. A spring of healing water was provided for him.`,
    miracles: ["Patience during extreme trials", "Complete health restoration", "Spring of healing water", "Double wealth and children returned"],
    teachings: ["Patience in hardship", "Gratitude in all states", "Complain only to Allah", "Loyal spouse is a blessing"],
    verses: ["Indeed, We found him patient, an excellent servant... (38:44)", "And [mention] Job, when he called to his Lord... (21:83)"],
    lessons: ["Patience brings reward", "Gratitude despite trials", "Allah tests those He loves", "Loyalty in marriage"],
    timeline: [
      { year: "~1600 BCE", event: "Blessed with wealth and children" },
      { year: "~1580 BCE", event: "Severe trials begin" },
      { year: "~1570 BCE", event: "Years of patience" },
      { year: "~1560 BCE", event: "Healed and doubly blessed" }
    ],
    color: "from-lime-500 to-green-600",
    bgColor: "bg-lime-50",
    borderColor: "border-lime-200"
  },
  {
    id: 13,
    name: "Prophet Shu'ayb (Jethro)",
    nameAr: "شعيب",
    image: "⚖️",
    title: "Khatib al-Anbiya (Orator of Prophets)",
    description: "Sent to Madyan, known for his eloquent speech against economic fraud and corruption.",
    fullStory: `Prophet Shu'ayb was sent to the people of Madyan who were merchants cheating in weights and measures. They would give less when selling and take more when buying. They also blocked roads and spread corruption. Shu'ayb warned them with eloquent speech to worship Allah alone and be fair in business. The disbelievers threatened to expel him. They were destroyed by a terrible earthquake and a thunderous blast that left them dead in their homes, as if they had never lived there. Shu'ayb was also the father-in-law of Prophet Musa.`,
    miracles: ["Eloquent speech and persuasion", "Earthquake punishment on disbelievers", "Thunderous blast"],
    teachings: ["Fair business practices", "Honest weights and measures", "Don't cheat in trade", "Economic justice"],
    verses: ["And to Madyan [We sent] their brother Shu'ayb... (7:85)", "Give full measure and weight and do not deprive people of their due... (7:85)"],
    lessons: ["Honesty in business", "Economic fairness", "Don't cheat customers", "Justice in dealings"],
    timeline: [
      { year: "~1500 BCE", event: "Sent to Madyan" },
      { year: "~1490 BCE", event: "Preached against fraud" },
      { year: "~1480 BCE", event: "Disbelievers destroyed" },
      { year: "~1470 BCE", event: "Hosted Prophet Musa" }
    ],
    color: "from-teal-500 to-cyan-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200"
  },
  {
    id: 14,
    name: "Prophet Musa (Moses)",
    nameAr: "موسى",
    image: "🌊",
    title: "Kalimullah (Spoken to by Allah)",
    description: "Confronted Pharaoh, parted the Red Sea, received the Torah on Mount Sinai.",
    fullStory: `Prophet Musa was born in Egypt during Pharaoh's rule when Israelite boys were being killed. His mother placed him in a basket in the Nile, and he was found by Pharaoh's wife and raised in the palace. As an adult, he accidentally killed an Egyptian, fled to Madyan, married Shu'ayb's daughter, and lived as a shepherd. At Mount Sinai, he saw the burning bush and was chosen as prophet. He returned to Egypt with his brother Harun, confronted Pharaoh, and showed miracles: staff to serpent and radiant hand. After Pharaoh's magicians believed, plagues struck Egypt. Musa led the Israelites across the parted Red Sea while Pharaoh drowned. He received the Torah on Mount Sinai.`,
    miracles: ["Staff to serpent", "Radiant white hand", "Parting Red Sea", "Twelve springs from rock", "Manna and Salwa", "Plagues of Egypt", "Burning bush"],
    teachings: ["Justice against oppression", "Patience in leadership", "Trust Allah in danger", "Speak truth to tyrants"],
    verses: ["Indeed, I am Allah. There is no deity except Me... (20:14)", "And We inspired to Moses, 'Strike with your staff the sea,' and it parted... (26:63)"],
    lessons: ["Courage against tyranny", "Leadership requires patience", "Repentance is accepted", "Trust in divine help"],
    timeline: [
      { year: "~1400 BCE", event: "Born during Pharaoh's persecution" },
      { year: "~1390 BCE", event: "Raised in Pharaoh's palace" },
      { year: "~1370 BCE", event: "Fled to Madyan" },
      { year: "~1350 BCE", event: "Received prophethood at Sinai" },
      { year: "~1340 BCE", event: "Confronted Pharaoh" },
      { year: "~1335 BCE", event: "Exodus and parting of sea" },
      { year: "~1330 BCE", event: "Received Torah" }
    ],
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    id: 15,
    name: "Prophet Harun (Aaron)",
    nameAr: "هارون",
    image: "🗣️",
    title: "The Eloquent Helper",
    description: "Brother of Musa, known for eloquence, appointed as Musa's assistant and deputy.",
    fullStory: `Prophet Harun was the older brother of Musa. When Musa was commanded to go to Pharaoh, he asked Allah to make Harun his helper because Harun was more eloquent in speech. Harun supported Musa throughout his mission, speaking to the people and managing affairs in Musa's absence. When Musa went to Mount Sinai for forty nights, Harun was left in charge of the Israelites. During this time, a man named Samiri created a golden calf that made lowing sounds. Harun tried to stop the people from worshipping it, but they overpowered him. When Musa returned, he was angry, but Harun explained his situation, and Musa understood.`,
    miracles: ["Eloquent speech", "Supported Musa's prophethood", "Managed people during Musa's absence"],
    teachings: ["Support your brother in good", "Speak clearly and eloquently", "Do your best to prevent evil", "Explain when misunderstood"],
    verses: ["And We granted him out of Our mercy his brother Aaron as a prophet. (19:53)", "Aaron had already told them, 'O my people...' (20:90)"],
    lessons: ["Sibling support in faith", "Eloquence in da'wah", "Do your utmost", "Clear communication"],
    timeline: [
      { year: "~1370 BCE", event: "Born before Musa" },
      { year: "~1350 BCE", event: "Appointed as Musa's helper" },
      { year: "~1340 BCE", event: "Confronted Pharaoh with Musa" },
      { year: "~1330 BCE", event: "Faced golden calf trial" }
    ],
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200"
  },
  {
    id: 16,
    name: "Prophet Dawud (David)",
    nameAr: "داوود",
    image: "👑",
    title: "The Righteous King",
    description: "A prophet-king who defeated Goliath, received the Psalms (Zabur), and had mountains and birds praise with him.",
    fullStory: `Prophet Dawud was a young man in the army of Talut (Saul) when he defeated the giant Goliath (Jalut) with a sling. Allah made him a prophet and later a king. He was given the Zabur (Psalms), and Allah softened iron for him so he could make armor. Mountains and birds would join him in praising Allah. He was known for his beautiful voice in recitation. He was tested when two disputants came to him with a case, and he initially made a judgment without hearing the other side. He repented, and Allah forgave him. His son Sulayman inherited his prophethood and kingdom.`,
    miracles: ["Defeating Goliath", "Iron softened for him", "Mountains and birds praising", "Beautiful voice", "Zabur revealed"],
    teachings: ["Justice in judgment", "Humility despite power", "Repentance", "Balance worldly and spiritual"],
    verses: ["And We gave David the Psalms... (17:55)", "And We softened for him iron... (34:10)"],
    lessons: ["Humility in power", "Fair judgment", "Sincere repentance", "Use talents for Allah"],
    timeline: [
      { year: "~1040 BCE", event: "Defeated Goliath" },
      { year: "~1030 BCE", event: "Became king" },
      { year: "~1020 BCE", event: "Received Zabur" },
      { year: "~1000 BCE", event: "Tested and repented" }
    ],
    color: "from-purple-500 to-fuchsia-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    id: 17,
    name: "Prophet Sulayman (Solomon)",
    nameAr: "سليمان",
    image: "🏰",
    title: "The Magnificent King",
    description: "Son of Dawud, ruled over humans, jinn, birds, and wind. Could speak to animals.",
    fullStory: `Prophet Sulayman inherited prophethood and kingdom from his father Dawud. Allah gave him unprecedented powers: control over wind, ability to speak with animals and birds, command over jinn who built magnificent structures for him. His army included humans, jinn, and birds. The hoopoe bird brought news of the Queen of Sheba (Bilqis) who worshipped the sun. Sulayman sent her a letter, and she eventually visited. Her throne was brought in the blink of an eye by one who had knowledge of the Book. She accepted Islam after seeing Sulayman's kingdom and wisdom. Sulayman ruled justly until his death, which was only discovered when a termite ate his staff, and he fell.`,
    miracles: ["Speaking to animals", "Controlling wind", "Commanding jinn", "Throne transported instantly", "Understanding bird language", "Hoopoe bird scout"],
    teachings: ["Gratitude for blessings", "Just leadership", "Using power wisely", "Calling rulers to Islam"],
    verses: ["And Solomon inherited David... (27:16)", "So We subjected to him the wind... (38:36)"],
    lessons: ["Power requires gratitude", "Leadership with justice", "Share faith with leaders", "Don't be deceived by power"],
    timeline: [
      { year: "~990 BCE", event: "Born to Dawud" },
      { year: "~970 BCE", event: "Became king and prophet" },
      { year: "~960 BCE", event: "Queen of Sheba accepted Islam" },
      { year: "~931 BCE", event: "Death discovered by termite" }
    ],
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200"
  },
  {
    id: 18,
    name: "Prophet Ilyas (Elijah)",
    nameAr: "إلياس",
    image: "🔥",
    title: "The Zealous Reformer",
    description: "Sent to the people of Baalbek who worshipped the idol Ba'al.",
    fullStory: `Prophet Ilyas was sent to the people of Baalbek (in present-day Lebanon) who worshipped an idol named Ba'al. He called them to worship Allah alone with great zeal and passion. He challenged the priests of Ba'al and proved the falsehood of their idol. Despite his efforts, most people rejected him. The Quran mentions him as being among the truly excellent and righteous. According to some traditions, he was raised to heaven like Idris.`,
    miracles: ["Challenged and disproved idol worship", "Zealous and powerful preaching", "Raised to heaven"],
    teachings: ["Zeal for truth", "Challenge false beliefs", "Courage against majority", "Pure monotheism"],
    verses: ["And indeed, Elias was from among the messengers... (37:123)", "Do you call upon Ba'l and leave the best of creators? (37:125)"],
    lessons: ["Zeal for Allah's religion", "Challenge false gods", "Stand against majority", "Pure tawheed"],
    timeline: [
      { year: "~860 BCE", event: "Sent to Baalbek" },
      { year: "~855 BCE", event: "Challenged Ba'al worship" },
      { year: "~850 BCE", event: "Raised to heaven" }
    ],
    color: "from-red-500 to-orange-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  {
    id: 19,
    name: "Prophet Al-Yasa' (Elisha)",
    nameAr: "اليسع",
    image: "🦯",
    title: "The Faithful Successor",
    description: "Successor of Ilyas, continued his mission among the Israelites.",
    fullStory: `Prophet Al-Yasa' was the successor of Prophet Ilyas. He was devoted to Ilyas and accompanied him faithfully. When Ilyas was raised to heaven, Al-Yasa' carried on his prophetic mission among the Israelites. He continued calling people to monotheism, performing miracles by Allah's permission, and guiding the people with wisdom and patience. The Quran mentions him briefly as being among the excellent and chosen.`,
    miracles: ["Continuation of Ilyas's miracles", "Healing the sick", "Purifying water", "Multiplying oil"],
    teachings: ["Continue good work of predecessors", "Faithful service", "Persistent da'wah", "Mentorship"],
    verses: ["And [We guided] Elisha... and all [of them] We preferred over the worlds. (6:86)", "And remember Elisha... (38:48)"],
    lessons: ["Carry the torch of faith", "Be a faithful successor", "Continue righteous work", "Mentor others"],
    timeline: [
      { year: "~860 BCE", event: "Chosen as Ilyas's successor" },
      { year: "~850 BCE", event: "Continued prophetic mission" },
      { year: "~840 BCE", event: "Served the Israelites" }
    ],
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  {
    id: 20,
    name: "Prophet Dhul-Kifl (Ezekiel)",
    nameAr: "ذو الكفل",
    image: "🛡️",
    title: "The Guarantor",
    description: "Known for his pledge to judge fairly, fast by day, pray by night, and never get angry.",
    fullStory: `Prophet Dhul-Kifl is identified by some scholars as Ezekiel. The name means "the one with a guarantee" or "possessor of double portion." According to traditions, he guaranteed to judge his people with justice, fast during days, pray during nights, and never become angry. He fulfilled all these pledges. Some narrations say he was appointed to continue the mission after Prophet Ilyas. He was known for his patience, wisdom, and steadfastness in keeping his promises. The Quran mentions him briefly among the patient and righteous.`,
    miracles: ["Fulfilled all his pledges", "Controlled his anger perfectly", "Judged with complete fairness"],
    teachings: ["Keep your promises", "Control anger", "Be fair in judgment", "Self-discipline"],
    verses: ["And [mention] Ishmael, Elisha, and Dhul-Kifl, and all are among the excellent. (38:48)", "And remember Dhul-Kifl... (21:85)"],
    lessons: ["Promise-keeping", "Anger management", "Fair judgment", "Self-discipline is key"],
    timeline: [
      { year: "~830 BCE", event: "Made pledges to Allah" },
      { year: "~820 BCE", event: "Fulfilled all pledges" },
      { year: "~810 BCE", event: "Served as prophet" }
    ],
    color: "from-gray-500 to-slate-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200"
  },
  {
    id: 21,
    name: "Prophet Yunus (Jonah)",
    nameAr: "يونس",
    image: "🐋",
    title: "Dhun-Nun (Man of the Whale)",
    description: "Swallowed by a whale, saved through repentance and the dua of distress.",
    fullStory: `Prophet Yunus was sent to the people of Nineveh (modern-day Iraq). When they rejected his message for a long time, he left in anger without Allah's permission. He boarded a ship, and when it became overloaded, lots were cast and he was thrown overboard. A great fish (whale) swallowed him by Allah's command. In three layers of darkness (night, sea, fish's belly), he made the powerful dua: "La ilaha illa Anta, subhanaka inni kuntu minaz-zalimin" (There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers). Allah accepted his repentance, the fish released him onto the shore. He returned to find all 100,000+ people of Nineveh had believed.`,
    miracles: ["Surviving inside whale", "Repentance accepted", "Gourd tree for shade", "Entire city of 100,000+ believed"],
    teachings: ["Never lose hope", "Repentance is powerful", "The dua of Yunus", "Patience with people"],
    verses: ["And [mention] the man of the fish, when he went off in anger... (21:87)", "Had he not been of those who exalt Allah, he would have remained inside its belly until the Day of Resurrection. (37:143-144)"],
    lessons: ["Never despair of Allah", "Repent sincerely", "Seek Allah's permission", "The power of tasbih"],
    timeline: [
      { year: "~780 BCE", event: "Sent to Nineveh" },
      { year: "~777 BCE", event: "Left in anger" },
      { year: "~777 BCE", event: "Swallowed by whale" },
      { year: "~776 BCE", event: "Repented and released" },
      { year: "~775 BCE", event: "Returned to believing city" }
    ],
    color: "from-cyan-400 to-blue-500",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200"
  },
  {
    id: 22,
    name: "Prophet Zakariyya (Zechariah)",
    nameAr: "زكريا",
    image: "👴",
    title: "The Guardian of Maryam",
    description: "Guardian of Maryam, prayed for a son in old age, blessed with Yahya (John).",
    fullStory: `Prophet Zakariyya was a righteous man from the descendants of Harun. He was the guardian of Maryam in the temple. He used to find out-of-season fruits with her, provided by Allah. Upon seeing this miracle, although old and with a barren wife, he prayed for a righteous heir. Angels gave him glad tidings of Yahya (John). As a sign, he couldn't speak for three days except through gestures. Yahya was born and became a prophet. Zakariyya was known for his devotion, prayer, and care for Maryam. According to some narrations, he was later killed by his people.`,
    miracles: ["Out-of-season fruits with Maryam", "Silence for three days as sign", "Son born in extreme old age"],
    teachings: ["Never give up making dua", "Care for orphans and the pious", "Allah answers sincere prayers", "Trust Allah's timing"],
    verses: ["At that, Zechariah called upon his Lord... (3:38)", "So the angels called him while he was standing in prayer... (3:39)"],
    lessons: ["Dua is never wasted", "Serve the pious", "Allah's power over biology", "Prayer brings miracles"],
    timeline: [
      { year: "~5 BCE", event: "Guardian of Maryam" },
      { year: "~4 BCE", event: "Prayed for son" },
      { year: "~3 BCE", event: "Yahya born" },
      { year: "~1 CE", event: "Martyred" }
    ],
    color: "from-green-400 to-teal-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    id: 23,
    name: "Prophet Yahya (John the Baptist)",
    nameAr: "يحيى",
    image: "💧",
    title: "The Pure & Devoted",
    description: "Son of Zakariyya, known for wisdom, purity, and devotion from childhood.",
    fullStory: `Prophet Yahya was the son of Zakariyya, born as an answer to his father's prayer. He was given wisdom even as a child, and was known for his purity, compassion, and devotion. He would weep from the fear of Allah from a young age. He was sent to confirm the message of Isa (Jesus). Yahya was known for his ascetic lifestyle, living simply and eating from the wild. He was ordered to follow the Torah strictly. According to some narrations, he was martyred for refusing to approve an unjust marriage.`,
    miracles: ["Wisdom in childhood", "Extreme piety and devotion", "Confirmation of Isa's message"],
    teachings: ["Purity of heart", "Wisdom from youth", "Ascetic lifestyle", "Stand for truth regardless of cost"],
    verses: ["[Allah said], 'O John, take the Scripture with determination.' And We gave him wisdom [while yet] a boy. (19:12)"],
    lessons: ["Start righteousness young", "Live simply", "Stand for truth", "Devotion to Allah"],
    timeline: [
      { year: "~3 BCE", event: "Born to Zakariyya" },
      { year: "~15 CE", event: "Became prophet" },
      { year: "~27 CE", event: "Supported Isa's mission" },
      { year: "~30 CE", event: "Martyred" }
    ],
    color: "from-emerald-400 to-green-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  {
    id: 24,
    name: "Prophet Isa (Jesus)",
    nameAr: "عيسى",
    image: "⭐",
    title: "Al-Masih (The Messiah)",
    description: "Born miraculously to Maryam, performed great miracles, raised to heaven, will return.",
    fullStory: `Prophet Isa was miraculously born to Maryam without a father. As a newborn, he spoke in the cradle defending his mother's honor. He was given the Injeel (Gospel) and performed many miracles by Allah's permission: healing the blind and lepers, raising the dead, creating birds from clay, and telling people what they ate and stored. He called people to worship Allah alone and was supported by the disciples (Hawariyyun). When disbelievers plotted to kill him, Allah raised him to heaven. He will return near the end of times to defeat the false messiah (Dajjal) and establish justice.`,
    miracles: ["Born without father", "Speaking in cradle", "Healing blind and lepers", "Raising dead", "Birds from clay", "Table spread from heaven", "Knowledge of unseen (what people stored)"],
    teachings: ["Worship Allah alone", "Humility", "Compassion for the poor", "Forgiveness", "Prepare for afterlife"],
    verses: ["Indeed, the example of Jesus in the sight of Allah is like that of Adam... (3:59)", "And [make him] a messenger to the Children of Israel... (3:49)"],
    lessons: ["Miracles are from Allah", "Humility in power", "Compassion for all", "Return to establish justice"],
    timeline: [
      { year: "~4 BCE", event: "Miraculous birth" },
      { year: "~27 CE", event: "Received prophethood and Injeel" },
      { year: "~30 CE", event: "Raised to heaven" },
      { year: "Future", event: "Will return before Day of Judgment" }
    ],
    color: "from-indigo-400 to-purple-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
  {
    id: 25,
    name: "Prophet Muhammad ﷺ",
    nameAr: "محمد",
    image: "🕌",
    title: "Khatam an-Nabiyyin (Seal of Prophets)",
    description: "The final messenger who brought the Quran and completed the message of Islam for all humanity.",
    fullStory: `Prophet Muhammad ﷺ was born in Mecca in the Year of the Elephant (570 CE). He was known as Al-Amin (the trustworthy). At age 40, Angel Jibreel revealed the first verses of Quran in Cave Hira. He preached Islam for 13 years in Mecca, facing persecution. He migrated to Madinah (Hijra) and established the first Islamic state. He fought defensive battles, conquered Mecca peacefully, and delivered the Farewell Sermon. He received the Quran over 23 years and completed the message of Islam. He is the final prophet, sent as mercy to all worlds, and his example (Sunnah) guides Muslims till the end of time.`,
    miracles: ["The Quran - the greatest eternal miracle", "Splitting of the moon", "Isra and Mi'raj (Night Journey)", "Water flowing from fingers", "Food multiplication", "Stones praising Allah in his hand", "Tree trunk crying when he left it", "Healing the sick", "Prophecies that came true"],
    teachings: ["Complete monotheism", "Mercy to all creation", "Justice and equality", "Good character", "Seeking knowledge", "Forgiveness over revenge", "Honesty and trustworthiness"],
    verses: ["And We have not sent you, [O Muhammad], except as a mercy to the worlds. (21:107)", "Indeed, in the Messenger of Allah you have an excellent example... (33:21)"],
    lessons: ["Follow the perfect example", "Mercy to all", "Patience in adversity", "Forgiveness at victory", "Stand for justice"],
    timeline: [
      { year: "570 CE", event: "Born in Mecca" },
      { year: "610 CE", event: "First revelation in Cave Hira" },
      { year: "615 CE", event: "First migration to Abyssinia" },
      { year: "619 CE", event: "Year of Sorrow" },
      { year: "620 CE", event: "Isra and Mi'raj" },
      { year: "622 CE", event: "Hijrah to Madinah" },
      { year: "624 CE", event: "Battle of Badr" },
      { year: "628 CE", event: "Treaty of Hudaybiyyah" },
      { year: "630 CE", event: "Conquest of Mecca" },
      { year: "632 CE", event: "Farewell Pilgrimage and passing" }
    ],
    color: "from-amber-400 to-yellow-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  }
];

// ==================== TRAITS DATA ====================
const ALL_TRAITS = [
  { name: 'Grateful', color: '#10B981', icon: '🙏', description: 'Thankful and appreciative of blessings' },
  { name: 'Peaceful', color: '#06B6D4', icon: '🕊️', description: 'Inner calm and serenity' },
  { name: 'Hopeful', color: '#F59E0B', icon: '🌅', description: 'Optimistic about the future' },
  { name: 'Compassionate', color: '#EC4899', icon: '🤗', description: 'Caring and empathetic towards others' },
  { name: 'Reflective', color: '#8B5CF6', icon: '💭', description: 'Deep thinker and contemplative' },
  { name: 'Patient', color: '#059669', icon: '🌿', description: 'Enduring hardship with grace' },
  { name: 'Forgiving', color: '#EF4444', icon: '🤲', description: 'Willing to forgive others' },
  { name: 'Trusting', color: '#06B6D4', icon: '🤝', description: 'Complete reliance on Allah' }
];

const ALL_STRENGTHS = [
  { name: 'Quran Connection', icon: '📖' }, { name: 'Salah Consistency', icon: '🕌' },
  { name: 'Dhikr Practice', icon: '📿' }, { name: 'Charity & Giving', icon: '🎁' },
  { name: 'Knowledge Seeking', icon: '📚' }, { name: 'Good Character', icon: '💝' }
];

const ALL_SURAHS = [
  { name: 'Al-Fatiha', number: 1, benefit: 'The Opening - Cure for all ailments' },
  { name: 'Ya-Sin', number: 36, benefit: 'The heart of the Quran' },
  { name: 'Ar-Rahman', number: 55, benefit: 'Gratitude for blessings' },
  { name: 'Al-Mulk', number: 67, benefit: 'Protection in grave' },
  { name: 'Al-Ikhlas', number: 112, benefit: 'Pure monotheism' },
  { name: 'Al-Falaq', number: 113, benefit: 'Protection from evil' },
  { name: 'An-Nas', number: 114, benefit: 'Protection from whispers' }
];

const GROWTH_AREAS = [
  { name: 'Patience', icon: '🌿' }, { name: 'Gratitude', icon: '🙏' },
  { name: 'Trust in Allah', icon: '🤝' }, { name: 'Forgiveness', icon: '💝' }
];

// ==================== PROPHET CARD COMPONENT ====================
const ProphetCard = ({ prophet, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(prophet)}
      className="cursor-pointer bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-emerald-200"
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">{prophet.image}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm">{prophet.name}</h3>
          <p className="text-emerald-600 text-xs font-arabic mb-1">{prophet.nameAr}</p>
          <p className="text-gray-400 text-xs truncate">{prophet.title}</p>
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{prophet.description}</p>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-medium">
            <span>Read Full Story</span>
            <FiChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== PROPHET MODAL COMPONENT ====================
const ProphetModal = ({ prophet, onClose }) => {
  const [activeTab, setActiveTab] = useState('story');

  if (!prophet) return null;

  const tabs = [
    { id: 'story', label: 'Story', icon: FiBookOpen },
    { id: 'miracles', label: 'Miracles', icon: FiStar },
    { id: 'teachings', label: 'Teachings', icon: FiCompass },
    { id: 'lessons', label: 'Lessons', icon: FiTarget },
    { id: 'timeline', label: 'Timeline', icon: FiClock }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition z-10 bg-white shadow-sm">
          <FiX size={18} className="text-gray-500" />
        </button>

        <div className={`bg-gradient-to-r ${prophet.color} rounded-t-2xl text-center p-6 text-white`}>
          <div className="text-5xl mb-2">{prophet.image}</div>
          <h2 className="text-2xl font-bold">{prophet.name}</h2>
          <p className="text-white/80 text-lg font-arabic">{prophet.nameAr}</p>
          <p className="text-white/70 text-sm mt-1">{prophet.title}</p>
        </div>

        <div className="flex flex-wrap gap-1 p-3 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={12} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'story' && (
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed text-sm">{prophet.fullStory}</p>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <h4 className="font-semibold text-emerald-800 text-sm mb-2">📜 Key Quranic Verse</h4>
                {prophet.verses.map((verse, idx) => (
                  <p key={idx} className="text-gray-700 italic text-xs mb-1">{verse}</p>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'miracles' && (
            <div className="grid gap-2">
              {prophet.miracles.map((miracle, idx) => (
                <div key={idx} className="p-3 bg-amber-50 rounded-lg flex items-center gap-3 border border-amber-100">
                  <span className="text-lg flex-shrink-0">✨</span>
                  <span className="text-gray-700 text-sm">{miracle}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'teachings' && (
            <div className="grid gap-2">
              {prophet.teachings.map((teaching, idx) => (
                <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-gray-700 text-sm">💡 {teaching}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="flex flex-wrap gap-2">
              {prophet.lessons.map((lesson, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-purple-50 rounded-full text-xs text-purple-700 border border-purple-100">
                  {lesson}
                </span>
              ))}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-0">
              {prophet.timeline.map((event, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-20 text-right flex-shrink-0">
                    <span className="text-emerald-600 font-semibold text-xs">{event.year}</span>
                  </div>
                  <div className="relative flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {idx < prophet.timeline.length - 1 && <div className="w-0.5 h-full bg-emerald-200 absolute top-3" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-gray-700 text-sm">{event.event}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <p className="text-center text-xs text-gray-500">Peace and blessings of Allah be upon all the prophets</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function SpiritualDNA() {
  const { userId, userData, addXP } = useUser();
  const { accessToken, isAuthenticated } = useQuranAuth();
  const [loading, setLoading] = useState(true);
  const [spiritualScore, setSpiritualScore] = useState(0);
  const [activeSection, setActiveSection] = useState('dna');
  const [selectedProphet, setSelectedProphet] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [userStats, setUserStats] = useState({
    reflections: 0,
    bookmarks: 0,
    streak: 0,
    xp: 0,
    level: 1
  });
  
  const [dnaData, setDnaData] = useState({
    dominantTraits: [],
    spiritualStrengths: [],
    recommendedSurahs: [],
    areasForGrowth: []
  });

  useEffect(() => {
    loadSpiritualDNA();
  }, []);

  const loadSpiritualDNA = () => {
    setLoading(true);
    
    const reflections = userData?.reflections?.length || 0;
    const bookmarks = userData?.bookmarks?.length || 0;
    const streak = userData?.streak || 0;
    const xp = userData?.xp || 0;
    
    const score = Math.min(100, Math.floor(
      reflections * 2.5 + 
      bookmarks * 1.5 + 
      streak * 2 + 
      xp / 10
    ));
    setSpiritualScore(score);
    
    setUserStats({
      reflections,
      bookmarks,
      streak,
      xp,
      level: Math.floor(xp / 100) + 1
    });
    
    let selectedTraits = [];
    if (score >= 70) {
      selectedTraits = ALL_TRAITS.filter(t => ['Grateful', 'Peaceful', 'Hopeful', 'Compassionate', 'Reflective'].includes(t.name));
    } else if (score >= 40) {
      selectedTraits = ALL_TRAITS.filter(t => ['Grateful', 'Peaceful', 'Hopeful', 'Compassionate'].includes(t.name));
    } else {
      selectedTraits = ALL_TRAITS.filter(t => ['Grateful', 'Patient'].includes(t.name));
    }
    
    const selectedStrengths = ALL_STRENGTHS.slice(0, 4);
    const selectedSurahs = ALL_SURAHS.slice(0, 4);
    const selectedGrowth = GROWTH_AREAS.slice(0, 3);
    
    setDnaData({
      dominantTraits: selectedTraits,
      spiritualStrengths: selectedStrengths,
      recommendedSurahs: selectedSurahs,
      areasForGrowth: selectedGrowth
    });
    
    setTimeout(() => setLoading(false), 500);
  };

  const refreshDNA = () => {
    setLoading(true);
    if (addXP) addXP(10);
    setTimeout(() => {
      loadSpiritualDNA();
      toast.success('✨ Spiritual DNA updated! +10 XP');
    }, 800);
  };

  const getSpiritualWeather = () => {
    const streak = userStats.streak;
    if (streak >= 7) return { icon: FiSun, message: 'Divine Light Shining', color: '#F59E0B', bg: 'bg-amber-50' };
    else if (streak >= 3) return { icon: FiWind, message: 'Breeze of Growth', color: '#06B6D4', bg: 'bg-cyan-50' };
    else if (userStats.reflections > 0) return { icon: FiCloud, message: 'Clouds of Reflection', color: '#8B5CF6', bg: 'bg-purple-50' };
    else return { icon: FiMoon, message: 'Beginning Your Journey', color: '#6B7280', bg: 'bg-gray-50' };
  };

  const weather = getSpiritualWeather();
  const filteredProphets = searchTerm 
    ? PROPHETS.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.nameAr.includes(searchTerm) ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : PROPHETS;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"
          />
          <p className="text-gray-500 text-sm">Analyzing your spiritual essence...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto pb-12 px-4"
    >
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className={`inline-flex items-center gap-2 ${weather.bg} px-4 py-2 rounded-full mb-4`}>
          <weather.icon style={{ color: weather.color }} size={14} />
          <span className="text-sm text-gray-600">{weather.message}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Spiritual DNA 🧬</h2>
        <p className="text-gray-500 text-sm">A unique reflection of your spiritual journey</p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveSection('dna')}
          className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
            activeSection === 'dna'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <FiActivity size={16} /> Spiritual DNA
        </button>
        <button
          onClick={() => setActiveSection('prophets')}
          className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
            activeSection === 'prophets'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <FiBookOpen size={16} /> Stories of Prophets
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* DNA Section */}
        {activeSection === 'dna' && (
          <motion.div 
            key="dna"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Spiritual Score Card */}
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"
            >
              <div className="relative inline-block">
                <svg className="w-32 h-32">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                  <motion.circle 
                    cx="64" 
                    cy="64" 
                    r="56" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                    animate={{ strokeDashoffset: `${2 * Math.PI * 56 * (1 - spiritualScore / 100)}` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    transform="rotate(-90 64 64)" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-3xl font-bold text-gray-900"
                    >
                      {spiritualScore}%
                    </motion.div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-800 font-semibold">Level {userStats.level} Seeker</p>
                <p className="text-gray-500 text-sm mt-1">{userStats.xp} XP total</p>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: FiHeart, label: 'Reflections', value: userStats.reflections, color: 'text-pink-500', bg: 'bg-pink-50' },
                { icon: FiBookmark, label: 'Bookmarks', value: userStats.bookmarks, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { icon: FiActivity, label: 'Streak', value: `${userStats.streak} days`, color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: FiAward, label: 'Level', value: userStats.level, color: 'text-amber-500', bg: 'bg-amber-50' }
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`${stat.bg} rounded-xl p-3 text-center`}
                >
                  <stat.icon className={`${stat.color} text-lg mx-auto mb-1`} />
                  <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Dominant Traits */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                <FiStar className="text-emerald-500" size={16} /> Your Dominant Traits
              </h3>
              <div className="flex flex-wrap gap-2">
                {dnaData.dominantTraits.map((trait, i) => (
                  <div key={i} className="px-3 py-1.5 rounded-lg" style={{ background: `${trait.color}15`, border: `1px solid ${trait.color}30` }}>
                    <span className="text-sm font-medium" style={{ color: trait.color }}>{trait.icon} {trait.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Surahs */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                <FiBookOpen className="text-emerald-500" size={16} /> Recommended Surahs
              </h3>
              <div className="space-y-2">
                {dnaData.recommendedSurahs.map((surah, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg hover:bg-emerald-50 transition">
                    <span className="font-medium text-gray-800 text-sm">{surah.name} ({surah.number})</span>
                    <span className="text-xs text-gray-500">{surah.benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Growth */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                <FiTarget className="text-emerald-500" size={16} /> Areas for Growth
              </h3>
              <div className="flex flex-wrap gap-2">
                {dnaData.areasForGrowth.map((area, i) => (
                  <span key={i} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600">{area.icon} {area.name}</span>
                ))}
              </div>
            </div>

            {/* Refresh Button */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={refreshDNA} 
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 transition text-sm font-medium"
            >
              <FiRefreshCw size={16} /> Refresh Spiritual DNA (+10 XP)
            </motion.button>
          </motion.div>
        )}

        {/* Prophets Section */}
        {activeSection === 'prophets' && (
          <motion.div 
            key="prophets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            {/* Hero */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 text-center border border-emerald-100"
            >
              <div className="text-4xl mb-2">📖</div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Stories of the Prophets</h2>
              <p className="text-gray-600 text-sm">Discover the inspiring lives of all 25 prophets mentioned in the Quran</p>
            </motion.div>

            {/* Search and Controls */}
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search prophets by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 transition"
                />
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}>
                  <FiGrid size={14} />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}>
                  <FiList size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 -mt-3">{filteredProphets.length} of 25 prophets</p>

            {/* Prophets Grid/List */}
            <motion.div 
              layout
              className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-2"}
            >
              <AnimatePresence>
                {filteredProphets.map((prophet) => (
                  <motion.div
                    key={prophet.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProphetCard prophet={prophet} onClick={setSelectedProphet} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProphets.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <p className="text-gray-400 text-sm">No prophets found matching "{searchTerm}"</p>
              </motion.div>
            )}

            {/* Footer Quote */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100"
            >
              <p className="text-emerald-600 text-xs mb-1">Featured Quranic Verse</p>
              <p className="text-gray-600 text-xs italic">"And each [story] We relate to you from the news of the messengers is that by which We make firm your heart..."</p>
              <p className="text-gray-400 text-[10px] mt-1">(Surah Hud, 11:120)</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prophet Modal */}
      <AnimatePresence>
        {selectedProphet && (
          <ProphetModal prophet={selectedProphet} onClose={() => setSelectedProphet(null)} />
        )}
      </AnimatePresence>

      <style>{`
        .font-arabic { 
          font-family: 'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Noto Naskh Arabic', serif; 
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </motion.div>
  );
}


import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const QuranAuthContext = createContext(null);

export function QuranAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimer = useRef(null);

  function saveTokens({ accessToken, refreshToken, expiresIn, user }) {
    if (accessToken) sessionStorage.setItem("qf_access_token", accessToken);
    if (refreshToken) localStorage.setItem("qf_refresh_token", refreshToken);
    if (expiresIn) {
      const expiresAt = Date.now() + expiresIn * 1000;
      sessionStorage.setItem("qf_expires_at", String(expiresAt));
    }
    if (user) localStorage.setItem("qf_user", JSON.stringify(user));
  }

  function clearTokens() {
    sessionStorage.removeItem("qf_access_token");
    sessionStorage.removeItem("qf_expires_at");
    localStorage.removeItem("qf_refresh_token");
    localStorage.removeItem("qf_user");
  }

  function loadStoredUser() {
    try {
      const raw = localStorage.getItem("qf_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  const silentRefresh = useCallback(async () => {
    const refreshToken = localStorage.getItem("qf_refresh_token");
    if (!refreshToken) return false;

    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error("Refresh failed");

      const data = await res.json();
      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
        expiresIn: data.expiresIn,
      });
      setAccessToken(data.accessToken);
      return true;
    } catch (err) {
      console.warn("Silent refresh failed:", err.message);
      clearTokens();
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const storedToken = sessionStorage.getItem("qf_access_token");
      const expiresAt = Number(sessionStorage.getItem("qf_expires_at") || "0");
      const storedUser = loadStoredUser();

      if (storedToken && expiresAt > Date.now() + 60000) {
        setAccessToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        const refreshed = await silentRefresh();
        if (refreshed) {
          setUser(loadStoredUser());
          setIsAuthenticated(true);
        }
      }
      setIsLoading(false);
    }
    init();
  }, []);

  const signIn = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/login-url");
      if (!res.ok) throw new Error("Failed to get login URL");
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Login redirect failed:", err.message);
      alert("Could not initiate sign in. Please try again.");
    }
  }, []);

  const signOut = useCallback(() => {
    clearTokens();
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
  }, []);

  const handleCallback = useCallback(async (code, state) => {
    const res = await fetch("/api/auth/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Token exchange failed");
    }

    const data = await res.json();

    saveTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      user: data.user,
    });

    setAccessToken(data.accessToken);
    setUser(data.user);
    setIsAuthenticated(true);

    return data.user;
  }, []);

  return (
    <QuranAuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
        login: signIn,
        logout: signOut,
        handleCallback,
      }}
    >
      {children}
    </QuranAuthContext.Provider>
  );
}

export function useQuranAuth() {
  const ctx = useContext(QuranAuthContext);
  if (!ctx) throw new Error("useQuranAuth must be used within QuranAuthProvider");
  return ctx;
}

// src/contexts/UserContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getProfile, addXP, updateStreak, getBookmarks, saveBookmark, removeBookmark, updateActivity, getReflections, saveReflection } from '../api/quranFoundationApi';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

// Constants for XP system
const XP_PER_LEVEL = 100;
const MAX_LEVEL = 50;

// Helper functions
const calculateLevel = (xp) => Math.min(MAX_LEVEL, Math.floor(xp / XP_PER_LEVEL) + 1);
const calculateXPProgress = (xp) => (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
const getLevelTitle = (level) => {
  if (level >= 50) return 'Wali';
  if (level >= 40) return 'Arif';
  if (level >= 30) return 'Salik';
  if (level >= 20) return 'Murid';
  if (level >= 10) return 'Talib';
  if (level >= 5) return 'Seeker';
  return 'Beginner';
};

// XP earning actions mapping
const XP_ACTIONS = {
  'verse_read': 5,
  'verse_bookmarked': 10,
  'reflection': 15,
  'emotion_reflection': 10,
  'daily_checkin': 20,
  'prophet_integrate': 15,
  'traits_refresh': 5,
  'share_reflection': 10,
  'like_community': 3,
  'comment_community': 5,
  'streak_7': 50,
  'streak_30': 200,
  'level_up': 0, // Bonus handled separately
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId] = useState('demo-user-123');
  const [loading, setLoading] = useState(true);
  const [xp, setXP] = useLocalStorage('user_xp', 0);
  const [level, setLevel] = useLocalStorage('user_level', 1);
  const [levelTitle, setLevelTitle] = useLocalStorage('user_level_title', 'Beginner');
  const [bookmarks, setBookmarks] = useLocalStorage('user_bookmarks', []);
  const [streak, setStreak] = useLocalStorage('user_streak', 0);
  const [lastActive, setLastActive] = useLocalStorage('last_active', null);
  const [reflections, setReflections] = useLocalStorage('user_reflections', []);
  const [patienceXP, setPatienceXP] = useLocalStorage('patience_xp', 0);
  const [patienceLevel, setPatienceLevel] = useLocalStorage('patience_level', 1);
  const [stats, setStats] = useLocalStorage('user_stats', {
    totalVersesRead: 0,
    totalReflections: 0,
    totalBookmarks: 0,
    totalShares: 0,
    totalLikes: 0,
    totalComments: 0,
    achievementsUnlocked: 0
  });

  // Update level whenever XP changes
  useEffect(() => {
    const newLevel = calculateLevel(xp);
    const newTitle = getLevelTitle(newLevel);
    
    if (newLevel !== level) {
      setLevel(newLevel);
      setLevelTitle(newTitle);
      
      // Level up bonus
      if (newLevel > level) {
        const bonusXP = newLevel * 50;
        setXP(prev => prev + bonusXP);
        // Store level up achievement
        const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        if (!achievements.includes(`level_${newLevel}`)) {
          achievements.push(`level_${newLevel}`);
          localStorage.setItem('achievements', JSON.stringify(achievements));
        }
      }
    }
  }, [xp, level, setLevel, setLevelTitle, setXP]);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const profile = await getProfile(userId);
      if (profile?.success && profile?.data) {
        setUser(profile.data);
        // Sync XP from backend if available
        if (profile.data.xp && profile.data.xp > xp) {
          setXP(profile.data.xp);
        }
      }
      
      const userBookmarks = await getBookmarks(userId);
      if (userBookmarks?.success && userBookmarks?.data) {
        setBookmarks(userBookmarks.data);
      }
      
      const userReflections = await getReflections(userId);
      if (userReflections?.success && userReflections?.data) {
        setReflections(userReflections.data);
      }
      
      const savedStreak = localStorage.getItem(`streak_${userId}`);
      if (savedStreak) {
        setStreak(parseInt(savedStreak));
      }
      
      // Load stats from localStorage
      const savedStats = localStorage.getItem(`stats_${userId}`);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
      
      // Load patience XP
      const savedPatienceXP = localStorage.getItem(`patience_xp_${userId}`);
      if (savedPatienceXP) {
        setPatienceXP(parseInt(savedPatienceXP));
        setPatienceLevel(Math.floor(parseInt(savedPatienceXP) / XP_PER_LEVEL) + 1);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Core XP addition function - use this across all screens
  const addUserXP = useCallback(async (amount, actionType = null) => {
    if (!amount || amount <= 0) return { xp: xp, level: level };
    
    const newXP = xp + amount;
    setXP(newXP);
    
    // Update stats based on action type
    if (actionType) {
      const newStats = { ...stats };
      switch (actionType) {
        case 'verse_read':
          newStats.totalVersesRead = (newStats.totalVersesRead || 0) + 1;
          break;
        case 'reflection':
          newStats.totalReflections = (newStats.totalReflections || 0) + 1;
          break;
        case 'verse_bookmarked':
          newStats.totalBookmarks = (newStats.totalBookmarks || 0) + 1;
          break;
        case 'share_reflection':
          newStats.totalShares = (newStats.totalShares || 0) + 1;
          break;
        default:
          break;
      }
      setStats(newStats);
      localStorage.setItem(`stats_${userId}`, JSON.stringify(newStats));
    }
    
    // Sync with backend
    try {
      await addXP(userId, amount);
    } catch (err) {
      console.warn('Could not sync XP to backend:', err.message);
    }
    
    // Show level up notification if needed
    const newLevel = calculateLevel(newXP);
    if (newLevel > level) {
      const title = getLevelTitle(newLevel);
      // Toast will be handled by the component
      return { xp: newXP, level: newLevel, leveledUp: true, newLevel: newLevel, newTitle: title };
    }
    
    return { xp: newXP, level: level, leveledUp: false };
  }, [xp, level, stats, userId, setXP, setLevel, setStats]);

  // Convenience methods for specific actions
  const addVerseReadXP = useCallback(async () => {
    return addUserXP(XP_ACTIONS.verse_read, 'verse_read');
  }, [addUserXP]);

  const addReflectionXP = useCallback(async () => {
    return addUserXP(XP_ACTIONS.reflection, 'reflection');
  }, [addUserXP]);

  const addBookmarkXP = useCallback(async () => {
    return addUserXP(XP_ACTIONS.verse_bookmarked, 'verse_bookmarked');
  }, [addUserXP]);

  const addProphetIntegrateXP = useCallback(async () => {
    return addUserXP(XP_ACTIONS.prophet_integrate, 'prophet_integrate');
  }, [addUserXP]);

  const addTraitsRefreshXP = useCallback(async () => {
    return addUserXP(XP_ACTIONS.traits_refresh, 'traits_refresh');
  }, [addUserXP]);

  const addShareXP = useCallback(async () => {
    return addUserXP(XP_ACTIONS.share_reflection, 'share_reflection');
  }, [addUserXP]);

  const addDailyCheckinXP = useCallback(async () => {
    return addUserXP(XP_ACTIONS.daily_checkin, 'daily_checkin');
  }, [addUserXP]);

  const addUserBookmark = async (bookmark) => {
    const newBookmark = { ...bookmark, id: Date.now(), savedAt: new Date().toISOString() };
    const newBookmarks = [...bookmarks, newBookmark];
    setBookmarks(newBookmarks);
    await saveBookmark(userId, bookmark.verseKey, bookmark.surahNumber, bookmark.verseNumber, bookmark.notes);
    await addBookmarkXP();
    return newBookmark;
  };

  const removeUserBookmark = async (bookmarkId) => {
    const newBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
    setBookmarks(newBookmarks);
    await removeBookmark(userId, bookmarkId);
  };

  const updateUserStreak = async () => {
    const today = new Date().toDateString();
    if (lastActive === today) return { streak, xp: 0 };
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = 1;
    let bonusXP = 0;
    
    if (lastActive === yesterday.toDateString()) {
      newStreak = streak + 1;
    }
    
    setStreak(newStreak);
    setLastActive(today);
    await updateStreak(userId);
    
    // Check for streak achievements
    if (newStreak === 7) {
      bonusXP = XP_ACTIONS.streak_7;
      await addUserXP(bonusXP, 'streak_7');
    } else if (newStreak === 30) {
      bonusXP = XP_ACTIONS.streak_30;
      await addUserXP(bonusXP, 'streak_30');
    } else {
      await addDailyCheckinXP();
    }
    
    return { streak: newStreak, xp: XP_ACTIONS.daily_checkin + bonusXP };
  };

  const addUserActivity = async (activityType, count = 1) => {
    await updateActivity(userId, activityType, count);
    const xpAmount = (XP_ACTIONS[activityType] || 5) * count;
    const result = await addUserXP(xpAmount, activityType);
    return result;
  };

  const addUserReflection = async (reflection) => {
    const newReflection = {
      id: Date.now(),
      ...reflection,
      createdAt: new Date().toISOString()
    };
    const newReflections = [...reflections, newReflection];
    setReflections(newReflections);
    await saveReflection(userId, reflection);
    const result = await addReflectionXP();
    return { reflection: newReflection, xpResult: result };
  };

  const getUserReflections = async () => {
    return { success: true, data: reflections };
  };

  // Add patience XP (for timeline feature)
  const addPatienceXP = useCallback(async (amount) => {
    const newPatienceXP = patienceXP + amount;
    setPatienceXP(newPatienceXP);
    const newPatienceLevel = Math.floor(newPatienceXP / XP_PER_LEVEL) + 1;
    setPatienceLevel(newPatienceLevel);
    localStorage.setItem(`patience_xp_${userId}`, newPatienceXP);
    
    // Also add to main XP
    return addUserXP(amount, 'patience_earned');
  }, [patienceXP, userId, setPatienceXP, setPatienceLevel, addUserXP]);

  const value = {
    // User data
    user,
    setUser,
    loading,
    userId,
    
    // XP System
    xp,
    level,
    levelTitle,
    xpProgress: calculateXPProgress(xp),
    xpToNextLevel: XP_PER_LEVEL - (xp % XP_PER_LEVEL),
    xpPerLevel: XP_PER_LEVEL,
    maxLevel: MAX_LEVEL,
    calculateLevel,
    getLevelTitle,
    
    // Stats
    stats,
    bookmarks,
    streak,
    reflections,
    
    // Patience system
    patienceXP,
    patienceLevel,
    patienceProgress: calculateXPProgress(patienceXP),
    
    // User data combined
    userData: { 
      xp, 
      level, 
      levelTitle,
      streak, 
      reflections: reflections.length,
      bookmarks: bookmarks.length,
      stats,
      patienceXP,
      patienceLevel
    },
    
    // XP Actions - use these across all screens
    addXP: addUserXP,
    addVerseReadXP,
    addReflectionXP,
    addBookmarkXP,
    addProphetIntegrateXP,
    addTraitsRefreshXP,
    addShareXP,
    addDailyCheckinXP,
    addPatienceXP,
    
    // Other actions
    addBookmark: addUserBookmark,
    removeBookmark: removeUserBookmark,
    updateStreak: updateUserStreak,
    updateActivity: addUserActivity,
    addReflection: addUserReflection,
    getReflections: getUserReflections,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const readValue = () => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
};

import { useState, useCallback, useRef } from 'react';
import { getVerse, getTafsir, getTranslations } from '../api/quranBackendApi';
import toast from 'react-hot-toast';

export const useQuranApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchVerse = useCallback(async (surahNumber, verseNumber) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getVerse(surahNumber, verseNumber);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.name === 'AbortError' ? 'Request cancelled' : 'Failed to fetch verse';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTafsir = useCallback(async (surahNumber, verseNumber) => {
    setLoading(true);
    try {
      const result = await getTafsir(surahNumber, verseNumber);
      return result;
    } catch (err) {
      console.error('Tafsir error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTranslations = useCallback(async (surahNumber, verseNumber) => {
    setLoading(true);
    try {
      const result = await getTranslations(surahNumber, verseNumber);
      return result;
    } catch (err) {
      console.error('Translation error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFullVerse = useCallback(async (surahNumber, verseNumber) => {
    setLoading(true);
    setError(null);
    
    try {
      const [verse, tafsir, translations] = await Promise.all([
        getVerse(surahNumber, verseNumber),
        getTafsir(surahNumber, verseNumber),
        getTranslations(surahNumber, verseNumber)
      ]);
      
      const result = { verse, tafsir, translations };
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch Quran data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    data,
    fetchVerse,
    fetchTafsir,
    fetchTranslations,
    fetchFullVerse,
    clearData
  };
};

// src/pages/AuthCallback.jsx
// This page is the OAuth2 redirect target: /auth/callback
// It reads `code` and `state` from the URL, exchanges them for tokens,
// then redirects to the home page (LifeTimeline).

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuranAuth } from "../contexts/QuranAuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { handleCallback } = useQuranAuth();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Completing sign in…");

  useEffect(() => {
    async function exchange() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const oauthError = params.get("error");

      if (oauthError) {
        setError(`Sign in was cancelled or denied: ${params.get("error_description") || oauthError}`);
        return;
      }

      if (!code || !state) {
        setError("Missing authorization code or state. Please try signing in again.");
        return;
      }

      try {
        setStatus("Verifying your account…");
        await handleCallback(code, state);
        setStatus("Success! Redirecting…");
        // Redirect to LifeTimeline (home) after successful sign in
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Callback error:", err.message);
        setError(err.message || "Sign in failed. Please try again.");
      }
    }

    exchange();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold mb-2 text-red-400">Sign In Failed</h1>
          <p className="text-gray-300 mb-6 text-sm">{error}</p>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="w -12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-300 text-sm">{status}</p>
      </div>
    </div>
  );
}

// Format date to readable string
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time ago
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'just now';
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate random ID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Debounce function for search
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Get Arabic numerals
export const toArabicNumerals = (number) => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return number.toString().replace(/\d/g, (d) => arabicNumerals[d]);
};

// Get English numerals from Arabic
export const fromArabicNumerals = (str) => {
  const map = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  return str.replace(/[٠-٩]/g, (d) => map[d]);
};

// Shuffle array
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get random item from array
export const randomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Save to localStorage with expiry
export const setWithExpiry = (key, value, ttl) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl
  };
  localStorage.setItem(key, JSON.stringify(item));
};

// Get from localStorage with expiry check
export const getWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  
  const item = JSON.parse(itemStr);
  const now = new Date();
  
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  
  return item.value;
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// Download as JSON
export const downloadJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// Get Surah name in Arabic
export const getSurahArabicName = (surahNumber) => {
  const surahNames = {
    1: 'الفاتحة', 2: 'البقرة', 3: 'آل عمران', 4: 'النساء', 5: 'المائدة',
    6: 'الأنعام', 7: 'الأعراف', 8: 'الأنفال', 9: 'التوبة', 10: 'يونس',
    11: 'هود', 12: 'يوسف', 13: 'الرعد', 14: 'إبراهيم', 15: 'الحجر',
    16: 'النحل', 17: 'الإسراء', 18: 'الكهف', 19: 'مريم', 20: 'طه',
    21: 'الأنبياء', 22: 'الحج', 23: 'المؤمنون', 24: 'النور', 25: 'الفرقان',
    26: 'الشعراء', 27: 'النمل', 28: 'القصص', 29: 'العنكبوت', 30: 'الروم',
    31: 'لقمان', 32: 'السجدة', 33: 'الأحزاب', 34: 'سبأ', 35: 'فاطر',
    36: 'يس', 37: 'الصافات', 38: 'ص', 39: 'الزمر', 40: 'غافر',
    41: 'فصلت', 42: 'الشورى', 43: 'الزخرف', 44: 'الدخان', 45: 'الجاثية',
    46: 'الأحقاف', 47: 'محمد', 48: 'الفتح', 49: 'الحجرات', 50: 'ق',
    51: 'الذاريات', 52: 'الطور', 53: 'النجم', 54: 'القمر', 55: 'الرحمن',
    56: 'الواقعة', 57: 'الحديد', 58: 'المجادلة', 59: 'الحشر', 60: 'الممتحنة',
    61: 'الصف', 62: 'الجمعة', 63: 'المنافقون', 64: 'التغابن', 65: 'الطلاق',
    66: 'التحريم', 67: 'الملك', 68: 'القلم', 69: 'الحاقة', 70: 'المعارج',
    71: 'نوح', 72: 'الجن', 73: 'المزمل', 74: 'المدثر', 75: 'القيامة',
    76: 'الإنسان', 77: 'المرسلات', 78: 'النبأ', 79: 'النازعات', 80: 'عبس',
    81: 'التكوير', 82: 'الإنفطار', 83: 'المطففين', 84: 'الإنشقاق', 85: 'البروج',
    86: 'الطارق', 87: 'الأعلى', 88: 'الغاشية', 89: 'الفجر', 90: 'البلد',
    91: 'الشمس', 92: 'الليل', 93: 'الضحى', 94: 'الشرح', 95: 'التين',
    96: 'العلق', 97: 'القدر', 98: 'البينة', 99: 'الزلزلة', 100: 'العاديات',
    101: 'القارعة', 102: 'التكاثر', 103: 'العصر', 104: 'الهمزة', 105: 'الفيل',
    106: 'قريش', 107: 'الماعون', 108: 'الكوثر', 109: 'الكافرون', 110: 'النصر',
    111: 'المسد', 112: 'الإخلاص', 113: 'الفلق', 114: 'الناس'
  };
  return surahNames[surahNumber] || '';
};

// Get Juz (Para) from Ayah
export const getJuzFromAyah = (surahNumber, verseNumber) => {
  // Simplified Juz mapping (you can expand this)
  const juzBoundaries = {
    1: { surah: 1, verse: 1 },
    2: { surah: 2, verse: 142 },
    // ... add more boundaries
  };
  
  for (let i = 1; i <= 30; i++) {
    if (juzBoundaries[i] && (
      surahNumber > juzBoundaries[i].surah ||
      (surahNumber === juzBoundaries[i].surah && verseNumber >= juzBoundaries[i].verse)
    )) {
      return i;
    }
  }
  return 1;
};

.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}
/* ============================================ */
/* CRITICAL NAVBAR FIXES - DO NOT REMOVE */
/* ============================================ */

/* Ensure navbar has proper background */
nav {
  background-color: rgba(10, 11, 26, 0.95) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Fix for main content - ensure it starts below navbar */
main {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

/* Ensure body has no extra padding */
body {
  padding-top: 0 !important;
  margin: 0 !important;
}

/* Fix for welcome banner positioning */
.fixed.top-\[72px\] {
  top: 72px !important;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .h-\[72px\] {
    height: 68px !important;
  }
  
  nav .container {
    padding-top: 10px;
    padding-bottom: 10px;
  }
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiX, FiStar } from 'react-icons/fi';
import Navigation from './components/Navigation';
import LifeTimeline from './components/LifeTimeline';
import EmotionMirror from './components/EmotionMirror';
import QuranBrowser from './components/QuranBrowser';
import SpiritualDNA from './components/SpiritualDNA';
import CommunityHub from './components/CommunityHub';
import QuranJourney from './components/QuranLifeCompanion';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import AuthCallback from './pages/AuthCallback';
import { useUser } from './contexts/UserContext';
import { useQuranAuth } from './contexts/QuranAuthContext';

function AppContent() {
  const [currentView, setCurrentView] = useState('timeline');
  const [showWelcome, setShowWelcome] = useState(true);
  const { userId, userData, updateStreak, loading } = useUser();
  const { isAuthenticated, user } = useQuranAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const safeUserData = {
    streak: userData?.streak || 0,
    level: userData?.level || 1,
    xp: userData?.xp || 0,
    reflections: userData?.reflections || [],
  };

  // Handle route-based navigation
  useEffect(() => {
    const path = location.pathname.substring(1);
    if (path && path !== 'auth/callback') {
      setCurrentView(path);
    } else if (location.pathname === '/') {
      setCurrentView('timeline');
    }
  }, [location]);

  const handleViewChange = (view) => {
    setCurrentView(view);
    navigate(`/${view === 'timeline' ? '' : view}`);
  };

  useEffect(() => {
    if (userId) updateStreak();
    const timer = setTimeout(() => setShowWelcome(false), 4000);
    if (!loading && userId && safeUserData.streak > 0) {
      toast.success(`Welcome back! ${safeUserData.streak} day streak`, {
        icon: '🔥',
        duration: 3000,
        style: { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' },
      });
    }
    return () => clearTimeout(timer);
  }, [userId, loading]);

  // Show welcome message when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success(`Welcome ${user.name || 'Brother/Sister'}! May Allah bless your journey.`, {
        icon: '🌟',
        duration: 4000,
        style: { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' },
      });
    }
  }, [isAuthenticated, user]);

  const renderView = () => {
    switch (currentView) {
      case 'timeline': return <LifeTimeline userId={userId} />;
      case 'mirror': return <EmotionMirror userId={userId} />;
      case 'quran': return <QuranBrowser userId={userId} />;
      case 'journey': return <QuranJourney userId={userId} />;
      case 'dna': return <SpiritualDNA userId={userId} />;
      case 'analytics': return <AdvancedAnalytics userId={userId} />;
      case 'community': return <CommunityHub userId={userId} />;
      default: return <LifeTimeline userId={userId} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation 
        currentView={currentView} 
        setCurrentView={handleViewChange} 
        userData={safeUserData} 
      />

      {/* Welcome Banner - positioned directly after navbar */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiStar className="text-white/80" size={16} />
                  <span className="text-sm font-medium">Welcome to Echoes of Jannah</span>
                </div>
                <button 
                  onClick={() => setShowWelcome(false)} 
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT - with top spacing */}
      <main className="flex-grow pt-6 md:pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white w-full mt-auto">
        <div className="px-4 sm:px-6 py-10 md:py-12 max-w-7xl mx-auto">
          {/* Logo & Brand Section */}
          <div className="flex flex-col items-center text-center mb-8 md:mb-10">
            {/* Logo Image from public folder */}
            <img 
              src="/logo.png" 
              alt="Echoes of Jannah Logo" 
              className="h-12 md:h-16 w-auto mb-3 object-contain"
            />
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-2 bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
              Echoes of Jannah
            </h2>
            <p className="text-gray-400 text-xs md:text-sm max-w-2xl mx-auto">
              Pakistan's leading spiritual wellness platform connecting hearts with the timeless wisdom of the Quran.
            </p>
          </div>

          {/* Footer Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-10">
            {/* Quick Links */}
            <div>
              <h4 className="font-bold uppercase text-[11px] tracking-wider text-emerald-400 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/" className="hover:text-emerald-400 transition-colors block">Home</a></li>
                <li><a href="/mirror" className="hover:text-emerald-400 transition-colors block">Heart Mirror</a></li>
                <li><a href="/quran" className="hover:text-emerald-400 transition-colors block">Holy Quran</a></li>
                <li><a href="/journey" className="hover:text-emerald-400 transition-colors block">Life Companion</a></li>
                <li><a href="/dna" className="hover:text-emerald-400 transition-colors block">Spiritual DNA</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold uppercase text-[11px] tracking-wider text-emerald-400 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/blog" className="hover:text-emerald-400 transition-colors block">Blog</a></li>
                <li><a href="/reflections" className="hover:text-emerald-400 transition-colors block">Reflections</a></li>
                <li><a href="/analytics" className="hover:text-emerald-400 transition-colors block">Analytics</a></li>
                <li><a href="/community" className="hover:text-emerald-400 transition-colors block">Community Events</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold uppercase text-[11px] tracking-wider text-emerald-400 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/help" className="hover:text-emerald-400 transition-colors block">Help Center</a></li>
                <li><a href="/contact" className="hover:text-emerald-400 transition-colors block">Contact Us</a></li>
                <li><a href="/privacy" className="hover:text-emerald-400 transition-colors block">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-emerald-400 transition-colors block">Terms of Service</a></li>
              </ul>
            </div>

            {/* Stay Updated */}
            <div>
              <h4 className="font-bold uppercase text-[11px] tracking-wider text-emerald-400 mb-4">Stay Updated</h4>
              <p className="text-sm text-gray-400 mb-3">Subscribe for spiritual insights</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="px-3 py-2 bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-500 flex-1"
                />
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition text-sm font-semibold whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Echoes of Jannah. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={<AppContent />} />
    </Routes>
  );
}

export default App;

@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    scroll-behavior: smooth;
  }
  
  body {
    background-color: #ffffff;
    color: #111827;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* Minimal scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }

  ::selection {
    background-color: #d1fae5;
    color: #064e3b;
  }
}

@layer components {
  /* Clean card */
  .card {
    background-color: #ffffff;
    border: 1px solid #f3f4f6;
    border-radius: 1rem;
    transition: all 0.2s ease;
  }
  
  .card-hover:hover {
    border-color: #e5e7eb;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  }

  /* Primary button - emerald */
  .btn-primary {
    background-color: #059669;
    color: white;
    font-weight: 500;
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
    font-size: 0.875rem;
  }
  
  .btn-primary:hover {
    background-color: #047857;
  }
  
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Secondary button - outline */
  .btn-secondary {
    background-color: white;
    border: 1px solid #e5e7eb;
    color: #374151;
    font-weight: 500;
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    font-size: 0.875rem;
  }
  
  .btn-secondary:hover {
    border-color: #d1d5db;
    background-color: #f9fafb;
  }

  /* Minimal input */
  .input-minimal {
    width: 100%;
    padding: 0.625rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    color: #111827;
    font-size: 0.875rem;
  }
  
  .input-minimal:focus {
    outline: none;
    ring: 2px solid #10b981;
    border-color: #10b981;
  }
  
  .input-minimal::placeholder {
    color: #9ca3af;
  }
}

/* Utility */
.container-clean {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { UserProvider } from './contexts/UserContext'
import { QuranAuthProvider } from './contexts/QuranAuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <QuranAuthProvider>
          <UserProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                },
                success: {
                  icon: '✅',
                  style: {
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#166534',
                  },
                },
                error: {
                  icon: '❌',
                  style: {
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                  },
                },
              }}
            />
            <App />
          </UserProvider>
        </QuranAuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)

// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.quran.com/api/v4',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    })
  );
};

VITE_QF_CLIENT_ID=911c5b21-975f-4610-be81-f7158e7e6047
VITE_QF_API_BASE=https://apis-prelive.quran.foundation
VITE_QF_AUTH_BASE=https://prelive-oauth2.quran.foundation
VITE_QF_REDIRECT_URI=http://localhost:3000/auth/callback

QF_CLIENT_ID=911c5b21-975f-4610-be81-f7158e7e6047
QF_CLIENT_SECRET=oESUyMXqqRSkQP8HBRmATrZlwp
QF_AUTH_BASE=https://prelive-oauth2.quran.foundation
QF_REDIRECT_URI=http://localhost:3000/auth/callback
PORT=3001

# ============================================================
#  ROOT .env.local  →  place at: Echoes-Of-Jannah-main/.env.local
#  Vite loads this AFTER .env and it takes priority.
#  ⚠️  Never commit this file to git
# ============================================================

# ── LOCAL DEV OVERRIDES ──────────────────────────────────────
QF_REDIRECT_URI=http://localhost:5173/auth/callback
NODE_ENV=development
PORT=3001

# ── VITE FRONTEND ────────────────────────────────────────────
VITE_QF_CLIENT_ID=911c5b21-975f-4610-be81-f7158e7e6047
VITE_QF_API_BASE=https://apis-prelive.quran.foundation

# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
out/

# Environment variables
.env
.env.local
.env.*.local

# IDE files
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/

# Cache
.cache/
.vite/

# OS files
Thumbs.db
.DS_Store

# Secrets
*.pem
*.key
*.crt
.secrets/
.vercel
.env*.local


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

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Echoes of Jannah - Transform your relationship with the Quran" />
    <title>Echoes of Jannah</title>
    
    <!-- Preconnect for faster font loading -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    
    <!-- Google Fonts - Quran.com style fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;500;600;700&family=Amiri:wght@400;700&family=Lateef:wght@400;600&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
     <link href="https://fonts.googleapis.com/css2?family=Cormorant:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
     
    <style>
      /* Global font settings */
      * {
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
      }
      
      /* Arabic font stack matching Quran.com */
      .font-arabic, 
      [lang="ar"],
      .arabic-text {
        font-family: 'Scheherazade New', 'Amiri', 'Lateef', 'Noto Naskh Arabic', 'Traditional Arabic', 'Times New Roman', serif;
        font-weight: 400;
        line-height: 1.8;
      }
      
      /* English font */
      .font-english,
      .english-text {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }
      
      /* Better focus styles */
      :focus {
        outline: none;
      }
      
      :focus-visible {
        outline: 2px solid #10b981;
        outline-offset: 2px;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
      
      /* Selection color */
      ::selection {
        background-color: #10b98120;
        color: #065f46;
      }
      
      ::-moz-selection {
        background-color: #10b98120;
        color: #065f46;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

{
  "name": "echoes-of-jannah",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "echoes-of-jannah",
      "version": "1.0.0",
      "dependencies": {
        "axios": "^1.15.2",
        "cors": "^2.8.5",
        "express": "^4.21.0",
        "framer-motion": "^12.38.0",
        "lucide-react": "^1.11.0",
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "react-helmet-async": "^3.0.0",
        "react-hot-toast": "^2.6.0",
        "react-icons": "^5.6.0",
        "react-router-dom": "^6.30.3",
        "recharts": "^3.8.1"
      },
      "devDependencies": {
        "@vitejs/plugin-react": "^6.0.1",
        "autoprefixer": "^10.5.0",
        "postcss": "^8.5.10",
        "tailwindcss": "^3.4.19",
        "vite": "^8.0.10"
      }
    },
    "node_modules/@alloc/quick-lru": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.2.0.tgz",
      "integrity": "sha512-UrcABB+4bUrFABwbluTIBErXwvbsU/V7TZWfmbgJfbkwiBuziS9gxdODUyuiecfdGQ85jglMW6juS3+z5TsKLw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@emnapi/core": {
      "version": "1.10.0",
      "resolved": "https://registry.npmjs.org/@emnapi/core/-/core-1.10.0.tgz",
      "integrity": "sha512-yq6OkJ4p82CAfPl0u9mQebQHKPJkY7WrIuk205cTYnYe+k2Z8YBh11FrbRG/H6ihirqcacOgl2BIO8oyMQLeXw==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/wasi-threads": "1.2.1",
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@emnapi/runtime": {
      "version": "1.10.0",
      "resolved": "https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.10.0.tgz",
      "integrity": "sha512-ewvYlk86xUoGI0zQRNq/mC+16R1QeDlKQy21Ki3oSYXNgLb45GV1P6A0M+/s6nyCuNDqe5VpaY84BzXGwVbwFA==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@emnapi/wasi-threads": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/@emnapi/wasi-threads/-/wasi-threads-1.2.1.tgz",
      "integrity": "sha512-uTII7OYF+/Mes/MrcIOYp5yOtSMLBWSIoLPpcgwipoiKbli6k322tcoFsxoIIxPDqW01SQGAgko4EzZi2BNv2w==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@napi-rs/wasm-runtime": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/@napi-rs/wasm-runtime/-/wasm-runtime-1.1.4.tgz",
      "integrity": "sha512-3NQNNgA1YSlJb/kMH1ildASP9HW7/7kYnRI2szWJaofaS1hWmbGI4H+d3+22aGzXXN9IJ+n+GiFVcGipJP18ow==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@tybys/wasm-util": "^0.10.1"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/Brooooooklyn"
      },
      "peerDependencies": {
        "@emnapi/core": "^1.7.1",
        "@emnapi/runtime": "^1.7.1"
      }
    },
    "node_modules/@nodelib/fs.scandir": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
      "integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "2.0.5",
        "run-parallel": "^1.1.9"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.stat": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
      "integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.walk": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
      "integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.scandir": "2.1.5",
        "fastq": "^1.6.0"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@oxc-project/types": {
      "version": "0.127.0",
      "resolved": "https://registry.npmjs.org/@oxc-project/types/-/types-0.127.0.tgz",
      "integrity": "sha512-aIYXQBo4lCbO4z0R3FHeucQHpF46l2LbMdxRvqvuRuW2OxdnSkcng5B8+K12spgLDj93rtN3+J2Vac/TIO+ciQ==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/Boshen"
      }
    },
    "node_modules/@reduxjs/toolkit": {
      "version": "2.11.2",
      "resolved": "https://registry.npmjs.org/@reduxjs/toolkit/-/toolkit-2.11.2.tgz",
      "integrity": "sha512-Kd6kAHTA6/nUpp8mySPqj3en3dm0tdMIgbttnQ1xFMVpufoj+ADi8pXLBsd4xzTRHQa7t/Jv8W5UnCuW4kuWMQ==",
      "license": "MIT",
      "dependencies": {
        "@standard-schema/spec": "^1.0.0",
        "@standard-schema/utils": "^0.3.0",
        "immer": "^11.0.0",
        "redux": "^5.0.1",
        "redux-thunk": "^3.1.0",
        "reselect": "^5.1.0"
      },
      "peerDependencies": {
        "react": "^16.9.0 || ^17.0.0 || ^18 || ^19",
        "react-redux": "^7.2.1 || ^8.1.3 || ^9.0.0"
      },
      "peerDependenciesMeta": {
        "react": {
          "optional": true
        },
        "react-redux": {
          "optional": true
        }
      }
    },
    "node_modules/@reduxjs/toolkit/node_modules/immer": {
      "version": "11.1.4",
      "resolved": "https://registry.npmjs.org/immer/-/immer-11.1.4.tgz",
      "integrity": "sha512-XREFCPo6ksxVzP4E0ekD5aMdf8WMwmdNaz6vuvxgI40UaEiu6q3p8X52aU6GdyvLY3XXX/8R7JOTXStz/nBbRw==",
      "license": "MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/immer"
      }
    },
    "node_modules/@remix-run/router": {
      "version": "1.23.2",
      "resolved": "https://registry.npmjs.org/@remix-run/router/-/router-1.23.2.tgz",
      "integrity": "sha512-Ic6m2U/rMjTkhERIa/0ZtXJP17QUi2CbWE7cqx4J58M8aA3QTfW+2UlQ4psvTX9IO1RfNVhK3pcpdjej7L+t2w==",
      "license": "MIT",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@rolldown/binding-android-arm64": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.0.0-rc.17.tgz",
      "integrity": "sha512-s70pVGhw4zqGeFnXWvAzJDlvxhlRollagdCCKRgOsgUOH3N1l0LIxf83AtGzmb5SiVM4Hjl5HyarMRfdfj3DaQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-arm64": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.0.0-rc.17.tgz",
      "integrity": "sha512-4ksWc9n0mhlZpZ9PMZgTGjeOPRu8MB1Z3Tz0Mo02eWfWCHMW1zN82Qz/pL/rC+yQa+8ZnutMF0JjJe7PjwasYw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-x64": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.0.0-rc.17.tgz",
      "integrity": "sha512-SUSDOI6WwUVNcWxd02QEBjLdY1VPHvlEkw6T/8nYG322iYWCTxRb1vzk4E+mWWYehTp7ERibq54LSJGjmouOsw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-freebsd-x64": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.0.0-rc.17.tgz",
      "integrity": "sha512-hwnz3nw9dbJ05EDO/PvcjaaewqqDy7Y1rn1UO81l8iIK1GjenME75dl16ajbvSSMfv66WXSRCYKIqfgq2KCfxw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm-gnueabihf": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.0.0-rc.17.tgz",
      "integrity": "sha512-IS+W7epTcwANmFSQFrS1SivEXHtl1JtuQA9wlxrZTcNi6mx+FDOYrakGevvvTwgj2JvWiK8B29/qD9BELZPyXQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-gnu": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.0.0-rc.17.tgz",
      "integrity": "sha512-e6usGaHKW5BMNZOymS1UcEYGowQMWcgZ71Z17Sl/h2+ZziNJ1a9n3Zvcz6LdRyIW5572wBCTH/Z+bKuZouGk9Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-musl": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.0.0-rc.17.tgz",
      "integrity": "sha512-b/CgbwAJpmrRLp02RPfhbudf5tZnN9nsPWK82znefso832etkem8H7FSZwxrOI9djcdTP7U6YfNhbRnh7djErg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-ppc64-gnu": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.0.0-rc.17.tgz",
      "integrity": "sha512-4EII1iNGRUN5WwGbF/kOh/EIkoDN9HsupgLQoXfY+D1oyJm7/F4t5PYU5n8SWZgG0FEwakyM8pGgwcBYruGTlA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-s390x-gnu": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.0.0-rc.17.tgz",
      "integrity": "sha512-AH8oq3XqQo4IibpVXvPeLDI5pzkpYn0WiZAfT05kFzoJ6tQNzwRdDYQ45M8I/gslbodRZwW8uxLhbSBbkv96rA==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-gnu": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.0.0-rc.17.tgz",
      "integrity": "sha512-cLnjV3xfo7KslbU41Z7z8BH/E1y5mzUYzAqih1d1MDaIGZRCMqTijqLv76/P7fyHuvUcfGsIpqCdddbxLLK9rA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-musl": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.0.0-rc.17.tgz",
      "integrity": "sha512-0phclDw1spsL7dUB37sIARuis2tAgomCJXAHZlpt8PXZ4Ba0dRP1e+66lsRqrfhISeN9bEGNjQs+T/Fbd7oYGw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-openharmony-arm64": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.0.0-rc.17.tgz",
      "integrity": "sha512-0ag/hEgXOwgw4t8QyQvUCxvEg+V0KBcA6YuOx9g0r02MprutRF5dyljgm3EmR02O292UX7UeS6HzWHAl6KgyhA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-wasm32-wasi": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-wasm32-wasi/-/binding-wasm32-wasi-1.0.0-rc.17.tgz",
      "integrity": "sha512-LEXei6vo0E5wTGwpkJ4KoT3OZJRnglwldt5ziLzOlc6qqb55z4tWNq2A+PFqCJuvWWdP53CVhG1Z9NtToDPJrA==",
      "cpu": [
        "wasm32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/core": "1.10.0",
        "@emnapi/runtime": "1.10.0",
        "@napi-rs/wasm-runtime": "^1.1.4"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-arm64-msvc": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.0.0-rc.17.tgz",
      "integrity": "sha512-gUmyzBl3SPMa6hrqFUth9sVfcLBlYsbMzBx5PlexMroZStgzGqlZ26pYG89rBb45Mnia+oil6YAIFeEWGWhoZA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-x64-msvc": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.0.0-rc.17.tgz",
      "integrity": "sha512-3hkiolcUAvPB9FLb3UZdfjVVNWherN1f/skkGWJP/fgSQhYUZpSIRr0/I8ZK9TkF3F7kxvJAk0+IcKvPHk9qQg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.0-rc.7",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.0-rc.7.tgz",
      "integrity": "sha512-qujRfC8sFVInYSPPMLQByRh7zhwkGFS4+tyMQ83srV1qrxL4g8E2tyxVVyxd0+8QeBM1mIk9KbWxkegRr76XzA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@standard-schema/spec": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@standard-schema/spec/-/spec-1.1.0.tgz",
      "integrity": "sha512-l2aFy5jALhniG5HgqrD6jXLi/rUWrKvqN/qJx6yoJsgKhblVd+iqqU4RCXavm/jPityDo5TCvKMnpjKnOriy0w==",
      "license": "MIT"
    },
    "node_modules/@standard-schema/utils": {
      "version": "0.3.0",
      "resolved": "https://registry.npmjs.org/@standard-schema/utils/-/utils-0.3.0.tgz",
      "integrity": "sha512-e7Mew686owMaPJVNNLs55PUvgz371nKgwsc4vxE49zsODpJEnxgxRo2y/OKrqueavXgZNMDVj3DdHFlaSAeU8g==",
      "license": "MIT"
    },
    "node_modules/@tybys/wasm-util": {
      "version": "0.10.1",
      "resolved": "https://registry.npmjs.org/@tybys/wasm-util/-/wasm-util-0.10.1.tgz",
      "integrity": "sha512-9tTaPJLSiejZKx+Bmog4uSubteqTvFrVrURwkmHixBo0G4seD0zUxp98E1DzUBJxLQ3NPwXrGKDiVjwx/DpPsg==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@types/d3-array": {
      "version": "3.2.2",
      "resolved": "https://registry.npmjs.org/@types/d3-array/-/d3-array-3.2.2.tgz",
      "integrity": "sha512-hOLWVbm7uRza0BYXpIIW5pxfrKe0W+D5lrFiAEYR+pb6w3N2SwSMaJbXdUfSEv+dT4MfHBLtn5js0LAWaO6otw==",
      "license": "MIT"
    },
    "node_modules/@types/d3-color": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/@types/d3-color/-/d3-color-3.1.3.tgz",
      "integrity": "sha512-iO90scth9WAbmgv7ogoq57O9YpKmFBbmoEoCHDB2xMBY0+/KVrqAaCDyCE16dUspeOvIxFFRI+0sEtqDqy2b4A==",
      "license": "MIT"
    },
    "node_modules/@types/d3-ease": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/@types/d3-ease/-/d3-ease-3.0.2.tgz",
      "integrity": "sha512-NcV1JjO5oDzoK26oMzbILE6HW7uVXOHLQvHshBUW4UMdZGfiY6v5BeQwh9a9tCzv+CeefZQHJt5SRgK154RtiA==",
      "license": "MIT"
    },
    "node_modules/@types/d3-interpolate": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/@types/d3-interpolate/-/d3-interpolate-3.0.4.tgz",
      "integrity": "sha512-mgLPETlrpVV1YRJIglr4Ez47g7Yxjl1lj7YKsiMCb27VJH9W8NVM6Bb9d8kkpG/uAQS5AmbA48q2IAolKKo1MA==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-color": "*"
      }
    },
    "node_modules/@types/d3-path": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/@types/d3-path/-/d3-path-3.1.1.tgz",
      "integrity": "sha512-VMZBYyQvbGmWyWVea0EHs/BwLgxc+MKi1zLDCONksozI4YJMcTt8ZEuIR4Sb1MMTE8MMW49v0IwI5+b7RmfWlg==",
      "license": "MIT"
    },
    "node_modules/@types/d3-scale": {
      "version": "4.0.9",
      "resolved": "https://registry.npmjs.org/@types/d3-scale/-/d3-scale-4.0.9.tgz",
      "integrity": "sha512-dLmtwB8zkAeO/juAMfnV+sItKjlsw2lKdZVVy6LRr0cBmegxSABiLEpGVmSJJ8O08i4+sGR6qQtb6WtuwJdvVw==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-time": "*"
      }
    },
    "node_modules/@types/d3-shape": {
      "version": "3.1.8",
      "resolved": "https://registry.npmjs.org/@types/d3-shape/-/d3-shape-3.1.8.tgz",
      "integrity": "sha512-lae0iWfcDeR7qt7rA88BNiqdvPS5pFVPpo5OfjElwNaT2yyekbM0C9vK+yqBqEmHr6lDkRnYNoTBYlAgJa7a4w==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-path": "*"
      }
    },
    "node_modules/@types/d3-time": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/@types/d3-time/-/d3-time-3.0.4.tgz",
      "integrity": "sha512-yuzZug1nkAAaBlBBikKZTgzCeA+k1uy4ZFwWANOfKw5z5LRhV0gNA7gNkKm7HoK+HRN0wX3EkxGk0fpbWhmB7g==",
      "license": "MIT"
    },
    "node_modules/@types/d3-timer": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/@types/d3-timer/-/d3-timer-3.0.2.tgz",
      "integrity": "sha512-Ps3T8E8dZDam6fUyNiMkekK3XUsaUEik+idO9/YjPtfj2qruF8tFBXS7XhtE4iIXBLxhmLjP3SXpLhVf21I9Lw==",
      "license": "MIT"
    },
    "node_modules/@types/use-sync-external-store": {
      "version": "0.0.6",
      "resolved": "https://registry.npmjs.org/@types/use-sync-external-store/-/use-sync-external-store-0.0.6.tgz",
      "integrity": "sha512-zFDAD+tlpf2r4asuHEj0XH6pY6i0g5NeAHPn+15wk3BV6JA69eERFXC1gyGThDkVa1zCyKr5jox1+2LbV/AMLg==",
      "license": "MIT"
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-6.0.1.tgz",
      "integrity": "sha512-l9X/E3cDb+xY3SWzlG1MOGt2usfEHGMNIaegaUGFsLkb3RCn/k8/TOXBcab+OndDI4TBtktT8/9BwwW8Vi9KUQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rolldown/pluginutils": "1.0.0-rc.7"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "peerDependencies": {
        "@rolldown/plugin-babel": "^0.1.7 || ^0.2.0",
        "babel-plugin-react-compiler": "^1.0.0",
        "vite": "^8.0.0"
      },
      "peerDependenciesMeta": {
        "@rolldown/plugin-babel": {
          "optional": true
        },
        "babel-plugin-react-compiler": {
          "optional": true
        }
      }
    },
    "node_modules/accepts": {
      "version": "1.3.8",
      "resolved": "https://registry.npmjs.org/accepts/-/accepts-1.3.8.tgz",
      "integrity": "sha512-PYAthTa2m2VKxuvSD3DPC/Gy+U+sOA1LAuT8mkmRuvw+NACSaeXEQ+NHcVF7rONl6qcaxV3Uuemwawk+7+SJLw==",
      "license": "MIT",
      "dependencies": {
        "mime-types": "~2.1.34",
        "negotiator": "0.6.3"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/any-promise": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/any-promise/-/any-promise-1.3.0.tgz",
      "integrity": "sha512-7UvmKalWRt1wgjL1RrGxoSJW/0QZFIegpeGvZG9kjp8vrRu55XTHbwnqq2GpXm9uLbcuhxm3IqX9OB4MZR1b2A==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/anymatch": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/anymatch/-/anymatch-3.1.3.tgz",
      "integrity": "sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "normalize-path": "^3.0.0",
        "picomatch": "^2.0.4"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/arg": {
      "version": "5.0.2",
      "resolved": "https://registry.npmjs.org/arg/-/arg-5.0.2.tgz",
      "integrity": "sha512-PYjyFOLKQ9y57JvQ6QLo8dAgNqswh8M1RMJYdQduT6xbWSgK36P/Z/v+p888pM69jMMfS8Xd8F6I1kQ/I9HUGg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/array-flatten": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/array-flatten/-/array-flatten-1.1.1.tgz",
      "integrity": "sha512-PCVAQswWemu6UdxsDFFX/+gVeYqKAod3D3UVm91jHwynguOwAvYPhx8nNlM++NqRcK6CxxpUafjmhIdKiHibqg==",
      "license": "MIT"
    },
    "node_modules/asynckit": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/asynckit/-/asynckit-0.4.0.tgz",
      "integrity": "sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==",
      "license": "MIT"
    },
    "node_modules/autoprefixer": {
      "version": "10.5.0",
      "resolved": "https://registry.npmjs.org/autoprefixer/-/autoprefixer-10.5.0.tgz",
      "integrity": "sha512-FMhOoZV4+qR6aTUALKX2rEqGG+oyATvwBt9IIzVR5rMa2HRWPkxf+P+PAJLD1I/H5/II+HuZcBJYEFBpq39ong==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/autoprefixer"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "browserslist": "^4.28.2",
        "caniuse-lite": "^1.0.30001787",
        "fraction.js": "^5.3.4",
        "picocolors": "^1.1.1",
        "postcss-value-parser": "^4.2.0"
      },
      "bin": {
        "autoprefixer": "bin/autoprefixer"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      },
      "peerDependencies": {
        "postcss": "^8.1.0"
      }
    },
    "node_modules/axios": {
      "version": "1.15.2",
      "resolved": "https://registry.npmjs.org/axios/-/axios-1.15.2.tgz",
      "integrity": "sha512-wLrXxPtcrPTsNlJmKjkPnNPK2Ihe0hn0wGSaTEiHRPxwjvJwT3hKmXF4dpqxmPO9SoNb2FsYXj/xEo0gHN+D5A==",
      "license": "MIT",
      "dependencies": {
        "follow-redirects": "^1.15.11",
        "form-data": "^4.0.5",
        "proxy-from-env": "^2.1.0"
      }
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.10.21",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.10.21.tgz",
      "integrity": "sha512-Q+rUQ7Uz8AHM7DEaNdwvfFCTq7a43lNTzuS94eiWqwyxfV/wJv+oUivef51T91mmRY4d4A1u9rcSvkeufCVXlA==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.cjs"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/binary-extensions": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/binary-extensions/-/binary-extensions-2.3.0.tgz",
      "integrity": "sha512-Ceh+7ox5qe7LJuLHoY0feh3pHuUDHAcRUeyL2VYghZwfpkNIy/+8Ocg0a3UuSoYzavmylwuLWQOf3hl0jjMMIw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/body-parser": {
      "version": "1.20.4",
      "resolved": "https://registry.npmjs.org/body-parser/-/body-parser-1.20.4.tgz",
      "integrity": "sha512-ZTgYYLMOXY9qKU/57FAo8F+HA2dGX7bqGc71txDRC1rS4frdFI5R7NhluHxH6M0YItAP0sHB4uqAOcYKxO6uGA==",
      "license": "MIT",
      "dependencies": {
        "bytes": "~3.1.2",
        "content-type": "~1.0.5",
        "debug": "2.6.9",
        "depd": "2.0.0",
        "destroy": "~1.2.0",
        "http-errors": "~2.0.1",
        "iconv-lite": "~0.4.24",
        "on-finished": "~2.4.1",
        "qs": "~6.14.0",
        "raw-body": "~2.5.3",
        "type-is": "~1.6.18",
        "unpipe": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8",
        "npm": "1.2.8000 || >= 1.4.16"
      }
    },
    "node_modules/braces": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fill-range": "^7.1.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/browserslist": {
      "version": "4.28.2",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.28.2.tgz",
      "integrity": "sha512-48xSriZYYg+8qXna9kwqjIVzuQxi+KYWp2+5nCYnYKPTr0LvD89Jqk2Or5ogxz0NUMfIjhh2lIUX/LyX9B4oIg==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "baseline-browser-mapping": "^2.10.12",
        "caniuse-lite": "^1.0.30001782",
        "electron-to-chromium": "^1.5.328",
        "node-releases": "^2.0.36",
        "update-browserslist-db": "^1.2.3"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/bytes": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/bytes/-/bytes-3.1.2.tgz",
      "integrity": "sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/call-bound": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "get-intrinsic": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/camelcase-css": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/camelcase-css/-/camelcase-css-2.0.1.tgz",
      "integrity": "sha512-QOSvevhslijgYwRx6Rv7zKdMF8lbRmx+uQGx2+vDc+KI/eBnsy9kit5aj23AgGu3pa4t9AgwbnXWqS+iOY+2aA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001790",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001790.tgz",
      "integrity": "sha512-bOoxfJPyYo+ds6W0YfptaCWbFnJYjh2Y1Eow5lRv+vI2u8ganPZqNm1JwNh0t2ELQCqIWg4B3dWEusgAmsoyOw==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/chokidar": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/chokidar/-/chokidar-3.6.0.tgz",
      "integrity": "sha512-7VT13fmjotKpGipCW9JEQAusEPE+Ei8nl6/g4FBAmIm0GOOLMua9NDDo/DWp0ZAxCr3cPq5ZpBqmPAQgDda2Pw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "anymatch": "~3.1.2",
        "braces": "~3.0.2",
        "glob-parent": "~5.1.2",
        "is-binary-path": "~2.1.0",
        "is-glob": "~4.0.1",
        "normalize-path": "~3.0.0",
        "readdirp": "~3.6.0"
      },
      "engines": {
        "node": ">= 8.10.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/chokidar/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/clsx": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/clsx/-/clsx-2.1.1.tgz",
      "integrity": "sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/combined-stream": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/combined-stream/-/combined-stream-1.0.8.tgz",
      "integrity": "sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==",
      "license": "MIT",
      "dependencies": {
        "delayed-stream": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/commander": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/commander/-/commander-4.1.1.tgz",
      "integrity": "sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/content-disposition": {
      "version": "0.5.4",
      "resolved": "https://registry.npmjs.org/content-disposition/-/content-disposition-0.5.4.tgz",
      "integrity": "sha512-FveZTNuGw04cxlAiWbzi6zTAL/lhehaWbTtgluJh4/E95DqMwTmha3KZN1aAWA8cFIhHzMZUvLevkw5Rqk+tSQ==",
      "license": "MIT",
      "dependencies": {
        "safe-buffer": "5.2.1"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/content-type": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-1.0.5.tgz",
      "integrity": "sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/cookie": {
      "version": "0.7.2",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-0.7.2.tgz",
      "integrity": "sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/cookie-signature": {
      "version": "1.0.6",
      "resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.0.6.tgz",
      "integrity": "sha512-QADzlaHc8icV8I7vbaJXJwod9HWYp8uCqf1xa4OfNu1T7JVxQIrUgOWtHdNDtPiywmFbiS12VjotIXLrKM3orQ==",
      "license": "MIT"
    },
    "node_modules/cors": {
      "version": "2.8.6",
      "resolved": "https://registry.npmjs.org/cors/-/cors-2.8.6.tgz",
      "integrity": "sha512-tJtZBBHA6vjIAaF6EnIaq6laBBP9aq/Y3ouVJjEfoHbRBcHBAHYcMh/w8LDrk2PvIMMq8gmopa5D4V8RmbrxGw==",
      "license": "MIT",
      "dependencies": {
        "object-assign": "^4",
        "vary": "^1"
      },
      "engines": {
        "node": ">= 0.10"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/cssesc": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/cssesc/-/cssesc-3.0.0.tgz",
      "integrity": "sha512-/Tb/JcjK111nNScGob5MNtsntNM1aCNUDipB/TkwZFhyDrrE47SOx/18wF2bbjgc3ZzCSKW1T5nt5EbFoAz/Vg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "cssesc": "bin/cssesc"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "license": "MIT"
    },
    "node_modules/d3-array": {
      "version": "3.2.4",
      "resolved": "https://registry.npmjs.org/d3-array/-/d3-array-3.2.4.tgz",
      "integrity": "sha512-tdQAmyA18i4J7wprpYq8ClcxZy3SC31QMeByyCFyRt7BVHdREQZ5lpzoe5mFEYZUWe+oq8HBvk9JjpibyEV4Jg==",
      "license": "ISC",
      "dependencies": {
        "internmap": "1 - 2"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-color": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/d3-color/-/d3-color-3.1.0.tgz",
      "integrity": "sha512-zg/chbXyeBtMQ1LbD/WSoW2DpC3I0mpmPdW+ynRTj/x2DAWYrIY7qeZIHidozwV24m4iavr15lNwIwLxRmOxhA==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-ease": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-ease/-/d3-ease-3.0.1.tgz",
      "integrity": "sha512-wR/XK3D3XcLIZwpbvQwQ5fK+8Ykds1ip7A2Txe0yxncXSdq1L9skcG7blcedkOX+ZcgxGAmLX1FrRGbADwzi0w==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-format": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/d3-format/-/d3-format-3.1.2.tgz",
      "integrity": "sha512-AJDdYOdnyRDV5b6ArilzCPPwc1ejkHcoyFarqlPqT7zRYjhavcT3uSrqcMvsgh2CgoPbK3RCwyHaVyxYcP2Arg==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-interpolate": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-interpolate/-/d3-interpolate-3.0.1.tgz",
      "integrity": "sha512-3bYs1rOD33uo8aqJfKP3JWPAibgw8Zm2+L9vBKEHJ2Rg+viTR7o5Mmv5mZcieN+FRYaAOWX5SJATX6k1PWz72g==",
      "license": "ISC",
      "dependencies": {
        "d3-color": "1 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-path": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/d3-path/-/d3-path-3.1.0.tgz",
      "integrity": "sha512-p3KP5HCf/bvjBSSKuXid6Zqijx7wIfNW+J/maPs+iwR35at5JCbLUT0LzF1cnjbCHWhqzQTIN2Jpe8pRebIEFQ==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-scale": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/d3-scale/-/d3-scale-4.0.2.tgz",
      "integrity": "sha512-GZW464g1SH7ag3Y7hXjf8RoUuAFIqklOAq3MRl4OaWabTFJY9PN/E1YklhXLh+OQ3fM9yS2nOkCoS+WLZ6kvxQ==",
      "license": "ISC",
      "dependencies": {
        "d3-array": "2.10.0 - 3",
        "d3-format": "1 - 3",
        "d3-interpolate": "1.2.0 - 3",
        "d3-time": "2.1.1 - 3",
        "d3-time-format": "2 - 4"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-shape": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/d3-shape/-/d3-shape-3.2.0.tgz",
      "integrity": "sha512-SaLBuwGm3MOViRq2ABk3eLoxwZELpH6zhl3FbAoJ7Vm1gofKx6El1Ib5z23NUEhF9AsGl7y+dzLe5Cw2AArGTA==",
      "license": "ISC",
      "dependencies": {
        "d3-path": "^3.1.0"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-time": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/d3-time/-/d3-time-3.1.0.tgz",
      "integrity": "sha512-VqKjzBLejbSMT4IgbmVgDjpkYrNWUYJnbCGo874u7MMKIWsILRX+OpX/gTk8MqjpT1A/c6HY2dCA77ZN0lkQ2Q==",
      "license": "ISC",
      "dependencies": {
        "d3-array": "2 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-time-format": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/d3-time-format/-/d3-time-format-4.1.0.tgz",
      "integrity": "sha512-dJxPBlzC7NugB2PDLwo9Q8JiTR3M3e4/XANkreKSUxF8vvXKqm1Yfq4Q5dl8budlunRVlUUaDUgFt7eA8D6NLg==",
      "license": "ISC",
      "dependencies": {
        "d3-time": "1 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-timer": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-timer/-/d3-timer-3.0.1.tgz",
      "integrity": "sha512-ndfJ/JxxMd3nw31uyKoY2naivF+r29V+Lc0svZxe1JvvIRmi8hUsrMvdOwgS1o6uBHmiz91geQ0ylPP0aj1VUA==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/debug": {
      "version": "2.6.9",
      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
      "license": "MIT",
      "dependencies": {
        "ms": "2.0.0"
      }
    },
    "node_modules/decimal.js-light": {
      "version": "2.5.1",
      "resolved": "https://registry.npmjs.org/decimal.js-light/-/decimal.js-light-2.5.1.tgz",
      "integrity": "sha512-qIMFpTMZmny+MMIitAB6D7iVPEorVw6YQRWkvarTkT4tBeSLLiHzcwj6q0MmYSFCiVpiqPJTJEYIrpcPzVEIvg==",
      "license": "MIT"
    },
    "node_modules/delayed-stream": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/delayed-stream/-/delayed-stream-1.0.0.tgz",
      "integrity": "sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/depd": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",
      "integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/destroy": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/destroy/-/destroy-1.2.0.tgz",
      "integrity": "sha512-2sJGJTaXIIaR1w4iJSNoN0hnMY7Gpc/n8D4qSCJw8QqFWXf7cuAgnEHxBpweaVcPevC2l3KpjYCx3NypQQgaJg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8",
        "npm": "1.2.8000 || >= 1.4.16"
      }
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/didyoumean": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/didyoumean/-/didyoumean-1.2.2.tgz",
      "integrity": "sha512-gxtyfqMg7GKyhQmb056K7M3xszy/myH8w+B4RT+QXBQsvAOdc3XymqDDPHx1BgPgsdAA5SIifona89YtRATDzw==",
      "dev": true,
      "license": "Apache-2.0"
    },
    "node_modules/dlv": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/dlv/-/dlv-1.1.3.tgz",
      "integrity": "sha512-+HlytyjlPKnIG8XuRG8WvmBP8xs8P71y+SKKS6ZXWoEgLuePxtDoUEiH7WkdePWrQ5JBpE6aoVqfZfJUQkjXwA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/ee-first": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/ee-first/-/ee-first-1.1.1.tgz",
      "integrity": "sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==",
      "license": "MIT"
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.344",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.344.tgz",
      "integrity": "sha512-4MxfbmNDm+KPh066EZy+eUnkcDPcZ35wNmOWzFuh/ijvHsve6kbLTLURy88uCNK5FbpN+yk2nQY6BYh1GEt+wg==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/encodeurl": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-2.0.0.tgz",
      "integrity": "sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.1.tgz",
      "integrity": "sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-set-tostringtag": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz",
      "integrity": "sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-toolkit": {
      "version": "1.46.0",
      "resolved": "https://registry.npmjs.org/es-toolkit/-/es-toolkit-1.46.0.tgz",
      "integrity": "sha512-IToJ6ct9OLl5zz6WsC/1vZEwfSZ7Myil+ygl5Tf30Xjn9AEkzNB4kqp2G7VUJKF1DtTx/ra5M5KLlXvzOg51BA==",
      "license": "MIT",
      "workspaces": [
        "docs",
        "benchmarks"
      ]
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/escape-html": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz",
      "integrity": "sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==",
      "license": "MIT"
    },
    "node_modules/etag": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/etag/-/etag-1.8.1.tgz",
      "integrity": "sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/eventemitter3": {
      "version": "5.0.4",
      "resolved": "https://registry.npmjs.org/eventemitter3/-/eventemitter3-5.0.4.tgz",
      "integrity": "sha512-mlsTRyGaPBjPedk6Bvw+aqbsXDtoAyAzm5MO7JgU+yVRyMQ5O8bD4Kcci7BS85f93veegeCPkL8R4GLClnjLFw==",
      "license": "MIT"
    },
    "node_modules/express": {
      "version": "4.22.1",
      "resolved": "https://registry.npmjs.org/express/-/express-4.22.1.tgz",
      "integrity": "sha512-F2X8g9P1X7uCPZMA3MVf9wcTqlyNp7IhH5qPCI0izhaOIYXaW9L535tGA3qmjRzpH+bZczqq7hVKxTR4NWnu+g==",
      "license": "MIT",
      "dependencies": {
        "accepts": "~1.3.8",
        "array-flatten": "1.1.1",
        "body-parser": "~1.20.3",
        "content-disposition": "~0.5.4",
        "content-type": "~1.0.4",
        "cookie": "~0.7.1",
        "cookie-signature": "~1.0.6",
        "debug": "2.6.9",
        "depd": "2.0.0",
        "encodeurl": "~2.0.0",
        "escape-html": "~1.0.3",
        "etag": "~1.8.1",
        "finalhandler": "~1.3.1",
        "fresh": "~0.5.2",
        "http-errors": "~2.0.0",
        "merge-descriptors": "1.0.3",
        "methods": "~1.1.2",
        "on-finished": "~2.4.1",
        "parseurl": "~1.3.3",
        "path-to-regexp": "~0.1.12",
        "proxy-addr": "~2.0.7",
        "qs": "~6.14.0",
        "range-parser": "~1.2.1",
        "safe-buffer": "5.2.1",
        "send": "~0.19.0",
        "serve-static": "~1.16.2",
        "setprototypeof": "1.2.0",
        "statuses": "~2.0.1",
        "type-is": "~1.6.18",
        "utils-merge": "1.0.1",
        "vary": "~1.1.2"
      },
      "engines": {
        "node": ">= 0.10.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/fast-glob": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.3.tgz",
      "integrity": "sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "^2.0.2",
        "@nodelib/fs.walk": "^1.2.3",
        "glob-parent": "^5.1.2",
        "merge2": "^1.3.0",
        "micromatch": "^4.0.8"
      },
      "engines": {
        "node": ">=8.6.0"
      }
    },
    "node_modules/fast-glob/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/fastq": {
      "version": "1.20.1",
      "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.20.1.tgz",
      "integrity": "sha512-GGToxJ/w1x32s/D2EKND7kTil4n8OVk/9mycTc4VDza13lOvpUZTGX3mFSCtV9ksdGBVzvsyAVLM6mHFThxXxw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "reusify": "^1.0.4"
      }
    },
    "node_modules/fill-range": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "to-regex-range": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/finalhandler": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/finalhandler/-/finalhandler-1.3.2.tgz",
      "integrity": "sha512-aA4RyPcd3badbdABGDuTXCMTtOneUCAYH/gxoYRTZlIJdF0YPWuGqiAsIrhNnnqdXGswYk6dGujem4w80UJFhg==",
      "license": "MIT",
      "dependencies": {
        "debug": "2.6.9",
        "encodeurl": "~2.0.0",
        "escape-html": "~1.0.3",
        "on-finished": "~2.4.1",
        "parseurl": "~1.3.3",
        "statuses": "~2.0.2",
        "unpipe": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/follow-redirects": {
      "version": "1.16.0",
      "resolved": "https://registry.npmjs.org/follow-redirects/-/follow-redirects-1.16.0.tgz",
      "integrity": "sha512-y5rN/uOsadFT/JfYwhxRS5R7Qce+g3zG97+JrtFZlC9klX/W5hD7iiLzScI4nZqUS7DNUdhPgw4xI8W2LuXlUw==",
      "funding": [
        {
          "type": "individual",
          "url": "https://github.com/sponsors/RubenVerborgh"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=4.0"
      },
      "peerDependenciesMeta": {
        "debug": {
          "optional": true
        }
      }
    },
    "node_modules/form-data": {
      "version": "4.0.5",
      "resolved": "https://registry.npmjs.org/form-data/-/form-data-4.0.5.tgz",
      "integrity": "sha512-8RipRLol37bNs2bhoV67fiTEvdTrbMUYcFTiy3+wuuOnUog2QBHCZWXDRijWQfAkhBj2Uf5UnVaiWwA5vdd82w==",
      "license": "MIT",
      "dependencies": {
        "asynckit": "^0.4.0",
        "combined-stream": "^1.0.8",
        "es-set-tostringtag": "^2.1.0",
        "hasown": "^2.0.2",
        "mime-types": "^2.1.12"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/forwarded": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/forwarded/-/forwarded-0.2.0.tgz",
      "integrity": "sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/fraction.js": {
      "version": "5.3.4",
      "resolved": "https://registry.npmjs.org/fraction.js/-/fraction.js-5.3.4.tgz",
      "integrity": "sha512-1X1NTtiJphryn/uLQz3whtY6jK3fTqoE3ohKs0tT+Ujr1W59oopxmoEh7Lu5p6vBaPbgoM0bzveAW4Qi5RyWDQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "*"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/rawify"
      }
    },
    "node_modules/framer-motion": {
      "version": "12.38.0",
      "resolved": "https://registry.npmjs.org/framer-motion/-/framer-motion-12.38.0.tgz",
      "integrity": "sha512-rFYkY/pigbcswl1XQSb7q424kSTQ8q6eAC+YUsSKooHQYuLdzdHjrt6uxUC+PRAO++q5IS7+TamgIw1AphxR+g==",
      "license": "MIT",
      "dependencies": {
        "motion-dom": "^12.38.0",
        "motion-utils": "^12.36.0",
        "tslib": "^2.4.0"
      },
      "peerDependencies": {
        "@emotion/is-prop-valid": "*",
        "react": "^18.0.0 || ^19.0.0",
        "react-dom": "^18.0.0 || ^19.0.0"
      },
      "peerDependenciesMeta": {
        "@emotion/is-prop-valid": {
          "optional": true
        },
        "react": {
          "optional": true
        },
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/fresh": {
      "version": "0.5.2",
      "resolved": "https://registry.npmjs.org/fresh/-/fresh-0.5.2.tgz",
      "integrity": "sha512-zJ2mQYM18rEFOudeV4GShTGIQ7RbzA7ozbU9I/XBpm7kqgMywgmylMwXHxZJmkVoYkna9d2pVXVXPdYTP9ej8Q==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/glob-parent": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/goober": {
      "version": "2.1.18",
      "resolved": "https://registry.npmjs.org/goober/-/goober-2.1.18.tgz",
      "integrity": "sha512-2vFqsaDVIT9Gz7N6kAL++pLpp41l3PfDuusHcjnGLfR6+huZkl6ziX+zgVC3ZxpqWhzH6pyDdGrCeDhMIvwaxw==",
      "license": "MIT",
      "peerDependencies": {
        "csstype": "^3.0.10"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-tostringtag": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",
      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",
      "license": "MIT",
      "dependencies": {
        "has-symbols": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.3.tgz",
      "integrity": "sha512-ej4AhfhfL2Q2zpMmLo7U1Uv9+PyhIZpgQLGT1F9miIGmiCJIoCgSmczFdrc97mWT4kVY72KA+WnnhJ5pghSvSg==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/http-errors": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/http-errors/-/http-errors-2.0.1.tgz",
      "integrity": "sha512-4FbRdAX+bSdmo4AUFuS0WNiPz8NgFt+r8ThgNWmlrjQjt1Q7ZR9+zTlce2859x4KSXrwIsaeTqDoKQmtP8pLmQ==",
      "license": "MIT",
      "dependencies": {
        "depd": "~2.0.0",
        "inherits": "~2.0.4",
        "setprototypeof": "~1.2.0",
        "statuses": "~2.0.2",
        "toidentifier": "~1.0.1"
      },
      "engines": {
        "node": ">= 0.8"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/iconv-lite": {
      "version": "0.4.24",
      "resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.4.24.tgz",
      "integrity": "sha512-v3MXnZAcvnywkTUEZomIActle7RXXeedOR31wwl7VlyoXO4Qi9arvSenNQWne1TcRwhCL1HwLI21bEqdpj8/rA==",
      "license": "MIT",
      "dependencies": {
        "safer-buffer": ">= 2.1.2 < 3"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/immer": {
      "version": "10.2.0",
      "resolved": "https://registry.npmjs.org/immer/-/immer-10.2.0.tgz",
      "integrity": "sha512-d/+XTN3zfODyjr89gM3mPq1WNX2B8pYsu7eORitdwyA2sBubnTl3laYlBk4sXY5FUa5qTZGBDPJICVbvqzjlbw==",
      "license": "MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/immer"
      }
    },
    "node_modules/inherits": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
      "license": "ISC"
    },
    "node_modules/internmap": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/internmap/-/internmap-2.0.3.tgz",
      "integrity": "sha512-5Hh7Y1wQbvY5ooGgPbDaL5iYLAPzMTUrjMulskHLH6wnv/A+1q5rgEaiuqEjB+oxGXIVZs1FF+R/KPN3ZSQYYg==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/invariant": {
      "version": "2.2.4",
      "resolved": "https://registry.npmjs.org/invariant/-/invariant-2.2.4.tgz",
      "integrity": "sha512-phJfQVBuaJM5raOpJjSfkiD6BpbCE4Ns//LaXl6wGYtUBY83nWS6Rf9tXm2e8VaK60JEjYldbPif/A2B1C2gNA==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.0.0"
      }
    },
    "node_modules/ipaddr.js": {
      "version": "1.9.1",
      "resolved": "https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-1.9.1.tgz",
      "integrity": "sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/is-binary-path": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/is-binary-path/-/is-binary-path-2.1.0.tgz",
      "integrity": "sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "binary-extensions": "^2.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-core-module": {
      "version": "2.16.1",
      "resolved": "https://registry.npmjs.org/is-core-module/-/is-core-module-2.16.1.tgz",
      "integrity": "sha512-UfoeMA6fIJ8wTYFEUjelnaGI67v6+N7qXJEvQuIGa99l4xsCruSYOVSQ0uPANn4dAzm8lkYPaKLrrijLq7x23w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-number": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
      "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.12.0"
      }
    },
    "node_modules/jiti": {
      "version": "1.21.7",
      "resolved": "https://registry.npmjs.org/jiti/-/jiti-1.21.7.tgz",
      "integrity": "sha512-/imKNG4EbWNrVjoNC/1H5/9GFy+tqjGBHCaSsN+P2RnPqjsLmv6UD3Ej+Kj8nBWaRAwyk7kK5ZUc+OEatnTR3A==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jiti": "bin/jiti.js"
      }
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "license": "MIT"
    },
    "node_modules/lightningcss": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.32.0.tgz",
      "integrity": "sha512-NXYBzinNrblfraPGyrbPoD19C1h9lfI/1mzgWYvXUTe414Gz/X1FD2XBZSZM7rRTrMA8JL3OtAaGifrIKhQ5yQ==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.32.0",
        "lightningcss-darwin-arm64": "1.32.0",
        "lightningcss-darwin-x64": "1.32.0",
        "lightningcss-freebsd-x64": "1.32.0",
        "lightningcss-linux-arm-gnueabihf": "1.32.0",
        "lightningcss-linux-arm64-gnu": "1.32.0",
        "lightningcss-linux-arm64-musl": "1.32.0",
        "lightningcss-linux-x64-gnu": "1.32.0",
        "lightningcss-linux-x64-musl": "1.32.0",
        "lightningcss-win32-arm64-msvc": "1.32.0",
        "lightningcss-win32-x64-msvc": "1.32.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.32.0.tgz",
      "integrity": "sha512-YK7/ClTt4kAK0vo6w3X+Pnm0D2cf2vPHbhOXdoNti1Ga0al1P4TBZhwjATvjNwLEBCnKvjJc2jQgHXH0NEwlAg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.32.0.tgz",
      "integrity": "sha512-RzeG9Ju5bag2Bv1/lwlVJvBE3q6TtXskdZLLCyfg5pt+HLz9BqlICO7LZM7VHNTTn/5PRhHFBSjk5lc4cmscPQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.32.0.tgz",
      "integrity": "sha512-U+QsBp2m/s2wqpUYT/6wnlagdZbtZdndSmut/NJqlCcMLTWp5muCrID+K5UJ6jqD2BFshejCYXniPDbNh73V8w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.32.0.tgz",
      "integrity": "sha512-JCTigedEksZk3tHTTthnMdVfGf61Fky8Ji2E4YjUTEQX14xiy/lTzXnu1vwiZe3bYe0q+SpsSH/CTeDXK6WHig==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.32.0.tgz",
      "integrity": "sha512-x6rnnpRa2GL0zQOkt6rts3YDPzduLpWvwAF6EMhXFVZXD4tPrBkEFqzGowzCsIWsPjqSK+tyNEODUBXeeVHSkw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.32.0.tgz",
      "integrity": "sha512-0nnMyoyOLRJXfbMOilaSRcLH3Jw5z9HDNGfT/gwCPgaDjnx0i8w7vBzFLFR1f6CMLKF8gVbebmkUN3fa/kQJpQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.32.0.tgz",
      "integrity": "sha512-UpQkoenr4UJEzgVIYpI80lDFvRmPVg6oqboNHfoH4CQIfNA+HOrZ7Mo7KZP02dC6LjghPQJeBsvXhJod/wnIBg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.32.0.tgz",
      "integrity": "sha512-V7Qr52IhZmdKPVr+Vtw8o+WLsQJYCTd8loIfpDaMRWGUZfBOYEJeyJIkqGIDMZPwPx24pUMfwSxxI8phr/MbOA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.32.0.tgz",
      "integrity": "sha512-bYcLp+Vb0awsiXg/80uCRezCYHNg1/l3mt0gzHnWV9XP1W5sKa5/TCdGWaR/zBM2PeF/HbsQv/j2URNOiVuxWg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.32.0.tgz",
      "integrity": "sha512-8SbC8BR40pS6baCM8sbtYDSwEVQd4JlFTOlaD3gWGHfThTcABnNDBda6eTZeqbofalIJhFx0qKzgHJmcPTnGdw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.32.0.tgz",
      "integrity": "sha512-Amq9B/SoZYdDi1kFrojnoqPLxYhQ4Wo5XiL8EVJrVsB8ARoC1PWW6VGtT0WKCemjy8aC+louJnjS7U18x3b06Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lilconfig": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/lilconfig/-/lilconfig-3.1.3.tgz",
      "integrity": "sha512-/vlFKAoH5Cgt3Ie+JLhRbwOsCQePABiU3tJ1egGvyQ+33R/vcwM2Zl2QR/LzjsBeItPt3oSVXapn+m4nQDvpzw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/antonk52"
      }
    },
    "node_modules/lines-and-columns": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/lines-and-columns/-/lines-and-columns-1.2.4.tgz",
      "integrity": "sha512-7ylylesZQ/PV29jhEDl3Ufjo6ZX7gCqJr5F7PKrqc93v7fzSymt1BpwEU8nAUXs8qzzvqhbjhK5QZg6Mt/HkBg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/loose-envify": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
      "license": "MIT",
      "dependencies": {
        "js-tokens": "^3.0.0 || ^4.0.0"
      },
      "bin": {
        "loose-envify": "cli.js"
      }
    },
    "node_modules/lucide-react": {
      "version": "1.11.0",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-1.11.0.tgz",
      "integrity": "sha512-UOhjdztXCgdBReRcIhsvz2siIBogfv/lhJEIViCpLt924dO+GDms9T7DNoucI23s6kEPpe988m5N0D2ajnzb2g==",
      "license": "ISC",
      "peerDependencies": {
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/media-typer": {
      "version": "0.3.0",
      "resolved": "https://registry.npmjs.org/media-typer/-/media-typer-0.3.0.tgz",
      "integrity": "sha512-dq+qelQ9akHpcOl/gUVRTxVIOkAJ1wR3QAvb4RsVjS8oVoFjDGTc679wJYmUmknUF5HwMLOgb5O+a3KxfWapPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/merge-descriptors": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/merge-descriptors/-/merge-descriptors-1.0.3.tgz",
      "integrity": "sha512-gaNvAS7TZ897/rVaZ0nMtAyxNyi/pdbjbAwUpFQpN70GqnVfOiXpeUUMKRBmzXaSQ8DdTX4/0ms62r2K+hE6mQ==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/merge2": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
      "integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/methods": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/methods/-/methods-1.1.2.tgz",
      "integrity": "sha512-iclAHeNqNm68zFtnZ0e+1L2yUIdvzNoauKU4WBA3VvH/vPFieF7qfRlwUZU+DA9P9bPXIS90ulxoUoCH23sV2w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/micromatch": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
      "integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "braces": "^3.0.3",
        "picomatch": "^2.3.1"
      },
      "engines": {
        "node": ">=8.6"
      }
    },
    "node_modules/mime": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/mime/-/mime-1.6.0.tgz",
      "integrity": "sha512-x0Vn8spI+wuJ1O6S7gnbaQg8Pxh4NNHb7KSINmEWKiPE4RKOplvijn+NkmYmmRgP68mc70j2EbeTFRsrswaQeg==",
      "license": "MIT",
      "bin": {
        "mime": "cli.js"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/mime-db": {
      "version": "1.52.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime-types": {
      "version": "2.1.35",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "1.52.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/motion-dom": {
      "version": "12.38.0",
      "resolved": "https://registry.npmjs.org/motion-dom/-/motion-dom-12.38.0.tgz",
      "integrity": "sha512-pdkHLD8QYRp8VfiNLb8xIBJis1byQ9gPT3Jnh2jqfFtAsWUA3dEepDlsWe/xMpO8McV+VdpKVcp+E+TGJEtOoA==",
      "license": "MIT",
      "dependencies": {
        "motion-utils": "^12.36.0"
      }
    },
    "node_modules/motion-utils": {
      "version": "12.36.0",
      "resolved": "https://registry.npmjs.org/motion-utils/-/motion-utils-12.36.0.tgz",
      "integrity": "sha512-eHWisygbiwVvf6PZ1vhaHCLamvkSbPIeAYxWUuL3a2PD/TROgE7FvfHWTIH4vMl798QLfMw15nRqIaRDXTlYRg==",
      "license": "MIT"
    },
    "node_modules/ms": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
      "license": "MIT"
    },
    "node_modules/mz": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/mz/-/mz-2.7.0.tgz",
      "integrity": "sha512-z81GNO7nnYMEhrGh9LeymoE4+Yr0Wn5McHIZMK5cfQCl+NDX08sCZgUc9/6MHni9IWuFLm1Z3HTCXu2z9fN62Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0",
        "object-assign": "^4.0.1",
        "thenify-all": "^1.0.0"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.11",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.11.tgz",
      "integrity": "sha512-N8SpfPUnUp1bK+PMYW8qSWdl9U+wwNWI4QKxOYDy9JAro3WMX7p2OeVRF9v+347pnakNevPmiHhNmZ2HbFA76w==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/negotiator": {
      "version": "0.6.3",
      "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-0.6.3.tgz",
      "integrity": "sha512-+EUsqGPLsM+j/zdChZjsnX51g4XrHFOIXwfnCVPGlQk/k5giakcKsuxCObBRu6DSm9opw/O6slWbJdghQM4bBg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/node-releases": {
      "version": "2.0.38",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.38.tgz",
      "integrity": "sha512-3qT/88Y3FbH/Kx4szpQQ4HzUbVrHPKTLVpVocKiLfoYvw9XSGOX2FmD2d6DrXbVYyAQTF2HeF6My8jmzx7/CRw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/normalize-path": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/normalize-path/-/normalize-path-3.0.0.tgz",
      "integrity": "sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-hash": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/object-hash/-/object-hash-3.0.0.tgz",
      "integrity": "sha512-RSn9F68PjH9HqtltsSnqYC1XXoWe9Bju5+213R98cNGttag9q9yAOTzdbsqvIa7aNm5WffBZFpWYr2aWrklWAw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/object-inspect": {
      "version": "1.13.4",
      "resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",
      "integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/on-finished": {
      "version": "2.4.1",
      "resolved": "https://registry.npmjs.org/on-finished/-/on-finished-2.4.1.tgz",
      "integrity": "sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==",
      "license": "MIT",
      "dependencies": {
        "ee-first": "1.1.1"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/parseurl": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/parseurl/-/parseurl-1.3.3.tgz",
      "integrity": "sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/path-parse": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz",
      "integrity": "sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/path-to-regexp": {
      "version": "0.1.13",
      "resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-0.1.13.tgz",
      "integrity": "sha512-A/AGNMFN3c8bOlvV9RreMdrv7jsmF9XIfDeCd87+I8RNg6s78BhJxMu69NEMHBSJFxKidViTEdruRwEk/WIKqA==",
      "license": "MIT"
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.2.tgz",
      "integrity": "sha512-V7+vQEJ06Z+c5tSye8S+nHUfI51xoXIXjHQ99cQtKUkQqqO1kO/KCJUfZXuB47h/YBlDhah2H3hdUGXn8ie0oA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/pify": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/pify/-/pify-2.3.0.tgz",
      "integrity": "sha512-udgsAY+fTnvv7kI7aaxbqwWNb0AHiB0qBO89PZKPkoTmGOgdbrHDKD+0B2X4uTfJ/FT1R09r9gTsjUjNJotuog==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/pirates": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/pirates/-/pirates-4.0.7.tgz",
      "integrity": "sha512-TfySrs/5nm8fQJDcBDuUng3VOUKsd7S+zqvbOTiGXHfxX4wK31ard+hoNuvkicM/2YFzlpDgABOevKSsB4G/FA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.10",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.10.tgz",
      "integrity": "sha512-pMMHxBOZKFU6HgAZ4eyGnwXF/EvPGGqUr0MnZ5+99485wwW41kW91A4LOGxSHhgugZmSChL5AlElNdwlNgcnLQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.11",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/postcss-import": {
      "version": "15.1.0",
      "resolved": "https://registry.npmjs.org/postcss-import/-/postcss-import-15.1.0.tgz",
      "integrity": "sha512-hpr+J05B2FVYUAXHeK1YyI267J/dDDhMU6B6civm8hSY1jYJnBXxzKDKDswzJmtLHryrjhnDjqqp/49t8FALew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "postcss-value-parser": "^4.0.0",
        "read-cache": "^1.0.0",
        "resolve": "^1.1.7"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "postcss": "^8.0.0"
      }
    },
    "node_modules/postcss-js": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/postcss-js/-/postcss-js-4.1.0.tgz",
      "integrity": "sha512-oIAOTqgIo7q2EOwbhb8UalYePMvYoIeRY2YKntdpFQXNosSu3vLrniGgmH9OKs/qAkfoj5oB3le/7mINW1LCfw==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "camelcase-css": "^2.0.1"
      },
      "engines": {
        "node": "^12 || ^14 || >= 16"
      },
      "peerDependencies": {
        "postcss": "^8.4.21"
      }
    },
    "node_modules/postcss-load-config": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/postcss-load-config/-/postcss-load-config-6.0.1.tgz",
      "integrity": "sha512-oPtTM4oerL+UXmx+93ytZVN82RrlY/wPUV8IeDxFrzIjXOLF1pN+EmKPLbubvKHT2HC20xXsCAH2Z+CKV6Oz/g==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "lilconfig": "^3.1.1"
      },
      "engines": {
        "node": ">= 18"
      },
      "peerDependencies": {
        "jiti": ">=1.21.0",
        "postcss": ">=8.0.9",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "jiti": {
          "optional": true
        },
        "postcss": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/postcss-nested": {
      "version": "6.2.0",
      "resolved": "https://registry.npmjs.org/postcss-nested/-/postcss-nested-6.2.0.tgz",
      "integrity": "sha512-HQbt28KulC5AJzG+cZtj9kvKB93CFCdLvog1WFLf1D+xmMvPGlBstkpTEZfK5+AN9hfJocyBFCNiqyS48bpgzQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "postcss-selector-parser": "^6.1.1"
      },
      "engines": {
        "node": ">=12.0"
      },
      "peerDependencies": {
        "postcss": "^8.2.14"
      }
    },
    "node_modules/postcss-selector-parser": {
      "version": "6.1.2",
      "resolved": "https://registry.npmjs.org/postcss-selector-parser/-/postcss-selector-parser-6.1.2.tgz",
      "integrity": "sha512-Q8qQfPiZ+THO/3ZrOrO0cJJKfpYCagtMUkXbnEfmgUjwXg6z/WBeOyS9APBBPCTSiDV+s4SwQGu8yFsiMRIudg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "cssesc": "^3.0.0",
        "util-deprecate": "^1.0.2"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/postcss-value-parser": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/postcss-value-parser/-/postcss-value-parser-4.2.0.tgz",
      "integrity": "sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/proxy-addr": {
      "version": "2.0.7",
      "resolved": "https://registry.npmjs.org/proxy-addr/-/proxy-addr-2.0.7.tgz",
      "integrity": "sha512-llQsMLSUDUPT44jdrU/O37qlnifitDP+ZwrmmZcoSKyLKvtZxpyV0n2/bD/N4tBAAZ/gJEdZU7KMraoK1+XYAg==",
      "license": "MIT",
      "dependencies": {
        "forwarded": "0.2.0",
        "ipaddr.js": "1.9.1"
      },
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/proxy-from-env": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/proxy-from-env/-/proxy-from-env-2.1.0.tgz",
      "integrity": "sha512-cJ+oHTW1VAEa8cJslgmUZrc+sjRKgAKl3Zyse6+PV38hZe/V6Z14TbCuXcan9F9ghlz4QrFr2c92TNF82UkYHA==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/qs": {
      "version": "6.14.2",
      "resolved": "https://registry.npmjs.org/qs/-/qs-6.14.2.tgz",
      "integrity": "sha512-V/yCWTTF7VJ9hIh18Ugr2zhJMP01MY7c5kh4J870L7imm6/DIzBsNLTXzMwUA3yZ5b/KBqLx8Kp3uRvd7xSe3Q==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "side-channel": "^1.1.0"
      },
      "engines": {
        "node": ">=0.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/queue-microtask": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
      "integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/range-parser": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/range-parser/-/range-parser-1.2.1.tgz",
      "integrity": "sha512-Hrgsx+orqoygnmhFbKaHE6c296J+HTAQXoxEF6gNupROmmGJRoyzfG3ccAveqCBrwr/2yxQ5BVd/GTl5agOwSg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/raw-body": {
      "version": "2.5.3",
      "resolved": "https://registry.npmjs.org/raw-body/-/raw-body-2.5.3.tgz",
      "integrity": "sha512-s4VSOf6yN0rvbRZGxs8Om5CWj6seneMwK3oDb4lWDH0UPhWcxwOWw5+qk24bxq87szX1ydrwylIOp2uG1ojUpA==",
      "license": "MIT",
      "dependencies": {
        "bytes": "~3.1.2",
        "http-errors": "~2.0.1",
        "iconv-lite": "~0.4.24",
        "unpipe": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/react": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0",
        "scheduler": "^0.23.2"
      },
      "peerDependencies": {
        "react": "^18.3.1"
      }
    },
    "node_modules/react-fast-compare": {
      "version": "3.2.2",
      "resolved": "https://registry.npmjs.org/react-fast-compare/-/react-fast-compare-3.2.2.tgz",
      "integrity": "sha512-nsO+KSNgo1SbJqJEYRE9ERzo7YtYbou/OqjSQKxV7jcKox7+usiUVZOAC+XnDOABXggQTno0Y1CpVnuWEc1boQ==",
      "license": "MIT"
    },
    "node_modules/react-helmet-async": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/react-helmet-async/-/react-helmet-async-3.0.0.tgz",
      "integrity": "sha512-nA3IEZfXiclgrz4KLxAhqJqIfFDuvzQwlKwpdmzZIuC1KNSghDEIXmyU0TKtbM+NafnkICcwx8CECFrZ/sL/1w==",
      "license": "Apache-2.0",
      "dependencies": {
        "invariant": "^2.2.4",
        "react-fast-compare": "^3.2.2",
        "shallowequal": "^1.1.0"
      },
      "peerDependencies": {
        "react": "^16.6.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/react-hot-toast": {
      "version": "2.6.0",
      "resolved": "https://registry.npmjs.org/react-hot-toast/-/react-hot-toast-2.6.0.tgz",
      "integrity": "sha512-bH+2EBMZ4sdyou/DPrfgIouFpcRLCJ+HoCA32UoAYHn6T3Ur5yfcDCeSr5mwldl6pFOsiocmrXMuoCJ1vV8bWg==",
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.1.3",
        "goober": "^2.1.16"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "react": ">=16",
        "react-dom": ">=16"
      }
    },
    "node_modules/react-icons": {
      "version": "5.6.0",
      "resolved": "https://registry.npmjs.org/react-icons/-/react-icons-5.6.0.tgz",
      "integrity": "sha512-RH93p5ki6LfOiIt0UtDyNg/cee+HLVR6cHHtW3wALfo+eOHTp8RnU2kRkI6E+H19zMIs03DyxUG/GfZMOGvmiA==",
      "license": "MIT",
      "peerDependencies": {
        "react": "*"
      }
    },
    "node_modules/react-is": {
      "version": "19.2.5",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-19.2.5.tgz",
      "integrity": "sha512-Dn0t8IQhCmeIT3wu+Apm1/YVsJXsGWi6k4sPdnBIdqMVtHtv0IGi6dcpNpNkNac0zB2uUAqNX3MHzN8c+z2rwQ==",
      "license": "MIT",
      "peer": true
    },
    "node_modules/react-redux": {
      "version": "9.2.0",
      "resolved": "https://registry.npmjs.org/react-redux/-/react-redux-9.2.0.tgz",
      "integrity": "sha512-ROY9fvHhwOD9ySfrF0wmvu//bKCQ6AeZZq1nJNtbDC+kk5DuSuNX/n6YWYF/SYy7bSba4D4FSz8DJeKY/S/r+g==",
      "license": "MIT",
      "dependencies": {
        "@types/use-sync-external-store": "^0.0.6",
        "use-sync-external-store": "^1.4.0"
      },
      "peerDependencies": {
        "@types/react": "^18.2.25 || ^19",
        "react": "^18.0 || ^19",
        "redux": "^5.0.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "redux": {
          "optional": true
        }
      }
    },
    "node_modules/react-router": {
      "version": "6.30.3",
      "resolved": "https://registry.npmjs.org/react-router/-/react-router-6.30.3.tgz",
      "integrity": "sha512-XRnlbKMTmktBkjCLE8/XcZFlnHvr2Ltdr1eJX4idL55/9BbORzyZEaIkBFDhFGCEWBBItsVrDxwx3gnisMitdw==",
      "license": "MIT",
      "dependencies": {
        "@remix-run/router": "1.23.2"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "react": ">=16.8"
      }
    },
    "node_modules/react-router-dom": {
      "version": "6.30.3",
      "resolved": "https://registry.npmjs.org/react-router-dom/-/react-router-dom-6.30.3.tgz",
      "integrity": "sha512-pxPcv1AczD4vso7G4Z3TKcvlxK7g7TNt3/FNGMhfqyntocvYKj+GCatfigGDjbLozC4baguJ0ReCigoDJXb0ag==",
      "license": "MIT",
      "dependencies": {
        "@remix-run/router": "1.23.2",
        "react-router": "6.30.3"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "react": ">=16.8",
        "react-dom": ">=16.8"
      }
    },
    "node_modules/read-cache": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/read-cache/-/read-cache-1.0.0.tgz",
      "integrity": "sha512-Owdv/Ft7IjOgm/i0xvNDZ1LrRANRfew4b2prF3OWMQLxLfu3bS8FVhCsrSCMK4lR56Y9ya+AThoTpDCTxCmpRA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "pify": "^2.3.0"
      }
    },
    "node_modules/readdirp": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-3.6.0.tgz",
      "integrity": "sha512-hOS089on8RduqdbhvQ5Z37A0ESjsqz6qnRcffsMU3495FuTdqSm+7bhJ29JvIOsBDEEnan5DPu9t3To9VRlMzA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "picomatch": "^2.2.1"
      },
      "engines": {
        "node": ">=8.10.0"
      }
    },
    "node_modules/recharts": {
      "version": "3.8.1",
      "resolved": "https://registry.npmjs.org/recharts/-/recharts-3.8.1.tgz",
      "integrity": "sha512-mwzmO1s9sFL0TduUpwndxCUNoXsBw3u3E/0+A+cLcrSfQitSG62L32N69GhqUrrT5qKcAE3pCGVINC6pqkBBQg==",
      "license": "MIT",
      "workspaces": [
        "www"
      ],
      "dependencies": {
        "@reduxjs/toolkit": "^1.9.0 || 2.x.x",
        "clsx": "^2.1.1",
        "decimal.js-light": "^2.5.1",
        "es-toolkit": "^1.39.3",
        "eventemitter3": "^5.0.1",
        "immer": "^10.1.1",
        "react-redux": "8.x.x || 9.x.x",
        "reselect": "5.1.1",
        "tiny-invariant": "^1.3.3",
        "use-sync-external-store": "^1.2.2",
        "victory-vendor": "^37.0.2"
      },
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-dom": "^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-is": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/redux": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/redux/-/redux-5.0.1.tgz",
      "integrity": "sha512-M9/ELqF6fy8FwmkpnF0S3YKOqMyoWJ4+CS5Efg2ct3oY9daQvd/Pc71FpGZsVsbl3Cpb+IIcjBDUnnyBdQbq4w==",
      "license": "MIT"
    },
    "node_modules/redux-thunk": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/redux-thunk/-/redux-thunk-3.1.0.tgz",
      "integrity": "sha512-NW2r5T6ksUKXCabzhL9z+h206HQw/NJkcLm1GPImRQ8IzfXwRGqjVhKJGauHirT0DAuyy6hjdnMZaRoAcy0Klw==",
      "license": "MIT",
      "peerDependencies": {
        "redux": "^5.0.0"
      }
    },
    "node_modules/reselect": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/reselect/-/reselect-5.1.1.tgz",
      "integrity": "sha512-K/BG6eIky/SBpzfHZv/dd+9JBFiS4SWV7FIujVyJRux6e45+73RaUHXLmIR1f7WOMaQ0U1km6qwklRQxpJJY0w==",
      "license": "MIT"
    },
    "node_modules/resolve": {
      "version": "1.22.12",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.12.tgz",
      "integrity": "sha512-TyeJ1zif53BPfHootBGwPRYT1RUt6oGWsaQr8UyZW/eAm9bKoijtvruSDEmZHm92CwS9nj7/fWttqPCgzep8CA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "is-core-module": "^2.16.1",
        "path-parse": "^1.0.7",
        "supports-preserve-symlinks-flag": "^1.0.0"
      },
      "bin": {
        "resolve": "bin/resolve"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/reusify": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz",
      "integrity": "sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "iojs": ">=1.0.0",
        "node": ">=0.10.0"
      }
    },
    "node_modules/rolldown": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/rolldown/-/rolldown-1.0.0-rc.17.tgz",
      "integrity": "sha512-ZrT53oAKrtA4+YtBWPQbtPOxIbVDbxT0orcYERKd63VJTF13zPcgXTvD4843L8pcsI7M6MErt8QtON6lrB9tyA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@oxc-project/types": "=0.127.0",
        "@rolldown/pluginutils": "1.0.0-rc.17"
      },
      "bin": {
        "rolldown": "bin/cli.mjs"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "optionalDependencies": {
        "@rolldown/binding-android-arm64": "1.0.0-rc.17",
        "@rolldown/binding-darwin-arm64": "1.0.0-rc.17",
        "@rolldown/binding-darwin-x64": "1.0.0-rc.17",
        "@rolldown/binding-freebsd-x64": "1.0.0-rc.17",
        "@rolldown/binding-linux-arm-gnueabihf": "1.0.0-rc.17",
        "@rolldown/binding-linux-arm64-gnu": "1.0.0-rc.17",
        "@rolldown/binding-linux-arm64-musl": "1.0.0-rc.17",
        "@rolldown/binding-linux-ppc64-gnu": "1.0.0-rc.17",
        "@rolldown/binding-linux-s390x-gnu": "1.0.0-rc.17",
        "@rolldown/binding-linux-x64-gnu": "1.0.0-rc.17",
        "@rolldown/binding-linux-x64-musl": "1.0.0-rc.17",
        "@rolldown/binding-openharmony-arm64": "1.0.0-rc.17",
        "@rolldown/binding-wasm32-wasi": "1.0.0-rc.17",
        "@rolldown/binding-win32-arm64-msvc": "1.0.0-rc.17",
        "@rolldown/binding-win32-x64-msvc": "1.0.0-rc.17"
      }
    },
    "node_modules/rolldown/node_modules/@rolldown/pluginutils": {
      "version": "1.0.0-rc.17",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.0-rc.17.tgz",
      "integrity": "sha512-n8iosDOt6Ig1UhJ2AYqoIhHWh/isz0xpicHTzpKBeotdVsTEcxsSA/i3EVM7gQAj0rU27OLAxCjzlj15IWY7bg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/run-parallel": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
      "integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "queue-microtask": "^1.2.2"
      }
    },
    "node_modules/safe-buffer": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz",
      "integrity": "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/safer-buffer": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
      "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
      "license": "MIT"
    },
    "node_modules/scheduler": {
      "version": "0.23.2",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",
      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    },
    "node_modules/send": {
      "version": "0.19.2",
      "resolved": "https://registry.npmjs.org/send/-/send-0.19.2.tgz",
      "integrity": "sha512-VMbMxbDeehAxpOtWJXlcUS5E8iXh6QmN+BkRX1GARS3wRaXEEgzCcB10gTQazO42tpNIya8xIyNx8fll1OFPrg==",
      "license": "MIT",
      "dependencies": {
        "debug": "2.6.9",
        "depd": "2.0.0",
        "destroy": "1.2.0",
        "encodeurl": "~2.0.0",
        "escape-html": "~1.0.3",
        "etag": "~1.8.1",
        "fresh": "~0.5.2",
        "http-errors": "~2.0.1",
        "mime": "1.6.0",
        "ms": "2.1.3",
        "on-finished": "~2.4.1",
        "range-parser": "~1.2.1",
        "statuses": "~2.0.2"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/send/node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "license": "MIT"
    },
    "node_modules/serve-static": {
      "version": "1.16.3",
      "resolved": "https://registry.npmjs.org/serve-static/-/serve-static-1.16.3.tgz",
      "integrity": "sha512-x0RTqQel6g5SY7Lg6ZreMmsOzncHFU7nhnRWkKgWuMTu5NN0DR5oruckMqRvacAN9d5w6ARnRBXl9xhDCgfMeA==",
      "license": "MIT",
      "dependencies": {
        "encodeurl": "~2.0.0",
        "escape-html": "~1.0.3",
        "parseurl": "~1.3.3",
        "send": "~0.19.1"
      },
      "engines": {
        "node": ">= 0.8.0"
      }
    },
    "node_modules/setprototypeof": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/setprototypeof/-/setprototypeof-1.2.0.tgz",
      "integrity": "sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==",
      "license": "ISC"
    },
    "node_modules/shallowequal": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/shallowequal/-/shallowequal-1.1.0.tgz",
      "integrity": "sha512-y0m1JoUZSlPAjXVtPPW70aZWfIL/dSP7AFkRnniLCrK/8MDKog3TySTBmckD+RObVxH0v4Tox67+F14PdED2oQ==",
      "license": "MIT"
    },
    "node_modules/side-channel": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.0.tgz",
      "integrity": "sha512-ZX99e6tRweoUXqR+VBrslhda51Nh5MTQwou5tnUDgbtyM0dBgmhEDtWGP/xbKn6hqfPRHujUNwz5fy/wbbhnpw==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.3",
        "side-channel-list": "^1.0.0",
        "side-channel-map": "^1.0.1",
        "side-channel-weakmap": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-list": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.1.tgz",
      "integrity": "sha512-mjn/0bi/oUURjc5Xl7IaWi/OJJJumuoJFQJfDDyO46+hBWsfaVM65TBHq2eoZBhzl9EchxOijpkbRC8SVBQU0w==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-map": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",
      "integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-weakmap": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",
      "integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3",
        "side-channel-map": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/statuses": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/statuses/-/statuses-2.0.2.tgz",
      "integrity": "sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/sucrase": {
      "version": "3.35.1",
      "resolved": "https://registry.npmjs.org/sucrase/-/sucrase-3.35.1.tgz",
      "integrity": "sha512-DhuTmvZWux4H1UOnWMB3sk0sbaCVOoQZjv8u1rDoTV0HTdGem9hkAZtl4JZy8P2z4Bg0nT+YMeOFyVr4zcG5Tw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.2",
        "commander": "^4.0.0",
        "lines-and-columns": "^1.1.6",
        "mz": "^2.7.0",
        "pirates": "^4.0.1",
        "tinyglobby": "^0.2.11",
        "ts-interface-checker": "^0.1.9"
      },
      "bin": {
        "sucrase": "bin/sucrase",
        "sucrase-node": "bin/sucrase-node"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/supports-preserve-symlinks-flag": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz",
      "integrity": "sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/tailwindcss": {
      "version": "3.4.19",
      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-3.4.19.tgz",
      "integrity": "sha512-3ofp+LL8E+pK/JuPLPggVAIaEuhvIz4qNcf3nA1Xn2o/7fb7s/TYpHhwGDv1ZU3PkBluUVaF8PyCHcm48cKLWQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@alloc/quick-lru": "^5.2.0",
        "arg": "^5.0.2",
        "chokidar": "^3.6.0",
        "didyoumean": "^1.2.2",
        "dlv": "^1.1.3",
        "fast-glob": "^3.3.2",
        "glob-parent": "^6.0.2",
        "is-glob": "^4.0.3",
        "jiti": "^1.21.7",
        "lilconfig": "^3.1.3",
        "micromatch": "^4.0.8",
        "normalize-path": "^3.0.0",
        "object-hash": "^3.0.0",
        "picocolors": "^1.1.1",
        "postcss": "^8.4.47",
        "postcss-import": "^15.1.0",
        "postcss-js": "^4.0.1",
        "postcss-load-config": "^4.0.2 || ^5.0 || ^6.0",
        "postcss-nested": "^6.2.0",
        "postcss-selector-parser": "^6.1.2",
        "resolve": "^1.22.8",
        "sucrase": "^3.35.0"
      },
      "bin": {
        "tailwind": "lib/cli.js",
        "tailwindcss": "lib/cli.js"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/thenify": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/thenify/-/thenify-3.3.1.tgz",
      "integrity": "sha512-RVZSIV5IG10Hk3enotrhvz0T9em6cyHBLkH/YAZuKqd8hRkKhSfCGIcP2KUY0EPxndzANBmNllzWPwak+bheSw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0"
      }
    },
    "node_modules/thenify-all": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/thenify-all/-/thenify-all-1.6.0.tgz",
      "integrity": "sha512-RNxQH/qI8/t3thXJDwcstUO4zeqo64+Uy/+sNVRBx4Xn2OX+OZ9oP+iJnNFqplFra2ZUVeKCSa2oVWi3T4uVmA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "thenify": ">= 3.1.0 < 4"
      },
      "engines": {
        "node": ">=0.8"
      }
    },
    "node_modules/tiny-invariant": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/tiny-invariant/-/tiny-invariant-1.3.3.tgz",
      "integrity": "sha512-+FbBPE1o9QAYvviau/qC5SE3caw21q3xkvWKBtja5vgqOWIHHJ3ioaq1VPfn/Szqctz2bU/oYeKd9/z5BL+PVg==",
      "license": "MIT"
    },
    "node_modules/tinyglobby": {
      "version": "0.2.16",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.16.tgz",
      "integrity": "sha512-pn99VhoACYR8nFHhxqix+uvsbXineAasWm5ojXoN8xEwK5Kd3/TrhNn1wByuD52UxWRLy8pu+kRMniEi6Eq9Zg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tinyglobby/node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/tinyglobby/node_modules/picomatch": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.4.tgz",
      "integrity": "sha512-QP88BAKvMam/3NxH6vj2o21R6MjxZUAd6nlwAS/pnGvN9IVLocLHxGYIzFhg6fUQ+5th6P4dv4eW9jX3DSIj7A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/to-regex-range": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
      "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-number": "^7.0.0"
      },
      "engines": {
        "node": ">=8.0"
      }
    },
    "node_modules/toidentifier": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/toidentifier/-/toidentifier-1.0.1.tgz",
      "integrity": "sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.6"
      }
    },
    "node_modules/ts-interface-checker": {
      "version": "0.1.13",
      "resolved": "https://registry.npmjs.org/ts-interface-checker/-/ts-interface-checker-0.1.13.tgz",
      "integrity": "sha512-Y/arvbn+rrz3JCKl9C4kVNfTfSm2/mEp5FSz5EsZSANGPSlQrpRI5M4PKF+mJnE52jOO90PnPSc3Ur3bTQw0gA==",
      "dev": true,
      "license": "Apache-2.0"
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/type-is": {
      "version": "1.6.18",
      "resolved": "https://registry.npmjs.org/type-is/-/type-is-1.6.18.tgz",
      "integrity": "sha512-TkRKr9sUTxEH8MdfuCSP7VizJyzRNMjj2J2do2Jr3Kym598JVdEksuzPQCnlFPW4ky9Q+iA+ma9BGm06XQBy8g==",
      "license": "MIT",
      "dependencies": {
        "media-typer": "0.3.0",
        "mime-types": "~2.1.24"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/unpipe": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/unpipe/-/unpipe-1.0.0.tgz",
      "integrity": "sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/update-browserslist-db": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.2.3.tgz",
      "integrity": "sha512-Js0m9cx+qOgDxo0eMiFGEueWztz+d4+M3rGlmKPT+T4IS/jP4ylw3Nwpu6cpTTP8R1MAC1kF4VbdLt3ARf209w==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/use-sync-external-store": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/use-sync-external-store/-/use-sync-external-store-1.6.0.tgz",
      "integrity": "sha512-Pp6GSwGP/NrPIrxVFAIkOQeyw8lFenOHijQWkUTrDvrF4ALqylP2C/KCkeS9dpUM3KvYRQhna5vt7IL95+ZQ9w==",
      "license": "MIT",
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/util-deprecate": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",
      "integrity": "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/utils-merge": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/utils-merge/-/utils-merge-1.0.1.tgz",
      "integrity": "sha512-pMZTvIkT1d+TFGvDOqodOclx0QWkkgi6Tdoa8gC8ffGAAqz9pzPTZWAybbsHHoED/ztMtkv/VoYTYyShUn81hA==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4.0"
      }
    },
    "node_modules/vary": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/vary/-/vary-1.1.2.tgz",
      "integrity": "sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/victory-vendor": {
      "version": "37.3.6",
      "resolved": "https://registry.npmjs.org/victory-vendor/-/victory-vendor-37.3.6.tgz",
      "integrity": "sha512-SbPDPdDBYp+5MJHhBCAyI7wKM3d5ivekigc2Dk2s7pgbZ9wIgIBYGVw4zGHBml/qTFbexrofXW6Gu4noGxrOwQ==",
      "license": "MIT AND ISC",
      "dependencies": {
        "@types/d3-array": "^3.0.3",
        "@types/d3-ease": "^3.0.0",
        "@types/d3-interpolate": "^3.0.1",
        "@types/d3-scale": "^4.0.2",
        "@types/d3-shape": "^3.1.0",
        "@types/d3-time": "^3.0.0",
        "@types/d3-timer": "^3.0.0",
        "d3-array": "^3.1.6",
        "d3-ease": "^3.0.1",
        "d3-interpolate": "^3.0.1",
        "d3-scale": "^4.0.2",
        "d3-shape": "^3.1.0",
        "d3-time": "^3.0.0",
        "d3-timer": "^3.0.1"
      }
    },
    "node_modules/vite": {
      "version": "8.0.10",
      "resolved": "https://registry.npmjs.org/vite/-/vite-8.0.10.tgz",
      "integrity": "sha512-rZuUu9j6J5uotLDs+cAA4O5H4K1SfPliUlQwqa6YEwSrWDZzP4rhm00oJR5snMewjxF5V/K3D4kctsUTsIU9Mw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "lightningcss": "^1.32.0",
        "picomatch": "^4.0.4",
        "postcss": "^8.5.10",
        "rolldown": "1.0.0-rc.17",
        "tinyglobby": "^0.2.16"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "@vitejs/devtools": "^0.1.0",
        "esbuild": "^0.27.0 || ^0.28.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "@vitejs/devtools": {
          "optional": true
        },
        "esbuild": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/vite/node_modules/picomatch": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.4.tgz",
      "integrity": "sha512-QP88BAKvMam/3NxH6vj2o21R6MjxZUAd6nlwAS/pnGvN9IVLocLHxGYIzFhg6fUQ+5th6P4dv4eW9jX3DSIj7A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    }
  }
}
{
  "name": "echoes-of-jannah",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.15.2",
    "cors": "^2.8.5",
    "express": "^4.21.0",
    "framer-motion": "^12.38.0",
    "lucide-react": "^1.11.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-helmet-async": "^3.0.0",
    "react-hot-toast": "^2.6.0",
    "react-icons": "^5.6.0",
    "react-router-dom": "^6.30.3",
    "recharts": "^3.8.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.1",
    "autoprefixer": "^10.5.0",
    "postcss": "^8.5.10",
    "tailwindcss": "^3.4.19",
    "vite": "^8.0.10"
  }
}


export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

README.md

#  Echoes of Jannah

<div align="center">

![Echoes of Jannah Banner](https://via.placeholder.com/1200x400?text=Echoes+of+Jannah)

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**A Full-Stack Spiritual Companion App for Connecting with the Quran**

[Live Demo](https://echoes-of-jannah.vercel.app) | [API Docs](https://api-docs.quran.foundation) | [Report Bug](https://github.com/iammaryam24/Echoes-Of-Jannah/issues)

</div>

---

## 📖 About The Project

**Echoes of Jannah** is a full-stack spiritual application that helps users build a deeper, more meaningful connection with the Quran. Unlike traditional Quran apps that focus solely on reading, Echoes of Jannah creates an emotional and personalized experience by connecting users' feelings with divine guidance from the Quran.

### 🎯 Problem Statement

Millions reconnect with the Quran during Ramadan, but many struggle to maintain that connection afterward. Echoes of Jannah solves this by:

- 🤝 **Emotionally engaging** users through personalized verse matching
- 📊 **Tracking progress** with gamification and analytics
- 👥 **Building community** through shared reflections
- 🎯 **Creating habits** with daily challenges and streaks

### ✨ Key Features

| Feature               | Description                                                    | Status |
|-----------------------|----------------------------------------------------------------|--------|
| 📖 **Quran Journey**  | Read, search, and listen to Quranic verses with translations   | ✅     |
| 💭 **Emotion Mirror** | Share feelings and receive relevant Quranic verses for guidance| ✅     |
| 🧬 **Spiritual DNA**  | Track spiritual growth, levels, and unlock achievements        | ✅     |
| 📅 **Life Timeline**  | Document life events and connect with Quranic wisdom           | ✅     |
| 👥 **Community Hub**  | Share reflections with fellow spiritual seekers                | ✅     |
| 🎯 **Daily Challenges**| Build consistent spiritual habits and earn XP                  | ✅     |
| 🎵 **Sacred Audio**   | Listen to beautiful Quran recitations by renowned reciters     | ✅     |
| 📊 **Advanced Analytics**| Deep insights into your spiritual journey with visual charts  | ✅     |

ARCHITECTURE:

                    ┌─────────────────────────────────────┐
                    │         User Browser                │
                    │    (React + Vite Frontend)          │
                    └─────────────┬───────────────────────┘
                                  │
                                  │ HTTPS / API Calls
                                  ▼
                    ┌─────────────────────────────────────┐
                    │      Backend Server (Node.js)        │
                    │         Express.js API               │
                    │                                      │
                    │  ┌──────────┐  ┌──────────┐        │
                    │  │  Auth    │  │  User    │        │
                    │  │  Routes  │  │  Routes  │        │
                    │  └──────────┘  └──────────┘        │
                    │  ┌──────────┐  ┌──────────┐        │
                    │  │ Content  │  │  Quran   │        │
                    │  │  Proxy   │  │   API    │        │
                    │  └──────────┘  │  Client  │        │
                    │                 └──────────┘        │
                    └─────────────┬───────────────────────┘
                                  │
                                  │ API Keys & Tokens
                                  ▼
                    ┌─────────────────────────────────────┐
                    │      Quran Foundation APIs          │
                    │                                      │
                    │  • Content API (Chapters/Verses)    │
                    │  • Audio API (Recitations)          │
                    │  • Tafsir API (Interpretations)     │
                    │  • Search API (Semantic Search)     │
                    │  • OAuth2 Auth API                  │
                    └─────────────────────────────────────┘

## 🛠️ Built With

### Frontend

| Technology          | Purpose                       |
|---------------------|-------------------------------|
| React 18            | UI library                    |
| Vite                | Build tool                    |
| Tailwind CSS        | Styling                       |
| Framer Motion       | Animations                    |
| Recharts            | Analytics charts              |
| React Hot Toast     | Notifications                 |

### Backend

| Technology          | Purpose                       |
|---------------------|-------------------------------|
| Node.js             | Runtime                       |
| Express.js          | Web framework                 |
| Express Session     | Session management            |
| Axios               | HTTP client                   |
| Helmet              | Security headers              |
| Compression         | Response compression          |
| Rate Limit          | DDoS protection               |

### APIs Used (Quran Foundation)

| API Category        | Endpoints                                      | Purpose                   |
|---------------------|------------------------------------------------|---------------------------|
| Content API         | `/chapters`, `/quran/verses/{script}`          | Get surahs and verses     |
| Audio API           | `/resources/recitations`, `/chapter_recitations/{id}` | Audio recitations     |
| Tafsir API          | `/tafsir`                                      | Verse interpretations     |
| Search API          | `/search`                                      | Semantic search           |
| Auth API            | OAuth2 endpoints                               | User authentication       |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/iammaryam24/Echoes-Of-Jannah.git
cd Echoes-Of-Jannah

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Create environment files
cp .env.example .env
cp backend/.env.example backend/.env
Environment Variables
Frontend (.env)
env
VITE_API_URL=http://localhost:3001
VITE_QURAN_API_BASE=https://api.quran.foundation/api/v1
Backend (backend/.env)
env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-secret-key-here

# Quran Foundation API Credentials
PRELIVE_CLIENT_ID=your_client_id
PRELIVE_CLIENT_SECRET=your_client_secret
Running Locally
bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev
Open http://localhost:5173

📁 Project Structure
text
echoes-of-jannah/
│
├── backend/                    # Backend server
│   ├── server.js              # Express server
│   ├── routes/                # API routes
│   ├── middleware/            # Auth middleware
│   ├── utils/                 # Utility functions
│   └── package.json
│
├── src/                       # Frontend source
│   ├── api/                   # API integration
│   ├── components/            # React components
│   ├── contexts/              # Context providers
│   ├── hooks/                 # Custom hooks
│   ├── pages/                 # Page components
│   ├── utils/                 # Helper functions
│   ├── App.jsx                # Main app
│   └── main.jsx               # Entry point
│
├── public/                    # Static assets
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
🔐 API Integration
Quran Foundation APIs Implemented
javascript
// 1. Content API - Get all surahs
GET /api/chapters

// 2. Verses API - Get verses with Arabic text
GET /api/verses?chapter=1&script=uthmani

// 3. Audio API - Get recitations
GET /api/recitations
GET /api/chapter-recitations/{reciterId}

// 4. Tafsir API - Get interpretations
GET /api/tafsir?chapter=1&verse=1

// 5. Search API - Semantic search
GET /api/search?q=mercy
Backend Endpoints
Method  Endpoint    Description
GET /api/chapters   Get all surahs
GET /api/verses Get verses by chapter
GET /api/recitations    Get reciters list
GET /api/tafsir Get verse tafsir
GET /api/search Search Quran
POST    /api/bookmarks  Save bookmark
GET /api/bookmarks  Get user bookmarks
POST    /api/reading-sessions   Track reading
GET /api/streaks    Get user streaks
1.  Go to Cyclic.sh
2.  Sign up with GitHub
3.  Click "Link Your Own" → select your repo
4.  Set:
o   Build Command: cd backend && npm install
o   Start Command: cd backend && node server.js
5.  Click "Deploy"
Deploy Frontend (Vercel)
bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod
Or connect your GitHub repo to Vercel for automatic deployments.


// server.js - COMPLETE STANDALONE VERSION
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import axios from 'axios';

const app = express();
const PORT = 3001;

// ✅ FIXED: Changed from 5173 to 3000
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
const CLIENT_SECRET = 'oESUyMXqqRSkQP8HBRmATrZlwp';
const REDIRECT_URI = 'http://localhost:3000/auth/callback';
const AUTH_BASE = 'https://prelive-oauth2.quran.foundation';

const pkceStore = new Map();

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
  
  console.log('✅ Auth URL generated');
  res.json({ url: `${AUTH_BASE}/oauth2/auth?${params.toString()}` });
});

app.post('/api/auth/exchange', async (req, res) => {
  console.log('📡 POST /api/auth/exchange');
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
    
    console.log('✅ Token exchange successful');
    res.json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      user
    });
  } catch (error) {
    console.error('❌ Exchange failed:', error.message);
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
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📌 CORS origin: http://localhost:3000`);
  console.log(`📌 Redirect URI: ${REDIRECT_URI}`);
});

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['"Noto Naskh Arabic"', 'serif'],
      },
    },
  },
  plugins: [],
}

{
  "rewrites": [
    {
      "source": "/api/auth/:path*",
      "destination": "/api/auth/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})


