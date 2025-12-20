
import React, { useState } from 'react';
import { useGamification, CAREER_LADDER } from '../hooks/useGamification';
import { Trophy, CheckCircle, Circle, Lock, Award, Info, ClipboardList, Clock, Briefcase, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTheme } from '../ThemeContext';

const MissionBoard: React.FC = () => {
  const { stats, rankData, loading, claimMission } = useGamification();
  const { fontSize } = useTheme();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [showLadder, setShowLadder] = useState(false);

  if (loading || !stats) {
      return <div className="h-[200px] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>;
  }

  const getTheme = (color: string) => {
    switch (color) {
      case 'slate': return { text: 'text-slate-500', bg: 'bg-slate-500', border: 'border-slate-200 dark:border-slate-700' };
      case 'blue': return { text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-200 dark:border-blue-900' };
      case 'emerald': return { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-900' };
      case 'violet': return { text: 'text-violet-500', bg: 'bg-violet-500', border: 'border-violet-200 dark:border-violet-900' };
      case 'amber': return { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-900' };
      default: return { text: 'text-slate-500', bg: 'bg-slate-500', border: 'border-slate-200' };
    }
  };

  const theme = getTheme(rankData.currentRank.color);
  const missions = activeTab === 'daily' ? stats.dailyMissions : stats.weeklyMissions;
  const isLargeFont = fontSize === 'extra-large';

  // Added glassmorphism hover effects to the main container
  return (
    <>
    <div className="bg-white/80 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm dark:shadow-xl p-5 flex flex-col relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-pink-500/20 transform-gpu will-change-transform">
        
        {/* --- HEADER (Compact) --- */}
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${theme.bg} bg-opacity-10 text-opacity-100`}>
                    <Briefcase size={16} className={theme.text} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wide">Missions</h3>
            </div>
            
            {/* Rank Mini-Badge */}
            <button 
                onClick={() => setShowLadder(true)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${theme.border} bg-white dark:bg-slate-900 hover:bg-slate-50 transition-colors`}
            >
                <Award size={12} className={theme.text} />
                <span className={`text-[10px] font-bold uppercase ${theme.text}`}>{rankData.currentRank.title}</span>
                <ChevronRight size={12} className="text-slate-400" />
            </button>
        </div>

        {/* --- XP BAR (Compact) --- */}
        <div className="mb-5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                <span>XP Progress</span>
                <span>{stats.totalXP} / {rankData.nextRank ? rankData.nextRank.minXP : 'MAX'}</span>
            </div>
            <div className="relative h-2 w-full bg-slate-100 dark:bg-black/40 rounded-full overflow-hidden">
                <div 
                    className={`absolute top-0 left-0 h-full ${theme.bg} transition-all duration-1000 ease-out rounded-full`}
                    style={{ width: `${rankData.progress}%` }}
                ></div>
            </div>
        </div>

        {/* --- TABS --- */}
        <div className="flex p-1 bg-slate-100 dark:bg-black/20 rounded-xl mb-4">
            <button
                onClick={() => setActiveTab('daily')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'daily' 
                    ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
                Shift Orders
            </button>
            <button
                onClick={() => setActiveTab('weekly')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'weekly' 
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
                Rounds
            </button>
        </div>

        {/* --- MISSION LIST --- */}
        <div className="space-y-2">
            {missions.length === 0 && (
                <div className="text-center py-4 opacity-50 text-xs">No missions active</div>
            )}
            {missions.map(mission => (
                <div 
                    key={mission.id}
                    className={`relative p-3 rounded-xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                        mission.isClaimed 
                        ? 'bg-slate-50 dark:bg-white/5 border-transparent opacity-50' 
                        : mission.isCompleted
                            ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-500/30'
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                    }`}
                >
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-1.5 rounded-full ${
                                mission.isClaimed ? 'bg-slate-200 text-slate-500' : 'bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400'
                            }`}>
                                +{mission.xpReward}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                                {mission.current}/{mission.target}
                            </span>
                        </div>
                        {/* Allows wrapping on huge font setting */}
                        <h4 className={`font-bold text-xs ${isLargeFont ? 'whitespace-normal' : 'truncate'} ${mission.isClaimed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                            {mission.label}
                        </h4>
                        
                        {/* Mini Progress Line */}
                        {!mission.isClaimed && !mission.isCompleted && (
                            <div className="mt-1.5 h-1 w-full bg-slate-100 dark:bg-black/20 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-slate-300 dark:bg-slate-600 transition-all duration-500"
                                    style={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }}
                                ></div>
                            </div>
                        )}
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                        {mission.isClaimed ? (
                            <CheckCircle size={18} className="text-emerald-500" />
                        ) : mission.isCompleted ? (
                            <button
                                onClick={() => claimMission(mission.id, mission.type)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-amber-500/30 animate-pulse transition-transform active:scale-95 whitespace-nowrap"
                            >
                                CLAIM
                            </button>
                        ) : (
                            <Circle size={18} className="text-slate-200 dark:text-slate-700" />
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>

    {/* --- CAREER LADDER MODAL --- */}
    {showLadder && createPortal(
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" 
            onClick={() => setShowLadder(false)}
        >
            <div 
                className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative animate-zoom-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Briefcase className="text-pink-500" />
                        Career Ladder
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Based on Benner's Novice to Expert Theory</p>
                </div>

                <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {CAREER_LADDER.map((rank) => {
                        const isUnlocked = stats.totalXP >= rank.minXP;
                        const isCurrent = rankData.currentRank.id === rank.id;
                        
                        return (
                            <div 
                                key={rank.id}
                                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isCurrent ? 'bg-slate-100 dark:bg-slate-800 border-pink-500 shadow-md' : isUnlocked ? 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60' : 'bg-slate-50 dark:bg-slate-900 border-transparent opacity-40'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUnlocked ? `bg-${rank.color}-500/20 text-${rank.color}-600 dark:text-${rank.color}-400` : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                    {isUnlocked ? <Trophy size={18} /> : <Lock size={18} />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className={`text-sm font-bold ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {rank.title}
                                        </h4>
                                        <span className="text-[10px] font-mono text-slate-500">
                                            {rank.minXP}+ XP
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-tight">
                                        {rank.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={() => setShowLadder(false)}
                        className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-500/20"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )}
    </>
  );
};

export default MissionBoard;
