
import React, { useMemo } from 'react';
import { Lightbulb, BookOpen } from 'lucide-react';
import { mnemonics } from '../data/mnemonicData';

const MnemonicWidget: React.FC = () => {
  // 100% Automated Logic:
  // Get the day of the month (1-31).
  // Subtract 1 to get array index (0-30).
  const todayMnemonic = useMemo(() => {
    const dayOfMonth = new Date().getDate();
    // Safety check: ensure index is within bounds (though logic guarantees 0-30)
    const index = Math.min(Math.max(0, dayOfMonth - 1), 30);
    return mnemonics[index];
  }, []);

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

  return (
    <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-md ${colors}`}>
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
      
      <div className="mt-4 flex justify-end">
         <p className="text-[10px] opacity-60 font-medium italic">
            Day {new Date().getDate()} / 31
         </p>
      </div>
    </div>
  );
};

export default MnemonicWidget;
