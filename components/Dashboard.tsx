
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, ArrowRight, Plus, Check, Square, Calendar, ArrowUpRight, Rocket, Trash2, CheckSquare, Quote, Clock, Activity, GripVertical, Zap, HeartPulse } from 'lucide-react';
import { NavigationItem } from '../types';
import StreakWidget from './StreakWidget';
import MissionBoard from './MissionBoard';
import MotivationWidget from './MotivationWidget';
import MnemonicWidget from './MnemonicWidget';
import { useGamification } from '../hooks/useGamification';
import { useTasks } from '../TaskContext';
import { isSameDay } from 'date-fns';
import { useAuth } from '../AuthContext';

interface DashboardProps {
  onNavigate: (item: NavigationItem) => void;
}

// Internal Component: Cute Ghost Empty State
const GhostEmptyState = () => {
  return (
    <div className="h-full min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden rounded-2xl bg-[#0B1121] border border-white/5 group select-none">
       {/* Background Stars */}
       <div className="absolute inset-0 overflow-hidden opacity-50">
          {[...Array(6)].map((_, i) => (
             <div key={i} className="absolute bg-white rounded-full opacity-20 animate-twinkle" 
                  style={{
                      width: Math.random() * 2 + 1 + 'px',
                      height: Math.random() * 2 + 1 + 'px',
                      top: Math.random() * 100 + '%',
                      left: Math.random() * 100 + '%',
                      animationDelay: Math.random() * 5 + 's',
                      animationDuration: Math.random() * 3 + 2 + 's'
                  }} 
             />
          ))}
       </div>

       {/* Ground Line */}
       <div className="absolute bottom-12 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

       {/* Flowers */}
       <div className="absolute bottom-12 flex justify-center gap-16 w-full opacity-60">
           <div className="relative group/flower">
               <div className="w-0.5 h-6 bg-emerald-500/40 mx-auto rounded-full origin-bottom animate-sway"></div>
               <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-pink-500/60 animate-pulse-slow text-xs">✿</div>
           </div>
           <div className="relative group/flower mt-2">
               <div className="w-0.5 h-4 bg-emerald-500/40 mx-auto rounded-full origin-bottom animate-sway" style={{ animationDelay: '0.5s' }}></div>
               <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-purple-500/60 animate-pulse-slow text-xs" style={{ animationDelay: '1s' }}>❀</div>
           </div>
           <div className="relative group/flower">
               <div className="w-0.5 h-7 bg-emerald-500/40 mx-auto rounded-full origin-bottom animate-sway" style={{ animationDelay: '1s' }}></div>
               <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-blue-500/60 animate-pulse-slow text-xs" style={{ animationDelay: '2s' }}>✿</div>
           </div>
       </div>

       {/* The Cute Ghost */}
       <div className="relative z-10 animate-float mb-6 transform scale-110">
           <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">
               {/* Body */}
               <path d="M50 15C33.4315 15 20 28.4315 20 45V85L30 78L40 85L50 78L60 85L70 78L80 85V45C80 28.4315 66.5685 15 50 15Z" fill="white" fillOpacity="0.95"/>
               {/* Eyes */}
               <ellipse cx="40" cy="45" rx="3.5" ry="5.5" fill="#1e293b" className="animate-blink" />
               <ellipse cx="60" cy="45" rx="3.5" ry="5.5" fill="#1e293b" className="animate-blink" />
               {/* Cheeks */}
               <circle cx="34" cy="53" r="3.5" fill="#f472b6" fillOpacity="0.5" />
               <circle cx="66" cy="53" r="3.5" fill="#f472b6" fillOpacity="0.5" />
               {/* Mouth */}
               <path d="M47 56Q50 59 53 56" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
           </svg>
           {/* Shadow */}
           <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-14 h-2.5 bg-black/30 rounded-full blur-md animate-shadow"></div>
       </div>

       <div className="text-center z-10 px-6 relative">
           <p className="text-slate-200 font-bold text-sm mb-1 tracking-tight">It's quiet in here...</p>
           <p className="text-slate-500 text-xs font-medium">No tasks scheduled for today.</p>
           
           <button 
             onClick={() => document.getElementById('quick-add-input')?.focus()}
             className="mt-5 text-[10px] font-bold uppercase tracking-widest text-pink-500 hover:text-pink-400 hover:bg-pink-500/10 transition-all bg-pink-500/5 px-4 py-2 rounded-full border border-pink-500/20 hover:border-pink-500/40 hover:scale-105 active:scale-95"
            >
               Create Task
           </button>
       </div>

       <style>{`
         @keyframes float {
           0%, 100% { transform: translateY(0px); }
           50% { transform: translateY(-12px); }
         }
         @keyframes shadow {
           0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.3; }
           50% { transform: translateX(-50%) scale(0.7); opacity: 0.15; }
         }
         @keyframes sway {
           0%, 100% { transform: rotate(-8deg); }
           50% { transform: rotate(8deg); }
         }
         @keyframes blink {
           0%, 48%, 52%, 100% { transform: scaleY(1); }
           50% { transform: scaleY(0.1); }
         }
         @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.5); }
         }
         .animate-float { animation: float 4s ease-in-out infinite; }
         .animate-shadow { animation: shadow 4s ease-in-out infinite; }
         .animate-sway { animation: sway 4s ease-in-out infinite; }
         .animate-blink { animation: blink 4s infinite; transform-box: fill-box; transform-origin: center; }
         .animate-pulse-slow { animation: twinkle 3s ease-in-out infinite; }
         .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
       `}</style>
    </div>
  );
};

