
import React, { useState, useMemo } from 'react';
import { Search, Info, FlaskConical, HeartPulse, Filter, X, ChevronRight, Star, ScanEye } from 'lucide-react';
import { useTheme } from '../../ThemeContext';
import { MEDICAL_REFERENCES, VITAL_SIGNS_PEDIATRIC, ReferenceValue } from '../../data/referenceData';
import LabDetailModal from './LabDetailModal';

const ReferenceRow: React.FC<{ item: ReferenceValue, onClick: (item: ReferenceValue) => void }> = ({ item, onClick }) => {
    const { themeMode } = useTheme();
    const isCrescere = themeMode === 'crescere';
    
    // Check if item has abnormalities data to show
    const hasDetails = item.abnormalities && (item.abnormalities.low || item.abnormalities.high);

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'ABG': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'Electrolytes': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Hematology': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            case 'Renal': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Coagulation': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <div 
            onClick={() => hasDetails && onClick(item)}
            className={`
                group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-200 gap-3
                ${isCrescere 
                    ? 'bg-white border-slate-100 hover:border-pink-200 hover:shadow-md' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                }
                ${hasDetails ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}
            `}
        >
            <div className="flex-1 min-w-0 pr-0 sm:pr-4">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${getCategoryColor(item.category)}`}>
                        {item.category}
                    </span>
                    {item.tags?.includes('Critical') && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-800">
                            <Star size={10} fill="currentColor" /> CRITICAL
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <h4 className="text-sm md:text-base font-black text-slate-800 dark:text-white leading-snug break-words group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.name}
                    </h4>
                    {hasDetails && (
                        <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                            <ScanEye size={14} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </div>
                    )}
                </div>
                {item.significance && (
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 italic leading-relaxed">
                        {item.significance}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-50 dark:border-slate-800 shrink-0">
                <div className="text-left sm:text-right">
                    <div className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                        {item.range}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1">
                        {item.unit}
                    </div>
                </div>
                {hasDetails ? (
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                        <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={18} />
                    </div>
                ) : (
                    <div className="w-8" /> 
                )}
            </div>
        </div>
    );
};

const ReferencesView: React.FC = () => {
    const { themeMode } = useTheme();
    const isCrescere = themeMode === 'crescere';

    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'labs' | 'vitals'>('labs');
    const [catFilter, setCatFilter] = useState<string>('All');
    
    // Modal State
    const [selectedItem, setSelectedItem] = useState<ReferenceValue | null>(null);

    const labCategories = ['All', ...Array.from(new Set(MEDICAL_REFERENCES.filter(r => r.category !== 'Vital Signs').map(r => r.category)))];

    const filteredLabs = useMemo(() => {
        return MEDICAL_REFERENCES.filter(item => {
            if (item.category === 'Vital Signs') return false;
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                                 item.category.toLowerCase().includes(search.toLowerCase());
            const matchesCat = catFilter === 'All' || item.category === catFilter;
            return matchesSearch && matchesCat;
        });
    }, [search, catFilter]);

    return (
        <div className="space-y-8 animate-fade-in font-sans pb-10">
            {/* Header Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit mx-auto sm:mx-0">
                <button 
                    onClick={() => setActiveTab('labs')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === 'labs' 
                        ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <FlaskConical size={16} /> Lab Values
                </button>
                <button 
                    onClick={() => setActiveTab('vitals')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === 'vitals' 
                        ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <HeartPulse size={16} /> Vital Signs
                </button>
            </div>

            {activeTab === 'labs' ? (
                <div className="space-y-6">
                    {/* Search & Filter */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search labs (e.g. Sodium, WBC)..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none font-bold shadow-sm transition-all focus:ring-4 ${
                                    isCrescere ? 'bg-white border-pink-100 focus:border-pink-400 focus:ring-pink-500/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-pink-500 focus:ring-pink-500/10'
                                }`}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {labCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCatFilter(cat)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                        catFilter === cat 
                                        ? 'bg-pink-500 text-white border-pink-500 shadow-md' 
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Labs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {filteredLabs.length > 0 ? (
                            filteredLabs.map(item => <ReferenceRow key={item.id} item={item} onClick={setSelectedItem} />)
                        ) : (
                            <div className="col-span-full py-20 text-center opacity-40">
                                <Search size={48} className="mx-auto mb-4" />
                                <p className="font-bold">No results for "{search}"</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    {/* Pediatric Vitals Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-slate-50 dark:bg-slate-950">
                            <div className="p-3 bg-pink-100 dark:bg-pink-500/20 text-pink-600 rounded-2xl">
                                <HeartPulse size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Pediatric Normals</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Age-Specific Vital Sign Ranges</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Age Group</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">HR (bpm)</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">RR (bpm)</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Systolic BP</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {VITAL_SIGNS_PEDIATRIC.map((v, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">{v.age}</td>
                                            <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900 dark:text-white text-center bg-pink-50/20 dark:bg-pink-900/5">{v.hr}</td>
                                            <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900 dark:text-white text-center">{v.rr}</td>
                                            <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900 dark:text-white text-center bg-blue-50/20 dark:bg-blue-900/5">{v.sbp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Adult Vitals Card Grid - Making clickable for expansion */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {MEDICAL_REFERENCES.filter(r => r.category === 'Vital Signs').map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedItem(item)}
                                className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center cursor-pointer hover:border-pink-300 dark:hover:border-pink-500/50 hover:shadow-lg transition-all"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{item.name.replace(' (Adult)', '')}</span>
                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">
                                    {item.range}
                                </div>
                                <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">{item.unit}</span>
                                <div className="mt-3 text-[9px] font-bold text-slate-400 flex items-center gap-1 opacity-60">
                                    <ScanEye size={10} /> Tap for details
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DETAIL MODAL */}
            {selectedItem && (
                <LabDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
        </div>
    );
};

export default ReferencesView;
