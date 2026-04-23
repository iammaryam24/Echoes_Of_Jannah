// QuranJourney.jsx - Webpage Style with Situations First

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart, FiCompass, FiStar, FiBookOpen, FiTrendingUp, 
  FiAward, FiCalendar, FiZap, FiX, FiMessageCircle, FiFeather,
  FiArrowRight, FiEdit2, FiTrash2, FiSearch, FiBell,
  FiChevronRight, FiRefreshCw, FiShare2, FiUser, FiHome,
  FiGrid, FiList, FiSettings
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

const createVerse = (surah, verse, arabic, translation) => ({ surah, verse, arabic, translation });

const SITUATIONS_LIST = [
  { id: 'anxiety', category: 'Emotional', title: 'When anxiety consumes your thoughts', emoji: '😰', keywords: ['anxious','anxiety','panic','worried','nervous','overthinking','stress','restless'], verses: [createVerse(13,28,"أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ","Verily, in the remembrance of Allah do hearts find rest.")], reflection: "Your heart is seeking peace. Take a deep breath and remember Allah." },
  { id: 'sadness', category: 'Emotional', title: 'When your heart feels heavy with sadness', emoji: '😢', keywords: ['sad','sadness','depressed','grief','sorrow','heartbroken','crying','tears'], verses: [createVerse(12,86,"إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ","I only complain of my suffering and grief to Allah.")], reflection: "Yaqub (AS) cried until his eyes turned white. Your tears are seen." },
  { id: 'loneliness', category: 'Emotional', title: 'When you feel completely alone', emoji: '🕊️', keywords: ['alone','lonely','isolated','abandoned','ignored','neglected','forsaken'], verses: [createVerse(20,46,"لَا تَخَافَا إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَى","Fear not. Indeed, I am with you both.")], reflection: "You are never truly alone. Allah is always with you." },
  { id: 'hopelessness', category: 'Emotional', title: 'When you feel like giving up', emoji: '💔', keywords: ['hopeless','despair','give up','defeated','broken','surrender','empty'], verses: [createVerse(39,53,"لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ","Do not despair of the mercy of Allah.")], reflection: "No situation is beyond Allah's mercy. As long as you're breathing, there is hope." },
  { id: 'anger', category: 'Emotional', title: 'When anger burns inside you', emoji: '😤', keywords: ['angry','anger','furious','rage','mad','annoyed','frustrated','livid'], verses: [createVerse(3,134,"وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ","Those who suppress anger and forgive people.")], reflection: "Anger is fire. Don't let it burn your peace. Forgive for Allah." },
  { id: 'fear', category: 'Emotional', title: 'When fear paralyzes you', emoji: '😨', keywords: ['fear','scared','terrified','phobia','afraid','frightened','petrified'], verses: [createVerse(3,175,"فَلَا تَخَافُوهُمْ وَخَافُونِ إِن كُنتُم مُّؤْمِنِينَ","So do not fear them, but fear Me.")], reflection: "Fear is a prison. Trust Allah and take that step. He is with the brave." },
  { id: 'guilt', category: 'Emotional', title: 'When guilt eats you alive', emoji: '😞', keywords: ['guilty','guilt','remorse','regret','ashamed','sin','wrongdoing'], verses: [createVerse(39,53,"يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ","O My servants who have transgressed against themselves.")], reflection: "Your sin is not bigger than Allah's mercy. Turn back to Him." },
  { id: 'jealousy', category: 'Emotional', title: 'When jealousy poisons your heart', emoji: '😒', keywords: ['jealous','envy','jealousy','envious','resentment','bitter','covet'], verses: [createVerse(113,5,"وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ","From the evil of the envier when he envies.")], reflection: "Jealousy burns your own heart first. Be happy for others." },
  { id: 'overwhelm', category: 'Emotional', title: 'When everything feels overwhelming', emoji: '😫', keywords: ['overwhelmed','too much','can\'t cope','drowning','burdened','exhausted'], verses: [createVerse(2,286,"لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا","Allah does not burden a soul beyond that it can bear.")], reflection: "You are stronger than you think. Allah knows what you can handle." },
  { id: 'seekingAllah', category: 'Spiritual', title: 'Wanting to get closer to Allah', emoji: '🕌', keywords: ['closer to Allah','spiritual','iman','faith','worship','prayer','near Allah'], verses: [createVerse(50,16,"وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ","We are closer to him than his jugular vein.")], reflection: "He is closer than your own breath. Turn to Him, He's already waiting." },
  { id: 'doubtingFaith', category: 'Spiritual', title: 'Having doubts about your faith', emoji: '❓', keywords: ['doubt','faith crisis','questioning','confused about islam','doubts','skeptical'], verses: [createVerse(2,2,"ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ","This is the Book about which there is no doubt.")], reflection: "Doubts are part of the journey. Ask, seek, and you will find certainty." },
  { id: 'feelingDistant', category: 'Spiritual', title: 'Feeling distant from Allah', emoji: '📉', keywords: ['distant from Allah','far','disconnected','spiritually low','dry','cold heart'], verses: [createVerse(11,114,"إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ","Good deeds erase bad deeds.")], reflection: "One sincere step towards Him, and He runs to you. It's never too late." },
  { id: 'afterSin', category: 'Spiritual', title: 'After committing a sin', emoji: '😔', keywords: ['sinned','after sin','wrongdoing','transgression','fell into sin','mistake'], verses: [createVerse(3,135,"وَالَّذِينَ إِذَا فَعَلُوا فَاحِشَةً أَوْ ظَلَمُوا أَنفُسَهُمْ ذَكَرُوا اللَّهَ فَاسْتَغْفَرُوا","Those who remember Allah and seek forgiveness.")], reflection: "The best of sinners are those who repent. Stand up, ask forgiveness, and try again." },
  { id: 'makingDua', category: 'Spiritual', title: 'Pouring your heart in dua', emoji: '🤲', keywords: ['dua','prayer','supplication','calling Allah','asking','begging'], verses: [createVerse(40,60,"ادْعُونِي أَسْتَجِبْ لَكُمْ","Call upon Me; I will respond to you.")], reflection: "Your dua is heard. The answer is coming. Maybe not how you expect, but how you need." },
  { id: 'financialHardship', category: 'Life', title: 'Struggling financially', emoji: '💰', keywords: ['money','poor','broke','financial','debt','poverty','struggling','bills'], verses: [createVerse(65,3,"وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ","He will provide for him from where he does not expect.")], reflection: "Rizq is from Allah alone. Do your part, then trust Him completely." },
  { id: 'jobLoss', category: 'Life', title: 'Losing your job', emoji: '📄', keywords: ['lost job','fired','laid off','unemployed','no work','terminated'], verses: [createVerse(65,2,"وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا","Whoever fears Allah, He will make for him a way out.")], reflection: "This door closing means a better one is opening. Keep going." },
  { id: 'examStress', category: 'Life', title: 'Exams feel overwhelming', emoji: '📚', keywords: ['exam','test','studying','grades','school','college','stress','final'], verses: [createVerse(20,25,"رَبِّ اشْرَحْ لِي صَدْرِي","My Lord, expand for me my chest.")], reflection: "Do your best, then trust Allah. The result is in His hands, not yours." },
  { id: 'brokenHeart', category: 'Relationships', title: 'Heart broken by someone', emoji: '💔', keywords: ['broken heart','heartbreak','left','rejected','dumped','divorced','ex'], verses: [createVerse(2,216,"وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ","Perhaps you dislike something which is good for you.")], reflection: "What broke you was saving you from something worse. Trust Allah's plan." },
  { id: 'deathOfLovedOne', category: 'Grief', title: 'Someone you love passes away', emoji: '🕊️', keywords: ['death','died','passed away','lost someone','funeral','bereavement','demise'], verses: [createVerse(2,156,"إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ","To Allah we belong and to Him we return.")], reflection: "They are in a better place. Your love for them is a sadaqah jariyah." },
  { id: 'illness', category: 'Health', title: 'You or a loved one is sick', emoji: '🤒', keywords: ['sick','ill','disease','hospital','doctor','covid','flu','fever'], verses: [createVerse(26,80,"وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ","When I am ill, it is He who cures me.")], reflection: "Sickness is a purification. Every pain removes a sin." },
  { id: 'gratitude', category: 'Success', title: 'Feeling deeply grateful', emoji: '🙏', keywords: ['grateful','thankful','blessed','appreciative','alhamdulillah','shukr'], verses: [createVerse(14,7,"لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ","If you are grateful, I will surely increase you.")], reflection: "Gratitude multiplies blessings. Say Alhamdulillah for everything." }
];

