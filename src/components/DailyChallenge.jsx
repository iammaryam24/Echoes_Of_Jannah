import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiStar, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';

const challenges = [
  { id: 1, type: 'verse', title: 'Read a verse', description: 'Read and reflect on any verse from the Quran', xp: 15, icon: '📖' },
  { id: 2, type: 'reflection', title: 'Share a reflection', description: 'Write down your thoughts and feelings', xp: 20, icon: '💭' },
  { id: 3, type: 'bookmark', title: 'Save a verse', description: 'Bookmark a verse that speaks to your heart', xp: 10, icon: '🔖' },
  { id: 4, type: 'tafsir', title: 'Learn tafsir', description: 'Read the explanation of a verse', xp: 15, icon: '📚' },
];

export default function DailyChallenge({ onComplete }) {
  const { userId, addXP, updateStreak } = useUser();
  const [challenge, setChallenge] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  const loadDailyChallenge = async () => {
    setLoading(true);
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`daily_challenge_${userId}`);
    
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        setChallenge(parsed.challenge);
        setCompleted(parsed.completed || false);
        setLoading(false);
        return;
      }
    }
    
    const random = challenges[Math.floor(Math.random() * challenges.length)];
    const newChallenge = { ...random, date: today };
    setChallenge(newChallenge);
    localStorage.setItem(`daily_challenge_${userId}`, JSON.stringify({
      challenge: newChallenge, date: today, completed: false
    }));
    setLoading(false);
  };

  const handleComplete = async () => {
    if (completed) {
      toast.error("You've already completed today's challenge");
      return;
    }
    
    setCompleted(true);
    addXP(challenge.xp);
    await updateStreak();
    
    localStorage.setItem(`daily_challenge_${userId}`, JSON.stringify({
      challenge, date: new Date().toDateString(), completed: true
    }));
    
    toast.success(`+${challenge.xp} XP earned!`, { icon: '🎉' });
    if (onComplete) onComplete();
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-16 bg-gray-50 rounded" />
        </div>
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-xl">
            {challenge.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Daily Challenge</h3>
            <p className="text-xs text-gray-400">+{challenge.xp} XP</p>
          </div>
        </div>
        {!completed && (
          <button onClick={loadDailyChallenge} className="p-1.5 text-gray-400 hover:text-gray-600">
            <FiRefreshCw size={14} />
          </button>
        )}
      </div>

      <h4 className="text-base font-semibold text-gray-800 mb-1">{challenge.title}</h4>
      <p className="text-sm text-gray-500 mb-4">{challenge.description}</p>

      {!completed ? (
        <button
          onClick={handleComplete}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <FiCheck size={16} />
          Complete Challenge
        </button>
      ) : (
        <div className="w-full bg-gray-50 text-emerald-600 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm border border-gray-100">
          <FiCheck size={16} />
          Challenge Completed!
        </div>
      )}
    </motion.div>
  );
}