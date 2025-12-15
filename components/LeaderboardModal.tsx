
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { X, Trophy, Medal, Zap, Flame, User, Crown, Search, RefreshCw, AlertTriangle, Share2, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { sendDiscordNotification } from '../utils/discordWebhook';

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
    
    // Sharing State
    const [sharing, setSharing] = useState(false);
    const [shared, setShared] = useState(false);

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
        } catch (error: any) {
            console.error("Failed to fetch leaderboard", error);
            if (error.code === 'permission-denied') {
                setError("Access Denied: Please update Firestore Security Rules.");
            } else {
                setError("Unable to load rankings. Check your connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleShare = async () => {
        if (!currentUser) return;
        setSharing(true);
        try {
            const myEntryIndex = entries.findIndex(e => e.uid === currentUser.uid);
            const myEntry = entries[myEntryIndex];
            
            let message = "";
            let title = "Leaderboard Update";
            let color = 0xf59e0b; // Gold default

            if (myEntry) {
                const rank = myEntryIndex + 1;
                message = `🏆 **${myEntry.displayName}** holds **Rank #${rank}** on the Global Leaderboard!\n\n⚡ **${myEntry.totalXP.toLocaleString()} XP**\n🔥 **${myEntry.currentStreak} Day Streak**`;
                
                if (rank === 1) color = 0xf59e0b; // Gold
                else if (rank === 2) color = 0x94a3b8; // Silver
                else if (rank === 3) color = 0xb45309; // Bronze
                else color = 0x3b82f6; // Blue
            } else {
                message = `**${currentUser.displayName || 'A Student'}** is grinding to reach the Top 20! Watch out!`;
                title = "New Challenger";
            }

            await sendDiscordNotification(title, message, 'stats', 'milestone', color);
            
            // Show Success State
            setShared(true);
            setTimeout(() => setShared(false), 3000);
        } catch (e) {
            console.error("Share failed", e);
        } finally {
            setSharing(false);
        }
    };

    // Get Rank Icon
    const getRankIcon = (index: number) => {
        if (index === 0) return <div className="p-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-full text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30 shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-pulse"><Crown size={24} fill="currentColor" /></div>;
        if (index === 1) return <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600"><Medal size={24} /></div>;
        if (index === 2) return <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-700"><Medal size={24} /></div>;
        return <span className="font-mono font-bold text-slate-400 dark:text-slate-500 text-lg w-8 text-center">#{index + 1}</span>;
    };

    const LoadingSkeleton = () => (
        <div className="space-y-4 p-4 md:p-6">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </div>
                    <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0" />
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
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-6 animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* 
                MODAL CONTAINER
                Mobile: Fixed to bottom, rounded-t-[2.5rem], full width, max-h-[92%]
                Desktop: Relative, rounded-[2.5rem], width restricted, height auto
            */}
            <div 
                className={`
                    relative z-10 
                    w-full h-[92dvh] md:h-[85vh] 
                    md:w-[48rem] lg:w-[56rem] 
                    bg-white dark:bg-[#0f172a] 
                    rounded-t-[2.5rem] md:rounded-[2.5rem] 
                    shadow-2xl border-t md:border border-slate-200 dark:border-white/10 
                    flex flex-col 
                    animate-slide-up-mobile md:animate-zoom-in
                    overflow-hidden
                `}
                onClick={e => e.stopPropagation()}
            >
                {/* Mobile Handle */}
                <div className="md:hidden w-full flex justify-center pt-4 pb-2 shrink-0 cursor-pointer" onClick={onClose}>
                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>

                {/* Header */}
                <div className="p-6 md:p-8 bg-white/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center relative overflow-hidden shrink-0 backdrop-blur-md">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-500/30">
                            <Trophy size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Leaderboard</h3>
                            <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Global Top 20</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                        <button 
                            onClick={handleShare}
                            disabled={sharing || shared}
                            className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center border border-transparent ${
                                shared 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200'
                            }`}
                            title="Share Rank to Discord"
                        >
                            {sharing ? <Loader2 size={20} className="animate-spin" /> : shared ? <Check size={20} /> : <Share2 size={20} />}
                        </button>
                        <button 
                            onClick={fetchLeaderboard}
                            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 transition-colors shadow-sm"
                            title="Refresh"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 transition-colors shadow-sm hidden md:flex">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-[#0B1121] pb-10">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center p-8 opacity-70">
                            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-lg shadow-red-500/10">
                                <AlertTriangle size={40} />
                            </div>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Connection Error</p>
                            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-800/50 max-w-sm mx-auto leading-relaxed">
                                {error}
                            </p>
                            <button onClick={fetchLeaderboard} className="mt-6 px-6 py-3 bg-slate-200 dark:bg-slate-800 rounded-full font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                                Retry Connection
                            </button>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center p-8 opacity-60">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <Search size={40} className="text-slate-400" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-700 dark:text-slate-300">Leaderboard Empty</h4>
                            <p className="text-sm text-slate-500 mt-2 max-w-[200px]">Be the first to complete a mission and claim the throne!</p>
                        </div>
                    ) : (
                        <div className="space-y-4 p-4 md:p-6">
                            {entries.map((entry, idx) => {
                                const isMe = entry.uid === currentUser?.uid;
                                return (
                                    <div 
                                        key={idx}
                                        className={`flex items-center gap-4 p-4 md:p-5 rounded-3xl border transition-all duration-300 ${
                                            isMe 
                                            ? 'bg-white dark:bg-slate-900 border-pink-500 shadow-xl shadow-pink-500/10 ring-2 ring-pink-500/20 z-10 transform scale-[1.02]' 
                                            : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
                                        }`}
                                    >
                                        <div className="w-12 flex items-center justify-center shrink-0">
                                            {getRankIcon(idx)}
                                        </div>
                                        
                                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 shrink-0 ${isMe ? 'border-pink-500' : 'border-slate-100 dark:border-slate-700'}`}>
                                            {entry.photoURL ? (
                                                <img src={entry.photoURL} alt={entry.displayName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <User size={24} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`text-sm md:text-base font-bold truncate ${isMe ? 'text-pink-600 dark:text-pink-400' : 'text-slate-800 dark:text-white'}`}>
                                                    {entry.displayName}
                                                </h4>
                                                {isMe && <span className="text-[9px] bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">You</span>}
                                            </div>
                                            <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider truncate ${entry.rankColor ? `text-${entry.rankColor}-500` : 'text-slate-400'}`}>
                                                {entry.rankTitle || 'Novice'}
                                            </p>
                                        </div>

                                        <div className="text-right flex flex-col items-end gap-1.5">
                                            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                                                <Zap size={12} className="text-emerald-500 fill-current" />
                                                <span className="font-black text-sm text-emerald-700 dark:text-emerald-400">{entry.totalXP.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-orange-500 text-[10px] font-bold opacity-80 px-1">
                                                <Flame size={12} fill="currentColor" />
                                                <span>{entry.currentStreak} day streak</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold pb-8 md:pb-4">
                    Updates in Real-time • Top 20 Global
                </div>
            </div>
            
            <style>{`
                @keyframes slide-up-mobile {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up-mobile {
                    animation: slide-up-mobile 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>,
        document.body
    );
};

export default LeaderboardModal;
