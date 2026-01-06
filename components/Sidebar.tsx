
import React from 'react';
import {
  LayoutDashboard,
  Timer,
  Library,
  BookOpen,
  Folder,
  Calendar,
  GraduationCap,
  X,
  Siren,
  ChevronLeft,
  ChevronRight,
  Target,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
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

const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  onNavigate,
  isOpen,
  onClose,
  isMinimized = false,
  onToggleMinimize,
}) => {
  const { themeMode, reduceMotion, fontSize } = useTheme();

  const navItems: { label: NavigationItem; icon: React.ReactNode; special?: boolean }[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'SLE Quest', icon: <Siren size={20} />, special: true },
    { label: 'Planner', icon: <Calendar size={20} /> },
    { label: 'Pomodoro Timer', icon: <Timer size={20} /> },
    { label: 'Clinical Tools', icon: <Stethoscope size={20} /> },
    { label: 'Resource Hub', icon: <Library size={20} /> },
    { label: 'Exam TOS', icon: <BookOpen size={20} /> },
    { label: 'Personal Folder', icon: <Folder size={20} /> },
  ];

  const isDark = themeMode === 'dark';
  const isCrescere = themeMode === 'crescere';

  // --- DYNAMIC FONT SIZES ---
  const getNavTextSize = () => {
      switch(fontSize) {
          case 'small': return 'text-xs';
          case 'large': return 'text-sm';
          case 'extra-large': return 'text-base';
          default: return 'text-[13px]'; // Normal
      }
  };

  const getLogoTextSize = () => {
      switch(fontSize) {
          case 'small': return 'text-sm';
          case 'large': return 'text-lg';
          case 'extra-large': return 'text-xl';
          default: return 'text-base';
      }
  };

  const getFooterTextSize = () => {
      switch(fontSize) {
          case 'small': return 'text-[8px]';
          case 'large': return 'text-[10px]';
          case 'extra-large': return 'text-[11px]';
          default: return 'text-[9px]';
      }
  };

  const navTextClass = getNavTextSize();
  const logoTextClass = getLogoTextSize();
  const footerTextClass = getFooterTextSize();

  // --- PREMIUM GLASS CONTAINER ---
  // Explicitly handle all 3 modes to prevent layout jumping
  const sidebarContainerClass = isDark
    ? 'bg-[#0B1121]/80 backdrop-blur-[40px] border-r border-white/5 shadow-2xl'
    : isCrescere 
        ? 'bg-white/60 backdrop-blur-[40px] border-r border-white/40 shadow-[20px_0_40px_-10px_rgba(244,63,94,0.05)]'
        : 'bg-white/60 backdrop-blur-[40px] border-r border-slate-200/60 shadow-[20px_0_40px_-10px_rgba(0,0,0,0.05)]';

  const dur = reduceMotion ? 0 : 300;

  // --- DYNAMIC NAV ITEMS ---
  const getNavItemClass = (isActive: boolean, isSpecial?: boolean) => {
    const base = `relative flex items-center transition-all duration-${dur} ease-out font-bold select-none outline-none group w-full cursor-pointer min-h-[3rem] overflow-hidden`;
    // Optimized padding for narrower sidebar
    const layout = isMinimized 
        ? 'justify-center p-0 rounded-xl mx-auto w-10 h-10' 
        : 'justify-start px-3.5 py-2.5 rounded-xl mx-auto w-[92%] gap-3';

    let stateClasses = '';

    if (isSpecial) {
        // Special items (December Quest) - Keep distinct but use dynamic accent for active
        if (isActive) {
             // Active Special: Uses User Accent (Pink-500 map) + Gold
             stateClasses = 'bg-gradient-to-r from-pink-500/10 to-amber-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/30 shadow-[0_0_20px_-5px_rgba(var(--accent-500),0.3)]';
        } else {
             // Inactive Special: Gold/Amber tint (Light), Red tint (Dark)
             stateClasses = 'text-amber-600 dark:text-red-500 hover:bg-amber-500/10 dark:hover:bg-red-500/10';
        }
    } else {
        // Standard Items
        if (isActive) {
            // PREMIUM ACTIVE STATE:
            // Uses the 'pink' utility which maps to var(--accent-500) set by ThemeContext.
            stateClasses = isDark 
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 shadow-[0_0_15px_-3px_rgba(var(--accent-500),0.3)]'
                : 'bg-pink-50 text-pink-600 border border-pink-200 shadow-sm shadow-pink-500/10';
        } else {
            // Hover State
            stateClasses = isDark 
                ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80';
        }
    }

    return `${base} ${layout} ${stateClasses}`;
  };

  // --- LUXURY LOGO STYLES ---
  const companionGradient = isDark
    ? 'bg-gradient-to-r from-pink-300 via-pink-200 to-amber-200' 
    : 'bg-gradient-to-r from-pink-600 via-pink-500 to-amber-500';

  // Logo Icon Background:
  const logoIconClass = isCrescere
    ? 'bg-gradient-to-br from-rose-400 to-amber-300 text-white shadow-lg shadow-rose-500/20'
    : 'bg-gradient-to-br from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/30 ring-1 ring-white/20';

  const ExpandedFooter = (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 border text-center w-full transition-all duration-500 group
        ${isDark
            ? 'bg-white/5 border-white/5 shadow-lg hover:bg-white/10'
            : 'bg-white/40 border-white/60 shadow-lg hover:shadow-xl hover:bg-white/60'
        }
        landscape:p-2 landscape:rounded-xl lg:landscape:p-5 lg:landscape:rounded-3xl
      `}
    >
      {/* Dynamic Shine */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className={`w-full flex items-center justify-between mb-3 gap-2 landscape:mb-1 landscape:justify-center lg:landscape:mb-3 lg:landscape:justify-between`}>
          <p className={`hidden lg:block landscape:hidden lg:landscape:block ${footerTextClass} font-black uppercase tracking-widest flex items-center gap-1.5 opacity-80 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <Target size={12} className="text-pink-500" /> Target
          </p>
          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border backdrop-blur-sm shrink-0 ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white/60 border-slate-200 text-slate-600'}`}>
            PNLE 2026
          </span>
        </div>
        
        {/* Full Date Display - Hidden in Landscape on mobile, shown on desktop */}
        <div className={`flex flex-col items-center mb-3 landscape:hidden lg:landscape:flex`}>
            <span className={`text-3xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>29</span>
            <span className={`${footerTextClass} font-black uppercase tracking-[0.3em] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>August</span>
        </div>

        {/* Compact Date Display - Mobile Landscape Only */}
        <div className="hidden landscape:block lg:landscape:hidden text-[10px] font-black uppercase tracking-widest mb-1 opacity-80 text-slate-500 dark:text-slate-400">
            Aug 29
        </div>
        
        {/* Dynamic Progress Bar */}
        <div className={`relative h-1.5 w-full rounded-full overflow-hidden mb-3 landscape:h-1 lg:landscape:h-1.5 ${isDark ? 'bg-white/10' : 'bg-slate-200/50'}`}>
            <div className="relative h-full w-[25%] rounded-full bg-gradient-to-r from-pink-500 to-pink-400 shadow-[0_0_10px_rgba(var(--accent-500),0.5)]">
                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
            </div>
        </div>
        
        {/* Quote - Hidden in Landscape on mobile */}
        <div className={`flex items-center justify-center gap-1.5 opacity-80 landscape:hidden lg:landscape:flex`}>
            <Sparkles size={10} className="text-amber-400" />
            <p className={`${footerTextClass} font-bold italic truncate max-w-full ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>"Trust the process"</p>
        </div>
      </div>
    </div>
  );

  const handleLogoClick = () => {
    onNavigate('Dashboard');
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div className={`fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />

      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:relative flex flex-col h-full
          ${sidebarContainerClass}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
          ${isMinimized ? 'lg:w-[4.5rem]' : 'lg:w-64'} 
          md:rounded-r-[2.5rem]
          w-[clamp(260px,80vw,18rem)]`}
      >
        {/* Minimize Toggle */}
        {onToggleMinimize && (
          <button
            onClick={onToggleMinimize}
            className={`hidden lg:flex absolute -right-3 top-10 w-6 h-6 rounded-full items-center justify-center z-[60] shadow-lg border transition-all active:scale-90 hover:scale-110
              ${isDark 
                ? 'bg-slate-800 border-white/10 text-slate-400 hover:text-white' 
                : 'bg-white border-slate-100 text-slate-400 hover:text-slate-800'}`}
          >
            {isMinimized ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        )}

        {/* --- LOGO HEADER --- */}
        <div className={`flex-none p-5 transition-all duration-300 ${isMinimized ? 'lg:p-0 lg:h-20 lg:flex lg:items-center lg:justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <button 
                onClick={handleLogoClick}
                className={`relative p-2.5 rounded-2xl shrink-0 overflow-hidden transition-transform hover:scale-105 active:scale-95 ${logoIconClass} ${isMinimized ? 'p-2' : ''}`}
                title="Go to Dashboard"
            >
              <GraduationCap size={isMinimized ? 20 : 22} className="relative z-10" />
              {/* Icon Shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-50" />
            </button>
            
            <div 
                onClick={handleLogoClick}
                className={`flex flex-col justify-center min-w-0 transition-opacity duration-300 cursor-pointer ${isMinimized ? 'lg:hidden' : 'block'}`}
            >
                <h1 className={`font-black ${logoTextClass} leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Review <br/>
                  <span className="flex items-center gap-1.5">
                    {/* PREMIUM GRADIENT TEXT */}
                    <span className={`${companionGradient} bg-clip-text text-transparent filter drop-shadow-sm`}>
                        Companion
                    </span>
                    <span className="text-sm filter drop-shadow-sm transform hover:rotate-12 transition-transform cursor-default">🌸</span>
                  </span>
                </h1>
            </div>
            <button onClick={onClose} className="lg:hidden ml-auto p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={20} /></button>
          </div>
        </div>

        {/* --- NAVIGATION LIST --- */}
        <nav className={`flex-1 min-h-0 overflow-y-auto custom-scrollbar py-2 space-y-1.5 ${isMinimized ? 'px-2' : 'px-3'}`}>
          {navItems.map(item => {
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
                {/* Active Indicator Glow (Left) - Only for standard items */}
                {isActive && !isMinimized && !item.special && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full bg-pink-500 shadow-[0_0_10px_rgb(var(--accent-500))]" />
                )}

                <span className={`relative z-10 flex items-center justify-center shrink-0 w-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                </span>
                
                <span className={`relative z-10 ${navTextClass} font-bold tracking-tight text-left transition-opacity duration-200 ${isMinimized ? 'lg:hidden' : 'block'}`}>
                  {item.label}
                </span>
                
                {/* Active Dot (Right) - For minimized state */}
                {isMinimized && isActive && (
                  <div className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_5px_rgb(var(--accent-500))]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* --- FOOTER SECTION --- */}
        <div className={`flex-none transition-all duration-300 ${isMinimized ? 'p-0 h-24 flex items-center justify-center' : 'p-5'}`}>
          {!isMinimized && ExpandedFooter}
          {isMinimized && (
             <div className="hidden lg:flex justify-center relative group/target">
                 <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl border transition-all overflow-hidden cursor-help ${isDark ? 'bg-white/5 border-white/5 shadow-lg' : 'bg-white border-slate-200 shadow-lg'}`}>
                    <div className={`w-full py-0.5 text-center text-[7px] font-black uppercase leading-none border-b ${isDark ? 'bg-white/5 text-slate-400 border-white/5' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>Aug</div>
                    <div className={`flex-1 flex items-center justify-center text-xs font-black leading-none ${isDark ? 'text-white' : 'text-slate-800'}`}>29</div>
                 </div>
                 
                 {/* Tooltip */}
                 <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-wider whitespace-nowrap rounded-xl shadow-xl opacity-0 translate-x-2 group-hover/target:opacity-100 group-hover/target:translate-x-0 transition-all pointer-events-none z-50 border border-white/10 dark:border-slate-200">
                    Target: PNLE 2026
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-6 border-transparent border-r-slate-900 dark:border-r-white"></div>
                 </div>
             </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
