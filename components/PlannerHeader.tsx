
import React from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, LayoutGrid, Clock, 
  Calendar as CalendarIcon, ListTodo, PanelRightClose, 
  PanelRightOpen, CalendarDays, CalendarRange
} from 'lucide-react';
import { format } from 'date-fns';

interface PlannerHeaderProps {
  currentDate: Date;
  pendingCount: number;
  currentView: 'dayGridMonth' | 'timeGridWeek' | 'schedule';
  mobileTab: 'calendar' | 'agenda';
  isSidebarOpen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: 'dayGridMonth' | 'timeGridWeek' | 'schedule') => void;
  setMobileTab: (tab: 'calendar' | 'agenda') => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onAddEvent: () => void;
}

const PlannerHeader: React.FC<PlannerHeaderProps> = ({
  currentDate,
  pendingCount,
  currentView,
  mobileTab,
  isSidebarOpen,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  setMobileTab,
  setIsSidebarOpen,
  onAddEvent
}) => {
  return (
    <div className="shrink-0 z-30 bg-white/60 dark:bg-[#0B1121]/60 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/5 transition-all duration-300 shadow-sm relative group rounded-t-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 lg:p-8">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>

      {/* LEFT: Branding & Date */}
      <div className="flex items-center gap-4 relative z-10 w-full md:w-auto min-w-0">
          <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl md:rounded-3xl flex items-center justify-center shadow-xl shadow-pink-500/20 shrink-0 transform md:rotate-3 transition-transform duration-500">
              <CalendarDays className="text-white drop-shadow-md w-5 h-5 md:w-8 md:h-8" />
          </div>
          
          <div className="min-w-0 flex-1">
              {/* Desktop Title */}
              <h1 className="hidden md:block text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">
                  Review <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Calendar</span>
              </h1>
              {/* Mobile Title (Compact) */}
              <h1 className="md:hidden text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">
                  {format(currentDate, 'MMMM yyyy')}
              </h1>

              <div className="flex items-center gap-2 md:gap-3 text-slate-500 dark:text-slate-400 font-bold text-xs md:text-sm">
                  <span className="hidden md:inline uppercase tracking-widest">{format(currentDate, 'MMMM yyyy')}</span>
                  <span className="hidden md:inline w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  <span className="text-pink-500 whitespace-nowrap">{pendingCount} Active Tasks</span>
              </div>
          </div>
      </div>

      {/* RIGHT: Controls */}
      <div className="flex items-center gap-2 md:gap-3 relative z-10 w-full md:w-auto justify-end overflow-x-auto no-scrollbar">
          
          {/* MOBILE: View Switcher (Integrated into Header for Landscape) */}
          <div className="flex lg:hidden bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 backdrop-blur-md shrink-0">
              <button 
                onClick={() => setMobileTab('calendar')} 
                className={`p-2 rounded-lg transition-all ${mobileTab === 'calendar' ? 'bg-white dark:bg-slate-600 shadow-sm text-pink-500' : 'text-slate-400 dark:text-slate-500'}`}
                title="Calendar View"
              >
                  <CalendarIcon size={16} />
              </button>
              <button 
                onClick={() => setMobileTab('agenda')} 
                className={`p-2 rounded-lg transition-all ${mobileTab === 'agenda' ? 'bg-white dark:bg-slate-600 shadow-sm text-pink-500' : 'text-slate-400 dark:text-slate-500'}`}
                title="Agenda View"
              >
                  <ListTodo size={16} />
              </button>
          </div>

          {/* Nav Pill */}
          <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-md shadow-sm shrink-0">
              <button onClick={onPrev} className="p-2 md:p-3 hover:bg-white dark:hover:bg-slate-700 rounded-lg md:rounded-xl text-slate-600 dark:text-slate-300 transition-all"><ChevronLeft size={16} /></button>
              <button onClick={onToday} className="px-3 md:px-5 py-1 md:py-2 text-[10px] md:text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider hover:bg-white dark:hover:bg-slate-700 rounded-lg md:rounded-xl transition-all">Today</button>
              <button onClick={onNext} className="p-2 md:p-3 hover:bg-white dark:hover:bg-slate-700 rounded-lg md:rounded-xl text-slate-600 dark:text-slate-300 transition-all"><ChevronRight size={16} /></button>
          </div>

          {/* VIEW MODE: Visible on Desktop OR when Mobile Calendar Tab is active */}
          <div className={`
              bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-md shrink-0
              ${mobileTab === 'agenda' ? 'hidden lg:flex' : 'flex'}
          `}>
              <button onClick={() => onViewChange('dayGridMonth')} className={`p-3 rounded-xl transition-all ${currentView === 'dayGridMonth' ? 'bg-white dark:bg-slate-600 shadow-sm text-pink-500' : 'text-slate-400 hover:text-slate-600'}`} title="Month View"><LayoutGrid size={18} /></button>
              <button onClick={() => onViewChange('timeGridWeek')} className={`p-3 rounded-xl transition-all ${currentView === 'timeGridWeek' ? 'bg-white dark:bg-slate-600 shadow-sm text-pink-500' : 'text-slate-400 hover:text-slate-600'}`} title="Week View"><Clock size={18} /></button>
              <button onClick={() => onViewChange('schedule')} className={`p-3 rounded-xl transition-all ${currentView === 'schedule' ? 'bg-white dark:bg-slate-600 shadow-sm text-pink-500' : 'text-slate-400 hover:text-slate-600'}`} title="Schedule View"><CalendarRange size={18} /></button>
          </div>
          
          {/* Add Button */}
          <button 
            onClick={onAddEvent}
            className="h-10 w-10 md:h-14 md:w-14 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl md:rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
          >
              <Plus size={20} className="md:w-6 md:h-6" />
          </button>

          {/* DESKTOP: Sidebar Toggle */}
          <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
              title={isSidebarOpen ? "Collapse Agenda" : "Expand Agenda"}
          >
              {isSidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
          </button>
      </div>
    </div>
  );
};

export default PlannerHeader;
