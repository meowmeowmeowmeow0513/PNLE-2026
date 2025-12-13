
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
    ${isLargeText ? 'leading-loose text-xl' : 'leading-relaxed text-lg'}
    text-shadow-sm transition-all duration-300
  `;

  const containerClass = `
    relative w-full rounded-3xl overflow-hidden shadow-lg group 
    border border-slate-200 dark:border-white/5 bg-slate-900 
    flex flex-col
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
      <div className="relative z-10 p-8 flex flex-col justify-end h-full">
         <div className="mb-auto transform group-hover:-translate-y-1 transition-transform duration-500">
            <Quote size={32} className="text-pink-500 mb-4 opacity-80" />
            <p className={quoteClass}>
                "Passing the PNLE is not about being the smartest — it’s about being prepared, consistent, and confident. Keep pushing, keep believing. Your license is waiting."
            </p>
         </div>
         
         <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-1 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899]"></div>
                <div>
                    <span className="block text-sm font-bold text-white">Ma'am Chona</span>
                    <span className="block text-xs text-slate-400 uppercase tracking-widest">Batch Adviser • Crescere</span>
                </div>
            </div>
            <Sparkles size={20} className="text-amber-400 animate-pulse" />
         </div>
      </div>
    </div>
  );
};

export default MotivationWidget;
