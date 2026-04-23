// src/api/quranApi.js
// Unified API - uses AlQuran Cloud (free, no auth required)

const API_BASE = 'https://api.alquran.cloud/v1';

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

export const getSurah = async (surahNumber) => {
  try {
    const response = await fetch(`${API_BASE}/surah/${surahNumber}/editions/quran-uthmani,en.sahih`);
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      const arabicEdition = data.data.find(d => d.edition?.identifier === 'quran-uthmani');
      const englishEdition = data.data.find(d => d.edition?.identifier === 'en.sahih');
      const surahInfo = data.data[0];
      
      const verses = surahInfo.ayahs.map((ayah, i) => ({
        number: ayah.numberInSurah,
        arabic: arabicEdition?.ayahs[i]?.text || ayah.text,
        translation: englishEdition?.ayahs[i]?.text || '',
        juz: ayah.juz,
        page: ayah.page
      }));
      
      return {
        success: true,
        data: {
          number: surahInfo.number,
          name: surahInfo.name,
          englishName: surahInfo.englishName,
          versesCount: surahInfo.numberOfAyahs,
          revelationType: surahInfo.revelationType,
          verses
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
  getAllSurahs, getSurahs, getSurah, search: searchQuran, getReciters,
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