
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, LyricLine, AnimationType } from '../types';

interface VisualizerProps {
  project: Project;
}

const Visualizer: React.FC<VisualizerProps> = ({ project }) => {
  const { lyrics, videoUrl, styleConfig } = project;
  const [activeLyric, setActiveLyric] = useState<LyricLine | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fontStyleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (styleConfig.customFontUrl) {
      if (!fontStyleRef.current) {
        fontStyleRef.current = document.createElement('style');
        document.head.appendChild(fontStyleRef.current);
      }
      fontStyleRef.current.textContent = `
        @font-face {
          font-family: 'CustomUserFont';
          src: url('${styleConfig.customFontUrl}');
        }
      `;
    }
  }, [styleConfig.customFontUrl]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      const current = lyrics.find(l => time >= l.startTime && time <= l.endTime);
      setActiveLyric(current || null);
    }
  };

  const getAnimationProps = (type: AnimationType) => {
    switch (type) {
      case AnimationType.BLUR:
        return {
          initial: { opacity: 0, filter: 'blur(10px)', scale: 0.9 },
          animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
          exit: { opacity: 0, filter: 'blur(5px)', scale: 1.1 }
        };
      case AnimationType.REVEAL:
        return {
          initial: { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)', y: 20 },
          animate: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', y: 0 },
          exit: { opacity: 0, clipPath: 'inset(0% 0% 100% 0%)', y: -20 }
        };
      case AnimationType.BOUNCE:
        return {
          initial: { opacity: 0, y: 100 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, scale: 0.5 },
          transition: { type: "spring", stiffness: 300, damping: 15 }
        };
      case AnimationType.GLOW:
        return {
          initial: { opacity: 0, textShadow: '0 0 0px rgba(255,255,255,0)' },
          animate: { opacity: 1, textShadow: `0 0 20px ${styleConfig.fontColor}` },
          exit: { opacity: 0, scale: 1.2 }
        };
      case AnimationType.TYPING:
        return {
          initial: { width: 0, overflow: 'hidden', whiteSpace: 'nowrap' },
          animate: { width: 'auto' },
          exit: { opacity: 0 }
        };
      case AnimationType.FADE:
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  const animation = getAnimationProps(styleConfig.animationType);

  const fontStack = styleConfig.customFontUrl ? 'CustomUserFont, Amiri, serif' : `${styleConfig.fontFamily}, Amiri, serif`;

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-neutral-800">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          controls
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 gap-4">
          <svg className="w-16 h-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="font-arabic">ارفع فيديو للبدء في استخراج النصوص</p>
        </div>
      )}

      {/* Captions Layer */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem'
        }}
      >
        <div 
          className="absolute"
          style={{
            left: `${styleConfig.positionX}%`,
            top: `${styleConfig.positionY}%`,
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}
        >
          <AnimatePresence mode="wait">
            {activeLyric && (
              <motion.div
                key={activeLyric.id}
                {...animation}
                transition={{ duration: 0.4 }}
                className="max-w-4xl"
              >
                <h2 
                  className="font-arabic leading-tight"
                  style={{
                    color: styleConfig.fontColor,
                    fontSize: `${styleConfig.fontSize}px`,
                    fontFamily: fontStack,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  {activeLyric.translatedText}
                </h2>
                <p className="text-white/30 text-xs mt-2 font-sans italic opacity-50">
                  {activeLyric.originalText}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
