
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePomodoro, PomodoroSession } from './PomodoroContext';
import { Activity, Trash2, Clock, PieChart as PieIcon, BarChart3, Info, X, Target, Calendar, CheckCircle2 } from 'lucide-react';
import { format, isSameDay, subDays, startOfDay, isAfter } from 'date-fns';

const DailyPieChart = ({ focusTime, breakTime }: { focusTime: number, breakTime: number }) => {
  const total = focusTime + breakTime;
  
  if (total === 0) {
      return (
          <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50">
              <PieIcon size={32} />
              <span className="text-xs font-medium">No activity today</span>
          </div>
      );
  }

  const focusPct = (focusTime / total) * 100;
  // CSS Conic Gradient for Pie Chart
  const gradient = `conic-gradient(#ec4899 0% ${focusPct}%, #06b6d4 ${focusPct}% 100%)`;

  return (
      <div className="flex items-center gap-8 justify-center h-40">
          <div className="relative w-28 h-28 rounded-full shadow-lg" style={{ background: gradient }}>
              {/* Inner Circle for Doughnut Effect */}
              <div className="absolute inset-0 m-4 bg-white dark:bg-[#0f172a] rounded-full flex flex-col items-center justify-center z-10">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                  <span className="text-xl font-black text-slate-800 dark:text-white leading-none mt-0.5">{Math.round(total)}<span className="text-xs text-slate-400">m</span></span>
              </div>
          </div>
          
          <div className="space-y-3">
              <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-xs mb-0.5">
                      <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                      <span className="text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">Focus</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800 dark:text-white leading-none pl-4">
                      {Math.round(focusTime)}<span className="text-xs text-slate-400 ml-0.5">m</span>
                  </span>
              </div>
              <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-xs mb-0.5">
                      <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                      <span className="text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">Break</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800 dark:text-white leading-none pl-4">
                      {Math.round(breakTime)}<span className="text-xs text-slate-400 ml-0.5">m</span>
                  </span>
              </div>
          </div>
      </div>
  );
};

// New Weekly Overview Component
const WeeklyOverview = ({ history }: { history: PomodoroSession[] }) => {
    // Generate last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), i);
        return { 
            date: d, 
            label: format(d, 'EEE'), // Mon, Tue
            isToday: i === 0 
        };
    }).reverse();

    // Calculate totals per day
    const weeklyData = days.map(day => {
        const dayStart = startOfDay(day.date);
        const nextDayStart = startOfDay(subDays(day.date, -1)); // Next day midnight

        const daySessions = history.filter(s => {
            const sessionDate = new Date(s.startTime);
            return sessionDate >= dayStart && sessionDate < nextDayStart && s.type === 'focus';
        });

        const totalMinutes = daySessions.reduce((acc, curr) => acc + curr.duration, 0) / 60;
        return { ...day, minutes: Math.round(totalMinutes) };
    });

    const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 60); // Minimum scale of 60 mins

    return (
        <div className="h-24 flex items-end justify-between gap-1 px-2 pt-4">
            {weeklyData.map((d, i) => {
                const heightPct = (d.minutes / maxMinutes) * 100;
                return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap z-10 pointer-events-none">
                            {d.minutes}m
                        </div>
                        
                        <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-t-sm h-16 relative flex items-end overflow-hidden">
                            <div 
                                style={{ height: `${heightPct}%` }}
                                className={`w-full transition-all duration-1000 ${d.isToday ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-pink-400 dark:group-hover:bg-pink-600'}`}
                            ></div>
                        </div>
                        <span className={`text-[8px] font-bold uppercase ${d.isToday ? 'text-pink-500' : 'text-slate-400'}`}>
                            {d.label}
                        </span>
                    </div>
                )
            })}
        </div>
    );
};

