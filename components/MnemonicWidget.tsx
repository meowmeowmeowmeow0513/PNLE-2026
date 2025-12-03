
import React, { useMemo, useState } from 'react';
import { Lightbulb, BookOpen, Sparkles, ChevronDown, ChevronUp, AlertTriangle, Loader2 } from 'lucide-react';
import { mnemonics } from '../data/mnemonicData';
import { GoogleGenAI } from "@google/genai";

const MnemonicWidget: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  // Automated Logic: Select mnemonic based on day of month
  const todayMnemonic = useMemo(() => {
    const dayOfMonth = new Date().getDate();
    const index = Math.min(Math.max(0, dayOfMonth - 1), 30);
    return mnemonics[index] || mnemonics[0];
  }, []);

  const handleDeepDive = async () => {
    if (isExpanded) {
        setIsExpanded(false);
        return;
    }

    // If we already have data (and it wasn't an error), just expand
    if (explanation && !explanation.startsWith("Error")) {
        setIsExpanded(true);
        return;
    }

    setIsExpanded(true);
    setLoading(true);
    setExplanation(null);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API Key is missing. Please check your configuration.");
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const systemInstruction = `You are a top-tier Clinical Nursing Instructor helping a student master a specific medical mnemonic.
    
        Structure your response with these exact sections (do not use markdown headers like # or ##, just bold labels):
        1. **Clinical Application:** Explain *when* and *why* we use this assessment or intervention in a hospital setting.
        2. **Memory Hook:** Give a clever trick, visualization, or rhyme to make it stick forever.
        3. **Board Exam Alert:** Identify one common trick question, 'Red Flag', or priority nursing action related to this topic that appears on the PNLE/NCLEX.

        Tone: Professional, high-yield, and concise (max 250 words total).
        Format: Plain text with bolding for emphasis. No JSON.`;

        const prompt = `
          Mnemonic: ${todayMnemonic.code}
          Category: ${todayMnemonic.category}
          Meaning: ${todayMnemonic.meaning}

          Provide a clinical deep dive.
        `;

        // Switch to gemini-2.5-flash for better speed and stability in UI widgets
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash', 
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });

        if (response.text) {
             setExplanation(response.text);
        } else {
             throw new Error("Received empty response from the AI model.");
        }
    } catch (error: any) {
        console.error("Deep Dive Error:", error);
        // Provide a user-friendly error message while logging the detail
        let userMessage = "Unable to load instructor notes.";
        
        if (error.message?.includes("API Key")) {
            userMessage = "System Error: API Key is missing.";
        } else if (error.message?.includes("404") || error.message?.includes("not found")) {
            userMessage = "Connection Error: AI Model unavailable.";
        } else if (error.message?.includes("Failed to fetch")) {
             userMessage = "Network Error: Please check your internet connection.";
        }

        setExplanation(`Error: ${userMessage} (${error.message || "Unknown"})`);
    } finally {
        setLoading(false);
    }
  };

  // Map text colors based on the theme string
  const getColorClasses = (theme: string) => {
    switch (theme) {
      case 'pink': return 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800';
      case 'red': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'sky': return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800';
      case 'violet': return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800';
      case 'orange': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const colors = getColorClasses(todayMnemonic.colorTheme);
  const btnColor = todayMnemonic.colorTheme === 'pink' ? 'bg-pink-600 hover:bg-pink-700' : 
                   todayMnemonic.colorTheme === 'red' ? 'bg-red-600 hover:bg-red-700' :
                   todayMnemonic.colorTheme === 'sky' ? 'bg-sky-600 hover:bg-sky-700' :
                   todayMnemonic.colorTheme === 'violet' ? 'bg-violet-600 hover:bg-violet-700' :
                   todayMnemonic.colorTheme === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                   'bg-emerald-600 hover:bg-emerald-700';

  return (
    <div className={`rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md overflow-hidden flex flex-col ${colors}`}>
      
      {/* Main Content Area */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
            <div className="p-2 bg-white/60 dark:bg-black/20 rounded-lg">
                <Lightbulb size={20} className="fill-current" />
            </div>
            <span className="font-bold uppercase tracking-wider text-xs opacity-80">
                Mnemonic of the Day
            </span>
            </div>
            <span className="px-3 py-1 bg-white/60 dark:bg-black/20 rounded-full text-xs font-bold">
            {todayMnemonic.category}
            </span>
        </div>

        <div className="space-y-3">
            <div>
            <h3 className="text-2xl font-black tracking-tight mb-1">
                {todayMnemonic.code}
            </h3>
            <p className="text-sm font-semibold opacity-90 flex items-center gap-2">
                <BookOpen size={14} />
                {todayMnemonic.title}
            </p>
            </div>

            <div className="bg-white/50 dark:bg-black/10 rounded-xl p-4 border border-white/20 dark:border-white/5">
            <p className="whitespace-pre-line font-mono text-sm leading-relaxed font-medium">
                {todayMnemonic.meaning}
            </p>
            </div>
        </div>
      </div>
      
      {/* Instructor's Deep Dive Section */}
      {isExpanded && (
          <div className="border-t border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/20 p-6 animate-in slide-in-from-top-2 fade-in duration-300">
              {loading ? (
                  <div className="space-y-3 opacity-60">
                      <div className="flex items-center gap-2 text-sm font-bold animate-pulse">
                         <Loader2 size={16} className="animate-spin" />
                         <span>Consulting Instructor...</span>
                      </div>
                      <div className="h-4 bg-current rounded opacity-20 w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-current rounded opacity-20 w-full animate-pulse"></div>
                      <div className="h-4 bg-current rounded opacity-20 w-5/6 animate-pulse"></div>
                  </div>
              ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="flex items-center gap-2 mb-3 text-sm font-bold uppercase tracking-wider opacity-80 text-amber-600 dark:text-amber-400">
                          <AlertTriangle size={16} />
                          <span>Board Exam Alert</span>
                      </div>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {explanation}
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* Footer Actions */}
      <div className="p-4 pt-2 flex items-center justify-between">
         <p className="text-[10px] opacity-60 font-medium italic pl-2">
            Day {new Date().getDate()} / 31
         </p>
         
         <button 
            onClick={handleDeepDive}
            className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 ${btnColor}`}
         >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isExpanded ? 'Close Insights' : '✨ Deep Dive'}
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
         </button>
      </div>
    </div>
  );
};

export default MnemonicWidget;
