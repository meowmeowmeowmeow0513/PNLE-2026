
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, X, Download, 
  Layers, GraduationCap, ArrowRight,
  Sparkles, PieChart, Info, Circle,
  ClipboardCheck, CheckCircle2,
  Target, GripHorizontal
} from 'lucide-react';
import { EXAM_BLUEPRINTS, ExamBlueprint, CompetencyData, CompetencyStatus } from '../data/examBlueprints';
import CompetencyAuditModal from './CompetencyAuditModal';
import { useTheme } from '../ThemeContext';

// --- THEME UTILS ---

const getTheme = (color: string, isCrescere: boolean) => {
  if (isCrescere) {
      // Crescere Mode: Bright, Premium White Glass with Subtle Tints
      // Reverted text to darker slate for readability, removed gray backgrounds
      switch(color) {
          case 'emerald': return {
              bg: 'bg-gradient-to-br from-white to-emerald-50/30',
              text: 'text-emerald-900',
              textLight: 'text-emerald-700',
              border: 'border-emerald-200/60',
              shadow: 'shadow-emerald-500/10',
              accent: 'bg-emerald-500',
              gradient: 'from-emerald-400 to-teal-400',
              ring: 'ring-emerald-500/20',
              bar: 'bg-emerald-500',
          };
          case 'pink': return {
              bg: 'bg-gradient-to-br from-white to-pink-50/30',
              text: 'text-pink-900',
              textLight: 'text-pink-700',
              border: 'border-pink-200/60',
              shadow: 'shadow-pink-500/10',
              accent: 'bg-pink-500',
              gradient: 'from-pink-400 to-rose-400',
              ring: 'ring-pink-500/20',
              bar: 'bg-pink-500',
          };
          case 'blue': return {
              bg: 'bg-gradient-to-br from-white to-blue-50/30',
              text: 'text-blue-900',
              textLight: 'text-blue-700',
              border: 'border-blue-200/60',
              shadow: 'shadow-blue-500/10',
              accent: 'bg-blue-500',
              gradient: 'from-blue-400 to-indigo-400',
              ring: 'ring-blue-500/20',
              bar: 'bg-blue-500',
          };
          case 'orange': return {
              bg: 'bg-gradient-to-br from-white to-orange-50/30',
              text: 'text-orange-900',
              textLight: 'text-orange-700',
              border: 'border-orange-200/60',
              shadow: 'shadow-orange-500/10',
              accent: 'bg-orange-500',
              gradient: 'from-orange-400 to-amber-400',
              ring: 'ring-orange-500/20',
              bar: 'bg-orange-500',
          };
          case 'violet': return {
              bg: 'bg-gradient-to-br from-white to-violet-50/30',
              text: 'text-violet-900',
              textLight: 'text-violet-700',
              border: 'border-violet-200/60',
              shadow: 'shadow-violet-500/10',
              accent: 'bg-violet-500',
              gradient: 'from-violet-400 to-purple-400',
              ring: 'ring-violet-500/20',
              bar: 'bg-violet-500',
          };
          default: return {
              bg: 'bg-white',
              text: 'text-slate-900',
              textLight: 'text-slate-600',
              border: 'border-slate-200',
              shadow: 'shadow-slate-200',
              accent: 'bg-slate-500',
              gradient: 'from-slate-400 to-gray-400',
              ring: 'ring-slate-200',
              bar: 'bg-slate-500',
          };
      }
  }

  // Standard Light/Dark Mode
  const themes: Record<string, any> = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      text: 'text-emerald-700 dark:text-emerald-300',
      textLight: 'text-emerald-600/80 dark:text-emerald-400/80',
      border: 'border-emerald-200 dark:border-emerald-800',
      shadow: 'shadow-emerald-500/10',
      accent: 'bg-emerald-500',
      gradient: 'from-emerald-500 to-teal-600',
      ring: 'ring-emerald-500/20',
      bar: 'bg-emerald-500',
    },
    pink: {
      bg: 'bg-pink-50 dark:bg-pink-900/10',
      text: 'text-pink-700 dark:text-pink-300',
      textLight: 'text-pink-600/80 dark:text-pink-400/80',
      border: 'border-pink-200 dark:border-pink-800',
      shadow: 'shadow-pink-500/10',
      accent: 'bg-pink-500',
      gradient: 'from-pink-500 to-rose-600',
      ring: 'ring-pink-500/20',
      bar: 'bg-pink-500',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      text: 'text-blue-700 dark:text-blue-300',
      textLight: 'text-blue-600/80 dark:text-blue-400/80',
      border: 'border-blue-200 dark:border-blue-800',
      shadow: 'shadow-blue-500/10',
      accent: 'bg-blue-500',
      gradient: 'from-blue-500 to-indigo-600',
      ring: 'ring-blue-500/20',
      bar: 'bg-blue-500',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/10',
      text: 'text-orange-700 dark:text-orange-300',
      textLight: 'text-orange-600/80 dark:text-orange-400/80',
      border: 'border-orange-200 dark:border-orange-800',
      shadow: 'shadow-orange-500/10',
      accent: 'bg-orange-500',
      gradient: 'from-orange-500 to-amber-600',
      ring: 'ring-orange-500/20',
      bar: 'bg-orange-500',
    },
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-900/10',
      text: 'text-violet-700 dark:text-violet-300',
      textLight: 'text-violet-600/80 dark:text-violet-400/80',
      border: 'border-violet-200 dark:border-violet-800',
      shadow: 'shadow-violet-500/10',
      accent: 'bg-violet-500',
      gradient: 'from-violet-500 to-purple-600',
      ring: 'ring-violet-500/20',
      bar: 'bg-violet-500',
    },
  };
  return themes[color] || themes.emerald;
};

