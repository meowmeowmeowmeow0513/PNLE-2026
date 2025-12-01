import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';

interface TopBarProps {
  onMenuClick: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, isDark, toggleTheme }) => {
  const today = format(new Date(), 'EEEE, MMMM do, yyyy');

  return (
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
      </div>
    </header>
  );
};

export default TopBar;
