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
      {/* Navigation - Fixed at top */}
      <Navigation 
        currentView={currentView} 
        setCurrentView={handleViewChange} 
        userData={safeUserData} 
      />

      {/* Welcome Banner - positioned directly after navbar with proper spacing */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white overflow-hidden flex-shrink-0 relative z-10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <FiStar className="text-white/90" size={14} />
                  </div>
                  <span className="text-sm font-medium">Welcome to Echoes of Jannah — your spiritual journey begins here</span>
                </div>
                <button 
                  onClick={() => setShowWelcome(false)} 
                  className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT - with proper spacing */}
      <main className="flex-1 w-full">
        <div className="w-full">
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
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white w-full flex-shrink-0">
        <div className="px-6 sm:px-8 py-12 md:py-16 max-w-7xl mx-auto">
          {/* Logo & Brand Section */}
          <div className="flex flex-col items-center text-center mb-12 md:mb-16">
            <img 
              src="/logo.png" 
              alt="Echoes of Jannah Logo" 
              className="h-16 md:h-20 w-auto mb-4 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3 bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
              Echoes of Jannah
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Pakistan's leading spiritual wellness platform connecting hearts with the timeless wisdom of the Quran.
            </p>
          </div>

          {/* Footer Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16 mb-12 md:mb-16">
            {/* Quick Links */}
            <div>
              <h4 className="font-bold uppercase text-xs tracking-wider text-emerald-400 mb-5">Quick Links</h4>
              <ul className="space-y-3 text-base text-gray-400">
                <li><button onClick={() => handleViewChange('timeline')} className="hover:text-emerald-400 transition-colors block">Home</button></li>
                <li><button onClick={() => handleViewChange('mirror')} className="hover:text-emerald-400 transition-colors block">Heart Mirror</button></li>
                <li><button onClick={() => handleViewChange('quran')} className="hover:text-emerald-400 transition-colors block">Holy Quran</button></li>
                <li><button onClick={() => handleViewChange('journey')} className="hover:text-emerald-400 transition-colors block">Life Companion</button></li>
                <li><button onClick={() => handleViewChange('dna')} className="hover:text-emerald-400 transition-colors block">Spiritual DNA</button></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold uppercase text-xs tracking-wider text-emerald-400 mb-5">Resources</h4>
              <ul className="space-y-3 text-base text-gray-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors block">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors block">Reflections</a></li>
                <li><button onClick={() => handleViewChange('analytics')} className="hover:text-emerald-400 transition-colors block">Analytics</button></li>
                <li><button onClick={() => handleViewChange('community')} className="hover:text-emerald-400 transition-colors block">Community Events</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold uppercase text-xs tracking-wider text-emerald-400 mb-5">Support</h4>
              <ul className="space-y-3 text-base text-gray-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors block">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors block">Contact Us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors block">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors block">Terms of Service</a></li>
              </ul>
            </div>

            {/* Stay Updated */}
            <div>
              <h4 className="font-bold uppercase text-xs tracking-wider text-emerald-400 mb-5">Stay Updated</h4>
              <p className="text-base text-gray-400 mb-4 leading-relaxed">Subscribe for spiritual insights</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="px-4 py-3 bg-gray-800 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-500 flex-1"
                />
                <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition text-base font-semibold whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
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