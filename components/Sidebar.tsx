
import React from 'react';
import { LayoutDashboard, Timer, Library, BookOpen, Folder, Calendar, GraduationCap, X, Siren } from 'lucide-react';
import { NavigationItem } from '../types';

interface SidebarProps {
  activeItem: NavigationItem;
  onNavigate: (item: NavigationItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate, isOpen, onClose }) => {
  const navItems: { label: NavigationItem; icon: React.ReactNode; special?: boolean }[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={24} /> },
    { label: 'December Quest', icon: <Siren size={24} />, special: true },
    { label: 'Planner', icon: <Calendar size={24} /> },
    { label: 'Pomodoro Timer', icon: <Timer size={24} /> },
    { label: 'Resource Hub', icon: <Library size={24} /> },
    { label: 'Exam TOS', icon: <BookOpen size={24} /> },
    { label: 'Personal Folder', icon: <Folder size={24} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 h-full bg-white/90 dark:bg-[#0B1121]/95 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static flex flex-col justify-between ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl lg:shadow-none`}
      >
        
        {/* Header */}
        <div className="pt-8 pb-4 px-6">
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center gap-3">
                <div className="relative p-2.5 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl shadow-lg shadow-pink-500/20 group overflow-hidden cursor-default transition-transform hover:scale-105">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <GraduationCap size={24} className="text-white relative z-10" />
                </div>
                <div>
                  <h1 className="font-black text-slate-900 dark:text-white text-lg leading-none tracking-tight select-none">
                    Review<span className="text-pink-500">Companion</span>
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1.5">
                     <span className="text-xs animate-pulse">🌸</span>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest select-none">Batch Crescere</p>
                  </div>
                </div>
             </div>
             <button onClick={onClose} className="lg:hidden p-2 -mr-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors">
               <X size={20} />
             </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = activeItem === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    onNavigate(item.label);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`relative w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500/10 via-pink-500/5 to-transparent text-pink-600 dark:text-pink-400 font-bold shadow-sm'
                      : item.special 
                        ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-pink-500 rounded-r-full shadow-[0_0_12px_#ec4899]"></div>
                  )}
                  
                  <span className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'} ${item.special && !isActive ? 'animate-pulse' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="tracking-tight text-base">{item.label}</span>
                  
                  {/* Subtle hover indicator */}
                  {!isActive && (
                      <div className="absolute right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-slate-400 dark:text-slate-500">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Target Date */}
        <div className="p-6 mt-auto">
          <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xl dark:bg-black/40 dark:border-white/5 group cursor-default transition-transform hover:-translate-y-1 duration-500">
             
             {/* Animated Background Mesh */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-[40px] group-hover:bg-pink-500/20 dark:group-hover:bg-pink-500/30 transition-colors duration-500"></div>
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[40px] group-hover:bg-purple-500/20 dark:group-hover:bg-purple-500/30 transition-colors duration-500"></div>
             
             <div className="relative z-10 p-5">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_#ec4899]"></span>
                    Target Date
                </p>
                <p className="text-xl font-mono font-bold text-slate-800 dark:text-white tracking-tight drop-shadow-md">Aug 29, 2026</p>
                
                {/* Progress Bar Visual */}
                <div className="mt-3.5 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-1/4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-[0_0_10px_#ec4899] relative overflow-hidden">
                       <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
                
                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium italic mt-3 text-center opacity-80 group-hover:opacity-100 transition-opacity">
                    "Trust the process"
                </p>
             </div>
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;