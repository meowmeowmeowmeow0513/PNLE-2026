
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
  const today = format(new Date(), 'EEEE, MMM do');

  const isCrescere = themeMode === 'crescere';
  const isDark = themeMode === 'dark';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleThemeCycle = () => {
    if (themeMode === 'light') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('crescere');
    else setThemeMode('light'); 
  };

  const getThemeIcon = () => {
      switch(themeMode) {
          case 'light': return <Moon size={16} />;
          case 'dark': return <Crown size={16} />;
          case 'crescere': return <Sun size={16} />;
      }
  };

  const getRankBadgeStyle = () => {
      if (isCrescere) return 'bg-rose-500/10 border-rose-500/20 text-rose-600';
      
      const color = currentRank?.color || 'slate';
      switch(color) {
          case 'blue': return 'bg-blue-500/10 border-blue-400/30 text-blue-600 dark:text-blue-400 shadow-sm';
          case 'emerald': return 'bg-emerald-500/10 border-emerald-400/30 text-emerald-600 dark:text-emerald-400 shadow-sm';
          case 'violet': return 'bg-violet-500/10 border-violet-400/30 text-violet-600 dark:text-violet-400 shadow-sm';
          case 'amber': return 'bg-amber-500/10 border-amber-400/30 text-amber-600 dark:text-amber-400 shadow-sm';
          default: return 'bg-slate-500/10 border-slate-500/20 text-slate-500 dark:text-slate-400';
      }
  };

  // --- GLASSMORPHISM HEADER ---
  const topBarClass = isCrescere
    ? 'bg-white/40 border-b border-white/50 shadow-[0_4px_30px_rgba(244,63,94,0.05)]'
    : isDark
      ? 'bg-[#0B1121]/60 border-b border-white/5 shadow-xl shadow-black/5' 
      : 'bg-white/60 border-b border-slate-200/60 shadow-sm'; 

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const buttonHover = isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900';

  return (
    <>
      <header className={`sticky top-0 z-40 w-full h-16 px-4 md:px-8 flex items-center justify-between backdrop-blur-2xl transition-all duration-500 ${topBarClass}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className={`lg:hidden p-2 -ml-2 rounded-xl transition-all active:scale-95 ${textSecondary} ${buttonHover}`}
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden sm:block">
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
                <span className={`${textSecondary} opacity-70`}>Future RN</span>
                <span className="opacity-20 text-slate-500 text-lg font-light">/</span>
                <span className={`tracking-widest flex items-center gap-2 ${textPrimary}`}>
                    {title} 
                    {isCrescere && <Sparkles size={12} className="text-amber-400 animate-pulse" />}
                </span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <div className={`hidden lg:block text-[9px] font-black uppercase tracking-[0.3em] text-right opacity-60 ${textSecondary}`}>
             <p>{today}</p>
          </div>

          <div className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all font-black uppercase tracking-widest text-[9px] ${getRankBadgeStyle()}`}>
             <Shield size={12} className="opacity-70" />
             <span>{currentRank?.title || 'Novice'}</span>
          </div>

          <div className="h-6 w-px bg-slate-200/50 dark:bg-white/10 mx-1 hidden sm:block"></div>

          <button 
            onClick={handleThemeCycle} 
            className={`p-2.5 rounded-xl transition-all active:scale-90 ${textSecondary} ${buttonHover} border border-transparent hover:border-black/5 dark:hover:border-white/10`}
            title="Switch Theme"
          >
            {getThemeIcon()}
          </button>

          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className={`flex items-center gap-3 pl-1 pr-2 py-1 rounded-full transition-all border border-transparent hover:bg-slate-100/50 dark:hover:bg-white/5`}>
              <div className={`w-9 h-9 rounded-full overflow-hidden border-2 shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-white ring-1 ring-slate-100'}`}>
                {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center ${textSecondary}`}><UserIcon size={14} /></div>}
              </div>
              <ChevronDown size={12} className={`${textSecondary} hidden sm:block`} />
            </button>
            
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className={`absolute right-0 mt-3 w-64 rounded-3xl shadow-2xl border py-2 z-20 animate-in fade-in zoom-in-95 origin-top-right overflow-hidden ${isDark ? 'bg-[#0f172a]/95 backdrop-blur-2xl border-white/10' : 'bg-white/95 backdrop-blur-2xl border-slate-100'}`}>
                  <div className={`px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-slate-50'}`}>
                    <p className={`text-xs font-black uppercase tracking-wider truncate ${textPrimary}`}>{currentUser?.displayName || 'Student'}</p>
                    <p className={`text-[10px] truncate ${textSecondary} mt-1 font-medium`}>{currentUser?.email}</p>
                  </div>
                  
                  <div className="p-2 space-y-1">
                      <button onClick={() => { setShowDropdown(false); setShowSettings(true); }} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${textSecondary} ${buttonHover}`}>
                          <Settings size={14} /> Account Settings
                      </button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors uppercase tracking-wider">
                          <LogOut size={14} /> Log Out
                      </button>
                  </div>
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
