
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';

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
  // Default to balanced to ensure stability on load, then adapt up or down
  const [effectiveLevel, setEffectiveLevel] = useState<EffectiveLevel>('balanced');
  const [fps, setFps] = useState(60);

  // Measurement Refs
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const stabilityCounterRef = useRef(0); // Tracks consecutive stable/unstable intervals
  const lastChangeTimeRef = useRef(performance.now());
  const longTaskCountRef = useRef(0);

  // --- ADAPTIVE LOGIC ---
  const adjustQuality = useCallback((currentFPS: number, longTasks: number) => {
    const now = performance.now();
    const timeSinceLastChange = now - lastChangeTimeRef.current;

    // Cooldowns to prevent rapid oscillation
    const DOWNGRADE_COOLDOWN = 2000; // 2s before allowing another drop
    const UPGRADE_COOLDOWN = 10000;  // 10s stability required before upgrading

    const currentIndex = LEVEL_ORDER.indexOf(effectiveLevel);

    // 1. CRITICAL DOWNGRADE (Immediate)
    // FPS < 25 or significant main thread blocking
    if ((currentFPS < 25 || longTasks >= 2) && currentIndex > 0) {
        if (timeSinceLastChange > DOWNGRADE_COOLDOWN) {
            const nextLevel = LEVEL_ORDER[currentIndex - 1];
            setEffectiveLevel(nextLevel);
            lastChangeTimeRef.current = now;
            stabilityCounterRef.current = 0; // Reset stability on change
        }
        return;
    }

    // 2. MODERATE DOWNGRADE (Sustained Low FPS)
    // FPS < 45 for a few intervals
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

    // 3. UPGRADE (Sustained High Performance)
    // FPS Near 60, No Blocking, and ample time passed since last change
    if (currentFPS >= 58 && longTasks === 0 && currentIndex < LEVEL_ORDER.length - 1) {
        stabilityCounterRef.current++;
        if (stabilityCounterRef.current >= 8) { // ~8 seconds of perfect performance
            if (timeSinceLastChange > UPGRADE_COOLDOWN) {
                const nextLevel = LEVEL_ORDER[currentIndex + 1];
                setEffectiveLevel(nextLevel);
                lastChangeTimeRef.current = now;
                stabilityCounterRef.current = 0;
            }
        }
        return;
    }

    // Decay stability counter if performance is "Okay" (45-58 FPS) to prevent sticking
    if (stabilityCounterRef.current > 0) stabilityCounterRef.current--;
    if (stabilityCounterRef.current < 0) stabilityCounterRef.current++;

  }, [effectiveLevel]);

  // --- MEASUREMENT LOOP ---
  useEffect(() => {
    let requestBy: number;
    let longTaskObserver: PerformanceObserver | undefined;

    // Monitor Long Tasks (Main thread blocking > 50ms)
    try {
        if ('PerformanceObserver' in window) {
            longTaskObserver = new PerformanceObserver((list) => {
                longTaskCountRef.current += list.getEntries().length;
            });
            longTaskObserver.observe({ entryTypes: ['longtask'] });
        }
    } catch (e) {
        // Fallback for environments without PerformanceObserver support
    }

    const loop = (time: number) => {
      frameCountRef.current++;
      const elapsed = time - lastTimeRef.current;

      // Evaluate every ~1000ms
      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        
        adjustQuality(currentFps, longTaskCountRef.current);

        // Reset counters for next interval
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
      // Clean up old classes
      root.classList.remove('gfx-performance', 'gfx-balanced', 'gfx-quality');
      // Apply current level class for CSS consumption
      root.classList.add(`gfx-${effectiveLevel}`);
  }, [effectiveLevel]);

  // Helper for components to adapt rendering (glassmorphism vs solid)
  const getGlassClass = (base: string, opacity = 'bg-white/80') => {
      if (effectiveLevel === 'performance') {
          // Solid background, no blur, simple border (Fastest)
          return 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';
      }
      if (effectiveLevel === 'balanced') {
          // Transparency enabled, but NO blur (Medium)
          return `${opacity} dark:bg-slate-900/90 border-slate-200/50 dark:border-white/5`;
      }
      // Full Glassmorphism (Heavy GPU usage)
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
