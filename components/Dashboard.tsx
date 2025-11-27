import React, { useState, useEffect } from 'react';
import { Sparkles, Timer, ArrowRight, Plus, Trash2, Check, Square } from 'lucide-react';
import { NavigationItem } from '../types';

interface DashboardProps {
  onNavigate: (item: NavigationItem) => void;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const targetDate = new Date('2026-08-29T00:00:00');
  
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

  // Task Management State
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('pnle_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load tasks", e);
      return [];
    }
  });
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Persist tasks to localStorage
  useEffect(() => {
    localStorage.setItem('pnle_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false
    };
    
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
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
                "Passing the PNLE is not about being the smartest — it’s about being prepared, consistent, and confident. Keep pushing, keep believing. Your license is waiting. ✨👩‍⚕️👨‍⚕️💙"
              </h2>
              <p className="text-pink-50 font-medium text-lg">
                – Maam Chona
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown & Focus Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Countdown Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <Timer className="text-pink-500" />
            <h3 className="text-lg font-bold text-slate-800">Time Until PNLE 2026</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {timeUnits.map((unit) => (
              <div key={unit.label} className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-100 shadow-sm transition-transform hover:scale-105">
                <span className="text-3xl md:text-4xl font-bold text-navy-900 font-mono">
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-medium mt-1">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Focus Card */}
        <div className="bg-navy-900 text-white rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 group-hover:opacity-30 transition-opacity"></div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">Ready to Focus?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Consistency beats intensity. Start a 25-minute study block now and build your momentum.
            </p>
          </div>
          
          <button 
            onClick={() => onNavigate('Pomodoro Timer')}
            className="mt-6 w-full py-3 px-4 bg-pink-accent hover:bg-pink-400 text-navy-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-pink-500/25 flex items-center justify-center gap-2"
          >
            Start Review Session
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Widgets Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Task Widget */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-pink-50 rounded-lg flex items-center justify-center text-pink-600">
                  <Check size={18} />
                </div>
                <h3 className="text-slate-800 font-bold">Daily Tasks</h3>
             </div>
             <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
               {tasks.filter(t => t.completed).length}/{tasks.length} Done
             </span>
          </div>

          <form onSubmit={addTask} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
            />
            <button 
              type="submit"
              disabled={!newTask.trim()}
              className="p-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={18} />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-2">
            {tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm italic py-8">
                <p>No tasks yet.</p>
                <p>Add one to get started!</p>
              </div>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`group flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    task.completed 
                      ? 'bg-slate-50 border-slate-100' 
                      : 'bg-white border-slate-100 hover:border-pink-200 shadow-sm'
                  }`}
                >
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`flex-shrink-0 transition-colors ${
                      task.completed ? 'text-pink-500' : 'text-slate-300 hover:text-pink-400'
                    }`}
                  >
                    {task.completed ? <Check size={20} /> : <Square size={20} />}
                  </button>
                  
                  <span className={`flex-1 text-sm truncate ${
                    task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                  }`}>
                    {task.text}
                  </span>

                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Progress Placeholder */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[200px] flex flex-col justify-center items-center text-center">
            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-slate-800 font-bold">Progress Tracker</h3>
            <p className="text-slate-500 text-sm mt-1">Completion stats coming soon.</p>
        </div>

        {/* Wellness Placeholder */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[200px] flex flex-col justify-center items-center text-center">
            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">🌱</span>
            </div>
             <h3 className="text-slate-800 font-bold">Wellness Check</h3>
            <p className="text-slate-500 text-sm mt-1">Sleep & hydration logs coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;