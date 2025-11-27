import React from 'react';
import { Menu } from 'lucide-react';
import { format } from 'date-fns';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const today = format(new Date(), 'EEEE, MMMM do, yyyy');

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <div>
          <h2 className="font-bold text-slate-800 text-lg lg:text-xl">Future RN | Batch Crescere</h2>
          <p className="text-xs text-slate-500 hidden sm:block">Let's make today productive. Every shift counts.</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-slate-600">{today}</p>
      </div>
    </header>
  );
};

export default TopBar;