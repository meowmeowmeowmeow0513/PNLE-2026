
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { X, Trophy, Medal, Zap, Flame, User, Crown, Share2, Loader2, Check, Shield } from 'lucide-react';
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
    const [sharing, setSharing] = useState(false);
    const [shared, setShared] = useState(false);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'leaderboard'),
                orderBy('totalXP', 'desc'),
                limit(50) 
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
            setEntries(data);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleShare = async () => {
        if (!currentUser) return;
        setSharing(true);
        try {
            const myEntryIndex = entries.findIndex(e => e.uid === currentUser.uid);
            const myEntry = entries[myEntryIndex];
            
            // Build Top 10 List
            const top10 = entries.slice(0, 10);
            let leaderboardList = top10.map((entry, i) => {
                let rankIcon = `${i + 1}.`;
                if (i === 0) rankIcon = "🥇";
                if (i === 1) rankIcon = "🥈";
                if (i === 2) rankIcon = "🥉";
                return `${rankIcon} **${entry.displayName}** — ${entry.totalXP.toLocaleString()} XP`;
            }).join('\n');

            let footerMessage = "";
            let title = "🏆 Global Leaderboard";
            let color = 0x3b82f6; // Blue default

            if (myEntry) {
                const rank = myEntryIndex + 1;
                // Add separator and user stats if they exist
                footerMessage = `\n\n━━━━━━━━━━━━━━━\n✨ **Your Standing:**\n**#${rank} ${myEntry.displayName}**\n⚡ **${myEntry.totalXP.toLocaleString()} XP** • 🔥 **${myEntry.currentStreak} Day Streak**`;
                
                if (rank === 1) color = 0xf59e0b; // Gold
                else if (rank === 2) color = 0x94a3b8; // Silver
                else if (rank === 3) color = 0xb45309; // Bronze
            } else {
                footerMessage = `\n\n━━━━━━━━━━━━━━━\n**${currentUser.displayName || 'A Student'}** is currently unranked. Grind to join the list!`;
            }

            const fullMessage = `${leaderboardList}${footerMessage}`;

            await sendDiscordNotification(title, fullMessage, 'stats', 'milestone', color);
            setShared(true);
            setTimeout(() => setShared(false), 3000);
        } catch (e) {
            console.error("Share failed", e);
        } finally {
            setSharing(false);
        }
    };

    const getRankVisuals = (index: number) => {
        switch(index) {
            case 0: return {
                bg: 'bg-gradient-to-r from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/10',
                border: 'border-amber-200 dark:border-amber-500/30',
                icon: <Crown size={20} className="text-amber-500 fill-current animate-pulse" />,
                text: 'text-amber-700 dark:text-amber-400',
                rankBadge: 'bg-amber-400 text-amber-900'
            };
            case 1: return {
                bg: 'bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-800/50 dark:to-gray-800/30',
                border: 'border-slate-200 dark:border-slate-600',
                icon: <Medal size={20} className="text-slate-400 fill-current" />,
                text: 'text-slate-700 dark:text-slate-300',
                rankBadge: 'bg-slate-300 text-slate-800'
            };
            case 2: return {
                bg: 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/10',
                border: 'border-orange-200 dark:border-orange-500/30',
                icon: <Medal size={20} className="text-orange-500 fill-current" />,
                text: 'text-orange-800 dark:text-orange-300',
                rankBadge: 'bg-orange-400 text-orange-900'
            };
            default: return {
                bg: 'bg-white dark:bg-slate-800/50',
                border: 'border-slate-100 dark:border-slate-700',
                icon: <span className="font-black text-slate-400 text-sm">#{index + 1}</span>,
                text: 'text-slate-600 dark:text-slate-400',
                rankBadge: 'bg-slate-100 text-slate-500'
            };
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4 sm:p-6 animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" onClick={onClose} />

            {/* Modal Card - Fullscreen Mobile, Card Desktop */}
            <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl bg-white dark:bg-[#0f172a] rounded-none md:rounded-[2.5rem] shadow-2xl border-0 md:border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-zoom-in">
                
                {/* Header with Visual Flair */}
                <div className="relative px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 overflow-hidden">
                    {/* Abstract Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-[60px] -ml-16 -mb-10 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-2 md:p-3 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl md:rounded-2xl shadow-lg shadow-orange-500/20 transform -rotate-3">
                                <Trophy size={24} className="md:w-7 md:h-7 fill-current" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Global Rankings</h3>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    Live • Top 50
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-3 bg-slate-50 dark:bg-[#0B1121]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
                            <Loader2 size={32} className="animate-spin text-pink-500" />
                            <span className="text-sm font-bold uppercase tracking-wider">Retrieving Data...</span>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 opacity-60">
                            <Trophy size={48} className="mx-auto mb-4" />
                            <p className="font-bold text-lg">No champions yet.</p>
                            <p className="text-sm">Be the first to claim the throne!</p>
                        </div>
                    ) : (
                        entries.map((entry, idx) => {
                            const isMe = entry.uid === currentUser?.uid;
                            const visuals = getRankVisuals(idx);
                            
                            return (
                                <div 
                                    key={idx}
                                    className={`relative flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl md:rounded-3xl border transition-all duration-300 group ${
                                        isMe 
                                        ? 'bg-white dark:bg-slate-800 border-pink-500 shadow-xl shadow-pink-500/10 ring-2 ring-pink-500 z-10 transform scale-[1.01]' 
                                        : `${visuals.bg} ${visuals.border} hover:shadow-lg`
                                    }`}
                                >
                                    {/* Rank Indicator */}
                                    <div className="flex flex-col items-center justify-center w-8 shrink-0">
                                        {visuals.icon}
                                    </div>

                                    {/* Avatar */}
                                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full p-[2px] shrink-0 ${idx < 3 ? 'bg-gradient-to-br from-amber-300 via-orange-300 to-yellow-200' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            {entry.photoURL ? (
                                                <img src={entry.photoURL} alt={entry.displayName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <User size={18} className="md:w-5 md:h-5" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-sm md:text-base font-black truncate ${isMe ? 'text-slate-900 dark:text-white' : visuals.text}`}>
                                                {entry.displayName}
                                            </span>
                                            {isMe && <span className="text-[9px] font-black bg-pink-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">You</span>}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500">
                                            <span className="flex items-center gap-1 text-orange-500"><Flame size={10} className="md:w-3 md:h-3" fill="currentColor" /> {entry.currentStreak} Day Streak</span>
                                            <span className="flex items-center gap-1 text-purple-500 hidden sm:flex"><Shield size={10} className="md:w-3 md:h-3" /> {entry.rankTitle}</span>
                                        </div>
                                    </div>

                                    {/* XP Stat */}
                                    <div className="text-right shrink-0">
                                        <div className="text-base md:text-xl font-black text-slate-800 dark:text-white flex items-center justify-end gap-1">
                                            <Zap size={14} className="text-amber-400 fill-current md:w-4 md:h-4" />
                                            {entry.totalXP.toLocaleString()}
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">XP</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 relative z-20 pb-8 md:pb-6">
                    <button 
                        onClick={handleShare}
                        disabled={sharing || shared}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95 ${
                            shared 
                            ? 'bg-emerald-500 text-white cursor-default' 
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                        }`}
                    >
                        {sharing ? <Loader2 size={18} className="animate-spin" /> : shared ? <Check size={18} /> : <Share2 size={18} />}
                        {shared ? 'Posted to Discord!' : 'Share Top 10 to Discord'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LeaderboardModal;
