
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

  const togglePiP = async () => {
      if (pipWindow) {
        pipWindow.close();
        setPipWindow(null);
        return;
      }
  
      // Check if API is available
      if (!('documentPictureInPicture' in window)) {
        alert("Your browser doesn't support the 'Keep on Top' window feature yet. Try Chrome or Edge!");
        return;
      }
  
      try {
        const dpip = (window as any).documentPictureInPicture;
        const win = await dpip.requestWindow({
          width: 320,
          height: 400,
        });
  
        // Copy Styles to new Window
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
            link.media = styleSheet.media.mediaText;
            if (styleSheet.href) {
                link.href = styleSheet.href;
            }
            win.document.head.appendChild(link);
          }
        });
  
        // Handle Close
        win.addEventListener('pagehide', () => {
          setPipWindow(null);
        });
  
        setPipWindow(win);
      } catch (err) {
        console.error("Failed to open PiP window:", err);
      }
    };

  // --- THEME ENGINE ---
  const getTheme = () => {
    switch (mode) {
      case 'pomodoro':
        return {
          bg: 'bg-white dark:bg-[#020617] border-slate-200 dark:border-slate-800 shadow-2xl shadow-pink-500/5 dark:shadow-none',
          accent: 'text-pink-600 dark:text-pink-400',
          ring: 'stroke-pink-500',
          button: 'bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-pink-500/30',
          icon: <Brain size={20} className="text-pink-500 dark:text-pink-400" />,
          text: 'text-slate-800 dark:text-white',
          subtext: 'text-slate-500 dark:text-slate-400',
          inputBg: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400'
        };
      case 'shortBreak':
        return {
          bg: 'bg-white dark:bg-[#020617] border-teal-200 dark:border-teal-900/30 shadow-2xl shadow-teal-500/5 dark:shadow-none',
          accent: 'text-teal-600 dark:text-teal-400',
          ring: 'stroke-teal-500',
          button: 'bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-teal-500/30',
          icon: <Coffee size={20} className="text-teal-500 dark:text-teal-400" />,
          text: 'text-slate-800 dark:text-white',
          subtext: 'text-slate-500 dark:text-slate-400',
          inputBg: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900/50 text-slate-900 dark:text-white placeholder-teal-400'
        };
      case 'longBreak':
        return {
          bg: 'bg-white dark:bg-[#020617] border-indigo-200 dark:border-indigo-900/30 shadow-2xl shadow-indigo-500/5 dark:shadow-none',
          accent: 'text-indigo-600 dark:text-indigo-400',
          ring: 'stroke-indigo-500',
          button: 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-indigo-500/30',
          icon: <Zap size={20} className="text-indigo-500 dark:text-indigo-400" />,
          text: 'text-slate-800 dark:text-white',
          subtext: 'text-slate-500 dark:text-slate-400',
          inputBg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50 text-slate-900 dark:text-white placeholder-indigo-400'
        };
      case 'custom':
        return {
          bg: 'bg-white dark:bg-[#020617] border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-500/5 dark:shadow-none',
          accent: 'text-slate-600 dark:text-slate-300',
          ring: 'stroke-slate-500 dark:stroke-slate-400',
          button: 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white shadow-slate-500/30',
          icon: <Settings size={20} className="text-slate-500 dark:text-slate-400" />,
          text: 'text-slate-800 dark:text-white',
          subtext: 'text-slate-500 dark:text-slate-400',
          inputBg: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400'
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
    <div className={`w-full min-h-[calc(100vh-140px)] rounded-[2.5rem] relative flex flex-col items-center justify-center p-6 lg:p-12 transition-all duration-500 ease-in-out border ${theme.bg}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 blur-3xl rounded-full opacity-50"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-pink-500/10 to-transparent blur-3xl rounded-full opacity-30"></div>
      </div>

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* LEFT: TIMER & CONTROLS */}
        <div className="flex flex-col items-center animate-fade-in-up">
            
            {/* Focus Input & Quick Select */}
            <div className="mb-6 w-full max-w-md relative z-20">
                <div className="relative group">
                    <input 
                        type="text"
                        value={focusTask}
                        onChange={(e) => setFocusTask(e.target.value)}
                        placeholder="What is your main focus?"
                        className={`w-full rounded-2xl py-3.5 pl-12 pr-12 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all border ${theme.inputBg} focus:ring-current`}
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
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2">
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
            <div className="relative mb-8 group cursor-pointer select-none" onClick={toggleTimer}>
                <svg width="320" height="320" className="transform -rotate-90 filter drop-shadow-lg">
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
                
                {/* Timer Text (SIZE ADJUSTED TO 7XL as requested) */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center ${theme.text}`}>
                    <span className="text-7xl font-bold font-mono tracking-tighter tabular-nums selection:bg-transparent">
                        {formatTime(timeLeft)}
                    </span>
                    <div className="flex items-center gap-2 mt-2 uppercase tracking-widest text-xs font-bold opacity-60">
                        {theme.icon}
                        <span>{isActive ? 'Running' : 'Paused'}</span>
                    </div>
                </div>
            </div>

            {/* Custom Time Input (Only shows in Custom Mode) */}
            {mode === 'custom' && !isActive && (
               <div className="mb-8 w-full max-w-xs animate-in slide-in-from-top-4 fade-in">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Session Length</label>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{customTime} min</span>
                      </div>
                      
                      <input 
                        type="range" 
                        min="1" 
                        max="180" 
                        value={customTime} 
                        onChange={(e) => setCustomTimeValue(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-600 dark:accent-white mb-4"
                      />

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setCustomTimeValue(Math.max(1, customTime - 5))}
                          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-white font-bold transition-colors"
                        >-</button>
                        <div className="flex-1 relative">
                            <input 
                              type="number" 
                              value={customTime}
                              min="1"
                              max="180"
                              onChange={(e) => setCustomTimeValue(Number(e.target.value))}
                              className="w-full text-center py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400 outline-none"
                            />
                        </div>
                        <button 
                          onClick={() => setCustomTimeValue(Math.min(180, customTime + 5))}
                          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-white font-bold transition-colors"
                        >+</button>
                      </div>
                  </div>
               </div>
            )}

            {/* Main Action Buttons */}
            <div className="flex items-center gap-6">
                <button 
                    onClick={resetTimer}
                    className={`p-4 rounded-full backdrop-blur-sm transition-all active:scale-95 border hover:scale-105 ${theme.inputBg} hover:shadow-lg`}
                    title="Reset Timer"
                >
                    <RotateCcw size={20} className={theme.subtext} />
                </button>

                <button 
                    onClick={toggleTimer}
                    className={`h-24 w-24 rounded-[2rem] flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-xl ${theme.button}`}
                >
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1"/>}
                </button>

                <button 
                    onClick={toggleMute}
                    className={`p-4 rounded-full backdrop-blur-sm transition-all active:scale-95 border hover:scale-105 ${theme.inputBg} hover:shadow-lg`}
                    title={isMuted ? "Unmute Alarm" : "Mute Alarm"}
                >
                    {isMuted ? <VolumeX size={20} className={theme.subtext} /> : <Volume2 size={20} className={theme.subtext} />}
                </button>
            </div>

            {/* Mode Switcher Pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-10 bg-slate-100/50 dark:bg-black/20 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                {[
                  { id: 'pomodoro', label: 'Focus' },
                  { id: 'shortBreak', label: 'Short Break' },
                  { id: 'longBreak', label: 'Long Break' },
                  { id: 'custom', label: 'Custom' }
                ].map((m) => (
                   <button
                     key={m.id}
                     onClick={() => switchMode(m.id as TimerMode)}
                     className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                        mode === m.id 
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'
                     }`}
                   >
                     {m.label}
                   </button>
                ))}
            </div>
            
            <div className="mt-6">
                 <button 
                    onClick={toggleBrownNoise}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all border ${
                        isPlayingNoise 
                        ? 'bg-amber-100 dark:bg-amber-500/10 border-amber-500/50 text-amber-700 dark:text-amber-400 shadow-amber-500/10 shadow-lg' 
                        : `bg-transparent border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`
                    }`}
                 >
                    <Waves size={14} className={isPlayingNoise ? 'animate-bounce' : ''} />
                    {isPlayingNoise ? 'Brown Noise Active' : 'Enable Brown Noise'}
                 </button>
            </div>

        </div>

        {/* RIGHT: VIDEO ANCHOR & TIPS */}
        <div className="h-full flex flex-col justify-center animate-fade-in-up delay-100">
            {/* 
                THE ANCHOR: The GlobalYoutubePlayer will Portal into this div 
                when we are on this page.
            */}
            <div 
                id="video-anchor" 
                className="w-full aspect-video bg-slate-100 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed relative overflow-hidden"
            >
               {/* Content shown only when player is floating elsewhere (rare edge case with portal) */}
               <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-700 pointer-events-none">
                  <div className="text-center">
                    <Brain size={40} className="mx-auto mb-2 opacity-50" />
                    <span className="font-bold tracking-widest text-xs uppercase">Video Player Zone</span>
                  </div>
               </div>
            </div>

            <div className="mt-8 p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Zap size={16} className="text-yellow-500 fill-yellow-500" /> Pro Tip
                    </h4>
                    
                    {/* Pop Out Button */}
                    <button 
                        onClick={togglePiP}
                        className="text-xs font-bold text-pink-500 hover:text-pink-600 dark:hover:text-pink-400 flex items-center gap-1 transition-colors"
                    >
                        <ExternalLink size={12} />
                        {pipWindow ? 'Close Pop-Out' : 'Pop Out Timer'}
                    </button>
                </div>
                
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                   Click <span className="font-bold text-slate-800 dark:text-white">Pop Out Timer</span> to create a floating window that stays on top of other apps (like the Windows Clock), keeping your video and timer visible while you study.
                </p>
            </div>
        </div>

      </div>

      {/* --- GLASSMORPHISM BREAK MODAL --- */}
      {showBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" />
            
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
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
