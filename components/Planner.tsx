
import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTasks } from '../TaskContext';
import TaskModal from './TaskModal';
import { Task, TaskCategory, TaskPriority } from '../types';
import { Loader, Coffee, Calendar as CalendarIcon, Clock, Plus, ChevronRight } from 'lucide-react';
import { format, isSameDay, parseISO, startOfToday } from 'date-fns';

const Planner: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, loading } = useTasks();
  const calendarRef = useRef<FullCalendar>(null);
  
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Partial<Task> | null>(null);
  
  // Default selected date to today for the Agenda view
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Derived state for Agenda Sidebar
  const selectedDateTasks = tasks
    .filter(task => {
        try {
            return isSameDay(parseISO(task.start), selectedDate);
        } catch (e) {
            return false;
        }
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // --- Handlers ---

  const handleDateClick = (arg: { date: Date }) => {
    // Update the sidebar view to this date
    setSelectedDate(arg.date);
    
    // Optional: Double click logic could go here to open modal immediately
    // For now, we just select the date for the agenda. 
    // To add a task, user can click the "Add Task" button in sidebar or header
  };

  const handleEventClick = (info: any) => {
    const taskId = info.event.id;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      // Also set the agenda date to this event's start date
      if (task.start) {
          setSelectedDate(new Date(task.start));
      }
      setIsModalOpen(true);
    }
  };

  const handleEventDrop = async (info: any) => {
    const { event } = info;
    const id = event.id;
    const newStart = event.start?.toISOString();
    const newEnd = event.end?.toISOString() || newStart;

    if (id && newStart) {
      await updateTask(id, {
        start: newStart,
        end: newEnd,
        allDay: event.allDay
      });
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

  const openNewTaskModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  // --- Styling Helpers ---

  const getGradientClass = (cat: TaskCategory) => {
    switch(cat) {
      case 'Review': return 'bg-gradient-to-r from-pink-600 to-pink-500';
      case 'Duty': return 'bg-gradient-to-r from-blue-600 to-blue-500';
      case 'School': return 'bg-gradient-to-r from-yellow-500 to-amber-500';
      case 'Personal': return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
      default: return 'bg-gradient-to-r from-slate-500 to-slate-400';
    }
  };

  const getBorderColor = (cat: TaskCategory) => {
      switch(cat) {
        case 'Review': return 'border-l-pink-500';
        case 'Duty': return 'border-l-blue-500';
        case 'School': return 'border-l-yellow-500';
        case 'Personal': return 'border-l-emerald-500';
        default: return 'border-l-slate-400';
      }
  };

  // Custom Event Rendering for FullCalendar
  const renderEventContent = (eventInfo: any) => {
     const category = eventInfo.event.extendedProps.category as TaskCategory;
     const gradientClass = getGradientClass(category);
     
     return (
        <div className={`w-full h-full px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 overflow-hidden ${gradientClass}`}>
            {eventInfo.event.allDay && <div className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />}
            <div className="text-xs font-bold text-white truncate leading-tight">
                {eventInfo.timeText && !eventInfo.event.allDay && <span className="opacity-80 mr-1 font-medium">{eventInfo.timeText}</span>}
                {eventInfo.event.title}
            </div>
        </div>
     );
  };

  // Map tasks to events
  const calendarEvents = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: task.start,
    end: task.end,
    allDay: task.allDay,
    extendedProps: { category: task.category, priority: task.priority },
    // We handle visual styling in renderEventContent, so we make the default background transparent
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: 'transparent' 
  }));

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-fade-in pb-6">
      
      {/* --- GLOBAL STYLES FOR FULLCALENDAR OVERRIDES --- */}
      <style>{`
        :root {
            --fc-border-color: rgba(226, 232, 240, 0.6);
            --fc-today-bg-color: transparent;
            --fc-now-indicator-color: #EC4899;
        }
        .dark {
            --fc-border-color: rgba(51, 65, 85, 0.5);
        }

        /* Container & Fonts */
        .fc {
            font-family: 'Inter', sans-serif;
        }

        /* Toolbar */
        .fc-header-toolbar {
            margin-bottom: 1.5rem !important;
            padding: 0 0.5rem;
        }
        .fc-toolbar-title {
            font-size: 1.5rem !important;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.025em;
        }
        html.dark .fc-toolbar-title {
            color: #f8fafc;
        }

        /* Buttons (Prev/Next/Today) */
        .fc-button-primary {
            background-color: transparent !important;
            border: 1px solid #e2e8f0 !important;
            color: #64748b !important;
            font-weight: 600;
            text-transform: capitalize;
            border-radius: 0.75rem !important;
            padding: 0.4rem 1rem !important;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            transition: all 0.2s;
        }
        html.dark .fc-button-primary {
            border-color: #334155 !important;
            color: #94a3b8 !important;
        }
        .fc-button-primary:hover {
            background-color: #f8fafc !important;
            color: #334155 !important;
            transform: translateY(-1px);
        }
        html.dark .fc-button-primary:hover {
            background-color: #1e293b !important;
            color: #e2e8f0 !important;
        }
        .fc-button-active {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
        }
        html.dark .fc-button-active {
            background-color: #1e293b !important;
            color: #fff !important;
        }

        /* Grid & Headers */
        .fc-theme-standard th {
            border: none; 
            padding-bottom: 10px;
        }
        .fc-col-header-cell-cushion {
            text-transform: uppercase;
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            color: #94a3b8; /* Slate-400 */
        }
        .fc-theme-standard td {
            border-color: var(--fc-border-color);
        }

        /* Day Cells */
        .fc-daygrid-day-top {
            flex-direction: row;
            justify-content: center;
            padding-top: 8px;
        }
        .fc-daygrid-day-number {
            font-size: 0.9rem;
            font-weight: 600;
            color: #475569;
            z-index: 2;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9999px;
            transition: all 0.2s;
        }
        html.dark .fc-daygrid-day-number {
            color: #cbd5e1;
        }

        /* Today Highlight Override */
        .fc-day-today {
            background: transparent !important;
        }
        .fc-day-today .fc-daygrid-day-number {
            background-color: #EC4899; /* Pink-500 */
            color: white !important;
            box-shadow: 0 4px 6px -1px rgba(236, 72, 153, 0.4);
        }

        /* Events */
        .fc-event {
            border: none;
            background: transparent;
            box-shadow: none;
            margin-bottom: 2px;
            cursor: pointer;
            transition: transform 0.1s;
        }
        .fc-event:hover {
            transform: scale(1.02);
            z-index: 5;
        }
        .fc-daygrid-event-harness {
            margin-top: 4px;
        }

        /* Week View Specifics */
        .fc-timegrid-slot-label-cushion {
            font-size: 0.75rem;
            color: #94a3b8;
        }
        .fc-timegrid-axis-cushion {
            color: #94a3b8;
        }
      `}</style>

      {/* --- LEFT: CALENDAR CANVAS --- */}
      <div className="flex-1 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-slate-700 overflow-hidden relative flex flex-col">
        {loading && (
             <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                 <Loader className="animate-spin text-pink-500" size={32} />
             </div>
        )}
        
        <div className="flex-1 p-6">
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next',
                    center: 'title',
                    right: 'today dayGridMonth,timeGridWeek'
                }}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={3}
                weekends={true}
                events={calendarEvents}
                eventContent={renderEventContent}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                height="100%"
                droppable={true}
                nowIndicator={true}
                slotMinTime="06:00:00"
                slotMaxTime="24:00:00"
            />
        </div>
      </div>

      {/* --- RIGHT: AGENDA SIDEBAR --- */}
      <div className="w-full lg:w-96 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-slate-700 flex flex-col overflow-hidden">
         
         {/* Sidebar Header */}
         <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
             <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <CalendarIcon size={20} className="text-pink-500" />
                AGENDA
             </h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                 {isSameDay(selectedDate, new Date()) 
                    ? "Today's Schedule" 
                    : format(selectedDate, 'EEEE, MMM do')}
             </p>
         </div>

         {/* Task List */}
         <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
             {selectedDateTasks.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                     <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
                         <Coffee size={32} />
                     </div>
                     <h4 className="text-slate-800 dark:text-white font-bold mb-2">No Tasks Scheduled</h4>
                     <p className="text-slate-500 dark:text-slate-400 text-sm">
                         Enjoy your rest! Or click the + button to add a new task.
                     </p>
                 </div>
             ) : (
                 selectedDateTasks.map(task => (
                     <div 
                        key={task.id}
                        onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                        className={`bg-white dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-600 shadow-sm hover:shadow-md transition-all cursor-pointer group border-l-[6px] ${getBorderColor(task.category)}`}
                     >
                         <div className="flex justify-between items-start mb-2">
                             <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-600 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                                 {task.category}
                             </span>
                             {task.priority === 'High' && (
                                 <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                             )}
                         </div>
                         
                         <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1 leading-snug group-hover:text-pink-500 transition-colors">
                             {task.title}
                         </h4>

                         <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                             <Clock size={12} />
                             {task.allDay ? (
                                 <span>All Day</span>
                             ) : (
                                 <span>
                                     {format(parseISO(task.start), 'h:mm a')} - {format(parseISO(task.end), 'h:mm a')}
                                 </span>
                             )}
                         </div>
                     </div>
                 ))
             )}
         </div>

         {/* Footer Action */}
         <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
             <button
                onClick={openNewTaskModal}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
             >
                 <Plus size={18} />
                 Add New Task
             </button>
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
