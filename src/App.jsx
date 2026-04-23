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
import DailyChallenge from './components/DailyChallenge';
import CommunityHub from './components/CommunityHub';
import QuranJourney from './components/QuranJourney';
import ReflectionPost from './components/ReflectionPost';
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

  // Show welcome message when user authenticates via Quran Foundation OAuth
  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success(`Welcome ${user.name || user.given_name || 'Brother/Sister'}! May Allah bless your journey.`, {
        icon: '🌟',
        duration: 4000,
        style: { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' },
      });
    }
  }, [isAuthenticated, user]);

  const renderView = () => {
    switch (currentView) {
      case 'timeline':   return <LifeTimeline userId={userId} />;
      case 'mirror':     return <EmotionMirror userId={userId} />;
      case 'quran':      return <QuranBrowser userId={userId} />;
      case 'journey':    return <QuranJourney userId={userId} />;
      case 'dna':        return <SpiritualDNA userId={userId} />;
      case 'analytics':  return <AdvancedAnalytics userId={userId} />;
      case 'community':  return <CommunityHub userId={userId} />;
      default:           return <LifeTimeline userId={userId} />;
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
    <div className="min-h-screen bg-white">
      {/* Welcome Banner */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
          >
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiStar className="text-white/80" size={16} />
                  <span className="text-sm font-medium">Welcome to Echoes of Jannah</span>
                </div>
                <button onClick={() => setShowWelcome(false)} className="text-white/70 hover:text-white transition-colors">
                  <FiX size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation
        currentView={currentView}
        setCurrentView={handleViewChange}
        userData={safeUserData}
      />

      <main className="pt-20 pb-16 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            {currentView !== 'community' &&
             currentView !== 'quran' &&
             currentView !== 'analytics' &&
             currentView !== 'journey' ? (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {renderView()}
                </div>
                <div className="hidden lg:block space-y-6">
                  <DailyChallenge userId={userId} />
                  <ReflectionPost userId={userId} compact={true} />

                  {/* Quick Stats Card */}
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FiStar size={12} className="text-emerald-500" />
                      Quick Stats
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Today's Reflections</span>
                        <span className="text-gray-900 font-medium">{safeUserData.reflections?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Current Streak</span>
                        <span className="text-gray-900 font-medium">{safeUserData.streak} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Spiritual Level</span>
                        <span className="text-gray-900 font-medium">{safeUserData.level}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Total XP</span>
                        <span className="text-gray-900 font-medium">{safeUserData.xp} XP</span>
                      </div>

                      {isAuthenticated ? (
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <span className="text-gray-500 text-xs">Quran Foundation</span>
                          <span className="text-emerald-600 text-xs font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            ✓ Connected
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <span className="text-gray-400 text-xs">Quran Foundation</span>
                          <span className="text-gray-400 text-xs">Sign in to connect</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              renderView()
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-xs">
            © 2026 Echoes of Jannah — Transforming hearts through the words of Allah
          </p>
          <p className="text-gray-400 text-xs mt-1">Powered by Quran Foundation API</p>
          {isAuthenticated ? (
            <p className="text-emerald-600 text-xs mt-2 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              ✓ Authenticated with Quran Foundation as {user?.name || user?.email || 'User'}
            </p>
          ) : (
            <p className="text-gray-400 text-xs mt-2">
              Sign in to sync your reflections with Quran Foundation
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* OAuth2 callback — must be outside AppContent so Navigation doesn't render */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/* Everything else */}
      <Route path="*" element={<AppContent />} />
    </Routes>
  );
}

export default App;