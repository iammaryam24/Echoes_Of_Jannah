import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = "Loading...", fullScreen = false }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-3 border-emerald-400 border-t-transparent rounded-full shadow-sm"
      />
      <div className="flex flex-col items-center gap-1">
        <p className="text-gray-600 text-sm font-medium">{message}</p>
        <div className="flex gap-1 mt-1">
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        {spinner}
      </motion.div>
    );
  }

  return spinner;
}