
import React, { useState, useRef } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';

const Planner: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const calendarRef = useRef<FullCalendar>(null);
  
  // UI State
  const [currentTitle, setCurrentTitle] = useState(format(new Date(), 'MMMM yyyy'));
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Partial<Task> | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // --- 1. INTERACTION HANDLERS ---

  const handleEventDrop = async (info: any) => {
    const { event } = info;
    const id = event.id;
    
    // Extract new ISO strings
    const newStart = event.start?.toISOString();
    const newEnd = event.end?.toISOString() || newStart; // Fallback if single-day event drop

    if (id && newStart) {
      try {
        await updateTask(id, {
          start: newStart,
          end: newEnd,
          allDay: event.allDay
        });
        // Optional: Add a toast notification here
        console.log(`Rescheduled task ${event.title} to ${format(event.start, 'PP p')}`);
      } catch (error) {
        info.revert(); // Revert UI if DB update fails
        console.error("Failed to reschedule:", error);
      }
    }
  };

  const handleEventResize = async (info: any) => {
    const { event } = info;
    const id = event.id;
    const newStart = event.start?.toISOString();
    const newEnd = event.end?.toISOString();

    if (id && newStart && newEnd) {
      await updateTask(id, { start: newStart, end: newEnd });
    }
  };

  const handleEventClick = (info: any) => {
    const taskId = info.event.id;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setSelectedDate(null); // Clear create-mode date
      setIsModalOpen(true);
    }
  };

  const handleDateClick = (arg: { date: Date }) => {
    // Open modal for NEW task at this specific time
    setSelectedTask(null);
    setSelectedDate(arg.date);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (taskData.id) {
      await updateTask(taskData.id, taskData);
    } else {
      // Create new
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

  // --- 2. TOOLBAR CONTROLS ---

  const handlePrev = () => {
    const api = calendarRef.current?.getApi();
    api?.prev();
  };

  const handleNext = () => {
    const api = calendarRef.current?.getApi();
    api?.next();
  };

  const handleToday = () => {
    const api = calendarRef.current?.getApi();
    api?.today();
  };

  const handleViewChange = (viewName: 'dayGridMonth' | 'timeGridWeek') => {
    const api = calendarRef.current?.getApi();
    api?.changeView(viewName);
    setCurrentView(viewName);
  };

  const handleDatesSet = (arg: any) => {
    setCurrentTitle(arg.view.title);
  };

  // --- 3. DATA MAPPING ---

  const getCategoryColor = (cat: TaskCategory) => {
    switch(cat) {
      case 'Review': return '#ec4899'; // Pink-500
      case 'Duty': return '#2563eb';   // Blue-600
      case 'School': return '#eab308'; // Yellow-500
      case 'Personal': return '#10b981'; // Emerald-500
      default: return '#64748b';
    }
  };

  const events = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: task.start,
    end: task.end,
    allDay: task.allDay,
    backgroundColor: getCategoryColor(task.category),
    borderColor: 'transparent', // We use CSS for the border strip
    extendedProps: {
      category: task.category,
      priority: task.priority
    },
    classNames: ['drop-shadow-sm', 'cursor-pointer', 'font-medium']
  }));

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-fade-in pb-4">
      
      {/* --- CSS INJECTION FOR VISUAL OVERRIDES --- */}
      <style>{`
        /* 1. Global Calendar Variables */
        :root {
          --fc-border-color: rgba(226, 232, 240, 0.5); /* Slate-200 / 50% */
          --fc-today-bg-color: transparent;
          --fc-now-indicator-color: #ef4444; /* Red-500 */
        }
        .dark {
          --fc-border-color: rgba(51, 65, 85, 0.5); /* Slate-700 / 50% */
        }

        /* 2. Remove default Header since we built a custom one */
        .fc-header-toolbar {
          display: none !important;
        }

        /* 3. Grid & Cells */
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: var(--fc-border-color);
        }
        .fc-col-header-cell-cushion {
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #94a3b8; /* Slate-400 */
          padding: 12px 0;
        }
        
        /* 4. "Today" Highlight - Number Only */
        .fc-day-today .fc-daygrid-day-number {
          background-color: #ec4899;
          color: white;
          border-radius: 9999px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 4px;
        }

        /* 5. Events Styling */
        .fc-event {
          border-radius: 6px;
          border: none;
          font-size: 0.75rem;
          padding: 2px 4px;
          transition: transform 0.1s ease;
        }
        .fc-event:hover {
          transform: scale(1.02);
          z-index: 50;
        }
        
        /* Left Border Strip Logic */
        .fc-event-main {
           padding-left: 6px; /* Space for the strip */
           position: relative;
        }
        .fc-event-main::before {
           content: '';
           position: absolute;
           left: 0;
           top: 0;
           bottom: 0;
           width: 4px;
           background-color: rgba(0,0,0,0.2); /* Darker strip */
           border-top-left-radius: 4px;
           border-bottom-left-radius: 4px;
        }

        /* 6. Week View Cleanups */
        .fc-timegrid-slot {
           height: 3rem !important; /* Taller slots */
        }
        .fc-timegrid-slot-minor {
           border-top-style: dotted;
        }
      `}</style>

      {/* --- CUSTOM HEADER TOOLBAR --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-1">
        
        {/* Left: Title */}
        <div className="flex items-center gap-4">
           <div className="p-3 bg-pink-50 dark:bg-pink-500/10 rounded-2xl text-pink-600 dark:text-pink-400 shadow-sm">
              <CalendarIcon size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                 Planner
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-0.5 capitalize">
                 {currentTitle}
              </p>
           </div>
        </div>

        {/* Middle: Navigation Pills */}
        <div className="flex items-center bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-slate-200 dark:border-slate-700">
           <button onClick={handlePrev} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
              <ChevronLeft size={20} />
           </button>
           <button onClick={handleToday} className="px-4 py-1 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
              Today
           </button>
           <button onClick={handleNext} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
              <ChevronRight size={20} />
           </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
           {/* View Switcher */}
           <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => handleViewChange('dayGridMonth')}
                className={`p-2 rounded-lg transition-all ${
                    currentView === 'dayGridMonth' 
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Month View"
              >
                 <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => handleViewChange('timeGridWeek')}
                className={`p-2 rounded-lg transition-all ${
                    currentView === 'timeGridWeek' 
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Week View"
              >
                 <Clock size={18} />
              </button>
           </div>

           {/* Primary Action */}
           <button 
             onClick={() => { setSelectedTask(null); setSelectedDate(new Date()); setIsModalOpen(true); }}
             className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-pink-500/20 transition-all hover:scale-105 active:scale-95"
           >
              <Plus size={20} />
              <span className="hidden sm:inline">New Task</span>
           </button>
        </div>
      </div>

      {/* --- CALENDAR CONTAINER --- */}
      <div className="flex-1 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-slate-700 overflow-hidden relative p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false} // Hiding default
            events={events}
            editable={true}
            selectable={true}
            dayMaxEvents={3}
            nowIndicator={true}
            // Interaction Callbacks
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            // State Sync
            datesSet={handleDatesSet}
            // Layout config
            height="100%"
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            allDaySlot={true}
            slotEventOverlap={false}
          />
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
