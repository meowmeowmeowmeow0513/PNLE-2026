
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Target, ClipboardCheck, GripHorizontal, CheckCircle2, AlertCircle, BookOpen, ChevronRight, BarChart3, GripVertical } from 'lucide-react';
import { EXAM_BLUEPRINTS, CompetencyData, CompetencyStatus } from '../data/examBlueprints';

interface CompetencyAuditModalProps {
    onClose: () => void;
    data: CompetencyData;
    onUpdate: (id: string, status: CompetencyStatus) => void;
}

const CompetencyAuditModal: React.FC<CompetencyAuditModalProps> = ({ onClose, data, onUpdate }) => {
    const [activeTab, setActiveTab] = useState(0); // Index of EXAM_BLUEPRINTS
    const activeExam = EXAM_BLUEPRINTS[activeTab];

    // Calculate completion for the active tab
    const tabStats = useMemo(() => {
        let total = 0;
        let mastered = 0;
        let review = 0;
        let gaps = 0;

        activeExam.competencies.forEach(c => {
            c.topics.forEach(t => {
                const id = `${activeExam.id}-${t.name}`; // Simple ID generation
                const status = data[id] || 'none';
                total++;
                if (status === 'mastered') mastered++;
                else if (status === 'review') review++;
                else gaps++;
            });
        });

        return { total, mastered, review, gaps, percentage: total === 0 ? 0 : Math.round((mastered / total) * 100) };
    }, [activeExam, data]);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 animate-fade-in bg-slate-900/90 backdrop-blur-md">
            <div className="bg-white dark:bg-[#0f172a] w-full h-full md:h-[90vh] md:max-w-5xl md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative animate-zoom-in border border-slate-200 dark:border-white/5">
                
                {/* 1. Header (Command Center Style - Adaptive) */}
                <div className="relative bg-white dark:bg-black p-6 md:p-8 shrink-0 overflow-hidden border-b border-slate-200 dark:border-white/5">
                    {/* Abstract Background FX */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 backdrop-blur-sm flex items-center gap-1.5">
                                    <GripHorizontal size={12} /> Audit Mode
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">
                                Competency <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-500">Tracker</span>
                            </h2>
                            <p className="text-slate-500 dark:text-white/60 text-xs md:text-sm font-medium mt-1">Self-assess against the PRC Blueprint specifications.</p>
                        </div>
                        
                        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-full text-slate-500 dark:text-white transition-colors backdrop-blur-md">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Stats Dashboard Grid - Adaptive */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-8">
                        <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-slate-100 dark:border-white/10 flex flex-col items-center justify-center group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-none">{tabStats.mastered}</span>
                            <span className="text-[9px] md:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-1 flex items-center gap-1"><CheckCircle2 size={10} /> Mastered</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-slate-100 dark:border-white/10 flex flex-col items-center justify-center group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-none">{tabStats.review}</span>
                            <span className="text-[9px] md:text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mt-1 flex items-center gap-1"><BookOpen size={10} /> Reviewing</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-slate-100 dark:border-white/10 flex flex-col items-center justify-center relative overflow-hidden group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            {tabStats.gaps > 0 && <div className="absolute inset-0 bg-red-500/5 dark:bg-red-500/10 animate-pulse"></div>}
                            <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-none relative z-10">{tabStats.gaps}</span>
                            <span className="text-[9px] md:text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mt-1 relative z-10 flex items-center gap-1"><AlertCircle size={10} /> Gaps</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-slate-100 dark:border-white/10 flex flex-col items-center justify-center group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-slate-200 dark:text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className="text-emerald-500 transition-all duration-1000 ease-out" strokeDasharray={`${tabStats.percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                </svg>
                                <span className="absolute text-[9px] md:text-[10px] font-bold text-slate-900 dark:text-white">{tabStats.percentage}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Navigation Tabs (Pill Style) */}
                <div className="bg-slate-100 dark:bg-black/40 p-2 md:px-6 md:py-3 border-b border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar shrink-0">
                    <div className="flex gap-2 min-w-max">
                        {EXAM_BLUEPRINTS.map((exam, idx) => (
                            <button
                                key={exam.id}
                                onClick={() => setActiveTab(idx)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    activeTab === idx 
                                    ? `bg-${exam.color}-500 text-white shadow-lg shadow-${exam.color}-500/30 scale-105` 
                                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700'
                                }`}
                            >
                                {exam.code}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. The List (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-10 bg-slate-50 dark:bg-[#0B1121]">
                    {/* Competency Areas */}
                    {activeExam.competencies.map((comp, cIdx) => (
                        <div key={cIdx} className="space-y-4">
                            {/* Section Header */}
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <div className={`p-1.5 rounded bg-${activeExam.color}-100 dark:bg-${activeExam.color}-500/20 text-${activeExam.color}-600 dark:text-${activeExam.color}-400`}>
                                    <Target size={16} />
                                </div>
                                <h3 className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-widest">
                                    {comp.title}
                                </h3>
                            </div>
                            
                            {/* Topics Grid/List */}
                            <div className="grid grid-cols-1 gap-4">
                                {comp.topics.map((topic, tIdx) => {
                                    const id = `${activeExam.id}-${topic.name}`;
                                    const status = data[id] || 'none';

                                    return (
                                        <div key={tIdx} className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm transition-all duration-300 group ${
                                            status === 'mastered' ? 'border-emerald-500/30 dark:border-emerald-500/20' : 
                                            status === 'review' ? 'border-amber-500/30 dark:border-amber-500/20' :
                                            'border-slate-200 dark:border-slate-800 hover:shadow-md'
                                        }`}>
                                            <div className="flex flex-col lg:flex-row gap-5 justify-between">
                                                
                                                {/* Content Side */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-slate-800 dark:text-white text-base leading-tight mb-2 flex items-center gap-2">
                                                            {topic.name}
                                                            {status === 'mastered' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                                        </h4>
                                                    </div>
                                                    
                                                    {/* SUBTOPICS PREVIEW (Pill Tags - Addictive Visuals) */}
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {topic.subtopics.map((sub, sIdx) => (
                                                            <span key={sIdx} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-default">
                                                                {sub}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Action Side (Segmented Control - Improved Responsiveness) */}
                                                <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl shrink-0 self-start lg:self-center w-full lg:w-auto mt-2 lg:mt-0 shadow-inner">
                                                    <button 
                                                        onClick={() => onUpdate(id, 'none')}
                                                        className={`flex-1 lg:flex-none px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                                            status === 'none' 
                                                            ? 'bg-white dark:bg-slate-800 text-red-500 shadow-sm ring-1 ring-red-500/20 scale-105' 
                                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                        }`}
                                                    >
                                                        <AlertCircle size={12} className={status === 'none' ? 'animate-pulse' : ''} /> Gap
                                                    </button>
                                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                                                    <button 
                                                        onClick={() => onUpdate(id, 'review')}
                                                        className={`flex-1 lg:flex-none px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                                            status === 'review' 
                                                            ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-sm ring-1 ring-amber-500/20 scale-105' 
                                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                        }`}
                                                    >
                                                        <BookOpen size={12} /> Review
                                                    </button>
                                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                                                    <button 
                                                        onClick={() => onUpdate(id, 'mastered')}
                                                        className={`flex-1 lg:flex-none px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                                            status === 'mastered' 
                                                            ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm ring-1 ring-emerald-500/20 scale-105' 
                                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                        }`}
                                                    >
                                                        <CheckCircle2 size={12} /> Mastered
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CompetencyAuditModal;
