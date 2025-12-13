
import React, { useState, useEffect, useMemo } from 'react';
import { SLE_QUESTIONS } from '../data/sleQuestions';
import { 
    CheckCircle2, XCircle, Trophy, ArrowRight, 
    Lock, Star, RefreshCw, ClipboardCheck, Radio, 
    FileClock, Signal, Activity, AlertOctagon, HelpCircle, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizModuleProps {
    onComplete: (score: number) => void;
    startLevel: number;
    dailyCompleted: boolean;
}

const QuizModule: React.FC<QuizModuleProps> = ({ onComplete, startLevel, dailyCompleted }) => {
    const [currentLevel, setCurrentLevel] = useState(startLevel);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [levelFinished, setLevelFinished] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [practiceMode, setPracticeMode] = useState(dailyCompleted);

    // Update level if props change (e.g. firebase sync)
    useEffect(() => {
        if (!hasStarted) {
            setCurrentLevel(startLevel);
            setPracticeMode(dailyCompleted);
        }
    }, [startLevel, dailyCompleted, hasStarted]);
    
    // Get questions for current level (Randomized order or standard)
    const levelQuestions = useMemo(() => {
        return SLE_QUESTIONS.filter(q => q.level === currentLevel).slice(0, 10);
    }, [currentLevel]);

    const maxLevels = 7;

    const handleAnswer = (index: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
        
        const question = levelQuestions[currentQIndex];
        if (index === question.correctAnswer) {
            setScore(prev => prev + 1);
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, colors: ['#10b981'] });
        }
        setShowExplanation(true);
    };

    const handleNext = () => {
        if (currentQIndex < levelQuestions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            setLevelFinished(true);
            // Only trigger onComplete logic if NOT already completed today, or just for fun feedback
            if (!practiceMode) {
                onComplete(score);
            }
            if (score >= 7) {
                confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
            }
        }
    };

    const retryLevel = () => {
        setScore(0);
        setCurrentQIndex(0);
        setLevelFinished(false);
        setSelectedOption(null);
        setShowExplanation(false);
        setHasStarted(false);
        setPracticeMode(true); // Retry is always practice
    };

    // --- 1. LEVEL SELECTOR / WAITING SCREEN ---
    if (!hasStarted && !levelFinished) {
        if (levelQuestions.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 opacity-60">
                    <Lock size={48} className="text-slate-400 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Level {currentLevel} Locked</h3>
                    <p className="text-sm">Content pending curriculum update.</p>
                </div>
            );
        }

        return (
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 md:p-12 min-h-[450px] flex flex-col items-center justify-center text-center animate-in fade-in duration-500 group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="relative z-10 max-w-xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest mb-6 shadow-sm">
                        <Radio size={14} className="animate-pulse" /> Incoming Transmission
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-none">
                        SHIFT <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">ENDORSEMENT</span>
                    </h2>
                    
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl mb-8 transform transition-transform hover:scale-[1.02]">
                        <div className="flex items-start gap-4 text-left">
                            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400">
                                <ClipboardCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white text-lg">Level {currentLevel} Briefing</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                                    You are about to receive report on <strong className="text-emerald-600 dark:text-emerald-400">{levelQuestions.length} High-Yield Cases</strong>. 
                                    Score 70% or higher to clear the shift.
                                </p>
                                {practiceMode && (
                                    <div className="mt-2 text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                                        <AlertOctagon size={12} /> Practice Mode (Daily XP Claimed)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setHasStarted(true)}
                        className="group relative px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                        <span className="relative flex items-center gap-3">
                            Receive Endorsement <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </div>
            </div>
        );
    }

    // --- 2. FINISHED SCREEN ---
    if (levelFinished) {
        const passed = score >= 7;
        return (
            <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center animate-in zoom-in duration-300 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
                {/* Ambient Glow */}
                <div className={`absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br ${passed ? 'from-emerald-500/30 to-teal-500/30' : 'from-red-500/30 to-orange-500/30'}`}></div>
                
                <div className={`relative z-10 w-28 h-28 rounded-3xl flex items-center justify-center mb-6 shadow-2xl transform rotate-3 ${passed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {passed ? <Trophy size={48} /> : <AlertOctagon size={48} />}
                </div>
                
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                    {passed ? "SHIFT COMPLETE" : "INCIDENT REPORT"}
                </h3>
                
                <div className="inline-block bg-slate-100 dark:bg-slate-800 px-6 py-2 rounded-xl mb-8">
                    <p className="text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-sm">
                        Score: <span className={`text-lg ${passed ? 'text-emerald-500' : 'text-red-500'}`}>{score} / {levelQuestions.length}</span>
                    </p>
                </div>
                
                <div className="flex flex-col gap-3 w-full max-w-xs relative z-10">
                    {passed && !practiceMode ? (
                        <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold border border-emerald-200 dark:border-emerald-500/30">
                            <Star size={24} className="mx-auto mb-2 animate-bounce" fill="currentColor" />
                            LEVEL CLEARED! XP AWARDED.
                        </div>
                    ) : passed && practiceMode ? (
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold border border-slate-200 dark:border-slate-700">
                            Good practice. Come back tomorrow for XP.
                        </div>
                    ) : (
                        <button 
                            onClick={retryLevel}
                            className="px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} /> Retry Level
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const currentQ = levelQuestions[currentQIndex];

    // --- 3. MAIN QUIZ UI ---
    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* HERO HEADER (Command Center) - Fixed Light/Dark Mode */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-900/50 dark:to-teal-900/50 pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 backdrop-blur-md rounded-2xl flex items-center justify-center border border-slate-100 dark:border-white/10 shadow-sm text-emerald-500 dark:text-emerald-400">
                        <FileClock size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Shift Report</h2>
                            <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded uppercase tracking-wider shadow-sm">Live</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                            Level {currentLevel} Clearance
                        </p>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="relative z-10 mt-4 md:mt-0 w-full md:w-auto">
                    <div className="flex items-center justify-between md:justify-end gap-4 mb-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Signal size={10} className="text-emerald-500" /> Signal Strength</span>
                        <span>{Math.round(((currentQIndex + 1) / levelQuestions.length) * 100)}%</span>
                    </div>
                    <div className="flex gap-1 md:w-64">
                        {levelQuestions.map((_, i) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                i < currentQIndex ? 'bg-emerald-500' : i === currentQIndex ? 'bg-slate-400 dark:bg-white animate-pulse' : 'bg-slate-200 dark:bg-white/10'
                            }`} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* QUESTION CARD (Patient File Style) */}
                <div className="flex-1">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-lg border border-slate-200 dark:border-slate-700 relative overflow-hidden group min-h-[320px] flex flex-col">
                        {/* Card Top Strip */}
                        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 w-full"></div>
                        
                        <div className="p-6 md:p-8 flex-1 flex flex-col">
                            {/* Meta Data */}
                            <div className="flex items-center justify-between mb-6">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-600">
                                    <Activity size={12} className="text-purple-500" /> {currentQ.category}
                                </span>
                                <span className="text-slate-300 dark:text-slate-600 font-mono text-xs">ID: #{currentQ.id}</span>
                            </div>

                            {/* The Question */}
                            <h3 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white leading-relaxed mb-8">
                                {currentQ.question}
                            </h3>

                            {/* Decorative Elements */}
                            <div className="mt-auto flex items-center gap-4 opacity-30 pointer-events-none">
                                <div className="h-8 w-24 bg-current rounded-sm text-slate-200 dark:text-slate-600" style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}></div>
                                <div className="h-1 w-full bg-current rounded-full text-slate-200 dark:text-slate-600"></div>
                            </div>
                        </div>
                    </div>

                    {/* RATIONALE SLIDE-UP */}
                    <div className={`mt-4 transition-all duration-500 ease-out transform ${showExplanation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute w-full'}`}>
                        <div className="bg-blue-50/80 dark:bg-blue-900/20 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-500/20 backdrop-blur-md relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <div className="flex gap-4 relative z-10">
                                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl h-fit text-blue-600 dark:text-blue-400">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <span className="font-black text-blue-600 dark:text-blue-400 uppercase text-xs tracking-widest block mb-2">Preceptor's Note</span>
                                    <p className="text-sm md:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{currentQ.rationale}</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={handleNext}
                            className="w-full mt-4 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 group"
                        >
                            Next Case <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* OPTIONS LIST (Interactive) */}
                <div className="w-full lg:w-1/3 flex flex-col gap-3">
                    {currentQ.options.map((option, idx) => {
                        let btnClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg";
                        let icon = <span className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:border-purple-400 group-hover:text-purple-500 transition-colors">{String.fromCharCode(65 + idx)}</span>;
                        
                        if (selectedOption !== null) {
                            if (idx === currentQ.correctAnswer) {
                                // CORRECT
                                btnClass = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-md ring-1 ring-emerald-500";
                                icon = <CheckCircle2 size={24} className="text-emerald-500 fill-emerald-100 dark:fill-emerald-900" />;
                            } else if (idx === selectedOption) {
                                // WRONG
                                btnClass = "bg-red-50 dark:bg-red-500/10 border-red-500 text-red-800 dark:text-red-300 font-bold opacity-100 ring-1 ring-red-500";
                                icon = <XCircle size={24} className="text-red-500 fill-red-100 dark:fill-red-900" />;
                            } else {
                                // DIMMED
                                btnClass = "opacity-50 grayscale bg-slate-50 dark:bg-slate-900 border-transparent cursor-not-allowed";
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={selectedOption !== null}
                                className={`w-full p-4 md:p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between group transform active:scale-98 ${btnClass}`}
                            >
                                <span className="text-sm font-medium leading-snug pr-4">{option}</span>
                                <div className="shrink-0">
                                    {icon}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QuizModule;
