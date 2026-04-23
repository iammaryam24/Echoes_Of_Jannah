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