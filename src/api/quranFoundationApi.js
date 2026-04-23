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