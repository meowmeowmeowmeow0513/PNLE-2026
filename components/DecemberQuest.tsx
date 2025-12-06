
import React, { useState, useEffect } from 'react';
import { 
    HeartPulse, Dices, Lightbulb, Play
} from 'lucide-react';
import ACLSSimulator from './ACLSSimulator';
import ClinicalRoulette from './ClinicalRoulette';

type Tab = 'week1' | 'week2';

const DecemberQuest: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('week1');
    const [showTutorial, setShowTutorial] = useState(false);
    const [startTutorialSim, setStartTutorialSim] = useState(false);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('acls_tutorial_seen_v3');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, []);

    const finishTutorial = () => {
        setShowTutorial(false);
        setStartTutorialSim(true); // Launch tutorial inside simulator
        localStorage.setItem('acls_tutorial_seen_v3', 'true');
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

            {/* --- TUTORIAL MODAL (Intro) --- */}
            {showTutorial && activeTab === 'week1' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in" onClick={() => {}}>
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-zoom-in border border-white/20">
                        {/* Modal Header Art */}
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none"></div>
                        
                        <div className="p-8 md:p-10 text-center relative z-10">
                            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-xl shadow-blue-500/30 transform -rotate-6">
                                <Lightbulb size={48} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Code Blue Command</h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-sm md:text-base font-medium">
                                Step into the role of <strong>Team Leader</strong>. 
                                <br/>Your goal is to manage cardiac arrest scenarios using the <strong>2025 AHA Guidelines</strong>.
                                <br/><br/>
                                <span className="inline-block bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700">
                                    <strong className="text-red-500">Objective:</strong> Maintain Viability &gt; 0% until ROSC.
                                </span>
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <button onClick={finishTutorial} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                    <Lightbulb size={20} /> Start Basic Training (Recommended)
                                </button>
                                <button onClick={() => setShowTutorial(false)} className="w-full py-4 bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold text-sm transition-colors">
                                    Skip to Mission Select
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DecemberQuest;
