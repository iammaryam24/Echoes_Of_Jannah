import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, FiBook, FiChevronLeft, FiBookmark, 
  FiInfo, FiX, FiLoader, FiHeart,
  FiChevronRight, FiClock, FiGrid,
  FiList, FiPlay, FiPause, FiCopy, FiCheck,
  FiArrowUp, FiMaximize, FiMinimize, FiHeadphones,
  FiZap, FiStar
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

const API_BASE = 'https://api.alquran.cloud/v1';

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

const reciters = [
  { id: 'ar.alafasy', name: 'Mishary Alafasy', sub: 'Traditional', baseUrl: 'https://everyayah.com/data/Alafasy_128kbps/' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdurrahman Sudais', sub: 'Makkah', baseUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/' },
  { id: 'ar.shuraym', name: 'Saud Al-Shuraim', sub: 'Haramain', baseUrl: 'https://everyayah.com/data/Saood_ash-Shuraym_128kbps/' },
  { id: 'ar.husary', name: 'Khalil Al-Husary', sub: 'Classic', baseUrl: 'https://everyayah.com/data/Husary_128kbps/' },
  { id: 'ar.minshawi', name: 'Siddiq Al-Minshawi', sub: 'Classic', baseUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/' },
  { id: 'ar.abdulbasit', name: 'Abdul Basit', sub: 'Legendary', baseUrl: 'https://everyayah.com/data/AbdulSamad_64kbps_QuranExplorer.Com/' },
  { id: 'ar.jibreel', name: 'Muhammad Jibreel', sub: 'Emotional', baseUrl: 'https://everyayah.com/data/Muhammad_Jibreel_128kbps/' },
];

export default function QuranBrowser() {
  const { userId, addXP, profile, addPatienceXP, addUserActivity } = useUser();
  const [surahs, setSurahs] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedVerses, setBookmarkedVerses] = useState({});
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
  const verseRefs = useRef({});

  const availableTranslations = [
    { id: 'en.sahih', name: 'Sahih International' },
    { id: 'en.yusufali', name: 'Yusuf Ali' },
    { id: 'en.pickthall', name: 'Pickthall' },
    { id: 'en.ahmedali', name: 'Ahmed Ali' },
  ];

  const getSurahIntroduction = (num) => {
    const data = {
      1: { 
        intro: "Al-Fatihah, 'The Opening', is the first chapter of the Quran.",
        background: "Revealed in Makkah, it serves as a core prayer in every Rakat of Salah.",
        facts: ["7 verses long", "Known as Umm al-Kitab", "Essence of the entire Quran"]
      },
      2: {
        intro: "Al-Baqarah, 'The Cow', is the longest chapter of the Quran.",
        background: "Revealed in Madinah over several years, covering law and theology.",
        facts: ["Contains Ayat al-Kursi", "286 verses", "Last two verses have special protection"]
      },
      18: {
        intro: "The Cave. A source of protection from the trials of the end times.",
        background: "Revealed in Makkah to answer three questions posed by the Quraysh.",
        facts: ["Protection from Dajjal", "Read every Friday for light", "Contains four major stories of trial"]
      },
      36: {
        intro: "Ya-Sin, often called the 'Heart of the Quran'.",
        background: "Makkan surah focusing on the existence of Allah and the resurrection.",
        facts: ["Special recitation for the dying", "Focuses on the spiritual nature of creation", "Emphasizes the Quran as a divine revelation"]
      },
      55: {
        intro: "The Most Merciful. Known as the 'Bride of the Quran'.",
        background: "Focuses on the countless favors of Allah bestowed upon humans and jinn.",
        facts: ["Repeats the verse 'Which of the favors of your Lord would you deny?' 31 times", "Mentions both Jinn and Mankind", "Describes the beauty of Jannah"]
      },
      67: {
        intro: "The Sovereignty. A source of protection in the grave.",
        background: "Meccan surah encouraging reflection on the vastness of creation.",
        facts: ["Intercedes for its reciter until they are forgiven", "Prophet ﷺ wouldn't sleep until he read it", "Focuses on the power and life of the universe"]
      },
      114: {
        intro: "An-Nas, 'Mankind', the final chapter.",
        background: "Seeking refuge in Allah from the whispers of evil.",
        facts: ["Part of the 'Mu'awwidhatayn'", "Shortest verse count in some contexts"]
      }
    };
    return data[num] || { 
      intro: "A divine revelation guiding humanity toward the straight path.",
      background: "A sacred transmission from the celestial realm.",
      facts: ["Sacred frequency active", "Contains deep spiritual wisdom", "Timeless guidance for those who reflect"]
    };
  };

  useEffect(() => {
    if (audioPlaying && versesContainerRef.current) {
      const [, verseNum] = audioPlaying.split('_');
      const verseElement = verseRefs.current[verseNum];
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [audioPlaying]);

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
      }
    } catch (error) {
      console.error('Error loading surahs:', error);
      toast.error('Failed to connect to the divine source');
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
          
          let arabicText = ayah.text;
          
          if (index === 0 && surahNumber !== 1 && surahNumber !== 9) {
            if (arabicText.startsWith(BISMILLAH)) {
              arabicText = arabicText.substring(BISMILLAH.length).trim();
            }
          }
          
          return {
            number: ayah.numberInSurah,
            arabic: arabicText,
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
        
        setTimeout(() => {
          if (versesContainerRef.current) {
            versesContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error loading surah:', error);
      toast.error('Failed to load sacred verses');
    }
    setLoadingVerses(false);
  };

  const handleReciterChange = (reciterId) => {
    setSelectedReciter(reciterId);
    setShowReciterMenu(false);
    
    if (currentAudio) {
      currentAudio.pause();
      setAudioPlaying(null);
      setCurrentAudio(null);
    }
    
    if (selectedSurah) {
      loadSurah(selectedSurah.number);
    }
    
    const selectedReciterName = reciters.find(r => r.id === reciterId)?.name || 'Unknown';
    toast.success(`🎤 Switched to ${selectedReciterName}`);
    if (addUserActivity) addUserActivity('reciter_changed');
  };

  const handleTranslationChange = (translationId) => {
    setSelectedTranslation(translationId);
    if (selectedSurah) {
      loadSurah(selectedSurah.number);
    }
  };

  const handlePlayAudio = (surahNumber, verseNumber, audioUrl) => {
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
    
    const audio = new Audio(audioUrl);
    
    audio.oncanplaythrough = () => {
      setAudioLoading(prev => ({ ...prev, [key]: false }));
      audio.play().catch(err => {
        console.error('Audio play error:', err);
        setAudioError(prev => ({ ...prev, [key]: true }));
        toast.error('Could not play audio. Trying alternative source...');
      });
      setCurrentAudio(audio);
      setAudioPlaying(key);
      
      const verseElement = verseRefs.current[verseNumber];
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    
    audio.onerror = () => {
      setAudioLoading(prev => ({ ...prev, [key]: false }));
      setAudioError(prev => ({ ...prev, [key]: true }));
      toast.error('Voice not available for this verse');
    };
    
    audio.onended = () => {
      setAudioPlaying(null);
      setCurrentAudio(null);
    };
  };

  const handlePlayFullSurah = () => {
    if (!verses.length || !selectedSurah) return;
    
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setAudioPlaying(null);
      return;
    }

    let currentIndex = 0;
    toast.success(`🎵 Playing ${selectedSurah.englishName}...`);
    
    const playNext = () => {
      if (currentIndex >= verses.length) {
        setAudioPlaying(null);
        setCurrentAudio(null);
        toast.success("✨ Alhamdulillah, Surah completion achieved!");
        if (addXP) addXP(50);
        if (addUserActivity) addUserActivity('surah_completed');
        return;
      }
      
      const verse = verses[currentIndex];
      const audioKey = `${selectedSurah.number}_${verse.number}`;
      
      if (addPatienceXP) addPatienceXP(1);
      setAudioLoading(prev => ({ ...prev, [audioKey]: true }));
      setAudioPlaying(audioKey); 
      
      const audio = new Audio(verse.audioUrl);
      setCurrentAudio(audio);
      
      const verseElement = verseRefs.current[verse.number];
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      audio.oncanplaythrough = () => {
        setAudioLoading(prev => ({ ...prev, [audioKey]: false }));
        audio.play().catch(e => {
          console.error("Audio play error", e);
          setAudioError(prev => ({ ...prev, [audioKey]: true }));
          currentIndex++;
          playNext();
        });
      };
      
      audio.onended = () => {
        currentIndex++;
        playNext();
      };
      
      audio.onerror = () => {
        setAudioLoading(prev => ({ ...prev, [audioKey]: false }));
        setAudioError(prev => ({ ...prev, [audioKey]: true }));
        currentIndex++;
        playNext();
      };
    };
    
    playNext();
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
      toast.success('✨ Verse bookmarked! +10 XP');
      if (addUserActivity) addUserActivity('verse_bookmarked');
      if (addXP) addXP(10);
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
      text: 'Seeking deep wisdom...', 
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
        setShowTafsir(prev => ({ ...prev, text: 'No detailed tafsir found for this selection.', loading: false }));
      }
    } catch (error) {
      setShowTafsir(prev => ({ ...prev, text: 'The path to this wisdom is temporarily blocked.', loading: false }));
    }
  };

  const handleCopyVerse = (verse, translation) => {
    const text = `${verse.arabic}\n\n${verse.number}. ${translation}`;
    navigator.clipboard.writeText(text);
    setCopiedVerse(verse.number);
    toast.success('Verse copied to clipboard!', { icon: '📋' });
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  const scrollToTop = () => {
    if (versesContainerRef.current) {
      versesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleFullscreen = () => {
    setFullscreenMode(!fullscreenMode);
  };

  const handleSurahClick = (surahNumber) => {
    loadSurah(surahNumber);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#059669] to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 relative shadow-2xl shadow-[#059669]/50">
            <div className="absolute inset-0 border-4 border-[#059669]/30 rounded-full animate-ping opacity-30" />
            <FiBook className="text-white" size={40} />
          </div>
          <h3 className="text-xl font-bold text-[#059669] font-serif">Illuminating Pages</h3>
          <p className="text-[#059669]/60 text-sm mt-1 max-w-xs">Preparing your spiritual sanctuary...</p>
          <div className="mt-8 flex justify-center gap-1">
             {[...Array(3)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-3 h-3 bg-[#059669] rounded-full shadow-lg shadow-[#059669]/50"
                />
             ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
<div className={`h-full w-full flex-col bg-gradient-to-br from-[#013524] via-white to-teal-50 transition-all duration-700 ${fullscreenMode ? 'fixed inset-0 z-[9999]' : ''} ${profile?.theme === 'dark' ? 'dark bg-gradient-to-br from-[#013524] via-gray-900 to-teal-950 text-white' : ''}`}>
      <header className="flex-shrink-0 bg-[#013524] backdrop-blur-xl border-b border-[#013524]/30 dark:border-[#013524]/30 px-8 lg:px-16 py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-30 shadow-2xl shadow-[#013524]/20">
        <div className="flex items-center gap-8">
          {!selectedSurah ? (
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl rotate-3 transition-transform hover:rotate-0 border-2 border-white/20">
                  <FiBook size={28} className="text-[#013524]" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter font-serif leading-none drop-shadow-lg">QURAN <span className="text-white/80 italic">DNA</span></h1>
                  <p className="text-[9px] text-white/80 font-black uppercase tracking-[0.4em] mt-1">Digital Spiritual Sanctuary</p>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => { setSelectedSurah(null); setVerses([]); setFullscreenMode(false); }}
              className="group flex items-center gap-6 py-3 pr-12 pl-3 hover:bg-white/20 rounded-[2.5rem] text-white transition-all duration-500 border-2 border-white/20 hover:border-white/40 overflow-hidden"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <FiChevronLeft size={28} className="text-[#059669]" />
              </div>
              <div className="text-left">
                <span className="block font-black text-[11px] uppercase tracking-[0.4em] text-white/80 group-hover:translate-x-1 transition-transform">Return to</span>
                <span className="block font-black text-xl tracking-tighter">THE ARCHIVES</span>
              </div>
            </button>
          )}
        </div>

        {!selectedSurah && (
          <div className="flex-1 max-w-3xl flex gap-6">
            <div className="relative flex-1 group">
              <FiSearch className="absolute left-8 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors" size={24} />
              <input 
                type="text" 
                placeholder="Identify chapter frequency..."
                className="w-full bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-[3rem] py-6 pl-20 pr-10 outline-none focus:bg-white/30 focus:ring-8 focus:ring-white/20 focus:border-white/50 transition-all text-lg font-bold text-white placeholder:text-white/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex bg-white/20 backdrop-blur-md rounded-[2rem] p-2 border-2 border-white/30 h-fit my-auto shadow-inner">
              <button onClick={() => setViewLayout('grid')} className={`p-4 rounded-2xl transition-all ${viewLayout === 'grid' ? 'bg-white text-[#059669] shadow-2xl scale-110' : 'text-white/60 hover:text-white'}`}>
                <FiGrid size={24} />
              </button>
              <button onClick={() => setViewLayout('list')} className={`p-4 rounded-2xl transition-all ${viewLayout === 'list' ? 'bg-white text-[#059669] shadow-2xl scale-110' : 'text-white/60 hover:text-white'}`}>
                <FiList size={24} />
              </button>
            </div>
          </div>
        )}

        {selectedSurah && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReciterMenu(!showReciterMenu);
                }}
                className="flex items-center gap-3 px-5 py-3 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-2xl hover:bg-white/30 hover:border-white/50 transition-all font-bold text-sm text-white active:scale-95 shadow-lg"
              >
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#059669] shadow-md">
                  <FiHeadphones size={16}/>
                </div>
                {reciters.find(r => r.id === selectedReciter)?.name.split(' ')[0] || 'Select'}
                <FiChevronRight size={14} className={`transition-transform ${showReciterMenu ? 'rotate-90' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showReciterMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReciterMenu(false);
                      }}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: -10, scale: 0.95 }} 
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-3 bg-white w-72 rounded-2xl shadow-2xl border-2 border-[#013524]/20 overflow-hidden py-3 z-50"
                    >
                      <div className="px-4 py-2 border-b border-[#013524]/10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#013524]">Select Reciter</p>
                      </div>
                      {reciters.map(r => (
                        <button 
                          key={r.id} 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReciterChange(r.id);
                          }} 
                          className={`w-full text-left px-5 py-4 text-sm font-bold hover:bg-gradient-to-r hover:from-[#013524]/10 hover:to-[#013524]/5 transition-all flex items-center justify-between group ${
                            selectedReciter === r.id ? 'bg-[#013524]/10 text-[#059669] border-l-4 border-[#059669]' : 'text-gray-600 border-l-4 border-transparent'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-bold">{r.name}</span>
                            <span className="text-[10px] text-gray-400 font-normal">{r.sub}</span>
                          </div>
                          {selectedReciter === r.id && (
                            <FiCheck size={18} className="text-[#059669]" />
                          )}
                          <div className="w-8 h-8 bg-[#059669]/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <FiHeadphones size={14} className="text-[#059669]" />
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <select 
              value={selectedTranslation} 
              onChange={(e) => handleTranslationChange(e.target.value)}
              className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-2xl px-5 py-3 text-sm font-bold text-white outline-none focus:bg-white/30 focus:border-white/50 cursor-pointer"
            >
              {availableTranslations.map(t => (
                <option key={t.id} value={t.id} className="text-gray-900">{t.name}</option>
              ))}
            </select>
            
            <button 
              onClick={toggleFullscreen} 
              className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl text-white hover:text-white transition-all active:scale-90 border-2 border-white/20 hover:border-white/40"
            >
              {fullscreenMode ? <FiMinimize size={20}/> : <FiMaximize size={20}/>}
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-hidden relative">
        {!selectedSurah ? (
          <div className="h-full overflow-y-auto px-8 md:px-12 py-12 space-y-20 bg-pattern">
            <AnimatePresence>
              {searchQuery.trim() && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="max-w-7xl mx-auto space-y-8"
                >
                  <h3 className="text-sm text-[#013524] font-black uppercase tracking-[0.4em] flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 w-fit border-2 border-[#013524]/20 shadow-lg">
                    <FiSearch className="text-[#013524]" size={20} />
                    Portal Discovery
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSurahs.map((surah) => (
                      <motion.div
                        key={surah.number}
                        whileHover={{ y: -5, scale: 1.02 }}
                        onClick={() => handleSurahClick(surah.number)}
                        className="bg-gradient-to-br from-white to-[#013524]/10 p-8 rounded-[2.5rem] border-2 border-[#013524]/30 shadow-lg hover:shadow-2xl hover:border-[#013524] cursor-pointer transition-all flex items-center gap-8 group"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#013524] to-teal-600 text-white flex items-center justify-center font-black shadow-xl shadow-[#013524]/50 group-hover:rotate-6 transition-transform border-2 border-[#013524]">
                          {surah.number}
                        </div>
                        <div className="flex-1">
                          <p className="font-serif italic font-bold text-[#013524] leading-none text-xl">{surah.englishName}</p>
                          <p className="font-quran text-2xl text-[#013524] mt-1">{surah.name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-sm text-[#013524] font-extrabold uppercase tracking-[0.5em] flex items-center gap-6 bg-white/90 backdrop-blur-sm rounded-full px-8 py-4 border-2 border-[#013524]/20 shadow-lg">
                  <FiBook className="text-[#013524]" size={20} />
                  The Eternal Library
                </h3>
                <div className="flex items-center gap-4 text-[#013524] text-xs font-black uppercase tracking-widest bg-white/80 px-6 py-3 rounded-full border-2 border-[#013524]/20">
                  <span>114 Chapters</span>
                  <div className="w-2 h-2 bg-[#013524] rounded-full shadow-lg shadow-[#013524]/50" />
                  <span>6236 Verses</span>
                </div>
              </div>

              <AnimatePresence mode='wait'>
                <motion.div 
                  key={viewLayout}
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ staggerChildren: 0.05 }}
                  className={viewLayout === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
                    : "grid grid-cols-1 gap-10"
                  }
                >
                  {filteredSurahs.map((surah, idx) => (
                    <motion.div
                      key={surah.number}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.01, 0.4), ease: [0.23, 1, 0.32, 1] }}
                      whileHover={{ y: -12, scale: 1.02 }}
                      onClick={() => handleSurahClick(surah.number)}
                      className={`group relative rounded-[3rem] p-10 text-left cursor-pointer transition-all border-2 duration-700 overflow-hidden ${
                        viewLayout === 'grid' ? 'min-h-[350px] flex flex-col justify-between' : 'flex items-center gap-16 py-12 px-20'
                      } ${
                        favorites.includes(surah.number) 
                          ? 'bg-gradient-to-br from-[#059669] to-[#003818] text-white border-[#006630] shadow-[0_40px_80px_-20px_rgba(5,150,105,0.5)]' 
                          : 'bg-[#059669] dark:bg-[#059669] text-white border-[#006630] dark:border-[#006630] hover:border-[#008040] hover:shadow-[0_50px_120px_-30px_rgba(5,150,105,0.3)] shadow-lg'
                      }`}
                    >
                      <div className="absolute top-0 right-0 p-12 opacity-0 group-hover:opacity-10 transition-all duration-1000 -rotate-12 group-hover:rotate-0 translate-x-6 scale-125">
                        <FiBook size={180} />
                      </div>

                      <div className={`flex ${viewLayout === 'grid' ? 'justify-between items-start' : 'items-center gap-8'}`}>
                        <div className="relative">
                          <div className={`absolute inset-0 blur-2xl opacity-50 rounded-full ${
                            favorites.includes(surah.number) ? 'bg-white/20' : 'bg-white/20'
                          }`} />
                          <span className={`relative w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-xl shadow-xl transition-all duration-700 ${
                            favorites.includes(surah.number) 
                              ? 'bg-white text-[#059669] rotate-12 group-hover:rotate-0 border-2 border-white' 
                              : 'bg-white/20 text-white group-hover:-rotate-3 border-2 border-white/30 shadow-white/20'
                          }`}>
                            {surah.number}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(surah.number); }} 
                          className={`p-3 rounded-[1.2rem] transition-all duration-500 ${
                            favorites.includes(surah.number) 
                              ? 'text-white/80 hover:text-white bg-white/20' 
                              : 'text-white/60 group-hover:text-white/80 hover:bg-white/10 border-2 border-transparent hover:border-white/20'
                          }`}
                        >
                          <FiHeart 
                            fill={favorites.includes(surah.number) ? "currentColor" : "none"} 
                            size={24} 
                            className={favorites.includes(surah.number) ? 'scale-110 drop-shadow-lg' : ''}
                          />
                        </button>
                      </div>

                      <div className={viewLayout === 'grid' ? 'space-y-4 mt-10' : 'flex-1'}>
                        <h3 className={`font-black tracking-tighter font-serif leading-tight ${
                          viewLayout === 'grid' ? 'text-2xl' : 'text-3xl'
                        } text-white`}>
                          {surah.englishName}
                        </h3>
                        <p className={`font-quran transition-all duration-700 ${
                          viewLayout === 'grid' ? 'text-4xl opacity-90' : 'text-5xl mt-1'
                        } text-white/90`}>
                          {surah.name}
                        </p>
                        <p className={`text-[9px] font-black uppercase tracking-[0.3em] opacity-60 group-hover:opacity-90 transition-opacity mt-4 italic text-white/70`}>
                          {surah.englishNameTranslation}
                        </p>
                      </div>

                      {viewLayout === 'grid' && (
                        <div className="flex items-center justify-between pt-8 mt-8 border-t-2 border-white/20">
                          <div className="flex flex-col">
                            <span className="text-xs font-black tracking-widest text-white/80">{surah.versesCount}</span>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50">Sacred Ayahs</span>
                          </div>
                          <span className={`text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border-2 transition-all ${
                            favorites.includes(surah.number) 
                              ? 'bg-white/20 border-white/30 text-white' 
                              : 'bg-white/20 border-white/30 text-white'
                          }`}>
                            {surah.revelationType}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col relative overflow-hidden bg-gradient-to-b from-white via-[#059669]/5 to-[#059669]/5">
            <motion.section 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#059669] via-[#059669] to-[#004d24] text-white px-12 md:px-20 py-16 relative overflow-hidden flex-shrink-0 shadow-2xl"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabic-pixels.png')] opacity-[0.08]" />
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#059669]/20 rounded-full blur-[150px] -mr-48 -mt-48" />
              <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-[#004d24]/20 rounded-full blur-[150px] -ml-24 -mb-24" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                <div className="space-y-6 max-w-4xl">
                  <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md border-2 border-white/30 px-4 py-2 rounded-full shadow-lg">
                    <FiZap className="text-white/80 animate-pulse drop-shadow-lg" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">{selectedSurah.revelationType} REVELATION • CHAPTER {selectedSurah.number}</span>
                  </div>
                  <div className="space-y-3">
                    <motion.h2 
                      initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                      className="text-5xl md:text-6xl font-black font-serif italic tracking-tighter leading-none drop-shadow-2xl"
                    >
                      {selectedSurah.englishName}
                    </motion.h2>
                    <p className="text-white/80 font-bold uppercase tracking-[0.3em] text-[10px] pl-2">Frequency of {selectedSurah.englishNameTranslation}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={handlePlayFullSurah}
                      className={`px-6 py-3 bg-white text-[#059669] rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-[#059669]/50 flex items-center gap-3 transition-all hover:-translate-y-1 active:scale-95 border-2 border-white ${
                        audioPlaying && audioPlaying.startsWith(`${selectedSurah.number}_`) ? 'ring-4 ring-white/50 bg-white' : ''
                      }`}
                    >
                      {audioPlaying && audioPlaying.startsWith(`${selectedSurah.number}_`) ? (
                        <><FiPause size={14} className="text-[#059669]"/> Suspend</>
                      ) : (
                        <><FiPlay size={14} fill="currentColor" className="text-[#059669]"/> Play Surah</>
                      )}
                    </button>
                    <div className="hidden md:flex gap-3">
                      <div className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[9px] border-2 border-white/30 flex items-center gap-3 shadow-lg">
                        <FiInfo size={12} className="text-white/80" />
                        <span>{selectedSurah.revelationType}</span>
                      </div>
                      <div className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[9px] border-2 border-white/30 flex items-center gap-3 shadow-lg">
                        <FiStar size={12} className="text-white/80" />
                        <span>{selectedSurah.versesCount} Ayahs</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t-2 border-white/20">
                    {['Introduction', 'Background', 'Interesting Facts'].map((title, i) => (
                      <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 flex items-center gap-2">
                          {i === 0 ? <FiBook size={12}/> : i === 1 ? <FiClock size={12}/> : <FiZap size={12}/>}
                          {title}
                        </h4>
                        {i === 2 ? (
                          <ul className="space-y-2">
                            {getSurahIntroduction(selectedSurah.number).facts.map((fact, j) => (
                              <li key={j} className="text-white/80 text-[11px] font-light flex items-start gap-2">
                                <div className="w-1 h-1 bg-white/60 rounded-full mt-1.5 flex-shrink-0" />
                                {fact}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-white/70 text-sm font-light italic leading-relaxed">
                            {i === 0 ? getSurahIntroduction(selectedSurah.number).intro : getSurahIntroduction(selectedSurah.number).background}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="lg:text-right">
                  <motion.p 
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 0.3 }}
                    className="font-quran text-[8rem] md:text-[12rem] leading-none cursor-default select-none transition-all duration-1000 hover:opacity-100 hover:text-glow"
                  >
                    {selectedSurah.name}
                  </motion.p>
                </div>
              </div>
            </motion.section>

            <div ref={versesContainerRef} className="flex-1 overflow-y-auto px-8 md:px-24 lg:px-48 pb-48 space-y-24 bg-gradient-to-b from-white via-[#059669]/5 to-white selection:bg-[#059669]/30 border-x-2 border-[#059669]/20 dark:border-[#059669]/40 max-w-[1400px] mx-auto scroll-smooth">
              
              {selectedSurah.number !== 1 && selectedSurah.number !== 9 && verses.length > 0 && (
                <div className="pt-20 pb-10 text-center space-y-6">
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="font-quran text-5xl md:text-6xl text-[#059669] leading-relaxed drop-shadow-lg"
                  >
                    {BISMILLAH}
                  </motion.p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#059669]" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#059669] dark:text-[#059669] italic">In the Name of Allah</p>
                    <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#059669]" />
                  </div>
                </div>
              )}

              {loadingVerses ? (
                <div className="flex flex-col items-center justify-center py-32 gap-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#059669]/30 blur-[100px] rounded-full scale-[2]" />
                    <div className="w-24 h-24 border-4 border-[#059669]/20 border-t-[#059669] rounded-full animate-spin relative z-10 shadow-2xl" />
                  </div>
                  <p className="text-[#059669] font-extrabold uppercase tracking-[0.6em] text-[10px] animate-pulse">Unfolding Celestial Archive...</p>
                </div>
              ) : (
                verses.map((verse) => (
                  <motion.div 
                    key={verse.number}
                    ref={(el) => { verseRefs.current[verse.number] = el; }}
                    initial={{ opacity: 0, y: 100 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                    className={`relative py-12 flex flex-col items-center gap-12 text-center rounded-[2rem] ${
                      audioPlaying === `${selectedSurah.number}_${verse.number}` 
                        ? 'bg-gradient-to-r from-[#059669]/10 via-[#059669]/5 to-[#059669]/10 shadow-2xl shadow-[#059669]/20 scale-[1.02] p-6 -mx-6' 
                        : ''
                    }`}
                  >
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className={`absolute inset-0 blur-2xl rounded-full ${
                          audioPlaying === `${selectedSurah.number}_${verse.number}` ? 'bg-[#059669]/50' : 'bg-[#059669]/20'
                        }`} />
                        <span className={`relative w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-xl border-2 ${
                          audioPlaying === `${selectedSurah.number}_${verse.number}`
                            ? 'bg-[#059669] text-white border-[#059669] shadow-[#059669]/50 scale-105'
                            : 'bg-[#059669] text-white border-[#059669] shadow-[#059669]/30'
                        }`}>
                          {verse.number}
                        </span>
                      </div>

                      <div className="flex gap-2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl border border-[#059669]/20 dark:border-[#059669]/30 shadow-lg">
                        <button 
                          onClick={() => handlePlayAudio(selectedSurah.number, verse.number, verse.audioUrl)} 
                          className={`p-2 rounded-lg transition-all duration-500 active:scale-90 ${
                            audioPlaying === `${selectedSurah.number}_${verse.number}` 
                              ? 'bg-[#059669] text-white shadow-md scale-105 border border-[#059669]' 
                              : 'text-[#059669] dark:text-[#059669] hover:text-white hover:bg-[#059669] dark:hover:bg-[#059669] border border-transparent hover:border-[#059669]'
                          }`}
                        >
                          {audioLoading[`${selectedSurah.number}_${verse.number}`] 
                            ? <FiLoader className="animate-spin" size={16}/> 
                            : audioPlaying === `${selectedSurah.number}_${verse.number}` 
                              ? <FiPause size={16}/> 
                              : <FiPlay size={16}/>
                          }
                        </button>
                        <button onClick={() => handleBookmark(selectedSurah.number, verse.number)} className={`p-2 rounded-lg transition-all duration-500 active:scale-90 ${
                          bookmarkedVerses[`${selectedSurah.number}_${verse.number}`] 
                            ? 'bg-[#059669]/20 dark:bg-[#059669]/30 text-[#059669] dark:text-[#059669] border border-[#059669]/30' 
                            : 'text-gray-400 dark:text-gray-500 hover:text-[#059669] hover:bg-[#059669]/10 dark:hover:bg-[#059669]/20 border border-transparent hover:border-[#059669]/20'
                        }`}>
                          <FiBookmark size={16} fill={bookmarkedVerses[`${selectedSurah.number}_${verse.number}`] ? "currentColor" : "none"}/>
                        </button>
                        <button onClick={() => handleTafsir(selectedSurah.number, verse.number, verse.arabic, verse.translation)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-[#059669] dark:hover:text-[#059669] hover:bg-[#059669]/10 dark:hover:bg-[#059669]/20 rounded-lg transition-all duration-500 active:scale-90 border border-transparent hover:border-[#059669]/20">
                          <FiInfo size={16}/>
                        </button>
                        <button onClick={() => handleCopyVerse(verse, verse.translation)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-[#059669] dark:hover:text-[#059669] hover:bg-[#059669]/10 dark:hover:bg-[#059669]/20 rounded-lg transition-all duration-500 active:scale-90 border border-transparent hover:border-[#059669]/20">
                          {copiedVerse === verse.number ? <FiCheck size={16} className="text-[#059669]"/> : <FiCopy size={16}/>}
                        </button>
                      </div>
                    </div>

                    <div className="w-full max-w-3xl mx-auto">
                      <p className={`font-quran text-2xl md:text-3xl lg:text-4xl leading-[2.2] tracking-normal font-bold text-[#013220] dark:text-[#013220] ${
                        audioPlaying === `${selectedSurah.number}_${verse.number}`
                          ? 'text-[#059669] scale-[1.02]'
                          : ''
                      }`}>
                        {verse.arabic}
                      </p>
                    </div>

                    <div className="w-full max-w-2xl mx-auto space-y-6">
                      <div className="flex items-center justify-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#059669] dark:via-[#059669] to-transparent" />
                        <div className="flex gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#059669]/60 dark:text-[#059669]/60">
                          <span>JUZ {verse.juz}</span>
                          <div className="w-0.5 h-0.5 bg-[#059669] rounded-full" />
                          <span>PAGE {verse.page}</span>
                          {verse.sajda && <><div className="w-0.5 h-0.5 bg-[#059669] rounded-full animate-pulse" /><span className="text-[#059669]">SAJDAH</span></>}
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#059669] dark:via-[#059669] to-transparent" />
                      </div>

                      <p className={`text-sm md:text-base lg:text-lg font-sans leading-relaxed font-medium px-4 text-left border-l-4 pl-5 italic ${
                        audioPlaying === `${selectedSurah.number}_${verse.number}`
                          ? 'text-[#059669] border-[#059669] bg-[#059669]/5 dark:bg-[#059669]/10'
                          : 'text-[#013220] dark:text-[#013220] border-[#059669] dark:border-[#059669]'
                      }`}>
                        "{verse.translation}"
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-10 h-10 bg-[#059669] text-white rounded-xl shadow-2xl shadow-[#059669]/30 flex items-center justify-center hover:bg-[#004d24] transition-all active:scale-95 group z-[100]"
          >
            <FiArrowUp size={18} className="group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTafsir && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#059669]/80 backdrop-blur-sm pointer-events-auto" onClick={() => setShowTafsir(null)} />
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="bg-white dark:bg-gray-800 max-w-2xl w-full max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
              <header className="px-5 py-4 bg-[#059669] text-white flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold font-serif italic">Sacred Tafsir</h3>
                  <p className="text-[9px] text-white/80 font-black uppercase tracking-wider">Surah {showTafsir.surah} • Verse {showTafsir.verse}</p>
                </div>
                <button onClick={() => setShowTafsir(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all"><FiX size={20}/></button>
              </header>
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="space-y-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-5">
                  <p className="font-quran text-xl text-[#059669] dark:text-[#059669] text-right leading-loose">{showTafsir.arabic}</p>
                  <div className="h-px bg-[#059669]/20 dark:bg-[#059669]/30" />
                  <p className="text-sm font-serif italic text-gray-600 dark:text-gray-400">"{showTafsir.translation}"</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-[#059669] dark:text-[#059669] flex items-center gap-1.5"><FiZap size={10}/> Essence Analysis</h4>
                  {showTafsir.loading ? (
                    <div className="py-10 flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-[#059669]/20 border-t-[#059669] rounded-full animate-spin" />
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Opening celestial gates...</p>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{showTafsir.text}</p>
                  )}
                </div>
              </div>
              <footer className="p-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button onClick={() => setShowTafsir(null)} className="px-4 py-1.5 bg-[#059669] text-white rounded-lg font-bold text-[10px] shadow-md hover:bg-[#004d24] transition-all">Close</button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .bg-pattern {
          background-image: radial-gradient(#059669 0.5px, transparent 0.5px);
          background-size: 32px 32px;
          background-color: #f0fdf4;
          opacity: 0.8;
        }
        .font-quran {
          font-family: "Uthmanic", "Noto Naskh Arabic", "Scheherazade New", "Traditional Arabic", "Amiri", serif;
        }
        .text-glow {
          text-shadow: 0 0 30px rgba(5, 150, 105, 0.5);
        }
      `}</style>
    </div>
  );
}