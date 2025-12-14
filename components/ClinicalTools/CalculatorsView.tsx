
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Search, Filter, Bookmark, BookmarkCheck, X, 
    Droplet, Activity, Flame, FlaskConical, RefreshCw, Pill, Baby, Calendar
} from 'lucide-react';
import { useTheme } from '../../ThemeContext';
import { calculators, calculatorCategories, CalcId, CalculatorDef } from '../../data/ClinicalTools';
import { ClinicalToolCard, ToolInput, ToolSelect, ResultDisplay } from './ClinicalToolCard';

// Icon Map
const getIcon = (name: string) => {
    switch (name) {
        case 'pill': return <Pill size={24} />;
        case 'droplet': return <Droplet size={24} />;
        case 'flame': return <Flame size={24} />;
        case 'activity': return <Activity size={24} />;
        case 'flask': return <FlaskConical size={24} />;
        case 'refresh': return <RefreshCw size={24} />;
        case 'baby': return <Baby size={24} />;
        case 'calendar': return <Calendar size={24} />;
        default: return <Activity size={24} />;
    }
};

const CalculatorInstance: React.FC<{ def: CalculatorDef }> = ({ def }) => {
    // State for inputs: { [key]: value }
    // Also store unit selections: { [key_unit]: unit }
    const [values, setValues] = useState<Record<string, string>>({});
    const [isFavorite, setIsFavorite] = useState(false);

    // Initial Defaults
    useEffect(() => {
        const defaults: Record<string, string> = {};
        def.fields.forEach(f => {
            if (f.defaultUnit) defaults[`${f.key}_unit`] = f.defaultUnit;
            if (f.type === 'select' && f.options) defaults[f.key] = f.options[0].value;
        });
        setValues(prev => ({ ...defaults, ...prev }));
        
        // Load Fav
        const favs = JSON.parse(localStorage.getItem('pnle_calc_favs') || '[]');
        setIsFavorite(favs.includes(def.id));
    }, [def]);

    const toggleFav = () => {
        const favs = JSON.parse(localStorage.getItem('pnle_calc_favs') || '[]');
        const newFavs = isFavorite ? favs.filter((id: string) => id !== def.id) : [...favs, def.id];
        localStorage.setItem('pnle_calc_favs', JSON.stringify(newFavs));
        setIsFavorite(!isFavorite);
    };

    const handleChange = (key: string, val: string) => {
        // Validation for number fields
        const field = def.fields.find(f => f.key === key);
        if (field?.type === 'number' && val !== '') {
            const num = parseFloat(val);
            // Allow typing intermediates like "0." or "-"
            if (!isNaN(num)) {
                if (field.min !== undefined && num < field.min) return; // Enforce Min
                if (field.max !== undefined && num > field.max) return; // Enforce Max
            }
        }
        setValues(prev => ({ ...prev, [key]: val }));
    };

    // Calculate Result
    const result = useMemo(() => {
        try {
            return def.compute(values);
        } catch (e) {
            return null;
        }
    }, [def, values]);

    // Visible Fields Logic (Simple dependency check)
    const visibleFields = def.fields.filter(f => {
        if (!f.showIf) return true;
        // Check if value matches
        const currentVal = values[f.showIf.key];
        const target = f.showIf.value;
        if (Array.isArray(target)) return target.includes(currentVal);
        return currentVal === target;
    });

    return (
        <ClinicalToolCard
            title={def.title}
            subtitle={def.subtitle}
            icon={getIcon(def.iconName)}
            badge={def.badge}
            rightAction={
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleFav(); }}
                    className={`p-2 rounded-xl transition-colors ${isFavorite ? 'bg-pink-50 text-pink-500 dark:bg-pink-900/20' : 'text-slate-300 hover:text-slate-500'}`}
                >
                    {isFavorite ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
                </button>
            }
            result={result ? (
                <ResultDisplay 
                    label={result.primary.label}
                    value={result.primary.value}
                    subValues={result.secondary}
                    equation={result.equation}
                    notes={result.notes}
                />
            ) : null}
        >
            <div className="grid grid-cols-1 gap-5">
                {visibleFields.map(f => (
                    <div key={f.key}>
                        {f.type === 'select' ? (
                            <ToolSelect
                                label={f.label}
                                value={values[f.key] || ''}
                                onChange={(e) => handleChange(f.key, e.target.value)}
                            >
                                {f.options?.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </ToolSelect>
                        ) : (
                            <div className="flex">
                                <ToolInput
                                    label={f.label}
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    value={values[f.key] || ''}
                                    onChange={(e) => handleChange(f.key, e.target.value)}
                                    hasRightElement={!!f.unitOptions}
                                    className={!!f.unitOptions ? "flex-1" : "w-full"}
                                    unit={!f.unitOptions ? f.unit : undefined}
                                    min={f.min}
                                    max={f.max}
                                    step={f.step}
                                />
                                {f.unitOptions && (
                                    <div className="w-24 shrink-0">
                                        <ToolSelect
                                            value={values[`${f.key}_unit`] || f.defaultUnit}
                                            onChange={(e) => handleChange(`${f.key}_unit`, e.target.value)}
                                            containerClassName="h-full"
                                            className="rounded-l-none border-l-0 border-l-slate-200 dark:border-l-slate-700 h-full"
                                        >
                                            {f.unitOptions.map(u => (
                                                <option key={u} value={u}>{u}</option>
                                            ))}
                                        </ToolSelect>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </ClinicalToolCard>
    );
};

const CalculatorsView: React.FC = () => {
    const { themeMode } = useTheme();
    // Using global Pink variable for active states ensures theme consistency
    
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState<string>('all');

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return calculators.filter(c => {
            const matchesSearch = c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q);
            const matchesCat = catFilter === 'all' || c.category === catFilter;
            return matchesSearch && matchesCat;
        });
    }, [search, catFilter]);

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            
            {/* Filter Bar */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 md:p-4 rounded-[2rem] shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-4">
                
                {/* Search - Full width on mobile */}
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search calculators (e.g. Parkland, MAP)..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-slate-200 dark:focus:border-slate-700 outline-none font-bold text-slate-800 dark:text-white placeholder:font-medium placeholder:text-slate-400 transition-all focus:ring-4 focus:ring-pink-500/10"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Categories - Scrollable on mobile, wraps properly */}
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar w-full lg:w-auto">
                    <button
                        onClick={() => setCatFilter('all')}
                        className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                            catFilter === 'all' 
                            ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/25' 
                            : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        All
                    </button>
                    {calculatorCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCatFilter(cat.id)}
                            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                                catFilter === cat.id 
                                ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/25' 
                                : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid - Adjusted for rotation safety (1 col mobile, 2 col tablet, 3 col desktop) */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 items-start pb-10">
                    {filtered.map(calc => (
                        <CalculatorInstance key={calc.id} def={calc} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <Filter size={40} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No tools found</h3>
                    <p className="text-sm text-slate-500 mt-2">Try adjusting your filters</p>
                    <button 
                        onClick={() => { setSearch(''); setCatFilter('all'); }}
                        className="mt-6 px-6 py-2 bg-slate-200 dark:bg-slate-800 rounded-full font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default CalculatorsView;
