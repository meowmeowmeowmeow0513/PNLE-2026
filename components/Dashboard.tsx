import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, ArrowRight, Plus, Check, Calendar, ArrowUpRight, Rocket, Trash2, Activity, HeartPulse, BookOpen, Hourglass, Wind, Circle, Play, Target, Clock, Flag, Zap, Layers, Star, Shield, User, Flame, Heart, Brain, Crown, Stethoscope, Syringe, Dna, Microscope, Ghost, Briefcase, GraduationCap, Coffee, Leaf, Flower2, Library, ChevronRight, Cloud, CloudRain, Sun } from 'lucide-react';
import { NavigationItem, TaskPriority, Task, TaskCategory } from '../types';
import StreakWidget from './StreakWidget';
import MissionBoard from './MissionBoard';
import MotivationWidget from './MotivationWidget';
import ActiveRecallWidget from './ActiveRecallWidget';
import MnemonicWidget from './MnemonicWidget';
import { useGamification } from '../hooks/useGamification';
import { useTasks } from '../TaskContext';
import { isSameDay, differenceInWeeks } from 'date-fns';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';

interface DashboardProps {
  onNavigate: (item: NavigationItem) => void;
  isSidebarExpanded?: boolean;
}

// --- GARDEN COMPONENT HELPERS ---
const GardenPlant = ({ type, x, delay, scale, color, duration, rotation = 0 }: { type: 'flower' | 'leaf' | 'tall' | 'bud', x: string, delay: string, scale: number, color: string, duration: string, rotation?: number }) => (
    <div 
        className="absolute bottom-0 origin-bottom z-10 flex flex-col items-center justify-end pointer-events-none"
        style={{ 
            left: x, 
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            animation: `gentle-sway ${duration} ease-in-out infinite alternate ${delay}`
        }}
    >
        {/* Stem */}
        <div className="w-0.5 bg-current opacity-40 rounded-t-full" style={{ height: type === 'tall' ? '50px' : type === 'bud' ? '20px' : '35px', color: color }}></div>
        {/* Head */}
        <div className="-mb-1 text-current relative" style={{ color: color }}>
            {type === 'flower' && <Flower2 size={24} strokeWidth={1.5} />}
            {type === 'leaf' && <Leaf size={20} strokeWidth={1.5} className="rotate-45" />}
            {type === 'bud' && <div className="w-3 h-4 rounded-full bg-current opacity-80" />}
            {type === 'tall' && (
                <div className="relative">
                    <Leaf size={14} className="-rotate-45 absolute -left-3 top-2 opacity-60" />
                    <Flower2 size={28} strokeWidth={1.5} />
                    <Leaf size={14} className="rotate-45 absolute -right-3 top-4 opacity-60" />
                </div>
            )}
        </div>
    </div>
);

