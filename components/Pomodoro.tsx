
import React, { useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, Waves, ExternalLink, Pencil } from 'lucide-react';
import { usePomodoro, TimerMode } from './PomodoroContext';

const Pomodoro: React.FC = () => {
  const { 
    mode, 
    timeLeft, 
    initialTime, 
    isActive, 
    customTime, 
    isMuted,
    focusTask,
    isPlayingNoise,
    toggleTimer, 
    resetTimer, 
    switchMode, 
    setCustomTimeValue,
    toggleMute,
    setFocusTask,
    toggleBrownNoise
  } = usePomodoro();

  // For PiP Logic triggering
  const togglePiP = async () => {
     if (!('documentPictureInPicture' in window)) {
        alert("PiP not supported in this browser.");
        return;
     }
     // We just trigger the FloatingTimer logic by making sure we navigate away or use a global handler.
     // Since FloatingTimer only shows when NOT on Pomodoro page, we can't easily trigger it *while* staying here 
     // unless we duplicate logic. For now, let's just alert user to navigate away for floating timer 
     // OR we can rely on the FloatingTimer component to handle it if we adjust logic.
     alert("Navigate to another tab (e.g. Dashboard) to activate the Floating Timer automatically!");
  };

  const modes: { id: TimerMode; label: string }[] = [
    { id: 'pomodoro', label: 'Pomodoro' },
    { id: 'shortBreak', label: 'Short Break' },
    { id: 'longBreak', label: 'Long Break' },
  ];

  // Circle animation calculation
  const progressDeg = (timeLeft / initialTime) * 360;

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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-4 gap-8">
      
      {/* 1. Main Timer Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 w-full max-w-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-colors duration-300">
        
        {/* Top Header Controls */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                <button 
                    onClick={toggleBrownNoise}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isPlayingNoise 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-2 ring-amber-500/20' 
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                >
                    <Waves size={14} className={isPlayingNoise ? 'animate-pulse' : ''} />
                    {isPlayingNoise ? 'Noise On' : 'Brown Noise'}
                </button>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={toggleMute}
                    className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>
        </div>

        {/* Focus Input Anchor */}
        <div className="mb-10 text-center relative group">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">I am currently focusing on</p>
            <div className="relative inline-block max-w-full">
                <input 
                    type="text" 
                    value={focusTask}
                    onChange={(e) => setFocusTask(e.target.value)}
                    placeholder="Click to set task..."
                    className="text-center text-xl md:text-2xl font-bold bg-transparent text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none border-b-2 border-transparent focus:border-pink-500 transition-all w-full min-w-[200px]"
                />
                <Pencil size={14} className="absolute -right-6 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>

        {/* Conic Gradient Timer Visual */}
        <div className="relative flex justify-center mb-10">
            {/* Outer Ring Container */}
            <div 
                className="relative w-72 h-72 rounded-full flex items-center justify-center shadow-inner bg-slate-50 dark:bg-slate-700/30 transition-all"
                style={{
                    background: `conic-gradient(#ec4899 ${progressDeg}deg, transparent 0deg)`
                }}
            >
                {/* Inner Circle (Hollow Effect) */}
                <div className="absolute w-[92%] h-[92%] bg-white dark:bg-slate-800 rounded-full flex flex-col items-center justify-center shadow-sm z-10 transition-colors">
                     <span className="text-7xl font-bold text-slate-800 dark:text-white font-mono tracking-tighter tabular-nums">
                        {formatTime(timeLeft)}
                     </span>
                     <span className="text-pink-500 font-bold uppercase tracking-widest text-sm mt-2">
                        {isActive ? 'Focusing' : 'Paused'}
                     </span>
                </div>
            </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center mb-8 gap-2">
            {modes.map((m) => (
                <button
                key={m.id}
                onClick={() => switchMode(m.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-wide ${
                    mode === m.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md transform scale-105'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                >
                {m.label}
                </button>
            ))}
             <button
                onClick={() => switchMode('custom')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-wide ${
                    mode === 'custom'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md transform scale-105'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                >
                Custom
            </button>
        </div>

        {/* Custom Input */}
        {mode === 'custom' && (
           <div className="flex justify-center items-center gap-2 mb-6 animate-fade-in">
             <label className="text-sm font-medium text-slate-500">Duration (mins):</label>
             <input 
               type="number" 
               min="1" 
               max="180" 
               value={customTime} 
               onChange={handleCustomChange}
               className="w-16 p-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-center font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
             />
           </div>
        )}

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-6">
            <button
                onClick={resetTimer}
                className="p-4 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-all hover:scale-105"
                title="Reset Timer"
            >
                <RotateCcw size={24} />
            </button>

            <button
                onClick={toggleTimer}
                className={`w-20 h-20 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isActive 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white' 
                    : 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-pink-500/30'
                }`}
            >
                {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
            </button>
        </div>

      </div>

      {/* 2. Video Player Placeholder */}
      <div 
        id="video-placeholder" 
        className="w-full max-w-xl aspect-video bg-slate-200 dark:bg-slate-800/50 rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700 relative group"
      >
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none group-hover:opacity-0 transition-opacity z-0">
               <span className="text-sm font-medium">Loading Playlist...</span>
           </div>
           {/* The GlobalYoutubePlayer will portal into here */}
      </div>

    </div>
  );
};

export default Pomodoro;
