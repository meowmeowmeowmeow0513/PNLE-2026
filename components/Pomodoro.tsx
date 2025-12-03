
import React, { useState } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, 
  Waves, Maximize2, Coffee, Zap, Brain, ListTodo, ChevronRight
} from 'lucide-react';
import { usePomodoro, TimerMode } from './PomodoroContext';
import { useTasks } from '../TaskContext';
import { isSameDay } from 'date-fns';

const Pomodoro: React.FC = () => {
  const { 
    mode, timeLeft, initialTime, isActive, customTime, isMuted,
    focusTask, isPlayingNoise, pipWindow,
    toggleTimer, resetTimer, switchMode, setCustomTimeValue,
    toggleMute, setFocusTask, toggleBrownNoise,
    showBreakModal, setShowBreakModal, stopAlarm
  } = usePomodoro();

  const { tasks } = useTasks();
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);

  // --- SVG CALCULATIONS ---
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((timeLeft / initialTime) * circumference);

  // Get tasks for dropdown
  const todaysTasks = tasks.filter(t => !t.completed && t.start && isSameDay(new Date(t.start), new Date()));

  // --- DYNAMIC THEME ENGINE ---
  const isFocus = mode === 'pomodoro' || mode === 'custom';
  
  const getTheme = () => {
    if (isFocus) {
      return {
        // Light Mode
        lightBg: 'bg-white',
        lightText: 'text-slate-800',
        lightAccent: 'text-pink-600',
        lightRing: 'stroke-pink-500',
        // Dark Mode
        darkBg: 'dark:bg-[#0B1120]',
        darkText: 'dark:text-white',
        darkAccent: 'dark:text-pink-500',
        darkRing: 'dark:stroke-pink-500',
        darkGlow: 'dark:drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]',
        // Icon
        icon: <Brain size={20} />
      };
    } else {
      return {
        // Light Mode
        lightBg: 'bg-emerald-50',
        lightText: 'text-emerald-900',
        lightAccent: 'text-emerald-600',
        lightRing: 'stroke-emerald-500',
        // Dark Mode
        darkBg: 'dark:bg-[#061218]', // Deep Teal Dark
        darkText: 'dark:text-cyan-50',
        darkAccent: 'dark:text-cyan-400',
        darkRing: 'dark:stroke-cyan-400',
        darkGlow: 'dark:drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]',
        // Icon
        icon: mode === 'shortBreak' ? <Coffee size={20} /> : <Zap size={20} />
      };
    }
  };

  const theme = getTheme();

  // PiP Trigger
  const triggerPiP = () => {
    window.dispatchEvent(new CustomEvent('open-pip'));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center transition-colors duration-700 ${theme.lightBg} ${theme.darkBg}`}>
      
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-6">
        
        {/* --- LEFT COLUMN: TIMER & CONTROLS --- */}
        <div className="flex flex-col items-center relative z-10">
            
            {/* FOCUS ANCHOR (Input) */}
            <div className="w-full max-w-md mb-10 text-center relative group">
                <label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${theme.lightAccent} ${theme.darkAccent} opacity-70`}>
                    {isActive ? 'LOCKED ON' : 'I AM FOCUSING ON'}
                </label>
                <div className="relative">
                    <input 
                        type="text" 
                        value={focusTask}
                        onChange={(e) => setFocusTask(e.target.value)}
                        placeholder="Enter Task..."
                        disabled={isActive}
                        className={`w-full bg-transparent text-center text-3xl md:text-4xl font-black placeholder-slate-300 dark:placeholder-slate-700 focus:outline-none transition-all duration-300 ${
                            isActive 
                            ? `${theme.lightText} ${theme.darkText} opacity-100 scale-105` 
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                    />
                    {!isActive && (
                         <>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full group-hover:w-24 transition-all duration-500"></div>
                            <button 
                                onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-500 dark:text-slate-700 dark:hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <ListTodo size={20} />
                            </button>
                         </>
                    )}
                    
                    {/* Task Dropdown */}
                    {showTaskDropdown && !isActive && (
                      <div className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-[#0F1629] border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-30 animate-in fade-in zoom-in-95 backdrop-blur-xl text-left">
                         <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                            {todaysTasks.length === 0 ? (
                               <div className="p-4 text-center text-sm text-slate-500">No pending tasks for today.</div>
                            ) : (
                               todaysTasks.map(task => (
                                  <button
                                    key={task.id}
                                    onClick={() => { setFocusTask(task.title); setShowTaskDropdown(false); }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-sm text-slate-700 dark:text-slate-200 flex items-center justify-between group/item transition-colors"
                                  >
                                     <span className="font-medium truncate">{task.title}</span>
                                     <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-50" />
                                  </button>
                               ))
                            )}
                         </div>
                      </div>
                    )}
                </div>
            </div>

            {/* --- SVG TIMER RING --- */}
            {pipWindow ? (
                <div className="w-[320px] h-[320px] rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 animate-pulse">
                    <Maximize2 size={40} className="text-slate-300 dark:text-slate-600" />
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Running in PiP</span>
                    <button onClick={triggerPiP} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-pink-500 transition-colors">
                        Restore
                    </button>
                </div>
            ) : (
                <div className="relative mb-12">
                    {/* SVG Container */}
                    <svg width="340" height="340" className="transform -rotate-90">
                        {/* Background Track */}
                        <circle
                            cx="170" cy="170" r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-slate-100 dark:text-white/5 transition-colors duration-500"
                        />
                        {/* Progress Ring */}
                        <circle
                            cx="170" cy="170" r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className={`${theme.lightRing} ${theme.darkRing} ${theme.darkGlow} transition-[stroke-dashoffset] duration-500 ease-linear`}
                        />
                    </svg>

                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-7xl font-mono font-bold tracking-tighter ${theme.lightText} ${theme.darkText} drop-shadow-sm`}>
                            {formatTime(timeLeft)}
                        </span>
                        <div className={`flex items-center gap-2 mt-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 ${theme.lightText} ${theme.darkText} transition-colors`}>
                            {theme.icon}
                            <span>{isActive ? 'Active' : 'Paused'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Slider */}
            {mode === 'custom' && !isActive && !pipWindow && (
                <div className="w-64 mb-8">
                    <input 
                        type="range" min="1" max="120" 
                        value={customTime} 
                        onChange={(e) => setCustomTimeValue(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                        <span>1m</span>
                        <span className="text-pink-500">{customTime} min</span>
                        <span>120m</span>
                    </div>
                </div>
            )}

            {/* --- CONTROLS PILL --- */}
            <div className="flex items-center gap-4 p-2 rounded-2xl bg-white dark:bg-black/20 border border-slate-100 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-sm transition-all hover:scale-105">
                
                <button 
                    onClick={resetTimer}
                    className="p-4 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                >
                    <RotateCcw size={20} />
                </button>

                <button 
                    onClick={toggleTimer}
                    className={`p-5 rounded-xl text-white shadow-lg transition-transform active:scale-95 ${
                        isActive 
                        ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' 
                        : isFocus ? 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                    }`}
                >
                    {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>

                <button 
                    onClick={toggleMute}
                    className="p-4 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* SECONDARY CONTROLS */}
            <div className="mt-8 flex items-center gap-4">
                 {/* Mode Switcher */}
                <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
                    {['pomodoro', 'shortBreak', 'longBreak'].map((m) => (
                        <button
                            key={m}
                            onClick={() => switchMode(m as TimerMode)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                mode === m 
                                ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                        >
                            {m.replace(/([A-Z])/g, ' $1').trim()}
                        </button>
                    ))}
                    <button 
                        onClick={() => switchMode('custom')}
                        className={`px-3 py-2 rounded-lg text-slate-400 hover:text-pink-500 transition-colors ${mode === 'custom' ? 'bg-white dark:bg-white/10 text-pink-500 dark:text-pink-400' : ''}`}
                    >
                        <ListTodo size={14}/>
                    </button>
                </div>

                {/* Extras */}
                <div className="flex gap-2">
                    <button 
                        onClick={toggleBrownNoise}
                        className={`p-2.5 rounded-xl border transition-all ${
                            isPlayingNoise 
                            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400' 
                            : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                        title="Brown Noise"
                    >
                        <Waves size={18} className={isPlayingNoise ? 'animate-pulse' : ''} />
                    </button>
                    
                    {!pipWindow && (
                        <button 
                            onClick={triggerPiP}
                            className="p-2.5 rounded-xl border border-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-white transition-all"
                            title="Pop Out Mode"
                        >
                            <Maximize2 size={18} />
                        </button>
                    )}
                </div>
            </div>

        </div>

        {/* --- RIGHT COLUMN: VIDEO ANCHOR (Persistent Player Target) --- */}
        <div className="hidden lg:flex flex-col justify-center h-full relative">
             <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-black/50 border border-slate-100 dark:border-white/10 bg-slate-900 relative group">
                 
                 {/* ID used by GlobalYoutubePlayer to snap here */}
                 <div id="video-anchor" className="w-full h-full"></div>
                 
                 {/* Placeholder Content if player fails/moves */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                    <div className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-500">
                        <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                        <span className="text-xs font-bold uppercase tracking-widest">Loading Player...</span>
                    </div>
                 </div>
             </div>
             
             <div className="mt-8 p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} className="text-yellow-500" fill="currentColor" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Pro Tip</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    The music player is persistent. You can navigate to the Dashboard or Planner, and the video will automatically minimize to a floating widget. Audio never stops.
                </p>
             </div>
        </div>

      </div>

      {/* --- TIME'S UP MODAL (Glassmorphism) --- */}
      {showBreakModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" />
            
            <div className="relative bg-white dark:bg-[#0F1629] border border-slate-200 dark:border-white/10 p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-pink-500 rounded-full blur-[60px] opacity-30 dark:opacity-50 pointer-events-none"></div>

                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Time's Up!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium">
                    {mode === 'pomodoro' ? "Great focus session. Take a breather." : "Break is over. Ready to lock in?"}
                </p>
                
                <div className="flex flex-col gap-3 relative z-10">
                    <button 
                        onClick={() => {
                            stopAlarm();
                            setShowBreakModal(false);
                            switchMode(mode === 'pomodoro' ? 'shortBreak' : 'pomodoro');
                        }}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-lg shadow-pink-500/30 hover:scale-[1.02] transition-transform"
                    >
                        {mode === 'pomodoro' ? 'Start Break' : 'Start Focus'}
                    </button>
                    
                    <button 
                        onClick={() => {
                            stopAlarm();
                            setShowBreakModal(false);
                        }}
                        className="py-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs font-bold uppercase tracking-widest transition-colors"
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
