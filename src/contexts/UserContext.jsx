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