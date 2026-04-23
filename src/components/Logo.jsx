// src/components/Logo.jsx - Minimal version
import React from 'react';

const Logo = ({ className = '', onClick }) => {
  return (
    <div className={`flex items-center gap-2 cursor-pointer ${className}`} onClick={onClick}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 flex items-center justify-center">
        <span className="text-white font-bold text-sm">E</span>
      </div>
      <div>
        <h1 className="text-sm md:text-base font-bold bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">
          Echoes of Jannah
        </h1>
      </div>
    </div>
  );
};

export default Logo;