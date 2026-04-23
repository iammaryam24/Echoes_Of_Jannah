import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, requireAuth = true }) {
  const { userId, loading } = useUser();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center z-50"
      >
        <div className="text-center">
          <div className="relative">
            {/* Animated rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 border-2 border-emerald-200 rounded-full animate-ping opacity-75"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-teal-200 rounded-full animate-pulse opacity-50"></div>
            </div>
            <LoadingSpinner fullScreen={false} message="Verifying your spiritual journey..." />
          </div>
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="flex gap-1">
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
            </div>
            <p className="text-gray-500 text-sm font-medium">Loading your sacred space...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (requireAuth && !userId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 bg-white flex items-center justify-center z-50"
      >
        <div className="text-center max-w-md mx-auto px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center">
              <span className="text-4xl">📜</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">
              Please sign in to continue your spiritual journey
            </p>
          </motion.div>
          <Navigate to="/" replace />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}