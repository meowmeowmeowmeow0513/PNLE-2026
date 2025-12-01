
import React from 'react';
import { Flame, Snowflake, Zap, Trophy } from 'lucide-react';
import { UserGamificationStats } from '../types';

interface StreakWidgetProps {
  stats: UserGamificationStats;
  loading: boolean;
}

const StreakWidget: React.FC<StreakWidgetProps> = ({ stats, loading }) => {
  const { currentStreak, streakFreezes } = stats;

  // Visual Levels
  const isLegend = currentStreak >= 30;
  const isBlaze = currentStreak >= 7 && currentStreak < 30;
  const isEmber = currentStreak < 7;

  // Dynamic Styles
  const getContainerStyles = () => {
    if (isLegend) return 'bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-500/50 shadow-purple-500/20';
    if (isBlaze) return 'bg-gradient-to-br from-blue-600 to-cyan-600 border-blue-400/50 shadow-blue-500/20';
    return 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-400/50 shadow-orange-500/20';
  };

  const getFlameColor = () => {
    if (isLegend) return 'text-purple-200 drop-shadow-[0_0_10px_rgba(216,180,254,0.8)]';
    if (isBlaze) return 'text-blue-100 drop-shadow-[0_0_8px_rgba(186,230,253,0.8)]';
    return 'text-orange-100 drop-shadow-[0_0_5px_rgba(255,237,213,0.5)]';
  };

  const getQuote = () => {
    if (isLegend) return "UNSTOPPABLE force of nature!";
    if (isBlaze) return "You're on fire! Keep pushing!";
    return "Every shift starts with day one.";
  };

  if (loading) return <div className="h-[220px] bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-transform hover:scale-[1.02] flex flex-col justify-between h-full min-h-[220px] border ${getContainerStyles()}`}>
        
        {/* Background FX */}
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
        <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-black/10 blur-2xl"></div>

        {/* Header */}
        <div className="relative flex items-start justify-between z-10">
            <div>
                <div className="flex items-center gap-2 font-medium text-white/90">
                    <Flame className={`h-5 w-5 ${currentStreak > 0 ? 'animate-bounce' : ''} ${getFlameColor()}`} fill="currentColor" />
                    <span className="uppercase tracking-wider text-xs font-bold shadow-black/10 drop-shadow-md">Daily Streak</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-6xl font-black tracking-tight drop-shadow-sm">{currentStreak}</span>
                    <span className="text-xl font-bold text-white/80">days</span>
                </div>
            </div>
            
            {/* Duty Leave Badge */}
            <div className="flex flex-col items-center gap-1">
                <div 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-sm"
                    title="Duty Leaves (Streak Freezes)"
                >
                    <Snowflake size={14} className="text-white" />
                    <span className="font-bold text-sm">{streakFreezes}</span>
                </div>
                <span className="text-[10px] font-medium opacity-80 uppercase tracking-wide">Duty Leaves</span>
            </div>
        </div>

        {/* Footer Info */}
        <div className="relative mt-4 z-10">
            <p className="text-sm font-bold text-white/95 tracking-wide flex items-center gap-2">
                {isLegend && <Trophy size={16} className="text-yellow-300" />}
                {getQuote()}
            </p>
            
            {/* Progress Bar for Next Reward */}
            <div className="mt-4 pt-3 border-t border-white/20">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider mb-1 text-white/80">
                    <span>Next Duty Leave</span>
                    <span>{(currentStreak % 7)} / 7 Days</span>
                </div>
                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-white/90 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${((currentStreak % 7) / 7) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default StreakWidget;
