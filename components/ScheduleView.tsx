
import React, { useMemo, useEffect, useState } from 'react';
import { format, isToday, isPast } from 'date-fns';
import { Clock, AlertCircle, CheckCircle2, Circle, CalendarX } from 'lucide-react';
import { Task, TaskCategory } from '../types';
import { useTasks } from '../TaskContext';

interface ScheduleViewProps {
  onTaskClick: (task: Task) => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ onTaskClick }) => {
  const { tasks, toggleTask } = useTasks();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update "Now" indicator every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter & Sort Tasks
  const groupedTasks = useMemo(() => {
    // Sort all tasks by date
    const sorted = [...tasks].sort((a, b) => {
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

    // Group by Date Key (YYYY-MM-DD)
    const groups: Record<string, Task[]> = {};
    sorted.forEach(task => {
      const dateKey = format(new Date(task.start), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(task);
    });

    return groups;
  }, [tasks]);

  // Helper for Colors
  const getCategoryTheme = (cat: TaskCategory) => {
    switch(cat) {
      case 'Review': return { border: 'bg-pink-500', bg: 'bg-pink-500/5', text: 'text-pink-600 dark:text-pink-400' };
      case 'Duty': return { border: 'bg-sky-500', bg: 'bg-sky-500/5', text: 'text-sky-600 dark:text-sky-400' };
      case 'School': return { border: 'bg-violet-500', bg: 'bg-violet-500/5', text: 'text-violet-600 dark:text-violet-400' };
      case 'Personal': return { border: 'bg-emerald-500', bg: 'bg-emerald-500/5', text: 'text-emerald-600 dark:text-emerald-400' };
      default: return { border: 'bg-slate-500', bg: 'bg-slate-500/5', text: 'text-slate-600 dark:text-slate-400' };
    }
  };

  // Scroll to "Today" on mount
  useEffect(() => {
    const todayId = format(new Date(), 'yyyy-MM-dd');
    const element = document.getElementById(`date-group-${todayId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const dates = Object.keys(groupedTasks);

  if (dates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <CalendarX size={40} className="opacity-50" />
        </div>
        <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Schedule Clear</p>
        <p className="text-sm opacity-70">No upcoming tasks found.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-2 sm:p-4 md:p-8 bg-slate-50/50 dark:bg-[#020617] transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-10 pb-20">
        
        {dates.map((dateKey) => {
          const [y, m, d] = dateKey.split('-').map(Number);
          const date = new Date(y, m - 1, d);
          const dayTasks = groupedTasks[dateKey];
          const isDateToday = isToday(date);

          return (
            <div key={dateKey} id={`date-group-${dateKey}`} className="flex flex-col sm:flex-row gap-0 sm:gap-4 md:gap-8 group">
              
              {/* --- LEFT: STICKY DATE HEADER --- */}
              {/* Mobile: Sticky Header Bar. Desktop: Side Column */}
              <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start w-full sm:w-20 md:w-24 shrink-0 pt-0 sm:pt-2 pb-2 sm:pb-0 sticky top-0 z-20 bg-slate-50/95 dark:bg-[#020617]/95 sm:bg-transparent sm:dark:bg-transparent backdrop-blur-sm sm:backdrop-blur-none border-b sm:border-b-0 border-slate-200 dark:border-slate-800">
                <div className="sm:sticky sm:top-4 flex flex-row sm:flex-col items-baseline sm:items-center gap-2 sm:gap-0">
                  <span className={`text-xl sm:text-4xl md:text-5xl font-black tracking-tighter ${isDateToday ? 'text-pink-500 sm:scale-110' : 'text-slate-700 dark:text-slate-200 sm:text-slate-300 sm:dark:text-slate-600'} transition-all`}>
                    {format(date, 'dd')}
                  </span>
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest sm:mt-1 ${isDateToday ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-500 sm:text-slate-400'}`}>
                    {format(date, 'EEE')}
                  </span>
                  {isDateToday && (
                    <div className="hidden sm:block mt-2 w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse shadow-[0_0_10px_#ec4899]"></div>
                  )}
                </div>
                {/* Mobile Today Indicator */}
                {isDateToday && <span className="sm:hidden text-[9px] font-bold text-white bg-pink-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Today</span>}
              </div>

              {/* --- RIGHT: TIMELINE & CARDS --- */}
              <div className="flex-1 relative border-l-0 sm:border-l border-slate-200 dark:border-slate-800 pl-0 sm:pl-6 md:pl-8 pb-4 space-y-2 sm:space-y-3 min-w-0">
                
                {/* Visual Timeline Dot on Line (Hidden on mobile) */}
                <div className={`hidden sm:block absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full border-2 ${isDateToday ? 'bg-pink-500 border-pink-100 dark:border-pink-900' : 'bg-slate-200 dark:bg-slate-800 border-slate-50 dark:border-slate-900'}`}></div>

                {dayTasks.map((task) => {
                   const isCompleted = task.completed;
                   const isOverdue = !isCompleted && isPast(new Date(task.end));
                   const theme = getCategoryTheme(task.category);
                   const startTime = format(new Date(task.start), 'h:mm a');
                   const endTime = format(new Date(task.end), 'h:mm a');

                   return (
                     <div 
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`relative p-3 sm:p-4 md:p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] cursor-pointer group/card flex flex-col gap-1.5 sm:gap-2 overflow-hidden
                          ${isCompleted 
                            ? 'bg-slate-100/50 dark:bg-[#0f172a]/40 border-slate-200 dark:border-white/5 opacity-60 grayscale-[0.8]' 
                            : 'bg-white dark:bg-[#1e293b]/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg dark:hover:shadow-black/40'
                          }
                          ${!isCompleted && isOverdue ? 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-900/10' : ''}
                        `}
                     >
                        {/* The "Samsung" Left Border Strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.border}`}></div>

                        {/* Top Row: Time & Category */}
                        <div className="flex flex-wrap items-center justify-between pl-2 gap-2">
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                                <span className={`font-mono font-bold whitespace-nowrap ${isCompleted ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {startTime}
                                </span>
                                <span className="text-slate-400 font-medium whitespace-nowrap">- {endTime}</span>
                            </div>
                            
                            <span className={`text-[8px] sm:text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded ${theme.bg} ${theme.text}`}>
                                {task.category}
                            </span>
                        </div>

                        {/* Main Content */}
                        <div className="flex items-start justify-between pl-2 gap-3 sm:gap-4">
                           <div className="flex-1 min-w-0">
                              <h3 className={`font-sans font-bold text-sm sm:text-base md:text-lg leading-tight mb-1 break-words ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                                {task.title}
                              </h3>
                              
                              {/* Tags / Priority */}
                              {task.priority === 'High' && !isCompleted && (
                                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-red-500 uppercase tracking-wider mt-1">
                                   <AlertCircle size={10} /> High Priority
                                </div>
                              )}
                           </div>

                           {/* Interactive Checkbox */}
                           <button 
                              onClick={(e) => { e.stopPropagation(); toggleTask(task.id, task.completed); }}
                              className={`p-1.5 sm:p-2 rounded-full transition-colors shrink-0 ${
                                isCompleted 
                                    ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                    : 'text-slate-300 dark:text-slate-600 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                           >
                              {isCompleted ? <CheckCircle2 size={20} className="sm:w-6 sm:h-6" /> : <Circle size={20} className="sm:w-6 sm:h-6" />}
                           </button>
                        </div>
                     </div>
                   );
                })}
              </div>
            </div>
          );
        })}
        
        {/* End of List Spacer */}
        <div className="py-8 sm:py-10 text-center">
            <p className="text-[10px] sm:text-xs font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">End of Schedule</p>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
