
import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTasks } from '../TaskContext';
import TaskModal from './TaskModal';
import { Task, TaskCategory } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  LayoutGrid, 
  Clock,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  BrainCircuit,
  Calendar as CalendarIcon,
  Keyboard,
  X,
  PieChart,
  Coffee,
  Sun,
  Moon,
  Sunset,
  CheckCircle2,
  Circle,
  AlertCircle,
  Check
} from 'lucide-react';
import { format, isSameDay, differenceInMinutes, addHours, isPast, isFuture, addMinutes } from 'date-fns';

// --- DAILY DISTRIBUTION WIDGET (Compact Sidebar Version) ---
const DailyDistribution: React.FC<{ tasks: Task[], date: Date }> = ({ tasks, date }) => {
    
    let totalMinutes = 0;
    
    // Initialize stats containers
    const categories: Record<TaskCategory, { minutes: number; color: string; text: string; label: string }> = {
        'Review': { minutes: 0, color: 'bg-pink-500', text: 'text-pink-500', label: 'Review' },
        'School': { minutes: 0, color: 'bg-amber-500', text: 'text-amber-500', label: 'School' },
        'Duty': { minutes: 0, color: 'bg-blue-600', text: 'text-blue-600', label: 'Duty' },
        'Personal': { minutes: 0, color: 'bg-emerald-500', text: 'text-emerald-500', label: 'Personal' }
    };

    tasks.forEach(t => {
        const start = new Date(t.start);
        const end = new Date(t.end);
        const duration = differenceInMinutes(end, start);
        
        if (duration > 0) {
            totalMinutes += duration;
            if (categories[t.category]) {
                categories[t.category].minutes += duration;
            }
        }
    });

    const totalHours = (totalMinutes / 60).toFixed(1);
    const hasData = totalMinutes > 0;
    const taskCount = tasks.length;

    return (
        <div className="mt-auto bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-700/50 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                     <PieChart size={14} className="text-slate-400" />
                     <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                         Daily Balance
                     </span>
                 </div>
                 <div className="text-right">
                    <span className="text-lg font-black text-slate-800 dark:text-white leading-none">
                        {totalHours}<span className="text-xs text-slate-400 ml-0.5">h</span>
                    </span>
                 </div>
            </div>

            {/* Compact Bar */}
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex mb-4">
                {hasData ? (
                    Object.entries(categories).map(([key, data]) => {
                        const pct = (data.minutes / totalMinutes) * 100;
                        if (pct === 0) return null;
                        return (
                            <div 
                                key={key} 
                                style={{ width: `${pct}%` }} 
                                className={`h-full ${data.color}`}
                            />
                        );
                    })
                ) : (
                    <div className="w-full h-full opacity-20 bg-slate-400"></div>
                )}
            </div>

            {/* List Stats */}
            <div className="space-y-2">
                {Object.entries(categories).map(([key, data]) => {
                    if (data.minutes === 0) return null;
                    const pct = Math.round((data.minutes / totalMinutes) * 100);
                    const hrs = (data.minutes / 60).toFixed(1);
                    return (
                        <div key={key} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${data.color}`}></div>
                                <span className="text-slate-600 dark:text-slate-300 font-medium">{data.label}</span>
                            </div>
                            <div className="flex gap-2 text-slate-500 font-mono">
                                <span>{pct}%</span>
                                <span className="opacity-50">|</span>
                                <span>{hrs}h</span>
                            </div>
                        </div>
                    );
                })}
                {!hasData && (
                    <p className="text-center text-[10px] text-slate-400 italic py-2">No data recorded for this day.</p>
                )}
            </div>
        </div>
    );
};


const Planner: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  const calendarRef = useRef<FullCalendar>(null);
  
  // UI State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek'>('timeGridWeek');
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Partial<Task> | null>(null);

  // Menu State
  const [showAgendaMenu, setShowAgendaMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAgendaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or content editable
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'arrowleft':
          calendarRef.current?.getApi().prev();
          break;
        case 'arrowright':
          calendarRef.current?.getApi().next();
          break;
        case 't':
          calendarRef.current?.getApi().today();
          setSelectedDate(new Date());
          break;
        case 'm':
          calendarRef.current?.getApi().changeView('dayGridMonth');
          setCurrentView('dayGridMonth');
          break;
        case 'w':
          calendarRef.current?.getApi().changeView('timeGridWeek');
          setCurrentView('timeGridWeek');
          break;
        case 'a': // Add
          e.preventDefault(); // Prevent browser defaults if any
          setSelectedTask(null);
          setIsModalOpen(true);
          break;
        case 'escape':
          setShowAgendaMenu(false);
          setShowShortcuts(false);
          break;
        case '?':
        case '/':
             if(e.shiftKey || e.key === '?') {
                 e.preventDefault();
                 setShowShortcuts(prev => !prev);
             }
             break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- 0. HELPER: Get Agenda Tasks ---
  const agendaTasks = tasks
    .filter(task => {
      try {
        if (!task.start) return false;
        return isSameDay(new Date(task.start), selectedDate);
      } catch (e) { return false; }
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // --- 1. SMART ACTIONS ---

  const handleRollover = async () => {
    // Find unfinished tasks from BEFORE today
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
        baseTime.setHours(8, 0, 0, 0); // Start rescheduling at 8 AM

        for (let i = 0; i < overdueTasks.length; i++) {
            const task = overdueTasks[i];
            const duration = differenceInMinutes(new Date(task.end), new Date(task.start));
            
            const newStart = addMinutes(baseTime, i * 60).toISOString(); // Stack them hourly
            const newEnd = addMinutes(new Date(newStart), duration).toISOString();

            await updateTask(task.id, { start: newStart, end: newEnd, date: format(new Date(newStart), 'yyyy-MM-dd') });
        }
    }
    setShowAgendaMenu(false);
  };

  const handleQuickStudyBlock = async () => {
      // Create a 2-hour study block at the next logical hour
      const now = new Date();
      let startBlock = new Date(selectedDate);
      
      if (isSameDay(selectedDate, now)) {
          // If today, start next hour
          startBlock.setHours(now.getHours() + 1, 0, 0, 0);
      } else {
          // If future/past, start at 9 AM
          startBlock.setHours(9, 0, 0, 0);
      }
      
      const endBlock = addHours(startBlock, 2);

      await addTask({
          title: "Deep Work Session 🧠",
          category: 'Review',
          priority: 'High',
          start: startBlock.toISOString(),
          end: endBlock.toISOString(),
          allDay: false
      });
      setShowAgendaMenu(false);
  };

  const handleClearCompleted = async () => {
      const completedOnDay = agendaTasks.filter(t => t.completed);
      if (completedOnDay.length === 0) return;

      if (confirm(`Delete ${completedOnDay.length} completed tasks from this day?`)) {
          for (const t of completedOnDay) {
              await deleteTask(t.id);
          }
      }
      setShowAgendaMenu(false);
  };

  // --- SHIFT TEMPLATE LOGIC ---
  const handleAddShift = async (type: 'AM' | 'PM' | 'NOC') => {
      const baseDate = new Date(selectedDate);
      let start = new Date(baseDate);
      let end = new Date(baseDate);
      
      // Reset minutes/seconds/ms to ensure clean hours
      start.setMinutes(0, 0, 0);
      end.setMinutes(0, 0, 0);

      let title = "";

      if (type === 'AM') {
          start.setHours(6); // 6:00 AM
          end.setHours(14);  // 2:00 PM
          title = "AM Shift ☀️";
      } else if (type === 'PM') {
          start.setHours(14); // 2:00 PM
          end.setHours(22);   // 10:00 PM
          title = "PM Shift 🌇";
      } else if (type === 'NOC') {
          start.setHours(22); // 10:00 PM
          end = addHours(start, 8); // 6:00 AM next day
          title = "Graveyard Shift 🌙";
      }

      await addTask({
          title: title,
          category: 'Duty',
          priority: 'High',
          start: start.toISOString(),
          end: end.toISOString(),
          allDay: false
      });
  };

  // --- 2. INTERACTION HANDLERS ---

  const handleEventDrop = async (info: any) => {
    const { event } = info;
    const cat = event.extendedProps.category;
    
    // Check if Duty is locked - Though updated editable property should handle this
    if (cat === 'Duty') {
        info.revert();
        return;
    }

    const newStart = event.start?.toISOString();
    const newEnd = event.end?.toISOString() || newStart;

    if (event.id && newStart) {
      try {
        await updateTask(event.id, {
          start: newStart,
          end: newEnd,
          allDay: event.allDay
        });
      } catch (error) {
        info.revert();
      }
    }
  };

  const handleEventResize = async (info: any) => {
    const { event } = info;
    if (event.id && event.start && event.end) {
      await updateTask(event.id, { 
        start: event.start.toISOString(), 
        end: event.end.toISOString() 
      });
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    const { startStr, endStr, allDay, view } = selectInfo;
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    setSelectedTask({
        start: startStr,
        end: endStr,
        allDay: allDay
    });
    
    if (view.type === 'dayGridMonth') {
        setSelectedDate(selectInfo.start);
    }
    
    setIsModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    // Prevent opening modal if clicking the checkbox/status icon
    if ((info.jsEvent.target as HTMLElement).closest('.event-action-btn')) {
        return;
    }
      
    const taskId = info.event.id;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  };

  const handleDateClick = (arg: { date: Date, view: any }) => {
    setSelectedDate(arg.date);
  };

  const handleDatesSet = (arg: any) => {
      if (calendarRef.current) {
          setCurrentDate(calendarRef.current.getApi().getDate());
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
          });
       }
    }
  };

  // --- 3. NAVIGATION ---

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
  };

  const handleToday = () => {
    calendarRef.current?.getApi().today();
    setSelectedDate(new Date());
  };

  const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek') => {
    calendarRef.current?.getApi().changeView(view);
    setCurrentView(view);
  };

  // --- 4. CUSTOM RENDERERS ---

  const getEventGradient = (cat: TaskCategory, isCompleted: boolean, isOverdue: boolean) => {
    if (isCompleted) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 opacity-80';
    if (isOverdue) return 'bg-white dark:bg-slate-900 border-red-400 border-dashed dark:border-red-500 pattern-diagonal-lines';
    
    switch(cat) {
      case 'Review': return 'from-pink-500 to-rose-500 border-pink-600';
      case 'Duty': return 'from-blue-500 to-indigo-600 border-blue-600';
      case 'School': return 'from-amber-400 to-orange-500 border-orange-500';
      case 'Personal': return 'from-emerald-400 to-teal-500 border-teal-500';
      default: return 'from-slate-500 to-slate-600 border-slate-600';
    }
  };

  const renderEventContent = (eventInfo: any) => {
    const cat = eventInfo.event.extendedProps.category as TaskCategory;
    const completed = eventInfo.event.extendedProps.completed;
    const taskId = eventInfo.event.id;

    // Time Check
    const start = eventInfo.event.start;
    const end = eventInfo.event.end || start;
    const isOverdue = !completed && isPast(end);
    
    const gradient = getEventGradient(cat, completed, isOverdue);
    const durationMins = differenceInMinutes(end, start);
    const isShort = durationMins <= 30;
    const shortTimeText = format(start, 'h:mm a');

    // Handle Quick Toggle (Stop propagation handled in Planner logic via class check usually, but here we invoke handler directly)
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleTask(taskId, completed);
    };

    return (
      <div className={`w-full h-full rounded-md border-l-[3px] shadow-sm overflow-hidden group hover:scale-[1.02] transition-transform relative ${completed || isOverdue ? gradient : `bg-gradient-to-br ${gradient}`}`}>
        
        {/* Quick Action Button (Top Right) */}
        {!isShort && (
            <div className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity event-action-btn">
                <button 
                    onClick={handleToggle}
                    className={`p-1 rounded-full shadow-sm backdrop-blur-sm ${
                        completed 
                        ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                        : 'bg-white/20 text-white hover:bg-white/40'
                    }`}
                    title={completed ? "Mark Pending" : "Mark Charted"}
                >
                    {completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                </button>
            </div>
        )}

        <div className={`h-full px-2 flex ${isShort ? 'flex-row items-center gap-2' : 'flex-col justify-start py-1.5'}`}>
            {!isShort && (
                 <div className="flex items-center justify-between w-full mb-0.5">
                     <span className={`text-[10px] font-bold uppercase tracking-widest leading-none ${completed || isOverdue ? 'text-slate-500 dark:text-slate-400' : 'text-white/90'}`}>
                         {shortTimeText}
                     </span>
                     {isOverdue && !completed && (
                         <span className="flex items-center gap-1 text-[9px] font-black bg-red-100 text-red-600 px-1 rounded uppercase">
                             Missed
                         </span>
                     )}
                     {completed && (
                         <span className="flex items-center gap-1 text-[9px] font-black bg-emerald-100 text-emerald-600 px-1 rounded uppercase">
                             Charted
                         </span>
                     )}
                 </div>
            )}
            <span className={`font-bold truncate leading-tight ${isShort ? 'text-xs' : 'text-xs md:text-sm'} ${
                completed ? 'text-slate-500 line-through decoration-slate-400' : isOverdue ? 'text-red-500' : 'text-white'
            }`}>
                {eventInfo.event.title}
            </span>
        </div>
        
        {/* Completed Overlay Pattern */}
        {completed && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-multiply"></div>}
      </div>
    );
  };

  const renderDayHeader = (args: any) => {
    const viewType = args.view.type;
    const date = args.date;
    const dayName = format(date, 'EEE'); 

    // FIX: Month View should only show Day Names (SUN, MON...)
    if (viewType === 'dayGridMonth') {
         return (
            <div className="py-2.5 text-center">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {dayName}
                </span>
            </div>
         );
    }
    
    // Week View: Show detailed pill
    const dayNumber = format(date, 'd');
    const isToday = isSameDay(date, new Date());
    const isSelected = isSameDay(date, selectedDate);

    return (
        <div 
            className={`flex flex-col items-center justify-center gap-1 py-2 cursor-pointer transition-all rounded-xl mx-2 my-1 border-2 ${
                isToday 
                    ? 'bg-pink-500 border-pink-500 shadow-md transform scale-105' 
                    : isSelected 
                        ? 'bg-white dark:bg-slate-700 border-pink-500 shadow-sm' 
                        : 'border-transparent hover:bg-white dark:hover:bg-slate-800'
            }`} 
            onClick={() => setSelectedDate(date)}
        >
            <span className={`text-[10px] font-bold uppercase tracking-widest leading-none ${isToday ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                {dayName}
            </span>
            <span className={`text-lg font-black leading-none ${
                isToday ? 'text-white' : isSelected ? 'text-pink-600 dark:text-pink-400' : 'text-slate-700 dark:text-slate-300'
            }`}>
                {dayNumber}
            </span>
        </div>
    );
  };
  
  // Highlight selected date in Month Grid
  const dayCellClassNames = (arg: any) => {
      if (isSameDay(arg.date, selectedDate)) {
          return ['!bg-pink-50', 'dark:!bg-pink-900/20'];
      }
      return [];
  };

  const events = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: task.start,
    end: task.end,
    allDay: task.allDay,
    extendedProps: { 
        category: task.category, 
        priority: task.priority,
        completed: task.completed // Pass completion status
    },
    backgroundColor: 'transparent', 
    borderColor: 'transparent',
    textColor: 'transparent',
    // LOCK DUTY TASKS (Non-editable)
    editable: task.category !== 'Duty',
    startEditable: task.category !== 'Duty',
    durationEditable: task.category !== 'Duty'
  }));

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20 lg:pb-4 font-sans text-slate-900 dark:text-slate-100 relative h-auto lg:h-[calc(100vh-140px)]">
      
      {/* 
         PREMIUM CSS INJECTION 
      */}
      <style>{`
        .fc { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .fc-header-toolbar { display: none !important; }
        
        .fc-timegrid-slot-label-cushion, 
        .fc-timegrid-axis-cushion {
            color: #0f172a !important; 
            font-weight: 700;
            font-size: 0.75rem;
            text-transform: uppercase;
            opacity: 1 !important;
        }
        
        .dark .fc-timegrid-slot-label-cushion, 
        .dark .fc-timegrid-axis-cushion {
            color: #94a3b8 !important; 
        }

        .fc-daygrid-day-number {
            font-size: 0.9rem;
            font-weight: 700;
            padding: 8px;
            color: #334155 !important;
            text-decoration: none !important;
        }
        .dark .fc-daygrid-day-number {
            color: #cbd5e1 !important;
        }
        
        .fc-theme-standard td, .fc-theme-standard th {
           border-color: rgba(148, 163, 184, 0.1) !important; 
        }
        .dark .fc-theme-standard td, .dark .fc-theme-standard th {
           border-color: rgba(255, 255, 255, 0.05) !important;
        }

        .fc-day-today { background: transparent !important; }
        .fc-highlight { background: rgba(236, 72, 153, 0.05) !important; }

        .fc-timegrid-slot { 
            height: 3.5rem !important; 
            border-bottom: 1px dashed rgba(0,0,0,0.05) !important;
        }
        .dark .fc-timegrid-slot {
            border-bottom: 1px dashed rgba(255,255,255,0.03) !important;
        }
        
        .fc-timegrid-now-indicator-line { 
            border-color: #ec4899; 
            border-width: 2px;
            box-shadow: 0 0 10px #ec4899;
            z-index: 50;
            opacity: 0.8;
        }
        .fc-timegrid-now-indicator-arrow { 
            border-color: #ec4899; 
            border-width: 6px; 
            margin-top: -6px;
        }

        .fc-scrollgrid-section-header > td {
            background: transparent !important;
            border-bottom: 1px solid rgba(0,0,0,0.05) !important;
        }
        .dark .fc-scrollgrid-section-header > td {
            border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        }

        .fc-scroller::-webkit-scrollbar { width: 6px; }
        .fc-scroller::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.3);
            border-radius: 10px;
        }
        .fc-scroller::-webkit-scrollbar-track { background: transparent; }
        
        /* Diagonal lines pattern for Overdue/Missed */
        .pattern-diagonal-lines {
            background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(239, 68, 68, 0.05) 5px, rgba(239, 68, 68, 0.05) 10px);
        }
      `}</style>

      {/* SHORTCUTS MODAL */}
      {showShortcuts && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={() => setShowShortcuts(false)}
              ></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <Keyboard size={20} className="text-pink-500" />
                          Keyboard Shortcuts
                      </h3>
                      <button onClick={() => setShowShortcuts(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Previous / Next</span>
                          <div className="flex gap-1">
                              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 rounded text-xs font-mono">←</kbd>
                              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 rounded text-xs font-mono">→</kbd>
                          </div>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Switch View</span>
                          <div className="flex gap-1">
                              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 rounded text-xs font-mono">W</kbd>
                              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 rounded text-xs font-mono">M</kbd>
                          </div>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Jump to Today</span>
                          <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 rounded text-xs font-mono">T</kbd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Add New Task</span>
                          <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 rounded text-xs font-mono">A</kbd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Close Menus</span>
                          <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 rounded text-xs font-mono">Esc</kbd>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 h-full lg:overflow-hidden">
        
        {/* LEFT: CALENDAR (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col bg-white dark:bg-[#0f172a]/50 backdrop-blur-3xl rounded-[2rem] shadow-xl shadow-slate-200/60 dark:shadow-black/50 border border-white/50 dark:border-slate-700/50 overflow-hidden relative transition-colors duration-500 h-[600px] lg:h-full">
            
            {/* Custom Toolbar */}
            <div className="flex flex-col gap-4 px-4 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Month Title */}
                    <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/25 transform hover:rotate-6 transition-transform duration-300 shrink-0">
                            <CalendarIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tight">
                                {format(currentDate, 'MMMM yyyy')}
                            </h2>
                            <div className="flex items-center gap-2 mt-1.5 opacity-60">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
                                    Master Schedule
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto justify-center sm:justify-start">
                        <div className="flex items-center">
                            <button onClick={handlePrev} className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all hover:shadow-sm">
                                <ChevronLeft size={18} strokeWidth={2.5} />
                            </button>
                            <button onClick={handleToday} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
                                Today
                            </button>
                            <button onClick={handleNext} className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all hover:shadow-sm">
                                <ChevronRight size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                        
                        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => handleViewChange('dayGridMonth')}
                                className={`p-2.5 rounded-xl transition-all ${currentView === 'dayGridMonth' ? 'bg-white dark:bg-slate-700 text-pink-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button 
                                onClick={() => handleViewChange('timeGridWeek')}
                                className={`p-2.5 rounded-xl transition-all ${currentView === 'timeGridWeek' ? 'bg-white dark:bg-slate-700 text-pink-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                            >
                                <Clock size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- QUICK SHIFT TOOLBAR --- */}
                <div className="w-full bg-slate-50 dark:bg-slate-800/30 rounded-xl p-2 flex items-center gap-4 border border-slate-100 dark:border-slate-700/30 overflow-x-auto">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 hidden sm:block shrink-0">Quick Duty:</span>
                     
                     <button onClick={() => handleAddShift('AM')} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-500/20 dark:hover:bg-yellow-500/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0">
                        <Sun size={14} /> AM (6-2)
                     </button>
                     <button onClick={() => handleAddShift('PM')} className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 hover:bg-orange-200 dark:bg-orange-500/20 dark:hover:bg-orange-500/30 text-orange-700 dark:text-orange-400 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0">
                        <Sunset size={14} /> PM (2-10)
                     </button>
                     <button onClick={() => handleAddShift('NOC')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0">
                        <Moon size={14} /> NOC (10-6)
                     </button>
                </div>
            </div>

            {/* Calendar Component */}
            <div className="flex-1 p-2 overflow-hidden bg-white/50 dark:bg-transparent">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={false}
                    events={events}
                    eventContent={renderEventContent}
                    dayHeaderContent={renderDayHeader}
                    dayCellClassNames={dayCellClassNames}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={3}
                    nowIndicator={true}
                    
                    slotDuration="00:30:00"
                    slotLabelInterval="01:00"
                    snapDuration="00:15:00"
                    
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
            </div>
        </div>

        {/* RIGHT: AGENDA SIDEBAR (1 Col) - Flex layout for Balance Widget */}
        <div className="lg:col-span-1 flex flex-col bg-white dark:bg-[#0f172a]/50 backdrop-blur-3xl rounded-[2rem] shadow-xl shadow-slate-200/60 dark:shadow-black/50 border border-white/50 dark:border-slate-700/50 overflow-hidden h-full min-h-[500px] relative z-20">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/20 relative shrink-0">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white leading-none tracking-tight">
                            {isSameDay(selectedDate, new Date()) ? "Today's Agenda" : format(selectedDate, 'EEEE')}
                        </h3>
                        <p className="text-xs text-pink-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                            {format(selectedDate, 'MMMM do')}
                        </p>
                    </div>
                    
                    {/* SMART ACTIONS MENU */}
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setShowAgendaMenu(!showAgendaMenu)}
                            className={`p-2 rounded-xl transition-all ${showAgendaMenu ? 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400' : 'text-slate-300 hover:text-slate-500 dark:hover:text-slate-200'}`}
                        >
                            <MoreHorizontal size={24} />
                        </button>
                        
                        {showAgendaMenu && (
                            <div className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-600 p-2 z-50 animate-in fade-in zoom-in-95 origin-top-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Smart Actions</p>
                                
                                <button onClick={handleRollover} className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors">
                                    <RefreshCw size={14} className="text-blue-500" />
                                    <span>Rollover Overdue</span>
                                </button>
                                
                                <button onClick={handleQuickStudyBlock} className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors">
                                    <BrainCircuit size={14} className="text-purple-500" />
                                    <span>Add Study Block</span>
                                </button>
                                
                                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                
                                <button onClick={handleClearCompleted} className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors">
                                    <Trash2 size={14} />
                                    <span>Clear Completed</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <button 
                    onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
                    className="group w-full py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 hover:from-slate-800 hover:to-slate-700 text-white dark:text-slate-900 rounded-xl font-bold shadow-lg shadow-slate-900/20 dark:shadow-white/5 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                    title="Press 'A' to Add Task"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Add Task</span>
                </button>
            </div>

            {/* Timeline Task List (Grow to fill available space) */}
            <div className="flex-1 overflow-y-auto p-0 custom-scrollbar relative min-h-0">
                {agendaTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Coffee size={32} className="text-slate-400" />
                        </div>
                        <h4 className="text-slate-700 dark:text-white font-bold text-lg">Nothing Planned</h4>
                        <p className="text-slate-400 text-xs mt-1">Enjoy your free time or<br/>use Smart Actions to plan.</p>
                    </div>
                ) : (
                    <div className="py-4 relative">
                        {/* Continuous Vertical Line */}
                        <div className="absolute left-[52px] top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>

                        {agendaTasks.map((task, index) => {
                            const isHigh = task.priority === 'High';
                            const startTime = format(new Date(task.start), 'h:mm a');
                            const isPastTask = isPast(new Date(task.end));
                            const isCurrentTask = isPast(new Date(task.start)) && isFuture(new Date(task.end));
                            const isStudyBlock = task.title.includes('Deep Work');
                            
                            return (
                                <div 
                                    key={task.id}
                                    onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                                    className="group relative pl-4 pr-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-4"
                                >
                                    {/* Time Column */}
                                    <div className="flex flex-col items-end pt-1 w-[32px] shrink-0">
                                        <span className={`text-xs font-bold leading-none ${isCurrentTask ? 'text-pink-500' : 'text-slate-900 dark:text-white'}`}>
                                            {startTime.split(' ')[0]}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                                            {startTime.split(' ')[1]}
                                        </span>
                                    </div>

                                    {/* Timeline Node */}
                                    <div className="relative flex flex-col items-center shrink-0 pt-1.5 z-10">
                                        <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                                            isCurrentTask 
                                            ? 'bg-pink-500 border-pink-200 dark:border-pink-900 ring-4 ring-pink-500/20 animate-pulse' 
                                            : isStudyBlock
                                                ? 'bg-purple-500 border-purple-200 dark:border-purple-800'
                                                : isHigh 
                                                    ? 'bg-white dark:bg-slate-900 border-red-500' 
                                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-500 group-hover:border-pink-400'
                                        }`}></div>
                                    </div>

                                    {/* Card Content */}
                                    <div className={`flex-1 rounded-xl p-3 border transition-all ${
                                        task.completed 
                                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30'
                                        : isCurrentTask
                                        ? 'bg-white dark:bg-slate-800 border-pink-500 shadow-md ring-1 ring-pink-500/10'
                                        : isPastTask
                                            ? 'bg-slate-50/50 dark:bg-slate-800/30 border-red-200 dark:border-red-900/50 border-dashed'
                                            : isStudyBlock
                                                ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/50'
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-pink-300 dark:hover:border-pink-700'
                                    }`}>
                                         <div className="flex justify-between items-start mb-1">
                                             <div className="flex gap-2">
                                                 <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                                                     isStudyBlock
                                                     ? 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-transparent'
                                                     : task.priority === 'High' 
                                                        ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' 
                                                        : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                                                 }`}>
                                                     {task.priority}
                                                 </span>
                                                 {task.completed && (
                                                     <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 flex items-center gap-1">
                                                         <Check size={8} strokeWidth={4} /> Charted
                                                     </span>
                                                 )}
                                             </div>
                                             
                                             <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                <button 
                                                    onClick={() => toggleTask(task.id, task.completed)}
                                                    className={`p-1 rounded-full transition-colors ${task.completed ? 'text-emerald-500 bg-emerald-100' : 'text-slate-300 hover:bg-slate-100'}`}
                                                >
                                                    {task.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                                </button>
                                             </div>
                                         </div>
                                         <h4 className={`font-bold text-sm leading-snug ${task.completed ? 'text-slate-500 line-through decoration-slate-300' : isPastTask && !task.completed ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                             {task.title}
                                         </h4>
                                         {isPastTask && !task.completed && (
                                             <p className="text-[10px] text-red-400 font-bold mt-1 uppercase">Missed Dose</p>
                                         )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Daily Distribution Widget (Fixed Bottom) */}
            <DailyDistribution tasks={agendaTasks} date={selectedDate} />
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
