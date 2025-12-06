
import React, { useState, useEffect } from 'react';
import { 
    HeartPulse, Dices, Lightbulb, Play, Power, ShieldCheck, Terminal, Stethoscope, ArrowRight, Activity, Sparkles, X, ChevronRight, Lock
} from 'lucide-react';
import ACLSSimulator from './ACLSSimulator';
import ClinicalRoulette from './ClinicalRoulette';

type Tab = 'week1' | 'week2';

const DecemberQuest: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('week1');
    const [showWelcome, setShowWelcome] = useState(false);
    const [startTutorialSim, setStartTutorialSim] = useState(false);
    
    // Animation states for intro
    const [introStep, setIntroStep] = useState(0); // 0: Hidden, 1: Logo, 2: Title, 3: Stats/Cards, 4: Button
    
    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('december_quest_welcome_v7');
        if (!hasSeenWelcome) {
            setShowWelcome(true);
            // Sequence the intro
            setTimeout(() => setIntroStep(1), 500);
            setTimeout(() => setIntroStep(2), 1500);
            setTimeout(() => setIntroStep(3), 2500);
            setTimeout(() => setIntroStep(4), 3500);
        }
    }, []);

    const handleEnter = () => {
        setShowWelcome(false);
        localStorage.setItem('december_quest_welcome_v7', 'true');
        // Trigger ACLS Tutorial automatically if first time
        setStartTutorialSim(true); 
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6 pb-24 font-sans text-slate-900 dark:text-white animate-fade-in relative px-4 md:px-6">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col lg:flex-row justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 md:p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl gap-4 md:gap-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

                <div className="flex items-center gap-4 w-full lg:w-auto relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0 transform rotate-3">
                        {activeTab === 'week1' ? <HeartPulse size={28} /> : <Dices size={28} />}
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight leading-none text-slate-900 dark:text-white">December Quest</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {activeTab === 'week1' ? 'ACLS Command Center' : 'Clinical Case Roulette'}
                        </p>
                    </div>
                </div>
                
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full lg:w-auto relative z-10">
                    <button 
                        onClick={() => setActiveTab('week1')}
                        className={`flex-1 lg:flex-none px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'week1' ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-white shadow-md transform scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <HeartPulse size={16} /> <span className="whitespace-nowrap">ACLS Sim</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('week2')}
                        className={`flex-1 lg:flex-none px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'week2' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-white shadow-md transform scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <Dices size={16} /> <span className="whitespace-nowrap">Roulette</span>
                    </button>
                </div>
            </div>

            {/* --- TAB CONTENT --- */}
            <div className="min-h-[600px] transition-all duration-500">
                {activeTab === 'week1' ? (
                    <ACLSSimulator 
                        startTutorial={startTutorialSim} 
                        onTutorialEnd={() => setStartTutorialSim(false)} 
                    />
                ) : (
                    <ClinicalRoulette />
                )}
            </div>

            {/* --- CINEMATIC "SPOTIFY WRAPPED" INTRO --- */}
            {showWelcome && (
                <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden">
                    
                    {/* Animated Backgrounds */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                    
                    <div className={`absolute top-1/4 -left-20 w-96 h-96 bg-pink-600 rounded-full blur-[150px] opacity-40 animate-pulse transition-all duration-1000 ${introStep >= 1 ? 'scale-100' : 'scale-0'}`}></div>
                    <div className={`absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600 rounded-full blur-[150px] opacity-40 animate-pulse delay-1000 transition-all duration-1000 ${introStep >= 2 ? 'scale-100' : 'scale-0'}`}></div>

                    {/* Step 1: Icon */}
                    <div className={`relative z-10 transition-all duration-1000 transform ${introStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(236,72,153,0.5)] rotate-3">
                            <HeartPulse size={48} className="text-white animate-pulse" />
                        </div>
                    </div>

                    {/* Step 2: Title */}
                    <div className={`relative z-10 text-center mt-8 transition-all duration-1000 delay-200 transform ${introStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-pink-300">
                            Batch Crescere 2026
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4">
                            DECEMBER <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                                QUEST
                            </span>
                        </h1>
                    </div>

                    {/* Step 3: Cards */}
                    <div className={`relative z-10 grid grid-cols-2 gap-4 mt-8 max-w-lg w-full transition-all duration-1000 delay-300 transform ${introStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                            <Activity size={32} className="text-red-500 mb-3" />
                            <h3 className="font-bold text-sm uppercase">ACLS Sim</h3>
                            <p className="text-[10px] text-slate-400 mt-1">Master the Algorithm</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                            <Dices size={32} className="text-purple-500 mb-3" />
                            <h3 className="font-bold text-sm uppercase">Roulette</h3>
                            <p className="text-[10px] text-slate-400 mt-1">Rapid Case Reviews</p>
                        </div>
                    </div>

                    {/* Step 4: Slider Button */}
                    <div className={`relative z-10 mt-12 w-full max-w-xs transition-all duration-1000 delay-500 transform ${introStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <button 
                            onClick={handleEnter}
                            className="group relative w-full h-16 bg-white text-black rounded-full font-black text-lg uppercase tracking-widest overflow-hidden hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2 h-full w-full group-hover:gap-4 transition-all">
                                Start Shift <ArrowRight size={20} />
                            </span>
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                        </button>
                        <p className="text-center text-[10px] text-slate-500 mt-4 font-mono">
                            Tap to initialize simulation engine
                        </p>
                    </div>

                </div>
            )}

        </div>
    );
};

export default DecemberQuest;