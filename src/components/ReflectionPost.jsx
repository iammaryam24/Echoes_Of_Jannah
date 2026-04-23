import React, { useState } from 'react';
import { FiSend, FiLoader, FiHeart, FiBookOpen, FiUser, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import { useQuranAuth } from '../contexts/QuranAuthContext';

export default function ReflectionPost({ compact = false, onSuccess }) {
  const { userId, addReflection, addXP } = useUser();
  const { isAuthenticated } = useQuranAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please share your reflection');
      return;
    }
    
    setLoading(true);
    
    const reflection = {
      content: content.trim(),
      emotion: 'reflective',
      createdAt: new Date().toISOString(),
      isPublic: false,
    };
    
    await addReflection(reflection);
    addXP(10);
    
    toast.success('Reflection saved! +10 XP');
    setContent('');
    if (onSuccess) onSuccess();
    setLoading(false);
  };

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <FiHeart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share a quick reflection..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
          >
            {loading ? <FiLoader className="animate-spin" size={14} /> : <FiSend size={14} />}
          </button>
        </div>
        {!isAuthenticated && (
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-amber-600 bg-amber-50 py-1.5 rounded-lg">
            <FiAlertCircle size={12} />
            <span>Sign in to save reflections to Quran Foundation</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
          <FiBookOpen size={14} className="text-white" />
        </div>
        <h3 className="font-semibold text-gray-900">Share Your Reflection</h3>
        <span className="text-xs text-gray-400 ml-auto">✨ +10 XP</span>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your heart today? Share your thoughts, feelings, or what Allah has guided you to..."
        rows={4}
        maxLength={500}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 resize-none transition"
      />
      
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              <FiUser size={10} />
              <span>Sign in to save</span>
            </div>
          )}
          <p className="text-xs text-gray-400">
            {content.length}/500 characters
          </p>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
        >
          {loading ? (
            <>
              <FiLoader className="animate-spin" size={14} />
              Saving...
            </>
          ) : (
            <>
              <FiSend size={14} />
              Post Reflection
            </>
          )}
        </button>
      </div>
    </div>
  );
}