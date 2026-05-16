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
