
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
        // DARK MODE: Cyberpunk / Neon / Deep Space
        switch (mode) {
            case 'pomodoro': return { 
                ringColor: '#ec4899', // Pink
                ringGlow: 'drop-shadow(0 0 15px rgba(236, 72, 153, 0.6))',
                pathColor: 'rgba(255,255,255,0.1)',
                text: 'text-white',
                badge: 'bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]',
                icon: <Brain size={18} /> 
            };
            case 'shortBreak': return { 
                ringColor: '#10b981', // Emerald
                ringGlow: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.6))',
                pathColor: 'rgba(255,255,255,0.1)',
                text: 'text-white',
                badge: 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]',
                icon: <Coffee size={18} /> 
            };
            case 'longBreak': return { 
                ringColor: '#8b5cf6', // Violet
                ringGlow: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.6))',
                pathColor: 'rgba(255,255,255,0.1)',
                text: 'text-white',
                badge: 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]',
                icon: <Zap size={18} /> 
            };
            default: return { 
                ringColor: '#3b82f6', 
                ringGlow: 'none', 
                pathColor: 'rgba(255,255,255,0.1)',
                text: 'text-white',
                badge: 'bg-blue-600 text-white',
                icon: <Settings size={18} /> 
            };
        }
    } else {
        // LIGHT MODE: Clean / Paper / Minimalist
        switch (mode) {
            case 'pomodoro': return { 
                ringColor: '#db2777', // Pink 600
                ringGlow: 'none',
                pathColor: '#fce7f3', // Pink 100
                text: 'text-slate-800',
                badge: 'bg-pink-100 text-pink-700 border border-pink-200',
                icon: <Brain size={18} /> 
            };
            case 'shortBreak': return { 
                ringColor: '#059669', // Emerald 600
                ringGlow: 'none',
                pathColor: '#d1fae5', // Emerald 100
                text: 'text-slate-800',
                badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
                icon: <Coffee size={18} /> 
            };
            case 'longBreak': return { 
                ringColor: '#7c3aed', // Violet 600
                ringGlow: 'none',
                pathColor: '#ede9fe', // Violet 100
                text: 'text-slate-800',
                badge: 'bg-violet-100 text-violet-700 border border-violet-200',
                icon: <Zap size={18} /> 
            };
            default: return { 
                ringColor: '#475569', 
                ringGlow: 'none', 
                pathColor: '#f1f5f9',
                text: 'text-slate-800',
                badge: 'bg-slate-100 text-slate-700 border border-slate-200',
                icon: <Settings size={18} /> 
            };
        }
    }
  };

  const theme = getTheme();

  // --- POP OUT LOGIC ---
  const handlePopOut = async () => {
    if (pipWindow) {
      pipWindow.close(); // Close existing
      return;
    }

    if (!('documentPictureInPicture' in window)) {
      alert("Your browser doesn't support the 'Keep on Top' window feature yet. Try Chrome or Edge!");
      return;
    }

    try {
      const dpip = (window as any).documentPictureInPicture;
      // Request a small vertical window for the timer
      const win = await dpip.requestWindow({ width: 300, height: 450 });

      // Copy Styles for consistency
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
      
      // Match Theme Body Background
      if (document.documentElement.classList.contains('dark')) {
          win.document.body.classList.add('dark');
          win.document.body.style.backgroundColor = '#020617'; // Slate 950
      } else {
          win.document.body.style.backgroundColor = '#ffffff';
      }

      // Handle closing
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
      
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* --- LEFT COLUMN: TIMER --- */}
        <div className="flex flex-col items-center justify-center relative animate-fade-in">
            
            {/* Pop Out Trigger */}
            {!pipWindow && (
                <button 
                    onClick={handlePopOut}
                    className="absolute top-0 right-0 p-3 text-slate-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-500/10 rounded-xl transition-all group z-20"
                    title="Pop Out Timer (Keep on Top)"
                >
                    <Maximize2 size={20} className="group-hover:scale-110 transition-transform" />
                </button>
            )}

            {/* Task Input */}
            <div className="mb-10 w-full max-w-sm relative z-10 group">
                <input 
                    type="text"
                    value={focusTask}
                    onChange={(e) => setFocusTask(e.target.value)}
                    placeholder="What are you focusing on?"
                    className={`w-full bg-transparent border-b-2 py-3 text-center text-xl font-medium transition-all focus:outline-none placeholder-slate-400 dark:placeholder-slate-600
                        ${isDark 
                            ? 'border-slate-800 text-white focus:border-pink-500' 
                            : 'border-slate-200 text-slate-800 focus:border-pink-500'}`}
                />
                <button 
                  onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-pink-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Select from Tasks"
                >
                  <ListTodo size={20} />
                </button>
                
                {/* Task Dropdown */}
                {showTaskDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-30 animate-in fade-in zoom-in-95">
                     <div className="max-h-56 overflow-y-auto custom-scrollbar">
                        {todaysTasks.length === 0 ? (
                           <div className="p-4 text-center text-sm text-slate-500">No pending tasks for today.</div>
                        ) : (
                           todaysTasks.map(task => (
                              <button
                                key={task.id}
                                onClick={() => { setFocusTask(task.title); setShowTaskDropdown(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
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

            {/* TIMER SVG & DISPLAY */}
            {pipWindow ? (
                <div className="w-[320px] h-[320px] rounded-full bg-slate-50 dark:bg-slate-900 border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 animate-pulse">
                    <ExternalLink size={48} className="mb-4 opacity-50" />
                    <span className="text-sm font-bold uppercase tracking-widest">Popped Out</span>
                    <button onClick={handlePopOut} className="mt-6 px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold hover:bg-pink-50 dark:hover:text-white transition-colors shadow-sm">
                        Bring Back
                    </button>
                </div>
            ) : (
                <div className="relative mb-12 group cursor-pointer" onClick={toggleTimer}>
                    {/* Glow Effect Layer (Dark Mode Only) */}
                    {isDark && isActive && (
                        <div className="absolute inset-0 rounded-full blur-[50px] opacity-20 bg-pink-500 animate-pulse pointer-events-none"></div>
                    )}

                    <svg width="340" height="340" className="transform -rotate-90 relative z-10">
                        {/* Track */}
                        <circle 
                            cx="170" cy="170" r={radius} 
                            fill="transparent" 
                            stroke={theme.pathColor}
                            strokeWidth="8" 
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
                            style={{ filter: theme.ringGlow, transition: 'stroke-dashoffset 0.5s linear' }}
                        />
                    </svg>
                    
                    {/* Time Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                        <span className={`text-7xl lg:text-8xl font-mono font-bold tracking-tighter tabular-nums ${theme.text}`}>
                            {formatTime(timeLeft)}
                        </span>
                        <div className={`flex items-center gap-2 mt-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${theme.badge}`}>
                            {theme.icon}
                            <span>{isActive ? 'Running' : 'Paused'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Time Slider (Only in Custom Mode) */}
            {mode === 'custom' && !isActive && !pipWindow && (
               <div className="w-full max-w-xs mb-8 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                     <span>1 min</span>
                     <span>DURATION: {customTime}m</span>
                     <span>180 min</span>
                  </div>
                  <input 
                    type="range" min="1" max="180" 
                    value={customTime} 
                    onChange={(e) => setCustomTimeValue(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
               </div>
            )}

            {/* Main Controls */}
            <div className="flex items-center gap-8 z-10">
                <button 
                    onClick={resetTimer}
                    className="p-5 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-lg dark:shadow-none hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition-all border border-slate-100 dark:border-slate-700"
                    title="Reset Timer"
                >
                    <RotateCcw size={22} />
                </button>

                <button 
                    onClick={toggleTimer}
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 ${
                        isDark 
                        ? 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]' 
                        : 'bg-slate-900 text-white hover:shadow-xl'
                    }`}
                >
                    {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1"/>}
                </button>

                <button 
                    onClick={toggleMute}
                    className="p-5 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-lg dark:shadow-none hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition-all border border-slate-100 dark:border-slate-700"
                    title={isMuted ? "Unmute Alarm" : "Mute Alarm"}
                >
                    {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex flex-wrap justify-center gap-2 mt-12 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                {[
                  { id: 'pomodoro', label: 'Focus' },
                  { id: 'shortBreak', label: 'Short Break' },
                  { id: 'longBreak', label: 'Long Break' },
                  { id: 'custom', label: 'Custom' }
                ].map((m) => (
                   <button
                     key={m.id}
                     onClick={() => switchMode(m.id as TimerMode)}
                     className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        mode === m.id 
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                     }`}
                   >
                     {m.label}
                   </button>
                ))}
            </div>

            {/* Brown Noise Toggle */}
             <button 
                onClick={toggleBrownNoise}
                className={`mt-6 flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                    isPlayingNoise 
                    ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900' 
                    : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
                <Waves size={16} className={isPlayingNoise ? 'animate-bounce' : ''} />
                {isPlayingNoise ? 'Brown Noise On' : 'Enable Brown Noise'}
            </button>
        </div>

        {/* --- RIGHT COLUMN: VIDEO PLAYER ANCHOR --- */}
        <div className="flex flex-col h-full justify-center relative">
             {/* 
                ANCHOR ID: "video-anchor"
                The GlobalYoutubePlayer will Portal into this div when on this page.
                We ensure it has no pointer-events blocking interaction.
             */}
             <div className="relative group">
                 {/* Decorative background border/glow */}
                 <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-violet-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                 
                 <div 
                    id="video-anchor" 
                    className="w-full aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800 isolate"
                 >
                    {/* Placeholder while player loads/moves */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 z-[-1]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mb-2"></div>
                        <span className="text-slate-500 text-xs font-medium">Loading Player...</span>
                    </div>
                 </div>
             </div>

             <div className="mt-8 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm backdrop-blur-sm">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <Zap size={16} className="text-yellow-600 dark:text-yellow-400 fill-current" />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Pro Tip</h3>
                 </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    <strong>Audio Persistence:</strong> The music player is anchored here. If you navigate to other tabs (like Planner), it transforms into a mini-widget so your music never stops.
                    <br/><br/>
                    <strong>Pop Out Mode:</strong> Click the <Maximize2 size={10} className="inline mx-0.5"/> icon to move the Timer to a separate window. The video player will stay here (hidden) to keep the audio stream alive.
                 </p>
             </div>
        </div>

      </div>

      {/* --- BREAK MODAL --- */}
      {showBreakModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" />
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-pink-50 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Coffee size={40} className="text-pink-600 dark:text-pink-400 animate-bounce" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Time's Up!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                    You've completed a session. Take a breath, stretch, and reset.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => {
                            stopAlarm();
                            setShowBreakModal(false);
                            switchMode(mode === 'pomodoro' ? 'shortBreak' : 'pomodoro');
                        }}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-lg shadow-lg shadow-pink-500/30 hover:scale-[1.02] transition-transform"
                    >
                        {mode === 'pomodoro' ? 'Start Short Break' : 'Start Focus Session'}
                    </button>
                    <button 
                        onClick={() => {
                            stopAlarm();
                            setShowBreakModal(false);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-medium py-2"
                    >
                        Dismiss Alarm
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Pomodoro;
