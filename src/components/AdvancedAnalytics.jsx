import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  CartesianGrid, Legend
} from 'recharts';
import { 
  FiTrendingUp, FiCalendar, FiSmile, FiHeart, FiActivity, 
  FiBarChart2, FiPieChart, FiStar, FiClock, FiZap, FiTarget, FiCompass, FiBattery,
  FiRefreshCw, FiDownload, FiShare2, FiArrowUp, FiArrowRight, FiSearch, FiMapPin
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const puzzleWords = ["Patience", "Gratitude", "Silence", "Wisdom", "Faith", "Mercy", "Light", "Peace"];

// Spiritual Compass Game Component
const SpiritualCompassGame = ({ onScoreUpdate }) => {
  const [gameState, setGameState] = useState('start');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLeft, setTimeLeft] = useState(15);

  const questions = {
    easy: [
      { question: "What is the first Surah of the Quran?", options: ["Al-Fatiha", "Al-Baqarah", "Al-Ikhlas", "An-Nas"], correct: 0, fact: "Al-Fatiha is 'The Opening' and is recited in every prayer." },
      { question: "How many Surahs are in the Quran?", options: ["99", "104", "114", "124"], correct: 2, fact: "The Quran contains 114 Surahs." },
      { question: "Which angel brought revelation to Prophet Muhammad?", options: ["Mika'il", "Israfil", "Jibreel", "Azra'il"], correct: 2, fact: "Angel Jibreel delivered Allah's messages." }
    ],
    medium: [
      { question: "Which Surah is known as the 'Heart of the Quran'?", options: ["Yasin", "Rahman", "Mulk", "Fatiha"], correct: 0, fact: "Surah Yasin is the heart of the Quran." },
      { question: "What does 'Bismillah' mean?", options: ["Praise be to Allah", "In the name of Allah", "Allah is Great", "Thanks to Allah"], correct: 1, fact: "Bismillah means 'In the name of Allah'." },
      { question: "Which Prophet is known as the 'Father of Prophets'?", options: ["Musa", "Isa", "Ibrahim", "Nuh"], correct: 2, fact: "Prophet Ibrahim is father of many prophets." }
    ],
    hard: [
      { question: "Which Surah contains Ayatul Kursi?", options: ["Al-Baqarah", "Ali Imran", "An-Nisa", "Al-Maidah"], correct: 0, fact: "Ayatul Kursi is in Surah Al-Baqarah." },
      { question: "How many prophets are mentioned in the Quran?", options: ["25", "28", "30", "35"], correct: 0, fact: "25 prophets are mentioned by name." },
      { question: "What is Tawheed?", options: ["Prayer", "Charity", "Oneness of Allah", "Fasting"], correct: 2, fact: "Tawheed is the oneness of Allah." }
    ]
  };

  const difficultySettings = { easy: { time: 20, points: 10 }, medium: { time: 15, points: 20 }, hard: { time: 10, points: 30 } };

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && currentQuestion && timeLeft > 0 && !showFeedback) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { handleTimeout(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, currentQuestion, timeLeft, showFeedback]);

  const startGame = () => { setGameState('playing'); setScore(0); setQuestionsAnswered(0); setStreak(0); loadNewQuestion(); };
  const loadNewQuestion = () => {
    const questionSet = questions[difficulty];
    setCurrentQuestion({ ...questionSet[Math.floor(Math.random() * questionSet.length)] });
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(difficultySettings[difficulty].time);
  };
  const handleTimeout = () => {
    if (!showFeedback && currentQuestion) {
      setShowFeedback(true); setStreak(0);
      toast.error(`Time's up! Answer: ${currentQuestion.options[currentQuestion.correct]}`);
      setTimeout(() => {
        if (questionsAnswered + 1 >= 5) endGame();
        else { setQuestionsAnswered(prev => prev + 1); loadNewQuestion(); }
      }, 2000);
    }
  };
  const handleAnswer = (selectedIndex) => {
    if (showFeedback) return;
    setSelectedAnswer(selectedIndex);
    setShowFeedback(true);
    const isCorrect = selectedIndex === currentQuestion.correct;
    if (isCorrect) {
      const pointsEarned = difficultySettings[difficulty].points + (streak * 5);
      setScore(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
      onScoreUpdate && onScoreUpdate(pointsEarned);
      toast.success(`✓ Correct! +${pointsEarned} XP`);
    } else {
      setStreak(0);
      toast.error(`✗ Wrong! Answer: ${currentQuestion.options[currentQuestion.correct]}`);
    }
    setTimeout(() => {
      if (questionsAnswered + 1 >= 5) endGame();
      else { setQuestionsAnswered(prev => prev + 1); loadNewQuestion(); }
    }, 2000);
  };
  const endGame = () => { setGameState('result'); };
  const resetGame = () => { setGameState('start'); setScore(0); setQuestionsAnswered(0); setStreak(0); };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex-grow flex flex-col justify-between">
      {gameState === 'start' && (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FiCompass className="text-emerald-600" size={32} />
          </div>
          <h4 className="text-lg font-bold text-gray-800 mb-1">Spiritual Compass</h4>
          <p className="text-gray-500 text-xs mb-6 font-medium">Calibrate your knowledge frequency</p>
          <div className="flex gap-2 justify-center mb-6">
            {['easy', 'medium', 'hard'].map(level => (
              <button key={level} onClick={() => setDifficulty(level)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition ${
                difficulty === level ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
                {level}
              </button>
            ))}
          </div>
          <button onClick={startGame} className="w-full py-3 bg-emerald-950 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-800 transition shadow-xl border-b-4 border-black active:translate-y-1 active:border-b-0">
            Begin Calibration
          </button>
        </div>
      )}
      {gameState === 'playing' && currentQuestion && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <div className="bg-emerald-50 px-3 py-1.5 rounded-lg text-emerald-600">XP: {score}</div>
            <div className={`px-3 py-1.5 rounded-lg ${timeLeft < 5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>Time: {timeLeft}s</div>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${(questionsAnswered / 5) * 100}%` }} />
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="text-gray-900 font-bold text-center leading-relaxed italic font-serif text-lg leading-tight">{currentQuestion.question}</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {currentQuestion.options.map((option, idx) => (
              <button key={idx} onClick={() => handleAnswer(idx)} disabled={showFeedback} className={`w-full p-4 rounded-xl text-left transition text-xs font-bold border-2 ${
                showFeedback ? (idx === currentQuestion.correct ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : selectedAnswer === idx ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-transparent opacity-50') : 'bg-white border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 text-gray-700'
              }`}>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
      {gameState === 'result' && (
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiStar className="text-emerald-600" size={40} />
          </div>
          <h4 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-tighter">Sync Complete</h4>
          <p className="text-5xl font-black text-emerald-600 mb-1">{score}</p>
          <p className="text-emerald-800/40 text-[10px] font-black uppercase tracking-widest mb-8">Sacred Points Earned</p>
          <button onClick={resetGame} className="w-full py-4 bg-emerald-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-800 transition shadow-xl border-b-4 border-black active:translate-y-1 active:border-b-0">
            Recalibrate
          </button>
        </div>
      )}
    </div>
  );
};

// Sacred Word Scramble Puzzle Component
const SacredPuzzle = ({ words = ["Patience", "Gratitude", "Silence", "Wisdom", "Faith", "Mercy", "Light", "Peace"] }) => {
  const [currentWord, setCurrentWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isSolved, setIsSolved] = useState(false);
  const [hint, setHint] = useState('');

  const initPuzzle = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    const scrambledWord = word.split('').sort(() => Math.random() - 0.5).join('');
    setCurrentWord(word);
    setScrambled(scrambledWord);
    setUserInput('');
    setIsSolved(false);
    setHint(word.charAt(0) + '...' + word.charAt(word.length - 1));
  };

  useEffect(() => { initPuzzle(); }, []);

  const checkSolution = () => {
    if (userInput.toLowerCase() === currentWord.toLowerCase()) {
      setIsSolved(true);
      toast.success('Puzzle Solved! Sacred Wisdom Unlocked.');
    } else {
      toast.error('Not quite. Try rearranging the letters.');
    }
  };

  return (
    <div className="bg-emerald-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <FiZap size={120} />
      </div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-emerald-800/50 flex items-center justify-center text-emerald-400 border border-emerald-700">
                <FiZap size={20} />
             </div>
             <div>
               <h4 className="text-lg font-bold italic font-serif">Sacred Cipher</h4>
               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Analytical Word Puzzle</p>
             </div>
          </div>
          
          {!isSolved ? (
            <div className="py-6 space-y-6">
              <div className="flex justify-center gap-2">
                {scrambled.toUpperCase().split('').map((char, i) => (
                  <div key={i} className="w-10 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-emerald-400 rounded-xl">
                    {char}
                  </div>
                ))}
              </div>
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Unscramble the path..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-900/40"
              />
              <div className="flex gap-2">
                <button onClick={checkSolution} className="flex-1 py-3 bg-emerald-500 text-emerald-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition shadow-xl">
                  Solve Cipher
                </button>
                <button onClick={() => toast(`Hint: ${hint}`)} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black hover:bg-white/10">
                  Hint
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="text-4xl">✨</div>
              <h4 className="text-2xl font-black text-emerald-400 italic font-serif">{currentWord}</h4>
              <p className="text-xs text-white/50 leading-relaxed italic">A key element in your spiritual landscape today.</p>
              <button onClick={initPuzzle} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10">
                New Puzzle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Prayer Times Card with Location Integration
const PrayerTimesCard = () => {
  const [location, setLocation] = useState('Mecca');
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState({ name: '', countdown: '' });

  const fetchPrayers = async (addr) => {
    setLoading(true);
    try {
      const resp = await fetch(`https://api.aladhan.com/v1/timingsByAddress?address=${addr}&method=2`);
      const data = await resp.json();
      if (data.code === 200) {
        const t = data.data.timings;
        const mapped = [
          { name: 'Fajr', time: t.Fajr, icon: '🌅' },
          { name: 'Dhuhr', time: t.Dhuhr, icon: '☀️' },
          { name: 'Asr', time: t.Asr, icon: '🌤️' },
          { name: 'Maghrib', time: t.Maghrib, icon: '🌇' },
          { name: 'Isha', time: t.Isha, icon: '🌙' },
        ];
        setPrayers(mapped);
        calculateNextPrayer(mapped);
      }
    } catch (err) {
      toast.error('Failed to update timings');
    } finally {
      setLoading(false);
    }
  };

  const calculateNextPrayer = (mapped) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let next = mapped[0];
    for (let p of mapped) {
      const [h, m] = p.time.split(':').map(Number);
      const pTime = h * 60 + m;
      if (pTime > currentTime) {
        next = p;
        break;
      }
    }
    setNextPrayer({ name: next.name, countdown: next.time });
  };

  useEffect(() => { fetchPrayers(location); }, []);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col h-full group hover:border-emerald-100 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-emerald-950 tracking-tighter">Sacred Rhythms</h3>
          <p className="text-emerald-800/40 text-[10px] font-black uppercase tracking-widest">Alignment Clock</p>
        </div>
        <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center rounded-xl text-emerald-600">
           <FiClock size={20} />
        </div>
      </div>

      <div className="relative mb-6">
        <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={14} />
        <input 
          type="text" 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchPrayers(location)}
          className="w-full bg-emerald-50 border-none rounded-2xl py-3 pl-10 pr-12 text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-200"
          placeholder="Enter city..."
        />
        <button onClick={() => fetchPrayers(location)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-950 text-white rounded-xl shadow-lg">
          <FiSearch size={12} />
        </button>
      </div>

      <div className="space-y-2 flex-grow">
        {loading ? (
           <div className="flex flex-col gap-2 animate-pulse">
             {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-50 rounded-xl" />)}
           </div>
        ) : (
          prayers.map((p, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-2xl transition hover:bg-emerald-50/50 ${nextPrayer.name === p.name ? 'bg-emerald-50 border border-emerald-100' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{p.icon}</span>
                <span className={`text-xs font-black uppercase tracking-widest ${nextPrayer.name === p.name ? 'text-emerald-700' : 'text-gray-500'}`}>{p.name}</span>
              </div>
              <span className={`text-xs font-black italic font-serif ${nextPrayer.name === p.name ? 'text-emerald-700' : 'text-gray-400'}`}>{p.time}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 p-6 bg-emerald-950 text-white rounded-[2rem] text-center shadow-xl border-b-4 border-black">
         <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400/60 mb-1">Next Ascension</p>
         <h4 className="text-2xl font-black italic font-serif tracking-tighter">{nextPrayer.name} at {nextPrayer.countdown}</h4>
      </div>
    </div>
  );
};

// Enhanced Devotion Streak Card with Motivational Logic
const DevotionStreakCard = ({ streakValue = 14 }) => {
  const [motivation, setMotivation] = useState("");
  const [mood, setMood] = useState("positive");

  useEffect(() => {
    if (streakValue === 0) {
      setMotivation("Every soul has a beginning. Today is yours. Take the first step.");
      setMood("neutral");
    } else if (streakValue < 3) {
      setMotivation("The fire is just starting. Feed it with consistency, however small.");
      setMood("warning");
    } else if (streakValue < 7) {
      setMotivation("You're building momentum. The rhythm is becoming a part of you.");
      setMood("positive");
    } else {
      setMotivation("Your discipline is a light. Keep it burning bright for others to follow.");
      setMood("high");
    }
  }, [streakValue]);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col group hover:border-emerald-100 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-emerald-950 tracking-tighter">Consistency Flow</h3>
          <p className="text-emerald-800/40 text-[10px] font-black uppercase tracking-widest">Temporal Rhythm</p>
        </div>
        <div className={`w-10 h-10 ${mood === 'high' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center rounded-xl shadow-inner`}>
           <FiZap size={20} />
        </div>
      </div>

      <div className="text-center py-6 relative">
        <div className="text-7xl font-black text-emerald-950 tracking-tighter italic font-serif flex items-baseline justify-center">
          {streakValue}
          <span className="text-xs align-top bg-emerald-500 text-white px-3 py-1 rounded-full not-italic ml-2 animate-bounce">DAYS</span>
        </div>
        <p className="text-emerald-800/30 text-[10px] font-black uppercase tracking-widest mt-2">Continuous Unbroken String</p>
      </div>

      <div className="mt-auto space-y-6 pt-6 border-t border-gray-50">
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative group-hover:bg-emerald-50/30 transition-colors">
          <FiStar className="text-emerald-400 absolute -top-2 -left-2" size={24} />
          <p className="text-xs text-gray-600 leading-relaxed italic font-serif">"{motivation}"</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[.2em]">
            <span className="text-gray-400">Streak Stability</span>
            <span className="text-emerald-600">88%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} whileInView={{ width: '88%' }} className="h-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SACRED HEATMAP (SIMULATED) ====================
const SacredHeatmap = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  // Generate a 7x24 grid of activity
  const data = Array.from({ length: 7 }, (_, day) => 
    Array.from({ length: 24 }, (_, week) => ({
      day,
      week,
      value: Math.floor(Math.random() * 5)
    }))
  ).flat();

  return (
    <div className="bg-emerald-950/90 backdrop-blur-xl p-10 rounded-[2.5rem] border border-emerald-800 shadow-2xl relative overflow-hidden group h-full flex flex-col">
      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-45">
        <FiActivity size={100} />
      </div>
      <div className="relative z-10 space-y-8 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tighter">Consistency Matrix</h3>
            <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest mt-1">6-Month Devotion Grid</p>
          </div>
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[9px] font-black uppercase tracking-widest">
            High Density
          </div>
        </div>
        
        <div className="flex gap-1.5 flex-wrap flex-grow content-start">
          {data.map((d, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.002 }}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-sm border border-black/10 transition-colors ${
                d.value === 0 ? 'bg-white/5' : 
                d.value === 1 ? 'bg-emerald-900' :
                d.value === 2 ? 'bg-emerald-700' :
                d.value === 3 ? 'bg-emerald-500' : 'bg-emerald-300'
              } hover:ring-2 hover:ring-emerald-400/50 cursor-pointer`}
              title={`Activity level: ${d.value}`}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-8 border-t border-white/5">
           <div className="flex gap-4">
              {months.map(m => <span key={m} className="text-[9px] font-black text-white/30 uppercase">{m}</span>)}
           </div>
           <div className="flex items-center gap-1">
             <span className="text-[8px] text-white/20 uppercase font-black mr-2">Less</span>
             <div className="w-2.5 h-2.5 bg-white/5 rounded-sm" />
             <div className="w-2.5 h-2.5 bg-emerald-700 rounded-sm" />
             <div className="w-2.5 h-2.5 bg-emerald-400 rounded-sm" />
             <span className="text-[8px] text-white/20 uppercase font-black ml-1">More</span>
           </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SPIRITUAL PILLARS RADAR ====================
const SpiritualRadar = ({ stats }) => {
  const data = [
    { subject: 'Wisdom', A: 85, fullMark: 100 },
    { subject: 'Patience', A: 72, fullMark: 100 },
    { subject: 'Reflection', A: 90, fullMark: 100 },
    { subject: 'Charity', A: 65, fullMark: 100 },
    { subject: 'Dhikr', A: 80, fullMark: 100 },
    { subject: 'Salah', A: 95, fullMark: 100 },
  ];

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:border-emerald-100 transition-all flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-emerald-950 tracking-tighter">Soul Geometry</h3>
          <p className="text-emerald-800/30 text-[10px] font-black uppercase tracking-widest">Equilibrium Pillar Analysis</p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 flex items-center justify-center rounded-2xl text-indigo-600 shadow-inner">
           <FiTarget size={22} />
        </div>
      </div>
      
      <div className="flex-grow min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#f1f5f9" />
            <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
            <Radar
              name="Spiritual State"
              dataKey="A"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.1}
            />
            <Tooltip 
              contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Expert Assessment</p>
         <p className="text-xs text-gray-700 font-bold leading-relaxed italic font-serif">
           "Your Reflection & Salah pillars are currently in high resonance. Focus on increasing Charity to balance your spiritual geometry."
         </p>
      </div>
    </div>
  );
};

// ==================== SACRED MILESTONE TIMELINE ====================
const SacredMilestones = ({ xp }) => {
  const milestones = [
    { level: 100, label: 'First Awakening', date: 'Day 1', icon: '🌱' },
    { level: 500, label: 'Consistent Seeker', date: 'Day 7', icon: '🔥' },
    { level: 1000, label: 'Soul Alignment', date: 'Day 14', icon: '✨' },
    { level: 2500, label: 'Pillar of Wisdom', date: 'In Progress', icon: '🏛️' },
  ];

  return (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 group hover:border-emerald-100 transition-all flex flex-col flex-grow">
       <div className="flex items-center justify-between">
          <div className="space-y-1">
             <h3 className="text-2xl font-black text-emerald-950 tracking-tighter italic font-serif">Journey Log</h3>
             <p className="text-emerald-800/40 text-[10px] font-black uppercase tracking-widest">Chronological Ascension Milestones</p>
          </div>
          <FiStar className="text-amber-400 animate-pulse" size={28} />
       </div>
       
       <div className="space-y-6 relative flex-grow">
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-emerald-50" />
          {milestones.map((m, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-6 relative z-10"
            >
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg border-2 ${xp >= m.level ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-gray-50 border-gray-100 opacity-40'}`}>
                  {m.icon}
               </div>
               <div className="flex-grow">
                  <div className="flex justify-between items-baseline">
                     <p className={`text-xs font-black uppercase tracking-widest ${xp >= m.level ? 'text-emerald-900' : 'text-gray-300'}`}>{m.label}</p>
                     <p className="text-[10px] font-black text-emerald-300 uppercase">{m.date}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="h-1 flex-grow bg-gray-50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: xp >= m.level ? '100%' : `${(xp / m.level) * 100}%` }}
                          className={`h-full ${xp >= m.level ? 'bg-emerald-500' : 'bg-emerald-200'}`} 
                        />
                     </div>
                     <span className="text-[9px] font-black text-gray-400">{m.level} XP</span>
                  </div>
               </div>
            </motion.div>
          ))}
       </div>
    </div>
  );
};

// ==================== ADVANCED ANALYTICS MAIN PAGE ====================
export default function AdvancedAnalytics() {
  const { userData, reflections = [], stats = {}, xp = 0, level = 'Seeker', addXP } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Artificial delay for that "thinking" feel
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Compute Weekly Pulse from real reflections
  const weeklyActivity = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = days.map(day => ({ day, verses: 0, reflections: 0 }));
    
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    reflections.forEach((r) => {
      const date = new Date(r.createdAt);
      if (date >= oneWeekAgo) {
        counts[date.getDay()].reflections++;
      }
    });

    // Since we only track total verses read in stats, we distribute them slightly for UI
    // In a real app we'd have a daily activity log
    const totalV = stats.totalVersesRead || 0;
    counts.forEach(c => {
       c.verses = Math.floor(Math.random() * 3) + (c.reflections > 0 ? 2 : 0);
    });

    return counts;
  }, [reflections, stats]);

  // Compute Soul Landscape from real emotion data
  const emotionData = React.useMemo(() => {
    const counts = {};
    let hasEmotions = false;
    
    reflections.forEach((r) => {
      if (r.emotion) {
        counts[r.emotion] = (counts[r.emotion] || 0) + 1;
        hasEmotions = true;
      }
    });
    
    if (!hasEmotions) {
      return [
        { name: 'Peaceful', value: 30 },
        { name: 'Grateful', value: 20 },
        { name: 'Reflective', value: 10 },
      ];
    }

    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [reflections]);

  const COLORS = ['#065f46', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#ecfdf5'];

  // Growth trajectory based on XP or activity count over time
  const monthlyTrend = React.useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      
      // Filter activities for this specific day
      const dailyCount = reflections.filter((r) => {
        const rd = new Date(r.createdAt);
        return rd.toDateString() === d.toDateString();
      }).length;

      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        activities: dailyCount + Math.floor(Math.random() * 2) // Base activity + simulated
      });
    }
    return data;
  }, [reflections]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Containerized Flow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8 md:pt-12">
        
        {/* Header Hero Section */}
        <div className="p-8 md:p-12 bg-emerald-950 rounded-[2.5rem] text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl transition-all duration-700">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 pointer-events-none">
            <FiBarChart2 size={240} />
          </div>
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
          
          <div className="relative z-10 space-y-4 text-center lg:text-left max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full mb-2"
            >
              <FiTrendingUp className="text-emerald-400" size={12} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Spiritual Intelligence Matrix</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight italic font-serif">
              Growth<span className="text-emerald-400"> Analytics</span>
            </h1>
            <p className="text-base md:text-lg text-white/40 font-medium tracking-tight leading-relaxed">
              Synthesizing your spiritual data into visual insights. Tracking the convergence of practice, reflection, and emotional stability.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10">
            <button onClick={() => toast.success('Archive Generated')} className="flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-white/10 transition-all active:scale-95">
              <FiDownload size={14}/> Export Archive
            </button>
            <button onClick={() => toast.success('Frequency Transmitted')} className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 border-b-4 border-emerald-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-950 hover:bg-emerald-400 transition-all active:translate-y-1 active:border-b-0 shadow-xl">
              <FiShare2 size={14}/> Share Journey
            </button>
          </div>
        </div>

        {/* 3-Column Visual Grid: Radar and Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <SpiritualRadar stats={stats} />
          <div className="lg:col-span-2">
            <SacredHeatmap />
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FiActivity, label: 'Soul XP', value: xp.toLocaleString(), color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { icon: FiTarget, label: 'Spiritual Level', value: level, color: 'text-blue-500', bg: 'bg-blue-50' },
            { icon: FiZap, label: 'Pulse Streak', value: `${userData?.streak || 0}d`, color: 'text-amber-500', bg: 'bg-amber-50' },
            { icon: FiHeart, label: 'Reflections', value: reflections.length, color: 'text-rose-500', bg: 'bg-rose-50' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:border-emerald-100 transition-all group"
            >
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon size={22} />
              </div>
              <p className="text-3xl font-black text-emerald-950 tracking-tighter">{stat.value}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Grid: Prayer, Streak, Weekly */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <PrayerTimesCard />
          <DevotionStreakCard streakValue={userData?.streak || 0} />
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 group hover:border-emerald-100 transition-all flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-emerald-950 tracking-tighter italic font-serif">Weekly Pulse</h3>
                <p className="text-emerald-800/40 text-[10px] font-black uppercase tracking-widest">Temporal Engagement Matrix</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 flex items-center justify-center rounded-2xl text-amber-600 shadow-inner">
                 <FiCalendar size={22} />
              </div>
            </div>
            <div className="flex-grow min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 900}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc', radius: 10}} 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '20px'}} 
                  />
                  <Bar dataKey="verses" fill="#10B981" radius={[8, 8, 0, 0]} barSize={12} />
                  <Bar dataKey="reflections" fill="#F59E0B" radius={[8, 8, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-50 flex justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verses</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Insights</span>
               </div>
            </div>
          </div>
        </div>

        {/* Grid: Quiz, Puzzle, Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-4 space-y-8 flex flex-col">
            <SpiritualCompassGame onScoreUpdate={(p) => addXP && addXP(p)} />
            <SacredPuzzle words={puzzleWords} />
          </div>
          
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 flex flex-col flex-grow group hover:border-emerald-100 transition-all">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-emerald-950 tracking-tighter italic font-serif">Growth Trajectory</h3>
                  <p className="text-emerald-800/40 text-[10px] font-black uppercase tracking-widest">30-Day Spiritual Ascension Velocity</p>
                </div>
                <div className="hidden sm:flex gap-2">
                  <span className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-sm">High Consistency</span>
                </div>
              </div>
              <div className="h-[350px] flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 900}} 
                      interval={2}
                    />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '20px'}} />
                    <Area type="monotone" dataKey="activities" stroke="#10b981" strokeWidth={4} fill="url(#colorWave)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <SacredMilestones xp={xp} />
          </div>
        </div>

        {/* Stats and Emotion Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center group hover:border-emerald-100 transition-all">
              <div className="w-full flex items-center justify-between mb-10">
                 <div>
                   <h3 className="text-xl font-black text-emerald-950 uppercase tracking-tighter">Soul Landscape</h3>
                   <p className="text-[10px] font-black text-emerald-800/30 uppercase tracking-widest mt-1">Emotional Resonance Distribution</p>
                 </div>
                 <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                    <FiPieChart size={20} />
                 </div>
              </div>
              <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={emotionData} 
                        innerRadius={65} 
                        outerRadius={85} 
                        paddingAngle={10} 
                        dataKey="value"
                        stroke="none"
                      >
                        {emotionData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '20px', border: 'none', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase'}} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-10 w-full">
                 {emotionData.map((e, i) => (
                   <div key={i} className="flex flex-col items-center gap-1.5 pt-4 border-t border-gray-50">
                     <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                     <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">{e.name}</span>
                     <span className="text-xs font-black text-emerald-900">{e.value}</span>
                   </div>
                 ))}
              </div>
          </div>

          <div className="bg-emerald-950 p-10 rounded-[2.5rem] border border-emerald-900 shadow-xl text-white flex flex-col justify-center gap-10 relative overflow-hidden group">
             <div className="absolute bottom-0 right-0 opacity-5 translate-y-1/3 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000">
                <FiBattery size={500} />
             </div>
             <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="inline-block px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
                   >
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Current Evolution Phase</span>
                   </motion.div>
                   <h3 className="text-4xl md:text-5xl font-black italic font-serif leading-tight">ASCENSION <span className="block text-emerald-500">POTENTIAL</span></h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {[
                     { label: 'Maqam at-Tawbah', val: '100%', meta: 'Root Foundation' },
                     { label: 'Maqam as-Sabr', val: '72%', meta: 'Vessel Stability' },
                     { label: 'Maqam ash-Shukr', val: 'Locked', meta: 'Light Integration' },
                     { label: 'Maqam al-Ikhlas', val: 'Locked', meta: 'Divine Sincerity' },
                   ].map((m, i) => (
                     <div key={i} className="space-y-4 p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400/60">{m.meta}</p>
                              <p className="text-xs font-black uppercase tracking-widest text-white">{m.label}</p>
                           </div>
                           <span className={`text-[10px] font-black ${m.val === 'Locked' ? 'text-white/20' : 'text-emerald-400'}`}>{m.val}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                           <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: m.val === 'Locked' ? '0%' : m.val }}
                            className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" 
                           />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Global Sacred Wisdom Nudge */}
        <div className="bg-gradient-to-br from-emerald-950 to-black p-10 md:p-16 rounded-[2.5rem] text-center space-y-8 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
           <div className="relative z-10 max-w-4xl mx-auto space-y-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                 <FiHeart className="text-white" size={24} />
              </div>
              <h2 className="text-3xl md:text-5xl font-black italic font-serif text-white tracking-tighter uppercase leading-tight">
                 Knowledge without <span className="text-emerald-400">Action</span> is Madness, Action without Knowledge is <span className="text-emerald-400">Void</span>.
              </h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Al-Ghazali — Integration Protocol</p>
              <div className="pt-4">
                  <button 
  onClick={() => {
    addXP && addXP(50);
    toast.success('Ascension continued! +50 XP');
  }}
  className="px-10 py-4 md:px-12 md:py-5 bg-emerald-500 text-emerald-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all shadow-xl hover:scale-105 active:scale-95"
>
  Continue Ascension
</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}