export default function QuranJourney() {
  const { userId, addXP, addCoins } = useUser();
  
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [showVerse, setShowVerse] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSituations, setFilteredSituations] = useState(SITUATIONS_LIST);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [reflectionText, setReflectionText] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const [showDailyVerse, setShowDailyVerse] = useState(false);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [showJournal, setShowJournal] = useState(false);
  const [stats, setStats] = useState({
    versesReceived: 0,
    reflectionsWritten: 0,
    situationsExplored: 0,
    lastVerseDate: null,
    currentStreak: 0,
    longestStreak: 0
  });

  const categories = ['all', ...new Set(SITUATIONS_LIST.map(s => s.category))];

  useEffect(() => {
    loadJournal();
    loadStats();
    checkDailyReset();
    fetchDailyVerse();
  }, [userId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = SITUATIONS_LIST.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSituations(filtered);
    } else if (selectedCategory !== 'all') {
      setFilteredSituations(SITUATIONS_LIST.filter(s => s.category === selectedCategory));
    } else {
      setFilteredSituations(SITUATIONS_LIST);
    }
  }, [searchQuery, selectedCategory]);

  const loadJournal = () => {
    const saved = localStorage.getItem(`mushaf_journal_${userId}`);
    if (saved) setJournalEntries(JSON.parse(saved));
  };

  const loadStats = () => {
    const saved = localStorage.getItem(`mushaf_stats_${userId}`);
    if (saved) setStats(JSON.parse(saved));
  };

  const saveStats = (newStats) => {
    localStorage.setItem(`mushaf_stats_${userId}`, JSON.stringify(newStats));
    setStats(newStats);
  };

  const checkDailyReset = () => {
    const lastReset = localStorage.getItem(`mushaf_daily_reset_${userId}`);
    const today = new Date().toDateString();
    if (lastReset !== today) {
      const lastRead = stats.lastVerseDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      let newStreak = stats.currentStreak;
      if (lastRead === yesterday.toDateString()) newStreak += 1;
      else if (lastRead !== today) newStreak = 1;
      saveStats({ ...stats, currentStreak: newStreak, longestStreak: Math.max(stats.longestStreak, newStreak), lastVerseDate: today });
      localStorage.setItem(`mushaf_daily_reset_${userId}`, today);
    }
  };

  const fetchDailyVerse = async () => {
    try {
      const randomSurah = Math.floor(Math.random() * 114) + 1;
      const surahResponse = await fetch(`https://api.alquran.cloud/v1/surah/${randomSurah}`);
      const surahData = await surahResponse.json();
      
      if (surahData.code === 200 && surahData.data) {
        const versesCount = surahData.data.numberOfAyahs;
        const randomVerse = Math.floor(Math.random() * versesCount) + 1;
        
        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${randomSurah}:${randomVerse}/editions/quran-uthmani,en.sahih`);
        const data = await response.json();
        
        if (data.code === 200 && data.data) {
          const arabicVerse = data.data.find(d => d.edition?.identifier === 'quran-uthmani');
          const translation = data.data.find(d => d.edition?.identifier === 'en.sahih');
          setDailyVerse({ 
            surah: randomSurah, 
            verse: randomVerse, 
            arabic: arabicVerse?.text || '', 
            translation: translation?.text || '' 
          });
        }
      }
    } catch (error) { 
      console.error('Error fetching daily verse:', error); 
    }
  };

  const findVerseForSituation = (situation) => {
    if (!situation || !situation.verses) return null;
    return situation.verses[Math.floor(Math.random() * situation.verses.length)];
  };

  const handleSituationSelect = (situation) => {
    setSelectedSituation(situation);
    setShowVerse(false);
    setCurrentVerse(null);
    setReflectionText('');
    setShowReflection(false);
    setTimeout(() => {
      const verse = findVerseForSituation(situation);
      setCurrentVerse(verse);
      setShowVerse(true);
      const newStats = { ...stats, versesReceived: stats.versesReceived + 1, situationsExplored: stats.situationsExplored + 1, lastVerseDate: new Date().toDateString() };
      saveStats(newStats);
      if (addXP) addXP(10);
      toast.success(`✨ "${situation.title}" - Allah has sent you a verse...`);
    }, 300);
  };

  const saveReflection = () => {
    if (!reflectionText.trim() || !selectedSituation || !currentVerse) return;
    const entry = { id: Date.now(), date: new Date().toISOString(), situation: selectedSituation.title, situationEmoji: selectedSituation.emoji, verse: currentVerse, reflection: reflectionText };
    const updated = [entry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem(`mushaf_journal_${userId}`, JSON.stringify(updated));
    const newStats = { ...stats, reflectionsWritten: stats.reflectionsWritten + 1 };
    saveStats(newStats);
    if (addXP) addXP(25);
    if (addCoins) addCoins(5);
    setShowReflection(false);
    setReflectionText('');
    toast.success('💭 Reflection saved! +25 XP');
  };

  const getNewVerse = () => {
    if (!selectedSituation) return;
    const verse = findVerseForSituation(selectedSituation);
    setCurrentVerse(verse);
    setShowVerse(true);
    setShowReflection(false);
    if (addXP) addXP(5);
    toast.info('A new verse has found you...');
  };

  const shareVerse = () => {
    if (!currentVerse) return;
    const shareText = `"${currentVerse.translation}"\n\n— Surah ${currentVerse.surah}, Verse ${currentVerse.verse}\n\nvia Echoes of Jannah`;
    if (navigator.share) navigator.share({ title: 'A Verse That Found Me', text: shareText });
    else { navigator.clipboard.writeText(shareText); toast.success('Verse copied!'); }
  };

  const deleteJournalEntry = (id) => {
    const updated = journalEntries.filter(entry => entry.id !== id);
    setJournalEntries(updated);
    localStorage.setItem(`mushaf_journal_${userId}`, JSON.stringify(updated));
    toast.success('Entry deleted');
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      'all': '📖', 'Emotional': '😰', 'Spiritual': '🕌', 'Relationships': '💕',
      'Life': '💪', 'Grief': '🕊️', 'Health': '🩺', 'Success': '🏆',
      'Decisions': '🤲', 'Social': '👥', 'Forgiveness': '🤝', 'Daily': '🌅', 'Faith': '❤️'
    };
    return emojis[category] || '📖';
  };

  const resetToSituations = () => {
    setSelectedSituation(null);
    setCurrentVerse(null);
    setShowVerse(false);
    setShowJournal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                <FiBookOpen className="text-white" size={18} />
              </div>
              <div>
                <span className="font-bold text-gray-800 text-lg">Echoes of Jannah</span>
                <span className="text-xs text-emerald-600 ml-2">Quran Journey</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                <FiStar className="text-emerald-500" size={14} />
                <span className="text-sm font-semibold text-emerald-700">Level {Math.floor(stats.versesReceived / 10) + 1}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition">
                <FiUser size={14} className="text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Find Your Quranic Companion</h1>
            <p className="text-emerald-100 text-base max-w-2xl mx-auto">
              Select what you're going through and receive a verse that speaks directly to your heart
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <FiTrendingUp className="text-emerald-500" size={18} />
              <span className="text-xs text-gray-400">streak</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
            <p className="text-sm text-gray-500">Day Streak</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <FiStar className="text-amber-500" size={18} />
              <span className="text-xs text-gray-400">total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.versesReceived}</p>
            <p className="text-sm text-gray-500">Verses Received</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <FiBookOpen className="text-purple-500" size={18} />
              <span className="text-xs text-gray-400">written</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.reflectionsWritten}</p>
            <p className="text-sm text-gray-500">Reflections</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <FiCompass className="text-blue-500" size={18} />
              <span className="text-xs text-gray-400">explored</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.situationsExplored}</p>
            <p className="text-sm text-gray-500">Situations</p>
          </div>
        </div>

        {/* Daily Verse Toggle */}
        <div className="mb-8">
          <button 
            onClick={() => setShowDailyVerse(!showDailyVerse)} 
            className="w-full bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <FiBell size={18} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Verse of the Day</h3>
                <p className="text-sm text-gray-500">Daily inspiration for your soul</p>
              </div>
            </div>
            <FiChevronRight size={18} className={`text-gray-400 transition-transform ${showDailyVerse ? 'rotate-90' : ''}`} />
          </button>
          
          {showDailyVerse && dailyVerse && (
            <div className="mt-3 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <p className="font-arabic text-right text-lg text-gray-800 leading-loose mb-3">{dailyVerse.arabic}</p>
              <div className="h-px bg-emerald-200 my-3" />
              <p className="text-gray-700 text-sm italic mb-2">"{dailyVerse.translation}"</p>
              <p className="text-emerald-600 text-xs font-medium">Surah {dailyVerse.surah}, Verse {dailyVerse.verse}</p>
            </div>
          )}
        </div>

        {/* Main Content Area - Situations First */}
        {!selectedSituation && !showJournal ? (
          // SITUATIONS VIEW (Default)
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Browse Life Situations</h2>
                <p className="text-gray-500 text-sm mt-1">Select what you're going through</p>
              </div>
              <button 
                onClick={() => setShowJournal(true)}
                className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition flex items-center gap-2 text-sm"
              >
                <FiBookOpen size={16} />
                View Journal ({journalEntries.length})
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-5">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder={`Search ${SITUATIONS_LIST.length}+ life situations...`} 
                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl text-gray-800 text-sm placeholder-gray-400 border border-gray-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" 
              />
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)} 
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{getCategoryEmoji(cat)}</span>
                  <span>{cat === 'all' ? 'All Categories' : cat}</span>
                </button>
              ))}
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-500 mb-4">{filteredSituations.length} situations found</p>

            {/* Situations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredSituations.map((situation) => (
                <button 
                  key={situation.id} 
                  onClick={() => handleSituationSelect(situation)} 
                  className="text-left p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-all border border-gray-100 hover:border-emerald-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm">
                      {situation.emoji}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm group-hover:text-emerald-600 transition line-clamp-2">
                        {situation.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">{situation.category}</p>
                    </div>
                    <FiArrowRight size={16} className="text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all mt-2" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : showJournal ? (
          // JOURNAL VIEW
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Spiritual Journal</h2>
                <p className="text-gray-500 text-sm mt-1">Your saved reflections</p>
              </div>
              <button 
                onClick={() => setShowJournal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-2 text-sm"
              >
                <FiCompass size={16} />
                Back to Situations
              </button>
            </div>
            
            {journalEntries.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📔</div>
                <p className="text-gray-600 text-lg mb-2">Your journal is empty</p>
                <p className="text-gray-400 text-sm mb-6">Save reflections when you receive verses</p>
                <button onClick={() => setShowJournal(false)} className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition">
                  Browse Situations →
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {journalEntries.map(entry => (
                  <div key={entry.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                      <span className="text-3xl">{entry.situationEmoji}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{entry.situation}</h4>
                        <p className="text-xs text-gray-400">
                          {new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <button 
                        onClick={() => deleteJournalEntry(entry.id)} 
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-4 mb-3">
                      <p className="font-arabic text-right text-sm text-gray-800 mb-2">{entry.verse.arabic}</p>
                      <p className="text-gray-600 text-xs italic line-clamp-2">"{entry.verse.translation.substring(0, 150)}..."</p>
                      <p className="text-emerald-600 text-xs mt-2 font-medium">
                        Surah {entry.verse.surah}, Verse {entry.verse.verse}
                      </p>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{entry.reflection}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // VERSE VIEW (When a situation is selected)
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Back Button */}
            <button 
              onClick={resetToSituations} 
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 group"
            >
              <FiArrowRight size={16} className="group-hover:-translate-x-1 transition" />
              <span className="text-sm">Back to all situations</span>
            </button>

            {/* Situation Header */}
            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
              <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center text-3xl">
                {selectedSituation?.emoji}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xl">{selectedSituation?.title}</h3>
                <p className="text-sm text-emerald-600">{selectedSituation?.category}</p>
              </div>
            </div>

            {/* Verse Display */}
            {showVerse && currentVerse && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-6">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-200 text-emerald-800 text-xs font-medium mb-4">
                  Surah {currentVerse.surah} : Verse {currentVerse.verse}
                </div>
                <p className="font-arabic text-right text-xl leading-loose text-gray-800 mb-5">
                  {currentVerse.arabic}
                </p>
                <p className="text-gray-700 text-base italic mb-5">
                  "{currentVerse.translation}"
                </p>
                <div className="flex justify-end gap-3">
                  <button onClick={getNewVerse} className="px-4 py-2 bg-white rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
                    <FiRefreshCw size={14} /> New Verse
                  </button>
                  <button onClick={shareVerse} className="px-4 py-2 bg-white rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
                    <FiShare2 size={14} /> Share
                  </button>
                  <button onClick={() => setShowReflection(true)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition shadow-sm flex items-center gap-2">
                    <FiEdit2 size={14} /> Reflect
                  </button>
                </div>
              </div>
            )}

            {/* Reflection Input */}
            {showReflection && (
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FiFeather size={16} className="text-emerald-500" /> Write Your Reflection
                </h4>
                <textarea 
                  value={reflectionText} 
                  onChange={(e) => setReflectionText(e.target.value)} 
                  placeholder="How does this verse speak to your heart? What will you do differently?" 
                  className="w-full p-4 bg-white rounded-lg text-sm text-gray-700 placeholder-gray-400 border border-gray-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 resize-none" 
                  rows="4" 
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setShowReflection(false)} className="px-5 py-2 bg-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 transition">
                    Cancel
                  </button>
                  <button onClick={saveReflection} className="px-5 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition">
                    Save Reflection +25 XP
                  </button>
                </div>
              </div>
            )}

            {/* Spiritual Guidance */}
            <div className="bg-emerald-50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FiMessageCircle size={18} className="text-emerald-600" />
                <h4 className="font-semibold text-emerald-800">Spiritual Guidance</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">{selectedSituation?.reflection}</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .font-arabic { 
          font-family: 'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Noto Naskh Arabic', serif; 
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}