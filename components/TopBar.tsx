
import React, { useState } from 'react';
import { Menu, Moon, Sun, User as UserIcon, LogOut, Settings, ChevronDown, Shield, Award } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../AuthContext';
import { useGamification } from '../hooks/useGamification';
import ProfileSettings from './ProfileSettings';

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, onMenuClick, isDark, toggleTheme }) => {
  const { currentUser, logout } = useAuth();
  const { rankData } = useGamification();
  const { currentRank } = rankData;
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const today = format(new Date(), 'EEEE, MMMM do');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const getBadgeStyle = (color: string) => {
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

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 px-6 md:px-8 flex items-center justify-between bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-all duration-500">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden sm:block">
             <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 dark:text-slate-500">App</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="text-slate-900 dark:text-white font-bold tracking-tight">{title}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:block text-xs font-medium text-slate-500 text-right">
             <p>{today}</p>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden md:block"></div>

          {/* Dynamic Rank Badge */}
          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border ${badgeStyle} transition-colors`}>
             {isExpert ? <Award size={12} className="fill-current animate-pulse" /> : <Shield size={12} className="fill-current" />}
             <span className="text-[10px] font-bold uppercase tracking-wider">{currentRank?.title || 'Novice'}</span>
          </div>

          <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm">
                {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><UserIcon size={14} /></div>}
              </div>
              <ChevronDown size={14} className="text-slate-500 hidden sm:block" />
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f172a] rounded-xl shadow-2xl border border-slate-100 dark:border-white/10 py-1 z-20 animate-in fade-in zoom-in-95 origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{currentUser?.displayName || 'Student'}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                  </div>
                  <button onClick={() => { setShowDropdown(false); setShowSettings(true); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"><Settings size={14} /> Settings</button>
                  <div className="border-t border-slate-100 dark:border-white/5 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"><LogOut size={14} /> Log Out</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      {showSettings && <ProfileSettings onClose={() => setShowSettings(false)} isDark={isDark} toggleTheme={toggleTheme} />}
    </>
  );
};

export default TopBar;
