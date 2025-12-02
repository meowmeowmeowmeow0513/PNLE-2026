
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
  MapPin,
  Coffee,
  MoreHorizontal
} from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';

const Planner: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const calendarRef = useRef<FullCalendar>(null);
  
  // UI State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Partial<Task> | null>(null);

  // --- 0. HELPER: Get Agenda Tasks ---
  const agendaTasks = tasks
    .filter(task => {
      try {
        if (!task.start) return false;
        return isSameDay(parseISO(task.start), selectedDate);
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

  const handleEventClick = (info: any) => {
    // Prevent bubbling if we click the event element directly
    info.jsEvent.stopPropagation(); 
    const taskId = info.event.id;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  };

  const handleDateClick = (arg: { date: Date }) => {
    // Just select the date for the Agenda view
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

  // --- 3. CUSTOM EVENT RENDERING ---

  const getEventGradient = (cat: TaskCategory) => {
    switch(cat) {
      case 'Review': return 'bg-gradient-to-r from-pink-500 to-pink-600';
      case 'Duty': return 'bg-gradient-to-r from-blue-600 to-blue-500';
      case 'School': return 'bg-gradient-to-r from-yellow-500 to-amber-500';
      case 'Personal': return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
      default: return 'bg-slate-500';
    }
  };

  const renderEventContent = (eventInfo: any) => {
    const cat = eventInfo.event.extendedProps.category as TaskCategory;
    return (
      <div className={`w-full h-full px-2 py-0.5 rounded-md shadow-sm border-l-[3px] border-black/20 overflow-hidden flex items-center gap-1 ${getEventGradient(cat)}`}>
        <span className="text-[10px] font-bold text-white/90 whitespace-nowrap">
           {eventInfo.timeText}
        </span>
        <span className="text-xs font-bold text-white truncate">
           {eventInfo.event.title}
        </span>
      </div>
    );
  };

  // Map tasks to events
  const events = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: task.start,
    end: task.end,
    allDay: task.allDay,
    extendedProps: { category: task.category, priority: task.priority },
    // We handle styling in renderEventContent, so we make background transparent here to avoid double styling
    backgroundColor: 'transparent', 
    borderColor: 'transparent',
    textColor: 'transparent' // Hide default text
  }));

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-fade-in pb-4">
      
      {/* CSS Overrides */}
      <style>{`
        /* Hide Default Header */
        .fc-header-toolbar { display: none !important; }
        
        /* Glassmorphism Grid */
        .fc-theme-standard td, .fc-theme-standard th {
           border-color: rgba(148, 163, 184, 0.1); /* Very subtle slate */
        }
        .dark .fc-theme-standard td, .dark .fc-theme-standard th {
           border-color: rgba(148, 163, 184, 0.1);
        }
        
        /* Headers */
        .fc-col-header-cell-cushion {
           padding: 12px 0;
           font-size: 0.75rem;
           font-weight: 700;
           text-transform: uppercase;
           letter-spacing: 0.1em;
           color: #94a3b8;
        }

        /* Today Cell Highlight (Number Only) */
        .fc-day-today {
           background: transparent !important;
        }
        .fc-day-today .fc-daygrid-day-number {
           background-color: #ec4899;
           color: white;
           border-radius: 50%;
           width: 28px;
           height: 28px;
           display: flex;
           align-items: center;
           justify-content: center;
           margin: 4px;
        }

        /* Slots */
        .fc-timegrid-slot { height: 3rem !important; }
        
        /* Remove Event Default Styles since we use Custom Component */
        .fc-event {
           background: transparent;
           border: none;
           box-shadow: none;
        }
        .fc-event:hover {
           transform: scale(1.02);
           z-index: 50;
           transition: transform 0.1s;
           cursor: pointer;
        }
      `}</style>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 h-full overflow-hidden">
        
        {/* LEFT: CALENDAR (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-slate-700 overflow-hidden relative">
            
            {/* Custom Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 pb-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-pink-50 dark:bg-pink-500/10 rounded-2xl text-pink-600 dark:text-pink-400 shadow-sm">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
                            Plan your shifts & reviews
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Navigation */}
                    <div className="flex items-center bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                        <button onClick={handlePrev} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={handleToday} className="px-4 py-1 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
                            Today
                        </button>
                        <button onClick={handleNext} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* View Switcher */}
                    <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                        <button 
                            onClick={() => handleViewChange('dayGridMonth')}
                            className={`p-2 rounded-lg transition-all ${currentView === 'dayGridMonth' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => handleViewChange('timeGridWeek')}
                            className={`p-2 rounded-lg transition-all ${currentView === 'timeGridWeek' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
                        >
                            <Clock size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Component */}
            <div className="flex-1 p-4 pt-0 overflow-hidden">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={false}
                    events={events}
                    eventContent={renderEventContent}
                    editable={true}
                    selectable={true}
                    dayMaxEvents={3}
                    nowIndicator={true}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    height="100%"
                    slotMinTime="06:00:00"
                    slotMaxTime="24:00:00"
                    allDaySlot={true}
                />
            </div>
        </div>

        {/* RIGHT: AGENDA SIDEBAR (1 Col) */}
        <div className="lg:col-span-1 flex flex-col bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-slate-700 overflow-hidden h-full">
            
            {/* Agenda Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                   {isSameDay(selectedDate, new Date()) ? "Today's Schedule" : format(selectedDate, 'EEEE, MMM do')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                   {agendaTasks.length} Events Scheduled
                </p>
                
                <button 
                    onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
                    className="w-full mt-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    <Plus size={18} />
                    Add Task
                </button>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {agendaTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-6">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <Coffee size={32} />
                        </div>
                        <p className="text-slate-800 dark:text-white font-medium">No events</p>
                        <p className="text-slate-500 text-xs mt-1">Enjoy your free time!</p>
                    </div>
                ) : (
                    agendaTasks.map(task => (
                        <div 
                            key={task.id}
                            onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                            className="group bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-500/50 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                        >
                            {/* Color Strip */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${getEventGradient(task.category)}`}></div>
                            
                            <div className="pl-3">
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight mb-1">
                                    {task.title}
                                </h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        <Clock size={12} />
                                        <span>{format(parseISO(task.start), 'h:mm a')}</span>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                        task.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                        task.priority === 'Medium' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                        {task.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
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
