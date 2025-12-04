
import React, { useEffect, useState, useRef } from 'react';
import { 
    Play, Pause, RotateCcw, Waves, MonitorPlay, 
    Brain, Coffee, Target, Music, Settings, X, Save, Trophy, Star, Sparkles, Zap, SkipForward, Layers, Activity
} from 'lucide-react';
import { usePomodoro, PresetName, TimerSettings, TimerMode } from './PomodoroContext';
import { useTasks } from '../TaskContext';
import { isWithinInterval } from 'date-fns';
import confetti from 'canvas-confetti';

// --- MINIMALIST AESTHETIC CAT ---
const AnimatedCat = () => (
  <div className="relative w-40 h-40 mx-auto">
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
      <defs>
        <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDF2F8" /> {/* Pink-50 */}
          <stop offset="100%" stopColor="#FCE7F3" /> {/* Pink-100 */}
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <style>
        {`
          @keyframes float-minimal { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
          @keyframes blink-minimal { 0%, 48%, 52%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.1); } }
          @keyframes ear-twitch { 0%, 90% { transform: rotate(0deg); } 95% { transform: rotate(-5deg); } 100% { transform: rotate(0deg); } }
          
          .min-cat-body { animation: float-minimal 4s ease-in-out infinite; transform-origin: center bottom; }
          .min-cat-eye { animation: blink-minimal 5s infinite; transform-origin: center; transform-box: fill-box; }
          .min-cat-ear { animation: ear-twitch 3s infinite; transform-origin: bottom center; }
        `}
      </style>

      {/* Main Group */}
      <g className="min-cat-body">
          {/* Ears */}
          <path d="M45 70 L35 30 L85 55 Z" fill="url(#catGradient)" stroke="#FBCFE8" strokeWidth="3" strokeLinejoin="round" className="min-cat-ear" />
          <path d="M155 70 L165 30 L115 55 Z" fill="url(#catGradient)" stroke="#FBCFE8" strokeWidth="3" strokeLinejoin="round" className="min-cat-ear" style={{ animationDelay: '1.5s' }} />
          
          {/* Face Base */}
          <ellipse cx="100" cy="110" rx="75" ry="60" fill="url(#catGradient)" stroke="#FBCFE8" strokeWidth="3" />
          
          {/* Cheeks */}
          <circle cx="55" cy="115" r="8" fill="#F472B6" opacity="0.3" />
          <circle cx="145" cy="115" r="8" fill="#F472B6" opacity="0.3" />

          {/* Eyes (Simple Curves) */}
          <g className="min-cat-eye">
              <circle cx="70" cy="100" r="5" fill="#374151" />
          </g>
          <g className="min-cat-eye" style={{ animationDelay: '0.2s' }}>
              <circle cx="130" cy="100" r="5" fill="#374151" />
          </g>

          {/* Nose & Mouth (Minimalist) */}
          <path d="M96 115 L104 115 L100 120 Z" fill="#EC4899" />
          <path d="M100 120 Q90 128 85 122 M100 120 Q110 128 115 122" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />

          {/* Paws Peeking */}
          <path d="M60 165 Q70 155 80 165" fill="none" stroke="#FBCFE8" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
          <path d="M120 165 Q130 155 140 165" fill="none" stroke="#FBCFE8" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      </g>
    </svg>
  </div>
);

