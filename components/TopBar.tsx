import React, { useState } from 'react';
import { Menu, Moon, Sun, User as UserIcon, LogOut, Settings, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../AuthContext';
import ProfileSettings from './ProfileSettings';

interface TopBarProps {
  onMenuClick: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, isDark, toggleTheme }) => {
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const today = format(new Date(), 'EEEE, MMMM do, yyyy');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white text-lg lg:text-xl transition-colors">Future RN | Batch Crescere</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block transition-colors">Let's make today productive. Every shift counts.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors">{today}</p>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Profile Section */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-600 border border-slate-100 dark:border-slate-500">
                {currentUser?.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="User Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <UserIcon size={16} />
                  </div>
                )}
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-20 transform origin-top-right transition-all">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 mb-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                      {currentUser?.displayName || 'Aspiring Nurse'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {currentUser?.email}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setShowDropdown(false);
                      setShowSettings(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                  >
                    <Settings size={16} />
                    Profile Settings
                  </button>
                  
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 font-medium"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      
      {showSettings && (
        <ProfileSettings 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </>
  );
};

export default TopBar;
