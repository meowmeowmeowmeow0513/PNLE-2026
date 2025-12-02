import React, { useState, useEffect } from 'react';
import { Sparkles, Timer, ArrowRight, Plus, Trash2, Check, Square, Users, Calendar, Flag, CheckSquare, AlertCircle } from 'lucide-react';
import { NavigationItem, TaskCategory, TaskPriority, Task } from '../types';
import StreakWidget from './StreakWidget';
import StreakRecoveryModal from './StreakRecoveryModal';
import MnemonicWidget from './MnemonicWidget';
import { useStreakSystem } from '../hooks/useStreakSystem';
import { useTasks } from '../TaskContext';
import { isSameDay } from 'date-fns';

interface DashboardProps {
  onNavigate: (item: NavigationItem) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const targetDate = new Date('2026-08-29T00:00:00');
  
  // -- STREAK SYSTEM INTEGRATION --
  const { stats, loading: streakLoading, showRecoveryModal, closeRecovery, resuscitateStreak } = useStreakSystem();
  
  // -- TASK CONTEXT --
  const { tasks: allTasks, addTask, toggleTask, deleteTask } = useTasks();
  const [newTaskText, setNewTaskText] = useState('');
  
  // -- FILTERING & SORTING --
  const today = new Date();
  
  const todaysTasks = allTasks
    .filter(t => {
      try {
        if (!t.start) return false;
        return isSameDay(new Date(t.start), today);
      } catch (e) {
        return false;
      }
    })
    .sort((a, b) => {
      // 1. Sort by Completed (Uncompleted first)
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      
      // 2. Sort by Priority (High > Medium > Low)
      const priorityWeight: Record<TaskPriority, number> = { High: 3, Medium: 2, Low: 1 };
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      return weightB - weightA;
    });

  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    // Default to Review, Medium Priority for Quick Add
    // Start time: Now, End time: Now + 1 hour
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    await addTask({
      title: newTaskText.trim(),
      category: 'Review',
      priority: 'Medium',
      start: now.toISOString(),
      end: oneHourLater.toISOString(),
      allDay: false
    });
    setNewTaskText('');
  };

  const getCategoryBorderColor = (category: TaskCategory) => {
    switch (category) {
      case 'Review': return 'border-l-pink-500';
      case 'Duty': return 'border-l-blue-600';
      case 'School': return 'border-l-yellow-500';
      case 'Personal': return 'border-l-emerald-500';
      default: return 'border-l-slate-400';
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'High': 
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-[10px] font-bold uppercase tracking-wider">
             <Flag size={10} fill="currentColor" /> High
          </div>
        );
      case 'Medium': 
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded text-[10px] font-bold uppercase tracking-wider">
             <Flag size={10} /> Med
          </div>
        );
      case 'Low': 
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider">
             <Flag size={10} /> Low
          </div>
        );
      default: return null;
    }
  };

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Recovery Modal */}
      {showRecoveryModal && (
          <StreakRecoveryModal 
             onResuscitate={resuscitateStreak}
             onClose={closeRecovery}
          />
      )}

      {/* Motivational Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-navy-900 opacity-10 rounded-full blur-2xl"></div>
        
        <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-pink-100 font-medium text-sm uppercase tracking-wide">
              <Sparkles size={16} />
              <span>Daily Motivation</span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold leading-relaxed mb-4">
                "Passing the PNLE is not about being the smartest — it’s about being prepared, consistent, and confident. Keep pushing, keep believing."
              </h2>
              <p className="text-pink-50 font-medium text-lg">
                – Maam Chona
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Spirit Image */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-md group bg-navy-900 aspect-video">
        <iframe
          src="https://drive.google.com/file/d/1oRTIbUrfPiRkMK5VpBqjDHdbs_phOJcm/preview"
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 w-full p-6 md:flex md:items-end md:justify-between gap-4 pointer-events-none">
          <div className="flex items-center gap-2 text-pink-300 mb-2">
            <Users size={18}/>
            <span className="font-semibold tracking-wider text-xs">Batch Spirit</span>
          </div>
          <h3 className="text-white font-handwriting text-4xl md:text-6xl drop-shadow-xl transform -rotate-2 origin-left">
            Crescere RN 2026!!
          </h3>
        </div>
      </div>

      {/* Countdown & Focus Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Countdown Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <Timer className="text-pink-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white transition-colors">Time Until PNLE 2026</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {timeUnits.map((unit) => (
              <div key={unit.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:scale-105">
                <span className="text-3xl md:text-4xl font-bold text-navy-900 dark:text-white font-mono transition-colors">
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Focus Card */}
        <div className="bg-white dark:bg-navy-900 text-slate-800 dark:text-white rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-navy-800 flex flex-col justify-between relative overflow-hidden group transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl opacity-10 dark:opacity-20 -mr-10 -mt-10 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity"></div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">Ready to Focus?</h3>
            <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed transition-colors">
              Consistency beats intensity. Start a 25-minute study block now and build your momentum.
            </p>
          </div>
          
          <button 
            onClick={() => onNavigate('Pomodoro Timer')}
            className="mt-6 w-full py-3 px-4 bg-pink-500 hover:bg-pink-600 dark:bg-pink-accent dark:hover:bg-pink-400 text-white dark:text-navy-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-pink-500/25 flex items-center justify-center gap-2"
          >
            Start Review Session
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Widgets Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Streak Widget */}
        <StreakWidget stats={stats} loading={streakLoading} />

        {/* Task Widget (Updated) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full min-h-[400px] md:col-span-2 lg:col-span-1 transition-colors">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-pink-50 dark:bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-600 dark:text-pink-400">
                  <CheckSquare size={18} />
                </div>
                <h3 className="text-slate-800 dark:text-white font-bold transition-colors">Today's Tasks</h3>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md transition-colors">
                 {todaysTasks.filter(t => t.completed).length}/{todaysTasks.length}
               </span>
               <button 
                  onClick={() => onNavigate('Planner')}
                  className="p-1.5 text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
                  title="Open Planner"
               >
                 <ArrowRight size={16} />
               </button>
             </div>
          </div>

          <form onSubmit={handleQuickAdd} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Quick add (Review)..."
              className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
            />
            <button 
              type="submit"
              disabled={!newTaskText.trim()}
              className="p-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Plus size={18} />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-3">
            {todaysTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm py-8 gap-3 opacity-60">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                   <Calendar size={20} />
                </div>
                <p className="italic">All clear for today!</p>
              </div>
            ) : (
              todaysTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`group relative p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all border-l-[4px] shadow-sm hover:shadow-md ${getCategoryBorderColor(task.category)} ${
                    task.completed ? 'opacity-60 bg-slate-50 dark:bg-slate-800/50' : 'hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => toggleTask(task.id, task.completed)}
                      className={`mt-0.5 flex-shrink-0 transition-colors ${
                        task.completed ? 'text-pink-500' : 'text-slate-300 dark:text-slate-600 hover:text-pink-400'
                      }`}
                    >
                      {task.completed ? <Check size={20} className="animate-in zoom-in duration-200" /> : <Square size={20} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                         <span className={`text-sm font-semibold leading-snug truncate w-full ${
                           task.completed ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-800 dark:text-white'
                         }`}>
                           {task.title}
                         </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                         {getPriorityBadge(task.priority)}
                         <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                           {task.category}
                         </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all absolute top-2 right-2"
                      title="Delete Task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mnemonic Widget */}
        <MnemonicWidget />

      </div>
    </div>
  );
};

export default Dashboard;
