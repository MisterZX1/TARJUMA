
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VisualStyle, LyricLine } from '../types';

interface ThemeProps {
  activeLyric: LyricLine | null;
  audioData?: number[];
}

export const NatureTheme: React.FC<ThemeProps> = ({ activeLyric }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-950 to-emerald-900">
      {/* Animated Background Elements */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: '110%', opacity: 0, rotate: 0 }}
          animate={{ 
            y: '-10%', 
            opacity: [0, 0.4, 0],
            rotate: 360,
            x: Math.sin(i) * 50 + 'px'
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
          className="absolute text-emerald-500/20 pointer-events-none"
          style={{ left: `${Math.random() * 100}%` }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
             <path d="M17,8C15.31,8 13.84,8.81 12.91,10.05C12.33,8.81 10.9,8 9.25,8C7,8 5.17,9.83 5.17,12.08C5.17,14.33 7,16.17 9.25,16.17C10.9,16.17 12.33,15.36 12.91,14.12C13.84,15.36 15.31,16.17 17,16.17C19.25,16.17 21.08,14.33 21.08,12.08C21.08,9.83 19.25,8 17,8Z" />
          </svg>
        </motion.div>
      ))}

      <AnimatePresence mode="wait">
        {activeLyric && (
          <motion.div
            key={activeLyric.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            className="text-center px-8 z-10"
          >
            <p className="text-xl md:text-2xl text-emerald-200/60 mb-4 font-light italic">
              {activeLyric.originalText}
            </p>
            <h1 className="text-4xl md:text-6xl font-arabic text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] leading-relaxed">
              {activeLyric.translatedText}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MusicalTheme: React.FC<ThemeProps> = ({ activeLyric, audioData = [] }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Audio Visualizer Bars */}
      <div className="absolute inset-0 flex items-center justify-around opacity-30">
        {audioData.slice(0, 40).map((val, i) => (
          <motion.div
            key={i}
            animate={{ height: `${val * 100}%` }}
            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
            className="w-1 bg-blue-500 rounded-full"
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeLyric && (
          <motion.div
            key={activeLyric.id}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="text-center px-8 z-10"
          >
             <p className="text-xl md:text-2xl text-blue-400 font-bold tracking-widest uppercase mb-4">
              {activeLyric.originalText}
            </p>
            <h1 className="text-4xl md:text-6xl font-arabic text-white font-bold drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              {activeLyric.translatedText}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ClassicTheme: React.FC<ThemeProps> = ({ activeLyric }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0d0905] overflow-hidden border-8 border-[#2d1f0e]">
       {/* Texture overlay */}
       <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]"></div>
       
       <AnimatePresence mode="wait">
        {activeLyric && (
          <motion.div
            key={activeLyric.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="text-center px-12 z-10"
          >
            <p className="text-lg md:text-xl text-amber-100/40 mb-8 font-serif uppercase tracking-[0.2em]">
              {activeLyric.originalText}
            </p>
            <h1 className="text-5xl md:text-7xl font-arabic text-amber-200 leading-snug drop-shadow-lg">
              {activeLyric.translatedText}
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: activeLyric.endTime - activeLyric.startTime }}
              className="h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-8"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
