
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import confetti from 'canvas-confetti';
import { 
    HeartPulse, Activity, Zap, ShieldAlert,
    RotateCcw, X, BrainCircuit, Skull, Trophy, Syringe,
    Thermometer,
    CheckCircle2,
    AlertTriangle,
    Stethoscope,
    HelpCircle,
    ArrowRight,
    GraduationCap,
    Clock,
    Eye,
    BookOpen,
    MessageCircle,
    Play,
    FastForward,
    Map,
    Crosshair,
    ListChecks,
    Timer,
    Cable,
    Wind,
    Lightbulb
} from 'lucide-react';
import ECGMonitor from './ECGMonitor';
import ACLSReference from './ACLSReference';
import { SCENARIOS, ScenarioData, Rhythm, H_AND_TS, TUTORIAL_SCENARIO, TUTORIAL_STEPS } from '../data/simulationData';

type GamePhase = 'mission_select' | 'briefing' | 'assessment' | 'intervention' | 'cpr' | 'rhythm_check' | 'rosc' | 'failed';

interface LogMessage {
    id: string;
    text: string;
    type: 'info' | 'action' | 'alert' | 'success' | 'system' | 'hint';
    time: string;
}

// Improved Markdown Parser
const SimpleMarkdown = ({ text }: { text: string }) => {
    if (!text) return null;
    return (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {text.split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith('-')) {
                     return (
                        <div key={i} className="flex items-center gap-2 mt-6 mb-3 border-b border-slate-200 dark:border-slate-700 pb-1">
                            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs">
                                {trimmed.replace(/\*/g, '')}
                            </h4>
                        </div>
                     );
                }
                if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                    return (
                        <div key={i} className="flex gap-3 pl-2 items-start">
                            <span className="text-pink-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0 shadow-sm"></span>
                            <p className="leading-relaxed">{trimmed.replace(/[-•]\s*/, '').replace(/\*\*/g, '')}</p>
                        </div>
                    );
                }
                if (trimmed.length > 0) {
                    return <p key={i} className="leading-relaxed">{trimmed.replace(/\*\*/g, '')}</p>;
                }
                return null;
            })}
        </div>
    )
}

// --- SUB-COMPONENTS ---

