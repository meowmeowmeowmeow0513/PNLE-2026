
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Pause, Play, Timer, ExternalLink, X } from 'lucide-react';
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

  // Logic to handle Document Picture-in-Picture
  const togglePiP = async () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    if (!('documentPictureInPicture' in window)) {
      alert("Your browser doesn't support the Document Picture-in-Picture API. Try Chrome or Edge.");
      return;
    }

    try {
      // @ts-ignore
      const win = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 120,
      });

      // CRITICAL: Copy all style sheets (Tailwind, Fonts) to the new window
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleSheet.href;
            win.document.head.appendChild(link);
          } else {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            win.document.head.appendChild(style);
          }
        } catch (e) {
          console.log("Could not copy stylesheet", e);
        }
      });
      
      // Force dark mode class if present on main window
      if (document.documentElement.classList.contains('dark')) {
          win.document.documentElement.classList.add('dark');
      }

      win.document.body.className = "bg-navy-900 dark:bg-slate-900 overflow-hidden flex items-center justify-center";

      // Handle closing of PiP window
      win.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      setPipWindow(win);
    } catch (err) {
      console.error("Failed to open PiP window:", err);
    }
  };

  // Condition: Show ONLY if active AND NOT on Pomodoro page
  if (!isActive || activeItem === 'Pomodoro Timer') {
    return null;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // The content of the timer
  const TimerContent = (
    <div className={`flex items-center gap-4 p-3 pr-5 bg-navy-900 text-white dark:bg-slate-800 dark:text-white rounded-full shadow-2xl border border-white/10 dark:border-slate-600 transition-all ${!pipWindow ? 'hover:scale-105' : ''}`}>
      
      {/* Icon / Mode Indicator */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
          mode === 'shortBreak' || mode === 'longBreak' ? 'bg-green-500' : 'bg-pink-500'
      } shadow-lg shadow-pink-500/20`}>
          <Timer size={24} className="text-white" />
      </div>

      <div className="flex flex-col min-w-[70px]">
          <span className="text-[10px] opacity-70 uppercase tracking-widest font-bold">
              {mode === 'pomodoro' ? 'Focus' : 'Break'}
          </span>
          <span className="font-mono font-bold text-2xl leading-none tracking-tight">
              {formatTime(timeLeft)}
          </span>
      </div>

      <div className="flex items-center gap-1 border-l border-white/10 pl-3 ml-1">
        <button 
          onClick={toggleTimer}
          className="p-2.5 rounded-full hover:bg-white/10 transition-colors active:scale-95"
          title={isActive ? "Pause" : "Resume"}
        >
          {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>
        
        {!pipWindow && (
          <button 
            onClick={togglePiP}
            className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white active:scale-95"
            title="Pop out player"
          >
            <ExternalLink size={18} />
          </button>
        )}
      </div>
    </div>
  );

  // If PiP window is active, render into it using Portal
  if (pipWindow) {
    return ReactDOM.createPortal(
      <div className="flex items-center justify-center h-full w-full">
        {TimerContent}
      </div>,
      pipWindow.document.body
    );
  }

  // Otherwise render fixed floating widget in main window
  return (
    <div className="fixed bottom-8 right-8 z-50 animate-fade-in origin-bottom-right">
      {TimerContent}
    </div>
  );
};

export default FloatingTimer;
