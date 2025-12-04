
import React from 'react';
import { usePomodoro } from './PomodoroContext';
import { Activity, Heart, Droplets, Wind, Trash2, Clock } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

const EKGLine = ({ data }: { data: number[] }) => {
    // Generate a path string based on focus intensity
    // Data is array of durations in minutes
    if (data.length === 0) {
        return (
            <svg viewBox="0 0 300 100" className="w-full h-full opacity-50">
                <path d="M0 50 L300 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
        );
    }

    const width = 300;
    const height = 100;
    const step = width / (data.length || 1);
    
    // Create EKG-like spikes based on duration
    let d = `M 0 50`;
    data.forEach((val, i) => {
        const x = i * step;
        const amplitude = Math.min(45, val * 1.5); // Cap height
        // Random slight jitter for realism
        const jitter = Math.random() * 5;
        
        // P-QRS-T complex simulation
        d += ` L ${x + step * 0.2} 50`; // Base
        d += ` L ${x + step * 0.3} ${50 - jitter}`; // P wave
        d += ` L ${x + step * 0.4} ${50 + amplitude}`; // Q/R Up
        d += ` L ${x + step * 0.5} ${50 - amplitude * 0.5}`; // S Down
        d += ` L ${x + step * 0.6} 50`; // Back to base
        d += ` L ${x + step * 0.8} ${50 - jitter * 2}`; // T wave
        d += ` L ${x + step} 50`; // End
    });

    return (
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
            <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <path d={d} fill="none" stroke="#10b981" strokeWidth="2" filter="url(#glow)" className="animate-draw" />
        </svg>
    );
};

const PomodoroStats: React.FC = () => {
  const { sessionHistory, dailyProgress, deleteSession } = usePomodoro();

  const today = new Date();
  const todaysSessions = sessionHistory.filter(s => isSameDay(new Date(s.startTime), today));
  const focusSessions = todaysSessions.filter(s => s.type === 'focus');
  
  // METRICS
  const totalFocusTime = dailyProgress; // In minutes
  const sessionCount = focusSessions.length;
  const avgSessionLength = sessionCount > 0 ? Math.round(totalFocusTime / sessionCount) : 0;
  
  // O2 Sat: Focus vs Break Ratio
  const totalBreakTime = todaysSessions
    .filter(s => s.type !== 'focus')
    .reduce((acc, curr) => acc + curr.duration, 0) / 60;
  
  const totalTime = totalFocusTime + totalBreakTime;
  const o2Sat = totalTime > 0 ? Math.round((totalFocusTime / totalTime) * 100) : 98; // Default 98%

  // Chart Data: Last 10 focus sessions duration
  const chartData = focusSessions
    .slice(0, 10)
    .reverse()
    .map(s => s.duration / 60);

  return (
    <div className="flex flex-col h-full gap-4">
        
        {/* --- VITALS MONITOR --- */}
        <div className="bg-[#0f172a]/90 border border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Screen Glare & Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-mono text-emerald-500 uppercase">Live Vitals</span>
                </div>
            </div>

            {/* EKG Graph Area */}
            <div className="h-24 w-full border-b border-slate-700/50 mb-6 relative z-10">
                <EKGLine data={chartData} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 relative z-10">
                {/* Heart Rate (Avg Duration) */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Heart size={14} className="text-pink-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase">Avg HR</span>
                    </div>
                    <span className="text-2xl font-mono font-bold text-white">
                        {avgSessionLength}<span className="text-xs text-slate-500 ml-1">bpm</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Session Len</span>
                </div>

                {/* O2 Sat (Focus Ratio) */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Wind size={14} className="text-cyan-400" />
                        <span className="text-[10px] font-bold uppercase">SpO2</span>
                    </div>
                    <span className={`text-2xl font-mono font-bold ${o2Sat >= 95 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {o2Sat}<span className="text-xs text-slate-500 ml-1">%</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Focus Eff.</span>
                </div>

                {/* Fluids (Total Time) */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Droplets size={14} className="text-blue-500" />
                        <span className="text-[10px] font-bold uppercase">Fluids</span>
                    </div>
                    <span className="text-2xl font-mono font-bold text-white">
                        {(totalFocusTime / 60).toFixed(1)}<span className="text-xs text-slate-500 ml-1">L</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Total Hrs</span>
                </div>
            </div>
        </div>

        {/* --- SESSION LOG --- */}
        <div className="flex-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl p-5 overflow-hidden flex flex-col min-h-[250px]">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock size={12} /> Today's Log
            </h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {todaysSessions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <Activity size={24} className="mb-2" />
                        <span className="text-xs">No data recorded yet</span>
                    </div>
                ) : (
                    todaysSessions.map(session => (
                        <div key={session.id} className="group flex justify-between items-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-pink-200 dark:hover:border-slate-600 transition-all">
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
                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded truncate max-w-[80px]">
                                        {session.subject}
                                    </span>
                                )}
                                <button 
                                    onClick={() => deleteSession(session.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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
