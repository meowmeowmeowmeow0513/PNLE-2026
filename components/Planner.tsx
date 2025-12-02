
import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTasks } from '../TaskContext';
import TaskModal from './TaskModal';
import { Task, TaskCategory, TaskPriority } from '../types';
import { Loader } from 'lucide-react';

const Planner: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, loading } = useTasks();
  const calendarRef = useRef<FullCalendar>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Partial<Task> | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // --- Handlers ---

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedTask(null);
    setSelectedDate(arg.date);
    setIsModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    const taskId = info.event.id;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setSelectedDate(null);
      setIsModalOpen(true);
    }
  };

  const handleEventDrop = async (info: any) => {
    const { event } = info;
    const id = event.id;
    
    // Convert new dates to ISO strings
    const newStart = event.start?.toISOString();
    const newEnd = event.end?.toISOString() || newStart; // Fallback if single day drop

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
      await updateTask(id, {
        start: newStart,
        end: newEnd
      });
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (taskData.id) {
      // Update
      await updateTask(taskData.id, taskData);
    } else {
      // Create
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

  // --- Styling Logic ---

  const getCategoryColor = (cat: TaskCategory) => {
    switch(cat) {
      case 'Review': return '#EC4899'; // Pink-500
      case 'Duty': return '#2563EB';   // Blue-600
      case 'School': return '#EAB308'; // Yellow-500
      case 'Personal': return '#10B981'; // Emerald-500
      default: return '#64748B';
    }
  };

  const getPriorityBorder = (p: TaskPriority) => {
      switch(p) {
          case 'High': return '3px solid #EF4444'; // Red border
          case 'Medium': return 'none'; 
          case 'Low': return 'none';
          default: return 'none';
      }
  };

  // Map tasks to FullCalendar events
  const calendarEvents = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: task.start,
    end: task.end,
    allDay: task.allDay,
    backgroundColor: getCategoryColor(task.category),
    borderColor: getCategoryColor(task.category), // Base border
    // We can use extendedProps to pass priority for custom rendering if needed
    extendedProps: {
        priority: task.priority,
        category: task.category
    },
    // Visual tweak for priority (High priority gets a specific class or style)
    className: task.priority === 'High' ? 'fc-event-high-priority' : ''
  }));

  // Render Custom Content (Optional, but adds flair)
  const renderEventContent = (eventInfo: any) => {
     const priority = eventInfo.event.extendedProps.priority;
     return (
        <div className={`w-full h-full px-1 overflow-hidden flex flex-col justify-center ${priority === 'High' ? 'border-l-4 border-red-500' : ''}`}>
            <div className="text-xs font-semibold truncate">{eventInfo.event.title}</div>
            {eventInfo.view.type === 'timeGridWeek' && (
               <div className="text-[10px] opacity-80">{eventInfo.timeText}</div>
            )}
        </div>
     );
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
      
      {/* Inject Custom CSS for FullCalendar overrides */}
      <style>{`
        .fc {
            font-family: 'Inter', sans-serif;
        }
        .fc-toolbar-title {
            font-size: 1.25rem !important;
            font-weight: 700;
            color: #1e293b;
        }
        html.dark .fc-toolbar-title {
            color: #f8fafc;
        }
        .fc-button-primary {
            background-color: #0f172a !important; /* Navy-900 */
            border-color: #0f172a !important;
            font-weight: 600;
            text-transform: capitalize;
            border-radius: 0.5rem !important;
            padding: 0.5rem 1rem !important;
        }
        .fc-button-primary:hover {
            background-color: #1e293b !important;
            border-color: #1e293b !important;
        }
        html.dark .fc-button-primary {
            background-color: #f1f5f9 !important;
            border-color: #f1f5f9 !important;
            color: #0f172a !important;
        }
        .fc-button-active {
            opacity: 0.8;
        }
        .fc-daygrid-day-number {
            font-weight: 600;
            color: #64748b;
        }
        html.dark .fc-daygrid-day-number {
            color: #94a3b8;
        }
        .fc-col-header-cell-cushion {
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            padding-top: 10px !important;
            padding-bottom: 10px !important;
            color: #64748b;
        }
        html.dark .fc-col-header-cell-cushion {
            color: #94a3b8;
        }
        .fc-theme-standard td, .fc-theme-standard th {
            border-color: #e2e8f0;
        }
        html.dark .fc-theme-standard td, html.dark .fc-theme-standard th {
            border-color: #334155;
        }
        /* Hide License Warning */
        .fc-license-message {
            display: none;
        }
        /* Event Rounded corners */
        .fc-event {
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border: none;
        }
      `}</style>

      {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 z-10">
              <Loader className="animate-spin text-pink-500" size={32} />
          </div>
      ) : null}

      <div className="flex-1 p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
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
            slotMinTime="06:00:00" // Start day at 6 AM visually
            slotMaxTime="24:00:00"
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
