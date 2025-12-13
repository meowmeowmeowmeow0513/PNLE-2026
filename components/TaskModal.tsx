
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Trash2, Save, Check, Type, Tag, Flag, AlertTriangle, Circle, CheckCircle2, RotateCw, FileText } from 'lucide-react';
import { Task, TaskCategory, TaskPriority } from '../types';
import { format, isPast, addHours } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onToggleStatus?: (id: string, currentStatus: boolean) => Promise<void>;
  initialData?: Partial<Task> | null;
  selectedDate?: Date | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, onDelete, onToggleStatus, initialData, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Review');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [details, setDetails] = useState(''); // New state for details
  
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Helper to format Date/ISO to datetime-local string (YYYY-MM-DDTHH:mm)
  const toLocalISOString = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  useEffect(() => {
    if (isOpen) {
      setShowDeleteConfirm(false);
      if (initialData) {
        // Edit Mode
        setTitle(initialData.title || '');
        setCategory(initialData.category || 'Review');
        setPriority(initialData.priority || 'Medium');
        setAllDay(initialData.allDay || false);
        setCompleted(initialData.completed || false);
        setDetails(initialData.details || '');
        
        setStart(initialData.start ? toLocalISOString(initialData.start) : '');
        setEnd(initialData.end ? toLocalISOString(initialData.end) : '');
      } else if (selectedDate) {
        // Create Mode (from date click)
        const baseDate = new Date(selectedDate);
        if (baseDate.getHours() === 0 && baseDate.getMinutes() === 0) {
            baseDate.setHours(8, 0, 0, 0);
        }

        const nextHour = new Date(baseDate.getTime() + 60 * 60 * 1000);
        
        setTitle('');
        setCategory('Review');
        setPriority('Medium');
        setAllDay(false);
        setCompleted(false);
        setDetails('');
        setStart(toLocalISOString(baseDate));
        setEnd(toLocalISOString(nextHour));
      } else {
        // Default Create Mode
        const now = new Date();
        now.setMinutes(0, 0, 0);
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

        setTitle('');
        setCategory('Review');
        setPriority('Medium');
        setCompleted(false);
        setDetails('');
        setStart(toLocalISOString(now));
        setEnd(toLocalISOString(nextHour));
      }
    }
  }, [isOpen, initialData, selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !start || !end) return;

    setLoading(true);
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);

      await onSave({
        id: initialData?.id,
        title,
        category,
        priority,
        start: startDate.toISOString(), 
        end: endDate.toISOString(),
        allDay,
        completed,
        details // Save details
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!initialData?.id || !onDelete) return;
    setLoading(true);
    try {
        await onDelete(initialData.id);
        onClose();
    } catch (error) {
        console.error("Delete failed", error);
    } finally {
        setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (initialData?.id && onToggleStatus) {
        setCompleted(!completed);
        await onToggleStatus(initialData.id, completed);
    } else {
        setCompleted(!completed);
    }
  };

  const handleRescheduleNow = async () => {
      const now = new Date();
      // Round to next 15 mins
      const rem = 15 - (now.getMinutes() % 15);
      now.setMinutes(now.getMinutes() + rem);
      
      const duration = (new Date(end).getTime() - new Date(start).getTime());
      const newEnd = new Date(now.getTime() + duration);

      setStart(toLocalISOString(now));
      setEnd(toLocalISOString(newEnd));
  };

  const isOverdue = initialData?.id && !completed && isPast(new Date(end));

  // --- UI Helpers ---
  const CategoryPill = ({ cat, colorClass, icon: Icon }: { cat: TaskCategory, colorClass: string, icon: any }) => (
    <button
      type="button"
      onClick={() => setCategory(cat)}
      className={`relative flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 border flex flex-col items-center gap-1 ${
        category === cat 
          ? `${colorClass} border-transparent text-white shadow-lg shadow-current/20 transform scale-105 z-10` 
          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={16} />
      {cat}
      {category === cat && (
          <div className="absolute top-1 right-1">
              <Check size={12} strokeWidth={4} />
          </div>
      )}
    </button>
  );

  const PriorityPill = ({ level, colorClass }: { level: TaskPriority, colorClass: string }) => (
    <button
      type="button"
      onClick={() => setPriority(level)}
      className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
        priority === level 
          ? `${colorClass} border-transparent text-white shadow-md transform scale-105` 
          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {level}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop - LIGHTER and LESS BLURRY */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-700/50 p-0 overflow-hidden animate-zoom-in flex flex-col max-h-[90vh]">
        
        {/* Header decoration */}
        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${completed ? 'from-emerald-500 to-teal-500' : isOverdue ? 'from-red-500 to-orange-500' : 'from-rose-500 via-purple-500 to-sky-500'}`}></div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
            {/* Top Bar */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        {initialData?.id ? 'Edit Plan' : 'New Plan'}
                        {initialData?.id && (
                             <span className={`text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                                 completed 
                                 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                 : isOverdue 
                                     ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                                     : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                             }`}>
                                {completed ? 'Charted' : isOverdue ? 'Missed Dose' : 'Active'}
                            </span>
                        )}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
                        {initialData?.id ? 'Update your schedule details below.' : 'Add a new item to your agenda.'}
                    </p>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* --- STATUS TOGGLE (If Editing) --- */}
            {initialData?.id && (
                <div className="mb-6">
                    {isOverdue ? (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 flex flex-col gap-3">
                             <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                 <AlertTriangle size={18} />
                                 <span className="font-bold text-sm">Missed Task Protocol</span>
                             </div>
                             <p className="text-xs text-red-500 dark:text-red-300">This task was scheduled for the past. Choose an action:</p>
                             <div className="flex gap-2">
                                 <button 
                                     type="button" 
                                     onClick={() => { setCompleted(true); }}
                                     className="flex-1 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                 >
                                     Mark Done (Late)
                                 </button>
                                 <button 
                                     type="button"
                                     onClick={handleRescheduleNow}
                                     className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
                                 >
                                     <RotateCw size={14} /> Reschedule to Now
                                 </button>
                             </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleToggle}
                            className={`w-full py-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
                                completed 
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-rose-500 hover:text-rose-500'
                            }`}
                        >
                            {completed ? (
                                <>
                                    <div className="bg-emerald-500 text-white rounded-full p-1"><Check size={16} strokeWidth={4} /></div>
                                    <span className="font-bold text-lg">Marked as Charted</span>
                                </>
                            ) : (
                                <>
                                    <div className="border-2 border-current rounded-full p-1 w-6 h-6"></div>
                                    <span className="font-bold text-lg">Mark as Charted</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title Input */}
            <div className="relative group">
                <div className="absolute top-3.5 left-4 text-slate-400 group-focus-within:text-rose-500 transition-colors">
                    <Type size={20} />
                </div>
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task Title (e.g. Maternal Chapter 1)"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-lg"
                    autoFocus
                />
            </div>

            {/* Category Selector (Updated Colors) */}
            <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Tag size={12} /> Category
                </label>
                <div className="flex gap-2.5">
                    <CategoryPill cat="Review" colorClass="bg-rose-500" icon={Calendar} />
                    <CategoryPill cat="School" colorClass="bg-violet-500" icon={Save} />
                    <CategoryPill cat="Duty" colorClass="bg-sky-500" icon={Clock} />
                    <CategoryPill cat="Personal" colorClass="bg-emerald-500" icon={Check} />
                </div>
            </div>

            {/* Time Inputs */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Clock size={12} /> Start Time
                    </label>
                    <input 
                        type="datetime-local" 
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all cursor-pointer"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Clock size={12} /> End Time
                    </label>
                    <input 
                        type="datetime-local" 
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        min={start}
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all cursor-pointer"
                    />
                </div>
            </div>

            {/* Details / Patient Chart Area (New) */}
            <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <FileText size={12} /> Patient Chart / Details
                </label>
                <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Add notes, patient details, or clinical orders..."
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 text-sm font-mono leading-relaxed focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all min-h-[120px] resize-none"
                />
            </div>

            {/* Priority Selector */}
            <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Flag size={12} /> Priority Level
                </label>
                <div className="flex gap-2">
                    <PriorityPill level="High" colorClass="bg-red-500" />
                    <PriorityPill level="Medium" colorClass="bg-orange-500" />
                    <PriorityPill level="Low" colorClass="bg-blue-500" />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 mt-2 flex items-center gap-3 border-t border-slate-100 dark:border-slate-700/50 sticky bottom-0 bg-white dark:bg-[#0f172a] z-10 pb-2">
                {initialData?.id && onDelete && (
                    <>
                        {!showDeleteConfirm ? (
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={loading}
                                className="px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={loading}
                                className="px-4 py-3.5 rounded-xl bg-red-600 text-white font-bold animate-pulse hover:bg-red-700 transition-colors whitespace-nowrap"
                            >
                                Confirm Delete?
                            </button>
                        )}
                    </>
                )}

                <div className="flex-1 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        {loading ? (
                            <span className="opacity-80">Saving...</span>
                        ) : (
                            <>
                                <Save size={18} />
                                {initialData?.id ? 'Save Changes' : 'Create Task'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
