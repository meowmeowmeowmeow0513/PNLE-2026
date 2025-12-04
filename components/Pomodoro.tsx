
import React, { useEffect, useState, useRef } from 'react';
import { 
    Play, Pause, RotateCcw, Waves, MonitorPlay, 
    Brain, Target, Music, Settings, X, Save, Trophy, SkipForward, Layers, AlertTriangle, Zap, Coffee
} from 'lucide-react';
import { usePomodoro, PresetName, TimerSettings, TimerMode } from './PomodoroContext';
import { useTasks } from '../TaskContext';
import { isWithinInterval } from 'date-fns';
import confetti from 'canvas-confetti';
import PomodoroStats from './PomodoroStats';

// --- ANIMATED CAT COMPONENT (Dynamic State) ---
interface AnimatedCatProps {
    variant?: 'sleeping' | 'awake' | 'waiting';
}

const AnimatedCat: React.FC<AnimatedCatProps> = ({ variant = 'awake' }) => (
  <div className="relative w-full h-full flex items-center justify-center">
    <svg viewBox="0 0 200 200" className="w-40 h-40 drop-shadow-xl overflow-visible">
      <defs>
        <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDF2F8" />
          <stop offset="100%" stopColor="#FBCFE8" />
        </linearGradient>
      </defs>
      <style>
        {`
          @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
          @keyframes bounce-happy { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
          @keyframes blink-soft { 0%, 45%, 55%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.1); } }
          @keyframes tail-wag { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
          @keyframes zzz { 0% { transform: translate(0, 0) scale(0.5); opacity: 0; } 50% { opacity: 1; } 100% { transform: translate(20px, -30px) scale(1.2); opacity: 0; } }
          
          .cat-body { transform-origin: center bottom; animation: ${variant === 'sleeping' ? 'breathe 4s ease-in-out infinite' : 'bounce-happy 2s ease-in-out infinite'}; }
          .cat-eye { transform-origin: center; transform-box: fill-box; animation: ${variant === 'awake' ? 'blink-soft 4s infinite' : 'none'}; }
          .cat-zzz { animation: zzz 3s linear infinite; }
        `}
      </style>
      
      {/* ZZZ Particles if Sleeping */}
      {variant === 'sleeping' && (
          <g className="text-slate-400 dark:text-slate-500 font-black text-2xl" style={{ transform: 'translate(130px, 60px)' }}>
              <text x="0" y="0" className="cat-zzz" style={{ animationDelay: '0s' }}>z</text>
              <text x="15" y="-15" className="cat-zzz" style={{ animationDelay: '1s' }}>z</text>
              <text x="30" y="-30" className="cat-zzz" style={{ animationDelay: '2s' }}>Z</text>
          </g>
      )}

      <g className="cat-body">
          {/* Ears */}
          <path d="M50 70 L40 20 L90 55 Z" fill="url(#catGradient)" stroke="#F9A8D4" strokeWidth="4" strokeLinejoin="round" />
          <path d="M150 70 L160 20 L110 55 Z" fill="url(#catGradient)" stroke="#F9A8D4" strokeWidth="4" strokeLinejoin="round" />
          
          {/* Head */}
          <ellipse cx="100" cy="110" rx="80" ry="65" fill="url(#catGradient)" stroke="#F9A8D4" strokeWidth="4" />
          
          {/* Face Elements */}
          {variant === 'sleeping' ? (
              // Sleeping Eyes
              <g stroke="#374151" strokeWidth="4" fill="none" strokeLinecap="round">
                  <path d="M55 105 Q65 115 75 105" />
                  <path d="M125 105 Q135 115 145 105" />
              </g>
          ) : (
              // Awake Eyes
              <g fill="#1F2937">
                  <ellipse cx="65" cy="100" rx="8" ry="10" className="cat-eye" />
                  <ellipse cx="135" cy="100" rx="8" ry="10" className="cat-eye" style={{ animationDelay: '0.2s' }} />
                  <circle cx="67" cy="96" r="3" fill="white" />
                  <circle cx="137" cy="96" r="3" fill="white" />
              </g>
          )}
          
          {/* Cheeks */}
          <circle cx="50" cy="120" r="10" fill="#F472B6" opacity="0.4" />
          <circle cx="150" cy="120" r="10" fill="#F472B6" opacity="0.4" />

          {/* Nose & Mouth */}
          <path d="M95 115 L105 115 L100 122 Z" fill="#EC4899" />
          <path d="M100 122 Q90 135 80 125 M100 122 Q110 135 120 125" fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

// --- FOCUS PET WIDGET ---
const FocusPet = () => {
    const { isActive, mode, timeLeft, timerSettings } = usePomodoro();
    
    // Calculate Energy Progress
    const totalTime = mode === 'focus' ? timerSettings.focus : 1; 
    const progress = Math.min(100, Math.max(0, ((totalTime - timeLeft) / totalTime) * 100));
    
    let variant: 'sleeping' | 'awake' | 'waiting' = 'waiting';
    let message = "Ready to focus?";
    let subtext = "I'll keep watch while you study.";

    if (isActive) {
        if (mode === 'focus') {
            variant = 'sleeping';
            message = "Shh... Focusing...";
            subtext = "Accumulating XP...";
        } else {
            variant = 'awake';
            message = "Yay! Break Time!";
            subtext = "Stretch and drink water!";
        }
    } else {
        if (mode === 'focus') {
            variant = 'waiting';
            message = "Ready when you are?";
            subtext = "Press play to start.";
        } else {
            variant = 'waiting';
            message = "Paused Break";
            subtext = "Don't rest too long!";
        }
    }

    return (
        <div className="flex-1 flex flex-col bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm relative overflow-hidden group min-h-[180px]">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex-1 relative z-10 flex flex-col items-center justify-center">
                <AnimatedCat variant={variant} />
                
                <div className="text-center mt-[-10px] relative z-20">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white transition-colors duration-300">{message}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{subtext}</p>
                </div>
            </div>

            {/* Focus Energy Bar */}
            <div className="mt-3 relative z-10">
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <span className="flex items-center gap-1"><Zap size={10} className="text-amber-400 fill-current" /> Focus Energy</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden border border-slate-100 dark:border-white/5">
                    <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

  const incompleteTasks = tasks.filter(t => !t.completed).slice(0, 50);

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
        
        {/* LEFT: STATS (Refined Width) */}
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

        {/* RIGHT: MISSION CONTROL (Compact Layout) */}
        <div className="lg:col-span-3 flex flex-col gap-3 order-3 h-full">
             
             {/* 1. Presets (Compact) */}
             <div className="bg-white/80 dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm backdrop-blur-md">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Layers size={10} /> Presets</h3>
                    <button onClick={() => setIsCustomModalOpen(true)} className="text-pink-500 hover:text-pink-600"><Settings size={12} /></button>
                </div>
                <div className="grid grid-cols-4 gap-1">
                    {(['micro', 'classic', 'long', 'custom'] as PresetName[]).map((p) => (
                        <button 
                            key={p}
                            onClick={() => {
                                if (p === 'custom' && activePreset === 'custom') setIsCustomModalOpen(true);
                                else setPreset(p);
                            }}
                            className={`py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wide transition-all border ${
                                activePreset === p 
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-sm' 
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            {p === 'micro' ? '15/5' : p === 'classic' ? '25/5' : p === 'long' ? '50/10' : 'Cust'}
                        </button>
                    ))}
                </div>
             </div>

             {/* 2. Target & Goal (Combined for space) */}
             <div className="relative z-50">
                 {/* Target Input */}
                 <div className="bg-white/80 dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm backdrop-blur-md mb-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-2"><Brain size={10} /> Target</h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={focusTask}
                            onChange={(e) => setFocusTask(e.target.value)}
                            onFocus={() => setShowTaskDropdown(true)}
                            onBlur={() => setTimeout(() => setShowTaskDropdown(false), 200)}
                            placeholder="What are you working on?"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                        />
                        {/* Absolute Dropdown */}
                        {showTaskDropdown && incompleteTasks.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[100] max-h-48 overflow-y-auto custom-scrollbar p-1">
                                {incompleteTasks.map(t => (
                                    <button key={t.id} onClick={() => setFocusTask(t.title)} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-pink-900/20 truncate rounded-lg transition-colors mb-0.5 last:mb-0">
                                        {t.title}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                 </div>

                 {/* Goal Slider (Compact) */}
                 <div className="bg-white/80 dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm backdrop-blur-md relative z-10">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Target size={10} /> Goal</h3>
                        <span className="text-[10px] font-bold text-pink-500">{sessionsCompleted}/{sessionGoal}</span>
                    </div>
                    <input 
                        type="range" min="1" max="12" step="1"
                        value={sessionGoal}
                        onChange={(e) => setSessionGoal(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                 </div>
             </div>

             {/* 3. Media Controls (Compact) */}
             <div className="grid grid-cols-2 gap-2">
                <button onClick={toggleBrownNoise} className={`py-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${isBrownNoiseOn ? 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'bg-white dark:bg-[#0B1221] border-slate-200 dark:border-slate-800 text-slate-500 hover:border-indigo-300'}`}>
                    <Waves size={16} className={isBrownNoiseOn ? 'animate-pulse' : ''} />
                    <span className="text-[9px] font-bold uppercase">{isBrownNoiseOn ? 'Noise On' : 'No Sound'}</span>
                </button>
                <button onClick={togglePiP} className="py-2 rounded-xl bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-pink-500 hover:border-pink-500/50 flex flex-col items-center justify-center gap-1 transition-all shadow-sm">
                    <MonitorPlay size={16} />
                    <span className="text-[9px] font-bold uppercase">Mini Mode</span>
                </button>
             </div>

             {/* 4. FOCUS COMPANION PET (Fills space) */}
             <FocusPet />

             {/* 5. Video Anchor */}
             <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 relative group shrink-0">
                 <div className="absolute top-2 left-2 z-20 bg-black/60 px-2 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="flex items-center gap-1 text-[9px] font-bold text-white uppercase"><Music size={10} /> Focus Cam</div>
                 </div>
                 <div id="video-anchor" className="w-full h-full bg-slate-900 relative flex items-center justify-center text-slate-700">
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
                  <div className="w-32 h-32 mb-4">
                      <AnimatedCat variant="awake" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-2 mb-2 tracking-tight">Let's Rest!</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">You've earned this moment. Breathe.</p>
                  <button onClick={() => { setShowBreakModal(false); toggleTimer(); }} className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg transform active:scale-95 transition-transform">Start Break</button>
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
