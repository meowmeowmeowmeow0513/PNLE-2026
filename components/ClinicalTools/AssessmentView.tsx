import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Brain, Baby, Activity, AlertTriangle, Smile, ChevronRight } from 'lucide-react';
import { useTheme } from '../../ThemeContext';
import { ASSESSMENT_TOOLS, AssessmentToolDef } from '../../data/assessmentData';
import AssessmentTool from './AssessmentTool';

// [Keep your existing Icon/Color helpers here...]
const getIcon = (name: string, className?: string) => {
    switch (name) {
        case 'brain': return <Brain className={className} />;
        case 'baby': return <Baby className={className} />;
        case 'activity': return <Activity className={className} />;
        case 'alert': return <AlertTriangle className={className} />;
        case 'smile': return <Smile className={className} />;
        default: return <Activity className={className} />;
    }
};

const getColorClasses = (color: string) => {
    const map: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/30',
        pink: 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 group-hover:bg-pink-200 dark:group-hover:bg-pink-500/30',
        emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/30',
        orange: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 group-hover:bg-orange-200 dark:group-hover:bg-orange-500/30',
        violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 group-hover:bg-violet-200 dark:group-hover:bg-violet-500/30',
    };
    return map[color] || map.blue;
};

const AssessmentView: React.FC = () => {
    const { themeMode } = useTheme();
    const isCrescere = themeMode === 'crescere';
    const [search, setSearch] = useState('');
    const [selectedTool, setSelectedTool] = useState<AssessmentToolDef | null>(null);

    // Lock body scroll logic
    useEffect(() => {
        if (selectedTool) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedTool]);

    const filteredTools = useMemo(() => {
        return ASSESSMENT_TOOLS.filter(t => 
            t.title.toLowerCase().includes(search.toLowerCase()) || 
            t.subtitle.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    return (
        <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto">
            
            {/* SEARCH BAR (Adaptive width) */}
            <div className={`relative group w-full max-w-xl mx-auto md:mx-0 z-10 transition-all`}>
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isCrescere ? 'text-pink-400' : 'text-slate-400 dark:text-slate-500'}`} size={20} />
                <input 
                    type="text" 
                    placeholder="Search tools..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none font-bold shadow-sm transition-all focus:ring-4 ${
                        isCrescere 
                        ? 'bg-white border-pink-100 focus:border-pink-400 focus:ring-pink-500/10 placeholder:text-pink-300' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/10'
                    }`}
                />
            </div>

            {/* TOOLS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setSelectedTool(tool)}
                        className={`group relative flex flex-col p-6 rounded-[2rem] border text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden ${
                            isCrescere 
                            ? 'bg-white/80 border-pink-100 hover:border-pink-300' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                    >
                        <div className="flex items-start justify-between mb-4 w-full">
                            <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${getColorClasses(tool.color)}`}>
                                {getIcon(tool.iconName, "w-6 h-6")}
                            </div>
                            <ChevronRight size={20} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                        </div>
                        <h3 className={`text-lg font-black leading-tight mb-1 ${isCrescere ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>
                            {tool.title}
                        </h3>
                        <p className={`text-sm font-medium ${isCrescere ? 'text-pink-400/80' : 'text-slate-500 dark:text-slate-400'}`}>
                            {tool.subtitle}
                        </p>
                    </button>
                ))}
            </div>

            {/* === RESPONSIVE MODAL === */}
            {selectedTool && createPortal(
                <div 
                    className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center animate-in fade-in duration-200"
                    onClick={() => setSelectedTool(null)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

                    {/* CONTAINER LAYOUT RULES:
                        1. Mobile: inset-0 (Fullscreen), h-[100dvh] (Viewport Safe), rounded-none.
                        2. PC/Tablet (md): relative, max-w-3xl, h-[85vh], rounded-3xl.
                    */}
                    <div 
                        className={`
                            relative flex flex-col overflow-hidden bg-white dark:bg-slate-900 shadow-2xl
                            w-full h-[100dvh] rounded-none 
                            md:w-[90vw] md:max-w-3xl md:h-[85vh] md:rounded-[2rem] md:border md:border-slate-200 md:dark:border-slate-800
                            animate-in slide-in-from-bottom-5 duration-300
                        `}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10">
                            <div className="flex items-center gap-3">
                                <div className={`hidden sm:flex p-2 rounded-lg ${getColorClasses(selectedTool.color)}`}>
                                    {getIcon(selectedTool.iconName, "w-5 h-5")}
                                </div>
                                <div>
                                    <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-none">
                                        {selectedTool.title}
                                    </h2>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                                        Assessment
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedTool(null)}
                                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Body */}
                        <AssessmentTool tool={selectedTool} />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AssessmentView;