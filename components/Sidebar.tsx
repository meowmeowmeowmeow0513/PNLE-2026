import React from 'react';
import { LayoutDashboard, Timer, Library, BookOpen, Folder, Calendar, GraduationCap, X } from 'lucide-react';
import { NavigationItem } from '../types';

interface SidebarProps {
  activeItem: NavigationItem;
  onNavigate: (item: NavigationItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate, isOpen, onClose }) => {
  const navItems: { label: NavigationItem; icon: React.ReactNode }[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Planner', icon: <Calendar size={20} /> },
    { label: 'Pomodoro Timer', icon: <Timer size={20} /> },
    { label: 'Resource Hub', icon: <Library size={20} /> },
    { label: 'Exam TOS', icon: <BookOpen size={20} /> },
    { label: 'Personal Folder', icon: <Folder size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container - GLASSMORPHISM UPGRADE */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 h-full bg-white/90 dark:bg-[#020617]/20 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static flex flex-col justify-between ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        
        {/* Header */}
        <div>
          <div className="h-20 flex items-center px-6 gap-3">
            <div className="relative p-2 bg-gradient-to-br from-pink-600 to-rose-500 rounded-lg shadow-lg shadow-pink-500/20">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-base leading-none tracking-tight">Review<span className="text-pink-500">Companion</span></h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Batch Crescere</p>
            </div>
            <button onClick={onClose} className="lg:hidden ml-auto text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-2 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeItem === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    onNavigate(item.label);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium group ${
                    isActive
                      ? 'bg-pink-50/80 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 shadow-[0_0_20px_-5px_rgba(236,72,153,0.3)]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-pink-500 rounded-r-full shadow-[0_0_10px_#ec4899]"></div>
                  )}
                  
                  <span className={`transition-colors duration-300 ${isActive ? 'text-pink-600 dark:text-pink-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Target Date */}
        <div className="p-4">
          <div className="bg-slate-50/50 dark:bg-[#0f172a]/40 rounded-2xl p-4 border border-slate-200 dark:border-white/5 relative overflow-hidden backdrop-blur-md transition-all hover:border-pink-500/20 group">
             {/* Glow Effect */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-2xl group-hover:bg-pink-500/30 transition-all duration-500"></div>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Target Date</p>
            <p className="text-lg font-mono font-bold text-slate-800 dark:text-white tracking-tight">Aug 29, 2026</p>
            <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-1/4 bg-pink-500 rounded-full animate-pulse shadow-[0_0_10px_#ec4899]"></div>
            </div>
            
            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium italic mt-3 text-center opacity-80">
                "Trust the process"
            </p>
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;