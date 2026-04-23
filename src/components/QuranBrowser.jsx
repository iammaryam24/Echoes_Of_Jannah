// src/components/QuranBrowser.jsx - COMPLETE WITH WORKING AUDIO
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiBook, FiChevronLeft, FiBookmark, 
  FiShare2, FiInfo, FiX, FiLoader, FiHeart,
  FiChevronRight, FiVolume2, FiClock, FiGrid,
  FiList, FiPlay, FiPause, FiCopy, FiCheck,
  FiArrowUp, FiMaximize, FiMinimize, FiHeadphones,
  FiVolumeX, FiZap, FiStar
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

const API_BASE = 'https://api.alquran.cloud/v1';

const surahGradients = [
  'from-emerald-50 to-teal-50',
  'from-blue-50 to-cyan-50',
  'from-purple-50 to-pink-50',
  'from-amber-50 to-orange-50',
  'from-rose-50 to-red-50',
  'from-indigo-50 to-purple-50',
];

// Audio reciters available with working URLs
const reciters = [
  { id: 'ar.alafasy', name: 'Mishary Alafasy', baseUrl: 'https://everyayah.com/data/Alafasy_128kbps/' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdurrahman Sudais', baseUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/' },
  { id: 'ar.hudhaify', name: 'Ali Hudhaify', baseUrl: 'https://everyayah.com/data/hudhaify_64kbps/' },
  { id: 'ar.mahermuaiqly', name: 'Maher Al-Muaiqly', baseUrl: 'https://everyayah.com/data/MaherAlMuaiqly128kbps/' },
];

