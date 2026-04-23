// src/components/SpiritualDNA.jsx - Clean Professional UI (Fixed)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrendingUp, FiAward, FiCalendar, FiHeart, FiStar, FiTarget, 
  FiBookmark, FiRefreshCw, FiShield, FiCompass, FiBookOpen,
  FiShare2, FiUsers, FiActivity, FiSun, FiCloud, FiWind, FiMoon,
  FiChevronRight, FiX, FiClock, FiGrid, FiList, FiZap, FiEye,
  FiChevronLeft, FiInfo, FiGift, FiUser, FiCheckCircle
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import { useQuranAuth } from '../contexts/QuranAuthContext';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001';

// ============ PROPHET STORIES DATA ============
const PROPHETS = [
  {
    id: 1,
    name: "Prophet Muhammad ﷺ",
    nameAr: "محمد",
    image: "🕌",
    title: "The Seal of Prophets",
    description: "The final messenger who brought the Quran and completed the message of Islam.",
    fullStory: `Prophet Muhammad ﷺ was born in Mecca in 570 CE. He was known as Al-Amin (the trustworthy) even before prophethood. At age 40, he received the first revelation from Angel Jibreel in the cave of Hira. He spent 23 years spreading the message of Islam, facing persecution, migration to Madinah, and finally conquering Mecca peacefully. He taught compassion, justice, and mercy to all mankind.`,
    miracles: ["The Quran - The greatest miracle", "Splitting of the moon", "Night Journey (Isra and Mi'raj)", "Water flowing from his fingers", "Food multiplication"],
    teachings: ["Treat everyone with kindness", "Seek knowledge", "Forgive others", "Be honest", "Show mercy"],
    verses: ["And We have not sent you, [O Muhammad], except as a mercy to the worlds. (21:107)"],
    lessons: ["Patience in adversity", "Forgiveness over revenge", "Mercy to all creation", "Steadfastness in faith"],
    timeline: [
      { year: "570 CE", event: "Born in Mecca" },
      { year: "610 CE", event: "First revelation" },
      { year: "622 CE", event: "Hijrah to Madinah" },
      { year: "630 CE", event: "Conquest of Mecca" },
      { year: "632 CE", event: "Farewell pilgrimage" }
    ],
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  {
    id: 2,
    name: "Prophet Ibrahim (Abraham)",
    nameAr: "إبراهيم",
    image: "🕋",
    title: "Friend of Allah (Khalilullah)",
    description: "The father of prophets who rebuilt the Kaaba and was tested with great trials.",
    fullStory: `Prophet Ibrahim (AS) was born in Babylon. He questioned idol worship and broke the idols, leading to him being thrown into a fire which Allah made cool for him. He was commanded to leave his wife Hajar and son Isma'il in the desert, where Zamzam miraculously appeared. He was tested with the command to sacrifice his son, which he was about to fulfill when Allah replaced Isma'il with a ram.`,
    miracles: ["Fire became cool", "Zamzam water", "The ram from Paradise", "Reviving dead birds"],
    teachings: ["Absolute submission to Allah", "Trust Allah completely", "Hospitality", "Stand against falsehood"],
    verses: ["And who is better in religion than one who submits himself to Allah... (4:125)"],
    lessons: ["Complete faith", "Sacrifice for Allah", "Standing for truth", "Patience in trials"],
    timeline: [
      { year: "~2000 BCE", event: "Born in Babylon" },
      { year: "~1950 BCE", event: "Thrown into fire" },
      { year: "~1900 BCE", event: "Building of Kaaba" },
      { year: "~1850 BCE", event: "Sacrifice test" }
    ],
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  {
    id: 3,
    name: "Prophet Musa (Moses)",
    nameAr: "موسى",
    image: "🌊",
    title: "Kalimullah (One who spoke to Allah)",
    description: "The prophet who confronted Pharaoh and led the Children of Israel to freedom.",
    fullStory: `Prophet Musa (AS) was born in Egypt during Pharaoh's rule. He was saved by being placed in a basket in the Nile and raised in Pharaoh's palace. He fled to Madyan, married, and was chosen by Allah with miracles: staff turning into a serpent, hand shining white, and parting of the Red Sea. He confronted Pharaoh, led the Israelites out of Egypt, and received the Torah on Mount Sinai.`,
    miracles: ["Staff to serpent", "Radiant hand", "Parting Red Sea", "Water from rock", "Manna and Salwa"],
    teachings: ["Justice against oppression", "Patience", "Trust in Allah", "Speak truth to power"],
    verses: ["Indeed, I am Allah. There is no deity except Me... (20:14)"],
    lessons: ["Courage against tyranny", "Leadership with patience", "Repentance", "Trust in divine help"],
    timeline: [
      { year: "~1400 BCE", event: "Born in Egypt" },
      { year: "~1370 BCE", event: "Fled to Madyan" },
      { year: "~1350 BCE", event: "Received prophethood" },
      { year: "~1310 BCE", event: "Exodus from Egypt" }
    ],
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    id: 4,
    name: "Prophet Isa (Jesus)",
    nameAr: "عيسى",
    image: "⭐",
    title: "Messiah (Al-Masih)",
    description: "The miracle-working prophet born to Maryam (Mary) without a father.",
    fullStory: `Prophet Isa (AS) was miraculously born to Maryam (AS) without a father. He spoke in the cradle defending his mother. He was given the Injeel and performed many miracles by Allah's permission: healing the blind and lepers, raising the dead, and creating birds from clay. He called people to worship Allah alone and was raised to heaven.`,
    miracles: ["Speaking in cradle", "Healing blind/lepers", "Raising dead", "Creating birds from clay"],
    teachings: ["Worship Allah alone", "Humility", "Love for poor", "Forgiveness"],
    verses: ["Indeed, the example of Jesus in the sight of Allah is like that of Adam... (3:59)"],
    lessons: ["Miracles from Allah", "Humility", "Compassion", "Faith in divine power"],
    timeline: [
      { year: "~4 BCE", event: "Miraculous birth" },
      { year: "~27 CE", event: "Became prophet" },
      { year: "~30 CE", event: "Raised to heaven" },
      { year: "Future", event: "Second coming" }
    ],
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    id: 5,
    name: "Prophet Yusuf (Joseph)",
    nameAr: "يوسف",
    image: "🌟",
    title: "The Beautiful Prophet",
    description: "Known for his beauty, patience, and ability to interpret dreams.",
    fullStory: `Prophet Yusuf (AS) was the beloved son of Prophet Yaqub. His jealous brothers threw him into a well. He was sold into slavery in Egypt, falsely accused, and imprisoned. He interpreted the king's dream, was released, and became treasurer of Egypt. He was reunited with his family after decades of separation, showing patience, forgiveness, and divine wisdom.`,
    miracles: ["Dream interpretation", "Forgiveness after betrayal", "Reunion with family"],
    teachings: ["Patience in trials", "Forgiveness", "Trust Allah's plan", "Maintain dignity"],
    verses: ["Indeed, my Lord is Subtle in what He wills... (12:100)"],
    lessons: ["Patience brings reward", "Forgiveness heals", "Allah's plan is perfect", "Stay true to faith"],
    timeline: [
      { year: "~1700 BCE", event: "Dream of stars" },
      { year: "~1680 BCE", event: "Thrown into well" },
      { year: "~1650 BCE", event: "Imprisoned" },
      { year: "~1630 BCE", event: "Reunited with family" }
    ],
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  {
    id: 6,
    name: "Prophet Nuh (Noah)",
    nameAr: "نوح",
    image: "⛵",
    title: "The Patient Preacher",
    description: "Preached for 950 years and built the ark to save believers from the flood.",
    fullStory: `Prophet Nuh (AS) was sent to his people who worshipped idols. He preached for 950 years, but only a few believed. He was commanded to build an ark, and his people mocked him. When the flood came, he took pairs of animals and believers onto the ark. The ark settled on Mount Judi, and Nuh's mission saved humanity from destruction.`,
    miracles: ["Building the ark", "Survival of flood", "950 years preaching", "Animals coming in pairs"],
    teachings: ["Patience in preaching", "Trust Allah's timing", "Never give up"],
    verses: ["And We sent Noah to his people, and he remained among them a thousand years minus fifty... (29:14)"],
    lessons: ["Never give up", "Trust Allah's plan", "Save your family", "Patience is key"],
    timeline: [
      { year: "~2500 BCE", event: "Sent as prophet" },
      { year: "~2000 BCE", event: "Building ark" },
      { year: "~1990 BCE", event: "The great flood" },
      { year: "~1980 BCE", event: "Ark settled" }
    ],
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
  {
    id: 7,
    name: "Prophet Yunus (Jonah)",
    nameAr: "يونس",
    image: "🐋",
    title: "Dhun-Nun (Man of the Whale)",
    description: "Swallowed by a whale and saved through repentance and glorifying Allah.",
    fullStory: `Prophet Yunus (AS) was sent to the people of Nineveh. When they rejected his message, he left in anger without Allah's permission. He boarded a ship, and when a storm came, he was thrown overboard and swallowed by a great fish. In the darkness of the fish's belly, he prayed "La ilaha illa Anta, subhanaka inni kuntu minaz-zalimin." Allah accepted his repentance and the fish released him.`,
    miracles: ["Surviving inside the whale", "Repentance accepted", "People of Nineveh believed"],
    teachings: ["Never lose hope", "Repentance is powerful", "Patience with people"],
    verses: ["And [mention] the man of the fish, when he went off in anger... (21:87)"],
    lessons: ["Never despair", "Repent sincerely", "Trust Allah's mercy"],
    timeline: [
      { year: "~800 BCE", event: "Sent to Nineveh" },
      { year: "~790 BCE", event: "Swallowed by whale" },
      { year: "~789 BCE", event: "Repented and released" }
    ],
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200"
  },
  {
    id: 8,
    name: "Prophet Ayyub (Job)",
    nameAr: "أيوب",
    image: "🌿",
    title: "The Epitome of Patience",
    description: "Tested with loss of wealth, children, and health, yet remained grateful.",
    fullStory: `Prophet Ayyub (AS) was a wealthy, pious man with many children. Allah tested him by taking away his wealth, causing his children to die, and afflicting him with a severe disease that lasted for years. Throughout all this, he remained patient and grateful. When he finally made dua, Allah cured him, restored his wealth, and blessed him with more children.`,
    miracles: ["Patience during extreme trials", "Restoration of health", "Spring of healing water"],
    teachings: ["Patience in hardship", "Gratitude in all states", "Never complain to anyone but Allah"],
    verses: ["Indeed, We found him patient, an excellent servant... (38:44)"],
    lessons: ["Patience brings reward", "Gratitude despite trials", "Allah tests those He loves"],
    timeline: [
      { year: "~1500 BCE", event: "Blessed with wealth" },
      { year: "~1480 BCE", event: "Severe trials begin" },
      { year: "~1460 BCE", event: "Years of patience" },
      { year: "~1450 BCE", event: "Healed and restored" }
    ],
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  }
];

// ============ TRAITS DATA ============
const ALL_TRAITS = [
  { name: 'Grateful', color: '#10B981', icon: '🙏', description: 'Thankful and appreciative of blessings' },
  { name: 'Peaceful', color: '#06B6D4', icon: '🕊️', description: 'Inner calm and serenity' },
  { name: 'Hopeful', color: '#F59E0B', icon: '🌅', description: 'Optimistic about the future' },
  { name: 'Compassionate', color: '#EC4899', icon: '🤗', description: 'Caring and empathetic towards others' },
  { name: 'Reflective', color: '#8B5CF6', icon: '💭', description: 'Deep thinker and contemplative' },
  { name: 'Patient', color: '#059669', icon: '🌿', description: 'Enduring hardship with grace' },
  { name: 'Forgiving', color: '#EF4444', icon: '🤲', description: 'Willing to forgive others' },
  { name: 'Trusting', color: '#06B6D4', icon: '🤝', description: 'Complete reliance on Allah' }
];

const ALL_STRENGTHS = [
  { name: 'Quran Connection', icon: '📖' }, { name: 'Salah Consistency', icon: '🕌' },
  { name: 'Dhikr Practice', icon: '📿' }, { name: 'Charity & Giving', icon: '🎁' },
  { name: 'Knowledge Seeking', icon: '📚' }, { name: 'Good Character', icon: '💝' }
];

const ALL_SURAHS = [
  { name: 'Al-Fatiha', number: 1, benefit: 'The Opening - Cure for all ailments' },
  { name: 'Ya-Sin', number: 36, benefit: 'The heart of the Quran' },
  { name: 'Ar-Rahman', number: 55, benefit: 'Gratitude for blessings' },
  { name: 'Al-Mulk', number: 67, benefit: 'Protection in grave' },
  { name: 'Al-Ikhlas', number: 112, benefit: 'Pure monotheism' },
  { name: 'Al-Falaq', number: 113, benefit: 'Protection from evil' },
  { name: 'An-Nas', number: 114, benefit: 'Protection from whispers' }
];

const GROWTH_AREAS = [
  { name: 'Patience', icon: '🌿' }, { name: 'Gratitude', icon: '🙏' },
  { name: 'Trust in Allah', icon: '🤝' }, { name: 'Forgiveness', icon: '💝' }
];

// ============ PROPHET CARD COMPONENT ============
const ProphetCard = ({ prophet, onClick }) => {
  return (
    <div
      onClick={() => onClick(prophet)}
      className="cursor-pointer bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{prophet.image}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base">{prophet.name}</h3>
          <p className="text-emerald-600 text-xs font-arabic mb-1">{prophet.nameAr}</p>
          <p className="text-gray-500 text-xs line-clamp-2">{prophet.description}</p>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-medium">
            <span>Read Story</span>
            <FiChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ PROPHET MODAL COMPONENT ============
const ProphetModal = ({ prophet, onClose }) => {
  const [activeTab, setActiveTab] = useState('story');

  if (!prophet) return null;

  const tabs = [
    { id: 'story', label: 'Story', icon: FiBookOpen },
    { id: 'miracles', label: 'Miracles', icon: FiStar },
    { id: 'teachings', label: 'Teachings', icon: FiCompass },
    { id: 'timeline', label: 'Timeline', icon: FiClock }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition z-10">
          <FiX size={18} className="text-gray-500" />
        </button>

        <div className="text-center p-6 border-b border-gray-100">
          <div className="text-6xl mb-2">{prophet.image}</div>
          <h2 className="text-2xl font-bold text-gray-900">{prophet.name}</h2>
          <p className="text-emerald-600 text-lg font-arabic">{prophet.nameAr}</p>
          <p className="text-gray-500 text-sm mt-1">{prophet.title}</p>
        </div>

        <div className="flex flex-wrap gap-1 p-4 border-b border-gray-100 bg-gray-50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'story' && (
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed text-sm">{prophet.fullStory}</p>
              <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <h4 className="font-semibold text-emerald-800 text-sm mb-2">📜 Key Quranic Reference</h4>
                <p className="text-gray-700 italic text-sm">{prophet.verses[0]}</p>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">🌟 Lessons to Learn</h4>
                <div className="flex flex-wrap gap-2">
                  {prophet.lessons.map((lesson, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">{lesson}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'miracles' && (
            <div className="grid grid-cols-1 gap-2">
              {prophet.miracles.map((miracle, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  <span className="text-xl">✨</span>
                  <span className="text-gray-700 text-sm">{miracle}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'teachings' && (
            <div className="grid gap-2">
              {prophet.teachings.map((teaching, idx) => (
                <div key={idx} className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-gray-700 text-sm">💭 {teaching}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-3">
              {prophet.timeline.map((event, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-24 text-emerald-600 font-semibold text-sm">{event.year}</div>
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 text-sm">{event.event}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-center text-xs text-gray-500">May Allah's peace and blessings be upon all the prophets</p>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
export default function SpiritualDNA() {
  const { userId, userData, addXP } = useUser();
  const { accessToken, isAuthenticated } = useQuranAuth();
  const [loading, setLoading] = useState(false);
  const [spiritualScore, setSpiritualScore] = useState(0);
  const [activeSection, setActiveSection] = useState('dna');
  const [selectedProphet, setSelectedProphet] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [userStats, setUserStats] = useState({
    reflections: 0,
    bookmarks: 0,
    streak: 0,
    xp: 0,
    level: 1
  });
  
  const [dnaData, setDnaData] = useState({
    dominantTraits: [],
    spiritualStrengths: [],
    recommendedSurahs: [],
    areasForGrowth: []
  });

  useEffect(() => {
    loadSpiritualDNA();
  }, []);

  const loadSpiritualDNA = () => {
    setLoading(true);
    
    const reflections = userData?.reflections?.length || 0;
    const bookmarks = userData?.bookmarks?.length || 0;
    const streak = userData?.streak || 0;
    const xp = userData?.xp || 0;
    
    const score = Math.min(100, Math.floor(
      reflections * 2.5 + 
      bookmarks * 1.5 + 
      streak * 2 + 
      xp / 10
    ));
    setSpiritualScore(score);
    
    setUserStats({
      reflections,
      bookmarks,
      streak,
      xp,
      level: Math.floor(xp / 100) + 1
    });
    
    // Generate traits based on score
    let selectedTraits = [];
    if (score >= 70) {
      selectedTraits = ALL_TRAITS.filter(t => ['Grateful', 'Peaceful', 'Hopeful', 'Compassionate', 'Reflective'].includes(t.name));
    } else if (score >= 40) {
      selectedTraits = ALL_TRAITS.filter(t => ['Grateful', 'Peaceful', 'Hopeful', 'Compassionate'].includes(t.name));
    } else {
      selectedTraits = ALL_TRAITS.filter(t => ['Grateful', 'Patient'].includes(t.name));
    }
    
    const selectedStrengths = ALL_STRENGTHS.slice(0, 4);
    const selectedSurahs = ALL_SURAHS.slice(0, 4);
    const selectedGrowth = GROWTH_AREAS.slice(0, 3);
    
    setDnaData({
      dominantTraits: selectedTraits,
      spiritualStrengths: selectedStrengths,
      recommendedSurahs: selectedSurahs,
      areasForGrowth: selectedGrowth
    });
    
    setTimeout(() => setLoading(false), 500);
  };

  const refreshDNA = () => {
    setLoading(true);
    addXP(10);
    setTimeout(() => {
      loadSpiritualDNA();
      toast.success('✨ Spiritual DNA updated! +10 XP');
    }, 800);
  };

  const getSpiritualWeather = () => {
    const streak = userStats.streak;
    if (streak >= 7) return { icon: FiSun, message: 'Divine Light Shining', color: '#F59E0B' };
    else if (streak >= 3) return { icon: FiWind, message: 'Gentle Breeze of Growth', color: '#06B6D4' };
    else if (userStats.reflections > 0) return { icon: FiCloud, message: 'Clouds of Reflection', color: '#8B5CF6' };
    else return { icon: FiMoon, message: 'Beginning Your Journey', color: '#6B7280' };
  };

  const weather = getSpiritualWeather();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Analyzing your spiritual essence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full mb-4">
          <weather.icon style={{ color: weather.color }} size={14} />
          <span className="text-sm text-gray-600">{weather.message}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Spiritual DNA 🧬</h2>
        <p className="text-gray-500">A unique reflection of your spiritual journey</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveSection('dna')}
          className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
            activeSection === 'dna'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <FiActivity size={16} /> Spiritual DNA
        </button>
        <button
          onClick={() => setActiveSection('prophets')}
          className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
            activeSection === 'prophets'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <FiBookOpen size={16} /> Stories of Prophets
        </button>
      </div>

      {/* DNA Section */}
      {activeSection === 'dna' && (
        <div className="space-y-6">
          {/* Spiritual Score Card */}
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="relative inline-block">
              <svg className="w-32 h-32">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                <circle cx="64" cy="64" r="56" fill="none" stroke="#10B981" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`} strokeDashoffset={`${2 * Math.PI * 56 * (1 - spiritualScore / 100)}`}
                  transform="rotate(-90 64 64)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{spiritualScore}%</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-800 font-semibold">Level {userStats.level}</p>
              <p className="text-gray-500 text-sm mt-1">{userStats.xp} XP total</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: FiHeart, label: 'Reflections', value: userStats.reflections, color: 'text-pink-500', bg: 'bg-pink-50' },
              { icon: FiBookmark, label: 'Bookmarks', value: userStats.bookmarks, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { icon: FiActivity, label: 'Streak', value: `${userStats.streak} days`, color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: FiAward, label: 'Level', value: userStats.level, color: 'text-amber-500', bg: 'bg-amber-50' }
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} rounded-xl p-3 text-center`}>
                <stat.icon className={`${stat.color} text-lg mx-auto mb-1`} />
                <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Dominant Traits */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiStar className="text-emerald-500" size={16} /> Your Dominant Traits
            </h3>
            <div className="flex flex-wrap gap-2">
              {dnaData.dominantTraits.map((trait, i) => (
                <div key={i} className="px-3 py-1.5 rounded-lg" style={{ background: `${trait.color}15`, border: `1px solid ${trait.color}30` }}>
                  <span className="text-sm font-medium" style={{ color: trait.color }}>{trait.icon} {trait.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Surahs */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiBookOpen className="text-emerald-500" size={16} /> Recommended Surahs
            </h3>
            <div className="space-y-2">
              {dnaData.recommendedSurahs.map((surah, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800 text-sm">{surah.name}</span>
                  <span className="text-xs text-gray-500">{surah.benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Growth */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiTarget className="text-emerald-500" size={16} /> Areas for Growth
            </h3>
            <div className="flex flex-wrap gap-2">
              {dnaData.areasForGrowth.map((area, i) => (
                <span key={i} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600">{area.icon} {area.name}</span>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <button onClick={refreshDNA} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 transition text-sm font-medium">
            <FiRefreshCw size={16} /> Refresh Spiritual DNA (+10 XP)
          </button>
        </div>
      )}

      {/* Prophets Section */}
      {activeSection === 'prophets' && (
        <div className="space-y-5">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 text-center">
            <div className="text-4xl mb-2">📖</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Stories of the Prophets</h2>
            <p className="text-gray-600 text-sm">Discover the inspiring stories of Allah's messengers</p>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'}`}>
                <FiGrid size={14} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'}`}>
                <FiList size={14} />
              </button>
            </div>
            <p className="text-xs text-gray-500">{PROPHETS.length} prophets</p>
          </div>

          {/* Prophets Grid */}
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-2"}>
            {PROPHETS.map((prophet) => (
              <ProphetCard key={prophet.id} prophet={prophet} onClick={setSelectedProphet} />
            ))}
          </div>

          {/* Footer Quote */}
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            <p className="text-emerald-600 text-xs mb-1">Featured Quranic Verse</p>
            <p className="text-gray-600 text-xs">"And each story of the messengers We relate to you to strengthen your heart thereby..."</p>
            <p className="text-gray-400 text-[10px] mt-1">(Surah Hud, 11:120)</p>
          </div>
        </div>
      )}

      {/* Prophet Modal */}
      {selectedProphet && (
        <ProphetModal prophet={selectedProphet} onClose={() => setSelectedProphet(null)} />
      )}

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