
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { 
    Pause, Play, MonitorPlay, Maximize2, Zap, Coffee 
} from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { 
    timeLeft, isActive, mode, pipWindow, focusTask, sessionsCompleted, sessionGoal,
    toggleTimer, setPipWindow
  } = usePomodoro();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // --- 1. PERSISTENCE LOGIC ---
  useEffect(() => {
    const checkAnchor = () => {
      const el = document.getElementById('video-anchor');
      setAnchorEl(el);
    };
    checkAnchor();
    const interval = setInterval(checkAnchor, 500);
    return () => clearInterval(interval);
  }, [activeItem]);

  const isDocked = activeItem === 'Pomodoro Timer' && anchorEl !== null;

  // --- 2. PIP LOGIC ---
  const copyStylesToWindow = (newWindow: Window) => {
    Array.from(document.styleSheets).forEach((styleSheet) => {
      try {
        if (styleSheet.cssRules) {
          const newStyle = newWindow.document.createElement('style');
          Array.from(styleSheet.cssRules).forEach((rule) => {
            newStyle.appendChild(newWindow.document.createTextNode(rule.cssText));
          });
          newWindow.document.head.appendChild(newStyle);
        } else if (styleSheet.href) {
          const newLink = newWindow.document.createElement('link');
          newLink.rel = 'stylesheet';
          newLink.href = styleSheet.href;
          newWindow.document.head.appendChild(newLink);
        }
      } catch (e) {}
    });
    // Attempt to copy Tailwind script if present
    const tailwindScript = document.querySelector('script[src*="tailwindcss"]');
    if(tailwindScript) {
        const newScript = newWindow.document.createElement('script');
        newScript.src = tailwindScript.getAttribute('src') || "";
        newWindow.document.head.appendChild(newScript);
    }
  };

  const handleTogglePiP = async () => {
    if (pipWindow) {
        pipWindow.close();
        setPipWindow(null);
        return;
    }
    
    if ('documentPictureInPicture' in window) {
        try {
            // @ts-ignore
            const newWindow = await window.documentPictureInPicture.requestWindow({
                width: 320,
                height: 380,
            });
            copyStylesToWindow(newWindow);
            
            // Set body class for aesthetics (Dark Mode Default for PiP)
            newWindow.document.body.className = "bg-[#020617] text-white flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-pink-500/30";
            
            newWindow.addEventListener('pagehide', () => setPipWindow(null));
            setPipWindow(newWindow);
        } catch (err) {
            console.error("PiP failed", err);
        }
    } else {
        alert("Picture-in-Picture not supported in this browser.");
    }
  };

  // --- 3. RENDERING ---

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // The actual Player Iframe - NEW URL
  const PlayerContent = (
      <iframe 
          width="100%" 
          height="100%" 
          src="https://www.youtube.com/embed/rFRpnSxTWR0?si=1zzNmH_5xoEnXC8X&enablejsapi=1&controls=1&autoplay=0&loop=1" 
          title="Focus Station" 
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          className="w-full h-full object-cover"
      />
  );

  // Content for the PiP Window - Windows 11 Clock Style but Superior
  const PiPContent = pipWindow ? createPortal(
    <div className="flex flex-col items-center justify-center h-full w-full relative p-6">
        {/* Animated Background Gradient */}
        <div className={`absolute inset-0 opacity-30 bg-gradient-to-br ${mode === 'focus' ? 'from-pink-600 to-purple-900' : 'from-cyan-500 to-blue-900'} animate-pulse`}></div>
        
        {/* Progress Ring Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
             <div className={`w-64 h-64 rounded-full border-4 ${mode === 'focus' ? 'border-pink-500' : 'border-cyan-500'} animate-ping`}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full">
            {/* Status Pill */}
            <div className={`mb-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 ${mode === 'focus' ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>
                {mode === 'focus' ? <Zap size={10} fill="currentColor" /> : <Coffee size={10} fill="currentColor" />}
                {mode === 'focus' ? 'Focus Mode' : 'Break Time'}
            </div>

            {/* Time */}
            <div className="text-6xl font-mono font-black tracking-tighter text-white drop-shadow-2xl tabular-nums">
                {formatTime(timeLeft)}
            </div>
            
            {/* Task or Goal */}
            <div className="mt-4 w-full text-center">
                {focusTask ? (
                    <p className="text-xs font-bold text-slate-300 line-clamp-1 border-b border-white/10 pb-2 mb-2">
                        {focusTask}
                    </p>
                ) : (
                    <div className="h-px w-1/2 bg-white/10 mx-auto mb-3"></div>
                )}
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    Session {sessionsCompleted} / {sessionGoal}
                </p>
            </div>

            {/* Controls */}
            <div className="mt-6 flex gap-4">
                <button 
                    onClick={toggleTimer} 
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-110 active:scale-95 ${mode === 'focus' ? 'bg-pink-600 hover:bg-pink-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                >
                    {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
            </div>
        </div>
    </div>,
    pipWindow.document.body
  ) : null;

  return (
    <>
        {/* STRATEGY 1: Docked Player (Portal into Pomodoro Page) */}
        {isDocked && anchorEl && createPortal(
            <div className="w-full h-full relative group rounded-2xl overflow-hidden shadow-2xl">
                {PlayerContent}
                {/* Overlay Button for PiP */}
                <button 
                    onClick={handleTogglePiP}
                    className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-500 backdrop-blur-md z-20"
                    title="Pop Out Widget"
                >
                    <MonitorPlay size={16} />
                </button>
            </div>,
            anchorEl
        )}

        {/* STRATEGY 2: Hidden Player (Keep Audio Alive) */}
        {!isDocked && (
            <div className="fixed bottom-0 right-0 w-1 h-1 opacity-0 pointer-events-none z-0">
                {PlayerContent}
            </div>
        )}

        {/* STRATEGY 3: Floating Widget (When Active + Away from Page + NOT PiP) */}
        {!isDocked && isActive && !pipWindow && (
            <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="bg-white/10 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/20 dark:border-white/10 p-2 pr-4 rounded-full shadow-2xl flex items-center gap-4 group hover:scale-105 transition-transform">
                    {/* Mini Circle */}
                    <button 
                        onClick={toggleTimer}
                        className={`relative w-12 h-12 flex items-center justify-center rounded-full shadow-lg ${mode === 'focus' ? 'bg-pink-500 text-white' : 'bg-cyan-500 text-white'}`}
                    >
                        {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>
                    
                    <div className="flex flex-col min-w-[80px]">
                        <span className="font-mono text-xl font-black text-slate-800 dark:text-white leading-none tracking-tight">
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            {mode === 'focus' ? 'Focusing' : 'Resting'}
                        </span>
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

                    <button 
                        onClick={handleTogglePiP} 
                        className="text-slate-400 hover:text-pink-500 dark:hover:text-white transition-colors"
                        title="Keep on Top"
                    >
                        <Maximize2 size={18} />
                    </button>
                </div>
            </div>
        )}

        {/* PiP Portal */}
        {PiPContent}
    </>
  );
};

export default GlobalYoutubePlayer;