const MissionCard = ({ mission, onClick }: { mission: ScenarioData, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`relative w-full text-left p-6 rounded-[2rem] border transition-all duration-300 group overflow-hidden ${
            mission.algorithm === 'shockable' 
            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500'
        } shadow-sm hover:shadow-2xl hover:-translate-y-1`}
    >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${
            mission.algorithm === 'shockable' ? 'from-red-50 to-orange-50 dark:from-red-500/5 dark:to-orange-500/5' : 'from-blue-50 to-cyan-50 dark:from-blue-500/5 dark:to-cyan-500/5'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl shadow-lg ${mission.algorithm === 'shockable' ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-blue-500 text-white shadow-blue-500/30'}`}>
                    {mission.algorithm === 'shockable' ? <Zap size={20} /> : <Activity size={20} />}
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {mission.focus}
                </span>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                {mission.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-5 line-clamp-2 leading-relaxed">
                {mission.patient}
            </p>
            
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 dark:border-slate-800 pt-3">
                <Crosshair size={12} /> 
                {mission.algorithm === 'shockable' ? 'Shock • CPR • Meds' : 'CPR • Epi • Causes'}
            </div>
        </div>
    </button>
);

const CodeStats = ({ stats, cycle }: { stats: any, cycle: number }) => (
    <div className="grid grid-cols-4 gap-2 text-center bg-white/50 dark:bg-slate-950/50 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-md w-full md:w-auto shadow-sm">
        <div className="px-2 md:px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex flex-col justify-center">
            <div className="text-[8px] md:text-[9px] font-bold text-red-600 dark:text-red-400 uppercase leading-none mb-0.5">Shocks</div>
            <div className="text-xs md:text-sm font-black text-slate-800 dark:text-white leading-none">{stats.shocks}</div>
        </div>
        <div className="px-2 md:px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex flex-col justify-center">
            <div className="text-[8px] md:text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase leading-none mb-0.5">Epi</div>
            <div className="text-xs md:text-sm font-black text-slate-800 dark:text-white leading-none">{stats.epi}</div>
        </div>
        <div className="px-2 md:px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex flex-col justify-center">
            <div className="text-[8px] md:text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase leading-none mb-0.5">Meds</div>
            <div className="text-xs md:text-sm font-black text-slate-800 dark:text-white leading-none">{stats.amio + stats.lidocaine}</div>
        </div>
        <div className="px-2 md:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600/30 flex flex-col justify-center">
            <div className="text-[8px] md:text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-none mb-0.5">Cycle</div>
            <div className="text-xs md:text-sm font-black text-slate-800 dark:text-white leading-none">{cycle}</div>
        </div>
    </div>
);

interface ACLSSimulatorProps {
    startTutorial?: boolean;
    onTutorialEnd?: () => void;
}

const ACLSSimulator: React.FC<ACLSSimulatorProps> = ({ startTutorial, onTutorialEnd }) => {
    const [phase, setPhase] = useState<GamePhase>('mission_select');
    const [isTrainingMode, setIsTrainingMode] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0); 
    const [activeScenario, setActiveScenario] = useState<ScenarioData>(SCENARIOS[0]);
    const [rhythm, setRhythm] = useState<Rhythm>('NSR');
    const [pulse, setPulse] = useState(true);
    const [logs, setLogs] = useState<LogMessage[]>([]);
    
    // THE SUZY ENGINE
    const [viability, setViability] = useState(100);
    const [energy, setEnergy] = useState(0); 
    const [isShocking, setIsShocking] = useState(false);
    const [padsAttached, setPadsAttached] = useState(false); 
    const [roscHeartRate, setRoscHeartRate] = useState<number | null>(null);
    
    // Cycle & Timing Tracking (TIME WARP ENGINE)
    const [currentCycle, setCurrentCycle] = useState(1);
    const [cycleTimer, setCycleTimer] = useState(0); 
    const [medHistory, setMedHistory] = useState<Record<string, number[]>>({ epi: [], amio: [], lidocaine: [] });
    const [lastActionTime, setLastActionTime] = useState(Date.now()); // For idle detection
    
    const [shocksInCycle, setShocksInCycle] = useState(0);
    const [totalShocks, setTotalShocks] = useState(0); 
    
    // UI State
    const [showDebrief, setShowDebrief] = useState(false);
    const [debriefLoading, setDebriefLoading] = useState(false);
    const [debriefContent, setDebriefContent] = useState<string | null>(null);
    const [showRhythmCheck, setShowRhythmCheck] = useState(false);
    const [selectedRhythmGuess, setSelectedRhythmGuess] = useState<Rhythm | null>(null);
    const [showReference, setShowReference] = useState(false);
    const [isManualAnalysis, setIsManualAnalysis] = useState(false); 

    // Stats Tracking
    const [stats, setStats] = useState({
        cprCycles: 0,
        shocks: 0,
        epi: 0,
        amio: 0,
        lidocaine: 0,
        errors: 0
    });

    const [airwayStatus, setAirwayStatus] = useState<'none' | 'bvm' | 'advanced'>('none');
    const [accessEstablished, setAccessEstablished] = useState(false);
    const logEndRef = useRef<HTMLDivElement>(null);

    // Scroll logs
    useEffect(() => {
        if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    useEffect(() => {
        if (startTutorial) {
            launchScenario(TUTORIAL_SCENARIO, true);
        }
    }, [startTutorial]);

    // --- IDLE / STRUGGLE DETECTION ---
    useEffect(() => {
        if (phase === 'mission_select' || phase === 'rosc' || phase === 'failed' || isTrainingMode) return;

        const idleCheck = setInterval(() => {
            if (Date.now() - lastActionTime > 30000) { // 30s Real Time
                provideSmartHint();
                setLastActionTime(Date.now()); // Reset to avoid spam
            }
        }, 5000);

        return () => clearInterval(idleCheck);
    }, [lastActionTime, phase, rhythm, isTrainingMode, padsAttached, accessEstablished]);

    const provideSmartHint = () => {
        if (phase === 'cpr') return; // Don't interrupt CPR

        let hint = "";
        if (!padsAttached) hint = "Suzy: Don't forget to attach the pads/monitor leads!";
        else if (rhythm === 'VFIB' || rhythm === 'VT') {
            if (energy === 0) hint = "Suzy: Shockable rhythm detected. Charge the defibrillator.";
            else if (energy === 200) hint = "Suzy: Defib charged. Clear and Shock!";
        } 
        else if (rhythm === 'PEA') {
            hint = "Suzy: Monitor shows a rhythm, but no pulse? This is PEA. Think H's and T's.";
        }
        else if (rhythm === 'ASYSTOLE') {
            hint = "Suzy: Flatline. Confirm in leads. Give Epinephrine ASAP.";
        }
        
        if (hint) addLog(hint, "hint");
    };

    // --- TIME WARP ENGINE (20s Real Time = 2m Sim Time) ---
    useEffect(() => {
        if (phase === 'mission_select' || phase === 'briefing' || phase === 'rosc' || phase === 'failed' || phase === 'rhythm_check') return;
        
        const interval = setInterval(() => {
            if (phase === 'cpr') {
                setCycleTimer(prev => prev + 1);
            }

            setViability(v => {
                let change = -0.1;
                if (phase === 'cpr') {
                    change = 0.4;
                }
                
                // Untreated Shockable rhythms decay if no CPR
                if ((rhythm === 'VFIB' || rhythm === 'VT' || rhythm === 'TORSADES') && phase !== 'cpr') {
                    change = -0.3;
                }

                if (isTrainingMode) {
                    if (v < 20) return 20; 
                }

                const next = Math.min(100, Math.max(0, v + change));
                
                if (next <= 0) {
                    clearInterval(interval);
                    handleGameOver('failed');
                    return 0;
                }
                return next;
            });
        }, 83);
        return () => clearInterval(interval);
    }, [phase, rhythm, activeScenario, isTrainingMode]);

    // --- ACTION VALIDATOR & FEEDBACK ENGINE ---
    const addLog = (text: string, type: LogMessage['type'] = 'info') => {
        setLogs(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            text,
            type,
            time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })
        }]);
    };

    const showFeedback = (msg: string, type: 'success' | 'error') => {
        addLog(msg, type === 'success' ? 'success' : 'alert');
    };

    const validateAction = (actionId: string, execute: () => void) => {
        setLastActionTime(Date.now()); // Reset idle timer

        // 1. TRAINING MODE: Strict Sequence Check
        if (isTrainingMode) {
            const expectedAction = TUTORIAL_STEPS[tutorialStep];
            if (actionId === expectedAction) {
                if (actionId === 'cycle_btn') {
                    showFeedback("TRAINING: Cycle Complete. Initiating Rhythm Check.", "success");
                } else if (actionId === 'analyze_btn') {
                    showFeedback("TRAINING: Analyzing Rhythm...", "success");
                } else {
                    showFeedback("TRAINING: Correct Action.", "success");
                }
                
                // For 'analyze_btn' and 'cycle_btn', Rhythm Check modal handles step advancement
                if (actionId !== 'analyze_btn' && actionId !== 'cycle_btn') {
                    setTutorialStep(prev => prev + 1);
                }
                execute();
            } else {
                showFeedback("TRAINING: Incorrect. Follow the highlighted step to build muscle memory.", "error");
            }
            return;
        }

        // 2. CHALLENGE MODE: Clinical Logic Validation
        let isValid = true;
        let errorMsg = "";

        if (['epi_btn', 'amio_btn', 'lido_btn'].includes(actionId) && !accessEstablished) {
            isValid = false; errorMsg = "Procedure Error: Establish IV/IO Access First!";
        }

        if (actionId === 'shock_btn') {
            if (energy < 200) { isValid = false; errorMsg = "Procedure Error: Defibrillator must be charged to 200J first."; }
            else if (!padsAttached) { isValid = false; errorMsg = "Safety Error: Attach Pads before shocking."; }
            else if (['ASYSTOLE', 'PEA'].includes(rhythm)) { isValid = false; errorMsg = "CRITICAL ERROR: Never Shock Asystole/PEA. Resume CPR."; }
        }

        if (actionId === 'charge') {
            if (!padsAttached) { isValid = false; errorMsg = "Procedure Error: Attach Pads before charging."; }
        }

        if (actionId === 'analyze_btn') {
            if (!padsAttached) { isValid = false; errorMsg = "Procedure Error: Connect pads/leads to monitor first."; }
            if (phase === 'cpr') { isValid = false; errorMsg = "Procedure Error: Do not interrupt CPR for manual analysis. Wait for cycle end."; }
        }

        if (actionId === 'amio_btn' || actionId === 'lido_btn') {
            if (!['VFIB', 'VT'].includes(rhythm)) { isValid = false; errorMsg = "Medication Error: Antiarrhythmics are not indicated for non-shockable rhythms."; }
            else if (totalShocks < 3) {
                isValid = false; 
                errorMsg = "Timing Error: Antiarrhythmics are indicated for Refractory VF/pVT (after 3rd shock)."; 
            } 
        }

        if (actionId === 'epi_btn') {
            const lastEpi = medHistory.epi[medHistory.epi.length - 1] || 0;
            if (medHistory.epi.length > 0 && currentCycle - lastEpi < 2) {
                isValid = false; errorMsg = "Medication Error: Epinephrine is given every 3-5 mins (Every other cycle).";
            }
        }

        if (isValid) {
            execute();
        } else {
            showFeedback(errorMsg, "error");
            setViability(v => Math.max(0, v - 5));
            setStats(s => ({ ...s, errors: s.errors + 1 }));
        }
    };

    // --- GAME ACTIONS ---

    const launchScenario = (scenario: ScenarioData, tutorial = false) => {
        setActiveScenario(scenario);
        setIsTrainingMode(tutorial);
        setTutorialStep(0);
        
        setPhase('assessment');
        setRhythm(scenario.startRhythm);
        setPulse(scenario.initialPulse); 
        setViability(100);
        setLogs([]);
        setStats({ cprCycles: 0, shocks: 0, epi: 0, amio: 0, lidocaine: 0, errors: 0 });
        setAirwayStatus('none');
        setAccessEstablished(false);
        setEnergy(0);
        setShowDebrief(false);
        setCurrentCycle(1);
        setCycleTimer(0);
        setMedHistory({ epi: [], amio: [], lidocaine: [] });
        setShocksInCycle(0);
        setTotalShocks(0);
        setPadsAttached(false);
        setIsManualAnalysis(false);
        setLastActionTime(Date.now());
        setRoscHeartRate(null);
        
        if (tutorial) {
            addLog("TRAINING MODE: Guided Protocol Activated.", "system");
            addLog("INSTRUCTOR: Follow the highlighted cues.", "info");
        } else {
            addLog("SUZY: CHALLENGE MODE READY.", "system");
            addLog(`PATIENT: ${scenario.patient}. HX: ${scenario.history}`, "alert");
        }
    };

    const handleGameOver = (outcome: 'rosc' | 'failed') => {
        setPhase(outcome);
        if (outcome === 'rosc') {
            setRhythm('NSR');
            setPulse(true);
            const finalHR = Math.floor(Math.random() * (100 - 60 + 1)) + 60; // Random HR between 60 and 100
            setRoscHeartRate(finalHR);
            addLog(`SUZY: Spontaneous pulse palpable! HR ${finalHR}, BP 110/70.`, "success");
            addLog("SYSTEM: ROSC ACHIEVED. CODE ENDED.", "success");
            confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
            if (activeScenario.isTutorial && onTutorialEnd) onTutorialEnd();
        } else {
            setRhythm('ASYSTOLE');
            setPulse(false);
            setRoscHeartRate(0);
            addLog("SUZY: No cardiac activity. Viability 0%.", "alert");
            addLog("SYSTEM: PATIENT EXPIRED.", "alert");
        }
        
        setTimeout(() => {
            setShowDebrief(true);
            generateDebrief(outcome);
        }, 1500);
    };

    const generateDebrief = async (outcome: 'rosc' | 'failed') => {
        setDebriefLoading(true);
        try {
            const apiKey = process.env.API_KEY;
            const ai = new GoogleGenAI({ apiKey });
            
            const logSummary = logs.map(l => `[${l.time}] ${l.text}`).join('\n');

            const prompt = `
            Act as "Suzy", an expert ACLS Instructor.
            
            Scenario: ${activeScenario.patient} - ${activeScenario.history} (${activeScenario.startRhythm})
            Outcome: ${outcome === 'rosc' ? 'SURVIVAL' : 'DEATH'}
            Cycles Run: ${currentCycle}
            Performance: Shocks ${stats.shocks}, Epi ${stats.epi}, Amio ${stats.amio}, Lido ${stats.lidocaine}.
            Errors: ${stats.errors} (Protocol Violations)
            
            Logs:
            ${logSummary}

            Generate a professional Clinical Code Record strictly in this format (NO ASTERISKS, NO MARKDOWN BOLDING):
            
            CLINICAL VERDICT
            [One sentence summary]
            
            PERFORMANCE AUDIT
            - [Feedback on Medication Timing]
            - [Feedback on Sequence]
            
            INSTRUCTOR NOTE
            [One high-yield tip for this specific case: ${activeScenario.focus}]
            `;
            
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });
            
            setDebriefContent(result.text || "Analysis failed.");
        } catch (e) {
            console.error("AI Debrief Failed", e);
            setDebriefContent("Could not connect to Suzy's AI core.");
        } finally {
            setDebriefLoading(false);
        }
    };

    // --- INTERVENTIONS ---

    const checkAssessment = () => {
        addLog("Action: Pulse Check (Hands off)...", "action");
        const prevPhase = phase;
        setPhase('assessment'); 
        
        setTimeout(() => {
            if (!pulse) {
                addLog(`Assessment: NO PULSE. Rhythm is ${rhythm}.`, "alert");
                if (rhythm === 'PEA') {
                    addLog("Hint: Monitor shows rhythm but NO pulse = PEA.", "hint");
                }
            } else {
                addLog(`Assessment: WEAK PULSE PRESENT. Rhythm is ${rhythm}.`, "success");
            }
            if (prevPhase === 'cpr' && !isTrainingMode) setPhase('cpr'); 
        }, 1500); 
    };

    const performCPR = () => {
        if (phase === 'cpr') return;
        setPhase('cpr');
        addLog(`Action: Cycle ${currentCycle} CPR Started. High Quality Compressions.`, "action");
    };

    const attachPads = () => {
        setPadsAttached(true);
        addLog("Action: Pads attached. Monitor leads connected.", "action");
    };

    const analyzeRhythm = () => {
        setIsManualAnalysis(true);
        setPhase('rhythm_check');
        setShowRhythmCheck(true);
    };

    const chargeDefib = () => {
        setEnergy(200);
        addLog("Action: Defibrillator Charging to 200J...", "action");
    };

    const deliverShock = () => {
        setIsShocking(true);
        addLog("Action: CLEAR! Shocking...", "action");
        
        setTimeout(() => {
            setIsShocking(false);
            setEnergy(0);
            
            addLog(`System: Shock ${stats.shocks + 1} Delivered. Resetting electrical activity.`, "success");
            setStats(s => ({ ...s, shocks: s.shocks + 1 }));
            setShocksInCycle(s => s + 1);
            setTotalShocks(s => s + 1);
            
            setPhase('assessment'); 
            addLog("GUIDANCE: Resume CPR immediately! Do not check pulse yet.", "alert");
        }, 800);
    };

    const manageAirway = () => {
        if (airwayStatus === 'none') {
            setAirwayStatus('bvm');
            addLog("Action: Bag-Mask Ventilation established with 100% O2.", "action");
        } else if (airwayStatus === 'bvm') {
            setAirwayStatus('advanced');
            addLog("Action: Endotracheal Tube inserted. Continuous compressions enabled.", "success");
        }
    };

    const administerMeds = (med: 'epi' | 'amio' | 'lidocaine') => {
        const history = medHistory[med] || [];
        setViability(v => Math.min(100, v + 15));

        if (med === 'epi') {
            addLog(`Action: Epinephrine 1mg IVP (Cycle ${currentCycle}). Vasoconstriction taking effect.`, "success");
            setMedHistory(prev => ({ ...prev, epi: [...prev.epi, currentCycle] }));
            setStats(s => ({ ...s, epi: s.epi + 1 }));
        } 
        else if (med === 'amio') {
            const dose = history.length === 0 ? "300mg" : "150mg";
            addLog(`Action: Amiodarone ${dose} IVP. Antiarrhythmic effect active.`, "success");
            setMedHistory(prev => ({ ...prev, amio: [...prev.amio, currentCycle] }));
            setStats(s => ({ ...s, amio: s.amio + 1 }));
        }
        else if (med === 'lidocaine') {
            const dose = history.length === 0 ? "1mg/kg" : "0.5mg/kg";
            addLog(`Action: Lidocaine ${dose} IVP. Sodium channel blockade.`, "success");
            setMedHistory(prev => ({ ...prev, lidocaine: [...prev.lidocaine, currentCycle] }));
            setStats(s => ({ ...s, lidocaine: s.lidocaine + 1 }));
        }
    };

    const triggerCycleAdvance = () => {
        setIsManualAnalysis(false);
        setPhase('rhythm_check');
        setShowRhythmCheck(true);
    };

    const handleRhythmSubmit = () => {
        if (!selectedRhythmGuess) return;
        setShowRhythmCheck(false);
        const correct = selectedRhythmGuess === rhythm || (rhythm === 'VFIB' && selectedRhythmGuess === 'VT'); 
        
        if (isTrainingMode) {
            if (correct) {
                showFeedback("TRAINING: Correctly Identified.", "success");
                setTutorialStep(prev => prev + 1);
                // For Analyze button, we advance step. 
                // For Cycle button, we advance step AND trigger the cycle logic.
                if (!isManualAnalysis) advanceCycleLogic();
            } else {
                showFeedback("TRAINING: Incorrect Rhythm. Look closer.", "error");
            }
            return;
        }

        if (correct) {
            addLog(`Assessment: Rhythm identified as ${selectedRhythmGuess}.`, "success");
            setViability(v => Math.min(100, v + 5));
        } else {
            addLog(`Assessment: Incorrect identification. It was ${rhythm}.`, "alert");
            setViability(v => Math.max(0, v - 10));
        }

        if (!isManualAnalysis) {
            advanceCycleLogic();
        } else {
            setPhase('assessment'); 
        }
    };

    const advanceCycleLogic = () => {
        addLog(`--- END OF CYCLE ${currentCycle} ---`, "system");
        setStats(s => ({ ...s, cprCycles: s.cprCycles + 1 }));
        setCurrentCycle(c => c + 1);
        setCycleTimer(0);
        setShocksInCycle(0);
        setPhase('assessment');

        const medsMet = activeScenario.requiredMeds ? activeScenario.requiredMeds.every(m => {
            if (m === 'amio') return stats.amio > 0 || stats.lidocaine > 0;
            if (m === 'epi') return stats.epi > 0;
            return true;
        }) : true;

        const cyclesMet = currentCycle >= activeScenario.minCycles;
        
        if (cyclesMet && medsMet && viability > 0) {
            handleGameOver('rosc');
            return;
        }

        if (activeScenario.requiredMeds?.includes('amio') && !medsMet) {
             addLog("GUIDANCE: Rhythm is refractory. Prepare Antiarrhythmic for next cycle.", "alert");
        }

        if (viability < 20 && rhythm !== 'ASYSTOLE' && !isTrainingMode) {
            setRhythm('ASYSTOLE');
            addLog("Monitor: Rhythm degenerated to ASYSTOLE.", "alert");
        }
        
        // Nuanced feedback for specific scenarios
        if (activeScenario.id === 4 && rhythm === 'PEA') { // PEA Case
             addLog(`Monitor: Rhythm appears organized (NSR-like).`, "info");
             addLog(`Suzy: Do not trust the monitor. Check Pulse!`, "hint");
        } else if (activeScenario.id === 2 && rhythm === 'VT' && currentCycle > 1) { // pVT
             // Hints for causes if sticking around
             if (Math.random() > 0.6) {
                 addLog("Suzy: Wide complex persists. Check electrolytes? (Hyperkalemia/Magnesium)", "hint");
             } else {
                 addLog(`Monitor: Rhythm is ${rhythm}. Pulse Check?`, "info");
             }
        } else {
             addLog(`Monitor: Rhythm is ${rhythm}. Pulse Check?`, "info");
        }
    };

    const getBatteryColor = () => {
        if (viability > 70) return 'bg-emerald-500';
        if (viability > 30) return 'bg-amber-500';
        return 'bg-red-600 animate-pulse';
    };

    const getHighlight = (id: string) => {
        if (!isTrainingMode) return '';
        const currentTarget = TUTORIAL_STEPS[tutorialStep];
        if (currentTarget === id) return 'ring-4 ring-yellow-400 animate-pulse scale-105 z-50';
        return 'opacity-50';
    };

    const isIdentifyTarget = () => {
        if (!isTrainingMode) return '';
        const step = TUTORIAL_STEPS[tutorialStep];
        return step === 'analyze_btn' || step === 'cycle_btn' ? 'identify_btn' : '';
    };

    if (phase === 'mission_select') {
        const shockable = SCENARIOS.filter(s => s.algorithm === 'shockable');
        const nonShockable = SCENARIOS.filter(s => s.algorithm === 'nonshockable');

        return (
            <div className="space-y-8 animate-in fade-in duration-500 pb-20">
               <div className="text-center space-y-3 mt-4 px-4">
                   <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">ACLS Command Center</h1>
                   <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-medium">Select a scenario. Master the 2025 AHA Guidelines for Cardiac Arrest.</p>
               </div>

               <div className="max-w-4xl mx-auto px-2 md:px-4">
                   <button 
                       onClick={() => launchScenario(TUTORIAL_SCENARIO, true)}
                       className="w-full relative bg-gradient-to-r from-amber-400 to-yellow-500 rounded-3xl p-6 md:p-8 shadow-2xl hover:scale-[1.01] transition-all group overflow-hidden text-left"
                   >
                       <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
                       <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                           <div className="flex items-center gap-5">
                               <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                                   <GraduationCap size={32} className="text-white" />
                               </div>
                               <div>
                                   <h2 className="text-2xl font-black text-white uppercase tracking-tight">Basic Training</h2>
                                   <p className="text-white/90 font-bold text-sm mt-1">Guided Simulation • Learn the Sequence</p>
                               </div>
                           </div>
                           <div className="px-6 py-3 bg-white text-yellow-600 font-bold rounded-xl shadow-lg uppercase tracking-widest text-xs flex items-center gap-2 group-hover:gap-4 transition-all">
                               Start Training <ArrowRight size={14} />
                           </div>
                       </div>
                   </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto px-2 md:px-4">
                   <div className="space-y-4">
                       <div className="flex items-center gap-3 mb-2 px-2">
                           <div className="p-2 bg-red-600 rounded-lg text-white shadow-lg shadow-red-500/30"><Zap size={20} /></div>
                           <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Shockable Rhythms</h2>
                       </div>
                       {shockable.map(mission => (
                           <MissionCard key={mission.id} mission={mission} onClick={() => launchScenario(mission)} />
                       ))}
                   </div>

                   <div className="space-y-4">
                       <div className="flex items-center gap-3 mb-2 px-2">
                           <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/30"><Activity size={20} /></div>
                           <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Non-Shockable</h2>
                       </div>
                       {nonShockable.map(mission => (
                           <MissionCard key={mission.id} mission={mission} onClick={() => launchScenario(mission)} />
                       ))}
                   </div>
               </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div className="lg:col-span-12 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 relative overflow-hidden">
                {/* Header Background */}
                <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 pointer-events-none"></div>
                
                <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                    <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-lg shrink-0">
                        {activeScenario.algorithm === 'shockable' ? <Zap size={28} /> : <Activity size={28} />}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-none flex items-center gap-2 truncate text-slate-900 dark:text-white">
                            {activeScenario.title}
                            {isTrainingMode && <span className="bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded shrink-0 shadow-sm">TRAINING</span>}
                        </h2>
                        <div className="flex items-center gap-4 mt-1.5">
                            <p className="text-xs font-bold opacity-60 uppercase tracking-widest truncate text-slate-500 dark:text-slate-400">
                                Patient: <span className="text-slate-800 dark:text-white">{activeScenario.patient}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-auto flex justify-center">
                    <CodeStats stats={stats} cycle={currentCycle} />
                </div>

                <div className="flex items-center gap-2 relative z-10 w-full md:w-auto justify-end">
                    {isTrainingMode && (
                        <div className="px-4 py-2 bg-yellow-400 text-yellow-900 font-black rounded-xl text-xs uppercase tracking-widest animate-pulse shadow-lg hidden xl:block self-center">
                            STEP {tutorialStep + 1} / {TUTORIAL_STEPS.length}
                        </div>
                    )}
                    <button 
                        onClick={() => setShowReference(true)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-slate-700 dark:text-slate-300 shadow-sm`}
                    >
                        <BookOpen size={16} /> <span className="hidden sm:inline">Cheat Sheet</span>
                    </button>
                    <button 
                        onClick={() => setPhase('mission_select')}
                        className={`flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-colors`}
                    >
                        <Map size={16} /> Abort
                    </button>
                </div>
            </div>

            {/* MAIN SIMULATOR AREA */}
            <div className="lg:col-span-8 space-y-6 order-1">
                
                {/* MONITOR */}
                <div className="bg-slate-100 dark:bg-slate-950 border-4 border-slate-300 dark:border-slate-800 rounded-[2.5rem] p-4 md:p-6 shadow-2xl relative overflow-hidden group">
                    {phase === 'cpr' && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 z-40 flex items-center gap-2 shadow-lg">
                            <Clock size={12} className="text-blue-400 animate-pulse" />
                            <span className="text-blue-100 font-mono font-bold text-xs">
                                CYCLE: {Math.min(100, Math.floor((cycleTimer / 240) * 100))}%
                            </span>
                        </div>
                    )}
                    
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-purple-500/10 px-3 py-1.5 rounded-full text-[10px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20 backdrop-blur-sm z-30">
                        <FastForward size={10} /> 20s = 2m
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex justify-between items-end mb-4 relative z-10">
                        <div className="flex flex-col min-w-0 pr-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Patient Status</span>
                            <div className="text-base md:text-lg font-bold text-slate-800 dark:text-white flex flex-wrap items-center gap-2">
                                <span className="truncate">{activeScenario.title}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${phase === 'cpr' ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                    {phase === 'cpr' ? 'CPR IN PROGRESS' : 'CHECK PULSE'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right w-1/3 shrink-0">
                            <div className="flex justify-between text-[10px] font-bold uppercase mb-1 text-slate-600 dark:text-slate-400">
                                <span>Viability</span>
                                <span>{Math.round(viability)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${getBatteryColor()}`} style={{ width: `${viability}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <ECGMonitor rhythm={rhythm} isShocking={isShocking} phase={phase} viability={viability} padsAttached={padsAttached} customHR={roscHeartRate} />

                    <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-800 flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2"><AlertTriangle size={12}/> {activeScenario.clue}</div>
                        <div className="hidden sm:block">CYCLE: {currentCycle} | SHOCKS: {stats.shocks}</div>
                    </div>
                </div>

                {/* CONTROLS DECK */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                    {/* 1. Airway */}
                    <div className="flex flex-col gap-2 p-3 md:p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-[9px] font-black text-slate-400 uppercase text-center tracking-wider">Airway / Access</span>
                        <button 
                            onClick={() => validateAction('airway_btn', manageAirway)} 
                            disabled={airwayStatus === 'advanced'} 
                            className={`py-3 rounded-xl font-bold text-[10px] md:text-xs border transition-all shadow-sm ${airwayStatus !== 'none' ? 'bg-green-500 text-white border-green-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-white'} ${getHighlight('airway_btn')}`}
                        >
                            {airwayStatus === 'none' ? 'Give Oxygen' : airwayStatus === 'bvm' ? 'Adv. Airway' : 'Intubated'}
                        </button>
                        <button 
                            onClick={() => validateAction('iv_btn', () => setAccessEstablished(true))} 
                            disabled={accessEstablished} 
                            className={`py-3 rounded-xl font-bold text-[10px] md:text-xs border transition-all shadow-sm ${accessEstablished ? 'bg-green-500 text-white border-green-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-white'} ${getHighlight('iv_btn')}`}
                        >
                            {accessEstablished ? 'IV Patent' : 'IV/IO Access'}
                        </button>
                    </div>

                    {/* 2. Assessment */}
                    <div className="flex flex-col gap-2 p-3 md:p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-[9px] font-black text-slate-400 uppercase text-center tracking-wider">Assessment</span>
                        <button 
                            onClick={() => validateAction('pulse_check', checkAssessment)} 
                            className={`py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-yellow-500 rounded-xl font-bold text-[10px] md:text-xs text-slate-700 dark:text-white transition-all flex items-center justify-center gap-1 shadow-sm ${getHighlight('pulse_check')}`}
                        >
                            <Stethoscope size={14}/> Pulse Check
                        </button>
                        <button 
                            onClick={() => validateAction('cpr_btn', performCPR)} 
                            disabled={phase === 'cpr'} 
                            className={`py-3 rounded-xl font-bold text-[10px] md:text-xs border transition-all flex items-center justify-center gap-1 shadow-sm ${phase === 'cpr' ? 'bg-blue-600 text-white border-blue-600 animate-pulse' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-white'} ${getHighlight('cpr_btn')}`}
                        >
                            <Activity size={14}/> {phase === 'cpr' ? 'CPR Active' : 'Start CPR'}
                        </button>
                    </div>

                    {/* 3. Defib */}
                    <div className="flex flex-col gap-2 p-3 md:p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-[9px] font-black text-slate-400 uppercase text-center tracking-wider">Defib</span>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => validateAction('attach_pads_btn', attachPads)}
                                disabled={padsAttached}
                                className={`py-3 rounded-xl font-bold text-[10px] border transition-all flex items-center justify-center shadow-sm ${padsAttached ? 'bg-slate-200 text-slate-500 border-transparent' : `bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-yellow-500 text-slate-700 dark:text-white ${getHighlight('attach_pads_btn')}`}`}
                            >
                                {padsAttached ? 'On' : 'Pads'}
                            </button>
                            <button 
                                onClick={() => validateAction('analyze_btn', analyzeRhythm)}
                                disabled={phase === 'cpr'}
                                className={`py-3 rounded-xl font-bold text-[10px] border transition-all flex items-center justify-center ${phase === 'cpr' ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-yellow-500 text-slate-700 dark:text-white shadow-sm'} ${getHighlight('analyze_btn')}`}
                            >
                                Analyze
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => validateAction('charge', chargeDefib)} 
                                className={`py-3 rounded-xl font-bold text-[10px] border transition-all flex items-center justify-center shadow-sm ${energy === 200 ? 'bg-yellow-400 text-yellow-900 border-yellow-400 animate-pulse' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-yellow-500 text-slate-700 dark:text-white'} ${getHighlight('charge')}`}
                            >
                                Charge
                            </button>
                            <button 
                                onClick={() => validateAction('shock_btn', deliverShock)} 
                                className={`py-3 bg-red-600 hover:bg-red-500 text-white border border-red-600 rounded-xl font-bold text-[10px] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1 ${getHighlight('shock_btn')}`}
                            >
                                <Zap size={10}/> SHOCK
                            </button>
                        </div>
                    </div>

                    {/* 4. Meds */}
                    <div className="flex flex-col gap-2 p-3 md:p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-[9px] font-black text-slate-400 uppercase text-center tracking-wider">Meds</span>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => validateAction('epi_btn', () => administerMeds('epi'))} 
                                className={`col-span-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 rounded-xl font-bold text-[10px] text-slate-700 dark:text-white transition-all shadow-sm ${getHighlight('epi_btn')}`}
                            >
                                Epi 1mg
                            </button>
                            <button 
                                onClick={() => validateAction('amio_btn', () => administerMeds('amio'))} 
                                className={`py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 rounded-xl font-bold text-[10px] text-slate-700 dark:text-white transition-all shadow-sm ${getHighlight('amio_btn')}`}
                            >
                                Amio
                            </button>
                            <button 
                                onClick={() => validateAction('lido_btn', () => administerMeds('lidocaine'))} 
                                className={`py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 rounded-xl font-bold text-[10px] text-slate-700 dark:text-white transition-all shadow-sm`}
                            >
                                Lido
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative pt-2">
                    {cycleTimer > 230 && phase === 'cpr' && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-black text-sm animate-bounce shadow-xl z-20 whitespace-nowrap border-2 border-white">
                            CYCLE COMPLETE! CHECK RHYTHM!
                        </div>
                    )}
                    <button 
                        onClick={() => validateAction('cycle_btn', triggerCycleAdvance)} 
                        disabled={phase !== 'cpr'} 
                        className={`w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-95 transition-all ${getHighlight('cycle_btn')}`}
                    >
                        Complete Cycle (Auto-Analyze)
                    </button>
                    {phase === 'cpr' && (
                        <div className="absolute bottom-0 left-0 h-1.5 bg-blue-500 transition-all duration-1000 ease-linear rounded-bl-2xl rounded-br-2xl" style={{ width: `${Math.min(100, (cycleTimer / 240) * 100)}%` }}></div>
                    )}
                </div>

            </div>

            {/* LOGS PANEL */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col h-[500px] shadow-lg order-2 lg:order-2">
                <div className="p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-500 uppercase tracking-widest flex justify-between shrink-0">
                    <span>Resuscitation Log</span>
                    <span className="text-red-500 animate-pulse">● LIVE</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 bg-white dark:bg-slate-900">
                    {logs.length === 0 && <p className="text-center text-slate-400 text-xs mt-10">Waiting for commands...</p>}
                    {logs.map((l) => (
                        <div key={l.id} className={`p-3 rounded-xl text-xs border leading-relaxed shadow-sm ${
                            l.type === 'alert' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 font-bold' :
                            l.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 font-bold' :
                            l.type === 'hint' ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-400 font-bold italic' :
                            l.type === 'system' ? 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 font-bold text-center uppercase tracking-wider' :
                            'bg-white border-slate-100 text-slate-700 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-400'
                        }`}>
                            {l.type !== 'system' && <span className="opacity-50 font-mono mr-2 text-[10px]">{l.time}</span>}
                            {l.text}
                        </div>
                    ))}
                    <div ref={logEndRef}></div>
                </div>
            </div>

            {/* --- OVERLAYS --- */}
            {showRhythmCheck && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-zoom-in border border-slate-200 dark:border-white/10">
                        <div className="text-center mb-6">
                            <Eye className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Rhythm Check</h3>
                            <p className="text-slate-500 text-xs mt-1">Identify the rhythm on the monitor to proceed.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {(['VFIB', 'VT', 'PEA', 'ASYSTOLE', 'TORSADES', 'NSR'] as Rhythm[]).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setSelectedRhythmGuess(r)}
                                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                                        selectedRhythmGuess === r 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleRhythmSubmit}
                            disabled={!selectedRhythmGuess}
                            className={`w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed ${isIdentifyTarget() ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
                        >
                            Confirm Analysis
                        </button>
                    </div>
                </div>
            )}

            {showDebrief && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => !debriefLoading && setShowDebrief(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col max-h-[85vh] animate-zoom-in" onClick={e => e.stopPropagation()}>
                        <div className={`p-6 border-b border-slate-200 dark:border-slate-800 ${phase === 'rosc' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} flex items-center justify-between`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-sm ${phase === 'rosc' ? 'bg-green-100 dark:bg-green-900/40 border-green-500 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 border-red-500 text-red-600 dark:text-red-400'}`}>
                                    {phase === 'rosc' ? <Trophy size={24} /> : <Skull size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                        {phase === 'rosc' ? 'Clinical Code Record: SURVIVAL' : 'Clinical Code Record: EXPIRED'}
                                    </h3>
                                    <p className={`text-xs font-bold uppercase tracking-widest ${phase === 'rosc' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        Final Viability: {Math.round(viability)}%
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowDebrief(false)} className="p-2 hover:bg-black/5 rounded-full dark:hover:bg-white/10 transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-slate-900">
                            {debriefLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4 text-slate-400 animate-pulse">
                                    <BrainCircuit size={48} />
                                    <p className="font-mono text-sm">SUZY IS GENERATING REPORT...</p>
                                </div>
                            ) : (
                                <div className="prose dark:prose-invert max-w-none">
                                    <SimpleMarkdown text={debriefContent || "No analysis available."} />
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4">
                            <button 
                                onClick={() => setShowDebrief(false)}
                                className="flex-1 py-3 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Review Logs
                            </button>
                            <button 
                                onClick={() => setPhase('mission_select')}
                                className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg transition-transform hover:scale-[1.02]"
                            >
                                Mission Select
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReference && <ACLSReference onClose={() => setShowReference(false)} />}

        </div>
    );
};

export default ACLSSimulator;
