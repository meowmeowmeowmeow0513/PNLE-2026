
import React from 'react';
import { Stethoscope, Calculator, Activity, BookOpen } from 'lucide-react';
import { useTheme } from '../../ThemeContext';

export type ClinicalTab = 'calculation' | 'assessment' | 'references';

interface ClinicalHeaderProps {
    activeTab: ClinicalTab;
    onTabChange: (tab: ClinicalTab) => void;
}

const ClinicalHeader: React.FC<ClinicalHeaderProps> = ({ activeTab, onTabChange }) => {
    const { themeMode } = useTheme();
    const isCrescere = themeMode === 'crescere';

    const tabs: { id: ClinicalTab; label: string; icon: React.ReactNode }[] = [
        { id: 'calculation', label: 'Calculation', icon: <Calculator size={18} /> },
        { id: 'assessment', label: 'Assessment', icon: <Activity size={18} /> },
        { id: 'references', label: 'References', icon: <BookOpen size={18} /> },
    ];

    return (
        <div className={`relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border shadow-xl transition-all duration-500 group ${isCrescere ? 'bg-white/80 border-white/60 backdrop-blur-3xl' : 'bg-white dark:bg-[#0B1121] border-slate-200 dark:border-white/5'}`}>
            
            {/* --- BACKGROUND EFFECTS --- */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none opacity-70 dark:opacity-50 ${isCrescere ? 'bg-rose-200/40' : 'bg-pink-100 dark:bg-pink-500/10'}`}></div>
            <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none opacity-70 dark:opacity-50 ${isCrescere ? 'bg-amber-200/40' : 'bg-blue-100 dark:bg-blue-500/10'}`}></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

            <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8">
                
                {/* --- TITLE SECTION --- */}
                <div className="max-w-2xl w-full">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest mb-4 shadow-sm ${isCrescere ? 'bg-white/80 border-white/60 text-slate-600' : 'bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/20 text-slate-500 dark:text-slate-300'}`}>
                        <Stethoscope size={12} className={isCrescere ? 'text-rose-500' : 'text-pink-500 dark:text-pink-400'} />
                        Medical Utilities
                    </div>
                    <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.9] mb-4 ${isCrescere ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>
                        Clinical <br className="hidden md:block"/>
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isCrescere ? 'from-rose-500 to-amber-500' : 'from-pink-500 to-purple-500 dark:from-pink-400 dark:to-purple-400'}`}>
                            Tools
                        </span>
                    </h1>
                    <p className={`text-sm md:text-base lg:text-lg font-medium leading-relaxed max-w-xl ${isCrescere ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                        Precision calculators and assessment scales designed for rapid bedside decision making.
                    </p>
                </div>

                {/* --- NAVIGATION TABS --- */}
                <div className={`w-full xl:w-auto p-1.5 rounded-2xl border backdrop-blur-md shadow-lg ${isCrescere ? 'bg-white/60 border-white/60' : 'bg-slate-100/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'}`}>
                    <div className="flex flex-col sm:flex-row gap-1 w-full">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`
                                        flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 relative overflow-hidden whitespace-nowrap
                                        ${isActive 
                                            ? 'text-white shadow-md transform scale-[1.02]' 
                                            : isCrescere 
                                                ? 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                                        }
                                    `}
                                >
                                    {/* Active Background */}
                                    {isActive && (
                                        <div className={`absolute inset-0 ${isCrescere ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-pink-500 to-purple-600'} rounded-xl`} />
                                    )}
                                    
                                    <span className="relative z-10 flex items-center gap-2">
                                        {tab.icon}
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ClinicalHeader;
