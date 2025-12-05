import React, { useState, useEffect, useRef } from 'react';
import { 
    HeartPulse, Activity, Zap, CheckCircle2, Lock, 
    Play, AlertTriangle, Wind, 
    Droplets, ShieldAlert,
    ChevronRight, X, Loader2, Sparkles, Trophy, Users,
    Timer, RefreshCw, FileText, Dices, User, Syringe, Stethoscope,
    PauseCircle, Volume2, FastForward, Skull
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import confetti from 'canvas-confetti';

// --- TYPES ---
type Tab = 'week1' | 'week2';
type Rhythm = 'NSR' | 'VFIB' | 'ASYSTOLE' | 'PEA' | 'VT' | 'SVT' | 'BRADY';
type GamePhase = 'briefing' | 'assessment' | 'intervention' | 'cpr' | 'rosc' | 'failed';

interface LogMessage {
    id: string;
    text: string;
    type: 'info' | 'action' | 'alert' | 'success' | 'system';
    time: string;
}

// --- CUSTOM ICONS ---
function FilterIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v2.172a2 2 0 0 1-.586 1.414L12 15v7h-2v-2l-2-3z"/></svg>
}

// --- DATA ---
const SIM_CASES = [
    { id: 'ami', title: 'Acute Myocardial Infarction', short: 'AMI', icon: HeartPulse, color: 'red' },
    { id: 'chf', title: 'Congestive Heart Failure', short: 'CHF', icon: Activity, color: 'orange' },
    { id: 'dka', title: 'Diabetic Ketoacidosis', short: 'DKA', icon: Droplets, color: 'purple' },
    { id: 'ckd', title: 'Chronic Kidney Disease', short: 'CKD', icon: FilterIcon, color: 'yellow' },
    { id: 'copd', title: 'COPD', short: 'COPD', icon: Wind, color: 'blue' },
    { id: 'sepsis', title: 'Sepsis / Septic Shock', short: 'Sepsis', icon: ShieldAlert, color: 'emerald' },
    { id: 'asthma', title: 'Acute Asthma Attack', short: 'Asthma', icon: Wind, color: 'cyan' },
    { id: 'hypo', title: 'Hypoglycemia (T1DM)', short: 'Hypoglycemia', icon: Zap, color: 'amber' }
];

const SCENARIOS = [
    { 
        id: 1, 
        intro: "You arrive at the bedside. 55M patient collapsed. No response.", 
        startRhythm: 'VFIB' as Rhythm,
        startPulse: false,
        isShockable: true 
    },
    { 
        id: 2, 
        intro: "Patient found down. Monitor attached. Flatline visible.", 
        startRhythm: 'ASYSTOLE' as Rhythm,
        startPulse: false,
        isShockable: false 
    },
    { 
        id: 3, 
        intro: "Patient unresponsive. Monitor shows rhythm but no carotid pulse.", 
        startRhythm: 'PEA' as Rhythm,
        startPulse: false,
        isShockable: false 
    },
    { 
        id: 4, 
        intro: "Monitor alarm sounding. Fast wide complex rhythm.", 
        startRhythm: 'VT' as Rhythm,
        startPulse: false,
        isShockable: true 
    }
];

// --- COMPONENTS ---

