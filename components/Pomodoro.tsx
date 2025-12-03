
import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, 
  Waves, Coffee, Zap, Brain, Maximize2, 
  ListTodo, ChevronRight, Settings 
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

  // --- CALCULATE PROGRESS FOR CONIC GRADIENT ---
  const progressPercent = (timeLeft / initialTime) * 100;
  
  // Helper to trigger PiP in the persistent GlobalPlayer
  const triggerPiP = () => {
    window.dispatchEvent(new CustomEvent('open-pip'));
  };

  // Get tasks for dropdown
  const todaysTasks = tasks.filter(t => !t.completed && t.start && isSameDay(new Date(t.start), new Date()));

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- DYNAMIC THEME COLORS ---
  const getModeColors = () => {
    switch (mode) {
      case 'pomodoro': return {
        primary: 'text-pink-500',
        gradient: 'from-pink-500 to-rose-600',
        glow: 'shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)]',
        bgGradient: 'from-pink-500/10 via-transparent to-transparent',
        icon: <Brain size={18} />
      };
      case 'shortBreak': return {
        primary: 'text-emerald-400',
        gradient: 'from-emerald-400 to-teal-500',
        glow: 'shadow-[0_0_40px_-10px_rgba(52,211,153,0.5)]',
        bgGradient: 'from-emerald-500/10 via-transparent to-transparent',
        icon: <Coffee size={18} />
      };
      case 'longBreak': return {
        primary: 'text-cyan-400',
        gradient: 'from-cyan-400 to-blue-500',
        glow: 'shadow-[0_0_40px_-10px_rgba(34,211,238,0.5)]',
        bgGradient: 'from-cyan-500/10 via-transparent to-transparent',
        icon: <Zap size={18} />
      };
      default: return {
        primary: 'text-blue-400',
        gradient: 'from-blue-400 to-indigo-500',
        glow: 'shadow-none',
        bgGradient: '',
        icon: <Settings size={18} />
      };
    }
  };

  const colors = getModeColors();

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-4 lg:p-8 animate-fade-in">
      
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* --- LEFT COLUMN: TIMER UI --- */}
        <div className="flex flex-col items-center justify-center relative">
            
            {/* Background Ambient Glow */}
            <div className={`absolute inset-0 bg-gradient-to-tr ${colors.bgGradient} blur-[100px] rounded-full opacity-40 pointer-events-none`}></div>

            {/* HEADER INPUT (Focus Task) */}
            <div className="relative z-10 w-full max-w-md mb-12 group text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${colors.primary} bg-white/5 px-3 py-1 rounded-full border border-white/5`}>
                        Current Focus
                    </span>
                </div>
                
                <div className="relative inline-block w-full">
                    <input 
                        type="text"
                        value={focusTask}
                        onChange={(e) => setFocusTask(e.target.value)}
                        placeholder="Enter task here..."
                        className="w-full bg-transparent text-center text-3xl md:text-4xl font-bold text-white placeholder-white/20 focus:outline-none focus:placeholder-white/10 transition-all font-sans"
                    />
                    {/* Underline Animation */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:w-1/2 group-focus-within:w-full transition-all duration-500"></div>
                    
                    <button 
                        onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <ListTodo size={20} />
                    </button>
                </div>

                {/* Dropdown */}
                {showTaskDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-[#0F1629] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-30 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                     <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                        {todaysTasks.length === 0 ? (
                           <div className="p-4 text-center text-sm text-slate-500">No pending tasks for today.</div>
                        ) : (
                           todaysTasks.map(task => (
                              <button
                                key={task.id}
                                onClick={() => { setFocusTask(task.title); setShowTaskDropdown(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl text-sm text-slate-200 flex items-center justify-between group/item transition-colors"
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

            {/* --- THE TIMER --- */}
            {pipWindow ? (
                <div className="w-[340px] h-[340px] rounded-full bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-400 backdrop-blur-sm">
                    <Maximize2 size={48} className="mb-4 opacity-50 animate-pulse" />
                    <span className="text-sm font-bold uppercase tracking-widest">Active in PiP</span>
                    <button onClick={triggerPiP} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-bold text-white transition-colors">
                        Restore View
                    </button>
                </div>
            ) : (
                <div className="relative mb-12 cursor-pointer group select-none" onClick={toggleTimer}>
                    {/* 1. Outer Glow Ring */}
                    <div className={`absolute inset-0 rounded-full ${colors.glow} opacity-60 transition-opacity duration-700`}></div>

                    {/* 2. Base Track */}
                    <div className="w-[340px] h-[340px] rounded-full bg-[#0F1629] border-[12px] border-[#1E293B] shadow-2xl"></div>

                    {/* 3. Conic Gradient Progress Ring */}
                    {/* Using CSS Conic Gradient + Mask for a perfect ring */}
                    <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `conic-gradient(from 0deg, ${mode === 'pomodoro' ? '#ec4899' : mode === 'shortBreak' ? '#34d399' : '#22d3ee'} ${progressPercent}%, transparent 0%)`,
                            maskImage: 'radial-gradient(closest-side, transparent 78%, black 80%)',
                            WebkitMaskImage: 'radial-gradient(closest-side, transparent 78%, black 80%)',
                            transform: 'rotate(180deg) scaleX(-1)', // Start from top
                            transition: 'background 0.5s linear'
                        }}
                    ></div>

                    {/* 4. Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <span className={`text-[6.5rem] leading-none font-mono font-bold tracking-tighter text-white drop-shadow-2xl`}>
                            {formatTime(timeLeft)}
                        </span>
                        <div className={`flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-slate-300 backdrop-blur-md`}>
                            {colors.icon}
                            <span>{isActive ? 'Focusing' : 'Paused'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Time Slider */}
            {mode === 'custom' && !isActive && !pipWindow && (
               <div className="w-full max-w-[260px] mb-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">
                     <span>1m</span>
                     <span className="text-white">{customTime} min</span>
                     <span>180m</span>
                  </div>
                  <input 
                    type="range" min="1" max="180" 
                    value={customTime} 
                    onChange={(e) => setCustomTimeValue(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:accent-pink-400 transition-colors"
                  />
               </div>
            )}

            {/* CONTROLS */}
            <div className="flex items-center gap-6 z-10">
                <button 
                    onClick={resetTimer}
                    className="p-4 rounded-2xl bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95"
                    title="Reset Timer"
                >
                    <RotateCcw size={20} />
                </button>

                <button 
                    onClick={toggleTimer}
                    className={`p-6 rounded-3xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all hover:scale-105 active:scale-95 text-white flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${colors.gradient}`}
                >
                    <div className="absolute inset-0 bg-white/20 blur-md opacity-0 hover:opacity-100 transition-opacity"></div>
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1"/>}
                </button>

                <button 
                    onClick={toggleMute}
                    className="p-4 rounded-2xl bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95"
                    title={isMuted ? "Unmute" : "Mute Alarm"}
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* POP OUT TOGGLE (Hidden in PiP) */}
            {!pipWindow && (
                 <button 
                    onClick={triggerPiP}
                    className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors group"
                >
                    <Maximize2 size={14} className="group-hover:scale-110 transition-transform"/>
                    <span>Pop Out Timer</span>
                </button>
            )}

            {/* MODE TABS */}
            <div className="flex p-1 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/5 mt-10">
                {[
                  { id: 'pomodoro', label: 'Focus' },
                  { id: 'shortBreak', label: 'Short Break' },
                  { id: 'longBreak', label: 'Long Break' },
                  { id: 'custom', label: 'Custom' }
                ].map((m) => (
                   <button
                     key={m.id}
                     onClick={() => switchMode(m.id as TimerMode)}
                     className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                        mode === m.id 
                        ? 'bg-white/10 text-white shadow-lg shadow-black/20' 
                        : 'text-slate-500 hover:text-slate-300'
                     }`}
                   >
                     {m.label}
                   </button>
                ))}
            </div>

            {/* BROWN NOISE TOGGLE */}
             <button 
                onClick={toggleBrownNoise}
                className={`mt-6 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                    isPlayingNoise 
                    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' 
                    : 'text-slate-600 border-transparent hover:text-slate-400'
                }`}
            >
                <Waves size={14} className={isPlayingNoise ? 'animate-bounce' : ''} />
                {isPlayingNoise ? 'Brown Noise Active' : 'Enable Brown Noise'}
            </button>
        </div>

        {/* --- RIGHT COLUMN: VIDEO ANCHOR --- */}
        <div className="flex flex-col h-full justify-center relative">
             <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 backdrop-blur-sm">
                 {/* This ID is used by GlobalYoutubePlayer to portal/snap the video here */}
                 <div 
                    id="video-anchor" 
                    className="w-full h-full flex items-center justify-center"
                 >
                    <div className="flex flex-col items-center gap-3 text-slate-600">
                        <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-slate-400 animate-spin"></div>
                        <span className="text-xs font-medium uppercase tracking-widest">Loading Player...</span>
                    </div>
                 </div>
             </div>

             <div className="mt-8 bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
                 <div className="flex items-center gap-2 mb-3">
                    <Zap size={16} className="text-yellow-400 fill-current" />
                    <h3 className="font-bold text-white text-sm">Pro Tip</h3>
                 </div>
                 <p className="text-xs text-slate-400 leading-relaxed">
                    The music player is persistent. If you navigate to the <strong>Dashboard</strong> or <strong>Planner</strong>, the video will automatically minimize to a floating widget so your audio never stops.
                 </p>
             </div>
        </div>

      </div>

      {/* --- TIME'S UP MODAL --- */}
      {showBreakModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in" />
            
            <div className="relative bg-[#0F1629] border border-white/10 p-10 rounded-[2rem] shadow-[0_0_100px_rgba(236,72,153,0.3)] max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
                {/* Glow Effect */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-pink-500 rounded-full blur-[80px] opacity-40 pointer-events-none"></div>

                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Time's Up!</h2>
                <p className="text-slate-400 text-sm mb-8 font-medium">
                    Great session. Ready for the next step?
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
                        className="py-3 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
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
