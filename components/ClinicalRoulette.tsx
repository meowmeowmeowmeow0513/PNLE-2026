
import React, { useState, useEffect } from 'react';
import { useTasks } from '../TaskContext';
import { SIM_CASES, ClinicalCase, OFFICIAL_CHARTS, OfficialChart, OFFICIAL_PDF_PATHS } from '../data/simulationData';
import { Dices, CheckCircle2, Loader2, Info, Brain, Zap, Stethoscope, ClipboardList, FileText, Stamp, Thermometer, User, Activity, AlertTriangle, X, History, Trash2, Calendar, Star, Trophy, Award, ShieldCheck, HeartHandshake, Maximize2, FileOutput, AlertCircle, Download, FileDown, BookOpen, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

interface SavedCaseLog {
    id: string;
    timestamp: number;
    chart: OfficialChart;
    caseType: ClinicalCase;
}

interface ClinicalRouletteProps {
    onComplete?: () => void;
}

const ClinicalRoulette: React.FC<ClinicalRouletteProps> = ({ onComplete }) => {
    const { addTask } = useTasks();
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedCase, setSelectedCase] = useState<ClinicalCase | null>(null);
    const [acceptStatus, setAcceptStatus] = useState<'idle' | 'stamped' | 'accepted'>('idle');
    
    // Structured Data State
    const [patientChart, setPatientChart] = useState<OfficialChart | null>(null);
    const [activeTab, setActiveTab] = useState<'chart' | 'orders'>('chart');

    // Visual state for the "Slot Machine" effect
    const [displayCase, setDisplayCase] = useState<ClinicalCase | null>(null);

    // Case Log History & XP
    const [showHistory, setShowHistory] = useState(false);
    const [showDownloads, setShowDownloads] = useState(false);
    const [viewLog, setViewLog] = useState<SavedCaseLog | null>(null);
    const [rouletteXP, setRouletteXP] = useState(0);
    const [caseHistory, setCaseHistory] = useState<SavedCaseLog[]>(() => {
        try {
            const saved = localStorage.getItem('clinical_roulette_history_v3');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load history", e);
            return [];
        }
    });

    // Resource Downloads State
    const [resourceLinks, setResourceLinks] = useState<{title: string, url: string}[]>([]);

    useEffect(() => {
        localStorage.setItem('clinical_roulette_history_v3', JSON.stringify(caseHistory));
        setRouletteXP(caseHistory.length);
    }, [caseHistory]);

    // Fetch PDF URLs on mount
    useEffect(() => {
        const fetchUrls = async () => {
            const links = await Promise.all(OFFICIAL_PDF_PATHS.map(async (item) => {
                try {
                    const r = ref(storage, item.path);
                    const url = await getDownloadURL(r);
                    return { title: item.title, url };
                } catch (e) {
                    console.error("Failed to load PDF", item.title, e);
                    return null;
                }
            }));
            setResourceLinks(links.filter(l => l !== null) as {title: string, url: string}[]);
        };
        fetchUrls();
    }, []);

    // Rank Logic - NURSING EDITION
    const getRank = () => {
        if (rouletteXP >= 30) return { title: 'Charge Nurse', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/20' };
        if (rouletteXP >= 15) return { title: 'Staff Nurse', icon: Award, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' };
        if (rouletteXP >= 5) return { title: 'Nurse Orientee', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' };
        return { title: 'Student Nurse', icon: User, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' };
    };
    
    const rank = getRank();

    // Helper to safely get icon
    const getCaseIcon = (caseId: string) => {
        const found = SIM_CASES.find(c => c.id === caseId);
        return found ? found.icon : FileText;
    };

    const handleSpin = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setSelectedCase(null);
        setPatientChart(null);
        setAcceptStatus('idle');
        setActiveTab('chart');

        let count = 0;
        const maxSpins = 25;
        const interval = setInterval(() => {
            const randomCase = SIM_CASES[Math.floor(Math.random() * SIM_CASES.length)];
            setDisplayCase(randomCase);
            count++;
            
            // Slow down effect
            if (count >= maxSpins) {
                clearInterval(interval);
                setIsSpinning(false);
                setSelectedCase(randomCase);
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                
                // INSTANT LOAD FROM OFFICIAL SOURCE
                const officialData = OFFICIAL_CHARTS[randomCase.id];
                if (officialData) {
                    setPatientChart(officialData);
                }
            }
        }, 80 + (count * 10)); // Decelerating spin
    };

    const handleAcceptCase = async () => {
        if (!selectedCase || !patientChart) return;
        
        setAcceptStatus('stamped');
        
        // Award XP via prop callback to prevent abuse (Moved here from parent click)
        if (onComplete) {
            onComplete();
        }
        
        const newLog: SavedCaseLog = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            chart: patientChart,
            caseType: selectedCase
        };
        
        setCaseHistory(prev => {
            const updated = [newLog, ...prev];
            if (updated.length > 10) return updated.slice(0, 10);
            return updated;
        });

        // Construct detailed text for Planner
        const detailsText = `
OFFICIAL SLE CASE: ${patientChart.initials} (${patientChart.ageSex})
DX: ${patientChart.diagnosis}
CC: ${patientChart.chiefComplaint}

VITALS:
BP: ${patientChart.vitals.bp} | HR: ${patientChart.vitals.hr} | RR: ${patientChart.vitals.rr}
Temp: ${patientChart.vitals.temp} | SpO2: ${patientChart.vitals.spo2}

HISTORY:
${patientChart.history}

STAT ORDERS:
${patientChart.statOrders.map(o => `- ${o}`).join('\n')}
        `.trim();

        setTimeout(async () => {
            const now = new Date();
            const end = new Date(now.getTime() + 60 * 60 * 1000); // 1 Hour

            await addTask({
                title: `[SLE] ${selectedCase.short} - ${patientChart.initials}`,
                category: 'School',
                priority: 'High',
                start: now.toISOString(),
                end: end.toISOString(),
                allDay: false,
                details: detailsText
            });
            
            setAcceptStatus('accepted');
        }, 800);
    };

    const getThemeColor = (color: string) => {
        switch(color) {
            case 'purple': return 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400';
            case 'yellow': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400';
            case 'blue': return 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400';
            case 'emerald': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400';
            case 'cyan': return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400';
            case 'amber': return 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400';
            case 'red': return 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    const getResourceVisual = (title: string) => {
        if (title.includes("Algorithm")) return { color: "bg-red-500", icon: Zap, label: "Protocol" };
        if (title.includes("Scenario")) return { color: "bg-blue-500", icon: FileText, label: "Script" };
        if (title.includes("Rubrics")) return { color: "bg-emerald-500", icon: ClipboardList, label: "Grading" };
        return { color: "bg-slate-500", icon: BookOpen, label: "Reference" };
    };

    const activeCase = selectedCase || displayCase;
    const DetailedIcon = viewLog ? getCaseIcon(viewLog.caseType.id) : FileText;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header */}
            <div className="text-center space-y-4 px-4 pt-4 relative">
                <div className="absolute top-0 right-4 flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowDownloads(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors shadow-sm font-bold text-xs border border-blue-200 dark:border-blue-800"
                    >
                        <FileDown size={16} /> Official Resources
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowHistory(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-purple-500 dark:text-slate-300 transition-colors shadow-sm border border-slate-200 dark:border-slate-700 font-bold text-xs"
                    >
                        <History size={16} /> Archives ({caseHistory.length})
                    </button>
                </div>

                {/* Rank Badge */}
                <div className="flex justify-center">
                    <div className={`flex items-center gap-2 border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-full shadow-sm ${rank.bg}`}>
                        <rank.icon size={16} className={rank.color} />
                        <span className={`text-xs font-black uppercase tracking-widest ${rank.color}`}>{rank.title}</span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1">| {rouletteXP} Cases</span>
                    </div>
                </div>

                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl shadow-purple-500/30 mb-2 ring-4 ring-purple-100 dark:ring-purple-900/30">
                    <Dices size={36} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Clinical Roulette</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm md:text-base font-medium">
                    Test your rapid assessment skills. Spin to receive an official 2025 SLE patient scenario.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch px-2 md:px-0">
                
                {/* LEFT: CASE LIST (4 Cols) */}
                <div className="lg:col-span-4 space-y-4 order-2 lg:order-1 h-full">
                    <div className="bg-white dark:bg-slate-900 backdrop-blur-md rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-full flex flex-col min-h-[300px]">
                        <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase tracking-widest text-xs font-bold">
                            <Info size={14} /> Potential Assignments
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                            {SIM_CASES.map(c => (
                                <div key={c.id} className={`flex items-center gap-3 p-3 rounded-2xl border border-transparent transition-all ${selectedCase?.id === c.id ? `bg-slate-100 dark:bg-slate-800 shadow-md border-${c.color}-500/50 scale-105` : 'bg-slate-50 dark:bg-black/20 opacity-70 hover:opacity-100'}`}>
                                    <div className={`p-2.5 rounded-xl ${getThemeColor(c.color)}`}>
                                        <c.icon size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block">{c.title}</span>
                                        <span className="text-[10px] font-bold uppercase text-slate-400">{c.category}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: MAIN STAGE (8 Cols) */}
                <div className="lg:col-span-8 order-1 lg:order-2">
                    <div className="bg-slate-100 dark:bg-slate-950 border-4 border-slate-300 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col items-center justify-center group">
                        
                        {/* Background Elements */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                        
                        {activeCase ? (
                            <div className="relative z-10 w-full max-w-xl animate-in zoom-in duration-300">
                                {/* THE CLINICAL CARD (EHR STYLE) */}
                                <div className={`relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${isSpinning ? 'blur-sm scale-95' : 'blur-0 scale-100'} border border-slate-200 dark:border-slate-800`}>
                                    
                                    {/* STAMP OVERLAY */}
                                    {acceptStatus === 'stamped' && (
                                        <div className="absolute inset-0 z-50 flex items-center justify-center animate-in zoom-in duration-300">
                                            <div className="border-4 border-emerald-500 text-emerald-500 px-8 py-4 rounded-xl text-4xl font-black uppercase tracking-widest transform -rotate-12 opacity-80 backdrop-blur-sm bg-white/50 dark:bg-black/50">
                                                ACCEPTED
                                            </div>
                                        </div>
                                    )}

                                    {/* EHR Header */}
                                    <div className={`p-4 ${getThemeColor(activeCase.color)} bg-opacity-20 dark:bg-opacity-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center`}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                                <activeCase.icon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg leading-none">{activeCase.short}</h3>
                                                <p className="text-[10px] font-bold uppercase opacity-70 mt-0.5">Priority 1 • Official Case</p>
                                            </div>
                                        </div>
                                        {patientChart && (
                                            <div className="text-right">
                                                <div className="font-mono font-bold text-lg">{patientChart.initials}</div>
                                                <div className="text-[10px] font-bold uppercase opacity-70">{patientChart.ageSex}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tabs */}
                                    {patientChart && (
                                        <div className="flex border-b border-slate-100 dark:border-slate-800">
                                            <button 
                                                onClick={() => setActiveTab('chart')}
                                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'chart' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-b-2 border-purple-500' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Chart
                                            </button>
                                            <button 
                                                onClick={() => setActiveTab('orders')}
                                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'orders' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-b-2 border-purple-500' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Orders
                                            </button>
                                        </div>
                                    )}

                                    {/* Card Content */}
                                    <div className="p-6 min-h-[220px] bg-white dark:bg-slate-900">
                                        {isSpinning ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-400 font-mono text-sm animate-pulse gap-3 py-8">
                                                <Loader2 size={24} className="animate-spin" />
                                                ACCESSING EMR...
                                            </div>
                                        ) : patientChart ? (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                {activeTab === 'chart' ? (
                                                    <div className="space-y-4">
                                                        {/* Vitals Grid */}
                                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-center border border-slate-100 dark:border-slate-700">
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase">BP</div>
                                                                <div className="font-mono font-bold text-slate-800 dark:text-white">{patientChart.vitals.bp}</div>
                                                            </div>
                                                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-center border border-slate-100 dark:border-slate-700">
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase">HR</div>
                                                                <div className={`font-mono font-bold ${parseInt(patientChart.vitals.hr) > 100 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{patientChart.vitals.hr}</div>
                                                            </div>
                                                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-center border border-slate-100 dark:border-slate-700">
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase">SpO2</div>
                                                                <div className={`font-mono font-bold ${parseInt(patientChart.vitals.spo2) < 94 ? 'text-blue-500' : 'text-slate-800 dark:text-white'}`}>{patientChart.vitals.spo2}%</div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Chief Complaint</h4>
                                                            <p className="text-sm font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border-l-4 border-purple-500">
                                                                "{patientChart.chiefComplaint}"
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">History</h4>
                                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                                {patientChart.history}
                                                            </p>
                                                        </div>
                                                        
                                                        {patientChart.labs && (
                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Key Findings</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {patientChart.labs.map((lab, i) => (
                                                                        <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono font-bold">{lab}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admitting Diagnosis</h4>
                                                            <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                                                <Activity size={16} className="text-pink-500" />
                                                                {patientChart.diagnosis}
                                                            </div>
                                                        </div>
                                                        
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                <AlertTriangle size={12} className="text-red-500" /> Stat Orders
                                                            </h4>
                                                            <ul className="space-y-2">
                                                                {patientChart.statOrders.map((order, i) => (
                                                                    <li key={i} className="flex items-start gap-3 p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/30">
                                                                        <div className="mt-0.5 w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600"></div>
                                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{order}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Action Footer */}
                                    {!isSpinning && acceptStatus !== 'accepted' && (
                                        <button 
                                            onClick={handleAcceptCase}
                                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Stamp size={18} /> Accept Assignment
                                        </button>
                                    )}
                                    {acceptStatus === 'accepted' && (
                                        <div className="w-full bg-emerald-500 text-white py-5 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                            <CheckCircle2 size={18} /> Charting Task Created
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10 opacity-40 flex flex-col items-center">
                                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                    <FileText size={40} className="text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Awaiting New Admission</p>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center mt-8 pb-4">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleSpin(); }}
                            disabled={isSpinning || (selectedCase !== null && acceptStatus === 'idle')}
                            className={`px-12 py-5 rounded-full font-black text-xl tracking-wide shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 ${
                                isSpinning 
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/40 ring-4 ring-purple-500/20'
                            }`}
                        >
                            {isSpinning ? (
                                <><Loader2 size={24} className="animate-spin" /> SPINNING...</>
                            ) : selectedCase && acceptStatus === 'idle' ? (
                                'ACCEPT FIRST'
                            ) : (
                                'SPIN THE WHEEL'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- DOWNLOADS MODAL (IMPROVED VISUALS) --- */}
            {showDownloads && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowDownloads(false)}>
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-zoom-in relative flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1121] flex justify-between items-center relative overflow-hidden shrink-0">
                            {/* Background FX */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                            
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    <div className="p-2 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/30">
                                        <FileDown size={24} />
                                    </div>
                                    Official SLE Library
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 ml-1">
                                    Approved 2025 Study Materials & Guidelines
                                </p>
                            </div>
                            <button onClick={() => setShowDownloads(false)} className="relative z-10 p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content Grid */}
                        <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-black/20 flex-1">
                            {resourceLinks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                                    <Loader2 size={40} className="animate-spin text-blue-500" />
                                    <p className="font-bold">Fetching secure documents...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {resourceLinks.map((res, i) => {
                                        const visual = getResourceVisual(res.title);
                                        return (
                                            <a 
                                                key={i} 
                                                href={res.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="group relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden flex flex-col"
                                            >
                                                <div className={`absolute top-0 right-0 w-24 h-24 ${visual.color} opacity-10 rounded-bl-full group-hover:scale-150 transition-transform duration-500`}></div>
                                                
                                                <div className="flex items-start justify-between mb-6 relative z-10">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${visual.color} text-white shadow-lg shadow-${visual.color}/30`}>
                                                        <visual.icon size={28} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                                        PDF
                                                    </span>
                                                </div>
                                                
                                                <div className="relative z-10">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${visual.color.replace('bg-', 'text-')}`}>
                                                        {visual.label}
                                                    </span>
                                                    <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-blue-500 transition-colors">
                                                        {res.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                        Tap to access official document.
                                                    </p>
                                                </div>

                                                <div className="mt-6 flex items-center text-xs font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
                                                    Download / View <ChevronRight size={14} />
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- HISTORY LOG MODAL --- */}
            {showHistory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowHistory(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh] animate-zoom-in" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
                                    <ClipboardList size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Medical Archives</h3>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-slate-500">Capacity: {caseHistory.length} / 10</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500"><X size={20} /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50 dark:bg-slate-950">
                            {caseHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                                    <History size={48} className="mb-4" />
                                    <p>No saved cases yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {caseHistory.map((log) => {
                                        const Icon = getCaseIcon(log.caseType.id);
                                        return (
                                            <div 
                                                key={log.id} 
                                                onClick={() => setViewLog(log)}
                                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative group cursor-pointer hover:border-purple-300 dark:hover:border-purple-600"
                                            >
                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Maximize2 size={16} className="text-slate-400 hover:text-purple-500" />
                                                </div>

                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-xl ${getThemeColor(log.caseType.color)}`}>
                                                            <Icon size={18} />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-slate-800 dark:text-white block">{log.caseType.short}</span>
                                                            <span className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
                                                                <Calendar size={10} /> {new Date(log.timestamp).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4 text-xs">
                                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                                        <div className="font-bold text-slate-500 uppercase text-[10px] mb-1">Patient</div>
                                                        <div className="font-mono text-slate-800 dark:text-white font-bold text-sm">
                                                            {log.chart.initials} ({log.chart.ageSex})
                                                        </div>
                                                        <div className="text-slate-500 mt-1 truncate">{log.chart.diagnosis}</div>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                                        <div className="font-bold text-slate-500 uppercase text-[10px] mb-1">Vitals Snapshot</div>
                                                        <div className="font-mono text-slate-700 dark:text-slate-300 space-y-0.5">
                                                            <div>BP: {log.chart?.vitals?.bp || '--'}</div>
                                                            <div>HR: {log.chart?.vitals?.hr || '--'}</div>
                                                            <div>SpO2: {log.chart?.vitals?.spo2 || '--'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1 flex-1">
                                                        "{log.chart?.history}"
                                                    </p>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setCaseHistory(prev => prev.filter(c => c.id !== log.id)); }}
                                                        className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- DETAILED VIEW MODAL --- */}
            {viewLog && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={() => setViewLog(null)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-zoom-in" onClick={e => e.stopPropagation()}>
                        {/* Reuse the detailed view rendering logic from before */}
                        <div className={`p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center ${getThemeColor(viewLog.caseType.color)} bg-opacity-20 dark:bg-opacity-10`}>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-700 dark:text-white">
                                    <DetailedIcon size={24} /> 
                                </div>
                                <div>
                                    <h3 className="font-black text-xl leading-none text-slate-900 dark:text-white">{viewLog.caseType.short}</h3>
                                    <p className="text-xs font-bold uppercase opacity-70 mt-1">Archived: {new Date(viewLog.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setViewLog(null)} className="p-2 bg-white/50 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50 dark:bg-slate-950">
                            {/* Patient Info */}
                            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Patient</span>
                                    <span className="text-2xl font-mono font-black text-slate-900 dark:text-white">{viewLog.chart?.initials || 'UNK'}</span>
                                    <span className="text-sm font-bold text-slate-500 ml-2">{viewLog.chart?.ageSex || '--'}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Diagnosis</span>
                                    <span className="text-sm font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                        {viewLog.chart?.diagnosis || 'Pending'}
                                    </span>
                                </div>
                            </div>

                            {/* Vitals Grid */}
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                {[
                                    { l: 'BP', v: viewLog.chart?.vitals?.bp, c: 'text-slate-800 dark:text-white' },
                                    { l: 'HR', v: viewLog.chart?.vitals?.hr, c: parseInt(viewLog.chart?.vitals?.hr || '0') > 100 ? 'text-red-500' : 'text-slate-800 dark:text-white' },
                                    { l: 'RR', v: viewLog.chart?.vitals?.rr, c: 'text-slate-800 dark:text-white' },
                                    { l: 'Temp', v: viewLog.chart?.vitals?.temp, c: 'text-slate-800 dark:text-white' },
                                    { l: 'SpO2', v: (viewLog.chart?.vitals?.spo2 || '') + '%', c: parseInt(viewLog.chart?.vitals?.spo2 || '100') < 94 ? 'text-blue-500' : 'text-slate-800 dark:text-white' },
                                ].map((item, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">{item.l}</div>
                                        <div className={`font-mono font-bold text-lg ${item.c}`}>{item.v || '--'}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Clinical Notes */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Info size={12} /> Chief Complaint & History
                                    </h4>
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <p className="font-bold text-slate-800 dark:text-white mb-2">"{viewLog.chart?.chiefComplaint}"</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {viewLog.chart?.history}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <AlertTriangle size={12} className="text-red-500" /> Stat Orders
                                    </h4>
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                        {viewLog.chart?.statOrders?.map((order, i) => (
                                            <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-start gap-3">
                                                <div className="mt-1 w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0">
                                                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{order}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicalRoulette;
