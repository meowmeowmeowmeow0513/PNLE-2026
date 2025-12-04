
import React, { useEffect, useState, useRef } from 'react';
import { 
    Play, Pause, RotateCcw, Waves, MonitorPlay, 
    Brain, Target, Music, Settings, X, Save, Trophy, Sparkles, Zap, SkipForward, Layers, Activity, AlertTriangle
} from 'lucide-react';
import { usePomodoro, PresetName, TimerSettings, TimerMode } from './PomodoroContext';
import { useTasks } from '../TaskContext';
import { isWithinInterval } from 'date-fns';
import confetti from 'canvas-confetti';
import PomodoroStats from './PomodoroStats';

// --- MINIMALIST AESTHETIC CAT ---
const AnimatedCat = () => (
  <div className="relative w-32 h-32 mx-auto mb-4">
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDF2F8" />
          <stop offset="100%" stopColor="#FCE7F3" />
        </linearGradient>
      </defs>
      <style>
        {`
          @keyframes float-minimal { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
          @keyframes blink-minimal { 0%, 48%, 52%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.1); } }
          .min-cat-body { animation: float-minimal 4s ease-in-out infinite; transform-origin: center bottom; }
          .min-cat-eye { animation: blink-minimal 5s infinite; transform-origin: center; transform-box: fill-box; }
        `}
      </style>
      <g className="min-cat-body">
          <path d="M45 70 L35 30 L85 55 Z" fill="url(#catGradient)" stroke="#FBCFE8" strokeWidth="3" strokeLinejoin="round" />
          <path d="M155 70 L165 30 L115 55 Z" fill="url(#catGradient)" stroke="#FBCFE8" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="100" cy="110" rx="75" ry="60" fill="url(#catGradient)" stroke="#FBCFE8" strokeWidth="3" />
          <g className="min-cat-eye"><circle cx="70" cy="100" r="5" fill="#374151" /></g>
          <g className="min-cat-eye" style={{ animationDelay: '0.2s' }}><circle cx="130" cy="100" r="5" fill="#374151" /></g>
          <path d="M96 115 L104 115 L100 120 Z" fill="#EC4899" />
          <path d="M100 120 Q90 128 85 122 M100 120 Q110 128 115 122" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

const Pomodoro: React.FC = () => {
  const { 
    mode, timeLeft, isActive, activePreset, timerSettings, sessionGoal, sessionsCompleted, focusTask, isBrownNoiseOn,
    toggleTimer, resetTimer, stopSessionEarly, setPreset, setSessionGoal, setFocusTask, toggleBrownNoise, skipForward, togglePiP, setCustomSettings
  } = usePomodoro();

  const { tasks } = useTasks();
  
  // Local state
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // New: Early Exit Modal State
  const [showEarlyExitModal, setShowEarlyExitModal] = useState(false);
  
  // Track mode change to trigger break modal
  const prevModeRef = useRef<TimerMode>(mode);
  const prevSessionsRef = useRef<number>(sessionsCompleted);

  // --- GOAL COMPLETION TRIGGER ---
  useEffect(() => {
      if (sessionsCompleted > prevSessionsRef.current) {
          if (sessionsCompleted > 0 && sessionsCompleted % sessionGoal === 0) {
              setShowGoalModal(true);
              confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
          }
      }
      prevSessionsRef.current = sessionsCompleted;
  }, [sessionsCompleted, sessionGoal]);

  // --- BREAK MODAL TRIGGER ---
  useEffect(() => {
      if (prevModeRef.current === 'focus' && (mode === 'shortBreak' || mode === 'longBreak')) {
          // If NOT completing a goal (handled above), show break cat
          if (sessionsCompleted % sessionGoal !== 0) {
             setShowBreakModal(true);
          }
      }
      prevModeRef.current = mode;
  }, [mode, sessionsCompleted, sessionGoal]);

  // Custom Timer Form State
  const [customForm, setCustomForm] = useState<TimerSettings>({ focus: 25 * 60, shortBreak: 5 * 60, longBreak: 20 * 60 });

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
          if (activeTask) setFocusTask(activeTask.title);
      }
  }, [isActive, focusTask, tasks, setFocusTask]);

  // --- HANDLERS ---
  
  const handleStopClick = () => {
      const maxTime = mode === 'focus' ? timerSettings.focus : (mode === 'shortBreak' ? timerSettings.shortBreak : timerSettings.longBreak);
      if (timeLeft < maxTime && timeLeft > 0) {
          setShowEarlyExitModal(true);
      } else {
          resetTimer();
      }
  };

  const handleEarlyExit = async (action: 'save' | 'discard' | 'resume') => {
      setShowEarlyExitModal(false);
      if (action === 'resume') return;
      
      if (action === 'save') {
          await stopSessionEarly(true);
      } else {
          await stopSessionEarly(false);
      }
  };

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
  const bgTransition = isFocus ? 'bg-pink-500' : 'bg-cyan-600';

  const incompleteTasks = tasks.filter(t => !t.completed).slice(0, 5);

  const handleInputChange = (field: keyof TimerSettings, value: string) => {
      const parsed = parseInt(value);
      if (!isNaN(parsed) && parsed >= 0) {
          setCustomForm(prev => ({...prev, [field]: parsed * 60}));
      }
  };

  const handleCustomSave = (e: React.FormEvent) => {
      e.preventDefault();
      setCustomSettings(customForm);
      setPreset('custom');
      setIsCustomModalOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-100px)] w-full flex flex-col relative overflow-hidden font-sans transition-colors duration-1000">
      
      {/* Background Ambience */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-10 dark:opacity-20 pointer-events-none transition-colors duration-1000 ${bgTransition}`}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-7xl mx-auto p-4 md:p-6 z-10 flex-1 h-full items-stretch">
        
        {/* LEFT: VITALS & STATS (Refined Width) */}
        <div className="lg:col-span-3 flex flex-col h-full order-2 lg:order-1 min-h-[400px]">
            <PomodoroStats />
        </div>

        {/* CENTER: THE RING */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2 py-8 lg:py-0 relative">
            <div className="relative group cursor-pointer" onClick={toggleTimer}>
                {/* Outer Glow Ring */}
                <div className={`absolute inset-0 rounded-full border-[1px] opacity-10 transform scale-110 pointer-events-none ${isFocus ? 'border-pink-500' : 'border-cyan-500'}`}></div>
                {/* Pulse Ring */}
                <div className={`absolute inset-0 rounded-full border-4 opacity-20 pointer-events-none transition-colors duration-500 ${isActive ? 'animate-ping' : ''} ${isFocus ? 'border-pink-500' : 'border-cyan-500'}`}></div>

                <svg width="340" height="340" className="transform -rotate-90 drop-shadow-2xl">
                    <circle cx="170" cy="170" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                    <circle 
                        cx="170" cy="170" r={radius} 
                        stroke={strokeColor} 
                        strokeWidth="16" 
                        fill="transparent" 
                        strokeLinecap="round" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset} 
                        className={`transition-all duration-300 ease-linear ${isActive ? isFocus ? 'drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]' : 'drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]' : ''}`}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <span className={`text-7xl md:text-8xl font-mono font-black tracking-tighter tabular-nums drop-shadow-lg text-slate-800 dark:text-white`}>
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
                    onClick={handleStopClick} 
                    className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all active:scale-95"
                    title="Stop Session"
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

        {/* RIGHT: MISSION CONTROL (Presets, Task, Media) */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-3 h-full">
             
             {/* 1. Timer Presets */}
             <div className="bg-white/80 dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm backdrop-blur-md">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Layers size={12} /> Presets</h3>
                    <button onClick={() => setIsCustomModalOpen(true)} className="text-pink-500 hover:text-pink-600"><Settings size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {(['micro', 'classic', 'long', 'custom'] as PresetName[]).map((p) => (
                        <button 
                            key={p}
                            onClick={() => {
                                if (p === 'custom' && activePreset === 'custom') setIsCustomModalOpen(true);
                                else setPreset(p);
                            }}
                            className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                activePreset === p 
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-md scale-105' 
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            {p === 'micro' ? '15/5' : p === 'classic' ? '25/5' : p === 'long' ? '50/10' : 'Custom'}
                        </button>
                    ))}
                </div>
             </div>

             {/* 2. Focus Target */}
             <div className="bg-white/80 dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm backdrop-blur-md flex-1 min-h-[100px] flex flex-col">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2"><Brain size={12} /> Target</h3>
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        value={focusTask}
                        onChange={(e) => setFocusTask(e.target.value)}
                        onFocus={() => setShowTaskDropdown(true)}
                        onBlur={() => setTimeout(() => setShowTaskDropdown(false), 200)}
                        placeholder="Study Topic..."
                        className="w-full h-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all resize-none"
                    />
                    {showTaskDropdown && incompleteTasks.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                            {incompleteTasks.map(t => (
                                <button key={t.id} onClick={() => setFocusTask(t.title)} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-pink-900/20 truncate border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                                    {t.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
             </div>

             {/* 3. Session Goal */}
             <div className="bg-white/80 dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm backdrop-blur-md">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Target size={12} /> Goal</h3>
                    <span className="text-xs font-bold text-pink-500">{sessionsCompleted}/{sessionGoal}</span>
                </div>
                <input 
                    type="range" min="1" max="12" step="1"
                    value={sessionGoal}
                    onChange={(e) => setSessionGoal(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
             </div>

             {/* 4. Media Controls & PiP */}
             <div className="grid grid-cols-2 gap-3">
                <button onClick={toggleBrownNoise} className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${isBrownNoiseOn ? 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-[#0B1221] border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                    <Waves size={20} className={isBrownNoiseOn ? 'animate-pulse' : ''} />
                    <span className="text-[9px] font-bold uppercase">Brown Noise</span>
                </button>
                <button onClick={togglePiP} className="p-3 rounded-2xl bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-pink-500 hover:border-pink-500/50 flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md">
                    <MonitorPlay size={20} />
                    <span className="text-[9px] font-bold uppercase">Mini Mode</span>
                </button>
             </div>

             {/* 5. Video Anchor (Critical for GlobalYoutubePlayer) */}
             <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 relative group">
                 <div className="absolute top-2 left-2 z-20 bg-black/60 px-2 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="flex items-center gap-1 text-[9px] font-bold text-white uppercase"><Music size={10} /> Focus Cam</div>
                 </div>
                 <div id="video-anchor" className="w-full h-full bg-slate-900 relative flex items-center justify-center text-slate-700">
                     {/* The iframe from GlobalYoutubePlayer will overlay this div precisely */}
                     <span className="text-[9px] font-mono tracking-widest uppercase">Video Feed</span>
                 </div>
             </div>
        </div>
      </div>

      {/* --- EARLY EXIT MODAL --- */}
      {showEarlyExitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setShowEarlyExitModal(false)}>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-white/20 relative animate-zoom-in" onClick={e => e.stopPropagation()}>
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 text-yellow-600 dark:text-yellow-400">
                          <AlertTriangle size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">End Session Early?</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">
                          You still have time left. Ending now will stop the timer.
                      </p>
                      
                      <div className="flex flex-col gap-3 w-full">
                          <button 
                              onClick={() => handleEarlyExit('save')}
                              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                          >
                              <Save size={18} /> Complete & Save Progress
                          </button>
                          <button 
                              onClick={() => handleEarlyExit('discard')}
                              className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-500 rounded-xl font-bold flex items-center justify-center gap-2"
                          >
                              <X size={18} /> Discard Session
                          </button>
                          <button 
                              onClick={() => handleEarlyExit('resume')}
                              className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 hover:text-slate-600 dark:hover:text-white"
                          >
                              Resume Timer
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- BREAK MODAL (Cat) --- */}
      {showBreakModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={() => setShowBreakModal(false)}>
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-white/20 relative flex flex-col items-center text-center animate-zoom-in" onClick={e => e.stopPropagation()}>
                  <AnimatedCat />
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-6 mb-2">Pause & Breathe</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">You've earned this moment. Recharge.</p>
                  <button onClick={() => { setShowBreakModal(false); toggleTimer(); }} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg transform active:scale-95 transition-transform">Start Break</button>
                  <button onClick={() => { setShowBreakModal(false); skipForward(); }} className="text-xs text-slate-400 font-bold uppercase mt-4 hover:text-slate-600 dark:hover:text-white">Skip Rest</button>
              </div>
          </div>
      )}

      {/* --- GOAL COMPLETION MODAL --- */}
      {showGoalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setShowGoalModal(false)}>
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-white/20 relative flex flex-col items-center text-center animate-zoom-in overflow-hidden" onClick={e => e.stopPropagation()}>
                  {/* Glow Effect */}
                  <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-400/20 to-transparent pointer-events-none"></div>
                  
                  <div className="w-24 h-24 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mb-6 relative z-10 animate-bounce">
                      <Trophy size={48} className="text-amber-500" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 relative z-10">Goal Crushed!</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 relative z-10">
                      You finished your session goal. Excellent work!
                  </p>
                  
                  <button onClick={() => setShowGoalModal(false)} className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30 transform active:scale-95 transition-transform relative z-10">
                      Awesome
                  </button>
              </div>
          </div>
      )}

      {/* --- CUSTOM TIMER MODAL --- */}
      {isCustomModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-white/20 relative">
                  <button onClick={() => setIsCustomModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Settings className="text-pink-500" /> Configure Timer</h3>
                  <form onSubmit={handleCustomSave} className="space-y-5">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Focus (Minutes)</label>
                          <input type="number" value={Math.floor(customForm.focus / 60) || ''} onChange={(e) => handleInputChange('focus', e.target.value)} className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-lg font-bold text-slate-800 dark:text-white" min="1" max="120" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Short Break</label>
                              <input type="number" value={Math.floor(customForm.shortBreak / 60) || ''} onChange={(e) => handleInputChange('shortBreak', e.target.value)} className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-lg font-bold text-slate-800 dark:text-white" min="1" max="30" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Long Break</label>
                              <input type="number" value={Math.floor(customForm.longBreak / 60) || ''} onChange={(e) => handleInputChange('longBreak', e.target.value)} className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-lg font-bold text-slate-800 dark:text-white" min="1" max="60" />
                          </div>
                      </div>
                      <button type="submit" className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg mt-4"><Save size={18} className="inline mr-2" /> Save & Apply</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Pomodoro;
