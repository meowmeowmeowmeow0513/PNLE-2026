
import React, { useState, useRef, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// Removed listPlugin import as we use custom ScheduleView
import { useTasks } from '../TaskContext';
import { useTheme } from '../ThemeContext'; 
import TaskModal from './TaskModal';
import PlannerHeader from './PlannerHeader';
import ScheduleView from './ScheduleView';
import { Task, TaskCategory } from '../types';
import { 
  MoreHorizontal, RefreshCw, Trash2, CheckCircle2,
  Circle, Clock, Layers, PieChart, AlertCircle, Check, Sparkles,
  Calendar as CalendarIcon, Filter, MapPin
} from 'lucide-react';
import { format, isSameDay, differenceInMinutes, addHours, addMinutes, isPast } from 'date-fns';

// --- SUB-COMPONENT: DAILY BALANCE HUD ---
const DailyDistribution = ({ tasks }: { tasks: Task[] }) => {
  const total = tasks.length;
  
  const stats = useMemo(() => {
      let tMin = 0;
      let cMin = 0;
      const catMinutes: Record<string, number> = {};

      tasks.forEach(t => {
          const start = new Date(t.start);
          const end = new Date(t.end);
          const duration = differenceInMinutes(end, start);
          tMin += duration;
          if (t.completed) cMin += duration;
          catMinutes[t.category] = (catMinutes[t.category] || 0) + duration;
      });
      return { totalMinutes: tMin, completedMinutes: cMin, catMinutes };
  }, [tasks]);

  const progress = stats.totalMinutes === 0 ? 0 : Math.round((stats.completedMinutes / stats.totalMinutes) * 100) || 0;
  
  const formatDuration = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      if (h > 0 && m > 0) return `${h}h ${m}m`;
      if (h > 0) return `${h}h`;
      return `${m}m`;
  };

  const getCategoryColor = (cat: string) => {
      switch(cat) {
          case 'Review': return 'bg-rose-500';
          case 'School': return 'bg-violet-500';
          case 'Duty': return 'bg-sky-500';
          case 'Personal': return 'bg-emerald-500';
          default: return 'bg-slate-500';
      }
  };

  if (total === 0) return (
      <div className="p-3 sm:p-6 rounded-[2rem] bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-center flex flex-col items-center justify-center gap-2 min-h-[120px]">
          <div className="text-slate-400 dark:text-slate-500"><Sparkles size={24} /></div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Rest Day</p>
      </div>
  );

  return (
    <div className="p-3 sm:p-6 bg-slate-50/80 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl sm:rounded-[2rem]">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
            <h4 className="text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <PieChart size={12} className="sm:w-[14px] sm:h-[14px]" /> Time DNA
            </h4>
            <span className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white">{progress}%</span>
        </div>
        <div className="h-1.5 sm:h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex mb-2 sm:mb-4">
            {Object.entries(stats.catMinutes).map(([cat, mins], idx) => {
                const width = ((mins as number) / stats.totalMinutes) * 100;
                return <div key={cat} style={{ width: `${width}%` }} className={`h-full ${getCategoryColor(cat)}`}></div>
            })}
        </div>
        {/* Adaptive Grid for Stats: 2 col on mobile/larger */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {Object.entries(stats.catMinutes).map(([cat, mins]) => (
                <div key={cat} className="flex items-center justify-between px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getCategoryColor(cat)}`}></div>
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate">{cat}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-700 dark:text-slate-300 ml-2 whitespace-nowrap">{formatDuration(mins as number)}</span>
                </div>
            ))}
        </div>
    </div>
  );
};

const Planner: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  const { accentColor } = useTheme(); 
  const calendarRef = useRef<FullCalendar>(null);
  
  // UI State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'schedule'>('timeGridWeek');
  
  // Responsive State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<'calendar' | 'agenda'>('calendar');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Partial<Task> | null>(null);
  const [showAgendaMenu, setShowAgendaMenu] = useState(false);
  
  // Refs
  const menuRef = useRef<HTMLDivElement>(null);

  // Resize handling - Auto-close sidebar on mobile/tablet landscape if needed
  useEffect(() => {
      const handleResize = () => {
          // Sync calendar size immediately
          if (calendarRef.current) {
              calendarRef.current.getApi().updateSize();
          }
          // Default sidebar state based on screen width
          if (window.innerWidth < 1024) {
              setIsSidebarOpen(false); 
          } else {
              setIsSidebarOpen(true);
          }
      };
      
      // Initialize on mount
      handleResize(); 
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync Calendar Resize when Sidebar Toggles
  useEffect(() => {
      const timeoutId = setTimeout(() => {
          if (calendarRef.current) {
              calendarRef.current.getApi().updateSize();
          }
      }, 310); 

      return () => clearTimeout(timeoutId);
  }, [isSidebarOpen]);

  // Outside click for menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAgendaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const agendaTasks = tasks
    .filter(task => {
      try {
        if (!task.start) return false;
        return isSameDay(new Date(task.start), selectedDate);
      } catch (e) { return false; }
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // --- ACTIONS ---
  const handleRollover = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const overdueTasks = tasks.filter(t => {
        const taskStart = new Date(t.start);
        return taskStart < todayStart && !t.completed;
    });

    if (overdueTasks.length === 0) {
        alert("No overdue tasks found!");
        setShowAgendaMenu(false);
        return;
    }

    if (confirm(`Move ${overdueTasks.length} unfinished tasks to today?`)) {
        const baseTime = new Date(selectedDate);
        baseTime.setHours(8, 0, 0, 0); 

        for (let i = 0; i < overdueTasks.length; i++) {
            const task = overdueTasks[i];
            const duration = differenceInMinutes(new Date(task.end), new Date(task.start));
            const newStart = addMinutes(baseTime, i * 60).toISOString();
            const newEnd = addMinutes(new Date(newStart), duration).toISOString();
            await updateTask(task.id, { start: newStart, end: newEnd, date: format(new Date(newStart), 'yyyy-MM-dd') });
        }
    }
    setShowAgendaMenu(false);
  };

  const handleClearDay = async () => {
      if (agendaTasks.length === 0) return;
      if (confirm(`Delete ALL ${agendaTasks.length} tasks for this day? This cannot be undone.`)) {
          await Promise.all(agendaTasks.map(t => deleteTask(t.id)));
      }
      setShowAgendaMenu(false);
  };

  const handleClearCompleted = async () => {
      const completedOnDay = agendaTasks.filter(t => t.completed);
      if (completedOnDay.length === 0) return;
      if (confirm(`Delete ${completedOnDay.length} completed tasks from this day?`)) {
          await Promise.all(completedOnDay.map(t => deleteTask(t.id)));
      }
      setShowAgendaMenu(false);
  };

  const handleQuickAdd = async (type: string) => {
      const baseDate = new Date(selectedDate);
      const start = new Date(baseDate);
      start.setHours(9, 0, 0, 0);
      const end = addHours(start, 2);

      await addTask({
          title: type,
          category: 'Review',
          priority: 'High',
          start: start.toISOString(),
          end: end.toISOString(),
          allDay: false
      });
  };

  // --- CALENDAR HANDLERS ---
  const handleEventDrop = async (info: any) => {
    const { event } = info;
    const newStart = event.start?.toISOString();
    const newEnd = event.end?.toISOString() || newStart;
    if (event.id && newStart) {
      try {
        await updateTask(event.id, { start: newStart, end: newEnd, allDay: event.allDay });
      } catch (error) { info.revert(); }
    }
  };

  const handleEventResize = async (info: any) => {
    const { event } = info;
    if (event.id && event.start && event.end) {
      await updateTask(event.id, { start: event.start.toISOString(), end: event.end.toISOString() });
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    const { startStr, endStr, allDay, view } = selectInfo;
    selectInfo.view.calendar.unselect();
    setSelectedTask({ start: startStr, end: endStr, allDay: allDay });
    if (view.type === 'dayGridMonth') setSelectedDate(selectInfo.start);
    setIsModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    if (info.event.start) {
        setSelectedDate(info.event.start);
    }
    const task = tasks.find(t => t.id === info.event.id);
    if (task) {
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  };

  const handleNavLinkDayClick = (date: Date, jsEvent: UIEvent) => {
      setSelectedDate(date);
      // Automatically switch to Agenda view on mobile when day is clicked
      if (window.innerWidth < 1024) {
          setMobileTab('agenda');
      }
  };

  const handleDateClick = (arg: any) => {
      setSelectedDate(arg.date);
      if (window.innerWidth < 1024) {
          setMobileTab('agenda');
      } else {
          // On Desktop, empty click opens add modal
          setSelectedTask(null);
          setIsModalOpen(true);
      }
  };

  const handleDatesSet = () => {
      if (calendarRef.current) setCurrentDate(calendarRef.current.getApi().getDate());
  };

  const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'schedule') => {
      setCurrentView(view);
      // Only invoke API if it's a standard calendar view
      if (view !== 'schedule' && calendarRef.current) {
          calendarRef.current.getApi().changeView(view);
      }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (taskData.id) {
      await updateTask(taskData.id, taskData);
    } else {
       if (taskData.title && taskData.category && taskData.priority && taskData.start && taskData.end) {
          await addTask({
             title: taskData.title,
             category: taskData.category,
             priority: taskData.priority,
             start: taskData.start,
             end: taskData.end,
             allDay: taskData.allDay || false,
             details: taskData.details || ''
          });
       }
    }
  };

  // --- RENDERERS ---
  const renderEventContent = (eventInfo: any) => {
    const cat = eventInfo.event.extendedProps.category as TaskCategory;
    const completed = eventInfo.event.extendedProps.completed;
    
    const start = eventInfo.event.start || new Date();
    const end = eventInfo.event.end || start;
    
    // Differentiate short vs long events for visual logic
    const durationMinutes = differenceInMinutes(end, start);
    const isShortEvent = durationMinutes <= 20;

    const isMonthView = eventInfo.view.type === 'dayGridMonth';
    const isMirror = eventInfo.isMirror;
    
    // Status Logic
    const isMissed = !completed && isPast(new Date(end));
    const isCharted = completed;

    // --- MONTH VIEW RENDERING ---
    if (isMonthView) {
        let pillStyle = '';
        let icon = null;

        if (isCharted) {
            pillStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-500/50 line-through opacity-70';
            icon = <Check size={10} strokeWidth={4} />;
        } else if (isMissed) {
            pillStyle = 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-500/50 font-bold';
            icon = <AlertCircle size={10} strokeWidth={3} />;
        } else {
            switch(cat) {
                case 'Review': pillStyle = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-500/50'; break;
                case 'School': pillStyle = 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-500/50'; break;
                case 'Duty': pillStyle = 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-500/50'; break;
                case 'Personal': pillStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-500/50'; break;
                default: pillStyle = 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600';
            }
        }

        return (
            <div className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md border w-full truncate flex items-center gap-1 transition-all hover:scale-105 ${pillStyle}`}>
                {icon && <span className="shrink-0">{icon}</span>}
                <span className="truncate">{eventInfo.event.title}</span>
            </div>
        );
    }

    // --- WEEK/DAY VIEW STYLES ---
    let styles = { bg: '', border: '', text: '', icon: null as React.ReactNode };

    if (isCharted) {
        styles = {
            bg: 'bg-emerald-5 dark:bg-emerald-500/10',
            border: 'border-l-4 border-emerald-500',
            text: 'text-emerald-800 dark:text-emerald-300 line-through opacity-70',
            icon: <Check size={14} strokeWidth={4} />
        };
    } else if (isMissed) {
        styles = {
            bg: 'bg-red-50 dark:bg-red-500/10',
            border: 'border-l-4 border-red-500',
            text: 'text-red-800 dark:text-red-300 font-bold',
            icon: <AlertCircle size={14} strokeWidth={3} />
        };
    } else {
        switch(cat) {
            case 'Review': 
                styles = { bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-l-4 border-rose-500', text: 'text-rose-900 dark:text-rose-200', icon: null };
                break;
            case 'School': 
                styles = { bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-l-4 border-violet-500', text: 'text-violet-900 dark:text-violet-200', icon: null };
                break;
            case 'Duty': 
                styles = { bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-l-4 border-sky-500', text: 'text-sky-900 dark:text-sky-200', icon: null };
                break;
            case 'Personal':
                styles = { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-l-4 border-emerald-500', text: 'text-emerald-900 dark:text-emerald-200', icon: null };
                break;
            default:
                styles = { bg: 'bg-slate-50 dark:bg-slate-800', border: 'border-l-4 border-slate-500', text: 'text-slate-900 dark:text-slate-200', icon: null };
        }
    }

    // --- DRAG (MIRROR) VISUALS ---
    if (isMirror) {
        if (isShortEvent) {
            // 15-MINUTE VISUAL
            return (
                <div 
                    className={`relative w-full h-full min-h-[32px] px-2 rounded-lg flex items-center justify-between shadow-2xl border border-white dark:border-slate-600 bg-opacity-100 z-50 transform scale-102 ${styles.bg}`} 
                    style={{ opacity: 1 }}
                >
                    <div className={`font-extrabold text-xs flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis ${styles.text}`}>
                        {styles.icon}
                        <span className="truncate">{eventInfo.event.title}</span>
                    </div>
                    <div className={`font-mono text-[10px] font-bold opacity-90 whitespace-nowrap ml-1 ${styles.text}`}>
                        {eventInfo.timeText}
                    </div>
                </div>
            );
        } else {
            // 30-MINUTE+ VISUAL
            return (
                <div 
                    className={`relative w-full h-full min-h-[50px] p-2 rounded-xl flex flex-col justify-center shadow-2xl border-2 border-white dark:border-slate-600 bg-opacity-100 z-50 transform scale-102 ${styles.bg}`} 
                    style={{ opacity: 1 }}
                >
                    <div className={`font-extrabold text-sm flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis ${styles.text}`}>
                        {styles.icon}
                        <span>{eventInfo.event.title}</span>
                    </div>
                    <div className={`font-mono text-xs font-bold opacity-90 mt-0.5 whitespace-nowrap ${styles.text}`}>
                        {eventInfo.timeText}
                    </div>
                </div>
            );
        }
    }

    // --- STATIC EVENT RENDERING (Grid View) ---
    if (isShortEvent) {
        return (
          <div className={`w-full h-full px-2 rounded-r-md transition-all hover:brightness-95 backdrop-blur-sm flex items-center gap-2 overflow-hidden ${styles.bg} ${styles.border}`}>
            <span className={`truncate font-extrabold text-xs ${styles.text}`}>{eventInfo.event.title}</span>
          </div>
        );
    }

    return (
      <div className={`w-full h-full p-2 rounded-r-lg transition-all hover:brightness-95 backdrop-blur-sm flex flex-col justify-start overflow-hidden ${styles.bg} ${styles.border}`}>
        <div className={`truncate font-extrabold text-sm md:text-base flex items-center gap-1.5 ${styles.text}`}>
            {styles.icon}
            <span className="truncate">{eventInfo.event.title}</span>
        </div>
        <div className={`truncate opacity-90 mt-0.5 ${styles.text} font-mono text-xs font-medium`}>
            {eventInfo.timeText}
        </div>
      </div>
    );
  };

  const renderDayHeader = (args: any) => {
    const date = args.date;
    const viewType = args.view.type;
    const dayName = format(date, 'EEE'); 
    
    if (viewType === 'dayGridMonth') {
        return (
            <div className="py-2 text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-widest">{dayName}</span>
            </div>
        );
    }

    const dayNumber = format(date, 'd');
    const isToday = isSameDay(date, new Date());
    
    return (
        <div className={`flex flex-col items-center gap-1 py-3 ${isToday ? 'text-pink-500' : 'text-slate-600 dark:text-slate-400'}`}>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">{dayName}</span>
            <div 
                className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                    isToday ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
                {dayNumber}
            </div>
        </div>
    );
  };

  const events = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: task.start,
    end: task.end,
    allDay: task.allDay,
    extendedProps: { category: task.category, priority: task.priority, completed: task.completed },
    editable: true, 
  }));

  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] overflow-hidden font-sans relative">
      
      {/* GLOBAL CALENDAR STYLES */}
      <style>{`
        :root {
            --fc-border-color: rgba(148, 163, 184, 0.1);
            --fc-page-bg-color: transparent;
            --fc-neutral-bg-color: transparent;
            --fc-today-bg-color: rgba(236, 72, 153, 0.05);
            --fc-now-indicator-color: #ec4899;
        }
        .fc-theme-standard td, .fc-theme-standard th { border-color: var(--fc-border-color) !important; }
        .fc-col-header-cell-cushion { color: #475569 !important; text-decoration: none !important; } 
        .dark .fc-col-header-cell-cushion { color: #94a3b8 !important; }
        .fc-daygrid-day-number { color: #334155 !important; font-weight: 700; font-size: 0.9rem; padding: 8px !important; text-decoration: none !important; }
        .dark .fc-daygrid-day-number { color: #e2e8f0 !important; }
        .fc-timegrid-slot-label-cushion { 
            font-size: 0.75rem !important;
            font-weight: 700 !important;
            color: #64748b !important;
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em;
        }
        .dark .fc-timegrid-slot-label-cushion { color: #94a3b8 !important; }
        .fc-timegrid-slot:hover { background-color: rgba(236, 72, 153, 0.02); }
        .fc-v-event { background-color: transparent !important; border: none !important; box-shadow: none !important; }
        .fc-h-event { background-color: transparent !important; border: none !important; }
        
        /* Draggable Mirror Style - Explicit Sharpening & Overflow Visibility */
        .fc-event-mirror {
            z-index: 9999 !important;
            box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.3) !important;
            opacity: 1 !important;
            transform: scale(1.02) !important;
            -webkit-font-smoothing: antialiased; 
            -moz-osx-font-smoothing: grayscale;
            backface-visibility: hidden;
            border-radius: 12px !important;
            overflow: visible !important;
        }
        
        .fc-event-mirror .fc-event-main {
            overflow: visible !important;
        }
        
        .fc-timegrid-slot { height: 4rem !important; }
        .fc-highlight { background: rgba(236, 72, 153, 0.1) !important; }
        .fc-timegrid-now-indicator-line {
            border-color: #ec4899 !important;
            border-width: 2px !important;
            box-shadow: 0 0 10px #ec4899;
        }
        .fc-timegrid-now-indicator-arrow {
            border-color: #ec4899 !important;
            border-width: 6px !important;
        }

        /* MOBILE OVERRIDES (<640px) */
        @media (max-width: 639px) {
            .fc-timegrid-slot { height: 3rem !important; }
            .fc-toolbar-title { font-size: 1.1rem !important; }
            .fc-col-header-cell-cushion { font-size: 0.7rem !important; padding-top: 2px !important; padding-bottom: 2px !important; }
            .fc-timegrid-slot-label-cushion { font-size: 0.65rem !important; }
            .fc-event { font-size: 0.65rem !important; }
            .fc-timegrid-axis-cushion { max-width: 40px !important; overflow: hidden; }
        }

        .agenda-scrollbar,
        .fc-scroller {
            scrollbar-width: thin;
            scrollbar-color: transparent transparent;
            transition: scrollbar-color 0.3s;
        }
        .agenda-scrollbar:hover,
        .fc-scroller:hover {
            scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        .agenda-scrollbar::-webkit-scrollbar,
        .fc-scroller::-webkit-scrollbar {
            width: 6px; 
            height: 6px;
        }
        .agenda-scrollbar::-webkit-scrollbar-button,
        .fc-scroller::-webkit-scrollbar-button {
            display: none !important;
            width: 0;
            height: 0;
        }
        .agenda-scrollbar::-webkit-scrollbar-track,
        .fc-scroller::-webkit-scrollbar-track {
            background: transparent;
        }
        .agenda-scrollbar::-webkit-scrollbar-thumb,
        .fc-scroller::-webkit-scrollbar-thumb {
            background-color: transparent;
            border-radius: 10px;
            border: 1px solid transparent; 
            background-clip: content-box;
        }
        .agenda-scrollbar:hover::-webkit-scrollbar-thumb,
        .fc-scroller:hover::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.5);
        }
      `}</style>

      {/* --- RESPONSIVE HEADER --- */}
      <PlannerHeader 
        currentDate={currentDate}
        pendingCount={pendingCount}
        currentView={currentView}
        mobileTab={mobileTab}
        isSidebarOpen={isSidebarOpen}
        onPrev={() => {
            if (currentView === 'schedule') {
                // For schedule, maybe scroll up? Or no-op for now as it's continuous
            } else {
                calendarRef.current?.getApi().prev();
            }
        }}
        onNext={() => {
            if (currentView === 'schedule') {
                // no-op
            } else {
                calendarRef.current?.getApi().next();
            }
        }}
        onToday={() => {
            if (currentView === 'schedule') {
                const todayId = format(new Date(), 'yyyy-MM-dd');
                document.getElementById(`date-group-${todayId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                calendarRef.current?.getApi().today();
            }
        }}
        onViewChange={handleViewChange}
        setMobileTab={setMobileTab}
        setIsSidebarOpen={setIsSidebarOpen}
        onAddEvent={() => { setSelectedTask(null); setIsModalOpen(true); }}
      />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex overflow-hidden relative">
          
          {/* VIEW AREA: Switches between FullCalendar and ScheduleView */}
          <div className={`flex-1 bg-white/40 dark:bg-[#020617]/40 backdrop-blur-sm relative z-0 flex flex-col min-w-0 transition-all duration-300 ease-in-out
              ${mobileTab === 'agenda' ? 'hidden lg:flex' : 'flex'}
          `}>
              {currentView === 'schedule' ? (
                  <ScheduleView onTaskClick={(task) => { setSelectedTask(task); setIsModalOpen(true); }} />
              ) : (
                  <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={false}
                        events={events}
                        eventContent={renderEventContent}
                        dayHeaderContent={renderDayHeader}
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={3}
                        nowIndicator={true}
                        slotDuration="00:30:00"
                        slotLabelInterval="01:00"
                        snapDuration="00:15:00"
                        navLinks={true}
                        navLinkDayClick={handleNavLinkDayClick}
                        select={handleDateSelect}
                        eventDrop={handleEventDrop}
                        eventResize={handleEventResize}
                        eventClick={handleEventClick}
                        dateClick={handleDateClick}
                        datesSet={handleDatesSet}
                        height="100%"
                        slotMinTime="06:00:00"
                        slotMaxTime="24:00:00"
                        allDaySlot={true}
                        allDayText=""
                  />
              )}
          </div>

          {/* AGENDA SIDEBAR */}
          <div className={`
              bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-2xl border-l border-slate-200/50 dark:border-white/5 flex flex-col z-20 shadow-2xl lg:shadow-none 
              transition-all duration-300 ease-in-out transform
              ${mobileTab === 'agenda' ? 'w-full absolute inset-0 lg:static' : 'hidden lg:flex'}
              ${isSidebarOpen ? 'lg:w-96 lg:translate-x-0 lg:opacity-100' : 'lg:w-0 lg:translate-x-full lg:opacity-0 lg:overflow-hidden lg:border-l-0'}
          `}>
              
              {/* Sidebar Header */}
              <div className="p-3 sm:p-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30 flex justify-between items-center backdrop-blur-sm relative z-30 shrink-0 min-w-[200px] overflow-visible">
                  <div className="min-w-0">
                      <h3 className="text-base sm:text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2 break-words">
                          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-lg shadow-pink-500/50 shrink-0"></span>
                          {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'EEEE')}
                      </h3>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 ml-4 break-words">{format(selectedDate, 'MMMM do')}</p>
                  </div>
                  <div className="relative shrink-0" ref={menuRef}>
                      <button onClick={() => setShowAgendaMenu(!showAgendaMenu)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"><MoreHorizontal size={20} /></button>
                      {showAgendaMenu && (
                          <div className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-[100] animate-in zoom-in-95 origin-top-right">
                              <button onClick={handleRollover} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"><RefreshCw size={12}/> Rollover Overdue</button>
                              <button onClick={handleClearCompleted} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"><CheckCircle2 size={12}/> Clear Done</button>
                              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                              <button onClick={handleClearDay} className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"><Trash2 size={12}/> Clear Day</button>
                          </div>
                      )}
                  </div>
              </div>

              {/* Task List (Mobile Landscape Optimized Grid) */}
              <div className="flex-1 overflow-y-auto agenda-scrollbar p-3 sm:p-6 relative z-10 min-w-[200px]">
                  {agendaTasks.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                          <div className="relative">
                              <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center relative z-10">
                                  <Layers size={40} className="text-slate-300 dark:text-slate-600" />
                              </div>
                              <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full"></div>
                          </div>
                          <div>
                              <p className="text-lg font-bold text-slate-700 dark:text-white mb-2">Clear Schedule</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                                  No tasks for this day. Enjoy your rest or plan ahead for success.
                              </p>
                          </div>
                          <button onClick={() => handleQuickAdd('Study Session')} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-xs font-bold uppercase tracking-wider text-pink-500">
                              <Sparkles size={14} /> Quick Add Session
                          </button>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                          {agendaTasks.map(task => (
                              <div key={task.id} onClick={() => { setSelectedTask(task); setIsModalOpen(true); }} className={`group bg-white/70 dark:bg-slate-800/70 p-2.5 sm:p-4 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm hover:shadow-lg hover:border-pink-500/20 dark:hover:border-pink-500/20 transition-all cursor-pointer relative overflow-hidden backdrop-blur-sm ${task.completed ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                  {/* Left Border Indicator */}
                                  <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
                                      task.category === 'Review' ? 'bg-rose-500' :
                                      task.category === 'School' ? 'bg-violet-500' :
                                      task.category === 'Duty' ? 'bg-sky-500' : 'bg-emerald-500'
                                  }`}></div>

                                  <div className="flex justify-between items-start mb-2 relative z-20 pl-3">
                                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                                          task.category === 'Review' ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' :
                                          task.category === 'School' ? 'bg-violet-50 border-violet-100 text-violet-600 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400' :
                                          'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-700/50 dark:border-slate-600/50 dark:text-slate-300'
                                      }`}>{task.category}</span>
                                      <button onClick={(e) => { e.stopPropagation(); toggleTask(task.id, task.completed); }} className={`p-1 rounded-full transition-colors ${task.completed ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}>
                                          {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                      </button>
                                  </div>
                                  <h4 className={`text-xs sm:text-base font-bold text-slate-800 dark:text-white mb-1 leading-snug pl-3 ${task.completed ? 'line-through text-slate-500' : ''}`}>{task.title}</h4>
                                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono font-bold mt-2 pl-3">
                                      <Clock size={12} className="text-pink-500" />
                                      {format(new Date(task.start), 'h:mm a')} - {format(new Date(task.end), 'h:mm a')}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
              
              {/* Bottom Actions */}
              <div className="p-3 sm:p-4 bg-white/80 dark:bg-[#0f172a]/90 border-t border-slate-200/50 dark:border-slate-800 backdrop-blur-xl relative z-30 shrink-0 min-w-[200px]">
                  <DailyDistribution tasks={agendaTasks} />
              </div>
          </div>
      </div>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedTask}
        selectedDate={selectedDate}
        onSave={handleSaveTask}
        onDelete={deleteTask}
        onToggleStatus={toggleTask}
      />
    </div>
  );
};

export default Planner;
