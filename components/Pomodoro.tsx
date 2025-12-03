
import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Waves, Pencil, Coffee, Zap, Brain, Settings, ListTodo, ExternalLink } from 'lucide-react';
import { usePomodoro, TimerMode } from './PomodoroContext';
import { useTasks } from '../TaskContext';
import { isSameDay } from 'date-fns';

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
    pipWindow,
    toggleTimer, 
    resetTimer, 
    switchMode, 
    setCustomTimeValue,
    toggleMute,
    setFocusTask,
    toggleBrownNoise,
    showBreakModal,
    setShowBreakModal,
    stopAlarm,
    setPipWindow
  } = usePomodoro();

  const { tasks } = useTasks();
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);

  // Get Today's Uncompleted Tasks
  const todaysTasks = tasks.filter(t => 
    !t.completed && 
    t.start && 
    isSameDay(new Date(t.start), new Date())
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- VISUAL THEMES ---
  // Distinct Logic: Light Mode (Clean/Paper) vs Dark Mode (Deep/Neon)
  const getTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    
    if (isDark) {
        // DARK MODE: High Contrast, Neon, Deep Blacks
        switch (mode) {
            case 'pomodoro': return { ring: 'text-pink-500', bg: 'text-pink-500/20', badge: 'bg-pink-500 text-white', icon: <Brain size={18} /> };
            case 'shortBreak': return { ring: 'text-emerald-400', bg: 'text-emerald-400/20', badge: 'bg-emerald-500 text-white', icon: <Coffee size={18} /> };
            case 'longBreak': return { ring: 'text-violet-500', bg: 'text-violet-500/20', badge: 'bg-violet-500 text-white', icon: <Zap size={18} /> };
            default: return { ring: 'text-blue-500', bg: 'text-blue-500/20', badge: 'bg-blue-500 text-white', icon: <Settings size={18} /> };
        }
    } else {
        // LIGHT MODE: Soft, Pastel, Clean Whites
        switch (mode) {
            case 'pomodoro': return { ring: 'text-slate-800', bg: 'text-slate-200', badge: 'bg-slate-800 text-white', icon: <Brain size={18} /> };
            case 'shortBreak': return { ring: 'text-teal-600', bg: 'text-teal-100', badge: 'bg-teal-100 text-teal-800', icon: <Coffee size={18} /> };
            case 'longBreak': return { ring: 'text-indigo-600', bg: 'text-indigo-100', badge: 'bg-indigo-100 text-indigo-800', icon: <Zap size={18} /> };
            default: return { ring: 'text-slate-600', bg: 'text-slate-200', badge: 'bg-slate-200 text-slate-800', icon: <Settings size={18} /> };
        }
    }
  };

  const theme = getTheme();

  // --- POP OUT LOGIC (Direct Trigger) ---
  const handlePopOut = async () => {
    if (pipWindow) {
      pipWindow.close();
      return;
    }

    if (!('documentPictureInPicture' in window)) {
      alert("Your browser doesn't support the 'Keep on Top' window feature yet. Try Chrome or Edge!");
      return;
    }

    try {
      const dpip = (window as any).documentPictureInPicture;
      const win = await dpip.requestWindow({ width: 320, height: 380 });

      // Copy Styles
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          win.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          if (styleSheet.href) link.href = styleSheet.href;
          win.document.head.appendChild(link);
        }
      });
      
      // Force Dark Mode class on body if main app is dark
      if (document.documentElement.classList.contains('dark')) {
          win.document.body.classList.add('dark');
          win.document.body.style.backgroundColor = '#020617'; // slate-950
      } else {
          win.document.body.style.backgroundColor = '#ffffff';
      }

      win.addEventListener('pagehide', () => setPipWindow(null));
      setPipWindow(win);
    } catch (err) {
      console.error("Failed to open PiP window:", err);
    }
  };

  // --- SVG CALCULATIONS ---
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / initialTime;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* --- TIMER SECTION --- */}
        <div className="flex flex-col items-center justify-center relative">
            
            {/* Pop Out Button (Absolute Positioned for easy access) */}
            <button 
                onClick={handlePopOut}
                className="absolute top-0 right-0 md:right-10 p-2 text-slate-400 hover:text-pink-500 transition-colors z-20"
                title={pipWindow ? "Close Pop-up" : "Pop Out Timer (Keep on Top)"}
            >
                <ExternalLink size={24} className={pipWindow ? "text-pink-500" : ""} />
            </button>

            {/* Task Input */}
            <div className="mb-8 w-full max-w-sm relative z-10">
                <input 
                    type="text"
                    value={focusTask}
                    onChange={(e) => setFocusTask(e.target.value)}
                    placeholder="Enter main focus..."
                    className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-800 py-2 text-center text-xl font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-colors"
                />
                <button 
                  onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <ListTodo size={20} />
                </button>
                
                {showTaskDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-30 animate-in fade-in zoom-in-95">
                     <div className="max-h-48 overflow-y-auto">
                        {todaysTasks.length === 0 ? (
                           <div className="p-3 text-center text-xs text-slate-500">No tasks for today.</div>
                        ) : (
                           todaysTasks.map(task => (
                              <button
                                key={task.id}
                                onClick={() => { setFocusTask(task.title); setShowTaskDropdown(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 last:border-0"
                              >
                                 {task.title}
                              </button>
                           ))
                        )}
                     </div>
                  </div>
                )}
            </div>

            {/* MAIN TIMER SVG */}
            {pipWindow ? (
                <div className="w-[300px] h-[300px] rounded-full bg-slate-100 dark:bg-slate-900 border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                    <ExternalLink size={48} className="mb-4 opacity-50" />
                    <span className="text-sm font-bold uppercase tracking-widest">Active in Pop-up</span>
                    <button onClick={handlePopOut} className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs font-bold hover:bg-pink-500 hover:text-white transition-colors">
                        Bring Back
                    </button>
                </div>
            ) : (
                <div className="relative mb-10 group cursor-pointer" onClick={toggleTimer}>
                    <svg width="320" height="320" className="transform -rotate-90">
                        {/* Track */}
                        <circle 
                            cx="160" cy="160" r={radius} 
                            fill="transparent" 
                            className={`${theme.bg} stroke-current`}
                            strokeWidth="8" 
                        />
                        {/* Indicator */}
                        <circle 
                            cx="160" cy="160" r={radius} 
                            fill="transparent" 
                            className={`${theme.ring} stroke-current transition-all duration-1000 ease-linear`}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                        />
                    </svg>
                    
                    {/* Time Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-7xl font-mono font-bold tracking-tighter text-slate-900 dark:text-white tabular-nums">
                            {formatTime(timeLeft)}
                        </span>
                        <div className={`flex items-center gap-2 mt-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${theme.badge}`}>
                            {theme.icon}
                            <span>{isActive ? 'Running' : 'Paused'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Time Slider */}
            {mode === 'custom' && !isActive && !pipWindow && (
               <div className="w-full max-w-xs mb-8 flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-400">DURATION</span>
                  <input 
                    type="range" min="1" max="180" 
                    value={customTime} 
                    onChange={(e) => setCustomTimeValue(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-white w-12 text-right">{customTime} m</span>
               </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-6">
                <button 
                    onClick={resetTimer}
                    className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                    <RotateCcw size={20} />
                </button>

                <button 
                    onClick={toggleTimer}
                    className="w-20 h-20 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1"/>}
                </button>

                <button 
                    onClick={toggleMute}
                    className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* Modes */}
            <div className="flex flex-wrap justify-center gap-3 mt-10">
                {[
                  { id: 'pomodoro', label: 'Focus' },
                  { id: 'shortBreak', label: 'Short Break' },
                  { id: 'longBreak', label: 'Long Break' },
                  { id: 'custom', label: 'Custom' }
                ].map((m) => (
                   <button
                     key={m.id}
                     onClick={() => switchMode(m.id as TimerMode)}
                     className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                        mode === m.id 
                        ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' 
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                     }`}
                   >
                     {m.label}
                   </button>
                ))}
            </div>

             <button 
                onClick={toggleBrownNoise}
                className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isPlayingNoise 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
                <Waves size={14} className={isPlayingNoise ? 'animate-bounce' : ''} />
                {isPlayingNoise ? 'Brown Noise Active' : 'Enable Brown Noise'}
            </button>
        </div>

        {/* --- VIDEO SECTION --- */}
        <div className="flex flex-col h-full justify-center">
             {/* 
                Anchor for the Video Player 
                The GlobalYoutubePlayer will Portal into this div when on this page.
             */}
             <div 
                id="video-anchor" 
                className="w-full aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800"
             >
                {/* Fallback / Loading State */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-slate-600 text-sm font-bold">Loading Player...</span>
                </div>
             </div>

             <div className="mt-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                 <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} className="text-yellow-500 fill-yellow-500" />
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Study Mode Active</h3>
                 </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    The music player is anchored here. If you navigate to Dashboard or Planner, it will shrink to a mini-player. 
                    <br/><br/>
                    <strong>New:</strong> Click the <ExternalLink size={10} className="inline mx-1"/> icon above the timer to pop it out into a separate window while keeping the music playing!
                 </p>
             </div>
        </div>

      </div>

      {/* --- BREAK MODAL --- */}
      {showBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" />
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Coffee size={32} className="text-pink-600 dark:text-pink-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Time's Up!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-base mb-8">
                    Great focus session. Take a breather.
                </p>
                <button 
                    onClick={() => {
                        stopAlarm();
                        setShowBreakModal(false);
                        switchMode(mode === 'pomodoro' ? 'shortBreak' : 'pomodoro');
                    }}
                    className="w-full py-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg shadow-lg transition-all"
                >
                    {mode === 'pomodoro' ? 'Start Break' : 'Back to Focus'}
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default Pomodoro;
