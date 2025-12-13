
import React from 'react';
import { LayoutDashboard, Timer, Library, BookOpen, Folder, Calendar, GraduationCap, X, Siren, ChevronLeft, ChevronRight, Target, Sparkles } from 'lucide-react';
import { NavigationItem } from '../types';
import { useTheme } from '../ThemeContext';

interface SidebarProps {
  activeItem: NavigationItem;
  onNavigate: (item: NavigationItem) => void;
  isOpen: boolean;
  onClose: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate, isOpen, onClose, isMinimized = false, onToggleMinimize }) => {
  const { themeMode } = useTheme();
  
  const navItems: { label: NavigationItem; icon: React.ReactNode; special?: boolean }[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
    { label: 'December Quest', icon: <Siren size={22} />, special: true },
    { label: 'Planner', icon: <Calendar size={22} /> },
    { label: 'Pomodoro Timer', icon: <Timer size={22} /> },
    { label: 'Resource Hub', icon: <Library size={22} /> },
    { label: 'Exam TOS', icon: <BookOpen size={22} /> },
    { label: 'Personal Folder', icon: <Folder size={22} /> },
  ];

  // --- THEME CONFIGURATION ---
  const isCrescere = themeMode === 'crescere';
  const isDark = themeMode === 'dark';

  // 1. Container Styles - Breathable Glass & Depth
  const sidebarContainerClass = isCrescere
    ? 'bg-white/60 backdrop-blur-3xl border-r border-white/40 shadow-[4px_0_30px_-5px_rgba(244,63,94,0.15)]' 
    : isDark
        ? 'bg-[#020617]/80 backdrop-blur-2xl border-r border-white/5 shadow-2xl shadow-black/50' 
        : 'bg-white/80 backdrop-blur-2xl border-r border-slate-200/60 shadow-xl lg:shadow-slate-200/20';

  // 2. Navigation Item Styles Generator
  const getNavItemClass = (isActive: boolean, isSpecial?: boolean) => {
      // GPU-optimized base transitions - Smoother 600ms bezier for luxury feel
      const base = "relative flex items-center w-full transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group select-none cursor-pointer outline-none overflow-hidden will-change-transform";
      
      // Dynamic spacing based on minimization
      const spacing = isMinimized 
        ? "justify-center p-3 rounded-3xl mb-4 mx-auto aspect-square" 
        : "px-6 py-4 rounded-3xl mb-2 mx-0 gap-4"; // Increased padding for comfort

      // --- SPECIAL ITEM LOGIC (December Quest) ---
      if (isSpecial) {
          if (isActive) {
              if (isCrescere) return `${base} ${spacing} bg-gradient-to-r from-rose-50 via-white to-rose-50 text-rose-600 shadow-md shadow-rose-200/40 border border-rose-100 transform scale-[1.02]`;
              if (isDark) return `${base} ${spacing} bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]`;
              return `${base} ${spacing} bg-pink-50 text-pink-600 font-bold border border-pink-100 shadow-sm`;
          } else {
              if (isDark) {
                  return `${base} ${spacing} text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]`;
              }
              return `${base} ${spacing} text-amber-600 hover:text-amber-700 bg-amber-50/30 hover:bg-amber-50 border border-amber-100/50 hover:border-amber-200 hover:shadow-sm`;
          }
      }

      // --- STANDARD ITEM LOGIC ---
      if (isCrescere) {
          if (isActive) {
              return `${base} ${spacing} bg-gradient-to-r from-rose-50/90 via-white/90 to-rose-50/90 backdrop-blur-md text-rose-700 font-bold border border-rose-100 shadow-[0_4px_12px_-2px_rgba(244,63,94,0.15)] transform scale-[1.02]`;
          }
          return `${base} ${spacing} text-slate-500 hover:text-rose-600 hover:bg-white/60 border border-transparent hover:border-rose-100/50 hover:shadow-sm hover:translate-x-1`;
      } 
      
      if (isDark) {
          if (isActive) {
              return `${base} ${spacing} bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.2)] font-bold`;
          }
          return `${base} ${spacing} text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent hover:translate-x-1`;
      } 
      
      if (isActive) {
          return `${base} ${spacing} bg-pink-50 text-pink-700 font-bold border border-pink-100 shadow-sm`;
      }
      return `${base} ${spacing} text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:translate-x-1`;
  };

  return (
    <>
      <style>{`
        @keyframes flower-breathe {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.15) rotate(5deg); opacity: 1; filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.4)); }
        }
        .animate-flower-breathe {
          animation: flower-breathe 4s ease-in-out infinite;
        }
        @keyframes shine {
            from { transform: translateX(-150%) skewX(-20deg); }
            to { transform: translateX(150%) skewX(-20deg); }
        }
      `}</style>

      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Main Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 h-full transform transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] lg:static flex flex-col will-change-transform
        ${sidebarContainerClass}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        ${isMinimized ? 'lg:w-[100px]' : 'lg:w-80'} 
        w-80`} 
      >
        
        {/* Toggle (Desktop) */}
        {onToggleMinimize && (
            <button 
                onClick={onToggleMinimize}
                className={`hidden lg:flex absolute -right-3 top-10 w-7 h-7 rounded-full items-center justify-center transition-all duration-300 z-50 shadow-md border group
                ${isCrescere 
                    ? 'bg-white border-rose-100 text-rose-400 hover:scale-110 hover:text-rose-600 hover:shadow-rose-100' 
                    : isDark 
                        ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600' 
                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-800'}`}
            >
                {isMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        )}

        {/* --- HEADER SECTION --- */}
        {/* Adjusted spacing to fix "suffocating" feeling. Reduced pt-12 to pt-8, added pr-4 to prevent button overlap */}
        <div className={`pt-8 pb-6 transition-all duration-500 ${isMinimized ? 'px-4' : 'px-8'}`}>
          <div className={`flex items-center ${isMinimized ? 'justify-center flex-col gap-6' : 'gap-4'} mb-2`}>
             
             {/* Logo Icon - UPDATED ANIMATION & GRADIENT */}
             <div className={`relative p-3.5 rounded-2xl shrink-0 overflow-hidden group/logo cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:-rotate-3 hover:shadow-2xl
                ${isCrescere 
                    ? 'bg-gradient-to-br from-rose-500 via-rose-400 to-amber-400 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40' 
                    : 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40'}
             `}>
                {/* Shine Overlay */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-[200%] skew-x-[-20deg] group-hover/logo:animate-[shine_0.8s_ease-in-out_forwards] z-10" />
                
                <GraduationCap size={26} className="relative z-20 drop-shadow-sm transition-transform duration-300 group-hover/logo:scale-95" />
             </div>
             
             {/* Logo Text (Hidden if minimized) */}
             {/* Added pr-4 to prevent overlap with the collapse button */}
             {!isMinimized && (
                <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500 pr-4">
                  <h1 className={`font-black text-xl leading-none tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Review<span className={isCrescere ? 'text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500' : 'text-pink-500'}>Companion</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-2 opacity-90">
                      <span className="text-sm animate-flower-breathe leading-none filter drop-shadow-sm select-none">🌸</span>
                      <span className={`text-[10px] font-bold uppercase tracking-[0.25em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          Batch Crescere
                      </span>
                  </div>
                </div>
             )}

             {/* Mobile Close */}
             <button onClick={onClose} className="lg:hidden ml-auto p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
               <X size={20} />
             </button>
          </div>
        </div>

        {/* --- NAVIGATION SECTION --- */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar px-6 space-y-2 py-2`}>
            {navItems.map((item) => {
              const isActive = activeItem === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    onNavigate(item.label);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={getNavItemClass(isActive, item.special)}
                  title={isMinimized ? item.label : ''}
                >
                  {/* Icon Wrapper */}
                  <span className={`transition-transform duration-500 relative z-10 flex items-center justify-center
                      ${isActive ? 'scale-110' : 'group-hover:scale-110'} 
                      ${item.special && !isActive ? 'animate-pulse' : ''}
                  `}>
                    {item.icon}
                  </span>
                  
                  {/* Label - Increased font size to text-[17px] for better legibility */}
                  {!isMinimized && (
                      <span className={`text-[17px] font-medium tracking-tight relative z-10 animate-in fade-in slide-in-from-left-2 duration-300 ${isActive ? 'font-bold' : ''}`}>
                          {item.label}
                      </span>
                  )}

                  {/* Active Indicator (Dot) for Minimized */}
                  {isMinimized && isActive && (
                      <div className={`absolute right-1.5 top-1.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-black ${isCrescere ? 'bg-rose-500' : 'bg-pink-500'}`}></div>
                  )}
                </button>
              );
            })}
        </div>

        {/* --- FOOTER WIDGET --- */}
        <div className={`mt-auto p-6 transition-all duration-500`}>
          {isMinimized ? (
              <div className={`w-full aspect-square rounded-2xl flex items-center justify-center border transition-all duration-300 cursor-help relative group
                  ${isCrescere 
                      ? 'bg-white/40 border-rose-100 text-rose-500 hover:bg-rose-50' 
                      : isDark 
                          ? 'bg-white/5 border-white/5 text-pink-400 hover:bg-white/10' 
                          : 'bg-white/50 border-slate-200 text-pink-500 hover:bg-pink-50'}`}
              >
                  <Target size={24} />
                  {/* Tooltip */}
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                      Aug 29, 2026
                  </div>
              </div>
          ) : (
              <div className={`relative overflow-hidden rounded-[1.5rem] p-5 border transition-all duration-500 group cursor-default text-center
                  ${isCrescere 
                      ? 'bg-gradient-to-br from-white/80 to-rose-50/50 border-rose-100 shadow-sm hover:shadow-rose-100/50' 
                      : isDark 
                          ? 'bg-gradient-to-br from-white/5 to-white/0 border-white/5' 
                          : 'bg-white/80 border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1'}
              `}>
                 {/* Background Glow */}
                 <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[50px] transition-colors duration-500 group-hover:opacity-100
                     ${isCrescere ? 'bg-rose-500/30' : 'bg-pink-500/20'}`}>
                 </div>
                 
                 <div className="relative z-10 flex flex-col items-center">
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity
                        ${isCrescere ? 'text-rose-500' : isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                        <Target size={10} className={isCrescere ? 'text-rose-500' : 'text-pink-500'} />
                        Target Date
                    </p>
                    
                    {/* Compact Date Display (Reduced from text-5xl to text-4xl) */}
                    <div className="flex flex-col items-center mb-4">
                        <span className={`text-4xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            29
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-[0.3em] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Aug 2026
                        </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className={`h-1 w-full rounded-full overflow-hidden mb-3
                        ${isDark ? 'bg-white/10' : 'bg-slate-200/50'}`}>
                        <div className={`h-full w-[25%] rounded-full relative overflow-hidden transition-all duration-1000 group-hover:w-[30%]
                            ${isCrescere ? 'bg-gradient-to-r from-rose-400 to-amber-400' : 'bg-gradient-to-r from-pink-500 to-purple-500'}`}>
                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                    
                    {/* Perfectly Center-aligned Quote */}
                    <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                        <Sparkles size={10} className={isCrescere ? 'text-amber-500 animate-pulse' : 'text-yellow-500 animate-pulse'} />
                        <p className={`text-[10px] font-bold italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            "Trust the process"
                        </p>
                    </div>
                 </div>
              </div>
          )}
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