const ECGMonitor = ({ rhythm, speed = 1, isShocking }: { rhythm: Rhythm; speed?: number; isShocking: boolean }) => {
    // Simplified SVG paths for rhythms
    const getPath = (r: Rhythm) => {
        switch(r) {
            case 'NSR': return "M0 50 L10 50 L15 40 L20 60 L25 50 L35 50 L40 20 L45 80 L50 50 L60 50 L65 40 L70 50 L200 50";
            case 'VFIB': return "M0 50 Q10 10 20 50 T40 50 T60 50 T80 50 T100 50 T120 50 T140 50";
            case 'VT': return "M0 50 L10 10 L20 90 L30 10 L40 90 L50 10 L60 90 L70 10 L80 90 L200 50";
            case 'ASYSTOLE': return "M0 50 L200 50";
            case 'PEA': return "M0 50 L10 50 L15 45 L20 55 L25 50 L40 50 L45 30 L50 70 L55 50 L70 50 L200 50"; // NSR-like but usually slower/lower amp
            default: return "M0 50 L200 50";
        }
    };

    const color = (rhythm === 'VFIB' || rhythm === 'VT' || rhythm === 'ASYSTOLE') ? '#ef4444' : '#10b981';

    return (
        <div className="w-full h-48 bg-black rounded-xl border-[6px] border-slate-800 relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,1)] group">
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#0f766e 1px, transparent 1px), linear-gradient(90deg, #0f766e 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
            
            {/* The Trace */}
            <div className="absolute inset-0 flex items-center">
                {isShocking ? (
                    <div className="w-full h-full bg-white animate-flash opacity-0"></div>
                ) : (
                    <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="w-full h-full relative z-10">
                        <path 
                            d={getPath(rhythm)}
                            fill="none" 
                            stroke={color} 
                            strokeWidth="2.5" 
                            vectorEffect="non-scaling-stroke"
                            className="drop-shadow-[0_0_8px_currentColor]"
                        />
                    </svg>
                )}
            </div>

            {/* Scanline */}
            {!isShocking && (
                <div className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent to-black z-20 animate-scan" style={{ animationDuration: `${2/speed}s` }}></div>
            )}

            {/* Monitor Text Overlay */}
            <div className="absolute top-2 right-4 text-right z-30 font-mono">
                <div className={`text-xl font-bold ${color === '#ef4444' ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                    {rhythm === 'NSR' ? '72' : rhythm === 'VT' ? '180' : rhythm === 'VFIB' ? '---' : rhythm === 'PEA' ? '60' : '0'}
                </div>
                <div className="text-[10px] text-slate-500">BPM</div>
            </div>

            <style>{`
                @keyframes scan { 0% { left: -10%; } 100% { left: 110%; } }
                @keyframes flash { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
                .animate-scan { animation: scan 2s linear infinite; }
                .animate-flash { animation: flash 0.2s ease-in-out; }
            `}</style>
        </div>
    );
};

const DecemberQuest: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('week1');

    // --- GAME ENGINE STATE ---
    const [phase, setPhase] = useState<GamePhase>('briefing');
    const [rhythm, setRhythm] = useState<Rhythm>('NSR');
    const [pulse, setPulse] = useState(true);
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [viability, setViability] = useState(100);
    const [energy, setEnergy] = useState(0); // For shocks
    const [isShocking, setIsShocking] = useState(false);
    
    // Algorithm Tracking
    const [cprCount, setCprCount] = useState(0); // Cycles
    const [lastEpi, setLastEpi] = useState(0); // Cycles since last epi
    const [epiGivenTotal, setEpiGivenTotal] = useState(0);
    const [amioGivenTotal, setAmioGivenTotal] = useState(0);
    const [shocksGiven, setShocksGiven] = useState(0);
    const [airwaySecured, setAirwaySecured] = useState(false);
    const [accessEstablished, setAccessEstablished] = useState(false);

    // Active Cycle State
    const [currentCycleActions, setCurrentCycleActions] = useState<string[]>([]);

    const logEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of logs
    useEffect(() => {
        if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Viability Decay
    useEffect(() => {
        if (phase === 'briefing' || phase === 'rosc' || phase === 'failed') return;
        
        const interval = setInterval(() => {
            setViability(v => {
                const decay = phase === 'cpr' ? 0.05 : 0.2; // Slow decay during CPR, fast during idleness
                const next = Math.max(0, v - decay);
                if (next <= 0) handleGameOver('failed');
                return next;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [phase]);

    // --- GAME ACTIONS ---

    const addLog = (text: string, type: LogMessage['type'] = 'info') => {
        setLogs(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            text,
            type,
            time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })
        }]);
    };

    const startGame = () => {
        const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
        setRhythm(scenario.startRhythm);
        setPulse(scenario.startPulse);
        setViability(100);
        setLogs([]);
        setPhase('assessment');
        setCprCount(0);
        setLastEpi(99); // Ready for epi
        setEpiGivenTotal(0);
        setAmioGivenTotal(0);
        setShocksGiven(0);
        setAirwaySecured(false);
        setAccessEstablished(false);
        setCurrentCycleActions([]);
        
        addLog("SYSTEM: SIMULATION STARTED", "system");
        addLog(`SCENARIO: ${scenario.intro}`, "alert");
    };

    const handleGameOver = (outcome: 'rosc' | 'failed') => {
        setPhase(outcome);
        if (outcome === 'rosc') {
            addLog("PATIENT: Spontaneous movement detected! Pulse palpable.", "success");
            addLog("SYSTEM: EXCELLENT WORK. PATIENT SURVIVED.", "success");
            confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
        } else {
            addLog("PATIENT: Viability 0%. Asystole confirmed in all leads.", "alert");
            addLog("SYSTEM: PATIENT LOST. TIME OF DEATH CALLED.", "alert");
        }
    };

    const checkAssessment = () => {
        addLog("Action: Assessing Patient...", "action");
        setTimeout(() => {
            if (!pulse) {
                addLog("Assessment: NO PULSE! NO BREATHING!", "alert");
                addLog("Hint: Start CPR immediately!", "info");
            } else {
                addLog("Assessment: Weak pulse felt.", "success");
            }
        }, 500);
    };

    const performCPR = () => {
        if (phase === 'cpr') return;
        setPhase('cpr');
        addLog("Action: CPR Started. 30:2 ratio.", "action");
        setCurrentCycleActions(prev => [...prev, 'High Quality CPR']);
    };

    const deliverShock = () => {
        if (energy < 200) {
            addLog("Error: Defibrillator not charged!", "alert");
            return;
        }
        
        setIsShocking(true);
        addLog("Action: CLEAR! Shocking...", "action");
        
        setTimeout(() => {
            setIsShocking(false);
            setEnergy(0);
            
            const isShockable = ['VFIB', 'VT'].includes(rhythm);
            if (isShockable) {
                addLog("System: Shock Delivered.", "success");
                setShocksGiven(s => s + 1);
                // Immediately resume CPR logic
                setPhase('cpr');
                addLog("Hint: Resume CPR immediately. Do not check pulse yet.", "info");
            } else {
                addLog("Critical Error: Shocked non-shockable rhythm!", "alert");
                setViability(v => v - 20); // Big penalty
            }
        }, 800);
    };

    const administerMeds = (med: 'epi' | 'amio') => {
        if (!accessEstablished) {
            addLog("Error: No IV/IO access established!", "alert");
            return;
        }

        if (med === 'epi') {
            if (lastEpi < 2) { // Less than 2 cycles ago (approx 3-5 mins)
                addLog("Warning: Epinephrine given too soon.", "alert");
                setViability(v => v - 5);
            } else {
                addLog("Action: Epinephrine 1mg IV Push.", "action");
                setEpiGivenTotal(e => e + 1);
                setLastEpi(0);
                setCurrentCycleActions(prev => [...prev, 'Epinephrine']);
            }
        } 
        
        if (med === 'amio') {
            if (!['VFIB', 'VT'].includes(rhythm)) {
                addLog("Error: Amiodarone not indicated for this rhythm.", "alert");
                setViability(v => v - 10);
            } else if (shocksGiven < 1) { // usually after 3rd shock in reality, simplistic here
                addLog("Hint: Usually given after failed shocks.", "info");
                setCurrentCycleActions(prev => [...prev, 'Amiodarone (Early)']);
            } else {
                const dose = amioGivenTotal === 0 ? '300mg' : '150mg';
                addLog(`Action: Amiodarone ${dose} IV Push.`, "action");
                setAmioGivenTotal(a => a + 1);
                setCurrentCycleActions(prev => [...prev, 'Amiodarone']);
            }
        }
    };

    const secureAirway = () => {
        if (airwaySecured) return;
        setAirwaySecured(true);
        addLog("Action: Endotracheal Tube inserted. CO2 detector connected.", "action");
        setCurrentCycleActions(prev => [...prev, 'Advanced Airway']);
    };

    const establishAccess = () => {
        if (accessEstablished) return;
        setAccessEstablished(true);
        addLog("Action: IV Access established in AC.", "action");
        setCurrentCycleActions(prev => [...prev, 'IV Access']);
    };

    const advanceCycle = () => {
        if (phase !== 'cpr') {
            addLog("Error: Can only advance cycle during CPR.", "alert");
            return;
        }

        // Evaluate Cycle
        addLog("--- 2 MINUTES ELAPSED ---", "system");
        setCprCount(c => c + 1);
        setLastEpi(e => e + 1);
        setCurrentCycleActions([]);

        // RHYTHM CHECK LOGIC
        setPhase('assessment');
        addLog("Action: CPR Paused. Rhythm Check.", "system");

        // Randomly change rhythm based on interventions
        const chance = Math.random();
        
        // Logic: if shocked shockable, chance to convert
        if (['VFIB', 'VT'].includes(rhythm)) {
            if (shocksGiven > 0 && amioGivenTotal > 0 && chance > 0.4) {
                setRhythm('NSR');
                setPulse(true);
                handleGameOver('rosc');
                return;
            } else if (shocksGiven > 2 && chance > 0.7) {
                setRhythm('ASYSTOLE');
                setPulse(false);
                addLog("Monitor: Rhythm changed to ASYSTOLE.", "alert");
            }
        } 
        
        // Logic: PEA/Asystole
        if (['PEA', 'ASYSTOLE'].includes(rhythm)) {
            if (epiGivenTotal > 2 && chance > 0.6) {
                setRhythm('NSR');
                setPulse(true);
                handleGameOver('rosc');
                return;
            }
        }

        if (phase !== 'rosc') {
            addLog(`Monitor: Rhythm is ${rhythm}. Pulse: ${pulse ? 'Present' : 'Absent'}.`, "info");
            addLog("Hint: What is your next move?", "system");
        }
    };

    // --- WEEK 2 STATE ---
    const [w2State, setW2State] = useState<'idle' | 'spinning' | 'scenario'>('idle');
    const [rouletteIdx, setRouletteIdx] = useState(0);
    const [generatedScenario, setGeneratedScenario] = useState<any>(null);

    const spinRoulette = () => {
        setW2State('spinning');
        let spins = 0;
        const max = 20 + Math.floor(Math.random() * 10);
        const interval = setInterval(() => {
            setRouletteIdx(prev => (prev + 1) % SIM_CASES.length);
            spins++;
            if (spins >= max) {
                clearInterval(interval);
                generateScenario((rouletteIdx + 1) % SIM_CASES.length);
            }
        }, 100);
    };

    const generateScenario = async (idx: number) => {
        const caseItem = SIM_CASES[idx];
        setGeneratedScenario(null);
        
        try {
            const apiKey = process.env.API_KEY;
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Create a short nursing scenario for ${caseItem.title}. Return JSON: { "patient": "Name, Age, Sex", "cc": "Chief Complaint", "history": "Short Hx", "vitals": "BP, HR, RR, SpO2, Temp", "orders": ["Order 1", "Order 2", "Order 3"] }`;
            
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            
            if (result.text) {
                setGeneratedScenario(JSON.parse(result.text));
                setW2State('scenario');
            }
        } catch (e) {
            console.error(e);
            setGeneratedScenario({ patient: "Error", cc: "Try again", history: "AI Busy", vitals: "-", orders: [] });
            setW2State('scenario');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans text-slate-900 dark:text-white animate-fade-in">
            
            {/* --- HEADER --- */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider border border-red-500/30">
                                Simulation Mode
                            </span>
                            {activeTab === 'week1' && <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> LIVE CODE</span>}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none mb-2">
                            {activeTab === 'week1' ? 'ACLS Command' : 'Case Roulette'}
                        </h1>
                        <p className="text-slate-400 text-sm max-w-lg">
                            {activeTab === 'week1' ? 'High-fidelity cardiac arrest simulator. Master the algorithm.' : 'Randomized clinical scenarios for rapid assessment practice.'}
                        </p>
                    </div>

                    <div className="flex p-1 bg-slate-950/50 backdrop-blur-md border border-slate-800 rounded-xl">
                        <button 
                            onClick={() => setActiveTab('week1')}
                            className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'week1' ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Activity size={16} /> Mega Code
                        </button>
                        <button 
                            onClick={() => setActiveTab('week2')}
                            className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'week2' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Dices size={16} /> Roulette
                        </button>
                    </div>
                </div>
            </div>

            {/* --- TAB: ACLS MEGA CODE --- */}
            {activeTab === 'week1' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT: MONITOR & CONTROLS (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Monitor Container */}
                        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                            {/* Header Stats */}
                            <div className="flex justify-between items-center mb-4 relative z-20">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cycle Timer</span>
                                        <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
                                            {phase === 'cpr' ? <span className="text-blue-400 animate-pulse">CPR ACTIVE</span> : 'PAUSED'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Patient Viability</div>
                                    <div className="w-40 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                        <div className={`h-full transition-all duration-500 ${viability < 30 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} style={{ width: `${viability}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* ECG Component */}
                            {phase === 'briefing' ? (
                                <div className="h-48 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-4">
                                    <Skull size={48} className="text-slate-700" />
                                    <button onClick={startGame} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse transition-all">
                                        INITIATE CODE BLUE
                                    </button>
                                </div>
                            ) : (
                                <ECGMonitor rhythm={rhythm} isShocking={isShocking} speed={rhythm === 'VFIB' ? 2 : 1} />
                            )}

                            {/* Status Footer */}
                            <div className="mt-4 flex gap-4 text-xs font-mono text-slate-400">
                                <span>Cycles: {cprCount}</span>
                                <span>Shocks: {shocksGiven}</span>
                                <span>Epi: {epiGivenTotal}mg</span>
                                <span>Amio: {amioGivenTotal > 0 ? (amioGivenTotal === 1 ? '300mg' : '450mg') : '0mg'}</span>
                            </div>
                        </div>

                        {/* Controls Grid (Glassmorphism) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* 1. Assessment */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-3 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-2 mb-1">Primary Survey</h3>
                                <button onClick={checkAssessment} disabled={phase === 'briefing'} className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50">
                                    Check Pulse
                                </button>
                                <button onClick={secureAirway} disabled={phase === 'briefing'} className={`py-3 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${airwaySecured ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-500/20' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                    {airwaySecured ? 'Airway Secured' : 'Intubate'}
                                </button>
                            </div>

                            {/* 2. Circulation */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-3 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-2 mb-1">Circulation</h3>
                                <button onClick={performCPR} disabled={phase === 'cpr' || phase === 'briefing'} className={`py-3 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${phase === 'cpr' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300'}`}>
                                    {phase === 'cpr' ? 'CPR In Progress' : 'Start CPR'}
                                </button>
                                <button onClick={establishAccess} disabled={phase === 'briefing'} className={`py-3 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${accessEstablished ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-500/20' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                    {accessEstablished ? 'IV Access OK' : 'IV/IO Access'}
                                </button>
                            </div>

                            {/* 3. Electrical */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-3 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-2 mb-1">Defibrillation</h3>
                                <button onClick={() => setEnergy(200)} disabled={phase === 'briefing' || energy === 200} className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-yellow-500 hover:text-white rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50">
                                    Charge 200J
                                </button>
                                <button onClick={deliverShock} disabled={energy < 200} className={`py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${energy === 200 ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    SHOCK
                                </button>
                            </div>

                            {/* 4. Medications */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-3 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-2 mb-1">Medication</h3>
                                <button onClick={() => administerMeds('epi')} disabled={phase === 'briefing'} className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50">
                                    Epi 1mg
                                </button>
                                <button onClick={() => administerMeds('amio')} disabled={phase === 'briefing'} className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50">
                                    Amio 300/150
                                </button>
                            </div>
                        </div>

                        {/* --- THE SPEED BUTTON --- */}
                        {phase === 'cpr' && (
                            <button 
                                onClick={advanceCycle}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.01] active:scale-95"
                            >
                                <FastForward size={20} /> Finish 2-Minute Cycle (Advance)
                            </button>
                        )}

                    </div>

                    {/* RIGHT: LOGS & CHAT (4 Cols) */}
                    <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl relative">
                        <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Volume2 size={14} /> Team Comms</span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                                <span className="text-[10px] font-bold text-red-500">LIVE</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                            {logs.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                                    <Activity size={48} className="mb-2" />
                                    <p className="text-xs font-mono">WAITING FOR CODE...</p>
                                </div>
                            )}
                            {logs.map(log => (
                                <div key={log.id} className={`p-3 rounded-xl border text-xs font-mono animate-in slide-in-from-left-2 ${
                                    log.type === 'alert' ? 'bg-red-950/30 border-red-900/50 text-red-200' :
                                    log.type === 'success' ? 'bg-green-950/30 border-green-900/50 text-green-200' :
                                    log.type === 'action' ? 'bg-blue-950/30 border-blue-900/50 text-blue-200' :
                                    log.type === 'system' ? 'bg-slate-800/50 border-slate-700 text-slate-400 text-center font-bold uppercase py-1' :
                                    'bg-slate-900/50 border-slate-800 text-slate-300'
                                }`}>
                                    {log.type !== 'system' && <span className="opacity-40 text-[10px] mr-2">[{log.time}]</span>}
                                    {log.text}
                                </div>
                            ))}
                            <div ref={logEndRef}></div>
                        </div>
                    </div>

                </div>
            )}

            {/* --- TAB: WEEK 2 ROULETTE --- */}
            {activeTab === 'week2' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
                    
                    {/* Roulette Wheel Area */}
                    <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden min-h-[500px]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
                        
                        <div className="relative z-10 text-center">
                            <div className={`w-40 h-40 mx-auto mb-8 rounded-full flex items-center justify-center text-6xl shadow-[0_0_60px_rgba(0,0,0,0.5)] transition-all duration-100 border-[8px] bg-slate-800 ${
                                w2State === 'spinning' ? 'border-white text-white animate-spin' : 
                                w2State === 'scenario' ? `border-${SIM_CASES[rouletteIdx].color}-500 text-${SIM_CASES[rouletteIdx].color}-400 scale-110 shadow-[0_0_40px_currentColor]` : 
                                'border-slate-700 text-slate-600'
                            }`}>
                                {React.createElement(SIM_CASES[rouletteIdx].icon, { size: 64 })}
                            </div>
                            
                            <h2 className="text-4xl font-black text-white tracking-tighter mb-2 h-12">
                                {w2State === 'idle' ? 'Ready?' : SIM_CASES[rouletteIdx].short}
                            </h2>
                            <p className="text-sm font-mono text-slate-400 uppercase tracking-widest h-6">
                                {w2State === 'idle' ? 'Spin to assign case' : SIM_CASES[rouletteIdx].title}
                            </p>
                        </div>

                        <div className="mt-12 relative z-20">
                            <button 
                                onClick={spinRoulette}
                                disabled={w2State === 'spinning'}
                                className="px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg rounded-full shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                            >
                                <Dices size={24} /> {w2State === 'idle' || w2State === 'scenario' ? 'SPIN ROULETTE' : 'SEARCHING...'}
                            </button>
                        </div>
                    </div>

                    {/* Patient Chart (Holographic) */}
                    <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-1 shadow-2xl min-h-[500px] flex flex-col relative overflow-hidden">
                        {/* Holo Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>
                        
                        <div className="flex-1 m-1 rounded-[2rem] bg-slate-900/50 backdrop-blur-md p-8 relative overflow-hidden flex flex-col">
                            
                            <div className="flex justify-between items-start border-b border-slate-800 pb-6 mb-6">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <FileText size={24} />
                                    <div>
                                        <span className="block font-mono text-xs font-bold tracking-widest opacity-60">SYSTEM_V4.2</span>
                                        <span className="font-black text-lg tracking-tight">PATIENT RECORD</span>
                                    </div>
                                </div>
                                {w2State === 'scenario' && !generatedScenario && <Loader2 size={24} className="text-emerald-500 animate-spin" />}
                            </div>

                            <div className="flex-1 relative z-10 font-mono text-sm text-slate-300">
                                {w2State === 'idle' || w2State === 'spinning' ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4">
                                        <Users size={64} className="opacity-20" />
                                        <p className="text-xs tracking-widest opacity-50">AWAITING ASSIGNMENT</p>
                                    </div>
                                ) : generatedScenario ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                                                <label className="text-[10px] text-slate-500 uppercase block mb-1">Patient</label>
                                                <div className="text-white font-bold text-lg">{generatedScenario.patient}</div>
                                            </div>
                                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                                                <label className="text-[10px] text-slate-500 uppercase block mb-1">Admit Dx</label>
                                                <div className={`text-${SIM_CASES[rouletteIdx].color}-400 font-bold text-lg`}>{SIM_CASES[rouletteIdx].short}</div>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-slate-900 rounded-xl border border-slate-800">
                                            <label className="text-[10px] text-slate-500 uppercase block mb-2">Chief Complaint</label>
                                            <p className="text-white italic text-lg leading-relaxed">"{generatedScenario.cc}"</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] text-slate-500 uppercase block mb-2">Vitals</label>
                                                <div className="text-emerald-400 font-bold bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/30">
                                                    {generatedScenario.vitals}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-500 uppercase block mb-2">Stat Orders</label>
                                                <ul className="space-y-1">
                                                    {generatedScenario.orders.map((o: string, i: number) => (
                                                        <li key={i} className="flex items-center gap-2 text-xs">
                                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                            {o}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <button className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95">
                                            <CheckCircle2 size={20} /> Accept & Start Charting
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DecemberQuest;
