
import React, { useState } from 'react';
import { Menu, Moon, Sun, User as UserIcon, LogOut, Settings, ChevronDown, Shield, Crown, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../AuthContext';
import { useGamification } from '../hooks/useGamification';
import { useTheme } from '../ThemeContext';
import ProfileSettings from './ProfileSettings';

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
  isDark: boolean; 
  toggleTheme: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, onMenuClick }) => {
  const { currentUser, logout } = useAuth();
  const { rankData } = useGamification();
  const { currentRank } = rankData;
  const { themeMode, setThemeMode, fontSize } = useTheme();
  
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
          case 'light': return <Moon size={18} />;
          case 'dark': return <Crown size={18} />;
          case 'crescere': return <Sun size={18} />;
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

  // --- DYNAMIC FONT SCALING (VISUALLY BALANCED) ---
  // Since TopBar uses UPPERCASE + TRACKING, we step down the size slightly 
  // compared to Sidebar to maintain visual consistency.
  const getGlobalTextSize = () => {
      switch(fontSize) {
          case 'small': return 'text-[9px]'; 
          case 'large': return 'text-xs'; 
          case 'extra-large': return 'text-[13px]'; 
          default: return 'text-[11px]'; // Normal (11px) matches Sidebar 'text-[13px]' weight better
      }
  };

  const getSlashSize = () => {
      switch(fontSize) {
          case 'small': return 'text-xs';
          case 'large': return 'text-base';
          case 'extra-large': return 'text-lg';
          default: return 'text-sm';
      }
  }

  // Dropdown internal scaling
  const getDropdownTextSize = (type: 'name' | 'meta' | 'item') => {
      switch (fontSize) {
          case 'small':
              if (type === 'name') return 'text-xs';
              if (type === 'meta') return 'text-[9px]';
              return 'text-[10px]';
          case 'large':
              if (type === 'name') return 'text-sm';
              if (type === 'meta') return 'text-[11px]';
              return 'text-xs';
          case 'extra-large':
              if (type === 'name') return 'text-base';
              if (type === 'meta') return 'text-xs';
              return 'text-sm';
          default: // Normal
              if (type === 'name') return 'text-[13px]';
              if (type === 'meta') return 'text-[10px]';
              return 'text-[11px]';
      }
  };

  // --- GLASSMORPHISM HEADER ---
  // Standardized opacity between light and crescere to prevent flash
  const topBarClass = isCrescere
    ? 'bg-white/60 border-b border-white/50 shadow-[0_4px_30px_rgba(244,63,94,0.05)]'
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
             <div className="flex items-center gap-3 font-black uppercase tracking-[0.2em]">
                <span className={`${textSecondary} opacity-70 ${getGlobalTextSize()}`}>Future RN</span>
                {/* Slash scales relatively */}
                <span className={`opacity-20 text-slate-500 font-light ${getSlashSize()}`}>/</span>
                <span className={`tracking-widest flex items-center gap-2 ${textPrimary} ${getGlobalTextSize()}`}>
                    {title} 
                    {isCrescere && <Sparkles size={12} className="text-amber-400 animate-pulse" />}
                </span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className={`hidden lg:block font-black uppercase tracking-[0.3em] text-right opacity-60 ${textSecondary} ${getGlobalTextSize()}`}>
             <p>{today}</p>
          </div>

          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all font-black uppercase tracking-widest ${getRankBadgeStyle()} ${getGlobalTextSize()}`}>
             <Shield size={12} className="opacity-70" />
             <span>{currentRank?.title || 'Novice'}</span>
          </div>

          <div className="h-6 w-px bg-slate-200/50 dark:bg-white/10 mx-1 hidden sm:block"></div>

          <button 
            onClick={handleThemeCycle} 
            className={`p-2 rounded-xl transition-all active:scale-90 ${textSecondary} ${buttonHover} border border-transparent hover:border-black/5 dark:hover:border-white/10`}
            title="Switch Theme"
          >
            {getThemeIcon()}
          </button>

          <div className="relative">
            <button 
                onClick={() => setShowDropdown(!showDropdown)} 
                className={`flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-full transition-all border border-transparent hover:bg-slate-100/50 dark:hover:bg-white/5 ${showDropdown ? 'bg-slate-100/50 dark:bg-white/5 ring-2 ring-pink-500/20' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full overflow-hidden border shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-white ring-1 ring-slate-100'}`}>
                {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center ${textSecondary}`}><UserIcon size={14} /></div>}
              </div>
              <ChevronDown size={12} className={`${textSecondary} hidden sm:block transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div 
                    className={`
                        absolute top-full right-0 mt-2 rounded-2xl shadow-2xl border z-50 overflow-hidden transform origin-top-right animate-in fade-in zoom-in-95 duration-200
                        w-[clamp(240px,80vw,260px)] mr-1
                        ${isCrescere 
                            ? 'bg-white/95 backdrop-blur-3xl border-white/60 shadow-[0_20px_60px_-15px_rgba(244,63,94,0.15)]' 
                            : isDark 
                                ? 'bg-[#0f172a]/95 backdrop-blur-3xl border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]' 
                                : 'bg-white/95 backdrop-blur-3xl border-slate-200/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
                        }
                    `}
                >
                  {/* Header Profile Section */}
                  <div className={`p-4 border-b ${isCrescere ? 'border-rose-100/50' : isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full p-0.5 border shrink-0 ${isCrescere ? 'border-rose-200 bg-rose-50' : isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}`}>
                            <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-200 dark:bg-slate-700">
                                {currentUser?.photoURL ? (
                                    <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center ${isCrescere ? 'text-rose-300' : 'text-slate-400'}`}>
                                        <UserIcon size={14} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className={`font-black truncate ${getDropdownTextSize('name')} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {currentUser?.displayName || 'Future RN'}
                            </h4>
                            <p className={`truncate font-medium ${getDropdownTextSize('meta')} ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {currentUser?.email}
                            </p>
                            
                            <div className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider border ${getDropdownTextSize('meta')} ${getRankBadgeStyle()}`}>
                                {currentRank?.title || 'Novice'}
                            </div>
                        </div>
                    </div>
                  </div>
                  
                  {/* Menu Options */}
                  <div className="p-1.5 space-y-0.5">
                      <button 
                        onClick={() => { setShowDropdown(false); setShowSettings(true); }} 
                        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all group relative overflow-hidden ${
                            isDark 
                            ? 'text-slate-300 hover:text-white hover:bg-white/5' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                          <div className={`p-1.5 rounded-lg transition-colors ${isDark ? 'bg-white/5 group-hover:bg-white/10' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                              <Settings size={14} />
                          </div>
                          <div className="flex-1 text-left">
                              <span className={`font-bold block ${getDropdownTextSize('item')}`}>Account Settings</span>
                          </div>
                          <ChevronDown size={12} className="-rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      <div className={`h-px mx-2 my-1 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>

                      <button 
                        onClick={handleLogout} 
                        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all group text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
                      >
                          <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                              <LogOut size={14} />
                          </div>
                          <span className={`flex-1 text-left uppercase tracking-wider font-bold ${getDropdownTextSize('item')}`}>Sign Out</span>
                      </button>
                  </div>
                  
                  {/* Footer Decoration */}
                  {isCrescere && (
                      <div className="h-1 w-full bg-gradient-to-r from-rose-400 via-amber-400 to-rose-400"></div>
                  )}
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
