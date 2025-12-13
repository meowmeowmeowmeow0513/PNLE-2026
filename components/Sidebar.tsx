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
      ? 'bg-[#020617]/80 backdrop-blur-2xl border-r border-white/5 shadow-2xl shadow-black/50'
      : 'bg-white/80 backdrop-blur-2xl border-r border-slate-200/60 shadow-xl lg:shadow-slate-200/20';

  const dur = reduceMotion ? 0 : 240;

  const getNavItemClass = (isActive: boolean, isSpecial?: boolean) => {
    const base =
      `relative flex items-center w-full select-none cursor-pointer outline-none overflow-hidden
       transition-all duration-[${dur}ms] [transition-timing-function:linear]`;

    // Responsive Spacing:
    // Mobile/Default: Tighter padding (px-4 py-3) to accommodate larger text
    // Desktop (md+): Standard padding (px-6 py-4)
    // Desktop Minimized (lg+): Compact centered
    const layoutClasses = isMinimized
      ? 'px-4 py-3 md:px-6 md:py-4 rounded-2xl mb-2 mx-0 gap-4 justify-start lg:px-0 lg:py-0 lg:p-3 lg:rounded-2xl lg:mb-3 lg:mx-auto lg:aspect-square lg:justify-center lg:gap-0'
      : 'px-4 py-3 md:px-6 md:py-4 rounded-2xl mb-2 mx-0 gap-4 justify-start';

    let colorClasses = '';

    if (isSpecial) {
      if (isActive) {
        if (isCrescere) colorClasses = `bg-gradient-to-r from-rose-50 via-white to-rose-50 text-rose-600 shadow-md shadow-rose-200/40 border border-rose-100`;
        else if (isDark) colorClasses = `bg-pink-500/10 text-pink-400 border border-pink-500/20`;
        else colorClasses = `bg-pink-50 text-pink-600 font-bold border border-pink-100`;
      } else {
        if (isDark) colorClasses = `text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent`;
        else colorClasses = `text-amber-600 hover:text-amber-700 bg-amber-50/30 hover:bg-amber-50 border border-amber-100/50`;
      }
    } else if (isCrescere) {
      if (isActive) colorClasses = `bg-gradient-to-r from-rose-50/90 via-white/90 to-rose-50/90 text-rose-700 font-bold border border-rose-100 shadow-[0_4px_12px_-2px_rgba(244,63,94,0.15)]`;
      else colorClasses = `text-slate-500 hover:text-rose-600 hover:bg-white/60 border border-transparent`;
    } else if (isDark) {
      if (isActive) colorClasses = `bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold`;
      else colorClasses = `text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent`;
    } else {
      if (isActive) colorClasses = `bg-pink-50 text-pink-700 font-bold border border-pink-100 shadow-sm`;
      else colorClasses = `text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent`;
    }

    return `${base} ${layoutClasses} ${colorClasses}`;
  };

  const logoBase =
    `relative p-3.5 rounded-2xl shrink-0 overflow-hidden
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

  const labelMotion = reduceMotion
    ? ''
    : `transition-[opacity,transform] duration-[${dur}ms] [transition-timing-function:linear]`;

  // Render helpers for Footer to keep JSX clean
  const MinimizedFooter = (
    <div
      className={`w-full aspect-square rounded-2xl flex items-center justify-center border cursor-help relative group
        transition-colors duration-[${dur}ms] [transition-timing-function:linear]
        ${isCrescere
          ? 'bg-white/40 border-rose-100 text-rose-500 hover:bg-rose-50'
          : isDark
            ? 'bg-white/5 border-white/5 text-pink-400 hover:bg-white/10'
            : 'bg-white/50 border-slate-200 text-pink-500 hover:bg-pink-50'
        }`}
    >
      <Target size={24} />
      <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none z-50 shadow-xl">
        Aug 29, 2026
      </div>
    </div>
  );

  const ExpandedFooter = (
    <div
      className={`rc-footer group relative overflow-hidden rounded-[1.75rem] p-5 border text-center
        transition-[background-color,border-color,box-shadow] duration-[${dur}ms] [transition-timing-function:linear]
        ${isCrescere
          ? 'bg-gradient-to-br from-white/85 via-white/70 to-rose-50/50 border-rose-100 shadow-[0_10px_30px_-18px_rgba(244,63,94,0.35)]'
          : isDark
            ? 'bg-gradient-to-br from-white/7 via-white/3 to-transparent border-white/10 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.65)]'
            : 'bg-gradient-to-br from-white via-white to-slate-50 border-slate-200/70 shadow-[0_18px_55px_-35px_rgba(15,23,42,0.25)]'
        }`}
    >
      <div
        className={`absolute -top-14 -right-14 w-40 h-40 rounded-full blur-[55px] opacity-70 pointer-events-none
          ${isCrescere ? 'bg-rose-300/50' : isDark ? 'bg-pink-500/18' : 'bg-pink-300/25'}`}
      />
      <div
        className={`absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-[65px] opacity-50 pointer-events-none
          ${isCrescere ? 'bg-amber-200/55' : isDark ? 'bg-purple-500/14' : 'bg-blue-200/25'}`}
      />
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3">
          <p className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 opacity-80 ${isCrescere ? 'text-rose-600' : isDark ? 'text-slate-400' : 'text-slate-400'}`}>
            <Target size={10} className={isCrescere ? 'text-rose-500' : 'text-pink-500'} />
            Target Date
          </p>

          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur
              ${isCrescere
                ? 'bg-white/60 border-rose-100 text-rose-600'
                : isDark
                  ? 'bg-white/5 border-white/10 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-600'}`}
          >
            PNLE
          </span>
        </div>

        <div className="flex flex-col items-center mb-4">
          <span className={`text-4xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-800'}`}>
            29
          </span>
          <span className={`text-xs font-bold uppercase tracking-[0.3em] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Aug 2026
          </span>
        </div>

        <div className={`relative h-1.5 w-full rounded-full overflow-hidden mb-3 ${isDark ? 'bg-white/10' : 'bg-slate-200/60'}`}>
          <div className={`relative h-full w-[25%] rounded-full ${isCrescere ? 'bg-gradient-to-r from-rose-400 to-amber-400' : 'bg-gradient-to-r from-pink-500 to-purple-500'}`}>
            <div
              className={`rc-bar-shine absolute inset-0 opacity-0 -translate-x-[140%]
                transition-[transform,opacity] ${reduceMotion ? 'duration-0' : 'duration-700'} [transition-timing-function:linear]
                bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.35),transparent)]`}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 opacity-85">
          <Sparkles size={10} className={isCrescere ? 'text-amber-500' : 'text-yellow-500'} />
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
        .rc-logo:hover .rc-sheen { animation: rc_logo_sheen 700ms linear forwards; }
        .rc-logo:hover .rc-cap { transform: translateY(-1px) rotate(-3deg); }
        .rc-logo:hover .rc-ring { opacity: 1; transform: scale(1.06); }

        .rc-footer:hover .rc-bar-shine { opacity: 1; transform: translateX(140%); }

        html.reduce-motion .rc-logo:hover .rc-sheen { animation: none !important; opacity: 0 !important; }
        html.reduce-motion .rc-logo:hover .rc-cap { transform: none !important; }
        html.reduce-motion .rc-logo:hover .rc-ring { transform: none !important; }
        html.reduce-motion .rc-footer:hover .rc-bar-shine { opacity: 0 !important; transform: translateX(-140%) !important; }
      `}</style>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden
          transition-opacity duration-[${dur}ms] [transition-timing-function:linear]
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 h-full lg:static flex flex-col
          ${sidebarContainerClass}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-[${dur}ms] [transition-timing-function:linear]
          lg:transition-[width] lg:duration-[${dur}ms] lg:[transition-timing-function:linear]
          ${isMinimized ? 'lg:w-[92px]' : 'lg:w-80'}
          w-80`}
      >
        {/* Toggle (Desktop) */}
        {onToggleMinimize && (
          <button
            onClick={onToggleMinimize}
            className={`hidden lg:flex absolute -right-3 top-10 w-7 h-7 rounded-full items-center justify-center z-50 shadow-md border
              transition-colors duration-[${dur}ms] [transition-timing-function:linear]
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

        {/* Header - Improved Responsive Padding */}
        <div
          className={`pt-6 pb-4 px-5 md:pt-8 md:pb-6 ${isMinimized ? 'lg:px-4' : 'md:px-8'}
            transition-[padding] duration-[${dur}ms] [transition-timing-function:linear]`}
        >
          <div className={`flex items-center gap-4 ${isMinimized ? 'lg:justify-center' : 'lg:gap-4'} mb-2`}>
            {/* Logo */}
            <button
              type="button"
              className={`rc-logo ${logoBase} ${logoBg}`}
              aria-label="App logo"
              title="Review Companion"
            >
              <div
                className={`rc-ring absolute inset-0 rounded-2xl opacity-0 pointer-events-none
                  transition-all duration-[${dur}ms] [transition-timing-function:linear]
                  ${isCrescere ? 'ring-2 ring-rose-200/60' : isDark ? 'ring-2 ring-pink-400/30' : 'ring-2 ring-pink-300/40'}`}
              />
              <div
                className={`rc-sheen absolute inset-0 bg-gradient-to-tr ${logoGlow}
                  -translate-x-[160%] skew-x-[-18deg] opacity-0 pointer-events-none`}
              />
              <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8),transparent_55%)]" />
              <GraduationCap
                size={26}
                className={`rc-cap relative z-10 drop-shadow-sm transition-transform duration-[${dur}ms] [transition-timing-function:linear]`}
              />
            </button>

            {/* Header label - Hidden on desktop if minimized, visible on mobile */}
            <div className={`min-w-0 overflow-hidden ${labelMotion} ${isMinimized ? 'lg:hidden' : ''}`}>
              <div className="flex flex-col pr-4">
                <h1 className={`font-black text-lg sm:text-xl leading-none tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Review
                  <span className={isCrescere ? 'text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500' : 'text-pink-500'}>
                    Companion
                  </span>
                </h1>
                <div className="flex items-center gap-2 mt-2 opacity-90">
                  <span className="text-sm leading-none select-none">🌸</span>
                  <span className={`text-[0.625rem] font-bold uppercase tracking-[0.25em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Batch Crescere
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Close */}
            <button
              onClick={onClose}
              className="lg:hidden ml-auto p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation - Responsive Padding */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 ${isMinimized ? 'lg:px-4' : 'lg:px-6'} space-y-2 py-2`}>
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
                {/* Icon: Always visible. Centered if minimized on desktop. Left aligned otherwise. */}
                <span
                  className={`relative z-10 flex items-center justify-center shrink-0
                    ${isMinimized ? 'w-6 lg:w-full' : 'w-6'}
                  `}
                >
                  {item.icon}
                </span>

                {/* Label: Always visible on Mobile. Hidden on Desktop if minimized. */}
                <span className={`relative z-10 text-base font-medium tracking-tight whitespace-nowrap ${isMinimized ? 'lg:hidden' : ''} ${labelMotion}`}>
                  {item.label}
                </span>

                {/* Dot indicator for minimized desktop view */}
                {isMinimized && isActive && (
                  <div
                    className={`absolute right-2 top-2 w-2 h-2 rounded-full ring-2 ring-white dark:ring-black hidden lg:block ${isCrescere ? 'bg-rose-500' : 'bg-pink-500'}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer - Responsive Padding */}
        <div className={`mt-auto p-4 md:p-6 transition-colors duration-[${dur}ms] [transition-timing-function:linear]`}>
          {isMinimized ? (
            <>
                {/* Desktop: Show Compact Footer */}
                <div className="hidden lg:block">
                    {MinimizedFooter}
                </div>
                {/* Mobile: Show Expanded Footer (Sidebar is full width on mobile) */}
                <div className="block lg:hidden">
                    {ExpandedFooter}
                </div>
            </>
          ) : (
            // Desktop Expanded & Mobile (Normal): Show Expanded Footer
            ExpandedFooter
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;