const PomodoroStats: React.FC = () => {
  const { sessionHistory, deleteSession } = usePomodoro();
  const [showWeeklyInfo, setShowWeeklyInfo] = useState(false);

  const today = new Date();
  const todaysSessions = sessionHistory.filter(s => {
      try {
          return isSameDay(new Date(s.startTime), today);
      } catch (e) {
          return false;
      }
  });
  
  // Calculate Totals for Pie Chart
  const focusTime = todaysSessions
    .filter(s => s.type === 'focus')
    .reduce((acc, curr) => acc + curr.duration, 0) / 60;

  const breakTime = todaysSessions
    .filter(s => s.type !== 'focus')
    .reduce((acc, curr) => acc + curr.duration, 0) / 60;

  // Calculate Weekly Stats for Info Modal
  const last7DaysSessions = sessionHistory
    .filter(s => s.type === 'focus' && isAfter(new Date(s.startTime), subDays(new Date(), 7)));

  const weeklyFocusMinutes = last7DaysSessions
    .reduce((acc, curr) => acc + curr.duration, 0) / 60;

  const activeDays = new Set(last7DaysSessions.map(s => startOfDay(new Date(s.startTime)).toISOString())).size;

  return (
    <div className="flex flex-col h-full gap-4">
        
        {/* --- DAILY PIE CHART --- */}
        <div className="bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-xl dark:shadow-2xl relative overflow-hidden backdrop-blur-xl transition-colors min-h-[220px] flex flex-col justify-between shrink-0">
            <div className="flex items-center gap-2 opacity-60 pl-2">
                <PieIcon size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Daily Balance</span>
            </div>
            
            <DailyPieChart focusTime={focusTime} breakTime={breakTime} />
        </div>

        {/* --- WEEKLY BALANCE (NEW) --- */}
        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-3xl p-5 overflow-hidden shrink-0 relative">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 opacity-60">
                    <BarChart3 size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Weekly Focus</span>
                </div>
                <button 
                    onClick={() => setShowWeeklyInfo(true)}
                    className="text-slate-400 hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Accountability Report"
                >
                    <Info size={14} />
                </button>
            </div>
            
            <WeeklyOverview history={sessionHistory} />

            {/* ACCOUNTABILITY INFO MODAL (CENTERED PORTAL) */}
            {showWeeklyInfo && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setShowWeeklyInfo(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm md:max-w-md rounded-[2rem] p-6 shadow-2xl border border-white/20 relative animate-zoom-in" onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-pink-50 dark:bg-pink-500/20 text-pink-500 rounded-xl">
                                    <Target size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Accountability</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">7-Day Performance Report</p>
                                </div>
                            </div>
                            <button onClick={() => setShowWeeklyInfo(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Grid Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-24">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Hours</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white">
                                    {(weeklyFocusMinutes / 60).toFixed(1)}<span className="text-sm text-slate-400 font-bold ml-1">hr</span>
                                </span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-24">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Avg</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white">
                                    {Math.round(weeklyFocusMinutes / 7)}<span className="text-sm text-slate-400 font-bold ml-1">min</span>
                                </span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-24">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consistency</span>
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-purple-500" />
                                    <span className="text-xl font-black text-slate-900 dark:text-white">
                                        {activeDays}<span className="text-slate-400 text-sm">/7 days</span>
                                    </span>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-24">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion</span>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                    <span className="text-xl font-black text-slate-900 dark:text-white">
                                        {sessionHistory.filter(s => s.type === 'focus' && isAfter(new Date(s.startTime), subDays(new Date(), 7))).length} <span className="text-sm text-slate-400">sessions</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Insight Footer */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                            <p className="text-xs text-blue-800 dark:text-blue-200 font-medium leading-relaxed flex gap-3">
                                <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
                                <span>
                                    <strong>Consistency beats intensity.</strong> A steady routine (even 30 mins/day) builds long-term retention better than cramming. Keep the bar chart steady!
                                </span>
                            </p>
                        </div>

                    </div>
                </div>,
                document.body
            )}
        </div>

        {/* --- SESSION LOG --- */}
        <div className="flex-1 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-3xl p-5 overflow-hidden flex flex-col min-h-[200px]">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0">
                <Clock size={12} /> Today's Log
            </h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {todaysSessions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <Activity size={24} className="mb-2" />
                        <span className="text-xs">No data recorded yet</span>
                        <span className="text-[9px] mt-1">(Min 10s to log)</span>
                    </div>
                ) : (
                    todaysSessions.map(session => (
                        <div key={session.id} className="group flex justify-between items-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-pink-200 dark:hover:border-slate-600 transition-all shadow-sm">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${session.type === 'focus' ? 'bg-pink-500' : 'bg-cyan-500'}`}></span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                        {session.type === 'focus' ? 'Focus Session' : 'Break'}
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5 ml-3.5">
                                    {format(new Date(session.startTime), 'h:mm a')} • {Math.round(session.duration / 60)} min
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {session.type === 'focus' && (
                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded truncate max-w-[80px]">
                                        {session.subject}
                                    </span>
                                )}
                                <button 
                                    onClick={() => deleteSession(session.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                    title="Delete Log"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
};

export default PomodoroStats;
