import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiStar, FiTrophy, FiZap, FiHeart, FiBookOpen, FiUsers, FiCalendar, FiSun, FiMoon, FiCompass, FiDroplet } from 'react-icons/fi';

const achievementIcons = {
  first_step: FiHeart,
  seeker: FiStar,
  devoted: FiTrophy,
  consistent_7: FiCalendar,
  consistent_30: FiZap,
  reflective: FiBookOpen,
  wisdom_collector: FiAward,
  community_contributor: FiUsers,
  quran_lover: FiBookOpen,
  light_seeker: FiSun,
  night_prayer: FiMoon,
  truth_seeker: FiCompass,
  spiritual_healer: FiDroplet
};

const achievementColors = {
  bronze: 'from-amber-500 to-amber-400',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-amber-400',
  platinum: 'from-emerald-400 to-teal-400',
  diamond: 'from-emerald-500 to-teal-500'
};

export default function AchievementBadge({ achievement, size = 'md', showTooltip = true, onClick }) {
  const Icon = achievementIcons[achievement.id] || FiAward;
  
  const sizes = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-2xl',
    xl: 'w-28 h-28 text-3xl'
  };

  const getColor = (xp) => {
    if (xp >= 200) return 'diamond';
    if (xp >= 100) return 'platinum';
    if (xp >= 50) return 'gold';
    if (xp >= 25) return 'silver';
    return 'bronze';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      <div className={`rounded-full bg-gradient-to-r ${achievementColors[getColor(achievement.xp)]} ${sizes[size]} flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-md`}>
        <Icon className="text-white" size={size === 'xl' ? 28 : size === 'lg' ? 24 : size === 'md' ? 16 : 12} />
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
          <div className="bg-white border border-gray-200 rounded-lg p-3 whitespace-nowrap shadow-lg">
            <p className="text-sm font-semibold text-gray-800">{achievement.name}</p>
            <p className="text-xs text-gray-500">{achievement.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <FiStar className="text-emerald-500 text-xs" />
              <p className="text-xs text-emerald-600 font-medium">+{achievement.xp} XP</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-emerald-400/20 blur-md -z-10"></div>
    </motion.div>
  );
}