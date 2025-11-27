import React from 'react';
import { LayoutDashboard, Timer, Library, BookOpen, GraduationCap, X } from 'lucide-react';
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
    { label: 'Pomodoro Timer', icon: <Timer size={20} /> },
    { label: 'Resource Hub', icon: <Library size={20} /> },
    { label: 'Exam TOS', icon: <BookOpen size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <div className={`fixed top-0 left-0 z-30 h-full w-64 bg-navy-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between shadow-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2 bg-teal-accent rounded-lg">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Review<br/>Companion</h1>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.label);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  activeItem === item.label
                    ? 'bg-teal-accent/10 text-teal-accent shadow-sm'
                    : 'hover:bg-navy-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Target Date Card */}
        <div className="p-4">
          <div className="bg-navy-800 rounded-xl p-4 border border-navy-800/50 shadow-inner">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Target Date</p>
            <p className="text-xl font-bold text-white mb-2">Aug 29, 2026</p>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-teal-accent"></div>
              <p className="text-xs text-teal-accent italic">"Trust the process."</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;