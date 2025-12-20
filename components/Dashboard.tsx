
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, ArrowRight, Plus, Check, Calendar, ArrowUpRight, Rocket, Trash2, Activity, HeartPulse, BookOpen, Hourglass, Wind, Circle, Play, Target, Clock, Flag, Zap, Layers, Star, Shield, User, Flame, Heart, Brain, Crown, Stethoscope, Syringe, Dna, Microscope, Ghost, Briefcase, GraduationCap, Coffee, Leaf, Flower2, Library, ChevronRight } from 'lucide-react';
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

// --- RESTORED: THE "NEEDY" GHOST (Daily Triage Empty State) ---
const NeedyGhost = ({ accentColor }: { accentColor: string }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);
  
  // Specific Tagalog "Guilt-Trip" Lines
  const messages = [
      "nakakalimutan mo na ba ako?",
      "akala ko ba priority mo 'ko? akala ko lang pala.",
      "iimportante pa ba ako sa'yo?",
      "yearning.......",
      "pansinin mo naman ako"
  ];

  useEffect(() => {
      // Rotate messages every 5 seconds
      const interval = setInterval(() => {
          setFade(false);
          setTimeout(() => {
              setMsgIndex((prev) => (prev + 1) % messages.length);
              setFade(true);
          }, 500); // 500ms fade out duration
      }, 5000);

      return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden py-8 group cursor-pointer z-20">
       
       <style>{`
         @keyframes shiver {
           0%, 100% { transform: translateX(0); }
           25% { transform: translateX(-2px) rotate(-1deg); }
           75% { transform: translateX(2px) rotate(1deg); }
         }
         @keyframes tear-drop {
           0% { transform: translateY(0) scale(0); opacity: 0; }
           50% { transform: translateY(10px) scale(1); opacity: 1; }
           100% { transform: translateY(30px) scale(0.5); opacity: 0; }
         }
         .ghost-shiver:hover svg { animation: shiver 0.3s ease-in-out infinite; }
         .ghost-shiver:hover .tear { animation: tear-drop 1s infinite; }
       `}</style>

       <div className="relative mb-4 z-10 ghost-shiver">
           {/* Custom "Cute/Sad" Ghost SVG */}
           <svg width="80" height="80" viewBox="0 0 100 100" fill="none" className="text-slate-300 dark:text-slate-600 transition-colors duration-300 group-hover:text-pink-400">
               {/* Body */}
               <path d="M50 10C30 10 15 25 15 50V90L26 82L38 90L50 82L62 90L74 82L85 90V50C85 25 70 10 50 10Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
               {/* Sad Eyes */}
               <ellipse cx="35" cy="45" rx="6" ry="8" fill="currentColor" />
               <ellipse cx="65" cy="45" rx="6" ry="8" fill="currentColor" />
               <circle cx="37" cy="43" r="2" fill="white" />
               <circle cx="67" cy="43" r="2" fill="white" />
               {/* Mouth */}
               <path d="M45 65Q50 60 55 65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
               {/* Tear (Hidden by default, shows on hover) */}
               <path d="M65 55Q65 65 62 65Q59 65 59 55Q59 50 62 50Q65 50 65 55Z" fill="#60a5fa" className="tear opacity-0" />
           </svg>
       </div>
       
       <div className="text-center z-10 px-6 h-12 flex flex-col justify-center items-center w-full">
           <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 group-hover:text-pink-500 transition-colors">
               List Empty
           </p>
           <p 
             className={`text-[10px] font-bold text-slate-400/70 dark:text-slate-600 italic transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
           >
               "{messages[msgIndex]}"
           </p>
       </div>
    </div>
  );
};

// --- GROWING GARDEN (Daily Triage Decor) ---
const GrowingGarden = ({ progress, accentColor }: { progress: number, accentColor: string }) => {
    return (
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none overflow-hidden z-0 opacity-50">
            <div className="flex items-end justify-around w-full h-full px-4 pb-2">
                {/* Plant 1 */}
                <div className={`transition-all duration-1000 ${progress > 10 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <Leaf size={24} style={{ color: accentColor }} className="animate-[sway_3s_ease-in-out_infinite]" />
                </div>
                
                {/* Plant 2 (Flower) */}
                <div className={`transition-all duration-1000 delay-100 ${progress > 30 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="relative animate-[sway_4s_ease-in-out_infinite_reverse]">
                        <div className="w-1 h-6 bg-emerald-300/50 mx-auto rounded-full"></div>
                        <Flower2 size={28} className="absolute -top-4 -left-3" style={{ color: accentColor }} />
                    </div>
                </div>

                {/* Plant 3 */}
                <div className={`transition-all duration-1000 delay-200 ${progress > 50 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <Leaf size={20} style={{ color: accentColor }} className="animate-[sway_5s_ease-in-out_infinite]" />
                </div>

                {/* Plant 4 (Big Flower) */}
                <div className={`transition-all duration-1000 delay-300 ${progress > 80 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="relative animate-[sway_3.5s_ease-in-out_infinite]">
                        <div className="w-1 h-8 bg-emerald-300/50 mx-auto rounded-full"></div>
                        <Flower2 size={32} className="absolute -top-5 -left-3.5" style={{ color: accentColor }} />
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes sway {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }
            `}</style>
        </div>
    );
};

// --- STUDY VITALS WIDGET (CLEAN & MODERN) ---
const StudyVitals = () => {
  const { tasks } = useTasks();
  const { themeMode, accentColor } = useTheme();
  
  const todaysTasks = tasks.filter(t => { try { return isSameDay(new Date(t.start), new Date()); } catch { return false; } });
  const total = todaysTasks.length;
  const completed = todaysTasks.filter(t => t.completed).length;
  const progress = total === 0 ? 0 : completed / total;
  let bpm = 60 + Math.round(progress * 40); 
  if (total > 0 && progress === 1) bpm = 120;
  if (total === 0) bpm = 0; // Flatline if no tasks
  
  // Clean PQRST Path
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
        path += ` Q ${offset + w*0.15} ${baseline - (5*amp)} ${offset + w*0.2} ${baseline}`; // P
        path += ` L ${offset + w*0.25} ${baseline}`; 
        path += ` L ${offset + w*0.28} ${baseline + (5*amp)}`; // Q
        path += ` L ${offset + w*0.35} ${baseline - (rHeight*amp)}`; // R
        path += ` L ${offset + w*0.42} ${baseline + (10*amp)}`; // S
        path += ` L ${offset + w*0.45} ${baseline}`; 
        path += ` Q ${offset + w*0.55} ${baseline - (15*amp)} ${offset + w*0.65} ${baseline}`; // T
        path += ` L ${offset + w} ${baseline}`; 
    }
    return path;
  }, [progress, bpm]);

  return (
    <div className="relative w-full h-full flex items-center justify-between px-6 py-4 overflow-hidden">
        {/* Subtle Medical Grid Background */}
        <div className="absolute inset-0 opacity-[0.07]" 
             style={{ 
                 backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`, 
                 backgroundSize: '20px 20px' 
             }}>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center min-w-[80px]">
             <div className="flex items-center gap-2 mb-1">
                <Activity style={{ color: accentColor }} size={16} className={bpm > 0 ? "animate-pulse" : ""} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Live Vitals
                </span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-mono font-black tracking-tighter transition-colors duration-500`} style={{ color: accentColor }}>
                    {bpm}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">BPM</span>
            </div>
        </div>

        {/* The Graph */}
        <div className="relative h-16 flex-1 mx-4 overflow-hidden">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible relative z-10">
                <path 
                    d={pathData} 
                    fill="none" 
                    stroke={accentColor} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="transition-all duration-500"
                />
            </svg>
            {/* Fade Mask for moving effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/80 dark:to-[#0f172a]/80 z-20"></div>
        </div>

        <div className="relative z-10 text-right min-w-[80px]">
             <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70" style={{ color: accentColor }}>
                {progress >= 0.8 ? 'Optimal' : progress >= 0.4 ? 'Stable' : 'Critical'}
             </div>
             <div className="flex flex-col items-end">
                 <span className="text-[10px] font-mono text-slate-400 font-bold">{completed}/{total} Tasks</span>
             </div>
        </div>
    </div>
  );
};

// --- ISOLATED QUICK ACCESS COMPONENT (Optimized) ---
const QuickAccessSlideshow = ({ onNavigate, isCrescere }: { onNavigate: (item: NavigationItem) => void, isCrescere: boolean }) => {
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    
    const quickLinks = [
        { label: 'Clinical Tools', icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Calculators & Scales' },
        { label: 'Resource Hub', icon: Library, color: 'text-purple-500', bg: 'bg-purple-500/10', desc: 'Review Materials' },
        { label: 'Exam TOS', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Blueprint Tracking' },
    ];
    const activeLink = quickLinks[carouselIndex];

    // Pauses animation when tab is not active to save resources
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsPaused(document.hidden);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setCarouselIndex((prev) => (prev + 1) % quickLinks.length);
        }, 8000); // 8 seconds per slide for less churn
        return () => clearInterval(interval);
    }, [isPaused, quickLinks.length]);

    return (
        <div 
            className="w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <button
                // Removed key here to prevent full unmount/remount
                onClick={() => onNavigate(activeLink.label as NavigationItem)}
                className={`
                    group w-full relative flex flex-row items-center p-4 rounded-3xl border transition-all duration-300
                    ${isCrescere 
                        ? 'bg-white/60 border-white/60 hover:bg-white/80' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }
                    hover:-translate-y-1 hover:shadow-lg overflow-hidden
                `}
            >
                {/* Key only the changing content for animation */}
                <div key={activeLink.label} className="contents animate-fade-in">
                    <div className={`p-3 rounded-2xl transition-colors duration-500 ${activeLink.bg} ${activeLink.color} shrink-0`}>
                        <activeLink.icon size={24} />
                    </div>
                    
                    <div className="ml-4 text-left flex-1 min-w-0">
                        <span className="block text-xs font-black uppercase tracking-wider opacity-60 mb-0.5">Quick Access</span>
                        <span className={`block text-lg font-black tracking-tight truncate ${isCrescere ? 'text-slate-800' : 'text-slate-900 dark:text-white'}`}>
                            {activeLink.label}
                        </span>
                        <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {activeLink.desc}
                        </span>
                    </div>
                </div>

                <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-400 group-hover:text-pink-500 dark:group-hover:text-white transition-colors">
                    <ChevronRight size={16} />
                </div>

                {/* Progress Bar for Slide Timing */}
                {!isPaused && (
                    <div className="absolute bottom-0 left-0 h-1 bg-slate-200 dark:bg-slate-700 w-full opacity-30">
                        <div 
                            key={activeLink.label} // Reset animation on slide change
                            className="h-full bg-pink-500 w-full animate-[progress_8s_linear]"
                        ></div>
                    </div>
                )}
                <style>{`@keyframes progress { from { width: 0%; } to { width: 100%; } }`}</style>
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
  
  // Customizable Hero Icon (New Set)
  const [heroIconIndex, setHeroIconIndex] = useState(() => {
      return parseInt(localStorage.getItem('hero_icon_index') || '0');
  });

  const heroIcons = [
      Shield,       // 0: Protection
      Heart,        // 1: Cardio
      Brain,        // 2: Neuro
      Stethoscope,  // 3: Assessment
      Syringe,      // 4: Pharma
      Dna,          // 5: Genetics/Fundamentals
      Crown,        // 6: Goal/Topnotcher
      Zap,          // 7: Emergency
      Microscope    // 8: Research/Patho
  ];
  
  const CurrentHeroIcon = heroIcons[heroIconIndex % heroIcons.length];

  const cycleHeroIcon = () => {
      const nextIndex = (heroIconIndex + 1) % heroIcons.length;
      setHeroIconIndex(nextIndex);
      localStorage.setItem('hero_icon_index', nextIndex.toString());
  };
  
  const loginTracked = useRef(false);
  useEffect(() => {
    if (!loginTracked.current && stats && !streakLoading) {
        trackAction('login');
        loginTracked.current = true;
    }
  }, [trackAction, stats, streakLoading]);

  // --- SORTING LOGIC: High > Medium > Low ---
  const today = new Date();
  const priorityOrder: Record<TaskPriority, number> = { 'High': 0, 'Medium': 1, 'Low': 2 };
  
  const todaysTasks = allTasks
    .filter(t => { 
        try { 
            if (!t.start) return false; 
            return isSameDay(new Date(t.start), today); 
        } catch (e) { return false; } 
    })
    .sort((a, b) => { 
        // 1. Completion Status (Uncompleted first)
        if (a.completed !== b.completed) return a.completed ? 1 : -1; 
        
        // 2. Priority Order (High First)
        const pA = priorityOrder[a.priority] || 1;
        const pB = priorityOrder[b.priority] || 1;
        if (pA !== pB) return pA - pB;
        
        // 3. Time (Earliest First)
        const timeDiff = new Date(a.start).getTime() - new Date(b.start).getTime(); 
        if (timeDiff !== 0) return timeDiff;

        // 4. Stable Tie-Breaker (Creation Time)
        return (a.createdAt || 0) - (b.createdAt || 0);
    });
  
  const completedCount = todaysTasks.filter(t => t.completed).length;
  const progressPercentage = todaysTasks.length === 0 ? 0 : Math.round((completedCount / todaysTasks.length) * 100);
  
  const [greeting, setGreeting] = useState('');
  useEffect(() => { const hour = new Date().getHours(); if (hour < 12) setGreeting('Good Morning'); else if (hour < 18) setGreeting('Good Afternoon'); else setGreeting('Good Evening'); }, []);
  
  const handleQuickAdd = async (e: React.FormEvent) => { e.preventDefault(); if (!newTaskText.trim()) return; const now = new Date(); const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); await addTask({ title: newTaskText.trim(), category: 'Review', priority: 'Medium', start: now.toISOString(), end: oneHourLater.toISOString(), allDay: false }); setNewTaskText(''); };
  
  const cyclePriority = async (e: React.MouseEvent, task: Task) => {
      e.stopPropagation(); 
      e.preventDefault();
      const next: Record<TaskPriority, TaskPriority> = { 'Low': 'Medium', 'Medium': 'High', 'High': 'Low' };
      await updateTask(task.id, { priority: next[task.priority] });
  };

  const cycleCategory = async (e: React.MouseEvent, task: Task) => {
      e.stopPropagation();
      e.preventDefault();
      const categories: TaskCategory[] = ['Review', 'School', 'Duty', 'Personal'];
      const currentIndex = categories.indexOf(task.category);
      const nextCategory = categories[(currentIndex + 1) % categories.length];
      await updateTask(task.id, { category: nextCategory });
  };

  const getTaskVisuals = (task: Task) => {
      // Icons and Colors per category
      switch(task.category) {
          case 'Review': return { icon: BookOpen, color: 'bg-rose-500', text: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-900/50' };
          case 'Duty': return { icon: Briefcase, color: 'bg-blue-500', text: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-border-blue-200 dark:border-blue-900/50' };
          case 'School': return { icon: GraduationCap, color: 'bg-purple-500', text: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-900/50' };
          case 'Personal': return { icon: Coffee, color: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-900/50' };
          default: return { icon: Circle, color: 'bg-slate-500', text: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' };
      }
  };

  const getPriorityColor = (p: TaskPriority) => {
      switch(p) {
          case 'High': return 'bg-red-500';
          case 'Medium': return 'bg-orange-400';
          case 'Low': return 'bg-blue-400';
      }
  };

  const isCrescere = themeMode === 'crescere';
  const isLight = themeMode === 'light';

  // --- GLASSMORPHISM CLASS ---
  const glassCard = `
    group relative 
    ${isCrescere 
        ? 'bg-white/80 border-rose-200' 
        : isLight 
            ? 'bg-white/80 border-slate-200' 
            : 'bg-[#0f172a]/60 border-white/5'
    }
    backdrop-blur-2xl border rounded-[2.5rem] 
    transition-all duration-300 hover:-translate-y-1 
    will-change-transform transform-gpu overflow-hidden shadow-xl
  `;

  // --- RESPONSIVE GRID LOGIC ---
  const isLargeFont = fontSize === 'large' || fontSize === 'extra-large';
  const needsMoreSpace = isSidebarExpanded || isLargeFont;
  
  // Logic for grid: Remove items-start to allow stretching
  const gridClasses = needsMoreSpace
    ? "grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8" 
    : "grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8";
    
  const mainColumnClass = `flex flex-col gap-6 lg:gap-8 h-full ${needsMoreSpace ? 'xl:col-span-2' : 'lg:col-span-2'}`;

  // Logic for Motivation Widget Flex Growth
  // If font is massive, allow natural flow. Otherwise, stretch on desktop to align bottom.
  const motivationWrapperClass = (!isLargeFont) 
    ? "lg:flex-1 flex flex-col" 
    : "flex flex-col";

  // --- THEME ALIGNED BACKGROUND (Clean/Modern) ---
  const heroBackgroundStyle = {
      background: `linear-gradient(135deg, ${isCrescere ? '#fff1f2' : isLight ? '#f8fafc' : '#0f172a'} 0%, ${accentColor}${isLight ? '15' : '20'} 100%)`
  };

  // --- RESTORED PREMIUM GRADIENT FOR NAME ---
  const nameGradientClass = isCrescere 
    ? 'from-rose-500 via-amber-500 to-rose-600'
    : `from-[${accentColor}] via-purple-400 to-[${accentColor}]`; 

  return (
    <div className="w-full pb-24">
        <div className={gridClasses}>
            {/* Left Column (Main) */}
            <div className={mainColumnClass}>
                
                {/* 1. HERO CARD (STRICTLY THEMED & CLEAN) */}
                <div 
                    className={`${glassCard} min-h-[240px] md:min-h-[280px] flex flex-col md:flex-row relative p-8 md:p-10 items-center overflow-hidden border`}
                    style={{ 
                        borderColor: `${accentColor}30`,
                        boxShadow: `0 20px 40px -10px ${accentColor}10`
                    }}
                >
                     {/* Theme-Aligned Background */}
                     <div className="absolute inset-0 transition-colors duration-700" style={heroBackgroundStyle} />
                     
                     {/* Subtle Accent Glow */}
                     <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 pointer-events-none"
                        style={{ background: `radial-gradient(circle at 100% 0%, ${accentColor} 0%, transparent 70%)` }}
                     ></div>
                     
                     {/* Noise Texture */}
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                     
                     {/* Left Content */}
                     <div className="relative z-10 flex-1 flex flex-col justify-center w-full md:w-auto text-center md:text-left items-center md:items-start">
                        
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/60 dark:bg-white/5 border border-white/20 backdrop-blur-md shadow-sm">
                            <Zap size={12} style={{ color: accentColor, fill: 'currentColor' }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                                SYSTEM ONLINE
                            </span>
                        </div>
                        
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[1.1] md:leading-[0.95] mb-3 drop-shadow-sm text-slate-900 dark:text-white">
                            {greeting}, <br/>
                            {/* RESTORED: Premium Gradient Name */}
                            <span 
                                className={`bg-clip-text text-transparent bg-gradient-to-r bg-[length:200%_auto] animate-gradient filter drop-shadow-sm ${nameGradientClass}`}
                                style={!isCrescere ? { backgroundImage: `linear-gradient(to right, ${accentColor}, #a855f7, ${accentColor})` } : {}}
                            >
                                {currentUser?.displayName?.split(' ')[0] || 'Future RN'}
                            </span>.
                        </h1>
                        {/* LYRICS UPDATE */}
                        <p className="font-bold text-xs md:text-sm opacity-70 max-w-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-6 italic">
                            Ikaw ang aawit ng, "Kaya mo 'to" <br />
                            'Sang panalangin sa gitna ng gulo.
                        </p>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                             <button 
                                onClick={() => onNavigate('Pomodoro Timer')} 
                                className="group relative px-8 py-3.5 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden"
                                style={{ 
                                    backgroundColor: accentColor,
                                    boxShadow: `0 10px 30px -5px ${accentColor}50` 
                                }}
                             >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                                <span className="relative flex items-center gap-2">
                                    LOCK IN TIME! <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </div>
                     </div>
                     
                     {/* Right Visual: CLEAN GLASS SPHERE */}
                     <div className="relative z-10 w-full md:w-[35%] h-full hidden md:flex items-center justify-center pl-6">
                         <div 
                            onClick={cycleHeroIcon}
                            className="relative w-40 h-40 cursor-pointer transition-transform hover:scale-105 duration-500 group/prism"
                            title="Click to cycle icon"
                         >
                             {/* Static Glass Orb */}
                             <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 dark:to-transparent backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                                 {/* Specular Shine */}
                                 <div className="absolute top-0 right-0 w-20 h-20 bg-white/40 blur-2xl rounded-full mix-blend-overlay"></div>
                                 
                                 {/* Simple Levitation */}
                                 <div className="animate-[float_6s_ease-in-out_infinite]">
                                     <CurrentHeroIcon 
                                        size={56} 
                                        style={{ color: accentColor, filter: `drop-shadow(0 10px 20px ${accentColor}60)` }} 
                                        strokeWidth={1.5} 
                                     />
                                 </div>
                             </div>
                             <style>{`@keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }`}</style>
                         </div>
                     </div>
                </div>

                {/* 4. DAILY TRIAGE (RESTORED: Needy Ghost + Garden) */}
                <div className={`${glassCard} p-6 md:p-8 flex flex-col h-auto min-h-[380px] relative`}>
                    
                    {/* Garden Overlay at Bottom (Kept) */}
                    <GrowingGarden progress={progressPercentage} accentColor={accentColor} />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="relative group/icon">
                                <div className="absolute inset-0 rounded-2xl blur-md opacity-20" style={{ backgroundColor: accentColor }}></div>
                                <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border bg-white dark:bg-slate-800 ${isCrescere ? 'border-rose-100' : 'border-slate-200 dark:border-white/10'}`}>
                                    <Layers size={24} style={{ color: accentColor }} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tighter leading-none text-slate-900 dark:text-white">Daily Triage</h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full transition-all duration-1000" style={{ width: `${progressPercentage}%`, backgroundColor: accentColor }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{progressPercentage}% Done</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => onNavigate('Planner')} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl text-slate-400 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                            <Calendar size={20} />
                        </button>
                    </div>
                    
                    {/* Input */}
                    <form onSubmit={handleQuickAdd} className="relative z-20 mb-6 group">
                        <div className="relative w-full">
                            <input 
                                id="quick-add-input" 
                                type="text" 
                                value={newTaskText} 
                                onChange={(e) => setNewTaskText(e.target.value)} 
                                placeholder="Add new task..." 
                                className={`w-full pl-5 pr-14 py-4 rounded-2xl outline-none font-bold text-sm shadow-inner border-2 transition-all ${
                                    isCrescere 
                                    ? 'bg-slate-50 border-rose-100 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-rose-300' 
                                    : 'bg-slate-50 dark:bg-[#0B1121] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900'
                                }`} 
                                style={{ borderColor: newTaskText ? accentColor : undefined }}
                            />
                            {/* FIXED: ABSOLUTE POSITIONED BUTTON - CENTERED PROPERLY */}
                            <button 
                                type="submit" 
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-white transition-all hover:scale-110 shadow-md flex items-center justify-center"
                                style={{ backgroundColor: accentColor }}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </form>

                    {/* SCROLLABLE TASK LIST */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 max-h-[300px] min-h-[200px] relative z-10 pb-8">
                        {/* RESTORED: Logic to show Needy Ghost if empty */}
                        {todaysTasks.length === 0 ? (
                            <NeedyGhost accentColor={accentColor} />
                        ) : todaysTasks.map(task => {
                            const visuals = getTaskVisuals(task);
                            const priorityColor = getPriorityColor(task.priority);
                            
                            return (
                                <div key={task.id} className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden ${task.completed ? 'opacity-60 bg-slate-50/50 dark:bg-white/5 border-transparent grayscale' : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-white/5'}`}>
                                    
                                    {/* Priority Indicator Strip */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityColor}`}></div>

                                    {/* Checkbox */}
                                    <button 
                                        onClick={() => toggleTask(task.id, task.completed)} 
                                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ml-2 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 text-transparent'}`}
                                    >
                                        <Check size={12} strokeWidth={4} />
                                    </button>
                                    
                                    {/* Icon Box */}
                                    <div className={`p-2 rounded-xl shrink-0 ${visuals.bg} ${visuals.text}`}>
                                        <visuals.icon size={16} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <button 
                                                onClick={(e) => cycleCategory(e, task)} 
                                                className={`text-[9px] font-black uppercase tracking-wider ${visuals.text} hover:opacity-80 transition-opacity`}
                                                title="Click to change category"
                                            >
                                                {task.category}
                                            </button>
                                            <button 
                                                onClick={(e) => cyclePriority(e, task)}
                                                className="hover:scale-110 transition-transform"
                                                title={`Priority: ${task.priority}`}
                                            >
                                                <Flag size={10} className={`${task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-orange-400' : 'text-blue-400'} fill-current`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions (Slide in on hover) */}
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                        <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Vitals & Daily Knowledge */}
                <div className={`${glassCard} py-4`}>
                   <StudyVitals />
                </div>

                <div className="flex-1 flex flex-col gap-4 min-h-[420px]">
                   <div className="flex items-center justify-between px-2 shrink-0">
                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                            <BookOpen size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Daily Learning</span>
                        </div>
                        <div className="bg-slate-200/50 dark:bg-white/5 p-1 rounded-xl flex gap-1 border border-slate-200/50 dark:border-white/10">
                           <button onClick={() => setDailyWidgetTab('mnemonic')} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${dailyWidgetTab === 'mnemonic' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500'}`} style={{ color: dailyWidgetTab === 'mnemonic' ? accentColor : undefined }}>Mnemonic</button>
                           <button onClick={() => setDailyWidgetTab('recall')} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${dailyWidgetTab === 'recall' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500'}`} style={{ color: dailyWidgetTab === 'recall' ? accentColor : undefined }}>Question</button>
                        </div>
                   </div>
                   <div className="flex-1 rounded-[2.5rem] overflow-hidden relative shadow-lg min-h-[380px]">
                       <div className={`absolute inset-0 w-full h-full transition-all duration-500 transform ${dailyWidgetTab === 'mnemonic' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                           <MnemonicWidget className="h-full" />
                       </div>
                       <div className={`absolute inset-0 w-full h-full transition-all duration-500 transform ${dailyWidgetTab === 'recall' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                           <ActiveRecallWidget className="h-full" />
                       </div>
                   </div>
                </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="flex flex-col gap-6 lg:gap-8 h-full">
                 <div className="min-h-[280px]">
                      {stats && <StreakWidget stats={stats} loading={streakLoading} />}
                 </div>
                 <MissionBoard />
                 
                 {/* 1. MISSION TIMER (Clean & Cohesive) */}
                 <QuantumChronometer />

                 {/* OPTIMIZED: QUICK ACCESS SLIDESHOW (Isolated) */}
                 <QuickAccessSlideshow onNavigate={onNavigate} isCrescere={isCrescere} />
                 
                 {/* 6. MOTIVATION CARD - Conditional Growth */}
                 <div className={motivationWrapperClass}>
                     <MotivationWidget className="h-full" />
                 </div>
            </div>
        </div>
    </div>
  );
};

// --- 1. MISSION TIMER (NATIVE INTEGRATION) ---
const QuantumChronometer = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const { themeMode, accentColor } = useTheme();
    const isCrescere = themeMode === 'crescere';
    const isLight = themeMode === 'light';

    useEffect(() => {
        const timer = setInterval(() => {
            const targetDate = new Date("2026-08-29T07:00:00+08:00");
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();
            if (difference > 0) {
                setTimeLeft({ 
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Reuse the exact same glass styling as Hero/Daily Triage
    const glassCard = `
      bg-white/80 dark:bg-[#0f172a]/60 
      backdrop-blur-2xl border 
      ${isCrescere ? 'border-rose-200' : isLight ? 'border-slate-200' : 'border-white/5'}
      shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300
    `;

    // Static colors for Days/Hrs/Mins (Theme Aligned)
    const textBase = 'text-slate-900 dark:text-slate-100';
    const labelText = 'text-slate-400 dark:text-slate-500';

    // TimeBlock Component - Clean
    const TimeBlock = ({ val, label, isActive = false }: { val: number, label: string, isActive?: boolean }) => (
        <div className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 group/block ${
            isCrescere 
                ? 'bg-white/60 border-rose-100/50 shadow-sm' 
                : isLight
                    ? 'bg-white border-slate-100 shadow-sm'
                    : 'bg-slate-900/50 border-white/5'
        }`}>
            {/* Only seconds get the accent color, others are standard text */}
            <span 
                className="text-3xl md:text-4xl font-mono font-bold tracking-tighter tabular-nums leading-none z-10 transition-colors" 
                style={{ color: isActive ? accentColor : undefined }} 
            >
                <span className={!isActive ? textBase : ''}>
                    {val.toString().padStart(2, '0')}
                </span>
            </span>
            <span className={`text-[9px] font-black uppercase tracking-widest mt-1 opacity-60 z-10 ${labelText}`}>
                {label}
            </span>
        </div>
    );

    return (
        <div className={`relative overflow-hidden rounded-[2.5rem] p-6 flex flex-col justify-between ${glassCard}`}>
             
             {/* Header */}
             <div className="flex justify-between items-center mb-6 relative z-10">
                 <div className="flex items-center gap-3">
                     <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 shadow-inner">
                         <Target size={18} style={{ color: accentColor }} />
                     </div>
                     <div>
                         <h3 className={`text-xs font-black uppercase tracking-widest ${textBase}`}>
                             Mission Timer
                         </h3>
                         <p className={`text-[9px] font-bold ${labelText} mt-0.5`}>PNLE August 2026</p>
                     </div>
                 </div>
                 {/* Live Pulse Dot */}
                 <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: accentColor }}></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: accentColor }}></span>
                 </span>
             </div>

             {/* Main Grid */}
             <div className="grid grid-cols-4 gap-2 relative z-10">
                 <TimeBlock val={timeLeft.days} label="Days" />
                 <TimeBlock val={timeLeft.hours} label="Hrs" />
                 <TimeBlock val={timeLeft.minutes} label="Mins" />
                 <TimeBlock val={timeLeft.seconds} label="Secs" isActive={true} />
             </div>
             
             {/* MOTIVATIONAL QUOTE - STATIC */}
             <div className="mt-6 text-center relative z-10">
                 <p className="text-[10px] font-serif italic text-slate-500 dark:text-slate-400 tracking-widest opacity-80">
                     "Every second brings you closer to that license."
                 </p>
             </div>

             {/* Footer Progress Line */}
             <div className="mt-4 flex items-center gap-3 opacity-80 relative z-10">
                 <div className="h-1.5 flex-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full rounded-full transition-all duration-1000 ease-linear" 
                          style={{ width: '35%', backgroundColor: accentColor }}></div>
                 </div>
             </div>
        </div>
    );
};

export default Dashboard;
