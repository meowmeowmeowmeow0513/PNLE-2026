
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

// Priority: Quality > Balanced > Performance
const LEVEL_ORDER: EffectiveLevel[] = ['performance', 'balanced', 'quality'];

export const PerformanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { themeMode } = useTheme();
  
  // Default to balanced. If hardware acceleration is off, this will downgrade in <1 sec.
  const [effectiveLevel, setEffectiveLevel] = useState<EffectiveLevel>('balanced');
  const [fps, setFps] = useState(60); 
  const [isLowPower, setIsLowPower] = useState(false);

  // Measurement Refs
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const stabilityCounterRef = useRef(0); 
  const lastChangeTimeRef = useRef(performance.now());
  const longTaskCountRef = useRef(0);
  const panicCounterRef = useRef(0); // New: Detects consistent fatal lag

  // --- ADAPTIVE LOGIC ---
  const adjustQuality = useCallback((currentFPS: number, longTasks: number) => {
    const now = performance.now();
    const timeSinceLastChange = now - lastChangeTimeRef.current;

    // Cooldowns
    const DOWNGRADE_COOLDOWN = 1000; // Faster downgrade
    const UPGRADE_COOLDOWN = 8000;

    const currentIndex = LEVEL_ORDER.indexOf(effectiveLevel);

    // 0. PANIC MODE (Software Rendering Detection)
    // If FPS is < 24 (Cinematic minimum), the app feels broken.
    if (currentFPS < 24) {
        panicCounterRef.current++;
        // If we hit 2 bad seconds in a row, force bottom tier immediately
        if (panicCounterRef.current >= 2) {
            if (effectiveLevel !== 'performance') {
                setEffectiveLevel('performance');
                setIsLowPower(true);
                lastChangeTimeRef.current = now;
                console.warn("Performance Panic: Forcing Low Power Mode");
            }
            return; 
        }
    } else {
        panicCounterRef.current = Math.max(0, panicCounterRef.current - 1);
    }

    // 1. CRITICAL DOWNGRADE (< 35 FPS or Long Tasks)
    if ((currentFPS < 35 || longTasks >= 1) && currentIndex > 0) {
        if (timeSinceLastChange > DOWNGRADE_COOLDOWN) {
            const nextLevel = LEVEL_ORDER[currentIndex - 1];
            setEffectiveLevel(nextLevel);
            // If we hit bottom, flag low power
            if (nextLevel === 'performance') setIsLowPower(true);
            lastChangeTimeRef.current = now;
            stabilityCounterRef.current = 0; 
        }
        return;
    }

    // 2. UPGRADE (Consistent Smoothness > 58 FPS)
    if (currentFPS >= 58 && longTasks === 0 && currentIndex < LEVEL_ORDER.length - 1) {
        stabilityCounterRef.current++;
        // Require 4 seconds of perfection to upgrade
        if (stabilityCounterRef.current >= 4) { 
            if (timeSinceLastChange > UPGRADE_COOLDOWN) {
                const nextLevel = LEVEL_ORDER[currentIndex + 1];
                setEffectiveLevel(nextLevel);
                if (nextLevel !== 'performance') setIsLowPower(false);
                lastChangeTimeRef.current = now;
                stabilityCounterRef.current = 0;
            }
        }
        return;
    }

    // Decay stability
    if (stabilityCounterRef.current > 0) stabilityCounterRef.current--;

  }, [effectiveLevel]);

  // --- MEASUREMENT LOOP ---
  useEffect(() => {
    let requestBy: number;
    let longTaskObserver: PerformanceObserver | undefined;

    try {
        if ('PerformanceObserver' in window) {
            longTaskObserver = new PerformanceObserver((list) => {
                longTaskCountRef.current += list.getEntries().length;
            });
            longTaskObserver.observe({ entryTypes: ['longtask'] });
        }
    } catch (e) {
        // Fallback
    }

    const loop = (time: number) => {
      frameCountRef.current++;
      const elapsed = time - lastTimeRef.current;

      // Evaluate every ~1000ms
      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        
        adjustQuality(currentFps, longTaskCountRef.current);

        frameCountRef.current = 0;
        lastTimeRef.current = time;
        longTaskCountRef.current = 0;
      }

      requestBy = requestAnimationFrame(loop);
    };

    requestBy = requestAnimationFrame(loop);

    return () => {
        cancelAnimationFrame(requestBy);
        longTaskObserver?.disconnect();
    };
  }, [adjustQuality]);

  // --- APPLY GLOBAL STYLES ---
  useEffect(() => {
      const root = document.documentElement;
      root.classList.remove('gfx-performance', 'gfx-balanced', 'gfx-quality');
      root.classList.add(`gfx-${effectiveLevel}`);
  }, [effectiveLevel]);

  const getGlassClass = (base: string, opacity = 'bg-white/80') => {
      // PERFORMANCE: Solid colors, NO BLUR. 
      // If hardware acceleration is off, blur kills the paint thread.
      if (effectiveLevel === 'performance') {
          if (themeMode === 'crescere') {
              return 'bg-[#fff0f5] border-rose-200 text-slate-900 shadow-sm';
          }
          return 'bg-[#f8fafc] dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-sm';
      }
      
      // BALANCED: Transparency, no blur (Cheap GPU cost)
      if (effectiveLevel === 'balanced') {
          return `${opacity} dark:bg-slate-900/90 border-slate-200/50 dark:border-white/5 backdrop-blur-none`;
      }
      
      // QUALITY: Full blur (Expensive)
      return `${base} backdrop-blur-xl ${opacity} dark:bg-[#0f172a]/60 border-slate-200/50 dark:border-white/5`;
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
