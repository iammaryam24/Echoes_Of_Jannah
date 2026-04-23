// src/components/AdvancedAnalytics.jsx - Full Webpage Layout

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ComposedChart, CartesianGrid, Legend
} from 'recharts';
import { 
  FiTrendingUp, FiCalendar, FiSmile, FiHeart, FiActivity, 
  FiBarChart2, FiPieChart, FiStar, FiClock, FiAward, 
  FiDownload, FiShare2, FiZap, FiTarget, FiCompass, FiBattery
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import { userApi } from '../api/quranApi';
import toast from 'react-hot-toast';

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
      onScoreUpdate?.(pointsEarned);
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
  const endGame = () => { setGameState('result'); const bonus = Math.floor(score / 50); if (bonus > 0) { onScoreUpdate?.(bonus); toast.success(`Game Complete! +${bonus} bonus XP!`); } };
  const resetGame = () => { setGameState('start'); setScore(0); setQuestionsAnswered(0); setStreak(0); };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {gameState === 'start' && (
        <div className="text-center">
          <div className="text-6xl mb-4">🧭</div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">Spiritual Compass Challenge</h4>
          <p className="text-gray-500 mb-6">Test your Islamic knowledge!</p>
          <div className="flex gap-2 justify-center mb-6">
            {['easy', 'medium', 'hard'].map(level => (
              <button key={level} onClick={() => setDifficulty(level)} className={`px-4 py-1.5 rounded-full text-sm capitalize transition ${difficulty === level ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {level}
              </button>
            ))}
          </div>
          <button onClick={startGame} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition">Begin Challenge 🧭</button>
        </div>
      )}
      {gameState === 'playing' && currentQuestion && (
        <div className="space-y-5">
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2"><FiStar className="text-yellow-500" /><span className="font-bold text-gray-800">{score}</span></div>
            <div className="flex items-center gap-2"><FiTrendingUp className="text-emerald-500" /><span className="text-emerald-600">Streak: {streak}</span></div>
            <div className="flex items-center gap-2"><FiClock className="text-emerald-500" /><span className={`font-bold ${timeLeft < 5 ? 'text-red-500' : 'text-emerald-600'}`}>{timeLeft}s</span></div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${(questionsAnswered / 5) * 100}%` }} /></div>
          <p className="text-xs text-gray-500 text-right">Question {questionsAnswered + 1}/5</p>
          <div className="bg-gray-50 rounded-xl p-5"><p className="text-gray-800 font-medium text-center text-lg">{currentQuestion.question}</p></div>
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button key={idx} onClick={() => handleAnswer(idx)} disabled={showFeedback} className={`w-full p-3 rounded-xl text-left transition text-sm ${
                showFeedback ? (idx === currentQuestion.correct ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : selectedAnswer === idx ? 'bg-red-100 border-red-300 text-red-800' : 'bg-gray-50 border-gray-200') : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}>
                <span className="text-gray-700">{String.fromCharCode(65 + idx)}. {option}</span>
              </button>
            ))}
          </div>
          {showFeedback && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200"><p className="text-sm text-emerald-600">📖 {currentQuestion.fact}</p></div>}
        </div>
      )}
      {gameState === 'result' && (
        <div className="text-center py-4">
          <div className="text-6xl mb-4">🏆</div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">Challenge Complete!</h4>
          <p className="text-4xl font-bold text-emerald-600 mb-6">{score} XP</p>
          <button onClick={resetGame} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition">Play Again</button>
        </div>
      )}
    </div>
  );
};

export default function AdvancedAnalytics() {
  const { userId, addXP } = useUser();
  const [activities, setActivities] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [emotionDistribution, setEmotionDistribution] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [spiritualGrowth, setSpiritualGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0, percentage: 0 });
  const [achievements, setAchievements] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [gameXP, setGameXP] = useState(0);

  useEffect(() => { if (userId) loadAnalytics(); }, [userId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      let activitiesData = [], reflectionsData = [];
      try { activitiesData = (await userApi.getUserActivities(userId)) || []; } catch (err) { activitiesData = []; }
      try { reflectionsData = (await userApi.getUserReflections(userId)) || []; } catch (err) { reflectionsData = []; }
      
      if (!Array.isArray(activitiesData)) activitiesData = [];
      if (!Array.isArray(reflectionsData)) reflectionsData = [];
      
      setActivities(activitiesData);
      setReflections(reflectionsData);
      
      const currentStreak = activitiesData.filter(a => a?.activityType === 'daily_checkin').length;
      setStreakData({ current: currentStreak, longest: currentStreak, percentage: Math.min(100, currentStreak * 14) });
      
      const emotionCount = {};
      reflectionsData.forEach(r => { if (r?.emotion) emotionCount[r.emotion] = (emotionCount[r.emotion] || 0) + 1; });
      setEmotionDistribution(Object.entries(emotionCount).slice(0, 6).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekly = days.map(day => ({ day, verses: 0, reflections: 0 }));
      activitiesData.forEach(a => { if (a?.timestamp && a.activityType === 'verse_completed') { weekly[new Date(a.timestamp).getDay()].verses++; } });
      reflectionsData.forEach(r => { if (r?.createdAt) { weekly[new Date(r.createdAt).getDay()].reflections++; } });
      setWeeklyActivity(weekly);
      
      const trends = [];
      for (let i = 29; i >= 0; i--) { const date = new Date(); date.setDate(date.getDate() - i); trends.push({ date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), activities: 0 }); }
      activitiesData.forEach(a => { if (a?.timestamp) { const activityDate = new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); const trend = trends.find(t => t.date === activityDate); if (trend) trend.activities++; } });
      setMonthlyTrend(trends);
      
      const totalVerses = activitiesData.filter(a => a?.activityType === 'verse_completed').length;
      const totalReflections = reflectionsData.length;
      setSpiritualGrowth([
        { subject: 'Quran Reading', value: Math.min(100, totalVerses * 2) },
        { subject: 'Reflection', value: Math.min(100, totalReflections * 5) },
        { subject: 'Consistency', value: Math.min(100, activitiesData.length * 2) },
      ]);
      
      setAchievements([
        { id: 1, name: 'First Steps', icon: '🌱', requirement: 1, current: activitiesData.length, unlocked: activitiesData.length >= 1, xp: 50 },
        { id: 2, name: 'Consistent Seeker', icon: '📿', requirement: 7, current: currentStreak, unlocked: currentStreak >= 7, xp: 100 },
        { id: 3, name: 'Reflection Master', icon: '💭', requirement: 10, current: totalReflections, unlocked: totalReflections >= 10, xp: 150 },
      ]);
      
      setPredictions({
        projectedActivities: Math.round((activitiesData.length / 30) * 30),
        growthPotential: Math.min(100, activitiesData.length * 2),
        nextMilestone: activitiesData.length > 50 ? 'Expert Level' : 'Advanced Level',
        encouragement: "Every step brings you closer to Allah. Keep going!"
      });
      
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handleGameScore = (points) => { setGameXP(prev => prev + points); addXP?.(points); toast.success(`+${points} XP from Spiritual Compass!`); };
  const handleExport = () => {
    const data = { activities, reflections, gameXP, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `spiritual-journey-${userId}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Your spiritual journey exported!');
  };
  const handleShare = async () => {
    const shareText = `My spiritual journey: ${reflections.length} reflections, ${streakData.current} day streak! +${gameXP} game XP! 🕌✨`;
    if (navigator.share) { try { await navigator.share({ title: 'My Spiritual Journey', text: shareText }); } catch (error) {} } 
    else { navigator.clipboard.writeText(shareText); toast.success('Copied to clipboard!'); }
  };

  const emotionColors = ['#10B981', '#EC4899', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your spiritual journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <FiBarChart2 className="text-white" size={16} />
            <span className="text-sm font-medium">Spiritual Analytics</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Spiritual Journey</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Track your growth, reflections, and progress on your path to Allah
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { icon: FiActivity, label: 'Total Activities', value: activities.length, bg: 'bg-white', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
            { icon: FiHeart, label: 'Reflections', value: reflections.length, bg: 'bg-white', iconBg: 'bg-pink-100', iconColor: 'text-pink-500' },
            { icon: FiSmile, label: 'Emotions Felt', value: emotionDistribution.length, bg: 'bg-white', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
            { icon: FiAward, label: 'Game XP', value: gameXP, bg: 'bg-white', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className={stat.iconColor} size={20} />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              </div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Streak Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="text-7xl">🔥</div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Streak</p>
                <p className="text-4xl font-bold text-gray-800">{streakData.current} <span className="text-lg text-gray-400">days</span></p>
                <p className="text-sm text-gray-500 mt-1">Longest: {streakData.longest} days</p>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Consistency Rate</span>
                <span>{Math.round(streakData.percentage)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${streakData.percentage}%` }} />
              </div>
              <p className="text-sm text-emerald-600 mt-3 text-right">
                {streakData.percentage > 70 ? '🌟 Amazing dedication!' : '💪 Keep the momentum going!'}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        {weeklyActivity.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiCalendar className="text-emerald-500" size={22} /> Weekly Activity
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="verses" fill="#10B981" radius={[8, 8, 0, 0]} name="📖 Verses Read" />
                  <Bar dataKey="reflections" fill="#F59E0B" radius={[8, 8, 0, 0]} name="💭 Reflections" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Radar Chart */}
          {spiritualGrowth.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FiTarget className="text-emerald-500" size={22} /> Spiritual Growth
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={spiritualGrowth}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Radar name="Your Progress" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Game */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiCompass className="text-emerald-500" size={22} /> Spiritual Compass Game
            </h3>
            <SpiritualCompassGame onScoreUpdate={handleGameScore} />
          </div>
        </div>

        {/* Emotion Distribution */}
        {emotionDistribution.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiPieChart className="text-emerald-500" size={22} /> Emotional Landscape
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={emotionDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {emotionDistribution.map((entry, idx) => (<Cell key={idx} fill={emotionColors[idx % emotionColors.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Growth Trend */}
        {monthlyTrend.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiTrendingUp className="text-emerald-500" size={22} /> Growth Trend (30 Days)
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#9ca3af" angle={-45} textAnchor="end" height={70} fontSize={11} />
                  <YAxis stroke="#9ca3af" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="activities" stroke="#10B981" fill="url(#colorActivities)" fillOpacity={0.3} name="Daily Activities" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 p-6 bg-emerald-50 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <FiZap className="text-emerald-500" size={24} />
                <h4 className="text-lg font-semibold text-emerald-800">AI-Powered Insight</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Projected Monthly</p>
                  <p className="text-2xl font-bold text-gray-800">{predictions.projectedActivities || 0} <span className="text-sm text-gray-400">activities</span></p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Growth Potential</p>
                  <p className="text-2xl font-bold text-emerald-600">{predictions.growthPotential || 0}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Next Milestone</p>
                  <p className="text-lg font-semibold text-emerald-600">{predictions.nextMilestone || 'Beginner Level'}</p>
                </div>
              </div>
              <p className="text-gray-600 mt-4 italic">✨ {predictions.encouragement}</p>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FiAward className="text-emerald-500" size={22} /> Achievements Unlocked
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map(ach => (
              <div key={ach.id} className={`p-5 rounded-xl text-center ${ach.unlocked ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 opacity-60'}`}>
                <div className="text-4xl mb-2">{ach.icon}</div>
                <p className="font-semibold text-gray-800">{ach.name}</p>
                <p className="text-sm text-gray-500 mt-1">{ach.current}/{ach.requirement}</p>
                {ach.unlocked && <p className="text-sm text-emerald-600 mt-2 font-medium">+{ach.xp} XP</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Export & Share Actions */}
        <div className="flex justify-center gap-4 mb-10">
          <button onClick={handleExport} className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 font-medium">
            <FiDownload size={18} /> Export Data
          </button>
          <button onClick={handleShare} className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center gap-2 font-medium shadow-sm">
            <FiShare2 size={18} /> Share Progress
          </button>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center">
              <FiStar className="text-emerald-600" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Spiritual Insights</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5">
              <FiHeart className="text-emerald-500 mb-3" size={20} />
              <p className="text-gray-600">You've shared <span className="text-emerald-600 font-bold text-xl">{reflections.length}</span> reflections on your spiritual journey!</p>
            </div>
            <div className="bg-white rounded-xl p-5">
              <FiStar className="text-emerald-500 mb-3" size={20} />
              <p className="text-gray-600">Keep going! Your consistency is inspiring others on their path to Allah. ✨</p>
            </div>
            <div className="bg-white rounded-xl p-5">
              <FiCompass className="text-emerald-500 mb-3" size={20} />
              <p className="text-gray-600">Your spiritual compass shows steady growth. Stay committed to your journey! 🕌</p>
            </div>
            <div className="bg-white rounded-xl p-5">
              <FiBattery className="text-emerald-500 mb-3" size={20} />
              <p className="text-gray-600">Spiritual energy: <span className="text-emerald-600 font-bold">{Math.min(100, reflections.length * 10)}%</span> charged. You're on a blessed path!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}