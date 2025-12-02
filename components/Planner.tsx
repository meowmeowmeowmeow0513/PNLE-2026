
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
  Calendar as CalendarIcon, 
  Plus, 
  LayoutGrid, 
  Clock,
  Coffee
} from 'lucide-react';
import { format, isSameDay, differenceInMinutes } from 'date-fns';

const Planner: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const calendarRef = useRef<FullCalendar>(null);
  
  // UI State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek'>('timeGridWeek'); // Default to Week for better 15-min view
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Partial<Task> | null>(null);

  // --- 0. HELPER: Get Agenda Tasks ---
  const agendaTasks = tasks
    .filter(task => {
      try {
        if (!task.start) return false;
        return isSameDay(new Date(task.start), selectedDate);
      } catch (e) { return false; }
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // --- 1. INTERACTION HANDLERS ---

  const handleEventDrop = async (info: any) => {
    const { event } = info;
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
    info.jsEvent.stopPropagation(); 
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

  // --- 2. NAVIGATION ---

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
    updateTitle();
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
    updateTitle();
  };

  const handleToday = () => {
    calendarRef.current?.getApi().today();
    updateTitle();
    setSelectedDate(new Date());
  };

  const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek') => {
    calendarRef.current?.getApi().changeView(view);
    setCurrentView(view);
    updateTitle();
  };

  const updateTitle = () => {
    if (calendarRef.current) {
      setCurrentDate(calendarRef.current.getApi().getDate());
    }
  };

  // --- 3. CUSTOM RENDERERS ---

  const getEventGradient = (cat: TaskCategory) => {
    switch(cat) {
      case 'Review': return 'from-pink-500 to-pink-600 border-pink-600/20';
      case 'Duty': return 'from-blue-600 to-blue-500 border-blue-600/20';
      case 'School': return 'from-yellow-500 to-amber-500 border-yellow-600/20';
      case 'Personal': return 'from-emerald-500 to-emerald-400 border-emerald-600/20';
      default: return 'from-slate-500 to-slate-600 border-slate-600/20';
    }
  };

  const renderEventContent = (eventInfo: any) => {
    const cat = eventInfo.event.extendedProps.category as TaskCategory;
    const gradient = getEventGradient(cat);
    
    // Check duration to adjust layout for short events (15-30 mins)
    const start = eventInfo.event.start;
    const end = eventInfo.event.end || start;
    const durationMins = differenceInMinutes(end, start);
    const isShort = durationMins <= 30;

    // Format time manually for short events to save space (e.g., "6:15" instead of "6:15 - 6:30")
    const shortTimeText = format(start, 'h:mm');

    return (
      <div className={`w-full h-full rounded-md shadow-sm border border-t-0 border-r-0 border-b-0 border-l-[4px] bg-gradient-to-r ${gradient} overflow-hidden group hover:brightness-105 transition-all`}>
        <div className={`h-full px-2 flex ${isShort ? 'flex-row items-center gap-2' : 'flex-col justify-start py-1'}`}>
            <span className={`font-mono font-bold text-white/90 whitespace-nowrap ${isShort ? 'text-xs' : 'text-[11px] uppercase tracking-wider opacity-90'}`}>
                {isShort ? shortTimeText : eventInfo.timeText}
            </span>
            <span className={`font-bold text-white truncate leading-tight ${isShort ? 'text-xs' : 'text-xs md:text-sm'}`}>
                {eventInfo.event.title}
            </span>
        </div>
      </div>
    );
  };

  const renderDayHeader = (args: any) => {
    const date = args.date;
    const dayName = format(date, 'EEE'); 
    const dayNumber = format(date, 'd');
    const isToday = isSameDay(date, new Date());

    return (
        <div className="flex flex-col items-center gap-1 py-3 group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg mx-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isToday ? 'text-pink-500' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`}>
                {dayName}
            </span>
            <span className={`flex items-center justify-center w-9 h-9 rounded-full text-base font-bold transition-all ${
                isToday ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30 scale-110' : 'text-slate-700 dark:text-slate-200 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
            }`}>
                {dayNumber}
            </span>
        </div>
    );
  };

  const events = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: task.start,
    end: task.end,
    allDay: task.allDay,
    extendedProps: { category: task.category, priority: task.priority },
    backgroundColor: 'transparent', 
    borderColor: 'transparent',
    textColor: 'transparent'
  }));

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-fade-in pb-4 font-sans">
      
      {/* 
         PREMIUM CSS INJECTION 
         - Fixes fonts for Dark Mode
         - Hides ugly "all-day" text
         - Refines grid lines
         - Adds 15-min precision visuals
      */}
      <style>{`
        /* Force Font Family */
        .fc {
            font-family: 'Inter', sans-serif !important;
        }

        /* Hide Default Header */
        .fc-header-toolbar { display: none !important; }
        
        /* Grid Borders - Ultra Subtle */
        .fc-theme-standard td, .fc-theme-standard th {
           border-color: rgba(148, 163, 184, 0.08) !important; 
        }
        .dark .fc-theme-standard td, .dark .fc-theme-standard th {
           border-color: rgba(255, 255, 255, 0.08) !important;
        }

        /* Column Headers */
        .fc-col-header-cell {
            border-bottom: 0 !important;
            padding-bottom: 8px;
            background: transparent !important;
        }

        /* DARK MODE TEXT FIXES (Month View Numbers & Week View Labels) */
        .dark .fc-daygrid-day-number {
             color: #e2e8f0 !important; /* slate-200 */
             text-decoration: none !important;
        }
        .dark .fc-col-header-cell-cushion {
             color: #cbd5e1 !important; /* slate-300 */
             text-decoration: none !important;
        }
        .dark .fc-timegrid-slot-label-cushion,
        .dark .fc-timegrid-slot-label-frame {
             color: #94a3b8 !important; /* slate-400 */
        }
        .dark .fc-scrollgrid-sync-inner {
             color: #e2e8f0;
        }

        /* Today Highlight Disable (We do custom) */
        .fc-day-today {
           background: transparent !important;
        }

        /* 15-Minute Slot Styling */
        .fc-timegrid-slot { 
            height: 2.5rem !important; /* Slightly compact for 15 min slots */
            border-bottom: 1px dotted rgba(0,0,0,0.03) !important;
        }
        .dark .fc-timegrid-slot {
            border-bottom: 1px dotted rgba(255,255,255,0.03) !important;
        }
        
        /* Major Hour Lines */
        .fc-timegrid-slot-lane.fc-timegrid-slot-minor {
            border-bottom-style: none !important;
        }

        /* Time Labels */
        .fc-timegrid-slot-label { 
            font-size: 0.75rem; 
            color: #94a3b8; 
            font-weight: 500;
            vertical-align: middle !important;
        }
        
        /* Current Time Indicator - Glowing Effect */
        .fc-timegrid-now-indicator-line { 
            border-color: #ec4899; 
            border-width: 2px;
            box-shadow: 0 0 10px rgba(236, 72, 153, 0.6);
            z-index: 50;
        }
        .fc-timegrid-now-indicator-arrow { 
            border-color: #ec4899; 
            border-width: 6px; 
            margin-left: -6px;
        }

        /* --- ALL DAY SECTION OVERHAUL --- */
        /* Hide the ugly "all-day" text */
        .fc-timegrid-axis-cushion, .fc-timegrid-axis-frame {
            display: none !important;
            width: 0px !important;
        }
        /* Make the row look like a premium header */
        .fc-scrollgrid-section-header > td {
            border-bottom: 1px solid rgba(0,0,0,0.05) !important;
        }
        .dark .fc-scrollgrid-section-header > td {
            border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        }
        
        /* All Day Events - Badge Style */
        .fc-daygrid-event {
            border-radius: 9999px !important; /* Pill shape */
            margin: 2px !important;
            padding: 2px 8px !important;
            font-size: 0.75rem !important;
            font-weight: 600 !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        /* Scrollbar aesthetics for the grid */
        .fc-scroller::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .fc-scroller::-webkit-scrollbar-track {
            background: transparent;
        }
        .fc-scroller::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.3);
            border-radius: 10px;
        }
        .dark .fc-scroller::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.2);
        }
      `}</style>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 h-full overflow-hidden">
        
        {/* LEFT: CALENDAR (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col bg-white/80 dark:bg-slate-800/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/40 dark:border-slate-700 overflow-hidden relative transition-colors">
            
            {/* Custom Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl text-white shadow-lg shadow-pink-500/30 transform hover:scale-105 transition-transform">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-none tracking-tight">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-1 uppercase tracking-wider">
                            Review Schedule
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Navigation */}
                    <div className="flex items-center bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                        <button onClick={handlePrev} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={handleToday} className="px-4 py-1 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
                            Today
                        </button>
                        <button onClick={handleNext} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* View Switcher */}
                    <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                        <button 
                            onClick={() => handleViewChange('dayGridMonth')}
                            className={`p-2 rounded-lg transition-all ${currentView === 'dayGridMonth' ? 'bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm' : 'text-slate-400'}`}
                            title="Month View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => handleViewChange('timeGridWeek')}
                            className={`p-2 rounded-lg transition-all ${currentView === 'timeGridWeek' ? 'bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm' : 'text-slate-400'}`}
                            title="Week View"
                        >
                            <Clock size={18} />
                        </button>
                    </div>
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
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={3}
                    nowIndicator={true}
                    
                    // --- PRECISION SETTINGS ---
                    slotDuration="00:15:00"  // 15 Minute Increments
                    slotLabelInterval="01:00" // Keep labels clean (hourly)
                    snapDuration="00:15:00"   // Snap to 15 mins
                    
                    // INTERACTION HANDLERS
                    select={handleDateSelect}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    
                    height="100%"
                    slotMinTime="06:00:00"
                    slotMaxTime="24:00:00"
                    allDaySlot={true}
                    allDayText="" /* Text hidden via CSS, but empty string here too */
                />
            </div>
        </div>

        {/* RIGHT: AGENDA SIDEBAR (1 Col) */}
        <div className="lg:col-span-1 flex flex-col bg-white/80 dark:bg-slate-800/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/40 dark:border-slate-700 overflow-hidden h-full">
            
            {/* Agenda Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                   {isSameDay(selectedDate, new Date()) ? "Today's Focus" : format(selectedDate, 'EEEE, MMM do')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                   {agendaTasks.length} Events Scheduled
                </p>
                
                <button 
                    onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
                    className="w-full mt-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Plus size={18} />
                    Create Task
                </button>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {agendaTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60 p-6">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-500">
                            <Coffee size={40} />
                        </div>
                        <p className="text-slate-800 dark:text-white font-bold text-lg">No plans yet</p>
                        <p className="text-slate-500 text-sm mt-1 max-w-[200px]">Tap a time slot on the calendar to start planning.</p>
                    </div>
                ) : (
                    agendaTasks.map(task => {
                        const gradient = getEventGradient(task.category);
                        const isHigh = task.priority === 'High';
                        
                        return (
                            <div 
                                key={task.id}
                                onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                                className="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-500/50 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                        isHigh ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                    }`}>
                                        {task.priority}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400">
                                        {format(new Date(task.start), 'HH:mm')}
                                    </div>
                                </div>
                                
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-snug mb-2">
                                    {task.title}
                                </h4>

                                <div className="flex items-center gap-2">
                                     <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`}></div>
                                     <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{task.category}</span>
                                </div>
                            </div>
                        );
                    })
                )}
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
      />
    </div>
  );
};

export default Planner;
