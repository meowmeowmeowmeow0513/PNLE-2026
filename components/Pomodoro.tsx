
import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { usePomodoro, TimerMode } from './PomodoroContext';

const Pomodoro: React.FC = () => {
  const { 
    mode, 
    timeLeft, 
    initialTime, 
    isActive, 
    customTime, 
    isMuted,
    toggleTimer, 
    resetTimer, 
    switchMode, 
    setCustomTimeValue,
    toggleMute
  } = usePomodoro();

  const modes: { id: TimerMode; label: string }[] = [
    { id: 'pomodoro', label: 'Pomodoro' },
    { id: 'shortBreak', label: 'Short Break' },
    { id: 'longBreak', label: 'Long Break' },
    { id: 'custom', label: 'Custom' },
  ];

  // Circle animation config
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (timeLeft / initialTime) * circumference;

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0 && val <= 180) {
      setCustomTimeValue(val);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-8">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 w-full max-w-lg border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-colors duration-300">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 to-navy-800"></div>
        
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Pomodoro Timer</h2>
            <button 
                onClick={toggleMute}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 gap-2 flex-wrap">
          {modes.filter(m => m.id !== 'custom').map((m) => (
            <button
              key={m.id}
              onClick={() => switchMode(m.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === m.id
                  ? 'bg-navy-900 dark:bg-navy-800 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {m.label}
            </button>
          ))}
          <button
              onClick={() => switchMode('custom')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === 'custom'
                  ? 'bg-navy-900 dark:bg-navy-800 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Custom
          </button>
        </div>

        {mode === 'custom' && (
           <div className="flex justify-center items-center gap-2 mb-6">
             <label className="text-sm text-slate-600 dark:text-slate-300">Minutes:</label>
             <input 
               type="number" 
               min="1" 
               max="180" 
               value={customTime} 
               onChange={handleCustomChange}
               className="w-20 p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
             />
           </div>
        )}

        {/* Timer Display */}
        <div className="relative w-72 h-72 mx-auto mb-10">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className="fill-none stroke-slate-100 dark:stroke-slate-700 transition-colors"
              strokeWidth="12"
            />
            {/* Progress Ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className="fill-none stroke-pink-accent transition-all duration-500 ease-in-out"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-6xl font-bold text-navy-900 dark:text-white font-mono tracking-tight transition-colors">
              {formatTime(timeLeft)}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest text-sm mt-2 transition-colors">
              {isActive ? 'Focusing' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={resetTimer}
            className="p-4 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Reset"
          >
            <RotateCcw size={24} />
          </button>

          <button
            onClick={toggleTimer}
            className={`p-6 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95 ${
              isActive ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-pink-accent text-white hover:bg-pink-500'
            }`}
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
        </div>

        {/* Placeholder for GlobalYoutubePlayer Portal */}
        <div 
          id="video-placeholder" 
          className="w-full aspect-video bg-slate-100 dark:bg-slate-700/50 rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-600"
        >
           {/* The GlobalYoutubePlayer will portal into here when mounted */}
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