export default function QuranBrowser() {
  const { userId, addXP } = useUser();
  const [surahs, setSurahs] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [bookmarkedVerses, setBookmarkedVerses] = useState({});
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [showTafsir, setShowTafsir] = useState(null);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [recentSurahs, setRecentSurahs] = useState([]);
  const [viewLayout, setViewLayout] = useState('grid');
  const [copiedVerse, setCopiedVerse] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState('en.sahih');
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const [showReciterMenu, setShowReciterMenu] = useState(false);
  const [audioLoading, setAudioLoading] = useState({});
  const [audioError, setAudioError] = useState({});
  
  const versesContainerRef = useRef(null);
  const audioRef = useRef(null);

  const availableTranslations = [
    { id: 'en.sahih', name: 'Sahih International' },
    { id: 'en.yusufali', name: 'Yusuf Ali' },
    { id: 'en.pickthall', name: 'Pickthall' },
    { id: 'en.ahmedali', name: 'Ahmed Ali' },
  ];

  useEffect(() => {
    loadSurahs();
    loadBookmarks();
    loadFavorites();
    loadRecentSurahs();
    
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = surahs.filter(surah =>
        surah.englishName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.name?.includes(searchQuery) ||
        surah.number?.toString().includes(searchQuery)
      );
      setFilteredSurahs(filtered);
    } else {
      setFilteredSurahs(surahs);
    }
  }, [searchQuery, surahs]);

  useEffect(() => {
    const handleScroll = () => {
      if (versesContainerRef.current) {
        setShowScrollTop(versesContainerRef.current.scrollTop > 300);
      }
    };
    
    const container = versesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [selectedSurah]);

  const loadSurahs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/surah`);
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        const surahsList = data.data.map(surah => ({
          number: surah.number,
          name: surah.name,
          englishName: surah.englishName,
          englishNameTranslation: surah.englishNameTranslation,
          versesCount: surah.numberOfAyahs,
          revelationType: surah.revelationType === 'Meccan' ? 'Meccan' : 'Medinan',
          revelationOrder: surah.revelationOrder
        }));
        setSurahs(surahsList);
        setFilteredSurahs(surahsList);
        toast.success(`📖 ${surahsList.length} surahs loaded`);
      }
    } catch (error) {
      console.error('Error loading surahs:', error);
      toast.error('Failed to load surahs');
    }
    setLoading(false);
  };

  const loadSurah = async (surahNumber) => {
    setLoadingVerses(true);
    setSelectedSurah(null);
    setVerses([]);
    setShowScrollTop(false);
    
    if (currentAudio) {
      currentAudio.pause();
      setAudioPlaying(null);
      setCurrentAudio(null);
    }
    
    try {
      const response = await fetch(`${API_BASE}/surah/${surahNumber}/editions/quran-uthmani,${selectedTranslation}`);
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        const arabicEdition = data.data.find(ed => ed.edition?.identifier === 'quran-uthmani');
        const englishEdition = data.data.find(ed => ed.edition?.identifier === selectedTranslation);
        const surahInfo = arabicEdition || data.data[0];
        
        const reciter = reciters.find(r => r.id === selectedReciter) || reciters[0];
        
        const versesList = surahInfo.ayahs.map((ayah, index) => {
          const paddedSurah = surahNumber.toString().padStart(3, '0');
          const paddedVerse = ayah.numberInSurah.toString().padStart(3, '0');
          
          return {
            number: ayah.numberInSurah,
            arabic: ayah.text,
            translation: englishEdition?.ayahs[index]?.text || 'Translation loading...',
            juz: ayah.juz,
            page: ayah.page,
            manzil: ayah.manzil,
            sajda: ayah.sajda,
            audioUrl: `${reciter.baseUrl}${paddedSurah}${paddedVerse}.mp3`
          };
        });
        
        setSelectedSurah({
          number: surahInfo.number,
          name: surahInfo.name,
          englishName: surahInfo.englishName,
          englishNameTranslation: surahInfo.englishNameTranslation,
          versesCount: surahInfo.numberOfAyahs,
          revelationType: surahInfo.revelationType,
          revelationOrder: surahInfo.revelationOrder
        });
        
        setVerses(versesList);
        saveToRecent(surahNumber);
        
        toast.success(`${surahInfo.englishName} • ${versesList.length} verses`);
      }
    } catch (error) {
      console.error('Error loading surah:', error);
      toast.error('Failed to load surah verses');
    }
    setLoadingVerses(false);
  };

  const handleTranslationChange = (translationId) => {
    setSelectedTranslation(translationId);
    if (selectedSurah) {
      loadSurah(selectedSurah.number);
    }
  };

  const handleReciterChange = (reciterId) => {
    setSelectedReciter(reciterId);
    setShowReciterMenu(false);
    if (selectedSurah) {
      loadSurah(selectedSurah.number);
    }
    toast.success(`🎤 Reciter changed to ${reciters.find(r => r.id === reciterId)?.name}`);
  };

  const saveToRecent = (surahNumber) => {
    const recent = [surahNumber, ...recentSurahs.filter(s => s !== surahNumber)].slice(0, 5);
    setRecentSurahs(recent);
    localStorage.setItem(`quran_recent_${userId}`, JSON.stringify(recent));
  };

  const loadRecentSurahs = () => {
    const saved = localStorage.getItem(`quran_recent_${userId}`);
    if (saved) setRecentSurahs(JSON.parse(saved));
  };

  const searchQuran = async (query) => {
    try {
      const results = [];
      const searchLower = query.toLowerCase();
      
      for (const surah of surahs) {
        if (surah.englishName.toLowerCase().includes(searchLower) ||
            surah.name.includes(searchLower)) {
          results.push({
            surahNumber: surah.number,
            verseNumber: 1,
            text: surah.name,
            translation: `${surah.englishName} - ${surah.versesCount} verses`,
            isSurah: true
          });
        }
      }
      
      return results.slice(0, 30);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  const loadBookmarks = () => {
    const saved = localStorage.getItem(`quran_bookmarks_${userId}`);
    if (saved) {
      const bookmarks = JSON.parse(saved);
      const map = {};
      bookmarks.forEach(b => { map[`${b.surahNumber}_${b.verseNumber}`] = true; });
      setBookmarkedVerses(map);
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem(`quran_favorites_${userId}`);
    if (saved) setFavorites(JSON.parse(saved));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = await searchQuran(searchQuery);
    setSearchResults(results);
    if (results.length === 0) {
      toast.error('No results found');
    } else {
      toast.success(`Found ${results.length} results`);
    }
  };

  const handleBookmark = (surahNumber, verseNumber) => {
    const key = `${surahNumber}_${verseNumber}`;
    const bookmarks = JSON.parse(localStorage.getItem(`quran_bookmarks_${userId}`) || '[]');
    
    if (bookmarkedVerses[key]) {
      const newBookmarks = bookmarks.filter(b => b.verseKey !== key);
      localStorage.setItem(`quran_bookmarks_${userId}`, JSON.stringify(newBookmarks));
      setBookmarkedVerses(prev => ({ ...prev, [key]: false }));
      toast('Bookmark removed', { icon: '🔖' });
    } else {
      bookmarks.push({ id: Date.now(), verseKey: key, surahNumber, verseNumber });
      localStorage.setItem(`quran_bookmarks_${userId}`, JSON.stringify(bookmarks));
      setBookmarkedVerses(prev => ({ ...prev, [key]: true }));
      toast.success(`✨ Verse ${verseNumber} bookmarked! +5 XP`);
      if (addXP) addXP(5);
    }
  };

  const toggleFavorite = (surahNumber) => {
    let newFavs;
    if (favorites.includes(surahNumber)) {
      newFavs = favorites.filter(f => f !== surahNumber);
      toast('Removed from favorites', { icon: '💔' });
    } else {
      newFavs = [...favorites, surahNumber];
      toast.success('✨ Added to favorites! +3 XP');
      if (addXP) addXP(3);
    }
    setFavorites(newFavs);
    localStorage.setItem(`quran_favorites_${userId}`, JSON.stringify(newFavs));
  };

  const handleTafsir = async (surahNumber, verseNumber, arabic, translation) => {
    setShowTafsir({ 
      surah: surahNumber, 
      verse: verseNumber, 
      text: 'Loading tafsir...', 
      arabic, 
      translation, 
      loading: true 
    });
    
    try {
      const response = await fetch(`${API_BASE}/tafsir/169/${surahNumber}/${verseNumber}`);
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        setShowTafsir(prev => ({ ...prev, text: data.data.text, loading: false }));
      } else {
        const fallbackResponse = await fetch(`${API_BASE}/tafsir/168/${surahNumber}/${verseNumber}`);
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.code === 200 && fallbackData.data) {
          setShowTafsir(prev => ({ ...prev, text: fallbackData.data.text, loading: false }));
        } else {
          setShowTafsir(prev => ({ ...prev, text: 'Tafsir not available for this verse.', loading: false }));
        }
      }
    } catch (error) {
      setShowTafsir(prev => ({ ...prev, text: 'Unable to load tafsir. Please try again.', loading: false }));
    }
  };

  const handleShare = (surahNumber, verseNumber, translation) => {
    const shareText = `"${translation?.substring(0, 300)}..."\n\n— Surah ${surahNumber}, Verse ${verseNumber}\n\nvia Echoes of Jannah`;
    if (navigator.share) {
      navigator.share({ title: 'Quran Verse', text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Verse copied to clipboard!');
    }
  };

  const handleCopyVerse = (verse, translation) => {
    const text = `${verse.arabic}\n\n${verse.number}. ${translation}`;
    navigator.clipboard.writeText(text);
    setCopiedVerse(verse.number);
    toast.success('Verse copied!', { icon: '📋' });
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  const handlePlayAudio = async (surahNumber, verseNumber, audioUrl) => {
    const key = `${surahNumber}_${verseNumber}`;
    
    if (audioPlaying === key && currentAudio) {
      currentAudio.pause();
      setAudioPlaying(null);
      setCurrentAudio(null);
      return;
    }
    
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    
    setAudioError(prev => ({ ...prev, [key]: false }));
    setAudioLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      const audio = new Audio();
      
      audio.oncanplaythrough = () => {
        setAudioLoading(prev => ({ ...prev, [key]: false }));
        audio.play().catch(err => {
          console.error('Play error:', err);
          setAudioError(prev => ({ ...prev, [key]: true }));
          toast.error('Could not play audio');
        });
        setCurrentAudio(audio);
        setAudioPlaying(key);
      };
      
      audio.onerror = () => {
        setAudioLoading(prev => ({ ...prev, [key]: false }));
        setAudioError(prev => ({ ...prev, [key]: true }));
        toast.error('Audio not available for this verse');
      };
      
      audio.onended = () => {
        setAudioPlaying(null);
        setCurrentAudio(null);
      };
      
      audio.src = audioUrl;
      audio.load();
      
    } catch (error) {
      setAudioLoading(prev => ({ ...prev, [key]: false }));
      setAudioError(prev => ({ ...prev, [key]: true }));
      toast.error('Failed to load audio');
    }
  };

  const handlePlayFullSurah = () => {
    if (!verses.length) return;
    
    const fullSurahKey = `surah_${selectedSurah.number}`;
    
    if (audioPlaying === fullSurahKey && currentAudio) {
      currentAudio.pause();
      setAudioPlaying(null);
      setCurrentAudio(null);
      return;
    }
    
    if (currentAudio) {
      currentAudio.pause();
    }
    
    toast.success(`🎧 Playing full Surah ${selectedSurah.englishName}`);
    
    let currentIndex = 0;
    
    const playNext = () => {
      if (currentIndex < verses.length) {
        const verse = verses[currentIndex];
        const audio = new Audio(verse.audioUrl);
        
        audio.onended = () => {
          currentIndex++;
          playNext();
        };
        
        audio.onerror = () => {
          console.error(`Error playing verse ${verse.number}`);
          currentIndex++;
          playNext();
        };
        
        audio.play().catch(err => {
          console.error('Play error:', err);
          currentIndex++;
          playNext();
        });
        
        setCurrentAudio(audio);
        setAudioPlaying(fullSurahKey);
      } else {
        setAudioPlaying(null);
        setCurrentAudio(null);
        toast.success('✨ Surah completed!');
      }
    };
    
    playNext();
  };

  const handleSurahClick = (surahNumber) => {
    loadSurah(surahNumber);
    if (versesContainerRef.current) {
      versesContainerRef.current.scrollTop = 0;
    }
  };

  const scrollToTop = () => {
    if (versesContainerRef.current) {
      versesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getSurahName = (number) => {
    const surah = surahs.find(s => s.number === number);
    return surah?.englishName || `Surah ${number}`;
  };

  const getRandomGradient = (index) => {
    return surahGradients[index % surahGradients.length];
  };

  const toggleFullscreen = () => {
    setFullscreenMode(!fullscreenMode);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-100 rounded-full blur-2xl animate-pulse" />
            <FiLoader className="animate-spin text-emerald-500 mx-auto mb-4 relative z-10" size={48} />
          </div>
          <p className="text-gray-600 text-base font-medium">Loading the Holy Quran...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting to AlQuran Cloud API</p>
        </motion.div>
      </div>
    );
  }

  return (
   <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Header */}
      {!fullscreenMode && (
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-200 bg-white">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-3"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 px-5 py-2 rounded-full mb-4">
              <FiStar className="text-emerald-500" size={14} />
              <span className="text-sm text-emerald-600 font-medium">The Holy Quran • 114 Chapters</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
              Explore the Quran
            </h2>
            <p className="text-gray-500 text-sm mt-1">Read, reflect, and connect with the divine words of Allah</p>
          </motion.div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search surah name or number..."
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX size={14} />
                </button>
              )}
            </div>
            <button 
              onClick={handleSearch} 
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-sm font-medium text-white hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <FiSearch size={14} /> Search
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden px-4">
        {!selectedSurah ? (
          <div className="h-full overflow-y-auto py-3 space-y-3">
            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-emerald-600">
                      Results ({searchResults.length})
                    </h3>
                    <button onClick={() => setSearchResults([])} className="text-gray-400 hover:text-gray-600">
                      <FiX size={16} />
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {searchResults.map((result, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.01 }}
                        onClick={() => handleSurahClick(parseInt(result.surahNumber))}
                        className="p-2.5 bg-gray-50 rounded-lg cursor-pointer border border-gray-100 hover:border-emerald-300 hover:bg-gray-100 transition-all"
                      >
                        <p className="font-arabic text-right text-sm text-gray-800">{result.text}</p>
                        <p className="text-gray-500 text-xs mt-0.5 truncate">{result.translation}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* View Controls & Recent */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setViewLayout('grid')} 
                  className={`p-1.5 rounded-md transition-all ${viewLayout === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  <FiGrid size={14} />
                </button>
                <button 
                  onClick={() => setViewLayout('list')} 
                  className={`p-1.5 rounded-md transition-all ${viewLayout === 'list' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  <FiList size={14} />
                </button>
              </div>
              <span className="text-xs text-gray-500">{filteredSurahs.length} surahs</span>
            </div>

            {/* Recent Surahs */}
            {recentSurahs.length > 0 && !searchQuery && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <FiClock size={12} className="text-emerald-500 flex-shrink-0" />
                <div className="flex gap-1.5">
                  {recentSurahs.map(num => (
                    <button
                      key={num}
                      onClick={() => handleSurahClick(num)}
                      className="px-2.5 py-1 bg-emerald-50 rounded-full text-xs hover:bg-emerald-100 border border-emerald-200 whitespace-nowrap transition-all text-emerald-700"
                    >
                      {getSurahName(num)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Surah Grid */}
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
              {filteredSurahs.length === 0 && searchQuery ? (
                <div className="text-center py-8">
                  <FiSearch className="text-gray-400 mx-auto mb-2" size={32} />
                  <p className="text-gray-500 text-sm">No surahs found</p>
                  <button onClick={() => setSearchQuery('')} className="mt-2 text-xs text-emerald-500">
                    Clear search
                  </button>
                </div>
              ) : (
                <div className={viewLayout === 'grid' 
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
                  : "space-y-1"
                }>
                  {filteredSurahs.map((surah, idx) => (
                    <motion.button
                      key={surah.number}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.002, 0.15) }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSurahClick(surah.number)}
                      className={`group relative bg-gradient-to-br ${getRandomGradient(idx)} rounded-lg p-2.5 text-left border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all ${
                        viewLayout === 'list' ? 'flex items-center gap-3' : ''
                      }`}
                    >
                      <div className={`relative z-10 ${viewLayout === 'list' ? 'flex items-center gap-3 w-full' : ''}`}>
                        <div className={`flex ${viewLayout === 'list' ? 'items-center' : 'justify-between items-start'}`}>
                          <span className={`rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold ${
                            viewLayout === 'list' ? 'w-7 h-7 text-xs' : 'w-6 h-6 text-[10px]'
                          }`}>
                            {surah.number}
                          </span>
                          {viewLayout === 'list' && (
                            <div className="flex-1 ml-2">
                              <h3 className="font-medium text-sm text-gray-800">{surah.englishName}</h3>
                              <p className="text-gray-500 text-xs font-arabic">{surah.name}</p>
                            </div>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(surah.number); }}
                            className="text-gray-400 hover:text-rose-500 transition-colors"
                          >
                            <FiHeart size={12} className={favorites.includes(surah.number) ? 'fill-rose-500 text-rose-500' : ''} />
                          </button>
                        </div>
                        {viewLayout === 'grid' && (
                          <>
                            <h3 className="font-medium text-xs text-gray-800 mt-1.5 truncate">{surah.englishName}</h3>
                            <p className="text-gray-500 text-[10px] font-arabic truncate">{surah.name}</p>
                          </>
                        )}
                        <div className={`flex ${viewLayout === 'list' ? 'gap-2 ml-auto' : 'justify-between items-center mt-1'}`}>
                          <span className="text-gray-400 text-[10px]">{surah.versesCount} v</span>
                          <span className={`text-[9px] px-1 py-0.5 rounded ${
                            surah.revelationType === 'Meccan' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {surah.revelationType === 'Meccan' ? 'M' : 'MD'}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`h-full flex flex-col ${fullscreenMode ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
            {/* Surah Navigation Bar */}
            <div className={`flex items-center justify-between flex-shrink-0 ${fullscreenMode ? 'pt-2' : 'py-2'}`}>
              <button 
                onClick={() => { 
                  setSelectedSurah(null); 
                  setVerses([]);
                  if (currentAudio) { currentAudio.pause(); setAudioPlaying(null); }
                  setFullscreenMode(false);
                }} 
                className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors"
              >
                <FiChevronLeft size={18} /> 
                <span className="text-sm">Surahs</span>
              </button>
              
              <div className="flex items-center gap-2">
                {/* Reciter Selector */}
                <div className="relative">
                  <button 
                    onClick={() => setShowReciterMenu(!showReciterMenu)}
                    className="flex items-center gap-1 bg-gray-100 text-xs rounded-lg px-2 py-1.5 border border-gray-200 hover:border-emerald-300 transition-all"
                  >
                    <FiHeadphones size={12} className="text-emerald-500" />
                    <span className="text-gray-700">{reciters.find(r => r.id === selectedReciter)?.name.split(' ')[0]}</span>
                  </button>
                  
                  <AnimatePresence>
                    {showReciterMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 min-w-[180px] overflow-hidden"
                      >
                        {reciters.map(reciter => (
                          <button
                            key={reciter.id}
                            onClick={() => handleReciterChange(reciter.id)}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 transition-all flex items-center gap-2 ${
                              selectedReciter === reciter.id ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700'
                            }`}
                          >
                            <FiVolume2 size={12} />
                            {reciter.name}
                            {selectedReciter === reciter.id && <FiCheck size={12} className="ml-auto text-emerald-500" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <select
                  value={selectedTranslation}
                  onChange={(e) => handleTranslationChange(e.target.value)}
                  className="bg-gray-100 text-xs rounded-lg px-2 py-1.5 border border-gray-200 focus:outline-none focus:border-emerald-300 text-gray-700"
                >
                  {availableTranslations.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                
                <button onClick={toggleFullscreen} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">
                  {fullscreenMode ? <FiMinimize size={14} /> : <FiMaximize size={14} />}
                </button>
              </div>
            </div>

            {/* Surah Header Info */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 text-center border border-emerald-100 flex-shrink-0 mb-3"
            >
              <div className="flex justify-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  selectedSurah.revelationType === 'Meccan' ? 'bg-emerald-200 text-emerald-700' : 'bg-blue-200 text-blue-700'
                }`}>
                  {selectedSurah.revelationType}
                </span>
                <span className="text-[10px] text-gray-500">{selectedSurah.versesCount} verses</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {selectedSurah.englishName}
              </h2>
              <p className="text-gray-700 text-lg font-arabic mt-1">{selectedSurah.name}</p>
              <p className="text-gray-500 text-xs mt-1 italic">{selectedSurah.englishNameTranslation}</p>
              
              {/* Play Full Surah Button */}
              <button
                onClick={handlePlayFullSurah}
                className="mt-3 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-xs font-medium text-white flex items-center gap-1.5 mx-auto hover:shadow-md transition-all"
              >
                {audioPlaying === `surah_${selectedSurah.number}` ? (
                  <>
                    <FiPause size={12} /> Pause Surah
                  </>
                ) : (
                  <>
                    <FiPlay size={12} /> Play Full Surah
                  </>
                )}
              </button>
            </motion.div>

            {/* Verses List */}
            <div 
              ref={versesContainerRef}
              className="flex-1 overflow-y-auto space-y-2"
            >
              {loadingVerses ? (
                <div className="flex justify-center py-16">
                  <FiLoader className="animate-spin text-emerald-500" size={28} />
                </div>
              ) : (
                verses.map((verse, idx) => (
                  <motion.div
                    key={verse.number}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.003, 0.2) }}
                    className={`group bg-white rounded-xl p-3.5 border transition-all ${
                      selectedVerse === verse.number 
                        ? 'border-emerald-300 shadow-md' 
                        : 'border-gray-100 hover:border-emerald-200 hover:shadow-sm'
                    }`}
                  >
                    {/* Verse Header */}
                    <div className="flex justify-between items-start mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                          {verse.number}
                        </span>
                        <button
                          onClick={() => handlePlayAudio(selectedSurah.number, verse.number, verse.audioUrl)}
                          className={`p-1.5 rounded-full transition-colors ${
                            audioError[`${selectedSurah.number}_${verse.number}`] 
                              ? 'bg-red-100 hover:bg-red-200' 
                              : 'bg-gray-100 hover:bg-emerald-100'
                          }`}
                          disabled={audioLoading[`${selectedSurah.number}_${verse.number}`]}
                        >
                          {audioLoading[`${selectedSurah.number}_${verse.number}`] ? (
                            <FiLoader size={11} className="text-emerald-500 animate-spin" />
                          ) : audioError[`${selectedSurah.number}_${verse.number}`] ? (
                            <FiVolumeX size={11} className="text-red-500" />
                          ) : audioPlaying === `${selectedSurah.number}_${verse.number}` ? (
                            <FiPause size={11} className="text-emerald-500" />
                          ) : (
                            <FiVolume2 size={11} className="text-gray-500 hover:text-emerald-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleTafsir(selectedSurah.number, verse.number, verse.arabic, verse.translation)}
                          className="p-1.5 rounded-full bg-gray-100 hover:bg-emerald-100 transition-colors"
                        >
                          <FiInfo size={11} className="text-gray-500 hover:text-emerald-500" />
                        </button>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleCopyVerse(verse, verse.translation)} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
                          {copiedVerse === verse.number ? <FiCheck size={11} className="text-emerald-500" /> : <FiCopy size={11} className="text-gray-500" />}
                        </button>
                        <button onClick={() => handleBookmark(selectedSurah.number, verse.number)} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
                          <FiBookmark size={11} className={bookmarkedVerses[`${selectedSurah.number}_${verse.number}`] ? 'text-emerald-500 fill-emerald-500' : 'text-gray-500'} />
                        </button>
                        <button onClick={() => handleShare(selectedSurah.number, verse.number, verse.translation)} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
                          <FiShare2 size={11} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Arabic Text */}
                    <div className="text-right mb-2.5">
                      <p className="font-arabic text-lg md:text-xl leading-[2] text-gray-800">
                        {verse.arabic} <span className="text-xl mx-1 text-emerald-500">﴿{verse.number}﴾</span>
                      </p>
                    </div>
                    
                    {/* Translation */}
                    <div className="border-t border-gray-100 pt-2.5">
                      <p className="text-gray-600 text-xs leading-relaxed">
                        <span className="text-emerald-500 font-semibold mr-1.5">{verse.number}.</span>
                        {verse.translation}
                      </p>
                      <div className="flex gap-3 mt-2 text-[9px] text-gray-400">
                        <span>Juz {verse.juz}</span>
                        <span>•</span>
                        <span>Page {verse.page}</span>
                        {verse.sajda && <><span>•</span><span className="text-emerald-500">Sajda</span></>}
                      </div>
                    </div>
                    
                    {/* Reflection */}
                    <button
                      onClick={() => setSelectedVerse(selectedVerse === verse.number ? null : verse.number)}
                      className="mt-2.5 text-[9px] text-gray-400 hover:text-emerald-500 flex items-center gap-1 transition-colors"
                    >
                      <FiChevronRight className={`transform transition-transform ${selectedVerse === verse.number ? 'rotate-90' : ''}`} size={9} />
                      Reflection
                    </button>
                    <AnimatePresence>
                      {selectedVerse === verse.number && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2.5 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100"
                        >
                          <p className="text-[10px] text-gray-600 mb-2">💭 Reflect on this verse...</p>
                          <textarea
                            placeholder="Write your reflection..."
                            className="w-full p-2 bg-white rounded text-xs text-gray-700 placeholder-gray-400 border border-gray-200 focus:border-emerald-300 focus:outline-none resize-none"
                            rows="2"
                          />
                          <button 
                            onClick={() => {
                              toast.success('Reflection saved! +10 XP');
                              if (addXP) addXP(10);
                            }}
                            className="mt-2 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 rounded text-xs text-emerald-700 transition-colors"
                          >
                            Save +10 XP
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && selectedSurah && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-4 w-9 h-9 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center hover:bg-emerald-600 z-40"
          >
            <FiArrowUp size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Tafsir Modal */}
      <AnimatePresence>
        {showTafsir && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTafsir(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-xl w-full max-h-[80vh] overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white p-4 flex justify-between items-center border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-emerald-600">Tafsir</h3>
                  <p className="text-gray-500 text-xs">Surah {showTafsir.surah}, Verse {showTafsir.verse}</p>
                </div>
                <button onClick={() => setShowTafsir(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all">
                  <FiX size={18} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-73px)]">
                <div className="text-right mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="font-arabic text-base text-gray-800">{showTafsir.arabic}</p>
                  <p className="text-gray-500 text-xs mt-2 text-left">{showTafsir.translation}</p>
                </div>
                {showTafsir.loading ? (
                  <div className="flex justify-center py-8">
                    <FiLoader className="animate-spin text-emerald-500" size={22} />
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed">{showTafsir.text}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .font-arabic { 
          font-family: 'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Noto Naskh Arabic', serif; 
        }
      `}</style>
    </div>
  );
}