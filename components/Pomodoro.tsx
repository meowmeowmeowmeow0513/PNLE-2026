
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Waves, Coffee, Zap, Brain, Settings, ListTodo, ExternalLink, Maximize2 } from 'lucide-react';
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
  const [isDark, setIsDark] = useState(false);

  // Detect theme changes for specific rendering logic
  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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

  // --- THEME ENGINE ---
  const getTheme = () => {
    if (isDark) {
        // DARK MODE: Deep Space Neon
        switch (mode) {
            case 'pomodoro': return { 
                ringColor: '#ec4899', // Pink-500
                ringGlow: 'drop-shadow(0 0 16px rgba(236, 72, 153, 0.4))',
                trackColor: 'rgba(255,255,255,0.05)',
                textColor: 'text-white',
                badgeBg: 'bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-[0_0_15px_-5px_rgba(236,72,153,0.3)]',
                icon: <Brain size={18} /> 
            };
            case 'shortBreak': return { 
                ringColor: '#10b981', // Emerald-500
                ringGlow: 'drop-shadow(0 0 16px rgba(16, 185, 129, 0.4))',
                trackColor: 'rgba(255,255,255,0.05)',
                textColor: 'text-white',
                badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]',
                icon: <Coffee size={18} /> 
            };
            case 'longBreak': return { 
                ringColor: '#8b5cf6', // Violet-500
                ringGlow: 'drop-shadow(0 0 16px rgba(139, 92, 246, 0.4))',
                trackColor: 'rgba(255,255,255,0.05)',
                textColor: 'text-white',
                badgeBg: 'bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_15px_-5px_rgba(139,92,246,0.3)]',
                icon: <Zap size={18} /> 
            };
            default: return { 
                ringColor: '#3b82f6', 
                ringGlow: 'none', 
                trackColor: 'rgba(255,255,255,0.05)',
                textColor: 'text-white',
                badgeBg: 'bg-blue-500/10 text-blue-400',
                icon: <Settings size={18} /> 
            };
        }
    } else {
        // LIGHT MODE: Clean Paper
        switch (mode) {
            case 'pomodoro': return { 
                ringColor: '#db2777', 
                ringGlow: 'none',
                trackColor: '#e2e8f0',
                textColor: 'text-slate-800',
                badgeBg: 'bg-pink-50 text-pink-600 border border-pink-100',
                icon: <Brain size={18} /> 
            };
            case 'shortBreak': return { 
                ringColor: '#059669',
                ringGlow: 'none',
                trackColor: '#e2e8f0',
                textColor: 'text-slate-800',
                badgeBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
                icon: <Coffee size={18} /> 
            };
            case 'longBreak': return { 
                ringColor: '#7c3aed',
                ringGlow: 'none',
                trackColor: '#e2e8f0',
                textColor: 'text-slate-800',
                badgeBg: 'bg-violet-50 text-violet-600 border border-violet-100',
                icon: <Zap size={18} /> 
            };
            default: return { 
                ringColor: '#64748b', 
                ringGlow: 'none', 
                trackColor: '#e2e8f0',
                textColor: 'text-slate-800',
                badgeBg: 'bg-slate-100 text-slate-600',
                icon: <Settings size={18} /> 
            };
        }
    }
  };

  const theme = getTheme();

  // --- POP OUT LOGIC (Updated for reliability) ---
  const handlePopOut = async () => {
    if (pipWindow) {
      pipWindow.close();
      return;
    }

    if (!('documentPictureInPicture' in window)) {
      alert("Browser not supported. Please use Chrome or Edge.");
      return;
    }

    try {
      const dpip = (window as any).documentPictureInPicture;
      const win = await dpip.requestWindow({ width: 340, height: 420 });

      // CRITICAL: Copy all styles to ensure the pop-up looks exactly like the app
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
             const link = win.document.createElement('link');
             link.rel = 'stylesheet';
             link.href = styleSheet.href;
             win.document.head.appendChild(link);
          } else {
             const cssRules = [...styleSheet.cssRules].map((rule: any) => rule.cssText).join('');
             const style = win.document.createElement('style');
             style.textContent = cssRules;
             win.document.head.appendChild(style);
          }
        } catch (e) {
          console.warn("Could not copy stylesheet", e);
        }
      });
      
      // Force PiP body class to match current theme
      win.document.body.className = isDark ? 'dark bg-[#0B1120]' : 'bg-white';

      win.addEventListener('pagehide', () => setPipWindow(null));
      setPipWindow(win);
    } catch (err) {
      console.error("Failed to open PiP window:", err);
    }
  };

  // --- SVG CALCULATIONS ---
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / initialTime;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
      
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* --- LEFT COLUMN: TIMER --- */}
        <div className="flex flex-col items-center justify-center relative animate-fade-in">
            
            {/* Pop Out Button */}
            {!pipWindow && (
                <button 
                    onClick={handlePopOut}
                    className="absolute top-0 right-4 p-2.5 text-slate-400 hover:text-pink-500 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-transparent hover:border-pink-200 dark:hover:border-pink-900 transition-all z-20 group"
                    title="Pop Out Timer"
                >
                    <Maximize2 size={20} className="group-hover:scale-110 transition-transform"/>
                </button>
            )}

            {/* Focus Task Input (Ghost Style) */}
            <div className="mb-10 w-full max-w-sm relative z-10 group">
                <input 
                    type="text"
                    value={focusTask}
                    onChange={(e) => setFocusTask(e.target.value)}
                    placeholder="What is your main focus?"
                    className="w-full bg-transparent border-b-2 py-3 text-center text-xl font-medium transition-all focus:outline-none placeholder-slate-400/50 dark:placeholder-slate-600 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white focus:border-pink-500 dark:focus:border-pink-500"
                />
                <button 
                  onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-pink-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ListTodo size={20} />
                </button>
                
                {/* Task Dropdown */}
                {showTaskDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0f172a] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-30 animate-in fade-in zoom-in-95">
                     <div className="max-h-56 overflow-y-auto custom-scrollbar">
                        {todaysTasks.length === 0 ? (
                           <div className="p-4 text-center text-sm text-slate-500">No pending tasks for today.</div>
                        ) : (
                           todaysTasks.map(task => (
                              <button
                                key={task.id}
                                onClick={() => { setFocusTask(task.title); setShowTaskDropdown(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 last:border-0"
                              >
                                 <span className="font-semibold block truncate">{task.title}</span>
                                 <span className="text-[10px] uppercase text-slate-400">{task.category}</span>
                              </button>
                           ))
                        )}
                     </div>
                  </div>
                )}
            </div>

            {/* TIMER DISPLAY */}
            {pipWindow ? (
                <div className="w-[300px] h-[300px] rounded-full bg-slate-50 dark:bg-[#0f172a] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <ExternalLink size={48} className="mb-4 opacity-50" />
                    <span className="text-sm font-bold uppercase tracking-widest">Active in Pop-up</span>
                    <button onClick={handlePopOut} className="mt-4 px-5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        Bring Back
                    </button>
                </div>
            ) : (
                <div className="relative mb-10 group cursor-pointer" onClick={toggleTimer}>
                    {/* Glow Backing */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500/5 to-purple-500/5 blur-3xl opacity-50 pointer-events-none"></div>

                    <svg width="340" height="340" className="transform -rotate-90 relative z-10">
                        {/* Track */}
                        <circle 
                            cx="170" cy="170" r={radius} 
                            fill="transparent" 
                            stroke={theme.trackColor}
                            strokeWidth="4" 
                        />
                        {/* Progress */}
                        <circle 
                            cx="170" cy="170" r={radius} 
                            fill="transparent" 
                            stroke={theme.ringColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            style={{ 
                                filter: theme.ringGlow, 
                                transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s ease' 
                            }}
                        />
                    </svg>
                    
                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                        <span className={`text-7xl lg:text-8xl font-mono font-bold tracking-tighter tabular-nums ${theme.textColor} drop-shadow-sm`}>
                            {formatTime(timeLeft)}
                        </span>
                        <div className={`flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${theme.badgeBg}`}>
                            {theme.icon}
                            <span>{isActive ? 'Running' : 'Paused'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Time Slider */}
            {mode === 'custom' && !isActive && !pipWindow && (
               <div className="w-full max-w-[240px] mb-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                     <span>1m</span>
                     <span className="text-slate-600 dark:text-slate-200">{customTime} min</span>
                     <span>180m</span>
                  </div>
                  <input 
                    type="range" min="1" max="180" 
                    value={customTime} 
                    onChange={(e) => setCustomTimeValue(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
               </div>
            )}

            {/* Main Controls */}
            <div className="flex items-center gap-6 z-10">
                <button 
                    onClick={resetTimer}
                    className="p-4 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
                >
                    <RotateCcw size={20} />
                </button>

                <button 
                    onClick={toggleTimer}
                    className={`p-7 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 text-white flex items-center justify-center relative overflow-hidden ${
                        isActive ? 'bg-amber-500 shadow-amber-500/30' : 'bg-pink-600 shadow-pink-600/30'
                    }`}
                >
                    <div className="absolute inset-0 bg-white/20 blur-md opacity-0 hover:opacity-100 transition-opacity"></div>
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1"/>}
                </button>

                <button 
                    onClick={toggleMute}
                    className="p-4 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
                {[
                  { id: 'pomodoro', label: 'Focus' },
                  { id: 'shortBreak', label: 'Short Break' },
                  { id: 'longBreak', label: 'Long Break' },
                  { id: 'custom', label: 'Custom' }
                ].map((m) => (
                   <button
                     key={m.id}
                     onClick={() => switchMode(m.id as TimerMode)}
                     className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        mode === m.id 
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 shadow-sm scale-105' 
                        : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                     }`}
                   >
                     {m.label}
                   </button>
                ))}
            </div>

            {/* Brown Noise */}
             <button 
                onClick={toggleBrownNoise}
                className={`mt-6 text-xs font-bold flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    isPlayingNoise 
                    ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
                <Waves size={14} className={isPlayingNoise ? 'animate-bounce' : ''} />
                {isPlayingNoise ? 'Brown Noise Active' : 'Enable Brown Noise'}
            </button>
        </div>

        {/* --- RIGHT COLUMN: VIDEO PLAYER ANCHOR --- */}
        <div className="flex flex-col h-full justify-center relative">
             <div className="relative group w-full aspect-video">
                 {/* Placeholder / Backdrop */}
                 <div 
                    id="video-anchor" 
                    className="w-full h-full bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center"
                 >
                    <span className="text-slate-400 dark:text-slate-600 text-sm font-medium animate-pulse">
                        Loading Player Overlay...
                    </span>
                 </div>
             </div>

             <div className="mt-8 bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm backdrop-blur-sm">
                 <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} className="text-yellow-500 fill-current" />
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Pro Tip</h3>
                 </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    <strong>Uninterrupted Audio:</strong> The video player floats on top of the app. When you switch tabs (e.g., to Planner), it minimizes to the corner so your music keeps playing.
                    <br/><br/>
                    <strong>Pop Out:</strong> Click the maximize button on the timer to float the timer over other apps (like PDF readers).
                 </p>
             </div>
        </div>

      </div>

      {/* --- BREAK MODAL (High-End Notification Style) --- */}
      {showBreakModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" />
            <div className="relative bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-in zoom-in duration-300 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
                
                <div className="w-20 h-20 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Coffee size={32} className="text-pink-600 dark:text-pink-400 animate-bounce" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Time's Up!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Good job! Take a moment to reset your mind.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => {
                            stopAlarm();
                            setShowBreakModal(false);
                            switchMode(mode === 'pomodoro' ? 'shortBreak' : 'pomodoro');
                        }}
                        className="w-full py-3.5 rounded-xl bg-pink-600 text-white font-bold shadow-lg shadow-pink-500/25 hover:scale-[1.02] transition-transform"
                    >
                        {mode === 'pomodoro' ? 'Start Break' : 'Start Focus'}
                    </button>
                    <button 
                        onClick={() => {
                            stopAlarm();
                            setShowBreakModal(false);
                        }}
                        className="text-slate-400 text-xs py-2 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Pomodoro;
