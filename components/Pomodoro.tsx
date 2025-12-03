import React, { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Waves, Pencil, Coffee, Zap, Brain } from 'lucide-react';
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
    toggleBrownNoise,
    showBreakModal,
    setShowBreakModal,
    stopAlarm
  } = usePomodoro();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- THEME ENGINE ---
  const getTheme = () => {
    switch (mode) {
      case 'pomodoro':
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-navy-900 to-pink-900',
          accent: 'text-pink-400',
          ring: 'stroke-pink-500',
          button: 'bg-pink-500 hover:bg-pink-600',
          icon: <Brain size={20} />
        };
      case 'shortBreak':
        return {
          bg: 'bg-gradient-to-br from-teal-900 via-emerald-900 to-cyan-900',
          accent: 'text-teal-400',
          ring: 'stroke-teal-400',
          button: 'bg-teal-500 hover:bg-teal-600',
          icon: <Coffee size={20} />
        };
      case 'longBreak':
        return {
          bg: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900',
          accent: 'text-indigo-400',
          ring: 'stroke-indigo-400',
          button: 'bg-indigo-500 hover:bg-indigo-600',
          icon: <Zap size={20} />
        };
      default:
        return {
          bg: 'bg-slate-900',
          accent: 'text-white',
          ring: 'stroke-white',
          button: 'bg-slate-500',
          icon: <Brain size={20} />
        };
    }
  };

  const theme = getTheme();

  // --- CIRCULAR PROGRESS LOGIC ---
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / initialTime;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className={`w-full min-h-[calc(100vh-140px)] rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-6 transition-colors duration-1000 ease-in-out ${theme.bg}`}>
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute top-10 left-10 w-64 h-64 rounded-full blur-[100px] opacity-20 bg-white mix-blend-overlay`}></div>
        <div className={`absolute bottom-10 right-10 w-96 h-96 rounded-full blur-[120px] opacity-20 bg-black mix-blend-multiply`}></div>
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT: TIMER & CONTROLS */}
        <div className="flex flex-col items-center">
            
            {/* Focus Input */}
            <div className="mb-8 w-full max-w-sm relative group">
                <input 
                    type="text"
                    value={focusTask}
                    onChange={(e) => setFocusTask(e.target.value)}
                    placeholder="What is your main focus?"
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-4 px-12 text-center text-white placeholder-white/50 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />
                <Pencil className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
            </div>

            {/* SVG Timer Ring */}
            <div className="relative mb-10 group cursor-pointer" onClick={toggleTimer}>
                <svg width="300" height="300" className="transform -rotate-90">
                    {/* Background Ring */}
                    <circle 
                        cx="150" cy="150" r={radius} 
                        fill="transparent" 
                        stroke="rgba(255,255,255,0.1)" 
                        strokeWidth="12" 
                    />
                    {/* Progress Ring */}
                    <circle 
                        cx="150" cy="150" r={radius} 
                        fill="transparent" 
                        className={`transition-all duration-1000 ease-linear ${theme.ring} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                    />
                </svg>
                
                {/* Timer Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-7xl font-bold font-mono tracking-tighter drop-shadow-lg">
                        {formatTime(timeLeft)}
                    </span>
                    <div className="flex items-center gap-2 mt-2 opacity-80 uppercase tracking-widest text-sm font-semibold">
                        {theme.icon}
                        <span>{isActive ? 'Running' : 'Paused'}</span>
                    </div>
                </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-6">
                <button 
                    onClick={resetTimer}
                    className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all active:scale-95 border border-white/10"
                >
                    <RotateCcw size={24} />
                </button>

                <button 
                    onClick={toggleTimer}
                    className={`h-20 w-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all hover:scale-105 active:scale-95 ${theme.button} shadow-lg`}
                >
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1"/>}
                </button>

                <button 
                    onClick={toggleMute}
                    className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all active:scale-95 border border-white/10"
                >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
            </div>

            {/* Mode Switcher Pills */}
            <div className="flex gap-3 mt-10 bg-black/20 p-2 rounded-2xl backdrop-blur-sm border border-white/5">
                {[
                  { id: 'pomodoro', label: 'Focus' },
                  { id: 'shortBreak', label: 'Short Break' },
                  { id: 'longBreak', label: 'Long Break' }
                ].map((m) => (
                   <button
                     key={m.id}
                     onClick={() => switchMode(m.id as TimerMode)}
                     className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        mode === m.id 
                        ? 'bg-white text-slate-900 shadow-md' 
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                     }`}
                   >
                     {m.label}
                   </button>
                ))}
            </div>
            
            <div className="mt-6">
                 <button 
                    onClick={toggleBrownNoise}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border ${
                        isPlayingNoise 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200' 
                        : 'bg-transparent border-white/10 text-white/60 hover:bg-white/5'
                    }`}
                 >
                    <Waves size={18} className={isPlayingNoise ? 'animate-bounce' : ''} />
                    {isPlayingNoise ? 'Brown Noise Active' : 'Enable Brown Noise'}
                 </button>
            </div>

        </div>

        {/* RIGHT: VIDEO PLACEHOLDER */}
        <div className="h-full flex flex-col justify-center">
            <div 
                id="video-placeholder" 
                className="w-full aspect-video bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group"
            >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 pointer-events-none">
                    <div className="p-4 rounded-full bg-white/5 mb-4 group-hover:scale-110 transition-transform">
                        <Play size={32} fill="currentColor" />
                    </div>
                    <span className="font-medium tracking-wide">YouTube Player Loading...</span>
                </div>
                {/* GlobalYoutubePlayer portals here */}
            </div>
            <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl text-white/80 backdrop-blur-sm">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400" /> Pro Tip
                </h4>
                <p className="text-sm leading-relaxed opacity-80">
                   When the timer ends, an alarm will sound. Click the button in the popup to stop it and start your break. Keep this tab open for background audio.
                </p>
            </div>
        </div>

      </div>

      {/* --- GLASSMORPHISM BREAK MODAL --- */}
      {showBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" />
            
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                    <Coffee size={40} className="text-white" />
                </div>
                
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Time's Up!</h2>
                <p className="text-white/80 text-lg mb-8 font-medium">
                    You crushed that session. Take a breath, you've earned a break.
                </p>

                <button 
                    onClick={() => {
                        stopAlarm();
                        setShowBreakModal(false);
                        switchMode(mode === 'pomodoro' ? 'shortBreak' : 'pomodoro');
                    }}
                    className="w-full py-4 rounded-xl bg-white text-slate-900 font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                >
                    Stop Alarm & {mode === 'pomodoro' ? 'Start Break' : 'Start Focus'}
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default Pomodoro;
