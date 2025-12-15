
import React, { useState, useEffect } from 'react';
import { 
    HeartPulse, Dices, Timer, CheckCircle2,
    Crosshair, Crown, Activity, Shield,
    Info, Terminal, Battery, BarChart3, Radio, FileText
} from 'lucide-react';
import { createPortal } from 'react-dom';
import ACLSSimulator from './ACLSSimulator';
import ClinicalRoulette from './ClinicalRoulette';
import QuizModule from './QuizModule';
import confetti from 'canvas-confetti';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

// --- TYPES ---
type Tab = 'acls' | 'roulette' | 'quiz';

interface QuestState {
    xp: number;
    scenariosMastered: number[]; 
    dailyClaimed: string | null; 
    lastDailyReset: string; 
    dailyXP: number; 
    dailyQuizCompleted: string | null; // Date string
    quizLevel: number;
}

const MAX_XP = 500;
const DAILY_XP_CAP = 60; 

// --- XP TABLE CONSTANTS ---
const XP_TABLE = [
    { action: "Daily Clock In", xp: 10, icon: Timer },
    { action: "Code Blue Mastery", xp: 25, icon: HeartPulse },
    { action: "Clinical Roulette", xp: 15, icon: Dices },
    { action: "Shift Report (Quiz)", xp: 10, icon: FileText },
];

