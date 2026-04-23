import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiHeart, FiSmile, FiSun, FiMoon, FiWind, FiCloud, FiZap } from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

const EMOTIONS = [
  { id: 'grateful', name: 'Grateful', icon: '🙏', color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  { id: 'hopeful', name: 'Hopeful', icon: '🌅', color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
  { id: 'joyful', name: 'Joyful', icon: '✨', color: 'pink', bgColor: 'bg-pink-50', textColor: 'text-pink-700' },
  { id: 'sad', name: 'Sad', icon: '💔', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  { id: 'anxious', name: 'Anxious', icon: '🕯️', color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  { id: 'stressed', name: 'Stressed', icon: '😰', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  { id: 'lonely', name: 'Lonely', icon: '😢', color: 'indigo', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
  { id: 'lost', name: 'Lost', icon: '🧭', color: 'teal', bgColor: 'bg-teal-50', textColor: 'text-teal-700' },
  { id: 'guilty', name: 'Guilty', icon: '😔', color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
  { id: 'confused', name: 'Confused', icon: '🤔', color: 'cyan', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700' }
];

export default function ReflectionModal({ isOpen, onClose, onSuccess }) {
  const { userId, addXP } = useUser();
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please write your reflection');
      return;
    }

    if (!selectedEmotion) {
      toast.error('Please select an emotion');
      return;
    }

    setSubmitting(true);
    try {
      const reflection = {
        id: Date.now(),
        userId,
        content: content.trim(),
        emotion: selectedEmotion,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: []
      };

      const savedReflections = localStorage.getItem(`reflections_${userId}`);
      const reflections = savedReflections ? JSON.parse(savedReflections) : [];
      reflections.unshift(reflection);
      localStorage.setItem(`reflections_${userId}`, JSON.stringify(reflections));

      addXP(15);
      toast.success('Reflection shared! +15 XP', { icon: '✨' });
      
      setContent('');
      setSelectedEmotion('');
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast.error('Failed to save reflection');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FiHeart className="text-emerald-500" size={16} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Share Your Reflection</h2>
              </div>
              <p className="text-gray-500 text-sm ml-10">Connect with the community</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
            >
              <FiX size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Emotion Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How are you feeling? <span className="text-emerald-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {EMOTIONS.map((emotion) => {
                  const isSelected = selectedEmotion === emotion.id;
                  return (
                    <button
                      key={emotion.id}
                      onClick={() => setSelectedEmotion(emotion.id)}
                      className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 border ${
                        isSelected
                          ? `${emotion.bgColor} border-${emotion.color}-300 shadow-sm`
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl">{emotion.icon}</span>
                      <span className={`text-xs font-medium ${isSelected ? emotion.textColor : 'text-gray-600'}`}>
                        {emotion.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reflection Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Reflection <span className="text-emerald-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share what's on your heart, what you've learned, or how Allah has guided you today..."
                rows="5"
                maxLength="500"
                className="w-full bg-gray-50 rounded-xl p-4 text-gray-800 placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all
                         border border-gray-200 resize-none text-sm"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">
                  {content.length}/500 characters
                </p>
                <p className="text-xs text-emerald-500">✨ Your voice matters</p>
              </div>
            </div>

            {/* Preview Card */}
            {content && selectedEmotion && (
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium mb-2">Preview</p>
                <div className="flex items-start gap-2">
                  <span className="text-xl">
                    {EMOTIONS.find(e => e.id === selectedEmotion)?.icon}
                  </span>
                  <p className="text-gray-700 text-sm line-clamp-3">{content}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSubmit}
              disabled={submitting || !content.trim() || !selectedEmotion}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-xl 
                       transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed 
                       flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <FiSend size={16} /> Share with Community
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </AnimatePresence>
  );
}