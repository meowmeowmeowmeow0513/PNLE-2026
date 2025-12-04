
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { 
    Pause, Play, RotateCcw, Maximize2, 
    ChevronUp, ChevronDown, Volume2, VolumeX, 
    MonitorPlay, Minimize2, ExternalLink
} from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { 
    timeLeft, isActive, mode, pipWindow, focusTask, isMuted, initialTime,
    toggleTimer, resetTimer, setPipWindow, toggleMute
  } = usePomodoro();
  
  // -- STATE --
  const [isAnchored, setIsAnchored] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // -- THEME SYNC FOR PIP --
  useEffect(() => {
    if (!pipWindow) return;

    const syncTheme = () => {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            pipWindow.document.documentElement.classList.add('dark');
        } else {
            pipWindow.document.documentElement.classList.remove('dark');
        }
    };

    // Initial sync
    syncTheme();

    // Watch for changes on the main window's html element
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, [pipWindow]);

  // -- ANCHOR SYSTEM --
  useEffect(() => {
    const checkAnchor = () => {
        const anchorEl = document.getElementById('video-anchor');
        const isPomoPage = activeItem === 'Pomodoro Timer';
        
        if (isPomoPage && anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            // Check if visible
            if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
                setAnchorRect(rect);
                setIsAnchored(true);
                // Auto-expand if anchoring, collapse if floating initially
                if (!isAnchored) setIsExpanded(true); 
                return;
            }
        }
        setIsAnchored(false);
    };

    checkAnchor();
    const interval = setInterval(checkAnchor, 200); 
    window.addEventListener('resize', checkAnchor);
    window.addEventListener('scroll', checkAnchor);

    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', checkAnchor);
        window.removeEventListener('scroll', checkAnchor);
    };
  }, [activeItem, isAnchored]);

  // -- PIP LOGIC --
  const handleTogglePiP = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (pipWindow) {
        pipWindow.close();
        return;
    }

    if (!('documentPictureInPicture' in window)) {
        alert("Picture-in-Picture API not supported.");
        return;
    }

    try {
        const dpip = (window as any).documentPictureInPicture;
        // Request a square-ish window
        const win = await dpip.requestWindow({ width: 350, height: 350 });

        // Initial setup - Theme handled by useEffect now
        const isDark = document.documentElement.classList.contains('dark');
        win.document.documentElement.className = isDark ? 'dark' : '';
        win.document.body.className = "bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex flex-col items-center justify-center h-full overflow-hidden select-none m-0 p-0 transition-colors duration-300";
        
        const style = win.document.createElement('style');
        let cssRules = `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; }
            * { box-sizing: border-box; }
            /* Scrollbar hiding */
            ::-webkit-scrollbar { width: 0px; background: transparent; }
        `;
        
        // Try to copy Tailwind styles
        Array.from(document.styleSheets).forEach(sheet => {
            try {
                if (sheet.href) {
                    const link = win.document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = sheet.href;
                    win.document.head.appendChild(link);
                }
            } catch (e) {}
        });
        
        style.textContent = cssRules;
        win.document.head.appendChild(style);

        win.addEventListener('pagehide', () => setPipWindow(null));
        setPipWindow(win);

    } catch (err) {
        console.error("PiP Error:", err);
    }
  };

  // -- STYLE CALCULATION --
  const getContainerStyle = (): React.CSSProperties => {
      if (isAnchored && anchorRect) {
          return {
              position: 'fixed',
              top: anchorRect.top,
              left: anchorRect.left,
              width: anchorRect.width,
              height: anchorRect.height,
              zIndex: 40,
              borderRadius: '1.5rem',
              transform: 'none',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: 'none',
          };
      } else {
          // Floating Widget
          return {
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: isExpanded ? '300px' : '160px',
              height: isExpanded ? '200px' : '56px',
              zIndex: 50,
              borderRadius: isExpanded ? '24px' : '100px',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isExpanded 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          };
      }
  };

  // -- HELPERS --
  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  const strokeDasharray = 2 * Math.PI * 18; // r=18
  const strokeDashoffset = strokeDasharray - (progress / 100) * strokeDasharray;

  // -- PIP CONTENT (EXTERNAL WINDOW) --
  const PiPContent = pipWindow ? createPortal(
    <div className="relative w-full h-full flex flex-col justify-between bg-slate-50 dark:bg-[#020617] transition-colors duration-300">
        {/* Dynamic Background */}
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${isActive ? 'from-pink-500 via-rose-400 to-orange-400 dark:from-pink-600 dark:via-purple-600 dark:to-indigo-600 animate-pulse' : 'from-cyan-400 via-sky-400 to-blue-400 dark:from-cyan-600 dark:via-blue-600 dark:to-teal-600'}`}></div>
        
        {/* Header */}
        <div className="relative z-10 p-4 flex justify-between items-start w-full">
            <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-pink-600 dark:text-pink-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                    {mode === 'pomodoro' ? 'FOCUS MODE' : 'REST MODE'}
                </span>
                <span className="text-xs text-slate-500 dark:text-white/60 font-medium truncate max-w-[200px]">
                    {focusTask || 'Session Active'}
                </span>
            </div>
            {/* Visualizer Bars (Static Simulation) */}
            <div className="flex items-end gap-1 h-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-1 rounded-full ${isActive ? 'bg-pink-500 animate-pulse' : 'bg-cyan-500'}`} style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>
        </div>

        {/* Main Timer */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
             <span className="text-7xl font-mono font-black tracking-tighter text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-2xl transition-colors duration-300">
                 {formatTime(timeLeft)}
             </span>
        </div>

        {/* Controls */}
        <div className="relative z-10 p-6 flex items-center justify-center gap-6">
             <button onClick={resetTimer} className="p-3 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/70 dark:hover:text-white transition-colors">
                 <RotateCcw size={20} />
             </button>
             <button 
                onClick={toggleTimer} 
                className={`p-5 rounded-full text-white shadow-xl hover:scale-105 transition-transform active:scale-95 ${isActive ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-pink-500 to-rose-600'}`}
             >
                 {isActive ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" className="ml-1"/>}
             </button>
             <button onClick={() => handleTogglePiP()} className="p-3 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/70 dark:hover:text-white transition-colors" title="Return to App">
                 <ExternalLink size={20} />
             </button>
        </div>
        
        {/* Progress Bar Bottom */}
        <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10">
            <div className={`h-full transition-all duration-1000 ${isActive ? 'bg-pink-500' : 'bg-cyan-500'}`} style={{ width: `${(1 - (timeLeft/initialTime)) * 100}%` }}></div>
        </div>
    </div>,
    pipWindow.document.body
  ) : null;

  return (
    <>
      <div 
        style={getContainerStyle()} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
            overflow-hidden flex flex-col select-none transition-all duration-300
            ${!isAnchored ? 'backdrop-blur-2xl bg-white/90 dark:bg-black/60 border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-black/50' : ''}
            ${!isAnchored && isActive ? 'ring-1 ring-pink-500/50 dark:ring-pink-500/30' : ''}
        `}
      >
          
          {/* --- VIDEO LAYER (Hidden visually when floating-collapsed, but active) --- */}
          <div className="absolute inset-0 z-0 pointer-events-none">
             {/* Gradient Overlay for Text Readability - Adapted for Light/Dark */}
             <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-white/10 dark:from-black/90 dark:via-black/40 dark:to-black/20 z-10 transition-colors duration-300"></div>
             
             <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/videoseries?list=PLxoZGx3mVZsxJgQlgxSOBn6zCONGfl6Tm&enablejsapi=1&controls=0&showinfo=0&modestbranding=1" 
                title="Lofi Girl" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                className="w-full h-full object-cover opacity-60 grayscale-[30%]"
                style={{ 
                    // Hide visuals when collapsed floating, keep audio
                    opacity: (!isAnchored && !isExpanded) ? 0 : 0.6,
                    pointerEvents: (!isAnchored && !isExpanded) ? 'none' : 'auto'
                }}
            />
          </div>

          {/* --- FLOATING CONTENT LAYER --- */}
          {!isAnchored && (
              <div className="relative z-20 flex flex-col h-full w-full">
                  
                  {/* EXPANDED STATE UI */}
                  {isExpanded && (
                      <div className="flex flex-col h-full p-4 animate-in fade-in duration-300">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full animate-pulse ${isActive ? 'bg-pink-500' : 'bg-cyan-500'}`}></div>
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/70">
                                      {mode === 'pomodoro' ? 'Focus Session' : 'Break Time'}
                                  </span>
                              </div>
                              <div className="flex gap-2">
                                  <button onClick={() => setIsExpanded(false)} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors">
                                      <Minimize2 size={14} />
                                  </button>
                              </div>
                          </div>

                          {/* Task Info */}
                          <div className="flex-1 flex flex-col justify-center">
                              <span className="text-4xl font-mono font-bold text-slate-900 dark:text-white tracking-tighter tabular-nums drop-shadow-sm dark:drop-shadow-lg transition-colors duration-300">
                                  {formatTime(timeLeft)}
                              </span>
                              <p className="text-xs text-slate-500 dark:text-white/60 truncate font-medium mt-1">
                                  {focusTask || 'No active task selected'}
                              </p>
                          </div>

                          {/* Controls Row */}
                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-200 dark:border-white/10">
                              <button onClick={toggleMute} className="p-2 text-slate-400 hover:text-slate-700 dark:text-white/60 dark:hover:text-white transition-colors">
                                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                              </button>
                              
                              <div className="flex items-center gap-4">
                                  <button onClick={resetTimer} className="p-2 text-slate-400 hover:text-slate-700 dark:text-white/60 dark:hover:text-white transition-colors hover:rotate-180 duration-500">
                                      <RotateCcw size={18} />
                                  </button>
                                  <button 
                                    onClick={toggleTimer}
                                    className={`p-3 rounded-full text-white shadow-lg flex items-center justify-center transition-transform active:scale-95 ${isActive ? 'bg-amber-500' : 'bg-pink-600 hover:bg-pink-500'}`}
                                  >
                                      {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                                  </button>
                              </div>

                              <button onClick={(e) => handleTogglePiP(e)} className="p-2 text-slate-400 hover:text-slate-700 dark:text-white/60 dark:hover:text-white transition-colors">
                                  <MonitorPlay size={18} />
                              </button>
                          </div>
                      </div>
                  )}

                  {/* COLLAPSED STATE UI */}
                  {!isExpanded && (
                      <div 
                        onClick={() => setIsExpanded(true)}
                        className="h-full w-full flex items-center justify-between px-1.5 cursor-pointer group"
                      >
                          {/* Circular Progress Play Button */}
                          <div className="relative w-10 h-10 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90 pointer-events-none">
                                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-200 dark:text-white/10 transition-colors" />
                                  <circle 
                                    cx="20" cy="20" r="18" 
                                    stroke="currentColor" strokeWidth="3" fill="transparent" 
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className={`${isActive ? 'text-pink-500' : 'text-slate-400 dark:text-slate-500'} transition-all duration-1000 ease-linear`}
                                  />
                              </svg>
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
                                className="absolute inset-0 flex items-center justify-center text-slate-700 dark:text-white hover:scale-110 transition-transform"
                              >
                                  {isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                              </button>
                          </div>

                          {/* Time Display */}
                          <div className="flex flex-col items-start mr-auto ml-2">
                              <span className="text-sm font-bold text-slate-800 dark:text-white font-mono leading-none transition-colors">
                                  {formatTime(timeLeft)}
                              </span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors">
                                  {mode === 'pomodoro' ? 'Focus' : 'Break'}
                              </span>
                          </div>

                          {/* Expand Hint */}
                          <div className="p-2 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">
                              <ChevronUp size={16} />
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* --- ANCHORED OVERLAY --- */}
          {isAnchored && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white/90 via-transparent to-transparent dark:from-black/80 dark:via-transparent dark:to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  {/* Anchored controls appear on hover only */}
              </div>
          )}
      </div>

      {PiPContent}
    </>
  );
};

export default GlobalYoutubePlayer;