// Internal Component: Study Vitals (EKG Graph)
const StudyVitals = () => {
  const { tasks } = useTasks();
  
  const todaysTasks = tasks.filter(t => {
      try { return isSameDay(new Date(t.start), new Date()); } 
      catch { return false; }
  });
  
  const total = todaysTasks.length;
  const completed = todaysTasks.filter(t => t.completed).length;
  const progress = total === 0 ? 0 : completed / total;

  let bpm = 60 + Math.round(progress * 60);
  if (total === 0) bpm = 55;

  let rhythmName = "Normal Sinus";
  let statusColor = "text-emerald-500";
  
  if (bpm < 60) {
      rhythmName = "Sinus Bradycardia";
      statusColor = "text-slate-400";
  } else if (bpm > 100) {
      rhythmName = "Sinus Tachycardia";
      statusColor = "text-pink-500";
  }

  const pathData = useMemo(() => {
    if (total === 0 || completed === 0) {
        return "M 0 50 L 10 50 L 15 48 L 20 52 L 25 50 L 100 50"; 
    }

    const points = [];
    const segments = 15;
    const amplitude = 10 + (progress * 40); 

    for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * 100;
        let y = 50; 

        if (i % 3 === 0) {
             y = 50 - (Math.random() * amplitude); 
        } else if (i % 3 === 1) {
             y = 50 + (Math.random() * (amplitude / 2));
        }
        
        points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return points.join(' ');
  }, [progress, total, completed]);

  return (
    <div className="relative w-full h-full flex flex-row items-center justify-between overflow-hidden px-6 gap-6">
        <div className="absolute inset-0" 
             style={{ 
                 backgroundImage: 'linear-gradient(rgba(236, 72, 153, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(236, 72, 153, 0.05) 1px, transparent 1px)', 
                 backgroundSize: '20px 20px' 
             }}>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center min-w-[140px]">
             <div className="flex items-center gap-2 mb-1">
                <HeartPulse className={`${progress > 0.8 ? 'text-red-500 animate-pulse-fast' : 'text-pink-500 animate-pulse'}`} size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-pink-500">Study Vitals</span>
            </div>
            <h3 className={`text-lg font-black tracking-tight whitespace-nowrap ${statusColor === 'text-slate-400' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                {rhythmName}
            </h3>
             <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-mono font-bold text-slate-800 dark:text-white transition-all duration-1000">
                    {bpm}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">BPM (Focus Score)</span>
            </div>
        </div>

        <div className="relative h-16 flex-1 mx-4 hidden sm:block">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <path 
                    d={pathData} 
                    fill="none" 
                    stroke={progress > 0.8 ? '#ef4444' : '#ec4899'} 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    filter="url(#glow)"
                    className="transition-all duration-1000 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]"
                />
            </svg>
        </div>
        
        <div className="relative z-10 flex flex-col items-end gap-2">
             <div className={`text-[10px] px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 ${
                 progress >= 0.5 
                 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                 : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
             }`}>
                {progress >= 0.5 ? <ArrowUpRight size={12} /> : <Activity size={12} />}
                {progress >= 0.5 ? 'High Intensity' : 'Low Activity'}
             </div>
             <span className="text-xs text-slate-400 font-mono">
                {completed}/{total} Tasks Done
             </span>
        </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { stats, loading: streakLoading, trackAction } = useGamification(); 
  
  const { tasks: allTasks, addTask, toggleTask, deleteTask } = useTasks();
  const [newTaskText, setNewTaskText] = useState('');
  
  // --- AUTOMATIC LOGIN TRACKING (FIXED LOOP) ---
  const loginTracked = useRef(false);
  useEffect(() => {
    // Check if stats are loaded and we haven't tracked yet
    if (!loginTracked.current && stats && !streakLoading) {
        trackAction('login');
        loginTracked.current = true;
    }
  }, [trackAction, stats, streakLoading]);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
        const difference = +new Date("2026-08-29") - +new Date();
        if (difference > 0) {
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            });
        }
    };
    const timer = setInterval(calculateTime, 1000);
    calculateTime();
    return () => clearInterval(timer);
  }, []);
  
  const today = new Date();
  const todaysTasks = allTasks
    .filter(t => {
      try {
        if (!t.start) return false;
        return isSameDay(new Date(t.start), today);
      } catch (e) { return false; }
    })
    .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

  const completedCount = todaysTasks.filter(t => t.completed).length;
  const totalCount = todaysTasks.length;
  const progressPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    await addTask({
      title: newTaskText.trim(),
      category: 'Review',
      priority: 'Medium',
      start: now.toISOString(),
      end: oneHourLater.toISOString(),
      allDay: false
    });
    setNewTaskText('');
  };

  const glassCard = "group relative bg-white/80 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm dark:shadow-xl transition-all duration-300 hover:border-pink-500/30 dark:hover:border-pink-500/30 hover:shadow-[0_0_30px_-10px_rgba(236,72,153,0.3)] hover:-translate-y-1";

  return (
    <div className="w-full pb-10">
        
        {/* --- 2-COLUMN LAYOUT with items-stretch for Equal Heights --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

            {/* --- LEFT COLUMN (2/3 Width) --- */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* 1. HERO CARD */}
                <div className={`${glassCard} relative p-8 flex items-center justify-between min-h-[180px] overflow-hidden`}>
                     {/* Dynamic Backgrounds */}
                     <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

                     <div className="relative z-10 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 text-[10px] font-bold uppercase tracking-wider mb-4 w-fit animate-in slide-in-from-left-4 fade-in duration-700">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                            </span>
                            <span>Student Dashboard</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
                            {greeting}, <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 dark:from-pink-400 dark:to-purple-400">
                                 {currentUser?.displayName?.split(' ')[0] || 'Student'}
                            </span>,
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium max-w-md">
                           Ready to make progress? Your board exam journey continues today.
                        </p>
                     </div>

                     <button 
                        onClick={() => onNavigate('Pomodoro Timer')}
                        className="relative z-10 shrink-0 bg-slate-900 dark:bg-pink-600 hover:bg-slate-800 dark:hover:bg-pink-500 text-white shadow-2xl dark:shadow-[0_0_40px_rgba(236,72,153,0.4)] rounded-full h-16 w-16 md:w-auto md:px-8 md:py-4 font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                    >
                        <ArrowRight size={24} className="md:hidden" />
                        <span className="hidden md:block">Start Review Session</span>
                        <ArrowRight size={20} className="hidden md:block group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* 2. DAILY TRIAGE (TASKS) */}
                <div className={`${glassCard} p-6 flex flex-col min-h-[400px]`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 relative">
                                <Activity size={24} />
                                {/* Circular Progress Border */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                                    <path className="text-emerald-500/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className="text-emerald-500 transition-all duration-1000 ease-out" strokeDasharray={`${progressPercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-none">Daily Triage</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 font-bold">{completedCount}/{totalCount} Tasks • {progressPercentage}%</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => onNavigate('Planner')} className="flex items-center gap-2 text-xs font-bold text-pink-500 hover:text-pink-400 transition-colors bg-pink-500/10 px-3 py-1.5 rounded-lg">
                            Open Planner <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <form onSubmit={handleQuickAdd} className="flex gap-3 mb-6 group/input">
                        <div className="flex-1 relative">
                            <input 
                                id="quick-add-input"
                                type="text" 
                                value={newTaskText} 
                                onChange={(e) => setNewTaskText(e.target.value)} 
                                placeholder="Add a new task..." 
                                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-slate-900 dark:text-white placeholder-slate-400 transition-all pl-11" 
                            />
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-pink-500 transition-colors">
                                <Plus size={20} />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={!newTaskText.trim()} 
                            className="px-5 bg-pink-600 text-white rounded-xl hover:bg-pink-500 disabled:opacity-50 transition-all shadow-lg shadow-pink-500/20 font-bold text-sm"
                        >
                            Add
                        </button>
                    </form>

                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 max-h-[400px]">
                        {todaysTasks.length === 0 ? (
                            <GhostEmptyState />
                        ) : (
                            todaysTasks.map(task => (
                                <div key={task.id} className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${task.completed ? 'bg-slate-50 dark:bg-white/5 border-transparent opacity-50' : 'bg-white dark:bg-white/[0.02] border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:border-slate-200 dark:hover:border-white/10'}`}>
                                    <button onClick={() => toggleTask(task.id, task.completed)} className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white scale-100' : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-400 text-transparent hover:scale-110 active:scale-90'}`}>
                                        <Check size={14} strokeWidth={3} />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate transition-all ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>{task.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${task.priority === 'High' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' : task.priority === 'Medium' ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'}`}>{task.priority}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{task.category}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all transform hover:scale-110"><Trash2 size={16} /></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3. STUDY VITALS (Full Width) */}
                <div className={`${glassCard} py-4 px-2`}>
                   <StudyVitals />
                </div>

                {/* 4. MNEMONIC WIDGET (Flex Grow to Align Bottoms) */}
                <div className="flex-1 flex flex-col">
                   <MnemonicWidget className="h-full" />
                </div>

            </div>


            {/* --- RIGHT COLUMN (1/3 Width) --- */}
            <div className="flex flex-col gap-6">
                 
                 {/* 1. STREAK WIDGET */}
                 <div className="h-[280px]">
                      {stats && <StreakWidget stats={stats} loading={streakLoading} />}
                 </div>

                 {/* 2. MISSION BOARD */}
                 <MissionBoard />

                 {/* 3. COUNTDOWN WIDGET (Integrated) */}
                 <div className={`${glassCard} p-5 flex flex-col justify-center`}>
                     <div className="flex items-center gap-2 mb-4">
                         <div className="p-1.5 bg-pink-500/10 rounded-lg text-pink-500">
                             <Clock size={16} />
                         </div>
                         <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Countdown to PNLE</h3>
                     </div>
                     <div className="grid grid-cols-4 gap-3">
                        {['DAYS', 'HRS', 'MIN', 'SEC'].map((label, i) => {
                            const val = Object.values(timeLeft)[i];
                            return (
                                <div key={label} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-[#020617]/40 border border-slate-100 dark:border-white/5 backdrop-blur-sm group/item hover:border-pink-500/30 transition-colors">
                                    <span className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white leading-none mb-1 tabular-nums tracking-tight">
                                        {val.toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                                </div>
                            );
                        })}
                     </div>
                     <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Aug 29, 2026
                     </div>
                 </div>

                 {/* 4. MOTIVATION WIDGET (Flex Grow to Align Bottoms) */}
                 <div className="flex-1 flex flex-col">
                     <MotivationWidget className="h-full" />
                 </div>

            </div>

        </div>
    </div>
  );
};

export default Dashboard;
