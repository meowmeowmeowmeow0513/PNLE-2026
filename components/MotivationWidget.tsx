
import React from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface MotivationWidgetProps {
  className?: string;
}

const MotivationWidget: React.FC<MotivationWidgetProps> = ({ className }) => {
  const { fontFamily, fontSize } = useTheme();

  // --- ADAPTIVE TYPOGRAPHY LOGIC ---
  
  // Mono fonts are harder to read in italics, so we disable italics for them.
  const isMono = fontFamily === 'mono';
  
  // Increase line height and letter spacing for larger accessibility sizes
  const isLargeText = fontSize === 'large' || fontSize === 'extra-large';
  
  const quoteClass = `
    text-white/95 
    ${isMono ? 'font-normal not-italic tracking-wide' : 'font-medium italic'} 
    ${isLargeText ? 'leading-loose text-lg sm:text-xl' : 'leading-relaxed text-sm sm:text-base'}
    text-shadow-sm transition-all duration-300
  `;

  const containerClass = `
    relative w-full rounded-3xl overflow-hidden shadow-lg group 
    border border-slate-200 dark:border-white/5 bg-slate-900 
    flex flex-col min-h-[180px]
    ${className || ''}
  `;

  return (
    <div className={containerClass}>
      {/* Background Image with Zoom Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
            src="https://firebasestorage.googleapis.com/v0/b/pnle-review-companion.firebasestorage.app/o/Crescere.jpg?alt=media&token=53e9d3e8-1973-4644-b9d0-b592d5ba78ac" 
            alt="Batch Crescere" 
            className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${isLargeText ? 'opacity-40' : 'opacity-60 group-hover:opacity-50'}`}
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/90 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-end h-full">
         <div className="mb-auto transform group-hover:-translate-y-1 transition-transform duration-500">
            <Quote className="text-pink-500 mb-2 sm:mb-3 opacity-80 w-5 h-5 sm:w-6 sm:h-6" />
            <p className={quoteClass}>
                "Passing the PNLE is not about being the smartest — it’s about being prepared, consistent, and confident. Keep pushing, keep believing. Your license is waiting."
            </p>
         </div>
         
         <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-4">
            <div className="flex items-center gap-3">
                <div className="h-8 w-1 sm:h-10 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899]"></div>
                <div className="min-w-0">
                    <span className="block text-xs sm:text-sm font-bold text-white truncate">Ma'am Chona</span>
                    <span className="block text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest truncate">Batch Adviser • Crescere</span>
                </div>
            </div>
            <Sparkles size={18} className="text-amber-400 animate-pulse shrink-0" />
         </div>
      </div>
    </div>
  );
};

export default MotivationWidget;
