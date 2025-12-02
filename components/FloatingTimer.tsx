
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
    // If PiP is already open, focus it or close it (here we allow creating a new one or closing logic)
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    // Check API support
    if (!('documentPictureInPicture' in window)) {
      alert("Your browser doesn't support the Document Picture-in-Picture API. Try Chrome or Edge.");
      return;
    }

    try {
      // @ts-ignore - Types might not be updated for this newer API yet
      const win = await window.documentPictureInPicture.requestWindow({
        width: 300,
        height: 150,
      });

      // Copy all style sheets to the new window so Tailwind/CSS works
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          win.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = styleSheet.href || '';
          win.document.head.appendChild(link);
        }
      });

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
    <div className={`flex items-center gap-3 p-2 pr-4 bg-navy-900 text-white dark:bg-slate-800 dark:text-white rounded-full shadow-2xl border border-white/10 dark:border-slate-600 transition-all hover:scale-105 ${pipWindow ? 'h-screen w-screen justify-center rounded-none' : ''}`}>
      
      {/* Icon / Mode Indicator */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          mode === 'shortBreak' || mode === 'longBreak' ? 'bg-green-500' : 'bg-pink-500'
      }`}>
          <Timer size={20} className="text-white" />
      </div>

      <div className="flex flex-col min-w-[60px]">
          <span className="text-[10px] opacity-70 uppercase tracking-widest font-bold">
              {mode === 'pomodoro' ? 'Focus' : 'Break'}
          </span>
          <span className="font-mono font-bold text-xl leading-none tracking-tight">
              {formatTime(timeLeft)}
          </span>
      </div>

      <div className="flex items-center gap-1 border-l border-white/10 pl-2 ml-1">
        <button 
          onClick={toggleTimer}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          title={isActive ? "Pause" : "Resume"}
        >
          {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>
        
        {!pipWindow && (
          <button 
            onClick={togglePiP}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="Pop out player"
          >
            <ExternalLink size={16} />
          </button>
        )}
      </div>
    </div>
  );

  // If PiP window is active, render into it using Portal
  if (pipWindow) {
    return ReactDOM.createPortal(
      <div className="flex items-center justify-center h-full bg-navy-900 text-white">
        {TimerContent}
      </div>,
      pipWindow.document.body
    );
  }

  // Otherwise render fixed floating widget in main window
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in origin-bottom-right">
      {TimerContent}
    </div>
  );
};

export default FloatingTimer;
