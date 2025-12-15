
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { X, Trophy, Medal, Zap, Flame, User, Crown, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface LeaderboardEntry {
    uid: string;
    displayName: string;
    photoURL?: string;
    totalXP: number;
    currentStreak: number;
    rankTitle?: string;
    rankColor?: string;
}

interface LeaderboardModalProps {
    onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLeaderboard = async () => {
        setLoading(true);
        setError('');
        try {
            const q = query(
                collection(db, 'leaderboard'),
                orderBy('totalXP', 'desc'),
                limit(20)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
            setEntries(data);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
            setError("Unable to load rankings. Check connection or permissions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    // Get Rank Icon
    const getRankIcon = (index: number) => {
        if (index === 0) return <div className="p-1.5 bg-yellow-100 dark:bg-yellow-500/20 rounded-full text-yellow-600 dark:text-yellow-400"><Crown size={18} fill="currentColor" /></div>;
        if (index === 1) return <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300"><Medal size={18} /></div>;
        if (index === 2) return <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-700 dark:text-amber-500"><Medal size={18} /></div>;
        return <span className="font-mono font-bold text-slate-400 dark:text-slate-500 text-sm w-8 text-center">#{index + 1}</span>;
    };

    const LoadingSkeleton = () => (
        <div className="space-y-3 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="h-2 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </div>
                    <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0" />
                </div>
            ))}
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh] animate-zoom-in" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2.5 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-500/30">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Top Reviewers</h3>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Global Rankings</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                        <button 
                            onClick={fetchLeaderboard}
                            className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors shadow-sm"
                            title="Refresh"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={onClose} className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors shadow-sm">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950/50">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center p-8 opacity-60">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-500">
                                <X size={32} />
                            </div>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{error}</p>
                            <button onClick={fetchLeaderboard} className="mt-4 text-xs text-blue-500 underline">Try Again</button>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center p-8 opacity-60">
                            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Search size={32} className="text-slate-400" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Data Yet</h4>
                            <p className="text-sm text-slate-500 max-w-[200px]">Be the first to complete a mission and claim your spot!</p>
                        </div>
                    ) : (
                        <div className="space-y-2 p-3">
                            {entries.map((entry, idx) => {
                                const isMe = entry.uid === currentUser?.uid;
                                return (
                                    <div 
                                        key={idx}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all hover:scale-[1.01] ${
                                            isMe 
                                            ? 'bg-white dark:bg-slate-900 border-pink-500 shadow-md ring-1 ring-pink-500/20 z-10' 
                                            : 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'
                                        }`}
                                    >
                                        <div className="w-8 flex items-center justify-center shrink-0">
                                            {getRankIcon(idx)}
                                        </div>
                                        
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                                            {entry.photoURL ? (
                                                <img src={entry.photoURL} alt={entry.displayName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <User size={16} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className={`text-sm font-bold truncate ${isMe ? 'text-pink-600 dark:text-pink-400' : 'text-slate-800 dark:text-white'}`}>
                                                    {entry.displayName}
                                                </h4>
                                                {isMe && <span className="text-[9px] bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 px-1.5 py-0.5 rounded-full font-bold uppercase">You</span>}
                                            </div>
                                            <p className={`text-[10px] font-bold uppercase tracking-wider truncate ${entry.rankColor ? `text-${entry.rankColor}-500` : 'text-slate-400'}`}>
                                                {entry.rankTitle || 'Novice'}
                                            </p>
                                        </div>

                                        <div className="text-right flex flex-col items-end gap-0.5">
                                            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                                                <Zap size={10} className="text-emerald-500 fill-current" />
                                                <span className="font-black text-xs text-emerald-700 dark:text-emerald-400">{entry.totalXP.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-orange-500 text-[9px] font-bold opacity-80 px-1">
                                                <Flame size={10} fill="currentColor" />
                                                <span>{entry.currentStreak} day streak</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LeaderboardModal;
