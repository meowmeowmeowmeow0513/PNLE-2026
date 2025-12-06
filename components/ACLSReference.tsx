
import React, { useState } from 'react';
import { X, Activity, Zap, Pill, FileText, ChevronRight, HeartPulse, BookOpen, ExternalLink } from 'lucide-react';

interface ACLSReferenceProps {
    onClose: () => void;
}

const ACLSReference: React.FC<ACLSReferenceProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'algorithm' | 'meds' | 'causes'>('algorithm');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-0 md:p-6 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-slate-50 dark:bg-slate-950 w-full md:max-w-6xl h-[100dvh] md:h-auto md:max-h-[90vh] md:rounded-[2.5rem] shadow-2xl border-0 md:border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative animate-zoom-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-4 md:px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0 z-20 relative">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2.5 md:p-3 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-xl shadow-sm">
                            <Activity size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">Code Blue Protocol</h2>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">AHA Guidelines 2025</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors shadow-sm">
                        <X size={20} className="md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Tabs - Sticky */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 p-2 shrink-0 z-10 sticky top-0">
                    <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl gap-1 overflow-x-auto no-scrollbar">
                        <button 
                            onClick={() => setActiveTab('algorithm')}
                            className={`flex-1 py-2.5 px-3 text-[10px] md:text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap border ${activeTab === 'algorithm' ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border-slate-200 dark:border-slate-700 shadow-sm' : 'border-transparent text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                        >
                            <Zap size={14} /> Cardiac Arrest
                        </button>
                        <button 
                            onClick={() => setActiveTab('meds')}
                            className={`flex-1 py-2.5 px-3 text-[10px] md:text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap border ${activeTab === 'meds' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-slate-200 dark:border-slate-700 shadow-sm' : 'border-transparent text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                        >
                            <Pill size={14} /> Medications
                        </button>
                        <button 
                            onClick={() => setActiveTab('causes')}
                            className={`flex-1 py-2.5 px-3 text-[10px] md:text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap border ${activeTab === 'causes' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border-slate-200 dark:border-slate-700 shadow-sm' : 'border-transparent text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                        >
                            <FileText size={14} /> H's & T's
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#0B1121] p-4 md:p-6 pb-24 md:pb-8">
                    
                    {/* ALGORITHM TAB */}
                    {activeTab === 'algorithm' && (
                        <div className="space-y-6">
                            {/* CPR Quality Box */}
                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <HeartPulse size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase tracking-tight text-xs md:text-sm">CPR Quality</h4>
                                        <p className="text-[10px] uppercase font-bold opacity-80">High-Performance Metrics</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 w-full sm:w-auto">
                                    <span className="px-2 py-1 bg-white dark:bg-slate-900 rounded-md border border-emerald-500/20 shadow-sm flex-1 sm:flex-none text-center">Push Hard ({'>'}2 in)</span>
                                    <span className="px-2 py-1 bg-white dark:bg-slate-900 rounded-md border border-emerald-500/20 shadow-sm flex-1 sm:flex-none text-center">Push Fast (100-120)</span>
                                    <span className="px-2 py-1 bg-white dark:bg-slate-900 rounded-md border border-emerald-500/20 shadow-sm flex-1 sm:flex-none text-center">Allow Recoil</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Shockable Side */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl border-l-8 border-red-500 shadow-md p-5 md:p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-white text-[9px] md:text-[10px] font-black uppercase rounded-bl-xl shadow-sm">Shockable Path</div>
                                    <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg text-red-500"><Zap size={18} /></div>
                                        VF / pVT
                                    </h3>
                                    <div className="space-y-6 relative">
                                        {/* Vertical Line */}
                                        <div className="absolute left-[14px] top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

                                        {[
                                            { step: '1', title: 'Start CPR', desc: 'Give Oxygen (BVM) • Attach Monitor', color: 'red' },
                                            { step: '2', title: 'SHOCK', desc: 'Biphasic: 120-200J (Max)', color: 'red-fill' },
                                            { step: '3', title: 'CPR 2 Min', desc: 'IV/IO Access', color: 'red' },
                                            { step: '4', title: 'SHOCK', desc: '', color: 'red-fill' },
                                            { step: '5', title: 'CPR 2 Min + EPI', desc: 'Epinephrine 1mg every 3-5 mins', color: 'red' },
                                            { step: '6', title: 'SHOCK', desc: '', color: 'red-fill' },
                                            { step: '7', title: 'CPR 2 Min + AMIO', desc: 'Amiodarone 300mg / Lidocaine', color: 'red' },
                                        ].map((item, i) => (
                                            <div key={i} className="relative pl-10">
                                                <div className={`absolute left-0 top-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black z-10 border-2 shadow-sm ${item.color === 'red-fill' ? 'bg-red-500 border-red-500 text-white shadow-red-500/30' : 'bg-white dark:bg-slate-900 border-red-500 text-red-500'}`}>
                                                    {item.step}
                                                </div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{item.title}</h4>
                                                {item.desc && <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-tight">{item.desc}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Non-Shockable Side */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl border-l-8 border-slate-500 shadow-md p-5 md:p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-slate-500 text-white text-[9px] md:text-[10px] font-black uppercase rounded-bl-xl shadow-sm">Non-Shockable Path</div>
                                    <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"><Activity size={18} /></div>
                                        Asystole / PEA
                                    </h3>
                                    <div className="space-y-6 relative">
                                        {/* Vertical Line */}
                                        <div className="absolute left-[14px] top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

                                        {[
                                            { step: '9', title: 'Start CPR', desc: 'Give Oxygen (BVM) • Attach Monitor' },
                                            { step: '10', title: 'EPI ASAP', desc: 'Epinephrine 1mg IV/IO immediately' },
                                            { step: '11', title: 'CPR 2 Min', desc: 'IV/IO Access • Advanced Airway' },
                                            { step: '?', title: 'Check Rhythm', desc: 'Shockable? Go Left. Not Shockable? Resume CPR.' },
                                            { step: '12', title: 'Treat Causes', desc: 'H\'s and T\'s' },
                                        ].map((item, i) => (
                                            <div key={i} className="relative pl-10">
                                                <div className="absolute left-0 top-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] md:text-xs font-black z-10 shadow-sm">
                                                    {item.step}
                                                </div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{item.title}</h4>
                                                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-tight">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MEDS TAB */}
                    {activeTab === 'meds' && (
                        <div className="space-y-6">
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 md:p-6">
                                <h3 className="font-black text-base md:text-lg text-blue-700 dark:text-blue-400 mb-4">Core Medications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-4 shadow-sm">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 font-bold shrink-0 text-[10px] md:text-xs">Epi</div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Epinephrine IV/IO</h4>
                                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">1 mg every 3-5 mins</p>
                                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Indication: All cardiac arrests. Vasoconstrictor.</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-4 shadow-sm">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 font-bold shrink-0 text-[10px] md:text-xs">Amio</div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Amiodarone IV/IO</h4>
                                            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-0.5">300 mg bolus / 150 mg 2nd</p>
                                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Indication: Refractory VF/pVT (after 3rd shock).</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-4 shadow-sm">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 font-bold shrink-0 text-[10px] md:text-xs">Lido</div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Lidocaine IV/IO</h4>
                                            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5">1-1.5 mg/kg</p>
                                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Alternative to Amio for Refractory VF/pVT.</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-4 shadow-sm">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center text-teal-600 font-bold shrink-0 text-[10px] md:text-xs">Mg</div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Magnesium Sulfate</h4>
                                            <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">1-2 g diluted</p>
                                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Indication: Torsades de Pointes.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CAUSES TAB */}
                    {activeTab === 'causes' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="font-black text-base md:text-lg text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-sm font-bold">H</div> The H's
                                </h3>
                                <ul className="space-y-4">
                                    {[
                                        { t: 'Hypovolemia', d: 'Check fluid status/blood loss. Tx: Fluids.' },
                                        { t: 'Hypoxia', d: 'Check airway/O2 sat. Tx: 100% O2.' },
                                        { t: 'Hydrogen Ion (Acidosis)', d: 'Check ABGs. Tx: Ventilation/Bicarb.' },
                                        { t: 'Hypo/Hyperkalemia', d: 'Check ECG signs. Tx: Electrolyte correction.' },
                                        { t: 'Hypothermia', d: 'Core temp <35C. Tx: Rewarming.' }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <ChevronRight size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="font-bold text-slate-800 dark:text-white text-sm block">{item.t}</span>
                                                <span className="text-[10px] md:text-xs text-slate-500 font-medium">{item.d}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="font-black text-base md:text-lg text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-sm font-bold">T</div> The T's
                                </h3>
                                <ul className="space-y-4">
                                    {[
                                        { t: 'Tension Pneumothorax', d: 'Tracheal deviation. Tx: Needle Decompression.' },
                                        { t: 'Tamponade (Cardiac)', d: 'Muffled heart sounds, JVD. Tx: Pericardiocentesis.' },
                                        { t: 'Toxins', d: 'Drug OD. Tx: Antidotes.' },
                                        { t: 'Thrombosis (Pulmonary)', d: 'PE signs. Tx: Thrombolytics.' },
                                        { t: 'Thrombosis (Coronary)', d: 'MI (STEMI). Tx: PCI/Cath Lab.' }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <ChevronRight size={16} className="text-purple-500 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="font-bold text-slate-800 dark:text-white text-sm block">{item.t}</span>
                                                <span className="text-[10px] md:text-xs text-slate-500 font-medium">{item.d}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer with Links */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-center md:justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium shrink-0 gap-3 z-20 relative">
                    <div className="flex items-center gap-2 opacity-70">
                        <BookOpen size={14} /> Official 2025 Sources
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
                        <a href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/algorithms" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 hover:underline flex items-center gap-1 transition-colors">
                            AHA Guidelines Hub <ExternalLink size={10} />
                        </a>
                        <a href="https://cpr.heart.org/-/media/CPR-Images/CPR-Guidelines-2025/Algorithms/Figure-1-Adult-Cardiac-Arrest-Circular-Algorithm.jpg" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 hover:underline flex items-center gap-1 transition-colors">
                            Circular Algo <ExternalLink size={10} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ACLSReference;