// --- BLUEPRINT MODAL COMPONENT ---

const BlueprintModal = ({ exam, onClose }: { exam: ExamBlueprint; onClose: () => void }) => {
  const { themeMode } = useTheme();
  const isCrescere = themeMode === 'crescere';
  const theme = getTheme(exam.color, isCrescere);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 animate-fade-in">
      
      {/* Backdrop - Lighter for Crescere */}
      <div 
        className={`absolute inset-0 transition-opacity ${isCrescere ? 'bg-white/40 backdrop-blur-md' : 'bg-white/20 dark:bg-black/80 backdrop-blur-xl'}`} 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className={`relative w-full h-full md:h-[90vh] md:max-w-5xl rounded-none md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-none md:border animate-zoom-in duration-300 ${isCrescere ? 'bg-white/90 border-white/60' : 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-white/5'}`}
        role="dialog"
      >
        
        {/* --- IMMERSIVE HEADER --- */}
        <div className={`shrink-0 relative overflow-hidden p-6 md:p-10 pb-16 transition-colors duration-500`}>
           {/* Dynamic Gradient Background */}
           <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-95`}></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
           <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex items-start gap-5">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg border border-white/20 text-white shrink-0">
                      <exam.icon size={32} className="md:w-10 md:h-10" />
                  </div>
                  <div>
                      <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded-full bg-white/20 border border-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
                              {exam.code}
                          </span>
                          <span className="flex items-center gap-1.5 text-white/90 text-xs font-bold uppercase tracking-wider">
                              <Layers size={14} /> PRC Annex A
                          </span>
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                          {exam.title}
                      </h2>
                      <p className="text-white/80 font-medium text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
                          {exam.subtitle}
                      </p>
                  </div>
              </div>

              <div className="flex flex-col items-end gap-3 self-end md:self-auto w-full md:w-auto">
                  <button 
                      onClick={onClose}
                      className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md z-50 shadow-sm"
                  >
                      <X size={20} />
                  </button>
                  
                  {/* Strategy Pill */}
                  <div className="hidden md:block bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 max-w-sm hover:bg-white/15 transition-colors shadow-lg">
                      <div className="flex items-center gap-2 mb-2 text-amber-300">
                          <Sparkles size={16} className="fill-current animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Strategic Focus</span>
                      </div>
                      <p className="text-xs text-white/90 leading-relaxed font-medium">
                          {exam.strategy}
                      </p>
                  </div>
              </div>
           </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar -mt-8 rounded-t-[2rem] relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${isCrescere ? 'bg-white/95' : 'bg-slate-50 dark:bg-[#0f172a]'}`}>
            
            {/* Mobile Strategy (Visible only on mobile) */}
            <div className="md:hidden px-6 pt-8 pb-0">
                <div className={`p-4 rounded-2xl border ${theme.border} ${isCrescere ? 'bg-white' : theme.bg} border-opacity-50`}>
                    <div className="flex items-center gap-2 mb-2 text-amber-500 dark:text-amber-400">
                        <Sparkles size={16} className="fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Strategic Focus</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {exam.strategy}
                    </p>
                </div>
            </div>

            <div className="p-6 md:p-10 grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-12">
                {exam.competencies.map((comp, idx) => (
                    <div key={idx} className="relative">
                        {/* Vertical Connector Line (Desktop) */}
                        <div className={`hidden xl:block absolute left-0 top-4 bottom-0 w-1 rounded-full ${isCrescere ? `bg-${exam.color}-200/50` : theme.bg.replace('bg-', 'bg-opacity-50 bg-')}`}></div>
                        
                        <div className="xl:pl-8">
                            {/* Section Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                <div>
                                    <h3 className={`font-bold text-xl md:text-2xl leading-tight flex items-center gap-2 ${isCrescere ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>
                                        {comp.title}
                                    </h3>
                                    <p className={`text-sm mt-1 font-medium flex items-center gap-2 ${isCrescere ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                        <Info size={14} /> {comp.description}
                                    </p>
                                </div>
                                <div className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl shadow-sm shrink-0 border ${isCrescere ? 'bg-white border-slate-200' : `bg-white dark:bg-slate-800 ${theme.border}`}`}>
                                    <span className={`text-lg font-black ${theme.text}`}>{comp.weight}</span>
                                </div>
                            </div>

                            {/* Topics List */}
                            <div className="space-y-4">
                                {comp.topics.map((topic, tIdx) => (
                                    <div 
                                        key={tIdx} 
                                        className={`group rounded-2xl p-6 border shadow-sm transition-all duration-300 hover:scale-[1.01] ${isCrescere ? 'bg-white/80 border-slate-200 hover:border-slate-300 hover:shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg dark:hover:shadow-black/50'}`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                                            <h4 className={`font-bold text-base md:text-lg leading-snug ${isCrescere ? 'text-slate-800' : 'text-slate-800 dark:text-slate-200'}`}>
                                                {topic.name}
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5 shrink-0">
                                                {topic.tags.map((tag, tagIdx) => (
                                                    <span key={tagIdx} className={`text-[10px] px-2 py-1 rounded-md uppercase font-bold tracking-wider border ${
                                                        tag.toLowerCase().includes('high') || tag.toLowerCase().includes('critical') || tag.toLowerCase().includes('must')
                                                        ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' 
                                                        : isCrescere ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                    }`}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <ul className="space-y-3">
                                            {topic.subtopics.map((sub, sIdx) => (
                                                <li key={sIdx} className={`flex items-start gap-3 text-sm md:text-[15px] font-medium leading-relaxed transition-colors ${isCrescere ? 'text-slate-600 group-hover:text-slate-900' : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100'}`}>
                                                    <span className={`mt-1.5 shrink-0 ${theme.text}`}>
                                                        <Circle size={6} fill="currentColor" />
                                                    </span>
                                                    <span>{sub}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- FOOTER --- */}
        <div className={`p-4 border-t text-center shrink-0 z-30 ${isCrescere ? 'bg-white border-slate-100' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${isCrescere ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
                <Target size={12} />
                Based on PRC Nursing Board Resolution No. 2025-16 Annex A
            </p>
        </div>

      </div>
    </div>,
    document.body
  );
};

// --- MAIN COMPONENT ---

const ExamTOS: React.FC = () => {
  const { themeMode } = useTheme();
  const [selectedExam, setSelectedExam] = useState<ExamBlueprint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Competency Tracker State
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [competencyData, setCompetencyData] = useState<CompetencyData>({});

  const isCrescere = themeMode === 'crescere';

  // Load from Local Storage on Mount
  useEffect(() => {
      try {
          const saved = localStorage.getItem('pnle_competency_data');
          if (saved) {
              setCompetencyData(JSON.parse(saved));
          }
      } catch (e) {
          console.error("Failed to load competency data", e);
      }
  }, []);

  // Save to Local Storage on Change
  const updateCompetency = (id: string, status: CompetencyStatus) => {
      setCompetencyData(prev => {
          const newState = { ...prev, [id]: status };
          localStorage.setItem('pnle_competency_data', JSON.stringify(newState));
          return newState;
      });
  };

  // Calculate Overall Stats
  const overallStats = useMemo(() => {
      let totalTopics = 0;
      let gaps = 0;
      let mastered = 0;

      EXAM_BLUEPRINTS.forEach(ex => {
          ex.competencies.forEach(c => {
              c.topics.forEach(t => {
                  totalTopics++;
                  const id = `${ex.id}-${t.name}`;
                  const status = competencyData[id] || 'none';
                  if (status === 'none') gaps++;
                  if (status === 'mastered') mastered++;
              });
          });
      });

      const readiness = totalTopics === 0 ? 0 : Math.round((mastered / totalTopics) * 100);
      return { totalTopics, gaps, mastered, readiness };
  }, [competencyData]);

  // Enhanced Filter Logic
  const filteredExams = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return EXAM_BLUEPRINTS;

    return EXAM_BLUEPRINTS.filter(ex => {
        // Check Top Level
        if (ex.title.toLowerCase().includes(query) || ex.code.toLowerCase().includes(query) || ex.subtitle.toLowerCase().includes(query)) {
            return true;
        }
        // Check Competencies
        return ex.competencies.some(c => 
            c.title.toLowerCase().includes(query) || 
            c.description.toLowerCase().includes(query) ||
            c.topics.some(t => 
                t.name.toLowerCase().includes(query) || 
                t.subtopics.some(sub => sub.toLowerCase().includes(query))
            )
        );
    });
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in font-sans">
      
      {/* Header Section (Adaptive Light/Dark Mode) */}
      <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border shadow-xl dark:shadow-2xl transition-colors duration-500 ${isCrescere ? 'bg-white/80 border-white/60 backdrop-blur-3xl' : 'bg-white dark:bg-[#0B1121] border-slate-200 dark:border-white/5'}`}>
          
          {/* Decorative Blurs */}
          <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none opacity-70 dark:opacity-100 ${isCrescere ? 'bg-rose-200/40' : 'bg-pink-100 dark:bg-pink-500/10'}`}></div>
          <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none opacity-70 dark:opacity-100 ${isCrescere ? 'bg-amber-200/40' : 'bg-blue-100 dark:bg-blue-500/10'}`}></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
              <div className="max-w-2xl">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest mb-4 ${isCrescere ? 'bg-white/80 border-white/60 text-slate-600' : 'bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/20 text-slate-500 dark:text-slate-300'}`}>
                      <GraduationCap size={12} className={isCrescere ? 'text-rose-500' : 'text-pink-500 dark:text-pink-400'} />
                      Official 2026 Blueprint
                  </div>
                  <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.9] mb-4 ${isCrescere ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>
                      Board Exam <br/> <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isCrescere ? 'from-rose-500 to-amber-500' : 'from-pink-500 to-purple-500 dark:from-pink-400 dark:to-purple-400'}`}>Command Center</span>
                  </h1>
                  <p className={`text-base md:text-lg font-medium leading-relaxed max-w-xl ${isCrescere ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                      Your definitive map to the Philippine Nurse Licensure Examination. Based on the latest competencies and weight distributions.
                  </p>
              </div>

              <div className="w-full lg:w-auto flex flex-col gap-4">
                  {/* Enhanced Search Input */}
                  <div className="relative group w-full lg:w-80">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Search size={18} className={`transition-colors ${isCrescere ? 'text-slate-400 group-focus-within:text-rose-600' : 'text-slate-400 group-focus-within:text-pink-500'}`} />
                      </div>
                      <input 
                          type="text" 
                          placeholder="Search topics (e.g. 'IMCI')..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={`w-full pl-12 pr-10 py-4 border rounded-2xl focus:outline-none transition-all font-medium shadow-sm ${isCrescere ? 'bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10'}`}
                      />
                      {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                          >
                              <X size={16} />
                          </button>
                      )}
                  </div>
                  
                  <a 
                      href="https://www.prc.gov.ph/sites/default/files/2025-16%20annex%20A%20nurse.pdf" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-colors active:scale-95 shadow-lg ${isCrescere ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-slate-900/10 dark:shadow-white/10'}`}
                  >
                      <Download size={18} />
                      Download Official PDF
                  </a>
              </div>
          </div>
      </div>

      {/* Empty State */}
      {filteredExams.length === 0 && (
          <div className={`text-center py-20 rounded-[2.5rem] border border-dashed shadow-sm ${isCrescere ? 'bg-white/80 border-slate-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isCrescere ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                  <Search size={32} />
              </div>
              <h3 className={`text-xl font-bold ${isCrescere ? 'text-slate-800' : 'text-slate-800 dark:text-white'}`}>No results found</h3>
              <p className={`text-sm mt-1 font-medium ${isCrescere ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>Try searching for a different keyword like "COPAR" or "Diabetes".</p>
              <button 
                onClick={() => setSearchQuery('')} 
                className={`mt-6 px-6 py-2 rounded-full font-bold text-sm transition-colors ${isCrescere ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-500/20'}`}
              >
                  Clear Filters
              </button>
          </div>
      )}

      {/* Blueprint Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
              const theme = getTheme(exam.color, isCrescere);
              const parts = exam.competencies;
              
              return (
                  <button
                      key={exam.id}
                      onClick={() => setSelectedExam(exam)}
                      className={`group relative flex flex-col justify-between h-[380px] rounded-[2.5rem] p-8 border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden text-left hover:border-opacity-100 border-opacity-60 ${isCrescere ? `bg-white/80 border-white/60 backdrop-blur-xl ${theme.border}` : `bg-white dark:bg-[#0f172a] dark:border-opacity-40 ${theme.border}`}`}
                  >
                      {/* Gradient Hover Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}></div>
                      
                      {/* Top Section */}
                      <div className="relative z-10 w-full">
                          <div className="flex justify-between items-start mb-6">
                              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-6 shadow-sm ${theme.bg} ${theme.text}`}>
                                  <exam.icon size={32} />
                              </div>
                              <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center gap-1.5 ${theme.bg} ${theme.text} ${theme.border.replace('border', 'border-opacity-50')}`}>
                                  <Target size={12} /> {exam.code}
                              </div>
                          </div>

                          <h3 className={`text-2xl font-black leading-tight mb-3 transition-all ${isCrescere ? 'text-slate-900 group-hover:text-slate-700' : 'text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 dark:group-hover:from-white dark:group-hover:to-slate-300'}`}>
                              {exam.title}
                          </h3>
                          <p className={`text-sm font-medium line-clamp-2 leading-relaxed ${isCrescere ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                              {exam.subtitle}
                          </p>
                      </div>

                      {/* Bottom Section - Visual Weights */}
                      <div className={`relative z-10 mt-auto pt-6 border-t ${isCrescere ? 'border-slate-100' : 'border-slate-100 dark:border-slate-800'}`}>
                          <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                                <PieChart size={12} /> Weight Distribution
                              </span>
                              <div className={`p-2 rounded-full ${theme.bg} ${theme.text} opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300`}>
                                  <ArrowRight size={16} />
                              </div>
                          </div>
                          
                          {/* Progress Bar Visualization */}
                          <div className={`h-3 w-full rounded-full overflow-hidden flex shadow-inner ${isCrescere ? 'bg-slate-100' : 'bg-slate-100 dark:bg-slate-800'}`}>
                              {parts.map((part, pIdx) => (
                                  <div 
                                    key={pIdx}
                                    style={{ width: `${part.weightPercentage}%` }}
                                    className={`h-full ${pIdx === 0 ? theme.bar : isCrescere ? 'bg-slate-300' : 'bg-slate-300 dark:bg-slate-600'} transition-all duration-1000 relative group/bar`}
                                    title={part.title}
                                  >
                                      {/* Tooltip on hover of the specific bar segment */}
                                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                                          Part {pIdx === 0 ? 'A' : 'B'}: {part.weightPercentage}%
                                      </div>
                                  </div>
                              ))}
                          </div>
                          
                          <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                              <span>Part A: {parts[0]?.weightPercentage}%</span>
                              <span>Part B: {parts[1]?.weightPercentage}%</span>
                          </div>
                      </div>
                  </button>
              );
          })}

          {/* --- COMPETENCY AUDIT CARD (6th Slot - ADAPTIVE) --- */}
          {!searchQuery && (
              <button
                  onClick={() => setTrackerOpen(true)}
                  className={`group relative flex flex-col justify-between h-[380px] rounded-[2.5rem] p-8 border transition-all duration-500 hover:-translate-y-2 overflow-hidden text-left ${isCrescere ? 'bg-white/80 border-slate-200 hover:border-amber-300 shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg dark:shadow-2xl hover:border-amber-300 dark:hover:border-amber-700'}`}
              >
                  {/* Luxury Background - Light & Dark Compatible */}
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                  <div className={`absolute top-[-50%] right-[-50%] w-[100%] h-[100%] blur-3xl pointer-events-none ${isCrescere ? 'bg-gradient-to-b from-amber-200/40 via-transparent to-transparent' : 'bg-gradient-to-b from-amber-200/20 via-transparent to-transparent dark:from-amber-400/10'}`}></div>

                  <div className="relative z-10 w-full">
                      <div className="flex justify-between items-start mb-6">
                          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner ${isCrescere ? 'bg-amber-50 border border-amber-100 text-amber-500' : 'bg-amber-50 dark:bg-slate-800 border border-amber-100 dark:border-slate-700 text-amber-500'}`}>
                              <ClipboardCheck size={32} />
                          </div>
                          <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center gap-1.5 group-hover:bg-amber-500 group-hover:text-white transition-colors ${isCrescere ? 'border-amber-500/30 bg-amber-50 text-amber-600' : 'border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:group-hover:text-slate-900'}`}>
                              <GripHorizontal size={12} /> Audit Tool
                          </div>
                      </div>

                      <h3 className={`text-2xl font-black leading-tight mb-2 ${isCrescere ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>
                          Competency <br/><span className={`text-transparent bg-clip-text bg-gradient-to-r ${isCrescere ? 'from-amber-500 to-orange-500' : 'from-amber-500 to-orange-500 dark:from-amber-200 dark:to-yellow-500'}`}>Gap Analysis</span>
                      </h3>
                      <p className={`text-sm font-medium leading-relaxed ${isCrescere ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                          Self-assess your readiness. Identify red flags and track your mastery of the blueprint.
                      </p>
                  </div>

                  <div className={`relative z-10 mt-auto pt-6 border-t ${isCrescere ? 'border-slate-100' : 'border-slate-100 dark:border-slate-800'}`}>
                      <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Overall Readiness</span>
                          <span className={`text-lg font-black ${isCrescere ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>{overallStats.readiness}%</span>
                      </div>
                      
                      {/* Donut Chart Visualization (CSS Conic) */}
                      <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-full shrink-0 shadow-lg shadow-emerald-500/20" 
                               style={{ 
                                   background: `conic-gradient(#10b981 ${overallStats.readiness}%, var(--tw-prose-invert-headings, #cbd5e1) 0)` 
                               }}>
                              <div className={`absolute inset-1 rounded-full flex items-center justify-center ${isCrescere ? 'bg-white' : 'bg-white dark:bg-slate-900'}`}>
                                  {overallStats.readiness === 100 ? (
                                      <CheckCircle2 size={16} className="text-emerald-500" />
                                  ) : (
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                  )}
                              </div>
                          </div>
                          <div className="flex-1 space-y-1">
                              <div className="flex justify-between text-[10px] font-medium text-slate-400">
                                  <span>Critical Gaps</span>
                                  <span className={`font-bold ${isCrescere ? 'text-slate-900' : 'text-slate-900 dark:text-white'}`}>{overallStats.gaps}</span>
                              </div>
                              <div className={`h-1.5 w-full rounded-full overflow-hidden ${isCrescere ? 'bg-slate-100' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                  <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${overallStats.totalTopics > 0 ? (overallStats.gaps / overallStats.totalTopics) * 100 : 0}%` }}></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </button>
          )}
      </div>

      {/* Render Modals via Portal */}
      {selectedExam && (
          <BlueprintModal exam={selectedExam} onClose={() => setSelectedExam(null)} />
      )}

      {trackerOpen && (
          <CompetencyAuditModal 
              onClose={() => setTrackerOpen(false)} 
              data={competencyData} 
              onUpdate={updateCompetency} 
          />
      )}

    </div>
  );
};

export default ExamTOS;