const Pomodoro: React.FC = () => {
  const { 
    mode, timeLeft, isActive, activePreset, timerSettings, sessionGoal, sessionsCompleted, focusTask, isBrownNoiseOn,
    toggleTimer, resetTimer, setPreset, setSessionGoal, setFocusTask, toggleBrownNoise, skipForward, togglePiP, setCustomSettings
  } = usePomodoro();

  const { tasks } = useTasks();
  
  // Local state
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // Track mode change to trigger break modal
  const prevModeRef = useRef<TimerMode>(mode);
  const prevSessionsRef = useRef<number>(sessionsCompleted);

  // --- GOAL COMPLETION TRIGGER ---
  useEffect(() => {
      // Check if sessions incremented AND we hit the goal
      if (sessionsCompleted > prevSessionsRef.current) {
          if (sessionsCompleted > 0 && sessionsCompleted % sessionGoal === 0) {
              setShowGoalModal(true);
              // Trigger minimalist confetti
              const duration = 3000;
              const end = Date.now() + duration;
              (function frame() {
                confetti({
                  particleCount: 3,
                  angle: 60,
                  spread: 55,
                  origin: { x: 0 },
                  colors: ['#F472B6', '#A78BFA', '#FCD34D'],
                  shapes: ['circle']
                });
                confetti({
                  particleCount: 3,
                  angle: 120,
                  spread: 55,
                  origin: { x: 1 },
                  colors: ['#F472B6', '#A78BFA', '#FCD34D'],
                  shapes: ['circle']
                });
                if (Date.now() < end) {
                  requestAnimationFrame(frame);
                }
              }());
          }
      }
      prevSessionsRef.current = sessionsCompleted;
  }, [sessionsCompleted, sessionGoal]);

  // --- BREAK MODAL TRIGGER ---
  useEffect(() => {
      // Trigger modal if we switched FROM focus TO break
      // BUT ONLY if we aren't showing the Goal Modal (Goal Modal takes precedence)
      if (prevModeRef.current === 'focus' && (mode === 'shortBreak' || mode === 'longBreak')) {
          if (sessionsCompleted % sessionGoal !== 0) {
             setShowBreakModal(true);
          }
      }
      prevModeRef.current = mode;
  }, [mode, sessionsCompleted, sessionGoal]);

  // Custom Timer Form State
  const [customForm, setCustomForm] = useState<TimerSettings>({ focus: 25 * 60, shortBreak: 5 * 60, longBreak: 20 * 60 });

  // Update local form state when opening modal
  useEffect(() => {
      if (isCustomModalOpen && activePreset === 'custom') {
          setCustomForm(timerSettings);
      }
  }, [isCustomModalOpen, activePreset, timerSettings]);

  // --- AUTOMATIC TASK SYNC ---
  useEffect(() => {
      if (!isActive && !focusTask && tasks.length > 0) {
          const now = new Date();
          const activeTask = tasks.find(t => {
              const start = new Date(t.start);
              const end = new Date(t.end);
              return !t.completed && isWithinInterval(now, { start, end });
          });

          if (activeTask) {
              setFocusTask(activeTask.title);
          }
      }
  }, [isActive, focusTask, tasks, setFocusTask]);

  // --- SVG MATH ---
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const totalTime = mode === 'focus' ? timerSettings.focus : (mode === 'shortBreak' ? timerSettings.shortBreak : timerSettings.longBreak);
  const progress = timeLeft / totalTime;
  const strokeDashoffset = circumference - (progress * circumference);
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isFocus = mode === 'focus';
  const themeColor = isFocus ? 'text-pink-600 dark:text-pink-500' : 'text-cyan-600 dark:text-cyan-500';
  const strokeColor = isFocus ? '#ec4899' : '#06b6d4'; 
  const glowShadow = isActive 
    ? isFocus 
        ? 'drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]' 
        : 'drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]'
    : '';

  // Handle Input Changes for Custom Timer
  const handleInputChange = (field: keyof TimerSettings, value: string) => {
      const parsed = parseInt(value);
      if (!isNaN(parsed) && parsed >= 0) {
          setCustomForm(prev => ({...prev, [field]: parsed * 60})); // Store as seconds
      } else if (value === '') {
          setCustomForm(prev => ({...prev, [field]: 0})); // Handle empty
      }
  };

  const handleCustomSave = (e: React.FormEvent) => {
      e.preventDefault();
      setCustomSettings(customForm);
      setPreset('custom');
      setIsCustomModalOpen(false);
  };

  const incompleteTasks = tasks.filter(t => !t.completed).slice(0, 5);

  return (
    <div className="min-h-[calc(100vh-100px)] w-full flex flex-col items-center justify-center relative overflow-hidden font-sans transition-colors duration-500 justify-center">
      
      {/* Background Ambience */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-10 dark:opacity-20 pointer-events-none transition-colors duration-1000 ${isFocus ? 'bg-pink-500' : 'bg-cyan-500'}`}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      {/* --- HEADER: VITAL SIGNS --- */}
      <div className="w-full max-w-6xl px-6 py-4 flex flex-col md:flex-row justify-between items-center z-10 border-b border-slate-200 dark:border-white/5 gap-4">
          <div className="flex items-center gap-3 bg-white dark:bg-white/5 px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-white/5 backdrop-blur-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500 animate-ping' : 'bg-red-500'}`}></div>
              <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  System: {isActive ? 'ONLINE' : 'STANDBY'}
              </span>
          </div>
          
          <div className="flex items-center gap-6 font-mono text-xs md:text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                  <Activity size={14} className={themeColor} />
                  <span className="font-bold">HR: {isActive ? '72 BPM' : '--'}</span>
              </div>
              <div className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" />
                  <span className="font-bold uppercase">{isFocus ? 'Focus Protocol' : 'Recovery Phase'}</span>
              </div>
          </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl p-4 md:p-8 z-10 flex-1 items-center">
        
        {/* LEFT: SETTINGS & CONTROLS */}
        <div className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1 justify-center">
            
            {/* 1. Presets */}
            <div className="bg-white/80 dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Layers size={12} /> Timer Presets
                    </h3>
                    <button 
                        onClick={() => setIsCustomModalOpen(true)} 
                        className="text-pink-500 hover:text-pink-600 transition-colors"
                        title="Edit Custom Timer"
                    >
                        <Settings size={14} />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {(['micro', 'classic', 'long', 'custom'] as PresetName[]).map((p) => (
                        <button 
                            key={p}
                            onClick={() => {
                                if (p === 'custom' && activePreset === 'custom') {
                                    setIsCustomModalOpen(true);
                                } else {
                                    setPreset(p);
                                }
                            }}
                            className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border relative overflow-hidden ${
                                activePreset === p 
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg transform scale-105' 
                                : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                            }`}
                        >
                            {p === 'micro' ? '15/5' : p === 'classic' ? '25/5' : p === 'long' ? '50/10' : 'Custom'}
                            {activePreset === p && p === 'custom' && (
                                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Session Goal */}
            <div className="bg-white/80 dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Target size={12} /> Daily Goal
                    </h3>
                    <span className="text-xs font-bold text-pink-500">{sessionsCompleted} / {sessionGoal}</span>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="12" 
                    step="1"
                    value={sessionGoal}
                    onChange={(e) => setSessionGoal(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                    <span>1 Session</span>
                    <span>12 Sessions</span>
                </div>
            </div>

            {/* 3. Task Selector */}
            <div className="bg-white/80 dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl backdrop-blur-md relative">
                <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Brain size={12} /> Focus Target
                </h3>
                
                <div className="relative">
                    <input 
                        type="text" 
                        value={focusTask}
                        onChange={(e) => setFocusTask(e.target.value)}
                        onFocus={() => setShowTaskDropdown(true)}
                        onBlur={() => setTimeout(() => setShowTaskDropdown(false), 200)}
                        placeholder="What are you studying?"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                    />
                    
                    {/* Auto-Sync Indicator */}
                    {!focusTask && tasks.length > 0 && (
                        <span className="absolute right-3 top-3 text-[10px] text-pink-500 font-bold animate-pulse pointer-events-none">
                            AUTO-SYNCING...
                        </span>
                    )}

                    {showTaskDropdown && incompleteTasks.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50">
                                From Planner
                            </div>
                            {incompleteTasks.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setFocusTask(t.title)}
                                    className="w-full text-left px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-pink-400 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0 truncate"
                                >
                                    {t.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* CENTER: THE RING & MAIN CONTROLS */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2 py-8 lg:py-0">
            <div className="relative group cursor-pointer" onClick={toggleTimer}>
                
                {/* Outer Glow Ring (Static) */}
                <div className={`absolute inset-0 rounded-full border-[1px] opacity-10 transform scale-110 pointer-events-none ${isFocus ? 'border-pink-500' : 'border-cyan-500'}`}></div>

                {/* Heartbeat Pulse Ring */}
                <div className={`absolute inset-0 rounded-full border-4 opacity-20 pointer-events-none transition-colors duration-500 ${isActive ? 'animate-ping' : ''} ${isFocus ? 'border-pink-500' : 'border-cyan-500'}`}></div>

                {/* SVG Ring */}
                <svg width="340" height="340" className="transform -rotate-90 drop-shadow-2xl">
                    {/* Track */}
                    <circle 
                        cx="170" cy="170" r={radius} 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        className="text-slate-200 dark:text-slate-800"
                    />
                    {/* Progress */}
                    <circle 
                        cx="170" cy="170" r={radius} 
                        stroke={strokeColor} 
                        strokeWidth="16" 
                        fill="transparent" 
                        strokeLinecap="round" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset} 
                        className={`transition-all duration-300 ease-linear ${glowShadow}`}
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <span className={`text-7xl md:text-8xl font-mono font-black tracking-tighter tabular-nums drop-shadow-lg text-slate-800 dark:text-white ${isActive ? 'animate-pulse-slow' : ''}`}>
                        {formatTime(timeLeft)}
                    </span>
                    <span className={`mt-4 text-xs font-black uppercase tracking-[0.4em] ${themeColor}`}>
                        {isActive ? 'RUNNING' : 'PAUSED'}
                    </span>
                </div>
            </div>

            {/* Main Action Buttons */}
            <div className="mt-12 flex items-center gap-6">
                <button 
                    onClick={resetTimer} 
                    className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                    title="Reset"
                >
                    <RotateCcw size={24} />
                </button>
                
                <button 
                    onClick={toggleTimer} 
                    className={`w-24 h-24 rounded-[3rem] flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 ${
                        isActive 
                        ? 'bg-white text-slate-900 border-4 border-slate-100' 
                        : `${isFocus ? 'bg-pink-600 shadow-pink-500/40' : 'bg-cyan-600 shadow-cyan-500/40'} text-white`
                    }`}
                >
                    {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                </button>

                <button 
                    onClick={skipForward} 
                    className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                    title="Skip"
                >
                    <SkipForward size={24} />
                </button>
            </div>
        </div>

        {/* RIGHT: AUDIO & VIDEO MANAGER */}
        <div className="lg:col-span-3 order-3 flex flex-col gap-6 justify-center">
             
             {/* 1. Audio Controls */}
             <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={toggleBrownNoise}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all h-28 ${
                        isBrownNoiseOn 
                        ? 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-inner' 
                        : 'bg-white dark:bg-[#0B1221] border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-400 dark:hover:border-indigo-500'
                    }`}
                >
                    <Waves size={24} className={isBrownNoiseOn ? 'animate-pulse' : ''} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Brown Noise</span>
                </button>
                <button 
                    onClick={togglePiP}
                    className="p-4 rounded-2xl bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 hover:border-pink-500/50 flex flex-col items-center justify-center gap-2 transition-all h-28"
                >
                    <MonitorPlay size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Mini Mode</span>
                </button>
             </div>

             {/* 2. Focus Station (Video Dock) - 16:9 Fixed Ratio */}
             <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group border border-slate-200 dark:border-slate-800">
                 
                 {/* Decorative Header Overlay */}
                 <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Music size={12} className="text-white animate-pulse" />
                     <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                         Focus Station
                     </span>
                 </div>

                 {/* VIDEO ANCHOR POINT - GlobalPlayer TELEPORTS HERE */}
                 <div id="video-anchor" className="w-full h-full bg-slate-900 relative">
                     {/* Placeholder until portal arrives */}
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 dark:text-slate-700">
                         <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mb-2"></div>
                         <span className="text-[10px] font-mono uppercase tracking-widest">Initializing Feed...</span>
                     </div>
                 </div>
             </div>

             <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed px-4">
                 Audio continues in background even if you navigate away.
             </p>
        </div>

      </div>

      {/* --- MINIMALIST BREAK NOTIFICATION MODAL --- */}
      {showBreakModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-fade-in" onClick={() => setShowBreakModal(false)}>
              <div 
                className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-white/20 dark:border-white/10 relative flex flex-col items-center text-center animate-zoom-in" 
                onClick={e => e.stopPropagation()}
              >
                  <AnimatedCat />
                  
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-6 mb-2">
                      Pause & Breathe
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                      You've earned this moment. Step away, stretch, and recharge for the next round.
                  </p>

                  <div className="flex flex-col w-full gap-3">
                      <button 
                          onClick={() => { setShowBreakModal(false); toggleTimer(); }}
                          className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
                      >
                          <Coffee size={18} /> Start Break
                      </button>
                      <button 
                          onClick={() => { setShowBreakModal(false); skipForward(); }}
                          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold tracking-wide uppercase py-2 transition-colors"
                      >
                          Skip Rest
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- PREMIUM GOAL CELEBRATION MODAL --- */}
      {showGoalModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in" onClick={() => setShowGoalModal(false)}>
              <div 
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl border border-white/50 dark:border-white/10 relative animate-zoom-in text-center overflow-hidden" 
                onClick={e => e.stopPropagation()}
              >
                  {/* Subtle Aura */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-[80px] pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col items-center">
                      <div className="w-20 h-20 bg-gradient-to-tr from-amber-300 to-amber-500 rounded-2xl rotate-3 shadow-lg shadow-amber-500/30 flex items-center justify-center mb-6 text-white transform hover:rotate-6 transition-transform duration-500">
                          <Trophy size={40} className="drop-shadow-md" />
                      </div>

                      <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                          Goal Reached
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-8">
                          {sessionsCompleted} focus sessions completed today.<br/>Excellent momentum.
                      </p>

                      <div className="flex flex-col w-full gap-3">
                          <button 
                              onClick={() => { setShowGoalModal(false); toggleTimer(); }}
                              className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                          >
                              <Sparkles size={18} /> Take a Break
                          </button>
                          <button 
                              onClick={() => setShowGoalModal(false)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold uppercase tracking-widest mt-2 transition-colors"
                          >
                              Dismiss
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- CUSTOM TIMER MODAL --- */}
      {isCustomModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-white/20 relative">
                  <button 
                      onClick={() => setIsCustomModalOpen(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                  >
                      <X size={20} />
                  </button>
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <Settings className="text-pink-500" /> Configure Timer
                  </h3>

                  <form onSubmit={handleCustomSave} className="space-y-5">
                      <div className="space-y-1">
                          <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Focus Duration</label>
                              <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Minutes</span>
                          </div>
                          <input 
                              type="number" 
                              value={Math.floor(customForm.focus / 60) || ''}
                              onChange={(e) => handleInputChange('focus', e.target.value)}
                              className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-lg font-bold text-slate-800 dark:text-white focus:outline-none focus:border-pink-500 transition-all placeholder:text-slate-600"
                              placeholder="25"
                              min="1"
                              max="120"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Short Break</label>
                              <input 
                                  type="number" 
                                  value={Math.floor(customForm.shortBreak / 60) || ''}
                                  onChange={(e) => handleInputChange('shortBreak', e.target.value)}
                                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-lg font-bold text-slate-800 dark:text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                                  placeholder="5"
                                  min="1"
                                  max="30"
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Long Break</label>
                              <input 
                                  type="number" 
                                  value={Math.floor(customForm.longBreak / 60) || ''}
                                  onChange={(e) => handleInputChange('longBreak', e.target.value)}
                                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-lg font-bold text-slate-800 dark:text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                                  placeholder="20"
                                  min="1"
                                  max="60"
                              />
                          </div>
                      </div>

                      <button 
                          type="submit"
                          className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 mt-4 active:scale-95 transition-all"
                      >
                          <Save size={18} /> Save & Apply
                      </button>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};

export default Pomodoro;
