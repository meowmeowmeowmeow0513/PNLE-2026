import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Waves, Pencil, Coffee, Zap, Brain, Settings } from 'lucide-react';
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

  // --- THEME ENGINE (Aligned Light & Dark Modes) ---
  const getTheme = () => {
    switch (mode) {
      case 'pomodoro':
        return {
          // Light Mode: Soft Rose Gradient | Dark Mode: Deep Navy/Pink
          bg: 'bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-slate-900 dark:via-navy-900 dark:to-pink-900',
          accent: 'text-pink-600 dark:text-pink-400',
          ring: 'stroke-pink-500',
          button: 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/30',
          icon: <Brain size={20} className="text-pink-500 dark:text-pink-400" />,
          text: 'text-slate-800 dark:text-white',
          inputBg: 'bg-white/80 dark:bg-white/10 border-pink-200 dark:border-white/20 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/50'
        };
      case 'shortBreak':
        return {
          bg: 'bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-teal-900 dark:via-emerald-900 dark:to-cyan-900',
          accent: 'text-teal-600 dark:text-teal-400',
          ring: 'stroke-teal-500',
          button: 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/30',
          icon: <Coffee size={20} className="text-teal-500 dark:text-teal-400" />,
          text: 'text-slate-800 dark:text-white',
          inputBg: 'bg-white/80 dark:bg-white/10 border-teal-200 dark:border-white/20 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/50'
        };
      case 'longBreak':
        return {
          bg: 'bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-900 dark:via-purple-900 dark:to-violet-900',
          accent: 'text-indigo-600 dark:text-indigo-400',
          ring: 'stroke-indigo-500',
          button: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30',
          icon: <Zap size={20} className="text-indigo-500 dark:text-indigo-400" />,
          text: 'text-slate-800 dark:text-white',
          inputBg: 'bg-white/80 dark:bg-white/10 border-indigo-200 dark:border-white/20 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/50'
        };
      case 'custom':
        return {
          bg: 'bg-gradient-to-br from-slate-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900',
          accent: 'text-slate-600 dark:text-slate-300',
          ring: 'stroke-slate-500 dark:stroke-slate-400',
          button: 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 shadow-slate-500/30',
          icon: <Settings size={20} className="text-slate-500 dark:text-slate-400" />,
          text: 'text-slate-800 dark:text-white',
          inputBg: 'bg-white/80 dark:bg-white/10 border-slate-200 dark:border-white/20 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/50'
        };
      default:
        return {
          bg: 'bg-slate-900',
          accent: 'text-white',
          ring: 'stroke-white',
          button: 'bg-slate-500',
          icon: <Brain size={20} />,
          text: 'text-white',
          inputBg: 'bg-white/10'
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
    <div className={`w-full min-h-[calc(100vh-140px)] rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-6 transition-all duration-700 ease-in-out ${theme.bg}`}>
      
      {/* Ambient Glows (Subtle for light mode) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute top-10 left-10 w-64 h-64 rounded-full blur-[100px] opacity-40 dark:opacity-20 bg-white mix-blend-overlay`}></div>
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT: TIMER & CONTROLS */}
        <div className="flex flex-col items-center">
            
            {/* Focus Input */}
            <div className="mb-8 w-full max-w-sm relative group">
                <input 
                    type="text"
                    value={focusTask}
                    onChange={(e) => setFocusTask(e.target.value)}
                    placeholder="What is your main focus?"
                    className={`w-full rounded-2xl py-4 px-12 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all backdrop-blur-md border ${theme.inputBg}`}
                />
                <Pencil className={`absolute left-4 top-1/2 -translate-y-1/2 opacity-50 ${theme.text}`} size={18} />
            </div>

            {/* SVG Timer Ring */}
            <div className="relative mb-10 group cursor-pointer" onClick={toggleTimer}>
                <svg width="300" height="300" className="transform -rotate-90">
                    {/* Background Ring */}
                    <circle 
                        cx="150" cy="150" r={radius} 
                        fill="transparent" 
                        stroke="currentColor"
                        className="opacity-10 dark:opacity-10 text-slate-500 dark:text-white"
                        strokeWidth="12" 
                    />
                    {/* Progress Ring */}
                    <circle 
                        cx="150" cy="150" r={radius} 
                        fill="transparent" 
                        className={`transition-all duration-1000 ease-linear ${theme.ring} drop-shadow-md`}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                    />
                </svg>
                
                {/* Timer Text */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center ${theme.text}`}>
                    <span className="text-7xl font-bold font-mono tracking-tighter drop-shadow-sm">
                        {formatTime(timeLeft)}
                    </span>
                    <div className="flex items-center gap-2 mt-2 uppercase tracking-widest text-sm font-bold opacity-60">
                        {theme.icon}
                        <span>{isActive ? 'Running' : 'Paused'}</span>
                    </div>
                </div>
            </div>

            {/* Custom Time Input (Only shows in Custom Mode) */}
            {mode === 'custom' && !isActive && (
               <div className="mb-8 flex items-center gap-3 bg-white/50 dark:bg-black/20 p-2 rounded-xl border border-slate-200 dark:border-white/10 animate-fade-in">
                  <span className={`text-sm font-bold ${theme.text}`}>Set Minutes:</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCustomTimeValue(Math.max(1, customTime - 5))}
                      className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >-</button>
                    <input 
                      type="number" 
                      value={customTime}
                      onChange={(e) => setCustomTimeValue(Number(e.target.value))}
                      className="w-16 text-center bg-transparent font-bold text-lg outline-none border-b-2 border-slate-300 dark:border-slate-600 focus:border-pink-500"
                    />
                    <button 
                      onClick={() => setCustomTimeValue(customTime + 5)}
                      className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >+</button>
                  </div>
               </div>
            )}

            {/* Main Action Buttons */}
            <div className="flex items-center gap-6">
                <button 
                    onClick={resetTimer}
                    className={`p-4 rounded-full backdrop-blur-sm transition-all active:scale-95 border hover:scale-105 ${theme.inputBg}`}
                    title="Reset Timer"
                >
                    <RotateCcw size={24} />
                </button>

                <button 
                    onClick={toggleTimer}
                    className={`h-24 w-24 rounded-[2.5rem] flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-2xl ${theme.button}`}
                >
                    {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1"/>}
                </button>

                <button 
                    onClick={toggleMute}
                    className={`p-4 rounded-full backdrop-blur-sm transition-all active:scale-95 border hover:scale-105 ${theme.inputBg}`}
                    title={isMuted ? "Unmute Alarm" : "Mute Alarm"}
                >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
            </div>

            {/* Mode Switcher Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-10 bg-white/60 dark:bg-black/30 p-2 rounded-2xl backdrop-blur-md border border-slate-200 dark:border-white/5 shadow-sm">
                {[
                  { id: 'pomodoro', label: 'Focus' },
                  { id: 'shortBreak', label: 'Short Break' },
                  { id: 'longBreak', label: 'Long Break' },
                  { id: 'custom', label: 'Custom' }
                ].map((m) => (
                   <button
                     key={m.id}
                     onClick={() => switchMode(m.id as TimerMode)}
                     className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        mode === m.id 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md transform scale-105' 
                        : 'text-slate-500 dark:text-white/60 hover:bg-white/50 dark:hover:bg-white/10'
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
                        ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-200 shadow-amber-500/20 shadow-lg' 
                        : `bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5`
                    }`}
                 >
                    <Waves size={18} className={isPlayingNoise ? 'animate-bounce' : ''} />
                    {isPlayingNoise ? 'Brown Noise Active' : 'Enable Brown Noise'}
                 </button>
            </div>

        </div>

        {/* RIGHT: VIDEO PLACEHOLDER */}
        <div className="h-full flex flex-col justify-center">
            {/* 
                We use an ID here. 
                The GlobalYoutubePlayer in App.tsx will Portal into this div 
                when we are on this page.
            */}
            <div 
                id="video-placeholder" 
                className="w-full aspect-video bg-slate-200 dark:bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/40 dark:border-white/10 shadow-2xl relative group"
            >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-white/30 pointer-events-none">
                    <div className="p-4 rounded-full bg-white/30 dark:bg-white/5 mb-4 group-hover:scale-110 transition-transform">
                        <Play size={32} fill="currentColor" />
                    </div>
                    <span className="font-medium tracking-wide">Study Playlist Loading...</span>
                </div>
            </div>

            <div className="mt-6 p-6 bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl text-slate-600 dark:text-white/80 backdrop-blur-sm shadow-sm">
                <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-500 dark:text-yellow-400" /> Pro Tip
                </h4>
                <p className="text-sm leading-relaxed opacity-90">
                   When you leave this tab, the video player will minimize to a floating widget so your music doesn't stop.
                </p>
            </div>
        </div>

      </div>

      {/* --- GLASSMORPHISM BREAK MODAL --- */}
      {showBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md animate-fade-in" />
            
            <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
                    <Coffee size={48} className="text-pink-500 dark:text-pink-400" />
                </div>
                
                <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Time's Up!</h2>
                <p className="text-slate-600 dark:text-white/80 text-lg mb-8 font-medium">
                    You crushed that session. Take a breath, you've earned a break.
                </p>

                <button 
                    onClick={() => {
                        stopAlarm();
                        setShowBreakModal(false);
                        switchMode(mode === 'pomodoro' ? 'shortBreak' : 'pomodoro');
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-xl transform hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-pink-500/30"
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
