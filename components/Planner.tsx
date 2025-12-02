
import React, { useState, useMemo } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Check, Trash2, Tag, Flag } from 'lucide-react';
import { useTasks } from '../TaskContext';
import { TaskCategory, TaskPriority, Task } from '../types';

const Planner: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Task Filtering for Selected Date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const tasksForDay = useMemo(() => {
    return tasks
      .filter(t => t.date === selectedDateStr)
      .sort((a, b) => {
        // Sort by Priority (High -> Low) then Completion
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [tasks, selectedDateStr]);

  // Add Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('Review');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await addTask(newTaskTitle, selectedDateStr, newTaskCategory, newTaskPriority);
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  // Styles Helpers
  const getCategoryStyles = (cat: TaskCategory) => {
    switch(cat) {
      case 'Review': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
      case 'Duty': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'School': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Personal': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch(p) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-orange-500';
      case 'Low': return 'text-slate-400';
    }
  };

  const getDotColor = (cat: TaskCategory) => {
      switch(cat) {
        case 'Review': return 'bg-pink-500';
        case 'Duty': return 'bg-blue-500';
        case 'School': return 'bg-yellow-500';
        case 'Personal': return 'bg-green-500';
      }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto pb-10 h-[calc(100vh-140px)]">
      
      {/* LEFT: Monthly Calendar */}
      <div className="lg:w-[400px] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center py-2 bg-slate-50 dark:bg-slate-900/50">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <span key={d} className="text-xs font-semibold text-slate-400 uppercase">{d}</span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1">
          {calendarDays.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            // Get tasks for this specific day to render dots
            const dayTasks = tasks.filter(t => t.date === dateStr);
            // Get unique categories for dots (max 3)
            const categories = Array.from(new Set(dayTasks.map(t => t.category))).slice(0, 3);
            
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isToday(day);

            return (
              <div 
                key={dateStr}
                onClick={() => setSelectedDate(day)}
                className={`
                  min-h-[60px] border-b border-r border-slate-50 dark:border-slate-700/50 p-1 flex flex-col items-center cursor-pointer transition-colors relative
                  ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-black/20 text-slate-300 dark:text-slate-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-700'}
                  ${isSelected ? '!bg-pink-500 !text-white shadow-md z-10' : ''}
                `}
              >
                <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isTodayDate && !isSelected ? 'bg-navy-900 text-white dark:bg-white dark:text-navy-900' : ''}`}>
                  {format(day, 'd')}
                </span>
                
                {/* Activity Dots */}
                <div className="flex gap-1 mt-1">
                   {categories.map(cat => (
                     <div key={cat} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : getDotColor(cat)}`} />
                   ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Agenda / Task List */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
         <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
             <div>
               <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                 {isToday(selectedDate) ? "Today's Agenda" : format(selectedDate, 'EEEE, MMM do')}
               </h2>
               <p className="text-slate-500 dark:text-slate-400 text-sm">
                 {tasksForDay.filter(t => t.completed).length} / {tasksForDay.length} tasks completed
               </p>
             </div>
             <button 
               onClick={() => setShowAddModal(true)}
               className="bg-navy-900 dark:bg-white text-white dark:text-navy-900 px-4 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
             >
               <Plus size={18} /> Add Task
             </button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {tasksForDay.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-60">
                <CalendarIcon size={48} />
                <p>No tasks planned for this day.</p>
              </div>
            ) : (
              tasksForDay.map(task => (
                <div 
                  key={task.id}
                  className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    task.completed 
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-transparent opacity-60' 
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:border-pink-200 dark:hover:border-pink-900'
                  }`}
                >
                  <button 
                    onClick={() => toggleTask(task.id, task.completed)}
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.completed 
                        ? 'bg-pink-500 border-pink-500 text-white' 
                        : 'border-slate-300 dark:border-slate-600 hover:border-pink-500 text-transparent'
                    }`}
                  >
                    <Check size={14} strokeWidth={3} />
                  </button>

                  <div className="flex-1">
                    <p className={`font-medium text-slate-800 dark:text-white ${task.completed ? 'line-through decoration-slate-400' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${getCategoryStyles(task.category)}`}>
                         {task.category}
                       </span>
                       <span className={`text-xs font-semibold flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                         <Flag size={12} fill="currentColor" /> {task.priority}
                       </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
         </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white">Add New Task</h3>
                 <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                   <Plus size={24} className="rotate-45" />
                 </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                 <div>
                   <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 block mb-1">Task Title</label>
                   <input 
                     type="text" 
                     value={newTaskTitle}
                     onChange={e => setNewTaskTitle(e.target.value)}
                     placeholder="e.g. Read NP1 Chapter 4"
                     autoFocus
                     className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all dark:text-white"
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 block mb-1">Category</label>
                        <div className="relative">
                            <Tag size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <select 
                                value={newTaskCategory}
                                onChange={e => setNewTaskCategory(e.target.value as TaskCategory)}
                                className="w-full p-3 pl-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white appearance-none"
                            >
                                <option value="Review">Review</option>
                                <option value="Duty">Duty</option>
                                <option value="School">School</option>
                                <option value="Personal">Personal</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 block mb-1">Priority</label>
                        <div className="relative">
                            <Flag size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <select 
                                value={newTaskPriority}
                                onChange={e => setNewTaskPriority(e.target.value as TaskPriority)}
                                className="w-full p-3 pl-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-white appearance-none"
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={!newTaskTitle.trim()}
                      className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 disabled:opacity-50 transition-all"
                    >
                      Add Task
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
