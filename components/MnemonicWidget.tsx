import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Lightbulb, BookOpen, Sparkles, ChevronDown, AlertTriangle, Loader2, Eye, EyeOff, RefreshCw, GraduationCap, ShieldAlert } from 'lucide-react';
import { mnemonics } from '../data/mnemonicData';
import { GoogleGenAI } from "@google/genai";

// Lightweight Markdown Parser with Enhanced Typography
const SimpleMarkdown = ({ text, themeColor }: { text: string, themeColor: string }) => {
  if (!text) return null;
  const lines = text.split('\n');
  
  return (
    <div className="space-y-3 pb-4">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Check for Headers (defined in prompt as **Header:**)
        if (trimmed.startsWith('**') && trimmed.includes(':') && trimmed.length < 50) {
             const cleanHeader = trimmed.replace(/\*\*/g, '');
             return (
                 <h4 key={index} className={`font-black text-xs uppercase tracking-widest mt-6 mb-2 flex items-center gap-2 ${themeColor}`}>
                     {cleanHeader.includes('Red Flag') ? <ShieldAlert size={14} /> : <GraduationCap size={14} />}
                     {cleanHeader}
                 </h4>
             );
        }

        // Bullet Points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.substring(2);
          return (
            <div key={index} className="flex gap-3 pl-1 animate-in slide-in-from-left-2 fade-in duration-500" style={{ animationDelay: `${index * 30}ms` }}>
              <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${themeColor.replace('text-', 'bg-')}`}></div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{parseBold(content)}</p>
            </div>
          );
        }

        // Numbered Lists
        if (/^\d+\.\s/.test(trimmed)) {
          const content = trimmed.replace(/^\d+\.\s/, '');
          return (
             <div key={index} className="flex gap-3 pl-1 animate-in slide-in-from-left-2 fade-in duration-500" style={{ animationDelay: `${index * 30}ms` }}>
                <span className={`font-bold text-xs mt-0.5 ${themeColor}`}>{trimmed.match(/^\d+\./)?.[0]}</span>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{parseBold(content)}</p>
             </div>
          );
        }

        return (
          <p key={index} className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed animate-in fade-in duration-500">
            {parseBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} className="font-bold text-slate-800 dark:text-slate-100">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
};

interface MnemonicWidgetProps {
    className?: string;
}

const MnemonicWidget: React.FC<MnemonicWidgetProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // New State for Active Recall on Mnemonic Meaning
  const [isMeaningRevealed, setIsMeaningRevealed] = useState(false);

  const todayMnemonic = useMemo(() => {
    const dayOfMonth = new Date().getDate();
    const index = Math.min(Math.max(0, dayOfMonth - 1), 30);
    return mnemonics[index] || mnemonics[0];
  }, []);

  const fetchAIExplanation = async (forceRefresh = false) => {
    if (!forceRefresh && explanation && !explanation.startsWith("Error")) return;

    setLoading(true);
    if (forceRefresh) setExplanation(null);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key is missing.");

        const ai = new GoogleGenAI({ apiKey });
        
        // REFINED PROMPT FOR QUALITY AND ACCURACY
        const systemInstruction = `Role: You are a legendary Nursing Review Lecturer specializing in the Philippine Nurse Licensure Exam (PNLE) and NCLEX. Your goal is to make concepts stick instantly using the "Active Recall" method.

        Task: Provide a high-yield clinical deep dive for the mnemonic: "${todayMnemonic.code}" (${todayMnemonic.title}).

        Strict Output Structure (Use these headers exactly):
        1. **Clinical Context:** Briefly explain the pathophysiology or clinical scenario where this applies. Why does this mnemonic exist?
        2. **The Breakdown:** Brief explanation of the components if needed for clarity.
        3. **Memory Hack:** A vivid, perhaps slightly weird or funny visualization/analogy to help remember it. Brains remember weird.
        4. **Board Exam Red Flag:** A specific "Do Not", "Priority Action", or "Common Trick Question" often tested regarding this topic.

        Constraints:
        - Max 250 words.
        - Tone: Encouraging, authoritative, sharp.
        - Format: Clean text. Use **Bold** for headers and emphasis. No markdown code blocks.`;

        const prompt = `Explain ${todayMnemonic.code} - ${todayMnemonic.category}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash', 
          contents: prompt,
          config: { systemInstruction: systemInstruction, temperature: 0.7 } // Slight temp for creativity in "Memory Hack"
        });

        if (response.text) setExplanation(response.text);
        else throw new Error("Received empty response from the AI model.");
        
        // Scroll to top on new content
        if (scrollRef.current) scrollRef.current.scrollTop = 0;

    } catch (error: any) {
        console.error("Deep Dive Error:", error);
        setExplanation(`Error: ${error.message || "Unknown error"}`);
    } finally {
        setLoading(false);
    }
  };

  const handleToggleExpand = () => {
      if (!isExpanded) {
          setIsExpanded(true);
          if (!explanation) fetchAIExplanation();
      } else {
          setIsExpanded(false);
      }
  };

  const getDailyTheme = () => {
    const themes = ['pink', 'blue', 'emerald', 'violet', 'orange', 'cyan', 'rose', 'indigo'];
    const dayOfMonth = new Date().getDate();
    const index = dayOfMonth % themes.length;
    return themes[index];
  };

  const currentTheme = getDailyTheme();

  // Premium Gradients for Container Border & Glows
  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'pink': return 'from-pink-500/10 to-rose-600/5 border-pink-200 dark:border-pink-500/20';
      case 'blue': return 'from-blue-500/10 to-indigo-600/5 border-blue-200 dark:border-blue-500/20';
      case 'emerald': return 'from-emerald-500/10 to-teal-600/5 border-emerald-200 dark:border-emerald-500/20';
      case 'violet': return 'from-violet-500/10 to-purple-600/5 border-violet-200 dark:border-violet-500/20';
      case 'orange': return 'from-orange-500/10 to-amber-600/5 border-orange-200 dark:border-orange-500/20';
      case 'cyan': return 'from-cyan-500/10 to-sky-600/5 border-cyan-200 dark:border-cyan-500/20';
      case 'rose': return 'from-rose-500/10 to-pink-600/5 border-rose-200 dark:border-rose-500/20';
      case 'indigo': return 'from-indigo-500/10 to-blue-600/5 border-indigo-200 dark:border-indigo-500/20';
      default: return 'from-slate-500/10 to-gray-600/5 border-slate-200 dark:border-slate-500/20';
    }
  };

  const getTextGradient = (theme: string) => {
      switch (theme) {
          case 'pink': return 'from-pink-500 to-rose-600 dark:from-pink-300 dark:to-rose-400';
          case 'blue': return 'from-blue-500 to-indigo-600 dark:from-blue-300 dark:to-indigo-400';
          case 'emerald': return 'from-emerald-500 to-teal-600 dark:from-emerald-300 dark:to-teal-400';
          case 'violet': return 'from-violet-500 to-purple-600 dark:from-violet-300 dark:to-purple-400';
          case 'orange': return 'from-orange-500 to-amber-600 dark:from-orange-300 dark:to-amber-400';
          case 'cyan': return 'from-cyan-500 to-sky-600 dark:from-cyan-300 dark:to-sky-400';
          case 'rose': return 'from-rose-500 to-pink-600 dark:from-rose-300 dark:to-pink-400';
          case 'indigo': return 'from-indigo-500 to-violet-600 dark:from-indigo-300 dark:to-violet-400';
          default: return 'from-slate-600 to-slate-800';
      }
  };

  const getIconColor = (theme: string) => {
      switch (theme) {
          case 'pink': return 'text-pink-500 dark:text-pink-400';
          case 'blue': return 'text-blue-500 dark:text-blue-400';
          case 'emerald': return 'text-emerald-500 dark:text-emerald-400';
          case 'violet': return 'text-violet-500 dark:text-violet-400';
          case 'orange': return 'text-orange-500 dark:text-orange-400';
          case 'cyan': return 'text-cyan-500 dark:text-cyan-400';
          case 'rose': return 'text-rose-500 dark:text-rose-400';
          case 'indigo': return 'text-indigo-500 dark:text-indigo-400';
          default: return 'text-slate-500 dark:text-slate-400';
      }
  };

  const themeClasses = getThemeColors(currentTheme);
  const textGradient = getTextGradient(currentTheme);
  const iconColor = getIconColor(currentTheme);

  return (
    <div className={`flex flex-col bg-white/80 dark:bg-[#0B1121]/80 backdrop-blur-2xl rounded-3xl shadow-xl border overflow-hidden relative group h-full ${themeClasses} ${className || ''}`}>
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${themeClasses.replace('border', 'from').split(' ')[0]} rounded-full blur-[80px] opacity-20 pointer-events-none`}></div>

      {/* MAIN CONTENT (Flex Column) */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
          
          {/* Header & Title Section */}
          <div className="px-6 pt-6 pb-2 shrink-0">
              <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                      <div className={`p-2.5 bg-white/50 dark:bg-white/10 rounded-xl shadow-sm backdrop-blur-md ${iconColor}`}>
                          <Lightbulb size={20} className="fill-current" />
                      </div>
                      <div>
                          <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Daily Mnemonic</h3>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 opacity-80">
                              Day {new Date().getDate()}
                          </p>
                      </div>
                  </div>
                  <span className="px-3 py-1 bg-white/50 dark:bg-white/10 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 backdrop-blur-md shadow-sm">
                      {todayMnemonic.category}
                  </span>
              </div>

              <div className="mb-2">
                  <h3 className={`text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${textGradient} drop-shadow-sm leading-none mb-2`}>
                      {todayMnemonic.code}
                  </h3>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <BookOpen size={16} className={iconColor} />
                      {todayMnemonic.title}
                  </p>
              </div>
          </div>

          {/* Meaning Section (Scrollable Area) */}
          <div className="flex-1 px-6 pb-2 min-h-0 overflow-hidden flex flex-col">
              <div 
                  className={`bg-white/60 dark:bg-black/20 rounded-2xl p-5 border border-white/40 dark:border-white/5 shadow-inner backdrop-blur-sm flex-1 relative transition-all cursor-pointer group/meaning ring-1 ring-white/10 dark:ring-white/5 overflow-hidden flex flex-col`}
                  onClick={() => setIsMeaningRevealed(!isMeaningRevealed)}
              >
                  {/* Scrollable Text Container */}
                  <div className={`w-full h-full overflow-y-auto custom-scrollbar transition-all duration-500 ${isMeaningRevealed ? 'opacity-100 blur-0' : 'opacity-30 blur-md grayscale select-none'}`}>
                      <p className="whitespace-pre-line text-lg leading-relaxed font-bold text-slate-700 dark:text-slate-200 pb-8">
                          {todayMnemonic.meaning}
                      </p>
                  </div>

                  {/* Cover for Hidden State */}
                  {!isMeaningRevealed && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                          <div className={`p-4 rounded-full bg-white dark:bg-slate-800 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 ${iconColor} group-hover/meaning:scale-110 transition-transform mb-3`}>
                              <Eye size={32} />
                          </div>
                          <span className="px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5">
                              Tap to Reveal
                          </span>
                      </div>
                  )}
              </div>
          </div>

          {/* Footer Trigger (Static, part of flow) */}
          <div className="p-4 shrink-0 z-20">
              <button 
                onClick={handleToggleExpand}
                className="w-full py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all rounded-xl flex items-center justify-center gap-2 group cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className={`p-1 rounded-full text-white transition-all shadow-md group-hover:scale-110 ${isExpanded ? 'bg-slate-400 rotate-180' : `bg-gradient-to-r ${textGradient}`}`}>
                    {isExpanded ? <ChevronDown size={14} /> : <Sparkles size={14} />}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {isExpanded ? 'Close Insights' : 'AI Deep Dive'}
                </span>
              </button>
          </div>
      </div>
      
      {/* Instructor's Deep Dive Section (Slide Up) */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/10 transition-all duration-500 ease-spring shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col ${isExpanded ? 'h-[92%]' : 'h-0 overflow-hidden'}`}
      >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/50 shrink-0 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className={iconColor} />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Instructor's Notes
                  </span>
              </div>
              <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); fetchAIExplanation(true); }}
                    disabled={loading}
                    className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ${loading ? 'animate-spin' : ''}`}
                    title="Regenerate"
                  >
                      <RefreshCw size={16} />
                  </button>
                  <button 
                    onClick={handleToggleExpand}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                      <ChevronDown size={16} />
                  </button>
              </div>
          </div>

          {/* Panel Content (Scrollable) */}
          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/50 dark:bg-black/10"
          >
              {loading ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 gap-4 opacity-70">
                      <div className="relative">
                          <Loader2 size={40} className={`animate-spin ${iconColor}`} />
                          <div className={`absolute inset-0 blur-lg opacity-50 rounded-full ${iconColor.replace('text-', 'bg-')}`}></div>
                      </div>
                      <div className="text-center">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Consulting the Chief Nurse...</span>
                          <span className="text-[10px] text-slate-400">Generating high-yield insights</span>
                      </div>
                  </div>
              ) : (
                  <div>
                      {explanation?.startsWith("Error") ? (
                          <div className="flex flex-col items-center justify-center h-full text-center p-4">
                              <p className="text-red-500 text-sm font-bold bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 mb-4">{explanation}</p>
                              <button onClick={() => fetchAIExplanation(true)} className="text-xs text-slate-500 underline hover:text-slate-700">Try Again</button>
                          </div>
                      ) : (
                          <>
                            <SimpleMarkdown text={explanation || ""} themeColor={iconColor} />
                            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
                                <p className="text-[9px] text-slate-400 italic">AI-generated content. Always verify with official nursing textbooks.</p>
                            </div>
                          </>
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default MnemonicWidget;
