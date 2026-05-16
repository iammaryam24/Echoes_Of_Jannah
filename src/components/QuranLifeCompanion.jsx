// =====================================================================
// QuranLifeCompanion.jsx — Beyond Ramadan
// Single-file React component. Drop into any React project.
// =====================================================================

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft, FiBookmark, FiShare2, FiChevronLeft, FiChevronRight,
  FiRefreshCw, FiEdit2, FiTrash2, FiCheck, FiBookOpen, FiSearch,
  FiPlay, FiPause, FiLoader, FiSun, FiX, FiLifeBuoy, FiHeart
} from "react-icons/fi";

// ---------- DATA ----------

const RICH_DEFAULT_VERSES = [
  { surah: 2, verse: 286, arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", translation: "Allah does not burden a soul beyond its capacity.", reflection: "Whatever you face is divinely calibrated to your strength. Your capacity is greater than you currently believe." },
  { surah: 94, verse: 5, arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "For indeed, with hardship comes ease.", reflection: "Ease is not after hardship, it is paired with it. Look for the pockets of mercy hidden inside the difficulty itself." },
  { surah: 94, verse: 6, arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship comes ease.", reflection: "The promise is repeated for emphasis. Allah is reassuring you twice that relief is on its way." },
  { surah: 65, verse: 3, arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "Whoever relies upon Allah, He is sufficient for them.", reflection: "Tawakkul is not passivity, it is action accompanied by complete trust that Allah will handle the outcome." },
];

const RICH_DEFAULT_DUAS = [
  { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", translation: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire", source: "Quran 2:201" },
  { arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", translation: "O Allah, help me remember You, thank You, and worship You well", source: "Sunan Abu Dawud" },
  { arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", translation: "Allah is sufficient for us, and He is the best disposer of affairs", source: "Quran 3:173" },
];

const generateAllSituations = () => {
  const situations = [];

  const add = (category, title, keywords, verseData, duaData, note, tips) => {
    situations.push({
      id: situations.length + 1,
      category,
      title,
      keywords,
      verses: verseData,
      duas: duaData,
      note,
      tips,
    });
  };

  // ===== EMOTIONAL HEALTH =====
  add('Emotional Health', 'Overwhelming Anxiety',
    ['anxiety', 'panic', 'worry', 'stress'],
    [
      { surah: 13, verse: 28, arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", translation: "Verily, in the remembrance of Allah do hearts find rest.", reflection: "Dhikr rewires your neural pathways away from anxiety. Each sincere repetition brings measurable calm to your nervous system." },
      { surah: 94, verse: 5, arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "For indeed, with hardship comes ease.", reflection: "Allah pairs every difficulty with relief. This is a divine guarantee written into existence itself." },
      { surah: 94, verse: 6, arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship comes ease.", reflection: "The repetition is deliberate, doubling the certainty that ease is woven into the fabric of your hardship." },
      { surah: 2, verse: 286, arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", translation: "Allah does not burden a soul beyond its capacity.", reflection: "You possess strength greater than your current challenge. Allah knows your true capacity." },
    ],
    [
      { arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ", translation: "O Allah, I seek refuge in You from anxiety and sorrow", source: "Sahih Bukhari" },
      { arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ", translation: "O Ever-Living, O Sustainer, in Your mercy I seek relief", source: "Sunan At-Tirmidhi" },
    ],
    "Anxiety is not a weakness of faith. The prophets themselves experienced intense fear. Prophet Muhammad taught practical coping: change your physical position, perform wudu with cool water, pray two rakahs, and maintain the morning and evening adhkar.",
    ["Practice 5-4-3-2-1 grounding with dhikr", "Recite Surah Al-Fatiha seven times slowly", "Keep a worry journal with duas", "Establish a morning adhkar routine", "Perform two rakahs of nafl when panic rises"]
  );

  add('Emotional Health', 'Deep Sadness and Depression',
    ['sadness', 'depression', 'grief', 'sorrow'],
    [
      { surah: 12, verse: 86, arabic: "إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ", translation: "I only complain of my suffering and grief to Allah.", reflection: "Prophet Yaqub shows us to direct our deepest pain sincerely to Allah rather than suppressing it." },
      { surah: 94, verse: 6, arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship comes ease.", reflection: "The repetition emphasizes certainty. Ease is inherently paired with every difficulty." },
      { surah: 93, verse: 3, arabic: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ", translation: "Your Lord has not forsaken you, nor detested you.", reflection: "Depression lies about your worth. Allah's words directly counter those destructive thoughts." },
    ],
    [
      { arabic: "اللَّهُمَّ إِنِّي عَبْدُكَ وَابْنُ عَبْدِكَ", translation: "O Allah, I am Your servant, son of Your servant", source: "Musnad Ahmad" },
      { arabic: "اللَّهُمَّ اجْعَلِ الْقُرْآنَ رَبِيعَ قَلْبِي وَنُورَ صَدْرِي", translation: "O Allah, make the Quran the spring of my heart and the light of my chest", source: "Musnad Ahmad" },
    ],
    "Depression is real and acknowledged in our tradition. Prophet Yaqub wept until his eyes became white yet maintained hope. Clinical depression requires both spiritual and professional care.",
    ["Recite Surah Al-Duha daily for comfort", "Seek professional therapy alongside spiritual practices", "Join a supportive Muslim community", "Practice micro-gratitude each day", "Spend ten minutes outdoors in sunlight reciting dhikr"]
  );

  add('Emotional Health', 'Profound Loneliness',
    ['lonely', 'alone', 'isolated', 'abandoned'],
    [
      { surah: 20, verse: 46, arabic: "لَا تَخَافَا إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَى", translation: "Fear not. I am with you both, hearing and seeing.", reflection: "Divine companionship is perfect. Allah hears what you cannot voice and sees what you hide." },
      { surah: 50, verse: 16, arabic: "وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ", translation: "We are closer to him than his jugular vein.", reflection: "The distance between you and Allah is less than between your heart and brain." },
    ],
    [
      { arabic: "يَا أَنِيسَ كُلِّ وَحِيدٍ", translation: "O Companion of every lonely one", source: "Traditional Dua" },
      { arabic: "اللَّهُمَّ آنِسْ وَحْشَتِي", translation: "O Allah, comfort my loneliness", source: "Traditional Dua" },
    ],
    "Loneliness often serves as an invitation to deeper intimacy with Allah. The Prophet experienced profound isolation in the cave of Hira, yet it became the birthplace of revelation.",
    ["Schedule daily Quran time as your appointment with Allah", "Start a Quran reflection journal", "Join virtual Islamic study circles", "Volunteer at your local masjid to build connections", "Pray tahajjud and speak to Allah out loud"]
  );

  add('Emotional Health', 'Uncontrollable Anger',
    ['anger', 'furious', 'rage', 'frustrated'],
    [
      { surah: 3, verse: 134, arabic: "وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ", translation: "Those who restrain anger and pardon people.", reflection: "Restraining anger is a defining characteristic of those whom Allah loves." },
      { surah: 42, verse: 37, arabic: "وَإِذَا مَا غَضِبُوا هُمْ يَغْفِرُونَ", translation: "When they are angry, they forgive.", reflection: "Forgiveness during anger represents the highest expression of self-mastery." },
    ],
    [
      { arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ", translation: "I seek refuge in Allah from Satan, the accursed", source: "Sahih Bukhari" },
      { arabic: "اللَّهُمَّ أَذْهِبْ غَيْظَ قَلْبِي", translation: "O Allah, remove the anger from my heart", source: "Musnad Ahmad" },
    ],
    "The Prophet said: The strong person is not one who overpowers others; the strong person controls himself when angry.",
    ["Say the refuge invocation immediately", "Change your physical posture: sit, then lie down", "Perform wudu with cool water", "Practice the ten-second rule before responding", "Remove yourself physically from the situation"]
  );

  // ===== SPIRITUAL GROWTH =====
  add('Spiritual Growth', 'Maintaining Faith After Ramadan',
    ['ramadan', 'spiritual dip', 'consistency'],
    [
      { surah: 2, verse: 185, arabic: "شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ", translation: "The month of Ramadan in which the Quran was revealed.", reflection: "The Lord of Ramadan is the same Lord of Shawwal. Your connection continues." },
      { surah: 41, verse: 30, arabic: "إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا", translation: "Those who say Our Lord is Allah and remain steadfast.", reflection: "Steadfastness after Ramadan is the real measure of spiritual growth." },
    ],
    [
      { arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ", translation: "O Turner of hearts, make my heart firm upon Your religion", source: "Sunan At-Tirmidhi" },
      { arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", translation: "O Allah, help me remember You, thank You, and worship You well", source: "Sunan Abu Dawud" },
    ],
    "The post-Ramadan spiritual dip is well-documented. The companions spent six months asking Allah to accept their Ramadan, and six months asking to reach the next.",
    ["Maintain one Ramadan habit year-round", "Fast six days of Shawwal and Mondays/Thursdays", "Keep daily Quran connection", "Join a weekly Islamic study circle"]
  );

  add('Spiritual Growth', 'Struggling with Prayer Consistency',
    ['prayer', 'salah', 'missing prayer', 'distracted'],
    [
      { surah: 29, verse: 45, arabic: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ", translation: "Indeed, prayer prohibits immorality and wrongdoing.", reflection: "Prayer is your divine protection system from harmful behavior." },
      { surah: 2, verse: 45, arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", translation: "Seek help through patience and prayer.", reflection: "When life is hard, prayer is your solution, not an additional burden." },
    ],
    [
      { arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي", translation: "My Lord, make me an establisher of prayer, and my descendants too", source: "Quran 14:40" },
    ],
    "Struggling with prayer does not make you a bad Muslim, it makes you human. Shift from seeing prayer as something you have to do to something you get to do.",
    ["Focus on one prayer at a time", "Use prayer tracking apps", "Create a dedicated prayer space", "Find an accountability partner"]
  );

  // Generate remaining situations programmatically
  const categories = {
    'Relationships': [
      'Finding a Righteous Spouse', 'Marriage Communication Issues', 'Rebuilding Broken Trust',
      'In-Law Relationship Conflicts', 'Toxic Relationship Patterns', 'Long-Distance Struggles',
      'Friendship Breakups', 'Betrayal by Close Friend', 'Setting Healthy Boundaries',
      'Sibling Rivalry', 'Parent-Child Communication'
    ],
    'Life Challenges': [
      'Severe Financial Crisis', 'Overwhelming Debt Burden', 'Sudden Job Loss',
      'Business Venture Failure', 'Exam Stress and Pressure', 'Career Path Confusion',
      'Immigration and Relocation', 'Legal Problems', 'Natural Disaster Recovery',
      'Facing Gross Injustice', 'False Accusations', 'Chronic Procrastination'
    ],
    'Health and Wellness': [
      'Chronic Illness Management', 'Terminal Diagnosis', 'Chronic Pain',
      'Surgery Recovery', 'Cancer Journey', 'Fertility Challenges',
      'Pregnancy Complications', 'Postpartum Recovery', 'Eating Disorder Recovery',
      'Sleep Disorder Management', 'Weight Management'
    ],
    'Career and Purpose': [
      'Finding Life Purpose', 'Career Change', 'Workplace Discrimination',
      'Difficult Boss', 'Toxic Work Environment', 'Work-Life Balance',
      'Starting a Business', 'Unemployment', 'Burnout Prevention',
      'Imposter Syndrome', 'Fear of Public Speaking'
    ],
    'Loss and Grief': [
      'Death of a Parent', 'Death of a Spouse', 'Death of a Child',
      'Death of a Friend', 'Miscarriage and Stillbirth', 'Sudden Loss',
      'Survivor\'s Guilt', 'Grief Anniversaries', 'Helping a Grieving Friend'
    ]
  };

  Object.entries(categories).forEach(([category, titles]) => {
    titles.forEach(title => {
      add(category, title,
        [title.toLowerCase(), category.toLowerCase()],
        RICH_DEFAULT_VERSES,
        RICH_DEFAULT_DUAS,
        "Every challenge contains seeds of growth. The Prophet taught that a believer's affair is always good: in ease they are grateful, and in hardship they are patient. Your situation is divinely calibrated for your elevation.",
        ["Begin with sincere dua in the last third of the night", "Consult knowledgeable and wise believers", "Take practical steps while maintaining tawakkul", "Reflect on past blessings to fuel hope", "Read all verses related to this situation slowly, more than once"]
      );
    });
  });

  return situations;
};

const ALL_SITUATIONS = generateAllSituations();

// ---------- LOCAL STORAGE ----------
const STORAGE_KEY = "quran_companion_premium";
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { bookmarks: [], reflections: {} };
  } catch { return { bookmarks: [], reflections: {} }; }
}
function saveData(d) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
}

// ---------- AUDIO PLAYER ----------
function AudioPlayer({ surah, verse, label = "Listen to recitation" }) {
  const audioRef = useRef(null);
  const [state, setState] = useState("idle");

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause(); a.currentTime = 0;
    setState("idle");
  }, [surah, verse]);

  const url = `https://everyayah.com/data/Alafasy_128kbps/${String(surah).padStart(3,"0")}${String(verse).padStart(3,"0")}.mp3`;

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (state === "playing") { a.pause(); setState("idle"); return; }
    try { setState("loading"); a.src = url; await a.play(); setState("playing"); }
    catch { setState("error"); }
  };

  return (
    <>
      <audio ref={audioRef} preload="none"
        onEnded={() => setState("idle")}
        onError={() => setState("error")}
        onPlaying={() => setState("playing")} />
      <button onClick={toggle}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors text-sm font-semibold">
        {state === "loading" ? <FiLoader className="animate-spin" /> : state === "playing" ? <FiPause /> : <FiPlay />}
        {state === "error" ? "Audio unavailable" : state === "playing" ? "Pause" : state === "loading" ? "Loading" : label}
      </button>
    </>
  );
}

// ---------- DAILY VERSE MODAL ----------
function DailyVerseModal({ open, onClose }) {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || verse) return;
    setLoading(true);
    const num = Math.floor(Math.random() * 6236) + 1;
    fetch(`https://api.alquran.cloud/v1/ayah/${num}/editions/quran-uthmani,en.sahih`)
      .then(r => r.json())
      .then(d => {
        const ar = d.data?.[0], en = d.data?.[1];
        if (ar && en) setVerse({ arabic: ar.text, translation: en.text, surah: ar.surah.englishName, surahNum: ar.surah.number, verseNum: ar.numberInSurah });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, verse]);

  if (!open) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-[2.5rem] max-w-xl w-full p-8 md:p-10 shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-600"><FiSun /></div>
            <h3 className="text-2xl font-serif font-bold">Daily Verse</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100 transition-colors"><FiX /></button>
        </div>
        {loading || !verse ? (
          <div className="py-16 text-center text-stone-500">
            <FiLoader className="animate-spin mx-auto mb-4" size={24} />
            Loading your verse...
          </div>
        ) : (
          <>
            <p className="text-right text-3xl md:text-4xl leading-[2.2] mb-6 font-arabic text-emerald-950" dir="rtl">{verse.arabic}</p>
            <p className="italic text-lg text-gray-800 mb-6 font-serif leading-relaxed">"{verse.translation}"</p>
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">{verse.surah} — {verse.surahNum}:{verse.verseNum}</p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ---------- BROWSE VIEW ----------
function BrowseView({ situations, onSelect, data, onOpenDaily }) {
  const [search, setSearch] = useState("");

  const categories = useMemo(() => ["All", ...new Set(situations.map(s => s.category))], [situations]);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    return situations.filter(s => {
      const matchesCat = activeCategory === "All" || s.category === activeCategory;
      const matchesSearch = !search.trim() ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.keywords.some(k => k.includes(search.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [situations, search, activeCategory]);

  return (
    <div className="space-y-8 pb-12 transition-all">
      {/* Hero Section */}
      <section className="bg-emerald-600 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-emerald-100">
        <div className="absolute top-0 right-0 p-8 opacity-20"><FiLifeBuoy size={120}/></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 font-serif italic">
            What are you <span className="text-emerald-200 underline decoration-emerald-400">going through</span>?
          </h1>
          <p className="text-xl text-emerald-100/90 leading-relaxed mb-8">
            Every storm in your life has a sanctuary in the Quran. Find your anchor here.
          </p>
          
          <div className="relative group">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={22} />
            <input 
              type="text" 
              placeholder="Ask for guidance (e.g. loss, grief, success)..."
              className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl text-gray-900 shadow-xl focus:outline-none transition-all placeholder:text-gray-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Daily Verse Button */}
          <button 
            onClick={onOpenDaily}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/30 hover:bg-white/30 transition-colors text-sm font-semibold"
          >
            <FiSun size={16} /> Daily Verse
          </button>
        </div>
      </section>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button 
            key={c} 
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === c 
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                : "bg-white text-gray-600 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500">{filtered.length} situations found</p>

      {/* Situation Cards Grid - WITHOUT / PREFIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <motion.button
            key={s.id}
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => onSelect(s.id)}
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 text-left transition-all group relative"
          >
            {data.bookmarks.includes(s.id) && (
              <FiBookmark className="absolute top-4 right-4 text-emerald-600 fill-current" size={16} />
            )}
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3 block">
              {s.category}
            </span>
            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-700 font-serif">
              {s.title}
            </h3>
            <p className="text-gray-400 text-sm mt-4">
              {s.verses.length} verses of light · {s.duas.length} duas
            </p>
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FiHeart className="mx-auto text-emerald-200 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No situations found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}

// ---------- DETAIL VIEW ----------
function DetailView({ situation, onBack, data, setData }) {
  const [tab, setTab] = useState("verses");
  const [vIdx, setVIdx] = useState(0);
  const [dIdx, setDIdx] = useState(0);
  const [reflectionInput, setReflectionInput] = useState("");
  const [copied, setCopied] = useState(false);

  const isBookmarked = data.bookmarks.includes(situation.id);
  const reflections = data.reflections[situation.id] || [];

  // Scroll to top when situation changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [situation.id]);

  const toggleBookmark = () => {
    setData(d => ({
      ...d,
      bookmarks: d.bookmarks.includes(situation.id)
        ? d.bookmarks.filter(i => i !== situation.id)
        : [...d.bookmarks, situation.id]
    }));
  };

  const addReflection = () => {
    if (!reflectionInput.trim()) return;
    setData(d => ({
      ...d,
      reflections: { 
        ...d.reflections, 
        [situation.id]: [...(d.reflections[situation.id] || []), { 
          id: Date.now(), 
          text: reflectionInput, 
          date: new Date().toISOString() 
        }] 
      }
    }));
    setReflectionInput("");
  };

  const deleteReflection = (rid) => {
    setData(d => {
      const r = { ...d.reflections };
      r[situation.id] = (r[situation.id] || []).filter(x => x.id !== rid);
      if (r[situation.id].length === 0) delete r[situation.id];
      return { ...d, reflections: r };
    });
  };

  const share = (text) => {
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all"
      >
        <FiArrowLeft size={20}/> Back to situations
      </button>

      <div className="text-center">
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-4 block underline">
          {situation.category}
        </span>
        <h1 className="text-5xl font-bold text-gray-900 font-serif italic tracking-tight">
          {situation.title}
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1.5 bg-gray-50 rounded-2xl">
        {[
          { id: "verses", label: "Verses", count: situation.verses.length },
          { id: "duas", label: "Duas", count: situation.duas.length },
          { id: "guidance", label: "Guidance" },
          { id: "reflect", label: "Reflect", count: reflections.length || undefined }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id 
                ? "bg-white shadow-sm text-emerald-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                tab === t.id ? "bg-emerald-50 text-emerald-600" : "bg-gray-200 text-gray-600"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Verses Tab */}
        {tab === "verses" && (
          <motion.div key="v" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-100/50">
              <div className="flex justify-between items-center mb-8">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 text-sm">
                  #{vIdx + 1}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={toggleBookmark} 
                    className={`p-2 hover:bg-gray-100 rounded-xl transition-colors ${isBookmarked ? 'text-emerald-600' : 'text-gray-400'}`}
                  >
                    <FiBookmark size={20} className={isBookmarked ? 'fill-current' : ''} />
                  </button>
                  <button 
                    onClick={() => share(`"${situation.verses[vIdx].translation}" — Quran ${situation.verses[vIdx].surah}:${situation.verses[vIdx].verse}`)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    {copied ? <FiCheck size={20} className="text-emerald-600" /> : <FiShare2 size={20} className="text-gray-400" />}
                  </button>
                </div>
              </div>
              
              <p className="text-right font-arabic text-3xl md:text-4xl leading-[2.2] text-emerald-950 mb-8">
                {situation.verses[vIdx].arabic}
              </p>
              <p className="text-2xl font-serif italic text-gray-800 leading-relaxed">
                "{situation.verses[vIdx].translation}"
              </p>
              
              {situation.verses[vIdx].reflection && (
                <div className="mt-8 pt-8 border-t border-gray-50">
                  <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">Reflect:</p>
                  <p className="text-lg text-gray-600 leading-relaxed">{situation.verses[vIdx].reflection}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6">
              <AudioPlayer surah={situation.verses[vIdx].surah} verse={situation.verses[vIdx].verse} />
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500">{vIdx + 1} / {situation.verses.length}</span>
                <button 
                  onClick={() => setVIdx(p => p > 0 ? p - 1 : situation.verses.length - 1)} 
                  className="p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <FiChevronLeft />
                </button>
                <button 
                  onClick={() => setVIdx(p => p < situation.verses.length - 1 ? p + 1 : 0)}
                  className="px-6 py-3 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600 inline-flex items-center gap-2 transition-colors"
                >
                  Next <FiChevronRight />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Duas Tab */}
        {tab === "duas" && (
          <motion.div key="d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-100/50">
              <p className="text-right font-arabic text-3xl md:text-4xl leading-[2.2] text-emerald-950 mb-8">
                {situation.duas[dIdx].arabic}
              </p>
              <p className="text-2xl font-serif italic text-gray-800 leading-relaxed">
                "{situation.duas[dIdx].translation}"
              </p>
              <p className="mt-6 text-sm font-bold text-emerald-600 uppercase tracking-wider">
                Source: {situation.duas[dIdx].source}
              </p>
            </div>
            {situation.duas.length > 1 && (
              <div className="flex justify-center mt-6">
                <button 
                  onClick={() => setDIdx(p => p < situation.duas.length - 1 ? p + 1 : 0)}
                  className="px-6 py-3 rounded-full bg-emerald-50 text-emerald-700 font-medium inline-flex items-center gap-2 hover:bg-emerald-100 transition-colors"
                >
                  <FiRefreshCw size={14} /> Next Dua ({dIdx + 1}/{situation.duas.length})
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Guidance Tab */}
        {tab === "guidance" && (
          <motion.div key="g" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-emerald-50 rounded-[2.5rem] p-10 border border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-600"><FiBookOpen size={20} /></div>
                <h3 className="text-xl font-serif font-bold">Personal Guidance</h3>
              </div>
              <p className="text-lg leading-relaxed font-serif text-gray-700">{situation.note}</p>
            </div>
            {situation.tips?.length > 0 && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm mt-6">
                <h3 className="text-xl font-serif font-bold mb-6">Practical Steps</h3>
                <ul className="space-y-4">
                  {situation.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Reflect Tab */}
        {tab === "reflect" && (
          <motion.div key="r" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-8">
              <h3 className="text-lg font-serif font-bold mb-4">Write a reflection</h3>
              <textarea 
                value={reflectionInput} 
                onChange={e => setReflectionInput(e.target.value)}
                placeholder="What are you feeling right now? How does this verse apply to your life?"
                className="w-full h-32 p-4 bg-gray-50 rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={addReflection} 
                  disabled={!reflectionInput.trim()}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50 inline-flex items-center gap-2 transition-colors"
                >
                  <FiEdit2 size={14} /> Save Reflection
                </button>
              </div>
            </div>
            
            <h4 className="font-bold mb-4 px-2">Past Reflections ({reflections.length})</h4>
            {reflections.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">Your reflections will appear here.</p>
                <p className="text-sm text-gray-400 mt-1">This space is private and stored only on your device.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reflections.slice().reverse().map(r => (
                  <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-6 group hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                        {new Date(r.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                      <button 
                        onClick={() => deleteReflection(r.id)} 
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- ROOT COMPONENT ----------
export default function QuranLifeCompanion() {
  const [data, setData] = useState(loadData);
  const [selectedId, setSelectedId] = useState(null);
  const [dailyOpen, setDailyOpen] = useState(false);

  // Scroll to top when navigating to detail view
  useEffect(() => {
    if (selectedId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedId]);

  useEffect(() => { saveData(data); }, [data]);

  const selected = useMemo(() => ALL_SITUATIONS.find(s => s.id === selectedId), [selectedId]);

  return (
    <div style={{fontFamily: "Inter, system-ui, sans-serif"}} className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white">
      <style>{`
        .font-serif { font-family: Cormorant, Georgia, serif; }
        .font-arabic { font-family: Amiri, serif; }
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap');
      `}</style>
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {selected ? (
            <DetailView 
              situation={selected} 
              onBack={() => setSelectedId(null)} 
              data={data} 
              setData={setData} 
            />
          ) : (
            <BrowseView 
              situations={ALL_SITUATIONS} 
              onSelect={setSelectedId} 
              data={data} 
              onOpenDaily={() => setDailyOpen(true)} 
            />
          )}
        </AnimatePresence>

        <DailyVerseModal open={dailyOpen} onClose={() => setDailyOpen(false)} />
      </div>
    </div>
  );
}