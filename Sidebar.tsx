
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
  const { themeMode, reduceMotion } = useTheme();

  const navItems: { label: NavigationItem; icon: React.ReactNode; special?: boolean }[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
    { label: 'December Quest', icon: <Siren size={22} />, special: true },
    { label: 'Planner', icon: <Calendar size={22} /> },
    { label: 'Pomodoro Timer', icon: <Timer size={22} /> },
    { label: 'Clinical Tools', icon: <Stethoscope size={22} /> },
    { label: 'Resource Hub', icon: <Library size={22} /> },
    { label: 'Exam TOS', icon: <BookOpen size={22} /> },
    { label: 'Personal Folder', icon: <Folder size={22} /> },
  ];

  const isCrescere = themeMode === 'crescere';
  const isDark = themeMode === 'dark';

  const sidebarContainerClass = isCrescere
    ? 'bg-white/60 backdrop-blur-3xl border-r border-white/40 shadow-[4px_0_30px_-5px_rgba(244,63,94,0.15)]'
    : isDark
      ? 'bg-[#020617]/95 backdrop-blur-2xl border-r border-white/5 shadow-2xl shadow-black/50'
      : 'bg-slate-50/90 backdrop-blur-2xl border-r border-slate-200/60 shadow-xl lg:shadow-slate-200/20';

  const dur = reduceMotion ? 0 : 200;

  const getNavItemClass = (isActive: boolean, isSpecial?: boolean) => {
    // Base layout: responsive padding, rounded corners, margin for separation
    const base = `relative flex items-center transition-all duration-${dur} ease-in-out font-medium select-none outline-none group overflow-hidden`;
    
    // Improved Layout: Better padding and spacing for text alignment
    const layout = isMinimized
        ? 'lg:w-12 lg:h-12 lg:justify-center lg:p-0 lg:rounded-2xl lg:mx-auto mb-2 w-[calc(100%-16px)] px-4 py-3.5 justify-start rounded-xl mx-2 gap-3' 
        : 'w-[calc(100%-16px)] mx-2 px-4 py-3.5 justify-start rounded-xl mb-1 gap-3';

    let themeClasses = '';

    if (isSpecial) {
        // --- DECEMBER QUEST LOGIC ---
        if (isCrescere) {
            // Crescere: Special Gradient Experience
            if (isActive) themeClasses = 'bg-gradient-to-r from-amber-100 via-orange-50 to-amber-50 text-amber-900 border border-amber-200 shadow-md ring-1 ring-amber-300/50 font-bold';
            else themeClasses = 'text-amber-700 hover:bg-amber-50 hover:text-amber-900 hover:shadow-sm';
        } else if (isDark) {
            // Dark Mode: DEFAULT RED (Neon/Cyberpunk vibe)
            if (isActive) themeClasses = 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.2)] font-bold';
            else themeClasses = 'text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:shadow-[0_0_10px_rgba(220,38,38,0.1)]';
        } else {
            // Light Mode: DEFAULT YELLOW (Sunny/Alert vibe)
            if (isActive) themeClasses = 'bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm font-bold';
            else themeClasses = 'text-yellow-600 hover:bg-yellow-50 hover:text-yellow-800';
        }
    } else {
        // --- STANDARD ITEM LOGIC (Companion Theme) ---
        if (isActive) {
            if (isCrescere) {
                // Crescere: Rose Theme
                themeClasses = 'bg-rose-50 text-rose-600 shadow-sm border border-rose-100 font-bold';
            } else if (isDark) {
                // Dark: Pink Brand Theme (Subtle Glow)
                themeClasses = 'bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold shadow-[0_0_10px_rgba(236,72,153,0.1)]';
            } else {
                // Light: Pink Brand Theme (Clean)
                themeClasses = 'bg-pink-50 text-pink-600 border border-pink-100 font-bold shadow-sm';
            }
        } else {
            // Inactive Standard
            if (isCrescere) {
                themeClasses = 'text-slate-600 hover:bg-rose-50/50 hover:text-rose-700';
            } else if (isDark) {
                themeClasses = 'text-slate-400 hover:bg-white/5 hover:text-pink-300';
            } else {
                themeClasses = 'text-slate-500 hover:bg-slate-100 hover:text-pink-600';
            }
        }
    }

    return `${base} ${layout} ${themeClasses}`;
  };

  // Aesthetic Visual Effects for "Companion" text
  const companionClass = isCrescere
    ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 bg-[length:200%_auto] animate-[gradient_4s_ease_infinite] text-transparent bg-clip-text filter drop-shadow-sm'
    : isDark
      ? 'bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-[length:200%_auto] animate-[gradient_4s_ease_infinite] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]'
      : 'bg-gradient-to-r from-pink-600 to-rose-600 text-transparent bg-clip-text';

  const logoBase =
    `relative p-3 rounded-2xl shrink-0 overflow-hidden
     transition-all duration-[${dur}ms] [transition-timing-function:linear]
     will-change-transform`;

  const logoBg = isCrescere
    ? 'bg-gradient-to-br from-rose-500 via-rose-400 to-amber-400 text-white shadow-lg shadow-rose-500/20'
    : 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20';

  const logoGlow = isCrescere
    ? 'from-white/0 via-white/40 to-white/0'
    : isDark
      ? 'from-white/0 via-pink-300/35 to-white/0'
      : 'from-white/0 via-pink-400/30 to-white/0';

  // Render helpers for Footer to keep JSX clean
  const MinimizedFooter = (
    <div
      className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center border cursor-help relative group
        transition-colors duration-[${dur}ms]
        ${isCrescere
          ? 'bg-white/40 border-rose-100 text-rose-500 hover:bg-rose-50'
          : isDark
            ? 'bg-white/5 border-white/5 text-pink-400 hover:bg-white/10'
            : 'bg-white border-slate-200 text-pink-500 hover:bg-pink-50'
        }`}
    >
      <Target size={20} />
      {/* Tooltip for Minimized Footer */}
      <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none z-50 shadow-xl">
        Target: Aug 29, 2026
      </div>
    </div>
  );

  const ExpandedFooter = (
    <div
      className={`rc-footer group relative overflow-hidden rounded-[1.5rem] p-5 border text-center
        transition-[background-color,border-color,box-shadow] duration-[${dur}ms]
        ${isCrescere
          ? 'bg-gradient-to-br from-white/85 via-white/70 to-rose-50/50 border-rose-100 shadow-[0_10px_30px_-18px_rgba(244,63,94,0.35)]'
          : isDark
            ? 'bg-gradient-to-br from-white/5 via-white/5 to-transparent border-white/10 shadow-lg'
            : 'bg-gradient-to-br from-white via-white to-slate-50 border-slate-200/70 shadow-lg shadow-slate-200/50'
        }`}
    >
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3">
          <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-80 ${isCrescere ? 'text-rose-600' : isDark ? 'text-slate-400' : 'text-slate-400'}`}>
            <Target size={12} className={isCrescere ? 'text-rose-500' : 'text-pink-500'} />
            Target
          </p>

          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-md border backdrop-blur
              ${isCrescere
                ? 'bg-white/60 border-rose-100 text-rose-600'
                : isDark
                  ? 'bg-white/5 border-white/10 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-600'}`}
          >
            PNLE 2026
          </span>
        </div>

        <div className="flex flex-col items-center mb-4">
          <span className={`text-4xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-800'}`}>
            29
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-[0.25em] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            August
          </span>
        </div>

        <div className={`relative h-1.5 w-full rounded-full overflow-hidden mb-3 ${isDark ? 'bg-white/10' : 'bg-slate-200/60'}`}>
          <div className={`relative h-full w-[25%] rounded-full ${isCrescere ? 'bg-gradient-to-r from-rose-400 to-amber-400' : 'bg-gradient-to-r from-pink-500 to-purple-500'}`}>
            <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 opacity-85">
          <Sparkles size={12} className={isCrescere ? 'text-amber-500' : 'text-yellow-500'} />
          <p className={`text-[10px] font-bold italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            "Trust the process"
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes rc_logo_sheen {
          0% { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(140%) skewX(-18deg); opacity: 0; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .rc-logo:hover .rc-sheen { animation: rc_logo_sheen 700ms linear forwards; }
        .rc-logo:hover .rc-cap { transform: translateY(-1px) rotate(-3deg); }
        .rc-logo:hover .rc-ring { opacity: 1; transform: scale(1.06); }
      `}</style>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 h-full lg:static flex flex-col
          ${sidebarContainerClass}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
          ${isMinimized ? 'lg:w-[88px]' : 'lg:w-[280px]'}
          w-[280px]`}
      >
        {/* Toggle (Desktop) */}
        {onToggleMinimize && (
          <button
            onClick={onToggleMinimize}
            className={`hidden lg:flex absolute -right-3 top-9 w-6 h-6 rounded-full items-center justify-center z-50 shadow-md border
              transition-colors duration-200
              ${isCrescere
                ? 'bg-white border-rose-100 text-rose-400 hover:text-rose-600'
                : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-800'
              }`}
            aria-label={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}

        {/* Header */}
        <div
          className={`pt-6 pb-2 ${isMinimized ? 'px-0 flex justify-center' : 'px-6'} transition-all duration-300`}
        >
          <div className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-3'} mb-2`}>
            {/* Logo */}
            <button
              type="button"
              className={`rc-logo ${logoBase} ${logoBg}`}
              aria-label="App logo"
              title="Review Companion"
            >
              <div className={`rc-ring absolute inset-0 rounded-2xl opacity-0 pointer-events-none transition-all duration-300 ${isCrescere ? 'ring-2 ring-rose-200/60' : 'ring-2 ring-pink-400/30'}`} />
              <div className={`rc-sheen absolute inset-0 bg-gradient-to-tr ${logoGlow} -translate-x-[160%] skew-x-[-18deg] opacity-0 pointer-events-none`} />
              <GraduationCap
                size={24}
                className={`rc-cap relative z-10 drop-shadow-sm transition-transform duration-300`}
              />
            </button>

            {/* Header label - Hidden if minimized on desktop */}
            <div className={`min-w-0 overflow-hidden transition-all duration-300 ${isMinimized ? 'w-0 opacity-0 lg:hidden' : 'w-auto opacity-100'}`}>
              <div className="flex flex-col leading-none">
                <h1 className={`font-black text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Review <br/>
                  <span className="flex items-center gap-1">
                    <span className={companionClass}>Companion</span>
                    <span className="inline-block animate-[spin_10s_linear_infinite] origin-center text-lg filter drop-shadow-sm">🌸</span>
                  </span>
                </h1>
                <div className="flex items-center gap-1.5 mt-1.5 opacity-90">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Crescere '26
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Close */}
            <button
              onClick={onClose}
              className="lg:hidden ml-auto p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-1">
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
                {/* Icon */}
                <span className={`relative z-10 flex items-center justify-center shrink-0 w-6`}>
                  {item.icon}
                </span>

                {/* Label - Improved Wrapping/Truncation */}
                <span className={`relative z-10 text-sm font-medium tracking-tight whitespace-nowrap truncate transition-all duration-300 ${isMinimized ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'w-auto opacity-100'}`}>
                  {item.label}
                </span>

                {/* Minimized Indicator Dot */}
                {isMinimized && isActive && (
                  <div className={`absolute right-2 top-2 w-1.5 h-1.5 rounded-full hidden lg:block ${isCrescere ? 'bg-rose-500' : item.special ? 'bg-amber-500' : 'bg-pink-500'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`mt-auto p-4 transition-all duration-300`}>
          {isMinimized ? (
            <>
                <div className="hidden lg:block">
                    {MinimizedFooter}
                </div>
                <div className="block lg:hidden">
                    {ExpandedFooter}
                </div>
            </>
          ) : (
            ExpandedFooter
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