// --- REFINED & AESTHETIC: THE "NEEDY" GHOST GARDEN ---
const NeedyGhost = ({ accentColor }: { accentColor: string }) => {
  const { themeMode } = useTheme();
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);
  
  const messages = [
      "nakakalimutan mo na ba ako?",
      "akala ko ba priority mo 'ko? akala ko lang pala.",
      "iimportante pa ba ako sa'yo?",
      "yearning.......",
      "pansinin mo naman ako",
      "did you drink water today?",
      "it's lonely here..."
  ];

  useEffect(() => {
      const interval = setInterval(() => {
          setFade(false);
          setTimeout(() => {
              setMsgIndex((prev) => (prev + 1) % messages.length);
              setFade(true);
          }, 1000); 
      }, 6000);
      return () => clearInterval(interval);
  }, []);

  const isDark = themeMode === 'dark';
  const isCrescere = themeMode === 'crescere';

  // Balanced Height (Not too tall, not too short)
  const containerClass = isDark
      ? "bg-slate-900/40 border-slate-800"
      : isCrescere
          ? "bg-rose-50/50 border-rose-100"
          : "bg-slate-50 border-slate-200";

  const decorColor = isDark ? "#475569" : isCrescere ? "#fb7185" : "#94a3b8";
  const plantColor1 = isCrescere ? "#f43f5e" : accentColor;
  const plantColor2 = isCrescere ? "#fda4af" : isDark ? "#64748b" : "#cbd5e1";
  
  const ghostFill = isDark ? "#cbd5e1" : isCrescere ? "#f43f5e" : "#64748b"; 
  const eyeFill = isDark ? "#0f172a" : "#ffffff"; 
  const textColor = isDark ? "text-slate-400" : isCrescere ? "text-rose-500" : "text-slate-500";

  return (
    <div className={`w-full min-h-[200px] h-full relative overflow-hidden rounded-[2.5rem] border shadow-inner group select-none shrink-0 ${containerClass}`}>
       <style>{`
         @keyframes ghost-patrol {
           0% { left: 30%; transform: scaleX(1); }
           45% { left: 70%; transform: scaleX(1); }
           50% { left: 70%; transform: scaleX(-1); }
           95% { left: 30%; transform: scaleX(-1); }
           100% { left: 30%; transform: scaleX(1); }
         }
         @keyframes ghost-float {
           0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-8px); }
         }
         @keyframes gentle-sway {
           0% { transform: rotate(-4deg) scale(var(--s, 1)); }
           100% { transform: rotate(4deg) scale(var(--s, 1)); }
         }
         @keyframes cloud-drift {
            0% { transform: translateX(0); }
            50% { transform: translateX(15px); }
            100% { transform: translateX(0); }
         }
       `}</style>

       {/* --- SKY LAYER --- */}
       <div className="absolute inset-x-0 top-0 h-16 pointer-events-none opacity-40">
            <div className="absolute top-4 left-8 animate-[cloud-drift_12s_ease-in-out_infinite]" style={{ color: decorColor }}>
                <Cloud size={24} fill="currentColor" fillOpacity={0.2} strokeWidth={0} />
            </div>
            <div className="absolute top-8 right-12 animate-[cloud-drift_15s_ease-in-out_infinite_reverse]" style={{ color: decorColor }}>
                <Cloud size={18} fill="currentColor" fillOpacity={0.15} strokeWidth={0} />
            </div>
            {isCrescere && (
                <div className="absolute top-3 right-6 text-amber-300 animate-pulse opacity-60">
                    <Sun size={16} />
                </div>
            )}
       </div>

       {/* --- BACKGROUND GARDEN LAYER (Dense & Parallax) --- */}
       <div className="absolute bottom-6 left-0 right-0 h-24 z-0 pointer-events-none opacity-40 blur-[0.5px]">
           <GardenPlant type="leaf" x="5%" delay="0s" scale={0.7} color={plantColor2} duration="4s" rotation={-5} />
           <GardenPlant type="bud" x="15%" delay="1.2s" scale={0.6} color={decorColor} duration="5.5s" />
           <GardenPlant type="flower" x="25%" delay="1s" scale={0.6} color={decorColor} duration="5s" />
           <GardenPlant type="leaf" x="40%" delay="2.5s" scale={0.5} color={plantColor2} duration="6s" rotation={5} />
           <GardenPlant type="flower" x="65%" delay="0.5s" scale={0.55} color={decorColor} duration="6s" />
           <GardenPlant type="bud" x="80%" delay="1.8s" scale={0.6} color={decorColor} duration="4.8s" />
           <GardenPlant type="leaf" x="90%" delay="2s" scale={0.7} color={plantColor2} duration="4.5s" rotation={-3} />
       </div>

       {/* --- THE GHOST --- */}
       <div 
            className="absolute bottom-8 z-20 w-20 h-20 flex items-end justify-center pointer-events-none"
            style={{ animation: 'ghost-patrol 20s linear infinite' }}
       >
           <div className="animate-[ghost-float_3.5s_ease-in-out_infinite]">
               <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg overflow-visible">
                   {/* Rounded Ghost Body */}
                   <path d="M12 2C8 2 5 5 5 9V19L7.5 17.5L10 19L12 17.5L14 19L16.5 17.5L19 19V9C19 5 16 2 12 2Z" fill={ghostFill} />
                   {/* Perfectly Centered Eyes */}
                   <circle cx="9.5" cy="10" r="1.2" fill={eyeFill} />
                   <circle cx="14.5" cy="10" r="1.2" fill={eyeFill} />
                   {/* Cheeks */}
                   <circle cx="8" cy="12" r="0.7" fill="#fb7185" opacity={isDark ? "0.4" : "0.2"} />
                   <circle cx="16" cy="12" r="0.7" fill="#fb7185" opacity={isDark ? "0.4" : "0.2"} />
               </svg>
           </div>
       </div>

       {/* --- FOREGROUND GARDEN LAYER (Lush & Vibrant) --- */}
       <div className="absolute bottom-2 left-0 right-0 h-32 z-30 pointer-events-none">
           {/* Far Left Cluster */}
           <GardenPlant type="tall" x="8%" delay="0.2s" scale={1} color={plantColor1} duration="5s" rotation={-2} />
           <GardenPlant type="flower" x="2%" delay="1.5s" scale={0.8} color={accentColor} duration="4.5s" />
           
           {/* Mid Left */}
           <GardenPlant type="leaf" x="22%" delay="1.2s" scale={0.8} color={plantColor2} duration="4s" rotation={5} />
           <GardenPlant type="bud" x="32%" delay="2.2s" scale={0.7} color={decorColor} duration="6s" />

           {/* Mid Right */}
           <GardenPlant type="flower" x="68%" delay="0.8s" scale={0.8} color={accentColor} duration="5.5s" />
           <GardenPlant type="leaf" x="58%" delay="2s" scale={0.6} color={plantColor2} duration="5s" rotation={-4} />

           {/* Far Right Cluster */}
           <GardenPlant type="tall" x="88%" delay="1.5s" scale={1.1} color={plantColor1} duration="5.2s" rotation={3} />
           <GardenPlant type="flower" x="96%" delay="2.5s" scale={0.9} color={accentColor} duration="4.8s" />
       </div>

       {/* Ground Gradient Overlay */}
       <div className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t ${isDark ? 'from-slate-900/60' : 'from-white/60'} to-transparent z-40`}></div>

       {/* Messaging (Centered & Top) */}
       <div className="absolute inset-0 flex flex-col items-center justify-start pt-10 z-50 pointer-events-none px-8">
           <p className={`text-[8px] font-black uppercase tracking-[0.3em] mb-2 opacity-40 ${textColor}`}>
               System Idle
           </p>
           <p className={`text-xs font-medium text-center max-w-[240px] transition-opacity duration-1000 italic leading-relaxed ${fade ? 'opacity-90' : 'opacity-0'} ${textColor}`}>
               "{messages[msgIndex]}"
           </p>
       </div>
    </div>
  );
};

// --- STUDY VITALS ---
const StudyVitals = () => {
  const { tasks } = useTasks();
  const { themeMode, accentColor } = useTheme();
  
  const todaysTasks = tasks.filter(t => { try { return isSameDay(new Date(t.start), new Date()); } catch { return false; } });
  const total = todaysTasks.length;
  const completed = todaysTasks.filter(t => t.completed).length;
  const progress = total === 0 ? 0 : completed / total;
  let bpm = 60 + Math.round(progress * 40); 
  if (total > 0 && progress === 1) bpm = 120;
  if (total === 0) bpm = 0;
  
  const pathData = useMemo(() => {
    const baseline = 50;
    if (bpm === 0) return `M 0 ${baseline} L 100 ${baseline}`;
    const rHeight = 40; 
    const amp = 0.8 + (progress * 0.4); 
    let path = `M 0 ${baseline}`;
    const cycles = 4;
    const widthPerCycle = 100 / cycles;
    for (let i = 0; i < cycles; i++) {
        const offset = i * widthPerCycle;
        const w = widthPerCycle;
        path += ` L ${offset + w*0.1} ${baseline}`; 
        path += ` Q ${offset + w*0.15} ${baseline - (5*amp)} ${offset + w*0.2} ${baseline}`; 
        path += ` L ${offset + w*0.25} ${baseline}`; 
        path += ` L ${offset + w*0.28} ${baseline + (5*amp)}`; 
        path += ` L ${offset + w*0.35} ${baseline - (rHeight*amp)}`; 
        path += ` L ${offset + w*0.42} ${baseline + (10*amp)}`; 
        path += ` L ${offset + w*0.45} ${baseline}`; 
        path += ` Q ${offset + w*0.55} ${baseline - (15*amp)} ${offset + w*0.65} ${baseline}`; 
        path += ` L ${offset + w} ${baseline}`; 
    }
    return path;
  }, [progress, bpm]);

  return (
    <div className="relative w-full h-full flex items-center justify-between px-6 py-3 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`, backgroundSize: '15px 15px' }}></div>
        <div className="relative z-10 flex flex-col justify-center min-w-[70px]">
             <div className="flex items-center gap-1.5 mb-0.5">
                <Activity style={{ color: accentColor }} size={14} className={bpm > 0 ? "animate-pulse" : ""} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Vitals</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-mono font-black tracking-tighter" style={{ color: accentColor }}>{bpm}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">BPM</span>
            </div>
        </div>
        <div className="relative h-12 flex-1 mx-4 overflow-hidden">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible relative z-10">
                <path d={pathData} fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500"/>
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/80 dark:to-[#0f172a]/80 z-20"></div>
        </div>
        <div className="relative z-10 text-right min-w-[70px]">
             <div className="text-[9px] font-black uppercase tracking-widest mb-0.5 opacity-60" style={{ color: accentColor }}>{progress >= 0.8 ? 'Optimal' : progress >= 0.4 ? 'Stable' : 'Critical'}</div>
             <span className="text-[9px] font-mono text-slate-400 font-bold">{completed}/{total}</span>
        </div>
    </div>
  );
};

