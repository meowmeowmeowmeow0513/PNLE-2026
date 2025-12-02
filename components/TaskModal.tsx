
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Trash2, AlertCircle, Save, Check } from 'lucide-react';
import { Task, TaskCategory, TaskPriority } from '../types';
import { format } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialData?: Partial<Task> | null;
  selectedDate?: Date | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Review');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit Mode
        setTitle(initialData.title || '');
        setCategory(initialData.category || 'Review');
        setPriority(initialData.priority || 'Medium');
        setAllDay(initialData.allDay || false);
        // Ensure format is YYYY-MM-DDTHH:mm for inputs
        setStart(initialData.start ? initialData.start.slice(0, 16) : '');
        setEnd(initialData.end ? initialData.end.slice(0, 16) : '');
      } else if (selectedDate) {
        // Create Mode (from date click)
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const now = new Date();
        const timeStr = format(now, "HH:mm");
        const nextHourStr = format(new Date(now.getTime() + 60 * 60 * 1000), "HH:mm");
        
        setTitle('');
        setCategory('Review');
        setPriority('Medium');
        setAllDay(false);
        setStart(`${dateStr}T${timeStr}`);
        setEnd(`${dateStr}T${nextHourStr}`);
      } else {
        // Default Create Mode
        const now = new Date();
        const isoStart = new Date(now.setMinutes(0, 0)).toISOString().slice(0, 16);
        const isoEnd = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
        setTitle('');
        setCategory('Review');
        setPriority('Medium');
        setStart(isoStart);
        setEnd(isoEnd);
      }
    }
  }, [isOpen, initialData, selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !start || !end) return;

    setLoading(true);
    try {
      await onSave({
        id: initialData?.id, // undefined if new
        title,
        category,
        priority,
        start, // ISO string
        end,   // ISO string
        allDay
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (initialData?.id && onDelete) {
      if (window.confirm("Are you sure you want to delete this task?")) {
        setLoading(true);
        await onDelete(initialData.id);
        onClose();
        setLoading(false);
      }
    }
  };

  // --- UI Helpers ---
  const CategoryPill = ({ cat, colorClass }: { cat: TaskCategory, colorClass: string }) => (
    <button
      type="button"
      onClick={() => setCategory(cat)}
      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
        category === cat 
          ? `${colorClass} border-transparent text-white shadow-md transform scale-105` 
          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-600 text-slate-500 hover:border-slate-300'
      }`}
    >
      {cat}
    </button>
  );

  const PriorityPill = ({ level, colorClass }: { level: TaskPriority, colorClass: string }) => (
    <button
      type="button"
      onClick={() => setPriority(level)}
      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
        priority === level 
          ? `${colorClass} border-transparent text-white shadow-md transform scale-105` 
          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-600 text-slate-500 hover:border-slate-300'
      }`}
    >
      {level}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6 animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {initialData?.id ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title Input */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">What do you need to do?</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read Maternal Chapter 4"
              className="w-full text-lg p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-pink-500 focus:ring-0 outline-none transition-all placeholder:text-slate-300 dark:text-white font-medium"
              autoFocus
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Category</label>
            <div className="flex gap-2">
              <CategoryPill cat="Review" colorClass="bg-pink-500" />
              <CategoryPill cat="School" colorClass="bg-yellow-500" />
              <CategoryPill cat="Duty" colorClass="bg-blue-600" />
              <CategoryPill cat="Personal" colorClass="bg-emerald-500" />
            </div>
          </div>

          {/* Priority Selector */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Priority</label>
            <div className="flex gap-2">
              <PriorityPill level="High" colorClass="bg-red-500" />
              <PriorityPill level="Medium" colorClass="bg-orange-500" />
              <PriorityPill level="Low" colorClass="bg-blue-400" />
            </div>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Calendar size={12} /> Start Time
              </label>
              <input 
                type="datetime-local" 
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium dark:text-white outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Clock size={12} /> End Time
              </label>
              <input 
                type="datetime-local" 
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                min={start}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium dark:text-white outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            {initialData?.id && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 font-bold transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save size={20} />
                  {initialData?.id ? 'Save Changes' : 'Create Task'}
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TaskModal;
