
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePomodoro } from './PomodoroContext';
import { useTheme } from '../ThemeContext';
import { Play, Pause, Minimize2, Zap, Brain, Coffee, Sparkles } from 'lucide-react';

interface PomodoroFullScreenProps {
  onClose: () => void;
}

const PomodoroFullScreen: React.FC<PomodoroFullScreenProps> = ({ onClose }) => {
  const { 
    timeLeft, 
    isActive, 
    mode, 
    toggleTimer, 
    focusTask, 
    sessionsCompleted, 
    sessionGoal,
    focusIntegrity
  } = usePomodoro();

  const { themeMode, accentColor } = useTheme();
  const [mounted, setMounted] = useState(false);

  // --- NATIVE FULLSCREEN TRIGGER ---
  useEffect(() => {
    setMounted(true);
    const enterFullScreen = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if ((document.documentElement as any).webkitRequestFullscreen) {
                await (document.documentElement as any).webkitRequestFullscreen();
            }
        } catch (e) {
            console.log("Fullscreen request blocked or not supported", e);
        }
    };
    enterFullScreen();

    return () => {
        if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(e => console.log(e));
        } else if ((document as any).webkitExitFullscreen && (document as any).webkitFullscreenElement) {
            (document as any).webkitExitFullscreen();
        }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate Progress
  const totalTime = mode === 'focus' ? 25 * 60 : (mode === 'shortBreak' ? 5 * 60 : 15 * 60); 
  const progress = Math.min(100, Math.max(0, ((totalTime - timeLeft) / totalTime) * 100));

  const isFocus = mode === 'focus';
  // Use User Accent for Focus, Cyan for Break
  const activeColor = isFocus ? accentColor : '#06b6d4'; 

  // --- DYNAMIC VISUAL ENGINE ---
  
  // 1. Text Styles (Clean & Sharp)
  const getTimerStyle = () => {
      // Light / Crescere: Clean text, colored
      if (themeMode === 'light' || themeMode === 'crescere') {
          return {
              color: activeColor,
              textShadow: 'none',
              filter: 'none'
          };
      }
      
      // Dark Mode: PURE WHITE, NO BLURRY GLOW.
      // Replaced neon glow with a subtle deep shadow for lift.
      return {
          color: '#ffffff',
          textShadow: '0 10px 40px rgba(0,0,0,0.5)', // Crisp lift, no fuzz
          filter: 'none'
      };
  };

  // 2. Background Engine (Refined for aesthetics)
  const getBackground = () => {
      if (themeMode === 'crescere') {
          return (
              <>
                <div className="absolute inset-0 bg-[#fff0f5]"></div>
                {/* Aurora Mesh */}
                <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_50%_0%,_rgba(251,113,133,0.4),transparent_60%)]"></div>
                <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_100%_100%,_rgba(251,191,36,0.3),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
              </>
          );
      }
      if (themeMode === 'light') {
          return (
              <div className="absolute inset-0 bg-slate-50">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_100%)] opacity-80"></div>
              </div>
          );
      }
      // Dark Mode (Refined Aesthetics - "OLED Deep")
      return (
          <>
            <div className="absolute inset-0 bg-[#020617]"></div>
            
            {/* Soft Ambient Light (Not a spotlight, more of a presence) */}
            <div 
                className="absolute top-1/2 left-1/2 w-[80vw] h-[80vw] rounded-full transition-all duration-[2000ms] ease-in-out pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${activeColor} 0%, transparent 70%)`,
                    opacity: isActive ? 0.15 : 0.08, // Very subtle
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(120px)' // Extreme blur for smoothness
                }}
            ></div>

            {/* Subtle Noise for texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none"></div>
          </>
      );
  };

  // 3. UI Element Colors (Text & Borders)
  const uiColors = {
      textMain: (themeMode === 'light' || themeMode === 'crescere') ? 'text-slate-900' : 'text-white',
      textSub: (themeMode === 'light' || themeMode === 'crescere') ? 'text-slate-500' : 'text-slate-400',
      glassPanel: (themeMode === 'light' || themeMode === 'crescere') 
          ? 'bg-white/80 border-slate-200 shadow-sm' 
          : 'bg-white/5 border-white/10 backdrop-blur-md',
      buttonBg: (themeMode === 'light' || themeMode === 'crescere')
          ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
          : 'bg-white/10 border-white/10 text-white hover:bg-white/20',
  };

  // 4. Play Button Specifics
  const getPlayButtonStyle = () => {
      const isLightTheme = themeMode === 'light' || themeMode === 'crescere';
      
      return {
          backgroundColor: isLightTheme ? '#ffffff' : 'rgba(255,255,255,0.05)',
          borderColor: activeColor,
          color: isLightTheme ? activeColor : '#ffffff', 
          // Tighter, cleaner shadow in dark mode (no bloom)
          boxShadow: isActive 
            ? (isLightTheme ? `0 0 30px ${activeColor}40` : `0 0 20px -5px ${activeColor}60`) 
            : 'none',
          backdropFilter: 'blur(10px)'
      };
  };

  return createPortal(
    <div className={`fixed inset-0 z-[10000] flex flex-col overflow-hidden transition-opacity duration-500 font-sans ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Background Layer */}
      {getBackground()}

      {/* --- HEADER --- */}
      <div className="relative z-20 flex justify-between items-center p-6 md:p-8 landscape:p-4 shrink-0">
        <div className="flex items-center gap-4">
            <div 
                className={`p-3 rounded-2xl border transition-all duration-500 ${uiColors.glassPanel}`}
                style={{ 
                    color: activeColor,
                    borderColor: isActive ? `${activeColor}40` : ''
                }}
            >
                {isFocus ? <Brain size={24} /> : <Coffee size={24} />}
            </div>
            <div>
                <h2 className={`font-black text-xl md:text-2xl tracking-tight uppercase leading-none ${uiColors.textMain}`}>
                    {isFocus ? 'Deep Focus' : 'Recharge'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    {themeMode === 'crescere' && <Sparkles size={12} className="text-amber-500" />}
                    <p className={`text-xs font-bold uppercase tracking-widest ${uiColors.textSub}`}>
                        Zen Mode
                    </p>
                </div>
            </div>
        </div>

        <button 
            onClick={onClose}
            className={`p-4 rounded-full border transition-all active:scale-95 group ${uiColors.buttonBg}`}
            title="Exit Zen Mode"
        >
            <Minimize2 size={24} className="group-hover:scale-90 transition-transform opacity-70 group-hover:opacity-100" />
        </button>
      </div>

      {/* --- CENTER CONTENT (Adaptive Layout) --- */}
      <div className="flex-1 flex flex-col landscape:flex-row items-center justify-center relative z-10 px-4 gap-8 landscape:gap-16">
        
        {/* Task Label */}
        {focusTask && (
            <div className="text-center max-w-3xl animate-in slide-in-from-bottom-4 duration-700 landscape:text-left landscape:max-w-xs landscape:hidden md:landscape:block">
                <span className={`text-xs font-bold uppercase tracking-[0.3em] mb-4 block ${uiColors.textSub}`}>Current Objective</span>
                <h1 className={`text-2xl md:text-4xl font-black leading-tight text-balance ${uiColors.textMain}`}>
                    {focusTask}
                </h1>
            </div>
        )}

        {/* MASSIVE TIMER */}
        <div 
            onClick={toggleTimer}
            className={`cursor-pointer font-mono font-black text-[22vw] md:text-[16rem] landscape:text-[25vh] leading-none tracking-tighter tabular-nums select-none transition-all duration-300`}
            style={{ 
                ...getTimerStyle(),
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                opacity: isActive ? 1 : 0.7
            }}
        >
            {formatTime(timeLeft)}
        </div>

        {/* Status Pill (Portrait Only) */}
        <div className="landscape:hidden">
            <div className={`px-6 py-2 rounded-full border flex items-center gap-3 transition-all duration-500 ${uiColors.glassPanel}`}>
                <div className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`} style={{ backgroundColor: activeColor }}></div>
                <span className={`text-xs font-bold uppercase tracking-widest ${uiColors.textMain}`}>
                    {isActive ? 'Running' : 'Paused'}
                </span>
            </div>
        </div>

      </div>

      {/* --- FOOTER CONTROLS --- */}
      <div className="relative z-20 p-6 md:p-12 landscape:p-6 shrink-0">
         <div className="max-w-4xl mx-auto w-full">
            
            {/* Stats Row */}
            <div className="flex justify-between items-end mb-8 landscape:mb-4">
                <div className="flex flex-col gap-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${uiColors.textSub}`}>Goal</span>
                    <span className={`text-2xl font-black ${uiColors.textMain}`}>
                        {sessionsCompleted} <span className={`text-lg ${uiColors.textSub}`}>/ {sessionGoal}</span>
                    </span>
                </div>

                {/* Big Play Button */}
                <button 
                    onClick={toggleTimer}
                    className={`w-24 h-24 md:w-28 md:h-28 landscape:w-16 landscape:h-16 rounded-[2.5rem] landscape:rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-2`}
                    style={getPlayButtonStyle()}
                >
                    {isActive ? 
                        <Pause size={40} className="landscape:w-8 landscape:h-8" fill="currentColor" /> : 
                        <Play size={40} className="landscape:w-8 landscape:h-8 ml-1" fill="currentColor" />
                    }
                </button>

                <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${uiColors.textSub}`}>Integrity</span>
                    <div className="flex items-center gap-2">
                        <Zap size={18} className={focusIntegrity > 80 ? 'text-emerald-500' : 'text-amber-500'} fill="currentColor" />
                        <span className={`text-2xl font-black ${uiColors.textMain}`}>{focusIntegrity}%</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className={`h-1.5 w-full rounded-full overflow-hidden ${themeMode === 'light' || themeMode === 'crescere' ? 'bg-slate-200' : 'bg-white/10'}`}>
                <div 
                    className={`h-full transition-all duration-1000 ease-linear`}
                    style={{ 
                        width: `${progress}%`,
                        backgroundColor: activeColor,
                        // Removed dark mode box-shadow to be cleaner
                        boxShadow: 'none'
                    }}
                />
            </div>

         </div>
      </div>

    </div>,
    document.body
  );
};

export default PomodoroFullScreen;
