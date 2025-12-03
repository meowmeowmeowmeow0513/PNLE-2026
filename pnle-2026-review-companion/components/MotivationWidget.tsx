
import React from 'react';
import { Quote, Sparkles } from 'lucide-react';

interface MotivationWidgetProps {
  className?: string;
}

const MotivationWidget: React.FC<MotivationWidgetProps> = ({ className }) => {
  return (
    <div className={`relative w-full rounded-3xl overflow-hidden shadow-lg group border border-slate-200 dark:border-white/5 bg-slate-900 min-h-[280px] ${className || ''}`}>
      {/* Background Image with Zoom Effect */}
      <img 
        src="https://firebasestorage.googleapis.com/v0/b/pnle-review-companion.firebasestorage.app/o/Crescere.jpg?alt=media&token=53e9d3e8-1973-4644-b9d0-b592d5ba78ac" 
        alt="Batch Crescere" 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-50"
      />
      
      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/80 to-transparent"></div>

      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
         <div className="mb-6 transform group-hover:-translate-y-1 transition-transform duration-500">
            <Quote size={32} className="text-pink-500 mb-4 opacity-80" />
            <p className="text-white/95 font-medium text-lg italic leading-relaxed text-shadow-sm">
                "Passing the PNLE is not about being the smartest — it’s about being prepared, consistent, and confident. Keep pushing, keep believing. Your license is waiting."
            </p>
         </div>
         
         <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
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