const DecemberQuest: React.FC = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('acls');
    
    // Default State
    const [questState, setQuestState] = useState<QuestState>({ 
        xp: 0, 
        scenariosMastered: [], 
        dailyClaimed: null, 
        lastDailyReset: new Date().toDateString(),
        dailyXP: 0,
        dailyQuizCompleted: null,
        quizLevel: 1
    });

    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showDailyLimit, setShowDailyLimit] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- FIREBASE SYNC ---
    useEffect(() => {
        if (!currentUser) return;
        const ref = doc(db, 'users', currentUser.uid, 'events', 'december_sle');
        
        const unsub = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                let data = snap.data() as QuestState;
                const today = new Date().toDateString();
                
                // Check for Daily Reset
                if (data.lastDailyReset !== today) {
                    const updates = {
                        lastDailyReset: today,
                        dailyXP: 0,
                        // Reset claims that are daily specific if needed, but we track dates so just logic check is fine
                        dailyClaimed: data.dailyClaimed === today ? today : null,
                        dailyQuizCompleted: data.dailyQuizCompleted === today ? today : null
                    };
                    updateDoc(ref, updates);
                    setQuestState({ ...data, ...updates });
                } else {
                    setQuestState(data);
                }
            } else {
                // Initialize Doc
                const newState = { 
                    xp: 0, 
                    scenariosMastered: [], 
                    dailyClaimed: null, 
                    lastDailyReset: new Date().toDateString(),
                    dailyXP: 0,
                    dailyQuizCompleted: null,
                    quizLevel: 1
                };
                setDoc(ref, newState);
                setQuestState(newState);
            }
            setLoading(false);
        });
        return () => unsub();
    }, [currentUser]);

    // --- ACTION HANDLERS ---

    const syncToFirebase = (updates: Partial<QuestState>) => {
        if (!currentUser) return;
        const ref = doc(db, 'users', currentUser.uid, 'events', 'december_sle');
        updateDoc(ref, updates);
    };

    const addXP = (amount: number, sourceId?: number) => {
        if (questState.xp >= MAX_XP) return; 

        if (questState.dailyXP >= DAILY_XP_CAP) {
            setShowDailyLimit(true);
            setTimeout(() => setShowDailyLimit(false), 3000);
            return;
        }

        if (sourceId && questState.scenariosMastered.includes(sourceId)) return; 

        const allowedXP = Math.min(amount, DAILY_XP_CAP - questState.dailyXP);
        if (allowedXP <= 0) return;

        const newXP = Math.min(MAX_XP, questState.xp + allowedXP);
        const newDailyXP = questState.dailyXP + allowedXP;
        const newMastered = sourceId ? [...questState.scenariosMastered, sourceId] : questState.scenariosMastered;
        
        const oldRank = getRank(questState.xp).id;
        const newRank = getRank(newXP).id;

        const updates: Partial<QuestState> = {
            xp: newXP,
            dailyXP: newDailyXP,
            scenariosMastered: newMastered
        };

        syncToFirebase(updates);

        if (newRank > oldRank) {
            setShowLevelUp(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#fbbf24', '#ffffff', '#ec4899']
            });
            // Visual notification only - no webhook
            setTimeout(() => setShowLevelUp(false), 4000);
        }
    };

    const handleDailyCheckIn = () => {
        const today = new Date().toDateString();
        if (questState.dailyClaimed !== today) {
            addXP(10);
            syncToFirebase({ dailyClaimed: today });
            confetti({ particleCount: 30, origin: { y: 0.8 } });
        }
    };

    const handleQuizComplete = (score: number) => {
        const today = new Date().toDateString();
        if (score >= 7) {
            if (questState.dailyQuizCompleted !== today) {
                addXP(10);
                // Also increment level if not max
                const nextLevel = questState.quizLevel < 7 ? questState.quizLevel + 1 : questState.quizLevel;
                syncToFirebase({ dailyQuizCompleted: today, quizLevel: nextLevel });
            } else {
                // Practice mode (passed but already claimed)
                // No XP, but maybe confetti?
                confetti({ particleCount: 50, origin: { y: 0.8 }, colors: ['#10b981'] });
            }
        }
    };

    const dailyProgressPct = (questState.dailyXP / DAILY_XP_CAP) * 100;
    
    // --- UPDATED RANK SYSTEM ---
    const getRank = (xp: number) => {
        if (xp >= 500) return { id: 4, title: "ACLS GOAT", color: "text-amber-500", bg: "bg-amber-500", icon: Crown, border: "border-amber-500", glow: "shadow-amber-500/50", desc: "The ultimate mastery. You run the code." }; 
        if (xp >= 350) return { id: 3, title: "The IV Sniper", color: "text-purple-500", bg: "bg-purple-500", icon: Crosshair, border: "border-purple-500", glow: "shadow-purple-500/50", desc: "First stick, every time. Precision expert." }; 
        if (xp >= 200) return { id: 2, title: "Vital Sign Warrior", color: "text-emerald-500", bg: "bg-emerald-500", icon: Activity, border: "border-emerald-500", glow: "shadow-emerald-500/50", desc: "Stable under pressure. Assessment pro." };   
        return { id: 1, title: "UERM Ramonian", color: "text-blue-500", bg: "bg-blue-500", icon: Shield, border: "border-blue-500", glow: "shadow-blue-500/50", desc: "The journey begins. Building the foundation." };                  
    };

    const currentRankObj = getRank(questState.xp);
    const nextRankXP = currentRankObj.id === 1 ? 200 : currentRankObj.id === 2 ? 350 : currentRankObj.id === 3 ? 500 : 500;

    // --- EKG LINE ANIMATION ---
    const EKGLine = () => (
        <div className="absolute top-1/2 left-0 w-full h-16 -translate-y-1/2 pointer-events-none opacity-20">
            <svg viewBox="0 0 500 100" className="w-full h-full text-emerald-500" preserveAspectRatio="none">
                <path d="M0,50 L50,50 L60,20 L70,80 L80,50 L100,50 L110,20 L120,80 L130,50 L500,50" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      className="animate-[dash_3s_linear_infinite]"
                      strokeDasharray="500"
                      strokeDashoffset="500"
                />
            </svg>
            <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
        </div>
    );

    if (loading) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-slate-400">
            <Activity className="animate-pulse text-emerald-500" size={48} />
            <span className="font-mono text-sm tracking-widest uppercase">Initializing Simulation...</span>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-24 font-sans text-slate-900 dark:text-white animate-fade-in relative px-4 md:px-6">
            
            {/* --- DAILY CAP NOTIFICATION --- */}
            {showDailyLimit && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl border border-red-500/50 flex items-center gap-3 animate-bounce">
                    <Timer className="text-red-400" size={20} />
                    <div>
                        <p className="font-bold text-sm">System Overload</p>
                        <p className="text-[10px] text-slate-400">Daily Capacity Reached. Recharge.</p>
                    </div>
                </div>
            )}

            {/* --- HERO: COMMAND CENTER --- */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-800 shadow-xl min-h-[380px] flex flex-col md:flex-row group transition-all duration-500 hover:shadow-2xl">
                
                {/* Dynamic Backgrounds */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-20 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-20"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

                {/* LEFT PANEL: OPS DASHBOARD */}
                <div className="relative z-10 flex-[1.5] p-6 md:p-10 flex flex-col justify-between">
                    
                    {/* Top Status Bar */}
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 backdrop-blur-md rounded-lg border-l-4 border-emerald-500 shadow-sm relative z-10">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">SLE Live</span>
                                </div>
                            </div>
                            <span className="hidden sm:inline-block h-4 w-px bg-slate-200 dark:bg-slate-700"></span>
                            <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400">SYS_V.4.0_ONLINE</span>
                        </div>
                        
                        <button 
                            onClick={() => setShowInfoModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm group/btn"
                        >
                            <Info size={14} className="group-hover/btn:text-blue-500 transition-colors" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">System Manual</span>
                        </button>
                    </div>

                    {/* Main Title Area */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] mb-4">
                            SIMULATION <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-gradient">
                                LEARNING EXP.
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base max-w-md leading-relaxed">
                            Engage in high-fidelity clinical scenarios. Master ACLS algorithms and rapid assessment.
                        </p>
                    </div>
                    
                    {/* Action & Stats Row */}
                    <div className="flex flex-col xl:flex-row gap-6 items-stretch">
                        {/* Clock In Button */}
                        <div className="shrink-0">
                            {questState.dailyClaimed === new Date().toDateString() ? (
                                <button disabled className="w-full xl:w-auto h-full px-8 py-4 bg-emerald-500/5 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 cursor-default shadow-sm">
                                    <CheckCircle2 size={18} /> Shift Endorsed
                                </button>
                            ) : (
                                <button 
                                    onClick={handleDailyCheckIn}
                                    className="w-full xl:w-auto h-full group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                                    <Timer size={18} /> Clock In (+10 XP)
                                </button>
                            )}
                        </div>
                        
                        {/* Status Grid */}
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {/* Clearance Card */}
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between min-h-[80px]">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Shield size={10} /> Rank
                                </div>
                                <div className={`font-black text-xs md:text-sm truncate ${currentRankObj.color}`}>{currentRankObj.title}</div>
                            </div>
                            
                            {/* Daily Battery Card */}
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between min-h-[80px]">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <Battery size={10} /> Energy
                                    </span>
                                    <span className={`text-[9px] font-black ${dailyProgressPct >= 100 ? 'text-red-500' : 'text-slate-500'}`}>{Math.round(dailyProgressPct)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                                    <div className={`h-full transition-all duration-1000 ease-out ${dailyProgressPct >= 100 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${dailyProgressPct}%` }}></div>
                                </div>
                            </div>

                            {/* XP Progress Card */}
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between min-h-[80px] col-span-2 sm:col-span-1">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Activity size={10} /> Next Level
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-black text-lg text-slate-900 dark:text-white">{nextRankXP - questState.xp}</span>
                                    <span className="text-[9px] font-bold text-slate-400">XP Left</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: HOLO-BADGE (Visual) */}
                <div className="relative z-10 w-full md:w-[35%] bg-slate-50/80 dark:bg-slate-900/80 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center overflow-hidden backdrop-blur-sm">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50"></div>
                    <EKGLine />
                    
                    {/* Badge Container */}
                    <div className={`relative group perspective-1000 cursor-default ${showLevelUp ? 'animate-bounce' : ''}`}>
                        <div className={`w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center mb-6 bg-white dark:bg-slate-800 border-4 ${currentRankObj.border} shadow-2xl dark:${currentRankObj.glow} relative z-10 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3`}>
                            <currentRankObj.icon size={80} className={`${currentRankObj.color} drop-shadow-md`} strokeWidth={1.5} />
                        </div>
                        {/* Glow Ring */}
                        <div className={`absolute inset-0 rounded-full ${currentRankObj.border} opacity-30 blur-2xl animate-pulse`}></div>
                    </div>
                    
                    <div className="relative z-10 mt-2">
                        <div className="inline-block px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Current Clearance</div>
                        <h3 className={`font-black text-2xl md:text-3xl uppercase tracking-widest leading-none ${currentRankObj.color} drop-shadow-sm`}>
                            {currentRankObj.title}
                        </h3>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mt-3 max-w-[220px] mx-auto leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-3 opacity-80">
                            {currentRankObj.desc}
                        </p>
                    </div>
                </div>
            </div>

            {/* --- INFO MODAL (RANKS & XP) --- */}
            {showInfoModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in" onClick={() => setShowInfoModal(false)}>
                    <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-zoom-in" onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System Manual</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-wider">Progression & Rewards</p>
                            </div>
                            <button onClick={() => setShowInfoModal(false)} className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                                <Radio size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-8">
                            
                            {/* XP Table */}
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Terminal size={14} /> Experience Points (XP) Values
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {XP_TABLE.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-600 dark:text-slate-300">
                                                    <item.icon size={16} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.action}</span>
                                            </div>
                                            <span className="text-xs font-black text-emerald-500">+{item.xp} XP</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-3 italic flex items-center gap-1">
                                    <Info size={10} /> Daily Capacity is capped at {DAILY_XP_CAP} XP per day to ensure consistent practice.
                                </p>
                            </div>

                            {/* Rank Hierarchy */}
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <BarChart3 size={14} /> Clearance Levels
                                </h4>
                                <div className="space-y-3">
                                    {[
                                        { xp: "500+", rank: "ACLS GOAT", color: "text-amber-500", bg: "bg-amber-500" },
                                        { xp: "350+", rank: "The IV Sniper", color: "text-purple-500", bg: "bg-purple-500" },
                                        { xp: "200+", rank: "Vital Sign Warrior", color: "text-emerald-500", bg: "bg-emerald-500" },
                                        { xp: "0-199", rank: "UERM Ramonian", color: "text-blue-500", bg: "bg-blue-500" },
                                    ].map((r, i) => (
                                        <div key={i} className="flex items-center gap-4 relative">
                                            <div className="w-12 text-[10px] font-mono font-bold text-slate-400 text-right">{r.xp}</div>
                                            <div className={`w-3 h-3 rounded-full ${r.bg} shadow-sm z-10`}></div>
                                            {i !== 3 && <div className="absolute left-[54px] top-3 bottom-[-12px] w-0.5 bg-slate-200 dark:bg-slate-800"></div>}
                                            <div className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <span className={`text-sm font-black uppercase tracking-tight ${r.color}`}>{r.rank}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* --- MISSION SELECTOR TABS --- */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar shadow-inner">
                <button 
                    onClick={() => setActiveTab('acls')}
                    className={`flex-1 min-w-[120px] py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'acls' 
                        ? 'bg-white dark:bg-slate-800 text-red-500 shadow-md ring-1 ring-black/5 dark:ring-white/10 scale-[1.02]' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                >
                    <HeartPulse size={16} /> Code Blue
                </button>
                <button 
                    onClick={() => setActiveTab('roulette')}
                    className={`flex-1 min-w-[120px] py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'roulette' 
                        ? 'bg-white dark:bg-slate-800 text-purple-500 shadow-md ring-1 ring-black/5 dark:ring-white/10 scale-[1.02]' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                >
                    <Dices size={16} /> Roulette
                </button>
                <button 
                    onClick={() => setActiveTab('quiz')}
                    className={`flex-1 min-w-[120px] py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'quiz' 
                        ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-md ring-1 ring-black/5 dark:ring-white/10 scale-[1.02]' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                >
                    <FileText size={16} /> Shift Report
                </button>
            </div>

            {/* --- ACTIVE MODULE --- */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[500px] bg-white dark:bg-[#0B1121] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-4 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 dark:bg-slate-800/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                
                <div className="relative z-10">
                    {activeTab === 'acls' && (
                        <ACLSSimulator 
                            onTutorialEnd={() => addXP(15)} 
                            onScenarioComplete={(id) => addXP(25, id)}
                        />
                    )}
                    {activeTab === 'roulette' && (
                        <ClinicalRoulette 
                            onComplete={() => addXP(15)}
                        />
                    )}
                    {activeTab === 'quiz' && (
                        <QuizModule 
                            onComplete={handleQuizComplete} 
                            startLevel={questState.quizLevel} 
                            dailyCompleted={questState.dailyQuizCompleted === new Date().toDateString()}
                        />
                    )}
                </div>
            </div>

        </div>
    );
};

export default DecemberQuest;
