import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Pause, Play, Maximize2, X, Timer } from 'lucide-react';
import { usePomodoro } from './PomodoroContext';
import { NavigationItem } from '../types';

interface FloatingTimerProps {
  activeItem: NavigationItem;
}

const FloatingTimer: React.FC<FloatingTimerProps> = ({ activeItem }) => {
  const { timeLeft, isActive, toggleTimer, mode } = usePomodoro();
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  // Close PiP window when component unmounts
  useEffect(() => {
    return () => {
      if (pipWindow) {
        pipWindow.close();
      }
    };
  }, [pipWindow]);

  const togglePiP = async () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    if (!('documentPictureInPicture' in window)) {
      alert("Your browser doesn't support the Document Picture-in-Picture API.");
      return;
    }

    try {
      // @ts-ignore
      const win = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 100,
      });

      // --- CRITICAL: Copy All Stylesheets ---
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            // Link tags (Tailwind CDN)
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = styleSheet.href;
            win.document.head.appendChild(link);
          } else {
            // Internal styles
            const cssRules = [...styleSheet.cssRules].map(rule => rule.cssText).join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            win.document.head.appendChild(style);
          }
        } catch (e) {
          console.warn("Could not copy stylesheet:", e);
        }
      });

      // Ensure Dark Mode persists if active
      if (document.documentElement.classList.contains('dark')) {
        win.document.documentElement.classList.add('dark');
      }

      // Basic Body Reset for PiP
      win.document.body.className = "bg-slate-900 overflow-hidden flex items-center justify-center p-0 m-0 h-full w-full";

      win.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      setPipWindow(win);
    } catch (err) {
      console.error("Failed to open PiP window:", err);
    }
  };

  if (!isActive || activeItem === 'Pomodoro Timer') {
    return null;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine glow color based on mode
  const getGlowColor = () => {
    if (mode === 'pomodoro') return 'border-pink-500 shadow-pink-500/30';
    if (mode === 'shortBreak') return 'border-teal-400 shadow-teal-400/30';
    return 'border-indigo-500 shadow-indigo-500/30';
  };

  const TimerContent = (
    <div className={`
      flex items-center gap-4 px-4 py-2.5 rounded-full 
      bg-black/90 backdrop-blur-md text-white 
      border-2 ${getGlowColor()} shadow-lg 
      transition-all duration-300 hover:scale-105
    `}>
      {/* Dynamic Icon */}
      <div className={`p-2 rounded-full ${mode === 'pomodoro' ? 'bg-pink-600' : 'bg-teal-600'} animate-pulse`}>
         <Timer size={16} className="text-white" />
      </div>

      <div className="flex flex-col">
        <span className="font-mono text-2xl font-bold leading-none tracking-tight">
          {formatTime(timeLeft)}
        </span>
        <span className="text-[9px] uppercase tracking-widest font-bold opacity-70">
          {mode === 'pomodoro' ? 'Focusing' : 'Break'}
        </span>
      </div>

      <div className="h-6 w-[1px] bg-white/20 mx-1"></div>

      <div className="flex items-center gap-1">
        <button 
          onClick={toggleTimer}
          className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95"
        >
          {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>

        {!pipWindow && (
          <button 
            onClick={togglePiP}
            className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95"
            title="Open Mini Player"
          >
            <Maximize2 size={16} />
          </button>
        )}
      </div>
    </div>
  );

  if (pipWindow) {
    return ReactDOM.createPortal(
      <div className="w-full h-full flex items-center justify-center">
        {TimerContent}
      </div>,
      pipWindow.document.body
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-fade-in origin-bottom-right">
      {TimerContent}
    </div>
  );
};

export default FloatingTimer;
