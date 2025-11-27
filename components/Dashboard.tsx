import React, { useState, useEffect } from 'react';
import { Sparkles, Timer, ArrowRight } from 'lucide-react';
import { NavigationItem } from '../types';

interface DashboardProps {
  onNavigate: (item: NavigationItem) => void;
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Motivational Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-navy-900 opacity-10 rounded-full blur-2xl"></div>
        
        <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-teal-100 font-medium text-sm uppercase tracking-wide">
              <Sparkles size={16} />
              <span>Daily Motivation</span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold leading-relaxed mb-4">
                "Passing the PNLE is not about being the smartest — it’s about being prepared, consistent, and confident. Keep pushing, keep believing. Your license is waiting. ✨👩‍⚕️👨‍⚕️💙"
              </h2>
              <p className="text-teal-50 font-medium text-lg">
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
            <Timer className="text-teal-500" />
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 group-hover:opacity-30 transition-opacity"></div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">Ready to Focus?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Consistency beats intensity. Start a 25-minute study block now and build your momentum.
            </p>
          </div>
          
          <button 
            onClick={() => onNavigate('Pomodoro Timer')}
            className="mt-6 w-full py-3 px-4 bg-teal-accent hover:bg-teal-400 text-navy-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2"
          >
            Start Review Session
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Placeholder Widget Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[200px] flex flex-col justify-center items-center text-center">
            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-slate-800 font-bold">Progress Tracker</h3>
            <p className="text-slate-500 text-sm mt-1">Completion stats coming soon.</p>
        </div>
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