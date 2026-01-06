
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useTheme } from '../ThemeContext';

// Simplified levels. The system decides based on runtime metrics.
export type EffectiveLevel = 'performance' | 'balanced' | 'quality';

interface PerformanceContextType {
  effectiveLevel: EffectiveLevel;
  fps: number;
  getGlassClass: (base: string, opacity?: string) => string;
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
  
  // Default to balanced to ensure stability on load
  const [effectiveLevel, setEffectiveLevel] = useState<EffectiveLevel>('balanced');
  const [fps, setFps] = useState(0); // Initialize at 0 to indicate calculating

  // Measurement Refs
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const stabilityCounterRef = useRef(0); 
  const lastChangeTimeRef = useRef(performance.now());
  const longTaskCountRef = useRef(0);

  // --- ADAPTIVE LOGIC ---
  const adjustQuality = useCallback((currentFPS: number, longTasks: number) => {
    const now = performance.now();
    const timeSinceLastChange = now - lastChangeTimeRef.current;

    // Cooldowns to prevent rapid oscillation
    const DOWNGRADE_COOLDOWN = 2000; 
    const UPGRADE_COOLDOWN = 8000;

    const currentIndex = LEVEL_ORDER.indexOf(effectiveLevel);

    // 1. CRITICAL DOWNGRADE (Immediate Lag Detected)
    // < 30 FPS or Main Thread Blocking
    if ((currentFPS < 30 || longTasks >= 2) && currentIndex > 0) {
        if (timeSinceLastChange > DOWNGRADE_COOLDOWN) {
            const nextLevel = LEVEL_ORDER[currentIndex - 1];
            setEffectiveLevel(nextLevel);
            lastChangeTimeRef.current = now;
            stabilityCounterRef.current = 0; 
        }
        return;
    }

    // 2. MODERATE DOWNGRADE (Sustained "Bad" FPS)
    // We set the threshold at 45 FPS. This supports 60Hz screens dropping frames, 
    // but ignores 120Hz screens dropping to 90Hz (which is still smooth).
    if (currentFPS < 45 && currentIndex > 0) {
        stabilityCounterRef.current--;
        if (stabilityCounterRef.current <= -3) { // ~3 seconds of poor performance
             if (timeSinceLastChange > DOWNGRADE_COOLDOWN) {
                const nextLevel = LEVEL_ORDER[currentIndex - 1];
                setEffectiveLevel(nextLevel);
                lastChangeTimeRef.current = now;
                stabilityCounterRef.current = 0;
             }
        }
        return;
    }

    // 3. UPGRADE (Sustained Smoothness)
    // We upgrade if FPS is consistently high. 
    // 58 is safe for 60Hz. For 120Hz+, this will always be true, pushing to Quality.
    if (currentFPS >= 58 && longTasks === 0 && currentIndex < LEVEL_ORDER.length - 1) {
        stabilityCounterRef.current++;
        if (stabilityCounterRef.current >= 5) { // ~5 seconds of perfect performance
            if (timeSinceLastChange > UPGRADE_COOLDOWN) {
                const nextLevel = LEVEL_ORDER[currentIndex + 1];
                setEffectiveLevel(nextLevel);
                lastChangeTimeRef.current = now;
                stabilityCounterRef.current = 0;
            }
        }
        return;
    }

    // Decay stability counter to prevent getting stuck
    if (stabilityCounterRef.current > 0) stabilityCounterRef.current--;
    if (stabilityCounterRef.current < 0) stabilityCounterRef.current++;

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
      // PERFORMANCE: Solid colors
      if (effectiveLevel === 'performance') {
          if (themeMode === 'crescere') {
              return 'bg-[#fff0f5] border-rose-200 text-slate-900 shadow-none';
          }
          return 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-none';
      }
      
      // BALANCED: Transparency, no blur (Cheap)
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
        getGlassClass 
    }}>
      {children}
    </PerformanceContext.Provider>
  );
};
