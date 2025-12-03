
import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Waves, Pencil, Coffee, Zap, Brain, Settings, ListTodo, ChevronDown, ExternalLink } from 'lucide-react';
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

  // --- PREMIUM THEME ENGINE ---
  const getTheme = () => {
    switch (mode) {
      case 'pomodoro':
        return {
          bg: 'from-slate-900 to-slate-950',
          ringColor: 'text-pink-500',
          glow: 'drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]',
          textAccent: 'text-pink-500',
          buttonGradient: 'bg-gradient-to-r from-pink-500 to-rose-600 shadow-[0_0_30px_rgba(236,72,153,0.4)]',
          icon: <Brain size={24} className="text-pink-500" />
        };
      case 'shortBreak':
        return {
          bg: 'from-slate-900 to-slate-950',
          ringColor: 'text-teal-400',
          glow: 'drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]',
          textAccent: 'text-teal-400',
          buttonGradient: 'bg-gradient-to-r from-teal-400 to-emerald-500 shadow-[0_0_30px_rgba(45,212,191,0.4)]',
          icon: <Coffee size={24} className="text-teal-400" />
        };
      case 'longBreak':
        return {
          bg: 'from-slate-900 to-slate-950',
          ringColor: 'text-indigo-500',
          glow: 'drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]',
          textAccent: 'text-indigo-500',
          buttonGradient: 'bg-gradient-to-r from-indigo-500 to-violet-600 shadow-[0_0_30px_rgba(99,102,241,0.4)]',
          icon: <Zap size={24} className="text-indigo-500" />
        };
      default:
        return {
          bg: 'from-slate-900 to-slate-950',
          ringColor: 'text-white',
          glow: 'drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]',
          textAccent: 'text-white',
          buttonGradient: 'bg-slate-700',
          icon: <Settings size={24} />
        };
    }
  };

  const theme = getTheme();

  // --- SVG LOGIC ---
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / initialTime;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className={`w-full min-h-[calc(100vh-140px)] rounded-[3rem] relative flex flex-col items-center justify-center p-8 lg:p-12 overflow-hidden bg-gradient-to-br ${theme.bg} shadow-2xl border border-slate-800 transition-all duration-700`}>
      
      {/* Dynamic Ambient Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-b ${mode === 'pomodoro' ? 'from-pink-500/10' : mode === 'shortBreak' ? 'from-teal-500/10' : 'from-indigo-500/10'} to-transparent rounded-full blur-[100px] pointer-events-none opacity-50`}></div>

      {/* --- MAIN GRID --- */}
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* LEFT COLUMN: TIMER UI */}
        <div className="flex flex-col items-center">
            
            {/* Task Input */}
            <div className="mb-10 w-full max-w-md relative group">
                <input 
                    type="text"
                    value={focusTask}
                    onChange={(e) => setFocusTask(e.target.value)}
                    placeholder="What is your main focus?"
                    className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl py-4 pl-12 pr-12 text-center font-medium text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all shadow-inner"
                />
                <Pencil className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <button 
                  onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <ListTodo size={18} />
                </button>
                
                {/* Task Dropdown */}
                {showTaskDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-30 animate-in fade-in zoom-in-95">
                     <div className="p-3 bg-slate-900/50 border-b border-slate-700">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Task</p>
                     </div>
                     <div className="max-h-60 overflow-y-auto">
                        {todaysTasks.length === 0 ? (
                           <div className="p-4 text-center text-slate-500 text-sm">No tasks for today.</div>
                        ) : (
                           todaysTasks.map(task => (
                              <button
                                key={task.id}
                                onClick={() => { setFocusTask(task.title); setShowTaskDropdown(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm text-slate-200 border-b border-slate-700 last:border-0"
                              >
                                 {task.title}
                              </button>
                           ))
                        )}
                     </div>
                  </div>
                )}
            </div>

            {/* THE TIMER RING */}
            <div className="relative mb-12 group cursor-pointer select-none" onClick={toggleTimer}>
                {/* Glow Container */}
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${theme.bg.includes('pink') ? 'bg-pink-500' : 'bg-white'}`}></div>
                
                <svg width="360" height="360" className={`transform -rotate-90 transition-all duration-700 ${theme.glow}`}>
                    {/* Background Track */}
                    <circle 
                        cx="180" cy="180" r={radius} 
                        fill="transparent" 
                        stroke="currentColor"
                        className="text-slate-800 opacity-50"
                        strokeWidth="6" 
                    />
                    {/* Progress Path */}
                    <circle 
                        cx="180" cy="180" r={radius} 
                        fill="transparent" 
                        className={`transition-all duration-1000 ease-linear ${theme.ringColor}`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                    />
                </svg>
                
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-8xl font-mono font-black tracking-tighter tabular-nums leading-none">
                        {formatTime(timeLeft)}
                    </span>
                    <div className={`flex items-center gap-2 mt-4 uppercase tracking-[0.2em] text-sm font-bold opacity-80 ${theme.textAccent}`}>
                        {theme.icon}
                        <span>{isActive ? 'FOCUSING' : 'PAUSED'}</span>
                    </div>
                </div>
            </div>

            {/* Custom Time Control */}
            {mode === 'custom' && !isActive && (
               <div className="mb-8 w-full max-w-xs animate-in slide-in-from-top-4">
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                      <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-4">
                          <span>Set Duration</span>
                          <span className="text-white">{customTime} min</span>
                      </div>
                      <input 
                        type="range" min="1" max="180" 
                        value={customTime} 
                        onChange={(e) => setCustomTimeValue(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white mb-4"
                      />
                  </div>
               </div>
            )}

            {/* Controls Row */}
            <div className="flex items-center gap-8">
                <button 
                    onClick={resetTimer}
                    className="p-5 rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95"
                >
                    <RotateCcw size={22} />
                </button>

                <button 
                    onClick={toggleTimer}
                    className={`h-24 w-24 rounded-[2.5rem] flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 ${theme.buttonGradient}`}
                >
                    {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1"/>}
                </button>

                <button 
                    onClick={toggleMute}
                    className="p-5 rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95"
                >
                    {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
            </div>

            {/* Modes */}
            <div className="flex gap-2 mt-12 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
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
                        ? 'bg-slate-800 text-white shadow-lg shadow-black/20' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                     }`}
                   >
                     {m.label}
                   </button>
                ))}
            </div>

            <button 
                onClick={toggleBrownNoise}
                className={`mt-6 flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                    isPlayingNoise 
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' 
                    : 'border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
            >
                <Waves size={14} className={isPlayingNoise ? 'animate-bounce' : ''} />
                {isPlayingNoise ? 'Brown Noise ON' : 'Brown Noise OFF'}
            </button>

        </div>

        {/* RIGHT COLUMN: VIDEO ANCHOR & INFO */}
        <div className="h-full flex flex-col justify-center animate-fade-in-up delay-100">
            
            {/* 
                THE VIDEO ANCHOR
                This is where the GlobalYoutubePlayer PORTALS the video 
                when we are on this page.
            */}
            <div 
                id="video-anchor" 
                className="w-full aspect-video bg-black rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative group"
            >
               {/* Fallback content if Portal is active elsewhere */}
               <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                  <div className="text-center">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-50">Player Active in Pop-out</span>
                  </div>
               </div>
            </div>

            <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                        <Zap size={16} className="text-yellow-500 fill-yellow-500" /> Pro Tip
                    </h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                   Want to study while reading a PDF? Click "Pop Out" to float the timer over your other apps. The music will keep playing here.
                </p>
            </div>
        </div>

      </div>

      {/* --- BREAK MODAL (Glassmorphism) --- */}
      {showBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" />
            
            <div className="relative bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-[0_0_50px_rgba(236,72,153,0.3)] max-w-md w-full text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
                    <Coffee size={40} className="text-white" />
                </div>
                
                <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">Time's Up!</h2>
                <p className="text-slate-400 text-lg mb-8 font-medium">
                    Session complete. Take a breath.
                </p>

                <button 
                    onClick={() => {
                        stopAlarm();
                        setShowBreakModal(false);
                        switchMode(mode === 'pomodoro' ? 'shortBreak' : 'pomodoro');
                    }}
                    className={`w-full py-4 rounded-2xl text-white font-bold text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all ${theme.buttonGradient}`}
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
