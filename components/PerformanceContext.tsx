
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useTheme } from '../ThemeContext';

export type EffectiveLevel = 'performance' | 'balanced' | 'quality';

interface PerformanceContextType {
  effectiveLevel: EffectiveLevel;
  fps: number;
  getGlassClass: (base: string, opacity?: string) => string;
  isLowPower: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

// Quality Hierarchy
const LEVEL_ORDER: EffectiveLevel[] = ['performance', 'balanced', 'quality'];

export const PerformanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { themeMode, performanceMode } = useTheme();
  
  const [effectiveLevel, setEffectiveLevel] = useState<EffectiveLevel>('balanced');
  const [fps, setFps] = useState(60); 
  const [isLowPower, setIsLowPower] = useState(false);

  // Measurement Refs
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const stabilityCounterRef = useRef(0); 
  const lastChangeTimeRef = useRef(performance.now());
  const lowFpsCounterRef = useRef(0);

  // --- ADAPTIVE LOGIC ---
  const adjustQuality = useCallback((currentFPS: number) => {
    if (performanceMode === 'quality') {
        if (effectiveLevel !== 'quality') {
            setEffectiveLevel('quality');
            setIsLowPower(false);
        }
        return;
    }

    if (performanceMode === 'performance') {
        if (effectiveLevel !== 'performance') {
            setEffectiveLevel('performance');
            setIsLowPower(true);
        }
        return;
    }

    if (performanceMode === 'balanced') {
        if (effectiveLevel !== 'balanced') {
            setEffectiveLevel('balanced');
            setIsLowPower(false);
        }
        return;
    }

    if (performanceMode === 'auto') {
        const now = performance.now();
        const timeSinceLastChange = now - lastChangeTimeRef.current;
        const currentIndex = LEVEL_ORDER.indexOf(effectiveLevel);

        if (currentFPS < 24) {
            lowFpsCounterRef.current++;
        } else {
            lowFpsCounterRef.current = Math.max(0, lowFpsCounterRef.current - 1);
        }

        if (lowFpsCounterRef.current > 3 && currentIndex > 0) {
             if (timeSinceLastChange > 2000) {
                 const nextLevel = LEVEL_ORDER[currentIndex - 1];
                 setEffectiveLevel(nextLevel);
                 if (nextLevel === 'performance') setIsLowPower(true);
                 lastChangeTimeRef.current = now;
                 lowFpsCounterRef.current = 0;
             }
        }
        
        if (currentFPS >= 58 && currentIndex < LEVEL_ORDER.length - 1) {
            stabilityCounterRef.current++;
            if (stabilityCounterRef.current > 10) {
                if (timeSinceLastChange > 10000) {
                    const nextLevel = LEVEL_ORDER[currentIndex + 1];
                    setEffectiveLevel(nextLevel);
                    setIsLowPower(false);
                    lastChangeTimeRef.current = now;
                    stabilityCounterRef.current = 0;
                }
            }
        } else {
            stabilityCounterRef.current = 0;
        }
    }

  }, [effectiveLevel, performanceMode]);

  useEffect(() => {
    if (performanceMode !== 'auto') {
        if (performanceMode === 'quality') setEffectiveLevel('quality');
        if (performanceMode === 'balanced') setEffectiveLevel('balanced');
        if (performanceMode === 'performance') {
            setEffectiveLevel('performance');
            setIsLowPower(true);
        }
        return; 
    }

    let requestBy: number;
    const loop = (time: number) => {
      frameCountRef.current++;
      const elapsed = time - lastTimeRef.current;
      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        adjustQuality(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = time;
      }
      requestBy = requestAnimationFrame(loop);
    };
    requestBy = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestBy);
  }, [adjustQuality, performanceMode]);

  useEffect(() => {
      const root = document.documentElement;
      root.classList.remove('gfx-performance', 'gfx-balanced', 'gfx-quality');
      root.classList.add(`gfx-${effectiveLevel}`);
  }, [effectiveLevel]);

  const getGlassClass = (base: string, opacity = 'bg-white/80') => {
      // --- PERFORMANCE MODE: NO TRANSPARENCY, NO BLUR ---
      if (effectiveLevel === 'performance') {
          if (themeMode === 'crescere') {
              return 'bg-[#fff0f5] border-rose-300 text-slate-900 border-2';
          }
          if (themeMode === 'dark') {
              return 'bg-[#0f172a] border-slate-700 text-white border-2';
          }
          return 'bg-white border-slate-300 text-slate-900 border-2';
      }
      
      // --- BALANCED: SOME TRANSPARENCY, NO BLUR ---
      if (effectiveLevel === 'balanced') {
          return `${opacity} dark:bg-slate-900/90 border-slate-200/50 dark:border-white/5 backdrop-blur-none`;
      }
      
      // --- QUALITY: FULL LUXURY GLASS ---
      return `${base} backdrop-blur-[64px] ${opacity} dark:bg-[#0f172a]/60 border-slate-200/50 dark:border-white/5`;
  };

  return (
    <PerformanceContext.Provider value={{ 
        effectiveLevel,
        fps, 
        getGlassClass,
        isLowPower
    }}>
      {children}
    </PerformanceContext.Provider>
  );
};
