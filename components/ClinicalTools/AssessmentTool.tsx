
import React, { useState, useEffect, useRef } from 'react';
import { AssessmentToolDef } from '../../data/assessmentData';
import { RefreshCw, Calculator, Info, Check } from 'lucide-react';
import { useTheme } from '../../ThemeContext';

interface AssessmentToolProps {
    tool: AssessmentToolDef;
}

const AssessmentTool: React.FC<AssessmentToolProps> = ({ tool }) => {
    const { accentColor } = useTheme(); // Only need accentColor for selection
    
    const [scores, setScores] = useState<Record<string, number>>({});
    const [totalScore, setTotalScore] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Reset when tool changes
    useEffect(() => {
        setScores({});
        setTotalScore(0);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [tool.id]);

    // Calculate Total
    useEffect(() => {
        const total = Object.values(scores).reduce((acc: number, curr: number) => acc + curr, 0);
        setTotalScore(total);
    }, [scores]);

    const handleSelect = (questionId: string, score: number) => {
        setScores(prev => ({ ...prev, [questionId]: score }));
    };

    const resetTool = () => {
        setScores({});
        setTotalScore(0);
    };

    const interpretation = tool.getInterpretation(totalScore);

    // --- 1. THEME CONTEXT (Strictly for Selected Options) ---
    const getOptionStyle = (isSelected: boolean) => {
        if (!isSelected) return {};
        return {
            backgroundColor: accentColor, // The User's Theme Color
            borderColor: accentColor,
            color: '#ffffff',
            boxShadow: `0 4px 12px ${accentColor}40`
        };
    };

    // --- 2. SEMANTIC COLORS (Strictly for Interpretation) ---
    // These ignore the theme color. Red is Red, Green is Green.
    const getResultColorClasses = (color: string) => {
        switch(color) {
            case 'red': return 'bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800';
            case 'orange': return 'bg-orange-50 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 border-orange-200 dark:border-orange-800';
            case 'green': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800';
            case 'blue': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800';
            default: return 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700';
        }
    };

    return (
        <div className="flex flex-col h-full w-full overflow-hidden relative">
            
            {/* MAIN CONTENT AREA
                Logic: Mobile Portrait = Stacked. Mobile Landscape = Split View (Questions Left, Result Right)
            */}
            <div className="flex-1 flex flex-col landscape:flex-row md:landscape:flex-col overflow-hidden">
                
                {/* --- QUESTIONS SECTION (Scrollable) --- */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto custom-scrollbar p-[clamp(1rem,3vw,2rem)] landscape:w-1/2 md:landscape:w-full"
                >
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={resetTool}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <RefreshCw size={12} /> Reset
                        </button>
                    </div>

                    <div className="space-y-8 pb-8">
                        {tool.questions.map((q) => (
                            <div key={q.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Dynamic Padding & Text Wrapping */}
                                <div className="flex flex-wrap justify-between items-end mb-3 gap-2">
                                    <h4 className="font-black text-sm uppercase tracking-wide text-slate-700 dark:text-slate-200 leading-relaxed max-w-full break-words">
                                        {q.title}
                                    </h4>
                                    {scores[q.id] !== undefined && (
                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            +{scores[q.id]}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Fluid Grid for Options */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {q.options.map((opt, idx) => {
                                        const isSelected = scores[q.id] === opt.score;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelect(q.id, opt.score)}
                                                style={getOptionStyle(isSelected)}
                                                className={`
                                                    relative group flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200
                                                    h-auto min-h-[4rem] w-full break-words
                                                    ${!isSelected 
                                                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600' 
                                                        : 'z-10 translate-y-[-2px]'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-start justify-between w-full gap-2">
                                                    <span className="text-sm font-medium leading-snug flex-1 break-words">
                                                        {opt.label}
                                                    </span>
                                                    {isSelected && <Check size={16} className="shrink-0 text-white" />}
                                                </div>
                                                <span className={`absolute top-2 right-2 text-[10px] font-black opacity-40`}>
                                                    {opt.score}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- INTERPRETATION SECTION (Fixed Footer on Portrait, Side Panel on Landscape) --- */}
                <div className="
                    flex-none z-50 
                    border-t landscape:border-t-0 landscape:border-l md:landscape:border-t md:landscape:border-l-0
                    border-slate-200 dark:border-slate-700 
                    bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl 
                    shadow-[0_-5px_30px_rgba(0,0,0,0.08)]
                    landscape:w-1/2 md:landscape:w-full
                ">
                    {/* Max Height Safety Valve: Ensures footer never grows larger than 40% of screen height */}
                    <div className="max-h-[35vh] landscape:max-h-full landscape:h-full overflow-y-auto custom-scrollbar p-[clamp(1rem,3vw,2rem)]">
                        <div className={`
                            relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 
                            flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between
                            ${getResultColorClasses(interpretation.color)}
                        `}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 opacity-70">
                                    <Calculator size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Assessment Result</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black leading-tight break-words">
                                    {interpretation.label}
                                </h3>
                                {interpretation.notes && (
                                    <div className="mt-3 text-xs font-medium leading-relaxed opacity-90 p-3 rounded-lg bg-black/5 dark:bg-white/5 break-words">
                                        <div className="flex gap-2">
                                            <Info size={14} className="shrink-0 mt-0.5" />
                                            <span>{interpretation.notes}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-current border-opacity-20">
                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Total Score</span>
                                <span className="text-4xl font-black leading-none tracking-tighter" style={{ color: accentColor }}>
                                    {totalScore}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AssessmentTool;
