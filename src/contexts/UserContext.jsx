// src/contexts/UserContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
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

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId] = useState('demo-user-123');
  const [loading, setLoading] = useState(true);
  const [xp, setXP] = useLocalStorage('user_xp', 0);
  const [level, setLevel] = useLocalStorage('user_level', 1);
  const [bookmarks, setBookmarks] = useLocalStorage('user_bookmarks', []);
  const [streak, setStreak] = useLocalStorage('user_streak', 0);
  const [lastActive, setLastActive] = useLocalStorage('last_active', null);
  const [reflections, setReflections] = useLocalStorage('user_reflections', []);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const profile = await getProfile(userId);
      if (profile?.success && profile?.data) {
        setUser(profile.data);
        setXP(profile.data.xp || 0);
        setLevel(profile.data.level || 1);
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
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const newLevel = Math.floor(xp / 100) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      if (user) {
        setUser({ ...user, level: newLevel, xp });
      }
    }
  }, [xp]);

  const addUserXP = async (amount) => {
    const newXP = xp + amount;
    setXP(newXP);
    const result = await addXP(userId, amount);
    if (result?.success && result?.data) {
      setUser(prev => ({ ...prev, xp: result.data.xp, level: result.data.level }));
    }
  };

  const addUserBookmark = async (bookmark) => {
    const newBookmark = { ...bookmark, id: Date.now(), savedAt: new Date().toISOString() };
    const newBookmarks = [...bookmarks, newBookmark];
    setBookmarks(newBookmarks);
    await saveBookmark(userId, bookmark.verseKey, bookmark.surahNumber, bookmark.verseNumber, bookmark.notes);
    return newBookmark;
  };

  const removeUserBookmark = async (bookmarkId) => {
    const newBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
    setBookmarks(newBookmarks);
    await removeBookmark(userId, bookmarkId);
  };

  const updateUserStreak = async () => {
    const today = new Date().toDateString();
    if (lastActive === today) return { streak };
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = 1;
    if (lastActive === yesterday.toDateString()) {
      newStreak = streak + 1;
    }
    
    setStreak(newStreak);
    setLastActive(today);
    await updateStreak(userId);
    
    if (newStreak === 7) {
      await addUserXP(50);
    } else if (newStreak === 30) {
      await addUserXP(200);
    }
    
    return { streak: newStreak };
  };

  const addUserActivity = async (activityType, count = 1) => {
    await updateActivity(userId, activityType, count);
    const xpMap = {
      'verse_read': 5,
      'verse_bookmarked': 10,
      'reflection': 15,
      'emotion_reflection': 10,
      'daily_challenge': 25
    };
    const xpAmount = (xpMap[activityType] || 5) * count;
    await addUserXP(xpAmount);
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
    await addUserActivity('reflection', 1);
    return newReflection;
  };

  const getUserReflections = async () => {
    return { success: true, data: reflections };
  };

  const value = {
    user,
    setUser,
    loading,
    xp,
    level,
    bookmarks,
    streak,
    reflections,
    userId,
    userData: { xp, level, streak, reflections: reflections.length },
    addXP: addUserXP,
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