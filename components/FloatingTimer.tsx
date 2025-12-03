import React, { useState } from 'react';
import { Pause, Play, RotateCcw, ChevronUp, ChevronDown, X } from 'lucide-react';
import { usePomodoro } from './PomodoroContext';
import { NavigationItem } from '../types';

interface FloatingTimerProps {
  activeItem: NavigationItem;
}

const FloatingTimer: React.FC<FloatingTimerProps> = ({ activeItem }) => {
  const { timeLeft, isActive, toggleTimer, resetTimer, mode, focusTask } = usePomodoro();
  const [isExpanded, setIsExpanded] = useState(true);

  // Do not show if we are on the main Pomodoro page (it has the big timer)
  if (activeItem === 'Pomodoro Timer') {
    return null;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 animate-fade-in origin-bottom-right font-sans">
      
      {/* THE CARD */}
      <div className={`
        bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl 
        border border-slate-200 dark:border-slate-700 
        shadow-2xl rounded-2xl overflow-hidden
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-80' : 'w-48'}
      `}>
        
        {/* Header / Dragger */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {mode === 'pomodoro' ? 'Focus Session' : 'Break Time'}
              </span>
           </div>
           <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
           >
             {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
           </button>
        </div>

        {/* Content Body */}
        <div className="p-4">
            
            {/* Timer Display */}
            <div className="flex items-center justify-between mb-4">
                <span className={`font-mono text-3xl font-black tracking-tighter ${
                    isActive 
                    ? 'text-pink-500 dark:text-pink-400' 
                    : 'text-slate-700 dark:text-white'
                }`}>
                    {formatTime(timeLeft)}
                </span>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={toggleTimer}
                        className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 transition-transform active:scale-95"
                    >
                        {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>
                    {isExpanded && !isActive && (
                        <button 
                            onClick={resetTimer}
                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors"
                        >
                            <RotateCcw size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Focus Task (If Expanded) */}
            {isExpanded && focusTask && (
                <div className="mb-4">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Current Task</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                        {focusTask}
                    </p>
                </div>
            )}

            {/* Video Container (The Portal Target) */}
            {/* We keep this in the DOM even if collapsed (using hidden) to keep audio alive if needed, 
                or just shrink it. For best audio persistence, we render it but hide visually if needed. */}
            <div 
                className={`
                    relative rounded-xl overflow-hidden bg-black aspect-video
                    transition-all duration-300
                    ${isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0'}
                `}
            >
                {/* ID used by GlobalYoutubePlayer to portal content here */}
                <div id="mini-player-container" className="w-full h-full"></div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default FloatingTimer;
