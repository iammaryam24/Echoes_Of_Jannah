import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCompass, FiHeart, FiBookOpen, FiActivity, FiDroplet, 
  FiBarChart2, FiUsers, FiLogIn, FiLogOut, FiUser, FiMenu, FiX,
  FiStar
} from 'react-icons/fi';
import { useQuranAuth } from '../contexts/QuranAuthContext';

const navItems = [
  { id: 'timeline', label: 'Timeline', icon: FiCompass },
  { id: 'mirror', label: 'Heart Mirror', icon: FiHeart },
  { id: 'quran', label: 'Quran', icon: FiBookOpen },
  { id: 'journey', label: 'Journey', icon: FiActivity },
  { id: 'dna', label: 'Spiritual DNA', icon: FiDroplet },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  { id: 'community', label: 'Community', icon: FiUsers },
];

export default function Navigation({ currentView, setCurrentView, userData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signIn, signOut, isLoading, isAuthenticated } = useQuranAuth();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button 
              onClick={() => setCurrentView('timeline')} 
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900">
                  Echoes of <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Jannah</span>
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                    ${currentView === item.id 
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <item.icon size={16} className={currentView === item.id ? 'text-emerald-500' : ''} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                    <FiStar size={12} className="text-emerald-500" />
                    <span className="font-semibold text-gray-700">Lv.{userData?.level || 1}</span>
                  </div>
                </div>
              )}

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center">
                      <FiUser size={10} className="text-white" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{user?.name?.split(' ')[0] || 'User'}</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                  >
                    <FiLogOut size={14} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={signIn}
                  disabled={isLoading}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <FiLogIn size={14} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
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
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-100 bg-white shadow-lg"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-all
                      ${currentView === item.id 
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <item.icon size={16} className={currentView === item.id ? 'text-emerald-500' : ''} />
                    <span>{item.label}</span>
                    {currentView === item.id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    )}
                  </button>
                ))}
                {!isAuthenticated && (
                  <button
                    onClick={() => {
                      signIn();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-600 flex items-center gap-3 hover:bg-emerald-50 transition-all"
                  >
                    <FiLogIn size={16} />
                    <span>Sign In with Quran Foundation</span>
                  </button>
                )}
              </div>
              
              {/* Mobile user info if authenticated */}
              {isAuthenticated && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center">
                      <FiUser size={14} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{user?.name || 'User'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <FiStar size={10} className="text-emerald-500" />
                        <span className="text-xs text-gray-500">Level {userData?.level || 1}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <div className="h-16" />
    </>
  );
}