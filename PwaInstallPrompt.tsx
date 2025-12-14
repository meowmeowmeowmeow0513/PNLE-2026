import React, { useState, useEffect } from 'react';
import { GraduationCap, X, Download, Share, PlusSquare } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const PwaInstallPrompt = () => {
  const { themeMode } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // --- LOGO SYSTEM RECREATION ---
  const isCrescere = themeMode === 'crescere';
  const isDark = themeMode === 'dark';

  // Exact styles from Sidebar
  const logoBase = `relative p-3 rounded-2xl shrink-0 overflow-hidden transition-all duration-200 will-change-transform`;
  
  const logoBg = isCrescere
    ? 'bg-gradient-to-br from-rose-500 via-rose-400 to-amber-400 text-white shadow-lg shadow-rose-500/20'
    : 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20';

  const logoGlow = isCrescere
    ? 'from-white/0 via-white/40 to-white/0'
    : isDark
      ? 'from-white/0 via-pink-300/35 to-white/0'
      : 'from-white/0 via-pink-400/30 to-white/0';

  const companionClass = isCrescere
    ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 bg-[length:200%_auto] animate-[gradient_4s_ease_infinite] text-transparent bg-clip-text filter drop-shadow-sm'
    : isDark
      ? 'bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-[length:200%_auto] animate-[gradient_4s_ease_infinite] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]'
      : 'bg-gradient-to-r from-pink-600 to-rose-600 text-transparent bg-clip-text';

  // --- PWA LOGIC ---
  useEffect(() => {
    // 1. Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // 2. Listen for Install Event (Android/PC)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show iOS prompt if not standalone
    if (iOS && !window.matchMedia('(display-mode: standalone)').matches) {
        // Simple delay to not annoy user immediately
        setTimeout(() => setIsVisible(true), 3000); 
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Animation Styles */}
      <style>{`
        @keyframes rc_logo_sheen {
          0% { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(140%) skewX(-18deg); opacity: 0; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        /* Auto-trigger sheen every 5s */
        .rc-logo .rc-sheen { animation: rc_logo_sheen 3s infinite; animation-delay: 1s; } 
        .rc-logo:hover .rc-cap { transform: translateY(-1px) rotate(-3deg); }
        .rc-logo:hover .rc-ring { opacity: 1; transform: scale(1.06); }
      `}</style>

      {/* --- THE NOTIFICATION BANNER --- */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-[9999] animate-in slide-in-from-bottom-10 fade-in duration-500">
        <div className={`
            relative overflow-hidden p-1 rounded-[1.5rem]
            ${isCrescere ? 'bg-gradient-to-br from-rose-200/50 to-amber-200/50' : 'bg-gradient-to-br from-pink-500/20 to-purple-500/20'}
            backdrop-blur-xl shadow-2xl border border-white/20
        `}>
            <div className="bg-white/90 dark:bg-[#0f172a]/95 rounded-[1.2rem] p-4 flex items-center gap-4 relative overflow-hidden">
                
                {/* --- LOGO SYSTEM (RECREATED) --- */}
                <div className={`rc-logo ${logoBase} ${logoBg}`}>
                    <div className={`rc-ring absolute inset-0 rounded-2xl opacity-0 pointer-events-none transition-all duration-300 ${isCrescere ? 'ring-2 ring-rose-200/60' : 'ring-2 ring-pink-400/30'}`} />
                    <div className={`rc-sheen absolute inset-0 bg-gradient-to-tr ${logoGlow} -translate-x-[160%] skew-x-[-18deg] opacity-0 pointer-events-none`} />
                    <GraduationCap size={24} className={`rc-cap relative z-10 drop-shadow-sm transition-transform duration-300`} />
                </div>

                {/* --- TEXT CONTENT --- */}
                <div className="flex-1 min-w-0">
                    <h4 className={`font-black text-sm leading-tight mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Install <span className={companionClass}>App</span>
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                        {isIOS ? 'Add to Home Screen for the best experience.' : 'Install for offline access & notifications.'}
                    </p>
                </div>

                {/* --- ACTION BUTTONS --- */}
                {isIOS ? (
                    <div className="flex flex-col items-end gap-1">
                        <button onClick={() => setIsVisible(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleInstallClick}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all flex items-center gap-2
                            ${isCrescere ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-pink-500 to-purple-600'}`}
                        >
                            <Download size={14} /> Install
                        </button>
                        <button onClick={() => setIsVisible(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* --- IOS INSTRUCTIONS EXPANDER (Only visible on iOS) --- */}
            {isIOS && (
                <div className="bg-slate-50/90 dark:bg-slate-900/90 p-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 border-t border-slate-200 dark:border-slate-800 rounded-b-[1.2rem]">
                    <span>Tap</span>
                    <Share size={12} className="text-blue-500" />
                    <span>then</span>
                    <PlusSquare size={12} className="text-slate-900 dark:text-white" />
                    <span>"Add to Home Screen"</span>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default PwaInstallPrompt;
