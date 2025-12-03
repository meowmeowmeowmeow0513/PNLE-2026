import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Waves, Pencil, Coffee, Zap, Brain, Settings, ListTodo, ChevronDown } from 'lucide-react';
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
    toggleTimer, 
    resetTimer, 
    switchMode, 
    setCustomTimeValue,
    toggleMute,
    setFocusTask,
    toggleBrownNoise,
    showBreakModal,
    setShowBreakModal,
    stopAlarm
  } = usePomodoro();

  const { tasks } = useTasks();
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);

  // Get Today's Uncompleted Tasks for the Quick Picker
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

  // --- THEME ENGINE (Aligned Light & Dark Modes) ---
  const getTheme = () => {
    switch (mode) {
      case 'pomodoro':
        return {
          // Premium White / Deep Navy
          bg: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-pink-500/5',
          accent: 'text-pink-600 dark:text-pink-400',
          ring: 'stroke-pink-500',
          button: 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/30',
          icon: <Brain size={20} className="text-pink-500 dark:text-pink-400" />,
          text: 'text-slate-900 dark:text-white',
          subtext: 'text-slate-500 dark:text-slate-400',
          inputBg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400'
        };
      case 'shortBreak':
        return {
          bg: 'bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/50 shadow-xl shadow-teal-500/5',
          accent: 'text-teal-600 dark:text-teal-400',
          ring: 'stroke-teal-500',
          button: 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/30',
          icon: <Coffee size={20} className="text-teal-500 dark:text-teal-400" />,
          text: 'text-slate-900 dark:text-white',
          subtext: 'text-slate-500 dark:text-slate-400',
          inputBg: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-slate-900 dark:text-white placeholder-teal-400'
        };
      case 'longBreak':
        return {
          bg: 'bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 shadow-xl shadow-indigo-500/5',
          accent: 'text-indigo-600 dark:text-indigo-400',
          ring: 'stroke-indigo-500',
          button: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30',
          icon: <Zap size={20} className="text-indigo-500 dark:text-indigo-400" />,
          text: 'text-slate-900 dark:text-white',
          subtext: 'text-slate-500 dark:text-slate-400',
          inputBg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white placeholder-indigo-400'
        };
      case 'custom':
        return {
          bg: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl',
          accent: 'text-slate-600 dark:text-slate-300',
          ring: 'stroke-slate-500 dark:stroke-slate-400',
          button: 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 shadow-slate-500/30',
          icon: <Settings size={20} className="text-slate-500 dark:text-slate-400" />,
          text: 'text-slate-900 dark:text-white',
          subtext: 'text-slate-500 dark:text-slate-400',
          inputBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400'
        };
      default:
        return {
          bg: 'bg-slate-900',
          accent: 'text-white',
          ring: 'stroke-white',
          button: 'bg-slate-500',
          icon: <Brain size={20} />,
          text: 'text-white',
          subtext: 'text-slate-400',
          inputBg: 'bg-white/10'
        };
    }
  };

  const theme = getTheme();

  // --- CIRCULAR PROGRESS LOGIC ---
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / initialTime;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className={`w-full min-h-[calc(100vh-140px)] rounded-[2.5rem] relative flex flex-col items-center justify-center p-6 lg:p-12 transition-all duration-500 ease-in-out ${theme.bg}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 blur-3xl rounded-full"></div>
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* LEFT: TIMER & CONTROLS */}
        <div className="flex flex-col items-center animate-fade-in-up">
            
            {/* Focus Input & Quick Select */}
            <div className="mb-8 w-full max-w-md relative z-20">
                <div className="relative group">
                    <input 
                        type="text"
                        value={focusTask}
                        onChange={(e) => setFocusTask(e.target.value)}
                        placeholder="What is your main focus?"
                        className={`w-full rounded-2xl py-4 pl-12 pr-12 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all border ${theme.inputBg} focus:ring-current`}
                    />
                    <Pencil className={`absolute left-4 top-1/2 -translate-y-1/2 opacity-50 ${theme.text}`} size={18} />
                    
                    {/* Dropdown Trigger */}
                    <button 
                      onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all ${theme.text}`}
                      title="Select from Today's Tasks"
                    >
                      {showTaskDropdown ? <ChevronDown size={18} className="rotate-180 transition-transform" /> : <ListTodo size={18} />}
                    </button>
                </div>

                {/* Task Dropdown */}
                {showTaskDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2">
                     <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Tasks</p>
                     </div>
                     <div className="max-h-60 overflow-y-auto">
                        {todaysTasks.length === 0 ? (
                           <div className="p-4 text-center text-slate-400 text-sm italic">
                              No active tasks for today.
                           </div>
                        ) : (
                           todaysTasks.map(task => (
                              <button
                                key={task.id}
                                onClick={() => {
                                   setFocusTask(task.title);
                                   setShowTaskDropdown(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm font-medium text-slate-700 dark:text-slate-200 border-b border-slate-50 dark:border-slate-700/50 last:border-0 transition-colors"
                              >
                                 {task.title}
                              </button>
                           ))
                        )}
                     </div>
                  </div>
                )}
            </div>

            {/* SVG Timer Ring */}
            <div className="relative mb-10 group cursor-pointer select-none" onClick={toggleTimer}>
                <svg width="320" height="320" className="transform -rotate-90 filter drop-shadow-xl">
                    {/* Background Ring */}
                    <circle 
                        cx="160" cy="160" r={radius} 
                        fill="transparent" 
                        stroke="currentColor"
                        className="opacity-10 text-slate-400 dark:text-slate-600"
                        strokeWidth="8" 
                    />
                    {/* Progress Ring */}
                    <circle 
                        cx="160" cy="160" r={radius} 
                        fill="transparent" 
                        className={`transition-all duration-1000 ease-linear ${theme.ring}`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                    />
                </svg>
                
                {/* Timer Text */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center ${theme.text}`}>
                    <span className="text-7xl lg:text-8xl font-black font-mono tracking-tighter tabular-nums">
                        {formatTime(timeLeft)}
                    </span>
                    <div className="flex items-center gap-2 mt-2 uppercase tracking-widest text-sm font-bold opacity-60">
                        {theme.icon}
                        <span>{isActive ? 'Running' : 'Paused'}</span>
                    </div>
                </div>
            </div>

            {/* Custom Time Input (Only shows in Custom Mode) */}
            {mode === 'custom' && !isActive && (
               <div className="mb-10 w-full max-w-xs animate-in slide-in-from-top-4 fade-in">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                      <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Session Length</label>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{customTime} min</span>
                      </div>
                      
                      {/* Slider Control */}
                      <input 
                        type="range" 
                        min="1" 
                        max="180" 
                        value={customTime} 
                        onChange={(e) => setCustomTimeValue(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-600 dark:accent-white mb-4"
                      />

                      {/* Manual Input Group */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setCustomTimeValue(Math.max(1, customTime - 5))}
                          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-white font-bold transition-colors"
                        >-</button>
                        <div className="flex-1 relative">
                            <input 
                              type="number" 
                              value={customTime}
                              min="1"
                              max="180"
                              onChange={(e) => setCustomTimeValue(Number(e.target.value))}
                              className="w-full text-center py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
                            />
                        </div>
                        <button 
                          onClick={() => setCustomTimeValue(Math.min(180, customTime + 5))}
                          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-white font-bold transition-colors"
                        >+</button>
                      </div>
                      <p className="text-[10px] text-center mt-2 text-slate-400">Min: 1m • Max: 180m</p>
                  </div>
               </div>
            )}

            {/* Main Action Buttons */}
            <div className="flex items-center gap-8">
                <button 
                    onClick={resetTimer}
                    className={`p-5 rounded-full backdrop-blur-sm transition-all active:scale-95 border hover:scale-110 ${theme.inputBg} hover:shadow-lg`}
                    title="Reset Timer"
                >
                    <RotateCcw size={24} className={theme.subtext} />
                </button>

                <button 
                    onClick={toggleTimer}
                    className={`h-28 w-28 rounded-[2rem] flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-2xl ${theme.button}`}
                >
                    {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1"/>}
                </button>

                <button 
                    onClick={toggleMute}
                    className={`p-5 rounded-full backdrop-blur-sm transition-all active:scale-95 border hover:scale-110 ${theme.inputBg} hover:shadow-lg`}
                    title={isMuted ? "Unmute Alarm" : "Mute Alarm"}
                >
                    {isMuted ? <VolumeX size={24} className={theme.subtext} /> : <Volume2 size={24} className={theme.subtext} />}
                </button>
            </div>

            {/* Mode Switcher Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-12 bg-slate-100/50 dark:bg-black/20 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
                {[
                  { id: 'pomodoro', label: 'Focus' },
                  { id: 'shortBreak', label: 'Short Break' },
                  { id: 'longBreak', label: 'Long Break' },
                  { id: 'custom', label: 'Custom' }
                ].map((m) => (
                   <button
                     key={m.id}
                     onClick={() => switchMode(m.id as TimerMode)}
                     className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        mode === m.id 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md transform scale-105 ring-1 ring-black/5 dark:ring-white/10' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'
                     }`}
                   >
                     {m.label}
                   </button>
                ))}
            </div>
            
            <div className="mt-8">
                 <button 
                    onClick={toggleBrownNoise}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border ${
                        isPlayingNoise 
                        ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-200 shadow-amber-500/20 shadow-lg' 
                        : `bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`
                    }`}
                 >
                    <Waves size={18} className={isPlayingNoise ? 'animate-bounce' : ''} />
                    {isPlayingNoise ? 'Brown Noise Active' : 'Enable Brown Noise'}
                 </button>
            </div>

        </div>

        {/* RIGHT: VIDEO ANCHOR */}
        <div className="h-full flex flex-col justify-center animate-fade-in-up delay-100">
            {/* 
                THE ANCHOR: This div is empty but occupies the space.
                GlobalYoutubePlayer.tsx will measure this div's position and overlay the video on top of it.
            */}
            <div 
                id="video-anchor" 
                className="w-full aspect-video bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed relative"
            >
               {/* Placeholder content just in case the player hasn't snapped yet */}
               <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600">
                  <span className="font-bold tracking-widest text-sm uppercase">Video Player Anchor</span>
               </div>
            </div>

            <div className="mt-8 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-500 fill-yellow-500" /> Pro Tip
                </h4>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                   When you switch tabs, the music player will seamlessly transform into a 
                   <span className="font-bold text-slate-800 dark:text-white"> Floating Widget</span> so your flow stays uninterrupted.
                </p>
            </div>
        </div>

      </div>

      {/* --- GLASSMORPHISM BREAK MODAL --- */}
      {showBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" />
            
            <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
                    <Coffee size={48} className="text-pink-500 dark:text-pink-400" />
                </div>
                
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Time's Up!</h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg mb-8 font-medium">
                    You crushed that session. Take a breath, you've earned a break.
                </p>

                <button 
                    onClick={() => {
                        stopAlarm();
                        setShowBreakModal(false);
                        switchMode(mode === 'pomodoro' ? 'shortBreak' : 'pomodoro');
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-xl transform hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-pink-500/30"
                >
                    Stop Alarm & {mode === 'pomodoro' ? 'Start Break' : 'Start Focus'}
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default Pomodoro;
