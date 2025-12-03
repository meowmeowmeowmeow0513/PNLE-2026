
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Waves, Maximize2, Coffee, Brain, ListTodo, ChevronDown, CheckCircle, Circle, Target, Check, Zap } from 'lucide-react';
import { usePomodoro, TimerMode } from './PomodoroContext';
import { useTasks } from '../TaskContext';
import { useGamification } from '../hooks/useGamification';
import { isSameDay } from 'date-fns';

const Pomodoro: React.FC = () => {
  const { 
    mode, timeLeft, initialTime, isActive, customTime, isMuted,
    focusTask, focusTaskId, isPlayingNoise, pipWindow,
    toggleTimer, resetTimer, switchMode, setCustomTimeValue,
    toggleMute, setFocusTask, setFocusTaskId, toggleBrownNoise,
    showBreakModal, setShowBreakModal, stopAlarm
  } = usePomodoro();

  const { tasks, toggleTask } = useTasks();
  const { trackAction } = useGamification();

  // Trigger gamification reward when session ends successfully
  // Note: logic for showing modal is in Context, we hook into the modal display event effectively
  // or use an effect here if PomodoroContext exposed a "sessionCompleted" event.
  // For simplicity, we'll assume the user manually confirming task triggers it, or we add logic here.
  // BUT: PomodoroContext handles the timer tick. Ideally, PomodoroContext should call trackAction. 
  // Since PomodoroContext is pure, we handle it here by watching a completion state if possible, 
  // or simply updating the "handleTaskComplete" function.

  const [isDark, setIsDark] = useState(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') setIsDark(document.documentElement.classList.contains('dark'));
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const todaysTasks = tasks.filter(t => !t.completed && isSameDay(new Date(t.start), new Date()));
  
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsTaskDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTaskSelect = (task: typeof tasks[0]) => {
    setFocusTask(task.title);
    setFocusTaskId(task.id);
    setIsTaskDropdownOpen(false);
  };

  const handleTaskComplete = async () => {
      if (focusTaskId) {
          await toggleTask(focusTaskId, false);
          setFocusTask('');
          setFocusTaskId(null);
      }
      // Gamification: Finishing a session + task
      await trackAction('finish_pomodoro');
      
      stopAlarm();
      setShowBreakModal(false);
      switchMode(mode === 'pomodoro' ? 'shortBreak' : 'pomodoro');
  };
  
  const handleStartBreak = async () => {
      // Just finishing a session (even without task) counts?
      if (mode === 'pomodoro') {
          await trackAction('finish_pomodoro');
      }
      stopAlarm();
      setShowBreakModal(false);
      switchMode(mode === 'pomodoro' ? 'shortBreak' : 'pomodoro');
  };

  // --- VISUAL THEME ENGINE ---
  const isFocus = mode === 'pomodoro' || mode === 'custom';
  const darkTheme = { bg: 'bg-[#020617]', primary: 'text-pink-500', ring: '#ec4899', ringGlow: 'drop-shadow-[0_0_20px_rgba(236,72,153,0.6)]', strokeWidth: 12, accent: 'bg-pink-600', buttonGlow: 'shadow-pink-500/50', textMain: 'text-white', textSub: 'text-slate-400' };
  const lightTheme = { bg: 'bg-[#f8fafc]', primary: 'text-emerald-600', ring: '#059669', ringGlow: '', strokeWidth: 6, accent: 'bg-emerald-500', buttonGlow: 'shadow-emerald-500/30', textMain: 'text-slate-800', textSub: 'text-slate-500' };
  const activeTheme = isDark ? darkTheme : lightTheme;

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
    <div className={`w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center transition-colors duration-700 ${activeTheme.bg}`}>
      {isDark && <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-10 pointer-events-none bg-pink-600`}></div>}

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-6 relative z-10">
        
        <div className="flex flex-col items-center">
            <div className="w-full max-w-lg mb-12 relative z-20" ref={dropdownRef}>
                <button onClick={() => !isActive && setIsTaskDropdownOpen(!isTaskDropdownOpen)} disabled={isActive} className={`w-full flex items-center justify-center gap-3 text-2xl md:text-4xl font-black transition-all duration-300 group ${isActive ? 'cursor-default opacity-100' : 'cursor-pointer hover:opacity-80'} ${activeTheme.textMain}`}>
                    <span className="truncate max-w-[90%]">{focusTask || (isActive ? "Focus Session" : "Select a Task")}</span>
                    {!isActive && <ChevronDown size={24} className={`transform transition-transform ${isTaskDropdownOpen ? 'rotate-180' : ''} opacity-50`} />}
                </button>
                <div className={`h-1 mx-auto mt-4 rounded-full transition-all duration-700 ${isActive ? `w-32 ${activeTheme.accent} ${isDark ? 'shadow-[0_0_20px_currentColor]' : ''}` : `w-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}`}></div>
                {isTaskDropdownOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            <p className="text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider sticky top-0 bg-white dark:bg-slate-900">Today's Unfinished Tasks</p>
                            {todaysTasks.length === 0 ? <div className="p-4 text-center text-slate-400 text-sm">No pending tasks for today.</div> : todaysTasks.map(task => (
                                <button key={task.id} onClick={() => handleTaskSelect(task)} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 group">
                                    <Circle size={16} className={`flex-shrink-0 ${task.priority === 'High' ? 'text-red-500' : 'text-slate-400'}`} />
                                    <span className="text-slate-700 dark:text-slate-200 font-medium truncate">{task.title}</span>
                                    {task.id === focusTaskId && <Check size={16} className="ml-auto text-pink-500" />}
                                </button>
                            ))}
                            <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2">
                                <button onClick={() => { setFocusTask(''); setFocusTaskId(null); setIsTaskDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white">Clear Selection</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {pipWindow ? (
                <div className={`w-[320px] h-[320px] rounded-full border border-dashed flex flex-col items-center justify-center gap-4 animate-pulse ${isDark ? 'border-slate-700 bg-white/5' : 'border-slate-300 bg-slate-50'}`}>
                     <Maximize2 size={48} className={activeTheme.textSub} />
                     <span className={`text-xs font-bold uppercase tracking-widest ${activeTheme.textSub}`}>Active in PiP</span>
                     <button onClick={triggerPiP} className={`px-6 py-2 rounded-full text-xs font-bold text-white transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-400 hover:bg-slate-500'}`}>Return</button>
                </div>
            ) : (
                <div className="relative mb-12 group">
                    <svg width="360" height="360" className="transform -rotate-90">
                        <circle cx="180" cy="180" r={radius} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth={activeTheme.strokeWidth} fill="transparent" />
                        <circle cx="180" cy="180" r={radius} stroke={activeTheme.ring} strokeWidth={activeTheme.strokeWidth} fill="transparent" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className={`transition-[stroke-dashoffset] duration-300 ease-linear ${activeTheme.ringGlow}`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-8xl font-mono font-bold tracking-tighter ${activeTheme.textMain} ${isDark ? 'drop-shadow-2xl' : ''}`}>{formatTime(timeLeft)}</span>
                        <div className={`mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200'} ${activeTheme.primary}`}>
                            {isFocus ? <Brain size={16} /> : <Coffee size={16} />}
                            <span>{isActive ? 'RUNNING' : 'PAUSED'}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className={`rounded-3xl p-3 flex items-center gap-6 shadow-2xl backdrop-blur-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                <button onClick={resetTimer} className={`p-4 rounded-2xl transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}><RotateCcw size={20} /></button>
                <button onClick={toggleTimer} className={`p-6 rounded-2xl text-white shadow-lg transform transition-all active:scale-95 ${isActive ? 'bg-amber-500 shadow-amber-500/40' : `${activeTheme.accent} ${activeTheme.buttonGlow}`}`}>{isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}</button>
                <button onClick={toggleMute} className={`p-4 rounded-2xl transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
            </div>

            <div className="mt-8 flex gap-4">
                <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
                    {['pomodoro', 'shortBreak', 'longBreak'].map(m => (
                        <button key={m} onClick={() => switchMode(m as TimerMode)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${mode === m ? `${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-800'} shadow-sm` : `${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}`}>{m.replace(/([A-Z])/g, ' $1').trim()}</button>
                    ))}
                    <button onClick={() => switchMode('custom')} className={`px-3 py-2 ${mode === 'custom' ? (isDark ? 'text-white' : 'text-slate-800') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}><ListTodo size={14} /></button>
                </div>
                <button onClick={toggleBrownNoise} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isPlayingNoise ? 'bg-amber-900/20 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : `${isDark ? 'bg-black/40 border-white/5 text-slate-500 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}`}`}><Waves size={16} className={isPlayingNoise ? 'animate-pulse' : ''} /><span className="text-xs font-bold uppercase">Brown Noise</span></button>
                {!pipWindow && <button onClick={triggerPiP} className={`p-2 rounded-xl border transition-colors ${isDark ? 'bg-black/40 border-white/5 text-slate-500 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}`}><Maximize2 size={18} /></button>}
            </div>

            {mode === 'custom' && (
                 <div className="w-64 mt-6 animate-in fade-in slide-in-from-top-2">
                    <div className={`flex justify-between text-xs font-bold mb-2 ${activeTheme.textSub}`}><span>1m</span><span className={activeTheme.textMain}>{customTime} min</span><span>180m</span></div>
                    <input type="range" min="1" max="180" value={customTime} onChange={(e) => setCustomTimeValue(Number(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${isDark ? 'bg-slate-800 accent-white' : 'bg-slate-200 accent-emerald-500'}`} />
                 </div>
            )}
        </div>

        <div className="hidden lg:flex flex-col items-center justify-center h-full">
            <div className={`w-full aspect-video rounded-3xl overflow-hidden shadow-2xl relative group border ${isDark ? 'bg-black/50 border-white/10' : 'bg-white border-slate-200'}`}>
                <div id="video-anchor" className="w-full h-full"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10"><span className={`text-xs font-bold uppercase tracking-widest ${activeTheme.textSub}`}>Video Player Loading...</span></div>
            </div>
            <div className={`mt-8 p-6 rounded-2xl max-w-md backdrop-blur-sm border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white/60 border-slate-200'}`}>
                <div className="flex items-center gap-2 text-yellow-500 mb-2"><Zap size={16} fill="currentColor" /><span className={`text-sm font-bold ${activeTheme.textMain}`}>Pro Tip</span></div>
                <p className={`text-xs leading-relaxed ${activeTheme.textSub}`}>Select a task from the planner to track your progress. When the timer ends, you can check it off directly from here.</p>
            </div>
        </div>

      </div>

      {showBreakModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl animate-in fade-in duration-700"></div>
            <div className="relative bg-[#0f172a] border border-white/10 p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-500">
                {focusTaskId && mode === 'pomodoro' ? (
                    <>
                         <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500 rounded-full blur-[80px] opacity-40 pointer-events-none"></div>
                         <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-400"><Target size={40} /></div>
                         <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Session Complete!</h2>
                         <p className="text-slate-400 text-sm mb-8 font-medium">Did you finish <span className="text-white font-bold">"{focusTask}"</span>?</p>
                         <div className="flex flex-col gap-3 relative z-10">
                            <button onClick={handleTaskComplete} className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"><CheckCircle size={20} /> Yes, Check it Off</button>
                            <button onClick={() => { stopAlarm(); setShowBreakModal(false); switchMode('shortBreak'); }} className="py-4 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">No, Not Yet</button>
                         </div>
                    </>
                ) : (
                    <>
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-pink-500 rounded-full blur-[80px] opacity-40 pointer-events-none"></div>
                        <h2 className="text-5xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">Time's Up</h2>
                        <p className="text-slate-400 text-sm mb-8 font-medium">{mode === 'pomodoro' ? "Excellent work. Decompress now." : "Break is over. Let's get back to it."}</p>
                        <div className="flex flex-col gap-3 relative z-10">
                            <button onClick={handleStartBreak} className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">{mode === 'pomodoro' ? 'Start Break' : 'Start Focus'}</button>
                            <button onClick={() => { stopAlarm(); setShowBreakModal(false); }} className="py-4 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Dismiss</button>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Pomodoro;
