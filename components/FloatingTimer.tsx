
import React from 'react';
import { Pause, Play, Timer } from 'lucide-react';
import { usePomodoro } from './PomodoroContext';
import { NavigationItem } from '../types';

interface FloatingTimerProps {
  activeItem: NavigationItem;
}

const FloatingTimer: React.FC<FloatingTimerProps> = ({ activeItem }) => {
  const { timeLeft, isActive, toggleTimer, mode } = usePomodoro();

  // Only show if the timer is running AND we are NOT on the Pomodoro page
  if (!isActive || activeItem === 'Pomodoro Timer') {
    return null;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className="bg-navy-900 text-white dark:bg-white dark:text-navy-900 rounded-full shadow-2xl p-2 pr-5 flex items-center gap-3 border border-slate-700 dark:border-slate-200">
        
        {/* Icon / Mode Indicator */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            mode === 'shortBreak' || mode === 'longBreak' ? 'bg-green-500' : 'bg-pink-500'
        }`}>
            <Timer size={20} className="text-white" />
        </div>

        <div className="flex flex-col">
            <span className="text-xs opacity-80 uppercase tracking-wider font-semibold">
                {mode === 'pomodoro' ? 'Focus' : 'Break'}
            </span>
            <span className="font-mono font-bold text-lg leading-none">
                {formatTime(timeLeft)}
            </span>
        </div>

        <button 
          onClick={toggleTimer}
          className="ml-2 p-1.5 rounded-full hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
        >
          {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
};

export default FloatingTimer;