// --- QUICK ACCESS SLIDESHOW ---
const QuickAccessSlideshow = ({ onNavigate, isCrescere }: { onNavigate: (item: NavigationItem) => void, isCrescere: boolean }) => {
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const quickLinks = [
        { label: 'Clinical Tools', icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Calculators & Scales' },
        { label: 'Resource Hub', icon: Library, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'Review Materials' },
        { label: 'Exam TOS', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Blueprint Tracking' },
    ];
    const activeLink = quickLinks[carouselIndex];
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => setCarouselIndex((prev) => (prev + 1) % quickLinks.length), 8000);
        return () => clearInterval(interval);
    }, [isPaused, quickLinks.length]);
    return (
        <div className="w-full" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <button onClick={() => onNavigate(activeLink.label as NavigationItem)} className={`group w-full relative flex flex-row items-center p-4 rounded-3xl border transition-all duration-300 ${isCrescere ? 'bg-white/60 border-white/60 hover:bg-white/80' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'} hover:-translate-y-1 hover:shadow-lg overflow-hidden`}>
                <div key={activeLink.label} className="contents animate-fade-in">
                    <div className={`p-3 rounded-2xl transition-colors duration-500 ${activeLink.bg} ${activeLink.color} shrink-0`}><activeLink.icon size={24} /></div>
                    <div className="ml-4 text-left flex-1 min-w-0">
                        <span className="block text-[10px] font-black uppercase tracking-wider opacity-60 mb-0.5">Quick Access</span>
                        <span className={`block text-lg font-black tracking-tight truncate ${isCrescere ? 'text-slate-800' : 'text-slate-900 dark:text-white'}`}>{activeLink.label}</span>
                        <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 truncate mt-0.5">{activeLink.desc}</span>
                    </div>
                </div>
                <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-400 group-hover:text-pink-500 transition-colors"><ChevronRight size={14} /></div>
                {!isPaused && <div className="absolute bottom-0 left-0 h-0.5 bg-pink-500 w-full opacity-20"><div key={activeLink.label} className="h-full bg-pink-500 w-full animate-[progress_8s_linear]"></div></div>}
            </button>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, isSidebarExpanded = false }) => {
  const { currentUser } = useAuth();
  const { stats, loading: streakLoading, trackAction } = useGamification(); 
  const { tasks: allTasks, addTask, toggleTask, updateTask, deleteTask } = useTasks();
  const { fontSize, themeMode, accentColor } = useTheme();
  const [newTaskText, setNewTaskText] = useState('');
  const [dailyWidgetTab, setDailyWidgetTab] = useState<'mnemonic' | 'recall'>('mnemonic');
  const [heroIconIndex, setHeroIconIndex] = useState(() => parseInt(localStorage.getItem('hero_icon_index') || '0'));
  const heroIcons = [Shield, Heart, Brain, Stethoscope, Syringe, Dna, Crown, Zap, Microscope];
  const CurrentHeroIcon = heroIcons[heroIconIndex % heroIcons.length];
  const cycleHeroIcon = () => {
      const nextIndex = (heroIconIndex + 1) % heroIcons.length;
      setHeroIconIndex(nextIndex);
      localStorage.setItem('hero_icon_index', nextIndex.toString());
  };
  const loginTracked = useRef(false);
  useEffect(() => { if (!loginTracked.current && stats && !streakLoading) { trackAction('login'); loginTracked.current = true; } }, [trackAction, stats, streakLoading]);
  const today = new Date();
  const priorityOrder: Record<TaskPriority, number> = { 'High': 0, 'Medium': 1, 'Low': 2 };
  const todaysTasks = allTasks.filter(t => { try { return t.start && isSameDay(new Date(t.start), today); } catch { return false; } })
    .sort((a, b) => { 
        if (a.completed !== b.completed) return a.completed ? 1 : -1; 
        const pA = priorityOrder[a.priority] || 1;
        const pB = priorityOrder[b.priority] || 1;
        if (pA !== pB) return pA - pB;
        return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  const completedCount = todaysTasks.filter(t => t.completed).length;
  const progressPercentage = todaysTasks.length === 0 ? 0 : Math.round((completedCount / todaysTasks.length) * 100);
  const [greeting, setGreeting] = useState('');
  useEffect(() => { const h = new Date().getHours(); setGreeting(h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening'); }, []);
  const handleQuickAdd = async (e: React.FormEvent) => { e.preventDefault(); if (!newTaskText.trim()) return; const now = new Date(); await addTask({ title: newTaskText.trim(), category: 'Review', priority: 'Medium', start: now.toISOString(), end: new Date(now.getTime() + 3600000).toISOString(), allDay: false }); setNewTaskText(''); };
  const cyclePriority = async (e: React.MouseEvent, task: Task) => { e.stopPropagation(); const next: Record<TaskPriority, TaskPriority> = { 'Low': 'Medium', 'Medium': 'High', 'High': 'Low' }; await updateTask(task.id, { priority: next[task.priority] }); };
  const cycleCategory = async (e: React.MouseEvent, task: Task) => { e.stopPropagation(); const cats: TaskCategory[] = ['Review', 'School', 'Duty', 'Personal']; const next = cats[(cats.indexOf(task.category) + 1) % cats.length]; await updateTask(task.id, { category: next }); };
  const getTaskVisuals = (task: Task) => {
      switch(task.category) {
          case 'Review': return { icon: BookOpen, color: 'bg-rose-500', text: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' };
          case 'Duty': return { icon: Briefcase, color: 'bg-blue-500', text: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' };
          case 'School': return { icon: GraduationCap, color: 'bg-purple-500', text: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' };
          case 'Personal': return { icon: Coffee, color: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
          default: return { icon: Circle, color: 'bg-slate-500', text: 'text-slate-500', bg: 'bg-slate-50' };
      }
  };
  const isCrescere = themeMode === 'crescere';
  const glassCard = `group relative ${isCrescere ? 'bg-white/80 border-rose-100' : 'bg-white/80 dark:bg-[#0f172a]/60 border-slate-200 dark:border-white/5'} backdrop-blur-2xl border rounded-[2.5rem] transition-all duration-300 hover:-translate-y-1 shadow-xl overflow-hidden`;
  const isLargeFont = fontSize === 'large' || fontSize === 'extra-large';
  const gridClasses = (isSidebarExpanded || isLargeFont) ? "grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8" : "grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8";
  const nameGradientClass = isCrescere ? 'from-rose-500 via-amber-500 to-rose-600' : `from-[${accentColor}] via-purple-400 to-[${accentColor}]`; 

  return (
    <div className="w-full pb-24">
        <div className={gridClasses}>
            <div className={`flex flex-col gap-6 lg:gap-8 h-full ${(isSidebarExpanded || isLargeFont) ? 'xl:col-span-2' : 'lg:col-span-2'}`}>
                {/* HERO CARD (EXPANDED) */}
                <div className={`${glassCard} min-h-[260px] md:min-h-[300px] flex flex-col md:flex-row p-6 md:p-10 items-center border`} style={{ borderColor: `${accentColor}20` }}>
                     <div className="absolute inset-0 transition-colors duration-700" style={{ background: `linear-gradient(135deg, ${isCrescere ? '#fff1f2' : themeMode === 'light' ? '#f8fafc' : '#0f172a'} 0%, ${accentColor}${themeMode === 'light' ? '15' : '20'} 100%)` }} />
                     <div className="relative z-10 flex-1 flex flex-col justify-center text-center md:text-left items-center md:items-start">
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/5 border border-white/20 shadow-sm">
                            <Zap size={12} style={{ color: accentColor, fill: 'currentColor' }} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">SYSTEM ONLINE</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-none mb-2 text-slate-900 dark:text-white">
                            {greeting}, <br/>
                            <span className={`bg-clip-text text-transparent bg-gradient-to-r bg-[length:200%_auto] animate-gradient ${nameGradientClass}`} style={!isCrescere ? { backgroundImage: `linear-gradient(to right, ${accentColor}, #a855f7, ${accentColor})` } : {}}>
                                {currentUser?.displayName?.split(' ')[0] || 'Future RN'}
                            </span>.
                        </h1>
                        <p className="font-bold text-sm md:text-base opacity-70 max-w-sm mb-6 italic text-slate-600 dark:text-slate-300 leading-relaxed">
                            Ikaw ang aawit ng, "Kaya mo 'to" <br /> 'Sang panalangin sa gitna ng gulo.
                        </p>
                        <button onClick={() => onNavigate('Pomodoro Timer')} className="group relative px-8 py-3.5 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all overflow-hidden" style={{ backgroundColor: accentColor }}>
                            <span className="relative flex items-center gap-2">LOCK IN TIME! <ArrowRight size={14} /></span>
                        </button>
                     </div>
                     <div className="relative z-10 w-full md:w-[35%] h-full hidden md:flex items-center justify-center pl-6">
                         <div onClick={cycleHeroIcon} className="relative w-36 h-36 cursor-pointer transition-transform hover:scale-105 group/prism">
                             <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center overflow-hidden">
                                 <div className="animate-[ghost-float_5s_ease-in-out_infinite]">
                                     <CurrentHeroIcon size={48} style={{ color: accentColor }} strokeWidth={1.5} />
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>

                {/* DAILY TRIAGE (COMPACT HEIGHT) */}
                <div className={`${glassCard} p-5 md:p-6 flex flex-col h-auto min-h-[360px] relative`}>
                    
                    <div className="flex items-center justify-between mb-5 shrink-0 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border bg-white dark:bg-slate-800 ${isCrescere ? 'border-rose-100' : 'border-slate-200 dark:border-white/10'}`}>
                                <Layers size={20} style={{ color: accentColor }} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black tracking-tight leading-none text-slate-900 dark:text-white">Daily Triage</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-1 w-12 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full transition-all duration-1000" style={{ width: `${progressPercentage}%`, backgroundColor: accentColor }}></div></div>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">{progressPercentage}% Done</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => onNavigate('Planner')} className="p-2 text-slate-400 hover:text-slate-600"><Calendar size={18} /></button>
                    </div>
                    
                    <form onSubmit={handleQuickAdd} className="relative z-20 mb-4">
                        <div className="relative">
                            <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Add task..." className={`w-full pl-5 pr-12 py-3 rounded-2xl outline-none font-bold text-sm shadow-inner border-2 transition-all ${isCrescere ? 'bg-slate-50 border-rose-50 text-slate-800' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'}`} style={{ borderColor: newTaskText ? accentColor : undefined }} />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-white shadow-md" style={{ backgroundColor: accentColor }}><Plus size={16} /></button>
                        </div>
                    </form>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 max-h-[240px] relative z-10 pb-4">
                        {todaysTasks.length === 0 ? (
                            // Render NeedyGhost Garden Scene when no tasks
                            <NeedyGhost accentColor={accentColor} />
                        ) : (
                            todaysTasks.map(task => {
                                const visuals = getTaskVisuals(task);
                                return (
                                    <div key={task.id} className={`group flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-300 ${task.completed ? 'opacity-50 grayscale bg-slate-50/50' : 'bg-white/80 dark:bg-slate-800/80 border-slate-100 dark:border-white/5 backdrop-blur-sm'}`}>
                                        <button onClick={() => toggleTask(task.id, task.completed)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400 text-transparent'}`}><Check size={10} strokeWidth={4} /></button>
                                        <div className={`p-2 rounded-xl shrink-0 ${visuals.bg} ${visuals.text}`}><visuals.icon size={14} /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-bold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <button onClick={(e) => cycleCategory(e, task)} className={`text-[8px] font-black uppercase tracking-widest ${visuals.text}`}>{task.category}</button>
                                                <button onClick={(e) => cyclePriority(e, task)}><Flag size={9} className={`${task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-orange-400' : 'text-blue-400'} fill-current`} /></button>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className={`${glassCard} py-2`}><StudyVitals /></div>

                <div className="flex-1 flex flex-col gap-4 min-h-[380px]">
                   <div className="flex items-center justify-between px-2 shrink-0">
                        <div className="flex items-center gap-2 text-slate-400"><BookOpen size={14} /><span className="text-[9px] font-black uppercase tracking-widest">Knowledge</span></div>
                        <div className="bg-slate-200/50 dark:bg-white/5 p-1 rounded-xl flex gap-1 border border-slate-200/50">
                           <button onClick={() => setDailyWidgetTab('mnemonic')} className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${dailyWidgetTab === 'mnemonic' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500'}`} style={{ color: dailyWidgetTab === 'mnemonic' ? accentColor : undefined }}>Mnemonic</button>
                           <button onClick={() => setDailyWidgetTab('recall')} className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${dailyWidgetTab === 'recall' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500'}`} style={{ color: dailyWidgetTab === 'recall' ? accentColor : undefined }}>Question</button>
                        </div>
                   </div>
                   <div className="flex-1 rounded-[2.5rem] overflow-hidden relative shadow-lg min-h-[340px]">
                       <div className={`absolute inset-0 w-full h-full transition-all duration-500 ${dailyWidgetTab === 'mnemonic' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}><MnemonicWidget className="h-full" /></div>
                       <div className={`absolute inset-0 w-full h-full transition-all duration-500 ${dailyWidgetTab === 'recall' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}><ActiveRecallWidget className="h-full" /></div>
                   </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 lg:gap-8 h-full">
                 <div className="min-h-[260px]">{stats && <StreakWidget stats={stats} loading={streakLoading} />}</div>
                 <MissionBoard />
                 <QuantumChronometer />
                 <QuickAccessSlideshow onNavigate={onNavigate} isCrescere={isCrescere} />
                 <div className={!isLargeFont ? "lg:flex-1 flex flex-col" : "flex flex-col"}><MotivationWidget className="h-full" /></div>
            </div>
        </div>
    </div>
  );
};

const QuantumChronometer = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const { themeMode, accentColor } = useTheme();
    useEffect(() => {
        const timer = setInterval(() => {
            const diff = new Date("2026-08-29T07:00:00+08:00").getTime() - new Date().getTime();
            if (diff > 0) setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60) });
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    const glassCard = `bg-white/80 dark:bg-[#0f172a]/60 backdrop-blur-2xl border ${themeMode === 'crescere' ? 'border-rose-100' : 'border-slate-200 dark:border-white/5'} shadow-xl p-6 rounded-[2.5rem] flex flex-col justify-between`;
    const TimeBlock = ({ val, label, isActive = false }: { val: number, label: string, isActive?: boolean }) => (
        <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${themeMode === 'crescere' ? 'bg-white/60 border-rose-50' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-white/5'}`}>
            <span className="text-3xl md:text-4xl font-mono font-bold tracking-tighter" style={{ color: isActive ? accentColor : undefined }}>{val.toString().padStart(2, '0')}</span>
            <span className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-50 text-slate-500">{label}</span>
        </div>
    );
    return (
        <div className={glassCard}>
             <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                     <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 shadow-inner"><Target size={18} style={{ color: accentColor }} /></div>
                     <div><h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">Mission Timer</h3><p className="text-[9px] font-bold text-slate-400 mt-0.5">PNLE August 2026</p></div>
                 </div>
                 <span className="flex h-2.5 w-2.5 relative"><span className="animate-ping absolute h-full w-full rounded-full opacity-75" style={{ backgroundColor: accentColor }}></span><span className="relative rounded-full h-2.5 w-2.5" style={{ backgroundColor: accentColor }}></span></span>
             </div>
             <div className="grid grid-cols-4 gap-2"><TimeBlock val={timeLeft.days} label="Days" /><TimeBlock val={timeLeft.hours} label="Hrs" /><TimeBlock val={timeLeft.minutes} label="Mins" /><TimeBlock val={timeLeft.seconds} label="Secs" isActive={true} /></div>
             <div className="mt-6 text-center"><p className="text-[10px] font-serif italic text-slate-500 tracking-widest opacity-80">"Every second brings you closer to that license."</p></div>
             <div className="mt-4 flex items-center gap-3 opacity-80"><div className="h-1 flex-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: '35%', backgroundColor: accentColor }}></div></div></div>
        </div>
    );
};

export default Dashboard;