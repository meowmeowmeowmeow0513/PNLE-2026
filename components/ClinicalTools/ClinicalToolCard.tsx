
import React from "react";
import { ChevronDown, Calculator, StickyNote } from "lucide-react";
import { useTheme } from "../../ThemeContext";

// --- Reusable Input Component ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    unit?: string;
    hasRightElement?: boolean;
    error?: boolean;
}

export const ToolInput: React.FC<InputProps> = ({ label, unit, hasRightElement, className, error, ...props }) => {
    return (
        <div className="relative group w-full">
            {/* Floating Label */}
            <div className={`
                absolute -top-2.5 left-3 px-2 py-0.5 z-10 rounded-md transition-all duration-200
                text-[10px] font-bold uppercase tracking-wider
                bg-white dark:bg-[#1e293b] shadow-sm border border-slate-100 dark:border-slate-700
                ${error ? 'text-red-500 border-red-200' : 'text-slate-500 group-focus-within:text-pink-600 dark:group-focus-within:text-pink-400 group-focus-within:border-pink-200 dark:group-focus-within:border-pink-500/30'}
            `}>
                {label}
            </div>
            
            {/* Input Box */}
            <div className="relative">
                <input
                    {...props}
                    className={`
                        w-full px-4 py-4 rounded-2xl outline-none font-bold text-slate-800 dark:text-white
                        bg-slate-100 dark:bg-slate-800/80 border-2 transition-all duration-200
                        placeholder:text-slate-400 dark:placeholder:text-slate-600
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${error 
                            ? 'border-red-500 focus:ring-4 focus:ring-red-500/10' 
                            : 'border-transparent focus:border-pink-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-pink-500/10'
                        }
                        ${hasRightElement ? 'rounded-r-none border-r-0' : ''}
                        ${className}
                    `}
                    onKeyDown={(e) => {
                        // Prevent 'e' in number inputs for cleaner UX
                        if (props.type === 'number' && ['e', 'E'].includes(e.key)) {
                            e.preventDefault();
                        }
                    }}
                />
                {unit && !hasRightElement && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800/80 pl-2">
                        {unit}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Reusable Select Component ---
export const ToolSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, containerClassName?: string }> = ({ label, children, containerClassName, ...props }) => {
    return (
        <div className={`relative group w-full ${containerClassName}`}>
            {label && (
                <div className="absolute -top-2.5 left-3 px-2 py-0.5 z-10 rounded-md bg-white dark:bg-[#1e293b] text-[10px] font-bold uppercase tracking-wider text-slate-500 group-focus-within:text-pink-600 dark:group-focus-within:text-pink-400 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                    {label}
                </div>
            )}
            <div className="relative h-full">
                <select
                    {...props}
                    className={`
                        w-full h-full px-4 py-4 rounded-2xl outline-none font-bold appearance-none cursor-pointer
                        bg-slate-100 dark:bg-slate-800/80 border-2 border-transparent
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

// --- Main Card Frame ---
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
            transition-all duration-500 hover:-translate-y-1 hover:shadow-xl group
            bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
            overflow-hidden
        `}>
            {/* Dynamic Background Mesh */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10 flex flex-col h-full p-5 sm:p-6 md:p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 sm:mb-8 gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className={`
                            w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0
                            bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400
                            border border-pink-100 dark:border-pink-500/20
                            group-hover:scale-110 transition-transform duration-300 mt-1
                        `}>
                            {icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            {/* Changed truncate to break-words for better mobile viewing */}
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight break-words">
                                {title}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1 break-words line-clamp-2 leading-relaxed">
                                {subtitle}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 self-start">
                        {badge && (
                            <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                {badge}
                            </span>
                        )}
                        {rightAction}
                    </div>
                </div>

                {/* Input Area */}
                <div className="flex-1 flex flex-col gap-5">
                    {children}
                </div>

                {/* Result Area / Empty State */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 border-dashed">
                    {result ? (
                        <div className="animate-fade-in-up">
                            {result}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-20 sm:h-24 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-slate-800/50">
                            <div className="flex flex-col items-center gap-2 opacity-40">
                                <Calculator size={18} className="text-slate-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enter Values</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Result Component
export const ResultDisplay: React.FC<{
    label: string;
    value: string;
    subValues?: { label: string, value: string }[];
    equation?: string;
    notes?: string[];
}> = ({ label, value, subValues, equation, notes }) => {
    return (
        <div className="space-y-4">
            {/* Primary Result */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between p-5 rounded-3xl bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-500/20 gap-2">
                <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-pink-500 mb-1">
                        {label}
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight break-all">
                        {value}
                    </span>
                </div>
                {/* Visual Indicator */}
                <div className="hidden sm:flex w-10 h-10 rounded-full bg-pink-500 items-center justify-center text-white shadow-lg shadow-pink-500/30 shrink-0">
                    <StickyNote size={20} />
                </div>
            </div>

            {/* Sub Values */}
            {subValues && subValues.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    {subValues.map((sv, i) => (
                        <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">{sv.label}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{sv.value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Equation / Logic */}
            {equation && (
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        <Calculator size={10} /> Logic
                    </div>
                    <code className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
                        {equation}
                    </code>
                </div>
            )}

            {/* Notes */}
            {notes && notes.length > 0 && (
                <ul className="space-y-1 pt-1">
                    {notes.map((note, i) => (
                        <li key={i} className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-start gap-1.5">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-pink-400 shrink-0"></span>
                            <span className="leading-relaxed">{note}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
