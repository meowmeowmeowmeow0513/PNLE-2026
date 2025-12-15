
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Snowflake, Award, Info, Lock, CheckCircle2, ShieldCheck, Flame, CalendarClock, Zap, Trophy } from 'lucide-react';
import { UserGamificationStats } from '../types';
import { CAREER_LADDER } from '../hooks/useGamification';
import { useAuth } from '../AuthContext';
import LeaderboardModal from './LeaderboardModal';

interface StreakWidgetProps {
  stats: UserGamificationStats;
  loading: boolean;
}

const StreakWidget: React.FC<StreakWidgetProps> = ({ stats, loading }) => {
  const { currentUser } = useAuth();
  const [showLadder, setShowLadder] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { currentStreak, streakFreezes, totalXP } = stats;

  const currentRank = CAREER_LADDER.find(r => totalXP >= r.minXP && totalXP <= r.maxXP) || CAREER_LADDER[CAREER_LADDER.length - 1];
  const nextRank = CAREER_LADDER.find(r => r.id === currentRank.id + 1) || null;
  
  let progress = 0;
  let xpToNext = 0;
  if (nextRank) {
      const totalRange = currentRank.maxXP - currentRank.minXP;
      const earned = totalXP - currentRank.minXP;
      progress = Math.min(100, Math.max(0, (earned / totalRange) * 100));
      xpToNext = nextRank.minXP - totalXP;
  } else {
      progress = 100;
  }

  // --- COMBUSTION ENGINE (Dynamic Flame & Color Logic) ---
  const getStreakVisuals = (days: number) => {
      if (days >= 151) return { 
          flameColor: 'text-pink-500 dark:text-pink-400', 
          shadow: 'drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]', 
          animate: 'animate-pulse', 
          textGradient: 'from-pink-500 via-rose-500 to-amber-400 dark:from-pink-300 dark:via-rose-400 dark:to-amber-200', 
          label: 'LEGENDARY',
          glowColor: 'bg-pink-500'
      }; 
      if (days >= 90) return { 
          flameColor: 'text-purple-500 dark:text-purple-400', 
          shadow: 'drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]', 
          animate: 'animate-bounce',
          textGradient: 'from-purple-600 via-violet-500 to-indigo-500 dark:from-purple-300 dark:via-violet-300 dark:to-indigo-300',
          label: 'UNSTOPPABLE',
          glowColor: 'bg-purple-500'
      }; 
      if (days >= 30) return { 
          flameColor: 'text-cyan-500 dark:text-cyan-400', 
          shadow: 'drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]', 
          animate: 'animate-bounce',
          textGradient: 'from-cyan-500 via-sky-500 to-blue-500 dark:from-cyan-300 dark:via-sky-300 dark:to-blue-300',
          label: 'ELECTRIFIED',
          glowColor: 'bg-cyan-500'
      }; 
      if (days >= 7) return { 
          flameColor: 'text-amber-500 dark:text-amber-400', 
          shadow: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]', 
          animate: 'animate-bounce',
          textGradient: 'from-amber-500 via-orange-500 to-yellow-500 dark:from-amber-300 dark:via-orange-300 dark:to-yellow-200',
          label: 'BURNING HOT',
          glowColor: 'bg-amber-500'
      }; 
      return { 
          flameColor: 'text-orange-500 dark:text-orange-500', 
          shadow: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]', 
          animate: 'animate-bounce',
          textGradient: 'from-slate-700 to-slate-500 dark:from-white dark:to-slate-400',
          label: 'SPARK',
          glowColor: 'bg-orange-500'
      }; 
  };

  const streakVisuals = getStreakVisuals(currentStreak);

  // --- RESPONSIVE THEME ENGINE (Card Base) ---
  const getTheme = (color: string) => {
    switch (color) {
      case 'slate': return {
        wrapper: 'bg-white border-slate-200 shadow-slate-200/50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 dark:border-slate-700 dark:shadow-slate-900/50',
        iconBox: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        title: 'text-slate-800 dark:text-slate-100',
        subtext: 'text-slate-500 dark:text-slate-400',
        barTrack: 'bg-slate-100 dark:bg-black/40',
        barFill: 'bg-slate-600 dark:bg-slate-500',
      };
      case 'blue': return {
        wrapper: 'bg-blue-50/50 border-blue-100 shadow-blue-100/50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-[#0f172a] dark:to-[#0f172a] dark:border-blue-500/30 dark:shadow-blue-900/50',
        iconBox: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/30',
        title: 'text-blue-900 dark:text-blue-100',
        subtext: 'text-blue-600/70 dark:text-blue-300/60',
        barTrack: 'bg-blue-100/50 dark:bg-black/40',
        barFill: 'bg-blue-500 dark:bg-blue-500',
      };
      case 'emerald': return {
        wrapper: 'bg-emerald-50/50 border-emerald-100 shadow-emerald-100/50 dark:bg-gradient-to-br dark:from-emerald-900 dark:via-[#0f172a] dark:to-[#0f172a] dark:border-emerald-500/30 dark:shadow-emerald-900/50',
        iconBox: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/30',
        title: 'text-emerald-900 dark:text-emerald-100',
        subtext: 'text-emerald-600/70 dark:text-emerald-300/60',
        barTrack: 'bg-emerald-100/50 dark:bg-black/40',
        barFill: 'bg-emerald-500 dark:bg-emerald-500',
      };
      case 'violet': return {
        wrapper: 'bg-violet-50/50 border-violet-100 shadow-violet-100/50 dark:bg-gradient-to-br dark:from-violet-900 dark:via-[#0f172a] dark:to-[#0f172a] dark:border-violet-500/30 dark:shadow-violet-900/50',
        iconBox: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-200 dark:border-violet-500/30',
        title: 'text-violet-900 dark:text-violet-100',
        subtext: 'text-violet-600/70 dark:text-violet-300/60',
        barTrack: 'bg-violet-100/50 dark:bg-black/40',
        barFill: 'bg-violet-500 dark:bg-violet-500',
      };
      case 'amber': return {
        wrapper: 'bg-amber-50/50 border-amber-100 shadow-amber-100/50 dark:bg-gradient-to-br dark:from-amber-900 dark:via-[#0f172a] dark:to-[#0f172a] dark:border-amber-500/30 dark:shadow-amber-900/50',
        iconBox: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/30',
        title: 'text-amber-900 dark:text-amber-100',
        subtext: 'text-amber-600/70 dark:text-amber-300/60',
        barTrack: 'bg-amber-100/50 dark:bg-black/40',
        barFill: 'bg-amber-500 dark:bg-amber-500',
      };
      default: return {
        wrapper: 'bg-slate-900 border-slate-700',
        iconBox: 'bg-slate-800 text-slate-300',
        title: 'text-white',
        subtext: 'text-slate-400',
        barTrack: 'bg-black/40',
        barFill: 'bg-slate-500',
      };
    }
  };

  const theme = getTheme(currentRank.color);
  const isExpert = currentRank.id === 4;

  if (loading) return <div className="h-[280px] bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"></div>;

  return (
    <>
    <div className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between h-full min-h-[280px] border shadow-xl group will-change-transform transform-gpu ${theme.wrapper}`}>
        
        {/* Shine Effect for Expert */}
        {isExpert && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/20 to-transparent opacity-0 dark:opacity-30 animate-shine pointer-events-none"></div>}
        
        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay"></div>

        {/* --- HEADER --- */}
        <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-transparent shadow-inner ${theme.iconBox}`}>
                     {isExpert ? <Award size={24} className="animate-pulse" /> : <ShieldCheck size={24} />}
                </div>
                <div>
                    <div className="flex items-center gap-2 relative z-20">
                        <h3 className={`font-black uppercase tracking-wider text-sm ${theme.title}`}>{currentRank.title}</h3>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowLadder(true); }}
                            className={`${theme.subtext} hover:text-pink-500 dark:hover:text-white transition-colors`}
                        >
                            <Info size={14} />
                        </button>
                    </div>
                    <p className={`text-[10px] font-mono uppercase tracking-widest mt-0.5 ${theme.subtext}`}>Level {currentRank.id + 1}</p>
                </div>
            </div>

            {/* Horizontal Action Toolbar (Updated for visibility and balance) */}
            <div className="flex items-center gap-2">
                {/* 1. Freeze (Status) */}
                <div className="w-9 h-9 rounded-xl bg-cyan-50/80 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-700/50 flex flex-col items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-sm backdrop-blur-md" title="Duty Leaves">
                    <Snowflake size={12} />
                    <span className="text-[8px] font-black leading-none mt-0.5">{streakFreezes}</span>
                </div>

                {/* 2. Leaderboard */}
                <button 
                    onClick={() => setShowLeaderboard(true)}
                    className="w-9 h-9 rounded-xl bg-yellow-50/80 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-700/50 flex items-center justify-center text-yellow-600 dark:text-yellow-400 shadow-sm hover:scale-105 transition-all backdrop-blur-md"
                    title="Global Rankings"
                >
                    <Trophy size={16} />
                </button>
            </div>
        </div>

        {/* --- CENTER STATS (Big Number) --- */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center my-4">
            <div className="relative">
                {currentStreak > 0 && (
                    <div className={`absolute -top-7 left-1/2 -translate-x-1/2 ${streakVisuals.flameColor} ${streakVisuals.animate} ${streakVisuals.shadow} transition-all duration-700`}>
                        <Flame size={32} fill="currentColor" />
                    </div>
                )}
                
                {/* The Main Number - Now Synced with Flame Color */}
                <span className={`text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b ${streakVisuals.textGradient} drop-shadow-sm dark:drop-shadow-2xl`}>
                    {currentStreak}
                </span>
                
                {/* Glow behind the number for extra aesthetics */}
                {currentStreak > 7 && (
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 ${streakVisuals.glowColor} rounded-full blur-[60px] opacity-10 pointer-events-none`}></div>
                )}
            </div>
            <span className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.subtext} mt-2`}>Day Streak</span>
        </div>

        {/* --- FOOTER PROGRESS --- */}
        <div className="relative z-10">
             <div className="flex justify-between items-end mb-2">
                 <div className={`flex items-center gap-1.5 text-xs font-medium ${theme.title} opacity-80`}>
                    <Zap size={14} className="text-yellow-500 dark:text-yellow-400 fill-current" />
                    <span>{stats.totalXP} XP</span>
                 </div>
                 {nextRank ? (
                     <span className={`text-[10px] font-mono font-bold ${theme.subtext}`}>
                        {xpToNext} XP to {nextRank.title}
                     </span>
                 ) : (
                     <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase">Max Rank</span>
                 )}
             </div>

             <div className={`h-3 w-full rounded-full overflow-hidden backdrop-blur-sm border border-black/5 dark:border-white/5 relative ${theme.barTrack}`}>
                <div 
                    className={`h-full ${theme.barFill} transition-all duration-1000 ease-out relative`}
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/50 shadow-[0_0_10px_white]"></div>
                </div>
             </div>
        </div>
    </div>

    {/* --- CAREER LADDER & INFO MODAL --- */}
    {showLadder && createPortal(
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in" 
            onClick={(e) => { e.stopPropagation(); setShowLadder(false); }}
        >
            <div 
                className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative animate-zoom-in flex flex-col max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Award className="text-pink-500" />
                            System Mechanics
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Rules of Engagement</p>
                    </div>
                    <button onClick={() => setShowLadder(false)} className="p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 transition-colors">
                        <Info size={16} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto custom-scrollbar p-6 space-y-8">
                    
                    {/* 1. Mechanics Section */}
                    <div className="space-y-4">
                        <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-500/30">
                                 <Flame size={20} />
                             </div>
                             <div>
                                 <h4 className="text-slate-900 dark:text-white font-bold text-sm">Daily Streak & Combustion</h4>
                                 <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                                     The longer your streak, the hotter the flame burns.
                                 </p>
                                 <div className="flex gap-2 mt-2">
                                     <div className="h-2 w-2 rounded-full bg-orange-500" title="0-6 Days"></div>
                                     <div className="h-2 w-2 rounded-full bg-amber-400" title="7-29 Days"></div>
                                     <div className="h-2 w-2 rounded-full bg-cyan-400" title="30-89 Days"></div>
                                     <div className="h-2 w-2 rounded-full bg-purple-500" title="90-150 Days"></div>
                                     <div className="h-2 w-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 ring-1 ring-white/50" title="151+ Days"></div>
                                 </div>
                             </div>
                        </div>

                        <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-200 dark:border-cyan-500/30">
                                 <Snowflake size={20} />
                             </div>
                             <div>
                                 <h4 className="text-slate-900 dark:text-white font-bold text-sm">Duty Leave (Freeze)</h4>
                                 <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                                     Missed a day? A freeze is used <span className="text-slate-900 dark:text-white font-semibold">automatically</span> to protect your streak. You earn <span className="text-cyan-600 dark:text-cyan-400 font-bold">+1 Freeze</span> for every 7 days of perfect attendance.
                                 </p>
                             </div>
                        </div>

                        <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-500/30">
                                 <CalendarClock size={20} />
                             </div>
                             <div>
                                 <h4 className="text-slate-900 dark:text-white font-bold text-sm">Clinical Hours (XP)</h4>
                                 <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                                     XP represents your Clinical Hours. Earn XP by finishing missions and tasks. Reaching XP milestones promotes you to the next rank.
                                 </p>
                             </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700/50"></div>

                    {/* 2. Career Ladder Section */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Rank Progression</h4>
                        <div className="space-y-3">
                            {CAREER_LADDER.map((rank) => {
                                const isUnlocked = totalXP >= rank.minXP;
                                const isCurrent = currentRank.id === rank.id;
                                return (
                                    <div key={rank.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                                        isCurrent 
                                        ? 'bg-slate-100 dark:bg-slate-800 border-pink-500/50 shadow-lg' 
                                        : isUnlocked 
                                            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-80 dark:opacity-60' 
                                            : 'bg-slate-50 dark:bg-slate-900 border-transparent opacity-40'
                                    }`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                            isUnlocked 
                                            ? `bg-${rank.color}-100 dark:bg-${rank.color}-500/20 text-${rank.color}-600 dark:text-${rank.color}-400` 
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                                        }`}>
                                            {isUnlocked ? <CheckCircle2 size={18} /> : <Lock size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h4 className={`text-sm font-bold ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{rank.title}</h4>
                                                <span className="text-[10px] font-mono text-slate-500">{rank.minXP}+ XP</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-tight">{rank.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>,
        document.body
    )}

    {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
    </>
  );
};

export default StreakWidget;
