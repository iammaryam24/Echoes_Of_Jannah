import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, ChevronRight, Heart, Star, 
  Bookmark, Calendar, Clock, MapPin, Share2, 
  Search, Shield, Award, Compass, LifeBuoy,
  BookOpen, Sparkles, Droplets, BarChart2, Users,
  ArrowRight, MessageCircle, RefreshCw, Loader2,
  CheckCircle2, Quote, Globe, Zap, Trash2,
  Sun, Moon, CloudRain, Sunrise, Wind, Layout, User, Settings,
  Hash, Bell, Mic, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import { quranApi } from '../api/quranApi';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip 
} from 'recharts';
import anime from 'animejs';

// Add Quran Font
const quranFontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Outfit:wght@200;400;600;800&display=swap');
  .font-arabic {
    font-family: 'Noto Naskh Arabic', 'Amiri', 'Traditional Arabic', serif;
    font-weight: 500;
    line-height: 1.8;
    letter-spacing: 0.02em;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  :root {
    --font-serif: 'Cormorant Garamond', serif;
    --font-sans: 'Outfit', sans-serif;
  }
  html {
    scroll-behavior: smooth;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = quranFontStyle;
  document.head.appendChild(style);
}

const FEATURE_PORTALS = [
  { id: 'mirror', label: 'Heart Mirror', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Find verses that match your current emotional state with high precision.' },
  { id: 'quran', label: 'Holy Quran', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Read, listen, and contemplate the divine text in its original glory.' },
  { id: 'journey', label: 'Life Companion', icon: Compass, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Map your life events to eternal scriptures and see your story unfold.' },
  { id: 'dna', label: 'Spiritual DNA', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-50', desc: 'Understand your spiritual strengths through advanced analytics and tracking.' },
];

const EMOTIONS = [
  { id: 'grateful', icon: Heart, label: 'Grateful', surah: 14, verse: 7, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 'joyful', icon: Sun, label: 'Joyful', surah: 10, verse: 58, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'peaceful', icon: Wind, label: 'Peaceful', surah: 13, verse: 28, color: 'text-sky-500', bg: 'bg-sky-50' },
  { id: 'sad', icon: CloudRain, label: 'Sad', surah: 12, verse: 86, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'anxious', icon: Zap, label: 'Anxious', surah: 9, verse: 40, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'hopeful', icon: Sunrise, label: 'Hopeful', surah: 39, verse: 53, color: 'text-orange-500', bg: 'bg-orange-50' },
];

const TESTIMONIALS = [
  { name: 'Adil K.', role: 'Seeker', content: 'Echoes of Jannah has transformed how I read the Quran. It feels like the Book is speaking directly to my daily life.' },
  { name: 'Sarah M.', role: 'Student', content: 'The Heart Mirror is incredible. Finding comfort in verses during my low moments has been a game-changer.' },
  { name: 'Omar J.', role: 'Teacher', content: 'A beautiful bridge between our modern world and the timeless wisdom of Islam. Highly recommended.' },
];

const DIVINE_NAMES = [
  { arabic: "ٱلْرَّحْمَٰنُ", transliteration: "Ar-Rahman", meaning: "The Most Gracious" },
  { arabic: "ٱلْرَّحِيْمُ", transliteration: "Ar-Raheem", meaning: "The Most Merciful" },
  { arabic: "ٱلْمَلِكُ", transliteration: "Al-Malik", meaning: "The King and Sovereign" },
  { arabic: "ٱلْقُدُّوسُ", transliteration: "Al-Quddus", meaning: "The Most Holy" },
  { arabic: "ٱلسَّلَامُ", transliteration: "As-Salam", meaning: "The Source of Peace" },
];

function Counter({ value, label }) {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl md:text-4xl font-bold text-emerald-600 tabular-nums">{display}</span>
      <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">{label}</span>
    </div>
  );
}

function SpiritualDNA({ events }) {
  const data = EMOTIONS.map(e => ({
    subject: e.label,
    A: events.filter(event => event.emotion === e.id).length * 10 + 20,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-[350px] md:h-[450px] bg-gradient-to-br from-gray-50 to-white rounded-3xl md:rounded-[3rem] border border-gray-100 p-6 md:p-10 relative overflow-hidden group shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.03),transparent)] pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full">
         <div className="flex justify-between items-start mb-6 md:mb-8">
            <div className="space-y-1">
               <span className="text-[10px] md:text-xs font-black text-emerald-400 uppercase tracking-[0.5em]">Neural Resonance</span>
               <h3 className="text-2xl md:text-3xl font-bold font-serif text-gray-900">Spiritual DNA</h3>
            </div>
            <Activity className="text-emerald-500 animate-pulse" size={22} />
          </div>
         <div className="flex-1 min-h-[220px] md:min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                <PolarGrid stroke="rgba(0,0,0,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(0,0,0,0.3)', fontSize: 9, fontWeight: 900 }} />
                <Radar
                  name="Soul Flow"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
}

function SacredBreath() {
  const [phase, setPhase] = useState('Inhale');
  
  useEffect(() => {
    const cycle = async () => {
      while (true) {
        setPhase('Inhale');
        await new Promise(r => setTimeout(r, 4000));
        setPhase('Hold');
        await new Promise(r => setTimeout(r, 2000));
        setPhase('Exhale');
        await new Promise(r => setTimeout(r, 4000));
        setPhase('Hold');
        await new Promise(r => setTimeout(r, 2000));
      }
    };
    cycle();
  }, []);

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 p-6 md:p-8 flex flex-col items-center justify-center gap-4 md:gap-6 group hover:border-emerald-200 transition-all duration-700 shadow-sm min-h-[280px] md:min-h-[320px]">
       <div className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em] opacity-60">Sacred Rhythm</div>
       <div className="relative flex items-center justify-center">
          <motion.div 
            animate={{ 
              scale: phase === 'Inhale' ? 1.5 : phase === 'Exhale' ? 1 : 1.5,
              opacity: phase === 'Hold' ? 0.8 : 1
            }}
            transition={{ duration: phase === 'Hold' ? 2 : 4, ease: "easeInOut" }}
            className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-emerald-100 border border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-[0.3em]">{phase}</span>
          </div>
       </div>
       <p className="text-[9px] md:text-[10px] text-gray-400 text-center font-light leading-relaxed italic max-w-[160px]">Synchronize with cosmic pulse</p>
    </div>
  );
}

function DivineTasbih() {
  const [count, setCount] = useState(0);
  const [scale, setScale] = useState(1);

  const increment = () => {
    setCount(prev => prev + 1);
    setScale(0.9);
    setTimeout(() => setScale(1), 100);
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 p-6 md:p-8 flex flex-col items-center justify-center gap-4 md:gap-6 group hover:border-emerald-200 transition-all duration-700 shadow-sm">
      <div className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em] opacity-60">Resonance Count</div>
      <motion.button 
        style={{ scale }}
        onClick={increment}
        className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-emerald-200 flex flex-col items-center justify-center relative overflow-hidden group/btn bg-emerald-50"
      >
        <div className="absolute inset-0 bg-emerald-100/30 group-hover/btn:bg-emerald-100/50 transition-colors" />
        <span className="text-2xl md:text-4xl font-black text-emerald-600 tabular-nums">{count}</span>
      </motion.button>
      <div className="flex gap-1 md:gap-2 flex-wrap justify-center">
        {Array.from({ length: 33 }).map((_, i) => (
          <div key={i} className={`w-1 h-2 md:h-3 rounded-full transition-all duration-500 ${i < (count % 33) ? "bg-emerald-500 scale-110" : "bg-gray-200"}`} />
        ))}
      </div>
      <button onClick={() => setCount(0)} className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] hover:text-emerald-600 transition-colors">Reset Cycle</button>
    </div>
  );
}

function LuminousAttributes() {
  const [index, setIndex] = useState(0);
  const name = DIVINE_NAMES[index];

  const nextName = () => {
    setIndex((prev) => (prev + 1) % DIVINE_NAMES.length);
  };

  return (
    <section className="w-full px-4 sm:px-8 py-12 md:py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8 md:mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 md:gap-3 px-4 py-1.5 md:px-5 md:py-2 bg-amber-50 rounded-full border border-amber-100 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-amber-600">
             Luminous Reflection
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 font-serif">Attributes of <br/><span className="text-emerald-600 italic">The Infinite</span></h2>
        </div>

        <div 
          onClick={nextName}
          className="group cursor-pointer relative bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-8 md:p-12 shadow-xl hover:shadow-emerald-500/10 transition-all duration-700 overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10" />
          <AnimatePresence mode="wait">
            <motion.div 
              key={name.arabic}
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 relative z-10"
            >
              <div className="text-5xl md:text-7xl lg:text-8xl font-arabic text-gray-900 drop-shadow-xl select-none group-hover:text-emerald-600 transition-colors duration-700">
                {name.arabic}
              </div>
              <div className="space-y-2">
                <div className="text-xl md:text-2xl lg:text-3xl font-bold font-serif text-emerald-600 tracking-tight uppercase">
                  {name.transliteration}
                </div>
                <div className="text-base md:text-lg text-gray-400 italic font-light">
                   “{name.meaning}”
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="text-[8px] md:text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] md:tracking-[0.5em] group-hover:text-emerald-400 group-hover:tracking-[0.7em] transition-all duration-700">
              Tap to Recalibrate
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-gray-100 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function LifeTimeline() {
  const navigate = useNavigate();
  const { userData, addXP, reflections, streak, level } = useUser();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', emotion: '', description: '', location: '' });
  const [dailyVerse, setDailyVerse] = useState(null);
  const [loadingVerse, setLoadingVerse] = useState(false);
  
  const heroRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('timeline_events');
    if (saved) setEvents(JSON.parse(saved));
    fetchDailyVerse();

    // ANIME.JS ANIMATIONS FOR HERO
    const timeline = anime.timeline({
      easing: 'easeOutExpo',
      duration: 1200
    });

    timeline.add({
      targets: '.hero-badge',
      translateY: [40, 0],
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 800
    }, 0);

    const titleLetters = document.querySelectorAll('.hero-title .letter');
    if (titleLetters.length) {
      timeline.add({
        targets: titleLetters,
        translateY: [100, 0],
        rotateX: [90, 0],
        opacity: [0, 1],
        delay: anime.stagger(35),
        duration: 1000
      }, '-=600');
    }

    const descWords = document.querySelectorAll('.hero-desc .word');
    if (descWords.length) {
      timeline.add({
        targets: descWords,
        opacity: [0, 1],
        translateY: [30, 0],
        delay: anime.stagger(30),
        duration: 800
      }, '-=800');
    }

    const heroBtns = document.querySelectorAll('.hero-btn');
    if (heroBtns.length) {
      timeline.add({
        targets: heroBtns,
        translateY: [50, 0],
        opacity: [0, 1],
        scale: [0.9, 1],
        delay: anime.stagger(150),
        duration: 700
      }, '-=600');
    }

    const decorations = document.querySelectorAll('.hero-decoration');
    if (decorations.length) {
      timeline.add({
        targets: decorations,
        scale: [0, 1],
        opacity: [0, 0.4],
        duration: 1500
      }, '-=1000');
    }

    anime({
      targets: '.hero-decoration',
      translateY: [
        { value: -20, duration: 2000 },
        { value: 20, duration: 2000 }
      ],
      rotate: [
        { value: -5, duration: 2000 },
        { value: 5, duration: 2000 }
      ],
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });

    document.querySelectorAll('.portal-card').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        anime({
          targets: el,
          rotateX: rotateX,
          rotateY: rotateY,
          scale: 1.02,
          duration: 400,
          easing: 'easeOutQuad'
        });

        const icon = el.querySelector('.portal-icon');
        if (icon) {
          anime({
            targets: icon,
            translateX: (x - centerX) / 15,
            translateY: (y - centerY) / 15,
            duration: 400,
            easing: 'easeOutQuad'
          });
        }
      });

      el.addEventListener('mouseleave', () => {
        anime({
          targets: el,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 800,
          easing: 'spring(1, 80, 10, 0)'
        });
        const icon = el.querySelector('.portal-icon');
        if (icon) {
          anime({
            targets: icon,
            translateX: 0,
            translateY: 0,
            duration: 800
          });
        }
      });
    });

    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        anime({
          targets: btn,
          translateX: x * 0.3,
          translateY: y * 0.3,
          duration: 100,
          easing: 'easeOutQuad'
        });
      });
      btn.addEventListener('mouseleave', () => {
        anime({
          targets: btn,
          translateX: 0,
          translateY: 0,
          duration: 800,
          easing: 'spring(1, 80, 10, 0)'
        });
      });
    });

  }, []);

  const fetchDailyVerse = async () => {
    setLoadingVerse(true);
    try {
      const randomVerseNum = Math.floor(Math.random() * 286) + 1;
      const verse = await quranApi.getVerse(2, randomVerseNum); 
      setDailyVerse(verse?.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVerse(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.emotion) return toast.error('Required fields missing');
    
    const emotionData = EMOTIONS.find(e => e.id === newEvent.emotion);
    if (!emotionData) return;
    
    try {
      const verse = await quranApi.getVerse(emotionData.surah, emotionData.verse);
      
      const event = {
        ...newEvent,
        id: Date.now().toString(),
        quranMatch: {
          ...emotionData,
          verseText: verse?.data.text,
          arabic: verse?.data.arabic,
          surahName: `Surah ${emotionData.surah}`
        },
        createdAt: new Date().toISOString()
      };

      const updated = [event, ...events];
      localStorage.setItem('timeline_events', JSON.stringify(updated));
      setEvents(updated);
      setShowAddModal(false);
      setNewEvent({ title: '', emotion: '', description: '', location: '' });
      addXP(25);
      toast.success('Chapter added! +25 XP');
    } catch (err) {
      toast.error('Failed to fetch sacred matching verse');
    }
  };

  const handleDeleteEvent = (eventId, e) => {
    e.stopPropagation();
    const updated = events.filter(event => event.id !== eventId);
    localStorage.setItem('timeline_events', JSON.stringify(updated));
    setEvents(updated);
    if (selectedEventId === eventId) setSelectedEventId(null);
    toast.success('Chapter removed');
  };

  const splitText = (text) => {
    return text.split('').map((char, index) => (
      <span key={index} className="letter inline-block">
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  const splitWords = (text) => {
    return text.split(' ').map((word, index) => (
      <span key={index} className="word inline-block mr-2">{word}</span>
    ));
  };

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openRecordModal = () => {
    setShowAddModal(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#fcfcf9] min-h-screen overflow-x-hidden">
   {/* HERO SECTION */}
<section ref={heroRef} className="relative min-h-[75vh] flex items-center justify-center pt-12 pb-12 overflow-hidden">
  <div className="absolute inset-0 z-0">
     <div className="hero-decoration absolute top-1/4 left-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-emerald-100 rounded-full blur-[100px] md:blur-[150px] opacity-30" />
     <div className="hero-decoration absolute bottom-1/4 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-amber-100 rounded-full blur-[80px] md:blur-[120px] opacity-20" />
  </div>

  <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 text-center space-y-8 md:space-y-12">
     <div className="hero-badge opacity-0 inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 shadow-sm text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">
       <Sparkles size={12} className="text-emerald-500" /> Transform Your Spiritual Presence
     </div>
     
     <h1 className="hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] text-gray-900 font-serif">
       <div className="overflow-hidden py-2">The Eternal </div>
       <div className="overflow-hidden py-2">
         <span className="text-emerald-600 italic font-medium relative inline-block">
           Reflecting Mirror
           <svg className="absolute -bottom-3 left-0 w-full h-2 text-emerald-200/50" viewBox="0 0 100 10" preserveAspectRatio="none">
             <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
           </svg>
         </span>
       </div>
     </h1>
     
     <p className="hero-desc text-lg md:text-xl lg:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed px-2">
       {splitWords("Synchronize your temporal flow with the uncreated wisdom of the stars. Experience faith as a living, breathing dialogue.")}
     </p>
     
     <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-6 md:pt-8">
       <button 
         onClick={openRecordModal}
         className="hero-btn opacity-0 px-8 py-3 md:px-10 md:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 group text-base md:text-lg magnetic-btn"
       >
         Start Your Narrative <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
       </button>
       <button 
         onClick={() => handleNavigate('/journey')}
         className="hero-btn opacity-0 px-8 py-3 md:px-10 md:py-4 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 rounded-xl font-bold shadow-sm transition-all text-base md:text-lg flex items-center gap-2 magnetic-btn"
       >
         Explore Portals <ArrowRight size={18} className="text-emerald-500" />
       </button>
     </div>
  </div>
</section>

      {/* PORTALS SECTION */}
      <section className="w-full px-4 sm:px-8 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <span className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-[0.5em]">Celestial EntryPoints</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-gray-900 tracking-tight mt-3">Active Portals</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {FEATURE_PORTALS.map((portal, idx) => (
              <div
                key={portal.id}
                className="portal-card group bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all text-left flex flex-col h-full relative overflow-hidden cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
                onClick={() => handleNavigate(`/${portal.id === 'timeline' ? '' : portal.id}`)}
              >
                <div className="portal-icon absolute top-0 right-0 p-4 md:p-6 opacity-0 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-500">
                   <portal.icon size={100} />
                </div>
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl ${portal.bg} ${portal.color} flex items-center justify-center mb-5 md:mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                   <portal.icon size={32} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors font-serif mb-3">{portal.label}</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed flex-1">{portal.desc}</p>
                <div className="mt-6 md:mt-8 flex items-center gap-2 text-xs md:text-sm font-black text-emerald-600 uppercase tracking-widest pt-5 border-t border-gray-100">
                   Explore Portal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VERSE OF THE DAY */}
      <section className="w-full px-4 sm:px-8 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl md:rounded-[3rem] border border-emerald-50 shadow-xl p-6 md:p-10 lg:p-14 relative overflow-hidden flex flex-col lg:flex-row items-center gap-8 md:gap-12">
            <div className="lg:w-1/3 space-y-5 md:space-y-7 relative z-10 text-center lg:text-left">
               <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.3em] border border-emerald-100 w-fit mx-auto lg:mx-0">
                 <Globe size={12} className="animate-pulse" /> Celestial Sync
               </div>
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 font-serif leading-tight">Daily <br/><span className="text-emerald-600 italic">Light</span></h2>
               <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed">Direct transmission for recalibrating your soul's resonance today.</p>
               
               <button 
                 onClick={fetchDailyVerse} 
                 disabled={loadingVerse}
                 className="px-8 py-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center gap-3 mx-auto lg:mx-0 hover:bg-gray-800 magnetic-btn"
               >
                 {loadingVerse ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                 Recalibrate
               </button>
            </div>

            <div className="flex-1 w-full bg-gray-50/50 p-6 md:p-10 rounded-2xl md:rounded-[2rem] border border-emerald-50/50 relative z-10">
               {dailyVerse ? (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-10">
                    <p className="text-right font-arabic text-2xl md:text-3xl lg:text-4xl leading-[1.8] md:leading-[2] text-gray-900 font-medium break-words">
                      {dailyVerse.arabic}
                    </p>
                    <div className="space-y-4 md:space-y-6 relative pt-4 border-t border-emerald-100">
                      <Quote size={40} className="text-emerald-200 absolute -left-6 -top-6 opacity-50" />
                      <div className="relative text-lg md:text-xl lg:text-2xl font-serif italic text-gray-700 leading-relaxed font-light pl-6">
                        {dailyVerse.text}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-px bg-emerald-500/30" />
                        <p className="text-[10px] md:text-xs font-black text-emerald-600/60 uppercase tracking-[0.3em]">Surah {dailyVerse.surah} • Ayah {dailyVerse.verse}</p>
                      </div>
                    </div>
                 </motion.div>
               ) : (
                 <div className="h-48 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-emerald-400" size={40} />
                    <p className="text-emerald-400 font-black uppercase tracking-[0.5em] text-[10px]">Establishing Connection</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section className="w-full px-4 sm:px-8 py-12 md:py-16 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8 md:mb-12">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 w-fit">
                <BookOpen size={12} className="text-emerald-400" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">The Codex of Breath</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif leading-tight text-white/90">Temporal<br/><span className="text-emerald-500 italic">Echoes</span></h2>
            </div>
            <div className="flex gap-4 items-center">
              <Counter value={events.length} label="Chapters" />
              <div className="w-px h-6 bg-white/20" />
              <Counter value={streak || 0} label="Streak" />
              <button onClick={openRecordModal} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-black text-[8px] tracking-[0.3em] shadow-xl transition-all flex items-center gap-1 uppercase magnetic-btn">
                 Inscribe Chapter <Plus size={10} />
              </button>
            </div>
          </div>

          {events.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center space-y-4 bg-white/[0.02] rounded-2xl border border-white/10 border-dashed"
            >
               <div className="w-16 h-16 mx-auto bg-white/5 rounded-xl flex items-center justify-center text-emerald-500">
                 <BookOpen size={32} strokeWidth={1} />
               </div>
               <h3 className="text-xl md:text-2xl font-serif text-white/30 italic font-light">The silent universe awaits your voice...</h3>
               <button onClick={openRecordModal} className="mt-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold text-sm inline-flex items-center gap-2 hover:bg-emerald-500 transition-all magnetic-btn">
                 Begin Your Journey <ArrowRight size={14} />
               </button>
            </motion.div>
          ) : (
            <div className="space-y-12 md:space-y-16 relative">
              <div className="absolute left-6 md:left-[5.5rem] top-0 bottom-0 w-[1px] bg-gradient-to-b from-emerald-500/0 via-emerald-500/30 to-emerald-500/0 hidden md:block" />
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                   <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                      <div className="hidden md:flex flex-col items-center flex-shrink-0 relative z-10 w-24">
                         <div className="text-5xl md:text-7xl font-serif font-black text-white/[0.03] absolute -top-8 left-0 select-none group-hover:text-emerald-500/10 transition-colors duration-1000">0{i+1}</div>
                         <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-xl border border-white/10 transition-all duration-700 mt-8 ${
                           i === 0 ? "bg-emerald-600 text-white scale-105 rotate-3 shadow-emerald-600/40" : "bg-white/5 text-white/50 hover:bg-white/10"
                         }`}>
                           <span className="text-xl font-black">{i + 1}</span>
                         </div>
                      </div>
                      <div 
                        className={`flex-1 bg-white/[0.02] backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/5 p-5 md:p-8 hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all duration-700 cursor-pointer overflow-hidden shadow-xl`} 
                        onClick={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
                      >
                         <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-all duration-500">
                                 {(() => {
                                   const EmotionIcon = EMOTIONS.find(e => e.id === event.emotion)?.icon;
                                   const emotionColor = EMOTIONS.find(e => e.id === event.emotion)?.color;
                                   return EmotionIcon ? <EmotionIcon className={emotionColor} size={20} strokeWidth={1.5} /> : null;
                                 })()}
                               </div>
                               <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[8px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-[0.2em]">
                                      {EMOTIONS.find(e => e.id === event.emotion)?.label}
                                    </span>
                                    {i === 0 && <span className="text-[8px] font-black bg-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-[0.2em] animate-pulse">Synchronized</span>}
                                  </div>
                                  <h3 className="text-xl md:text-2xl font-bold font-serif group-hover:text-emerald-400 transition-colors tracking-tight">{event.title}</h3>
                               </div>
                            </div>
                            <div className="flex flex-row md:flex-col items-center md:items-end gap-2 text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">
                               <div className="flex items-center gap-1"><Calendar size={10} /> {new Date(event.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
                               <div className="flex items-center gap-1 text-emerald-500/50"><Clock size={10} /> {new Date(event.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </div>
                         </div>
                         <p className="text-base md:text-lg text-white/40 font-light leading-relaxed mb-5 border-l-2 border-white/10 pl-4 italic group-hover:text-white/60 transition-colors">
                            "{event.description}"
                         </p>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[8px] font-black text-emerald-500 uppercase tracking-[0.4em] group-hover:tracking-[0.6em] transition-all">
                               {selectedEventId === event.id ? "SEAL MIRROR" : "PROJECT DIVINE LIGHT"}
                               <ChevronRight size={12} className={`transition-transform duration-500 ${selectedEventId === event.id ? "rotate-90" : "group-hover:translate-x-1"}`}/>
                            </div>
                            <button onClick={(e) => handleDeleteEvent(event.id, e)} className="p-2 hover:bg-rose-500/10 rounded-lg text-white/10 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 size={14} />
                            </button>
                         </div>
                         <AnimatePresence>
                           {selectedEventId === event.id && (
                             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                               <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
                                  <p className="text-right font-arabic text-xl md:text-3xl leading-[1.8] text-emerald-400">
                                    {event.quranMatch.arabic}
                                  </p>
                                  <div className="relative border-l-2 border-emerald-500/40 pl-6 py-1">
                                     <p className="text-lg md:text-xl font-serif italic text-white/70 leading-relaxed">
                                       "{event.quranMatch.verseText}"
                                     </p>
                                     <div className="flex items-center gap-3 mt-3 text-[8px] font-black text-emerald-400/70 uppercase tracking-[0.3em]">
                                        <BookOpen size={12} /> {event.quranMatch.surahName} • Verse {event.quranMatch.verse}
                                     </div>
                                  </div>
                               </div>
                             </motion.div>
                           )}
                         </AnimatePresence>
                      </div>
                   </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SPIRITUAL BENTO GRID */}
      <section className="w-full px-4 sm:px-8 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
             <SpiritualDNA events={events} />
             <div className="bg-gradient-to-br from-[#0c1428] to-[#1a2b4b] rounded-3xl md:rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between group min-h-[420px] md:min-h-[500px]">
                <div className="absolute -bottom-10 -right-10 p-6 opacity-5 group-hover:scale-110 transition-all duration-1000">
                  <BarChart2 size={200} />
                </div>
                <div className="relative z-10 max-w-md space-y-5">
                   <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                      <Zap className="text-amber-400" size={24} />
                   </div>
                   <h3 className="text-2xl md:text-3xl font-bold font-serif leading-tight">Neural Lab</h3>
                   <p className="text-blue-100/40 text-base md:text-lg font-light leading-relaxed">Sync biological existence with celestial resonance. Track expansion across spiritual dimensions.</p>
                </div>
                <button onClick={() => handleNavigate('/analytics')} className="relative z-10 mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 transition-all w-fit shadow-lg magnetic-btn">DNA Signature</button>
             </div>
             
             <div className="bg-emerald-600 rounded-3xl md:rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col justify-between group min-h-[420px] md:min-h-[500px] relative overflow-hidden">
                <div className="space-y-6 relative z-10">
                   <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-110 transition-all duration-700">
                     <Award size={26}/>
                   </div>
                   <h3 className="text-2xl md:text-3xl font-bold font-serif leading-tight">Guardian <br/> Status</h3>
                   <p className="text-emerald-50 text-base md:text-lg font-light leading-relaxed opacity-90 italic">Top 5% of active seekers this week.</p>
                </div>
                <div className="space-y-4 relative z-10 mt-6">
                   <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100/60">
                      <span>Soul Level {level || 50}</span>
                      <span>Mastery 72%</span>
                   </div>
                   <div className="h-2.5 bg-emerald-950/20 rounded-full overflow-hidden p-0.5 shadow-inner backdrop-blur-sm border border-white/5">
                      <motion.div 
                         initial={{ width: 0 }} 
                         whileInView={{ width: '72%' }} 
                         transition={{ duration: 2, ease: [0.34, 1.56, 0.64, 1] }} 
                         className="h-full bg-emerald-300 rounded-full"
                      />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* DIVINE ATTRIBUTES */}
      <LuminousAttributes />

      {/* SACRED INSIGHTS GRID */}
      <section className="w-full px-4 sm:px-8 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
             <DivineTasbih />
             <SacredBreath />
          </div>
        </div>
      </section>

      {/* DIVINE PROTOCOL */}
      <section className="w-full px-4 sm:px-8 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-20 md:mb-24 space-y-5">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 font-serif leading-tight">The Divine <br/> Protocol</h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-400 font-light max-w-3xl mx-auto italic">"Four steps to synchronize life with eternal wisdom."</p>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 relative">
              <div className="hidden lg:block absolute top-[70px] left-[15%] right-[15%] h-[1px] bg-emerald-100 z-0 opacity-40" />
              {[
                { n: '01', t: 'Observe', d: 'Notice a moment of joy, sadness, or peace in your daily flow.' },
                { n: '02', t: 'Record', d: 'Seal that moment in "Echoes" with authenticity.' },
                { n: '03', t: 'Reflect', d: 'Let the Quranic mirror project divine light onto your soul.' },
                { n: '04', t: 'Evolve', d: 'Watch your spiritual DNA shift as you gain eternal insight.' },
              ].map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-6 text-center relative z-10 group"
                >
                   <div className="w-24 h-24 md:w-28 h-28 mx-auto bg-white border-2 border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-black text-2xl md:text-3xl shadow-xl group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110 transition-all duration-500 cursor-default">
                     {step.n}
                   </div>
                   <div className="space-y-4">
                     <h4 className="text-xl md:text-2xl font-bold text-gray-900 font-serif tracking-tight">{step.t}</h4>
                     <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed italic max-w-[220px] mx-auto">"{step.d}"</p>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* ECHOES OF IMPACT & FINAL CTA */}
      <section className="w-full">
        <div className="w-full py-12 md:py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 overflow-hidden relative cursor-pointer group" onClick={() => handleNavigate('/journey')}>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-5" />
           <div className="text-center mb-8 md:mb-10 space-y-3 px-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 rounded-full border border-amber-200 text-amber-700 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em]">
                <Users size={12} /> Global Wisdom Circle
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-amber-900">Echoes of Impact</h2>
              <p className="text-sm md:text-base text-amber-600/70 font-light italic max-w-2xl mx-auto">"Voices from the global community of active seekers who found their light."</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 px-6 md:px-10 lg:px-20 max-w-7xl mx-auto relative z-10">
              {TESTIMONIALS.map((t, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl md:rounded-3xl border border-amber-100 shadow-lg space-y-4 flex flex-col justify-between hover:shadow-xl hover:scale-105 transition-all duration-500 group-hover:border-amber-300"
                >
                   <div className="space-y-4">
                      <Quote className="text-amber-400 opacity-60" size={24} strokeWidth={1.5} />
                      <p className="text-base md:text-lg italic font-serif text-gray-700 leading-relaxed font-light">"{t.content}"</p>
                   </div>
                   <div className="flex items-center gap-4 border-t border-amber-100 pt-5">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-lg">
                        {t.name.charAt(0)}
                      </div>
                      <div className="text-left">
                         <p className="font-black text-gray-800 tracking-[0.1em] uppercase text-[9px] md:text-[10px]">{t.name}</p>
                         <p className="text-[8px] md:text-[9px] text-amber-600 font-black uppercase tracking-[0.2em]">{t.role}</p>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
           <div className="text-center mt-8 md:mt-10 relative z-10">
             <div className="inline-flex items-center gap-2 text-amber-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] group-hover:tracking-[0.5em] transition-all">
               Explore More Stories <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
             </div>
           </div>
        </div>

        {/* FINAL CTA BLOCK */}
        <div className="w-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 py-20 md:py-24 lg:py-28 relative overflow-hidden text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px] opacity-40 animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-teal-400 rounded-full blur-[100px] opacity-30 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[150px] opacity-10" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] shadow-lg">
              <Sparkles size={14} className="text-emerald-200 animate-pulse" /> Begin Your Sacred Journey
            </div>
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight">
              Ready to map your <br/> 
              <span className="text-emerald-200 italic drop-shadow-lg">Eternal Story?</span>
            </h2>
            
            <p className="text-base md:text-lg lg:text-xl font-light italic text-emerald-50 opacity-90 max-w-2xl mx-auto">
              Join thousands of seekers bridging temporal life with uncreated wisdom.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button 
                onClick={openRecordModal}
                className="px-8 py-4 md:px-10 md:py-5 bg-white text-emerald-700 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto magnetic-btn group"
              >
                Seal Your First Chapter <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => handleNavigate('/mirror')}
                className="px-8 py-4 md:px-10 md:py-5 bg-emerald-700/50 backdrop-blur-sm border border-white/30 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-600/70 transition-all flex items-center gap-2 mx-auto magnetic-btn group"
              >
                Explore Heart Mirror <Heart size={14} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            <div className="pt-6 flex justify-center gap-8 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
              <span>Free Forever</span>
              <span>•</span>
              <span>Divine Guidance</span>
              <span>•</span>
              <span>Community Supported</span>
            </div>
          </div>
        </div>
      </section>

      {/* ADD CHAPTER MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-emerald-950/80 backdrop-blur-md z-[100]"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md md:max-w-xl lg:max-w-2xl bg-white z-[101] shadow-2xl overflow-y-auto"
            >
              <div className="p-6 md:p-10 space-y-8">
                 <header className="flex justify-between items-start">
                    <div className="space-y-2">
                       <div className="w-10 h-0.5 bg-emerald-600 rounded-full" />
                       <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif italic leading-tight">Record Journey</h2>
                       <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[8px] md:text-[9px]">Sync History with Heavens</p>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={20} strokeWidth={2} /></button>
                 </header>
                 <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block">Narrative Title</label>
                      <input 
                        type="text" 
                        placeholder="A Moment of Deep Gratitude..." 
                        className="w-full text-2xl md:text-3xl font-bold bg-transparent border-b-2 border-gray-100 focus:border-emerald-300 outline-none transition-all placeholder:text-gray-200 text-gray-900 py-2 font-serif" 
                        value={newEvent.title} 
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block">Emotional Pulse</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {EMOTIONS.map(e => {
                          const EmotionIcon = e.icon;
                          return (
                            <button 
                              key={e.id} 
                              onClick={() => setNewEvent({...newEvent, emotion: e.id})} 
                              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                                newEvent.emotion === e.id ? 'border-emerald-600 bg-emerald-50 shadow-lg' : 'border-gray-100 bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className={`p-2 rounded-lg transition-transform ${newEvent.emotion === e.id ? 'scale-110' : ''} ${e.bg} ${e.color}`}>
                                 <EmotionIcon size={20} strokeWidth={1.5} />
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${newEvent.emotion === e.id ? 'text-emerald-700' : 'text-gray-400'}`}>{e.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-6">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block">Sacred Reflection</label>
                       <textarea 
                         rows={5} 
                         placeholder="How has your soul shifted during this moment? Write freely..." 
                         className="w-full p-5 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-emerald-100 outline-none transition-all resize-none text-base text-gray-700 leading-relaxed" 
                         value={newEvent.description} 
                         onChange={e => setNewEvent({...newEvent, description: e.target.value})} 
                       />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block">Location</label>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-5 py-4 border border-transparent focus-within:bg-white focus-within:border-emerald-100 transition-all">
                        <MapPin className="text-emerald-400" size={18}/>
                        <input 
                          type="text" 
                          placeholder="Where did this echo happen?"
                          className="flex-1 bg-transparent border-none focus:ring-0 text-base text-gray-900 font-bold placeholder:text-gray-200"
                          value={newEvent.location}
                          onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="pt-8">
                       <button 
                         onClick={handleAddEvent} 
                         className="w-full bg-emerald-600 text-white py-5 rounded-xl text-lg font-black shadow-xl hover:bg-emerald-700 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-3 magnetic-btn"
                       >
                         Seal Moment <ChevronRight size={18} />
                       </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}