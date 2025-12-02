
import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Waves, Target, CheckCircle2 } from 'lucide-react';
import { usePomodoro, TimerMode } from './PomodoroContext';
import confetti from 'canvas-confetti';

const Pomodoro: React.FC = () => {
  const { 
    mode, 
    timeLeft, 
    initialTime, 
    isActive, 
    customTime, 
    isMuted,
    focusTask,
    setFocusTask,
    isPlayingNoise,
    toggleBrownNoise,
    toggleTimer, 
    resetTimer, 
    switchMode, 
    setCustomTimeValue,
    toggleMute
  } = usePomodoro();

  // Trigger Confetti on Finish
  useEffect(() => {
    if (timeLeft === 0 && !isActive) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [timeLeft, isActive]);

  const modes: { id: TimerMode; label: string }[] = [
    { id: 'pomodoro', label: 'Pomodoro' },
    { id: 'shortBreak', label: 'Short Break' },
    { id: 'longBreak', label: 'Long Break' },
    { id: 'custom', label: 'Custom' },
  ];

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

  // Visual Timer Logic (Pie Chart)
  const progressPercentage = (timeLeft / initialTime) * 100;
  // Color logic: Starts Pink, turns Orange at 50%, Red at 20%
  const getTimerColor = () => {
      if (mode !== 'pomodoro') return '#10b981'; // Green for breaks
      if (progressPercentage > 50) return '#ec4899'; // Pink
      if (progressPercentage > 20) return '#f97316'; // Orange
      return '#ef4444'; // Red
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-8 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 w-full max-w-lg border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-colors duration-300">
        
        {/* Header & Controls */}
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Focus Timer</h2>
            
            <div className="flex gap-2">
                {/* Brown Noise Toggle */}
                <button
                    onClick={toggleBrownNoise}
                    className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${
                        isPlayingNoise 
                        ? 'bg-amber-900/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ring-2 ring-amber-500/50' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                    title="Brown Noise (Deep Focus)"
                >
                    <Waves size={20} className={isPlayingNoise ? "animate-pulse" : ""} />
                </button>

                {/* System Mute */}
                <button 
                    onClick={toggleMute}
                    className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>
        </div>

        {/* Focus Anchor (ADHD Friendly) */}
        <div className={`mb-8 transition-all duration-500 ${isActive ? 'scale-105' : 'scale-100'}`}>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 ml-1">
                <Target size={14} />
                Focus Anchor
            </label>
            <div className={`relative group ${isActive ? 'opacity-100' : 'opacity-100'}`}>
                <input 
                    type="text" 
                    value={focusTask}
                    onChange={(e) => setFocusTask(e.target.value)}
                    disabled={isActive}
                    placeholder="I am focusing on..."
                    className={`w-full p-4 text-lg font-bold rounded-2xl border-2 outline-none transition-all placeholder:font-normal placeholder:text-slate-300 dark:placeholder:text-slate-600 
                    ${isActive 
                        ? 'bg-pink-50 dark:bg-pink-900/10 border-pink-500 text-pink-600 dark:text-pink-400 shadow-lg shadow-pink-500/10' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:border-pink-300'
                    }`}
                />
                {isActive && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-500 animate-pulse">
                        <CheckCircle2 size={24} />
                    </div>
                )}
            </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center mb-8 gap-2 flex-wrap">
          {modes.filter(m => m.id !== 'custom').map((m) => (
            <button
              key={m.id}
              onClick={() => switchMode(m.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                mode === m.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg transform scale-105'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {m.label}
            </button>
          ))}
          <button
              onClick={() => switchMode('custom')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                mode === 'custom'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg transform scale-105'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Custom
          </button>
        </div>

        {mode === 'custom' && (
           <div className="flex justify-center items-center gap-2 mb-6 animate-fade-in">
             <label className="text-sm font-bold text-slate-500">Minutes:</label>
             <input 
               type="number" 
               min="1" 
               max="180" 
               value={customTime} 
               onChange={handleCustomChange}
               className="w-20 p-2 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-center font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-pink-500 outline-none"
             />
           </div>
        )}

        {/* --- TIME TIMER VISUAL (Solid Pie Chart) --- */}
        <div className="relative w-72 h-72 mx-auto mb-10 flex items-center justify-center">
          {/* Outer Ring / Background */}
          <div className="absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-slate-200 dark:border-slate-600"></div>
          
          {/* Conic Gradient (The Time Pie) */}
          <div 
            className="absolute inset-2 rounded-full transition-all duration-1000 ease-linear"
            style={{
                background: `conic-gradient(${getTimerColor()} ${progressPercentage}%, transparent 0)`
            }}
          ></div>

          {/* Inner Circle (Hollow center for text) */}
          <div className="absolute inset-6 rounded-full bg-white dark:bg-slate-800 shadow-inner flex flex-col items-center justify-center z-10">
            <span className="text-6xl font-black text-slate-800 dark:text-white font-mono tracking-tighter tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span className={`font-bold uppercase tracking-widest text-xs mt-2 px-3 py-1 rounded-full ${isActive ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'}`}>
              {isActive ? 'Focusing' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-10">
          <button
            onClick={resetTimer}
            className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw size={24} />
          </button>

          <button
            onClick={toggleTimer}
            className={`p-6 rounded-2xl shadow-xl transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${
              isActive 
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-700' 
                : 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-pink-500/30'
            }`}
          >
            {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
          </button>
        </div>

        {/* YouTube Embed */}
        <div className="w-full">
          <iframe 
            width="100%" 
            height="200" 
            src="https://www.youtube.com/embed/videoseries?list=PLxoZGx3mVZsxJgQlgxSOBn6zCONGfl6Tm" 
            title="Study Playlist" 
            frameBorder="0" 
            style={{ borderRadius: '16px' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
