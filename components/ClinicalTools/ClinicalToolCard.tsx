import React from "react";
import { ChevronDown, Calculator, StickyNote } from "lucide-react";
import { useTheme } from "../../ThemeContext";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    unit?: string;
    hasRightElement?: boolean;
    error?: boolean;
}

export const ToolInput: React.FC<InputProps> = ({ label, unit, hasRightElement, className, error, ...props }) => {
    return (
        <div className="relative group w-full">
            <div className={`
                absolute -top-2.5 left-3 px-2 py-0.5 z-10 rounded-md transition-all duration-200
                text-[9px] font-black uppercase tracking-widest
                bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/20
                ${error ? 'text-red-500 border-red-200' : 'text-slate-500 dark:text-slate-400 group-focus-within:text-pink-600 dark:group-focus-within:text-pink-400'}
            `}>
                {label}
            </div>
            
            <div className="relative">
                <input
                    {...props}
                    className={`
                        w-full px-4 py-4 rounded-2xl outline-none font-bold text-slate-800 dark:text-white
                        bg-slate-100 dark:bg-slate-900/60 border-2 transition-all duration-200
                        placeholder:text-slate-400 dark:placeholder:text-slate-600
                        ${error 
                            ? 'border-red-500 focus:ring-4 focus:ring-red-500/10' 
                            : 'border-transparent focus:border-pink-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-pink-500/10'
                        }
                        ${hasRightElement ? 'rounded-r-none border-r-0' : ''}
                        ${className}
                    `}
                />
                {unit && !hasRightElement && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-black uppercase tracking-wider text-slate-400 bg-transparent pl-2">
                        {unit}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ToolSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, containerClassName?: string }> = ({ label, children, containerClassName, ...props }) => {
    return (
        <div className={`relative group w-full ${containerClassName}`}>
            {label && (
                <div className="absolute -top-2.5 left-3 px-2 py-0.5 z-10 rounded-md bg-white dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-pink-600 dark:group-focus-within:text-pink-400 shadow-sm border border-slate-100 dark:border-white/20 transition-colors">
                    {label}
                </div>
            )}
            <div className="relative h-full">
                <select
                    {...props}
                    className={`
                        w-full h-full px-4 py-4 rounded-2xl outline-none font-bold appearance-none cursor-pointer
                        bg-slate-100 dark:bg-slate-900/60 border-2 border-transparent
                        text-slate-800 dark:text-white
                        focus:border-pink-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-pink-500/10 transition-all duration-200
                        ${props.className}
                    `}
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={16} />
            </div>
        </div>
    );
};

interface ClinicalToolCardProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    badge?: string;
    children: React.ReactNode;
    result?: React.ReactNode;
    rightAction?: React.ReactNode;
}

export const ClinicalToolCard: React.FC<ClinicalToolCardProps> = ({ 
    title, subtitle, icon, badge, children, result, rightAction 
}) => {
    return (
        <div className={`
            relative flex flex-col h-full rounded-[2.5rem]
            transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl group
            bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10
            overflow-hidden backdrop-blur-md
        `}>
            <div className="relative z-10 flex flex-col h-full p-6 sm:p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className={`
                            w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0
                            bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400
                            border border-pink-100 dark:border-white/10
                            group-hover:scale-110 transition-transform duration-300 mt-1
                        `}>
                            {icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight break-words">
                                {title}
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5 break-words line-clamp-2 leading-relaxed">
                                {subtitle}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 self-start">
                        {badge && (
                            <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                {badge}
                            </span>
                        )}
                        {rightAction}
                    </div>
                </div>

                {/* Input Area */}
                <div className="flex-1 flex flex-col gap-6">
                    {children}
                </div>

                {/* Result Area */}
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/10 border-dashed">
                    {result ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            {result}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-24 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/10">
                            <div className="flex flex-col items-center gap-2 opacity-30">
                                <Calculator size={20} className="text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Await Data</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ResultDisplay: React.FC<{
    label: string;
    value: string;
    subValues?: { label: string, value: string }[];
    equation?: string;
    notes?: string[];
}> = ({ label, value, subValues, equation, notes }) => {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between p-6 rounded-1.5rem] bg-pink-500/5 dark:bg-pink-500/10 border border-pink-500/20 gap-3">
                <div>
                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 mb-1">
                        {label}
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter break-all">
                        {value}
                    </span>
                </div>
                <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-pink-500 items-center justify-center text-white shadow-xl shadow-pink-500/20 shrink-0">
                    <StickyNote size={24} />
                </div>
            </div>

            {subValues && subValues.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    {subValues.map((sv, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{sv.label}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{sv.value}</span>
                        </div>
                    ))}
                </div>
            )}

            {equation && (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 opacity-60">
                        <Calculator size={10} /> Calculation Logic
                    </div>
                    <code className="text-[11px] font-mono text-slate-500 dark:text-slate-400 break-all leading-relaxed">
                        {equation}
                    </code>
                </div>
            )}
        </div>
    );
};