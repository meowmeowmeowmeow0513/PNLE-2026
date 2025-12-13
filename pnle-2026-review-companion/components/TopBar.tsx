
import React, { useState } from 'react';
import { Menu, Moon, Sun, User as UserIcon, LogOut, Settings, ChevronDown, Shield, Award, Crown, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../AuthContext';
import { useGamification } from '../hooks/useGamification';
import { useTheme } from '../ThemeContext';
import ProfileSettings from './ProfileSettings';

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
  // Kept for backward compat but largely handled by context now
  isDark: boolean; 
  toggleTheme: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, onMenuClick }) => {
  const { currentUser, logout } = useAuth();
  const { rankData } = useGamification();
  const { currentRank } = rankData;
  const { themeMode, setThemeMode } = useTheme();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const today = format(new Date(), 'EEEE, MMMM do');

  const isCrescere = themeMode === 'crescere';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // --- NEW: THEME CYCLING LOGIC ---
  const handleThemeCycle = () => {
    if (themeMode === 'light') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('crescere');
    else setThemeMode('light'); // From Crescere back to Light
  };

  const getThemeIcon = () => {
      switch(themeMode) {
          case 'light': return <Moon size={18} />; // Next is Dark
          case 'dark': return <Crown size={18} />; // Next is Crescere
          case 'crescere': return <Sun size={18} />; // Next is Light
      }
  };

  const getBadgeStyle = (color: string) => {
    if (isCrescere) {
        // Force specific warm/premium styling for badges in Crescere mode
        return 'bg-white/80 border-white text-rose-700 shadow-sm backdrop-blur-sm';
    }
    switch(color) {
      case 'slate': return 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400';
      case 'blue': return 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400';
      case 'emerald': return 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400';
      case 'violet': return 'bg-violet-50 border-violet-100 text-violet-600 dark:bg-violet-900/20 dark:border-violet-800/50 dark:text-violet-400';
      case 'amber': return 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const badgeStyle = getBadgeStyle(currentRank?.color || 'slate');
  const isExpert = currentRank?.id === 4;

  // Crescere: Increased opacity to 80% to fix gray look
  const topBarClass = isCrescere
    ? 'bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-sm'
    : 'bg-white/80 dark:bg-[#020617]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5'; 

  // Reverted text to Slate for consistency with Light Mode
  const textPrimary = 'text-slate-900 dark:text-white';
  const textSecondary = 'text-slate-400 dark:text-slate-500';
  const textMuted = 'text-slate-300 dark:text-slate-600';
  const buttonHover = isCrescere ? 'hover:bg-white/50 hover:text-slate-900' : 'hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white';

  return (
    <>
      <header className={`sticky top-0 z-40 w-full h-16 px-6 md:px-8 flex items-center justify-between transition-all duration-500 ${topBarClass}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className={`lg:hidden p-2 -ml-2 rounded-lg transition-colors ${textSecondary} ${buttonHover}`}
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden sm:block">
             <div className="flex items-center gap-2 text-sm">
                <span className={textSecondary}>App</span>
                <span className={textMuted}>/</span>
                <span className={`font-bold tracking-tight flex items-center gap-2 ${textPrimary}`}>
                    {title} 
                    {isCrescere && <Sparkles size={12} className="text-amber-400/80" />}
                </span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className={`hidden md:block text-xs font-medium text-right ${textSecondary}`}>
             <p>{today}</p>
          </div>
          <div className={`h-6 w-px hidden md:block ${isCrescere ? 'bg-slate-200' : 'bg-slate-200 dark:bg-white/10'}`}></div>

          {/* Dynamic Rank Badge */}
          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border ${badgeStyle} transition-colors`}>
             {isExpert ? <Award size={12} className="fill-current animate-pulse" /> : <Shield size={12} className="fill-current" />}
             <span className="text-[10px] font-bold uppercase tracking-wider">{currentRank?.title || 'Novice'}</span>
          </div>

          <button 
            onClick={handleThemeCycle} 
            className={`p-2 rounded-lg transition-all active:scale-95 ${textSecondary} ${buttonHover}`}
            title="Cycle Theme: Light > Dark > Crescere"
          >
            {getThemeIcon()}
          </button>

          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className={`flex items-center gap-3 pl-1 pr-2 py-1 rounded-full transition-all border border-transparent ${isCrescere ? 'hover:bg-white/50 hover:border-white/40' : 'hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/5'}`}>
              <div className={`w-8 h-8 rounded-full overflow-hidden border shadow-sm ${isCrescere ? 'bg-rose-100 border-rose-100' : 'bg-slate-200 dark:bg-slate-800 border-slate-200 dark:border-white/10'}`}>
                {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center ${textSecondary}`}><UserIcon size={14} /></div>}
              </div>
              <ChevronDown size={14} className={`${textSecondary} hidden sm:block`} />
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border py-1 z-20 animate-in fade-in zoom-in-95 origin-top-right ${isCrescere ? 'bg-white/95 backdrop-blur-xl border-white/60 ring-1 ring-black/5' : 'bg-white dark:bg-[#0f172a] border-slate-100 dark:border-white/10'}`}>
                  <div className={`px-4 py-3 border-b ${isCrescere ? 'border-slate-100' : 'border-slate-100 dark:border-white/5'}`}>
                    <p className={`text-sm font-bold truncate ${textPrimary}`}>{currentUser?.displayName || 'Student'}</p>
                    <p className={`text-xs truncate ${textSecondary}`}>{currentUser?.email}</p>
                  </div>
                  <button onClick={() => { setShowDropdown(false); setShowSettings(true); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${textSecondary} ${buttonHover}`}><Settings size={14} /> Settings</button>
                  <div className={`border-t my-1 ${isCrescere ? 'border-slate-100' : 'border-slate-100 dark:border-white/5'}`}></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"><LogOut size={14} /> Log Out</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      {showSettings && <ProfileSettings onClose={() => setShowSettings(false)} />}
    </>
  );
};

export default TopBar;
