
import React, { useState, useEffect } from 'react';
import { decemberQuestions } from '../data/questions';
import { 
  Eye, 
  EyeOff, 
  BrainCircuit, 
  CalendarDays,
  Lightbulb,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

interface ActiveRecallWidgetProps {
  className?: string;
}

const ActiveRecallWidget: React.FC<ActiveRecallWidgetProps> = ({ className }) => {
  // Determine start index based on current day (1-31)
  const getTodayIndex = () => {
    const today = new Date().getDate();
    // Ensure we don't crash if array is smaller than the date (though currently mapped 1-31)
    const index = Math.min(Math.max(0, today - 1), decemberQuestions.length - 1);
    return index;
  };

  const [isRevealed, setIsRevealed] = useState(false);
  const currentIndex = getTodayIndex();
  const currentCard = decemberQuestions[currentIndex];

  // Color coding based on NP Category
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'NP1': return 'bg-emerald-500 shadow-emerald-500/30'; // Community
      case 'NP2': return 'bg-pink-500 shadow-pink-500/30';    // Maternal
      case 'NP3': return 'bg-blue-500 shadow-blue-500/30';    // MedSurg
      case 'NP4': return 'bg-orange-500 shadow-orange-500/30';  // MedSurg 2
      case 'NP5': return 'bg-violet-500 shadow-violet-500/30';  // Psych
      default: return 'bg-slate-500 shadow-slate-500/30';
    }
  };

  const getTopicColor = (cat: string) => {
      switch (cat) {
      case 'NP1': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'NP2': return 'text-pink-400 border-pink-500/20 bg-pink-500/10';
      case 'NP3': return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
      case 'NP4': return 'text-orange-400 border-orange-500/20 bg-orange-500/10';
      case 'NP5': return 'text-violet-400 border-violet-500/20 bg-violet-500/10';
      default: return 'text-slate-400 border-slate-500/20 bg-slate-500/10';
    }
  }

  const topicTheme = getTopicColor(currentCard.category);

  return (
    <div className={`flex flex-col bg-white/80 dark:bg-[#0B1121]/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-slate-200/50 dark:border-white/10 overflow-hidden relative group h-full ${className}`}>
      
      {/* Cinematic Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/5 dark:bg-pink-600/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center p-5 sm:p-6 border-b border-slate-100 dark:border-white/5 relative z-10 bg-gradient-to-b from-white/50 to-transparent dark:from-white/5">
        <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20 text-white ring-1 ring-white/20">
                <BrainCircuit size={20} />
            </div>
            <div>
                <h3 className="font-black text-sm text-slate-800 dark:text-white leading-tight tracking-tight">Active Recall</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider opacity-80">Question of the Day</p>
            </div>
        </div>
        
        {/* Date Pill */}
        <div className="ml-auto px-3 py-1.5 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-1.5 backdrop-blur-md">
            <CalendarDays size={12} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300">Dec {currentCard.day}</span>
        </div>
      </div>

      {/* --- CARD CONTENT --- */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center relative z-10 pb-20">
         <div className="transition-all duration-300">
            
            {/* Meta Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white shadow-lg ${getCategoryColor(currentCard.category)}`}>
                    {currentCard.category}
                </span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${topicTheme}`}>
                    {currentCard.topic}
                </span>
            </div>

            {/* The Question */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-snug mb-8 drop-shadow-sm">
                {currentCard.question}
            </h2>

            {/* The Reveal Section (Interactive Glass) */}
            <button 
                onClick={() => setIsRevealed(!isRevealed)}
                className={`w-full relative rounded-2xl border transition-all duration-500 overflow-hidden cursor-pointer group/reveal text-left ${
                    isRevealed 
                    ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 dark:border-emerald-500/40 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]' 
                    : 'bg-slate-50/50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-pink-300 dark:hover:border-pink-500/50 hover:bg-white dark:hover:bg-white/10 shadow-inner'
                }`}
            >
                <div className="p-5 min-h-[100px] flex items-center">
                    {/* HIDDEN STATE */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 transition-all duration-500 ${isRevealed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center text-pink-500 group-hover/reveal:scale-110 transition-transform">
                            <HelpCircle size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover/reveal:text-pink-500 transition-colors">Tap to Reveal Answer</span>
                    </div>

                    {/* REVEALED STATE */}
                    <div className={`flex items-start gap-4 transition-all duration-500 w-full ${isRevealed ? 'opacity-100 blur-0 translate-y-0' : 'opacity-0 blur-md translate-y-4'}`}>
                        <div className="shrink-0 w-10 h-10 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white mt-1">
                            <CheckCircle2 size={20} strokeWidth={3} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5 opacity-80">Correct Answer</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-white leading-relaxed">
                                {currentCard.answer}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Reveal Progress Bar */}
                <div className={`h-1 bg-gradient-to-r from-pink-500 to-purple-500 absolute bottom-0 left-0 transition-all duration-500 ${isRevealed ? 'w-full opacity-0' : 'w-0 opacity-100 group-hover/reveal:w-full'}`}></div>
            </button>

         </div>
      </div>

      {/* --- BOTTOM GLOW BAR --- */}
      <div className={`h-1.5 w-full transition-colors duration-500 absolute bottom-0 left-0 ${isRevealed ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-white/5'}`}></div>

    </div>
  );
};

export default ActiveRecallWidget;
