
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowDown, ArrowUp, AlertTriangle, Stethoscope, Activity, FileText } from 'lucide-react';
import { ReferenceValue, AbnormalityDetail } from '../../data/referenceData';
import { useTheme } from '../../ThemeContext';

interface LabDetailModalProps {
    item: ReferenceValue;
    onClose: () => void;
}

const DetailSection: React.FC<{ detail: AbnormalityDetail, type: 'low' | 'high' }> = ({ detail, type }) => {
    const isLow = type === 'low';
    const colorClass = isLow ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400';
    const bgClass = isLow ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    const icon = isLow ? <ArrowDown size={20} /> : <ArrowUp size={20} />;

    return (
        <div className={`p-5 rounded-2xl border ${bgClass} space-y-4`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm ${colorClass}`}>
                    {icon}
                </div>
                <div>
                    <h4 className={`text-lg font-black ${colorClass}`}>{detail.title}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        {isLow ? 'Deficiency' : 'Excess'}
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        <Activity size={12} /> Signs & Symptoms
                    </h5>
                    <ul className="grid grid-cols-1 gap-1.5">
                        {detail.symptoms.map((s, i) => (
                            <li key={i} className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-start gap-2">
                                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isLow ? 'bg-blue-400' : 'bg-red-400'}`}></span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        <AlertTriangle size={12} /> Causes
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {detail.causes.join(', ')}
                    </p>
                </div>

                <div>
                    <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        <Stethoscope size={12} /> Nursing Interventions
                    </h5>
                    <ul className="space-y-1.5">
                        {detail.interventions.map((int, i) => (
                            <li key={i} className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-black/20 px-3 py-2 rounded-lg border border-black/5 dark:border-white/5">
                                {int}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const LabDetailModal: React.FC<LabDetailModalProps> = ({ item, onClose }) => {
    const { themeMode } = useTheme();
    const isCrescere = themeMode === 'crescere';
    const [tab, setTab] = useState<'low' | 'high'>('low'); // Only used on mobile if we want tabs, but side-by-side on desktop

    if (!item.abnormalities) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
            
            <div 
                className={`
                    relative w-full h-[100dvh] md:h-[85vh] md:max-w-5xl 
                    bg-white dark:bg-[#0f172a] 
                    rounded-none md:rounded-[2.5rem] 
                    shadow-2xl overflow-hidden flex flex-col 
                    animate-slide-up-mobile md:animate-zoom-in
                `}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`
                    p-6 md:p-8 flex justify-between items-center shrink-0 border-b border-slate-100 dark:border-slate-800
                    ${isCrescere ? 'bg-rose-50/50' : 'bg-slate-50/50 dark:bg-slate-900'}
                `}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isCrescere ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-none">
                                {item.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-sm font-mono font-bold text-slate-500 dark:text-slate-400">
                                    Normal: <span className="text-slate-800 dark:text-white">{item.range} {item.unit}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    {/* Mobile Tabs */}
                    <div className="flex md:hidden mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <button 
                            onClick={() => setTab('low')}
                            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${tab === 'low' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'}`}
                        >
                            Low Levels
                        </button>
                        <button 
                            onClick={() => setTab('high')}
                            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${tab === 'high' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500'}`}
                        >
                            High Levels
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mobile: Show active tab. Desktop: Show both. */}
                        <div className={`${tab === 'low' ? 'block' : 'hidden'} md:block`}>
                            {item.abnormalities.low ? (
                                <DetailSection detail={item.abnormalities.low} type="low" />
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-sm italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center h-full">
                                    <span className="mb-2 text-2xl">🤷‍♂️</span>
                                    No specific clinical notes for low levels.
                                </div>
                            )}
                        </div>

                        <div className={`${tab === 'high' ? 'block' : 'hidden'} md:block`}>
                            {item.abnormalities.high ? (
                                <DetailSection detail={item.abnormalities.high} type="high" />
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-sm italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center h-full">
                                    <span className="mb-2 text-2xl">🤷‍♂️</span>
                                    No specific clinical notes for high levels.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LabDetailModal;
