
import React, { useState } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, 
  Waves, Maximize2, Coffee, Zap, Brain, ListTodo 
} from 'lucide-react';
import { usePomodoro, TimerMode } from './PomodoroContext';

const Pomodoro: React.FC = () => {
  const { 
    mode, timeLeft, initialTime, isActive, customTime, isMuted,
    focusTask, isPlayingNoise, pipWindow,
    toggleTimer, resetTimer, switchMode, setCustomTimeValue,
    toggleMute, setFocusTask, toggleBrownNoise,
    showBreakModal, setShowBreakModal, stopAlarm
  } = usePomodoro();

  // --- VISUAL CONSTANTS ---
  const isFocus = mode === 'pomodoro' || mode === 'custom';
  
  // Theme Engine
  const theme = {
      bg: isFocus ? 'bg-[#020617]' : 'bg-[#0f172a]', // Deep Midnight vs Slate
      primary: isFocus ? 'text-pink-500' : 'text-cyan-400',
      glow: isFocus ? 'shadow-pink-500/50' : 'shadow-cyan-400/50',
      ring: isFocus ? '#ec4899' : '#22d3ee',
      accent: isFocus ? 'bg-pink-600' : 'bg-cyan-600',
      icon: isFocus ? <Brain size={24} /> : <Coffee size={24} />
  };

  // SVG Math
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((timeLeft / initialTime) * circumference);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const triggerPiP = () => {
    window.dispatchEvent(new CustomEvent('open-pip'));
  };

  return (
    <div className={`w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center transition-colors duration-1000 ${theme.bg}`}>
      
      {/* Background Ambient Glow */}
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-10 pointer-events-none ${isFocus ? 'bg-pink-600' : 'bg-cyan-600'}`}></div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-6 relative z-10">
        
        {/* --- LEFT COLUMN: IMMERSIVE TIMER --- */}
        <div className="flex flex-col items-center">
            
            {/* TASK COMMITMENT HEADER */}
            <div className="w-full max-w-lg mb-12 relative group">
                <input 
                    type="text" 
                    value={focusTask}
                    onChange={(e) => setFocusTask(e.target.value)}
                    placeholder="What is your main focus?"
                    disabled={isActive}
                    className={`w-full bg-transparent text-center text-3xl md:text-5xl font-black text-white placeholder-slate-700 focus:outline-none transition-all duration-500 ${
                        isActive ? 'opacity-100 scale-105 tracking-tight' : 'opacity-60 hover:opacity-100'
                    }`}
                />
                
                {/* Animated Underline */}
                <div className={`h-1 mx-auto mt-4 rounded-full transition-all duration-700 ${isActive ? `w-32 ${theme.accent} shadow-[0_0_20px_currentColor]` : 'w-0 bg-slate-800'}`}></div>
            </div>

            {/* --- THE NEON RING --- */}
            {pipWindow ? (
                // PiP Placeholder
                <div className="w-[320px] h-[320px] rounded-full border border-dashed border-slate-700 flex flex-col items-center justify-center gap-4 bg-white/5 animate-pulse">
                     <Maximize2 size={48} className="text-slate-500" />
                     <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Active in PiP</span>
                     <button onClick={triggerPiP} className="px-6 py-2 bg-slate-800 rounded-full text-xs font-bold text-white hover:bg-slate-700 transition-colors">
                        Return
                     </button>
                </div>
            ) : (
                <div className="relative mb-12 group">
                    {/* SVG */}
                    <svg width="360" height="360" className="transform -rotate-90 drop-shadow-2xl">
                        {/* Track */}
                        <circle
                            cx="180" cy="180" r={radius}
                            stroke="#1e293b"
                            strokeWidth="12"
                            fill="transparent"
                        />
                        {/* Progress */}
                        <circle
                            cx="180" cy="180" r={radius}
                            stroke={theme.ring}
                            strokeWidth="12"
                            fill="transparent"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className={`transition-[stroke-dashoffset] duration-300 ease-linear drop-shadow-[0_0_10px_${theme.ring}]`}
                        />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-8xl font-mono font-bold tracking-tighter text-white drop-shadow-2xl">
                            {formatTime(timeLeft)}
                        </span>
                        <div className={`mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest ${theme.primary}`}>
                            {theme.icon}
                            <span>{isActive ? 'RUNNING' : 'PAUSED'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CONTROLS DECK --- */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-3 flex items-center gap-6 shadow-2xl">
                <button onClick={resetTimer} className="p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                    <RotateCcw size={20} />
                </button>
                
                {/* Play Button with Glow */}
                <button 
                    onClick={toggleTimer}
                    className={`p-6 rounded-2xl text-white shadow-lg transform transition-all active:scale-95 ${isActive ? 'bg-amber-500 shadow-amber-500/40' : `${theme.accent} ${theme.glow}`}`}
                >
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>

                <button onClick={toggleMute} className="p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            {/* --- SECONDARY TOOLS --- */}
            <div className="mt-8 flex gap-4">
                {/* Mode Switcher */}
                <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                    {['pomodoro', 'shortBreak', 'longBreak'].map(m => (
                        <button
                            key={m}
                            onClick={() => switchMode(m as TimerMode)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                mode === m 
                                ? 'bg-white/10 text-white shadow-inner' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {m.replace(/([A-Z])/g, ' $1').trim()}
                        </button>
                    ))}
                    <button onClick={() => switchMode('custom')} className={`px-3 py-2 text-slate-500 hover:text-white ${mode === 'custom' ? 'text-white' : ''}`}>
                         <ListTodo size={14} />
                    </button>
                </div>

                {/* Brown Noise Toggle */}
                <button 
                    onClick={toggleBrownNoise}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                        isPlayingNoise 
                        ? 'bg-amber-900/20 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                        : 'bg-black/40 border-white/5 text-slate-500 hover:text-white'
                    }`}
                >
                    <Waves size={16} className={isPlayingNoise ? 'animate-pulse' : ''} />
                    <span className="text-xs font-bold uppercase">Brown Noise</span>
                </button>
                
                {/* PiP Button */}
                {!pipWindow && (
                    <button onClick={triggerPiP} className="p-2 rounded-xl bg-black/40 border border-white/5 text-slate-500 hover:text-white transition-colors">
                        <Maximize2 size={18} />
                    </button>
                )}
            </div>

            {/* Custom Slider */}
            {mode === 'custom' && (
                 <div className="w-64 mt-6 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>1m</span>
                        <span className="text-white">{customTime} min</span>
                        <span>180m</span>
                    </div>
                    <input 
                        type="range" min="1" max="180" 
                        value={customTime} 
                        onChange={(e) => setCustomTimeValue(Number(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                 </div>
            )}
        </div>

        {/* --- RIGHT COLUMN: THE ANCHOR --- */}
        <div className="hidden lg:flex flex-col items-center justify-center h-full">
            <div className="w-full aspect-video bg-black/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative group">
                {/* The Video Anchor ID */}
                <div id="video-anchor" className="w-full h-full"></div>
                
                {/* Empty State / Loading */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Video Player Loading...</span>
                </div>
            </div>
            
            <div className="mt-8 p-6 bg-white/5 border border-white/5 rounded-2xl max-w-md backdrop-blur-sm">
                <div className="flex items-center gap-2 text-yellow-500 mb-2">
                    <Zap size={16} fill="currentColor" />
                    <span className="text-sm font-bold text-white">Pro Tip</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                    When you leave this tab, the music player will seamlessly transform into a 
                    <span className="text-white font-bold"> Floating Widget</span> so your flow stays uninterrupted.
                </p>
            </div>
        </div>

      </div>

      {/* --- BREAK MODAL (Glassmorphism Overlay) --- */}
      {showBreakModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Blur Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl animate-in fade-in duration-700"></div>
            
            <div className="relative bg-[#0f172a] border border-white/10 p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-500">
                {/* Ambient Glow */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-pink-500 rounded-full blur-[80px] opacity-40 pointer-events-none"></div>

                <h2 className="text-5xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">Time's Up</h2>
                <p className="text-slate-400 text-sm mb-8 font-medium">
                    {mode === 'pomodoro' ? "Excellent work. Decompress now." : "Break is over. Let's get back to it."}
                </p>
                
                <div className="flex flex-col gap-3 relative z-10">
                    <button 
                        onClick={() => {
                            stopAlarm();
                            setShowBreakModal(false);
                            switchMode(mode === 'pomodoro' ? 'shortBreak' : 'pomodoro');
                        }}
                        className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    >
                        {mode === 'pomodoro' ? 'Start Break' : 'Start Focus'}
                    </button>
                    
                    <button 
                        onClick={() => {
                            stopAlarm();
                            setShowBreakModal(false);
                        }}
                        className="py-4 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
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
