
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { 
    Pause, Play, RotateCcw, Maximize2, 
    ChevronUp, ChevronDown, Volume2, VolumeX, 
    MonitorPlay, Minimize2, ExternalLink, Activity, Zap
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
        const win = await dpip.requestWindow({ width: 400, height: 400 });

        // Initial setup - Theme handled by useEffect now
        const isDark = document.documentElement.classList.contains('dark');
        win.document.documentElement.className = isDark ? 'dark' : '';
        win.document.body.className = "bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex flex-col items-center justify-center h-full overflow-hidden select-none m-0 p-0 transition-colors duration-300";
        
        const style = win.document.createElement('style');
        let cssRules = `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
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
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: 'none',
          };
      } else {
          // Floating Widget
          return {
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: isExpanded ? '320px' : '180px',
              height: isExpanded ? '220px' : '64px',
              zIndex: 50,
              borderRadius: isExpanded ? '28px' : '100px',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isExpanded 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                : '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
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
  const strokeDasharray = 2 * Math.PI * 22; // r=22
  const strokeDashoffset = strokeDasharray - (progress / 100) * strokeDasharray;

  // -- THEME COLORS --
  // Focus (Pomodoro) = Pink/Rose
  // Break (Short/Long) = Cyan/Emerald
  const isFocus = mode === 'pomodoro' || mode === 'custom';
  const themeColor = isFocus ? 'pink' : 'cyan';
  const themeGradient = isFocus 
    ? 'from-pink-600 via-rose-500 to-orange-500' 
    : 'from-cyan-600 via-teal-500 to-emerald-500';
  
  const bgGradient = isFocus
    ? 'bg-gradient-to-br from-[#0f172a] to-[#331828]'
    : 'bg-gradient-to-br from-[#0f172a] to-[#0f2e2e]';

  // -- PIP CONTENT (EXTERNAL WINDOW) --
  const PiPContent = pipWindow ? createPortal(
    <div className={`relative w-full h-full flex flex-col justify-between overflow-hidden transition-colors duration-500 ${bgGradient}`}>
        
        {/* Animated Glow */}
        <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br ${themeGradient} opacity-20 blur-[100px] animate-pulse-slow pointer-events-none`}></div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full p-6">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'animate-ping' : ''} ${isFocus ? 'bg-pink-500' : 'bg-cyan-500'}`}></span>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isFocus ? 'text-pink-400' : 'text-cyan-400'}`}>
                            {mode === 'pomodoro' ? 'FOCUS' : 'BREAK'}
                        </span>
                    </div>
                    {focusTask && (
                        <div className="text-white font-bold text-sm leading-tight max-w-[200px] truncate">
                            {focusTask}
                        </div>
                    )}
                </div>
                <button onClick={() => handleTogglePiP()} className="text-white/50 hover:text-white transition-colors p-1" title="Return to App">
                    <ExternalLink size={18} />
                </button>
            </div>

            {/* Timer Display */}
            <div className="flex-1 flex flex-col items-center justify-center">
                 <span className="text-[5rem] font-mono font-black tracking-tighter text-white leading-none drop-shadow-2xl">
                     {formatTime(timeLeft)}
                 </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mt-4">
                 <button onClick={resetTimer} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md">
                     <RotateCcw size={20} />
                 </button>
                 <button 
                    onClick={toggleTimer} 
                    className={`p-6 rounded-full text-white shadow-2xl hover:scale-105 active:scale-95 transition-all bg-gradient-to-tr ${themeGradient}`}
                 >
                     {isActive ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" className="ml-1"/>}
                 </button>
                 <button onClick={toggleMute} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md">
                     {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                 </button>
            </div>
        </div>
        
        {/* Progress Bar Bottom */}
        <div className="h-1.5 w-full bg-black/20">
            <div className={`h-full transition-all duration-1000 bg-gradient-to-r ${themeGradient}`} style={{ width: `${(1 - (timeLeft/initialTime)) * 100}%` }}></div>
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
            overflow-hidden flex flex-col select-none group
            ${!isAnchored ? `backdrop-blur-3xl border border-white/10 ${bgGradient}` : ''}
        `}
      >
          {/* --- HIDDEN AUDIO PLAYER (Retains Lofi functionality) --- */}
          <div className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none overflow-hidden">
             <iframe 
                width="200" 
                height="200" 
                src={`https://www.youtube.com/embed/videoseries?list=PLxoZGx3mVZsxJgQlgxSOBn6zCONGfl6Tm&enablejsapi=1&controls=0&showinfo=0&modestbranding=1&autoplay=1&mute=${isMuted ? '1' : '0'}`}
                title="Lofi Audio Engine" 
                allow="autoplay; encrypted-media"
            />
          </div>

          {/* --- FLOATING CONTENT LAYER --- */}
          {!isAnchored && (
              <div className="relative z-20 flex flex-col h-full w-full">
                  
                  {/* EXPANDED STATE UI */}
                  {isExpanded && (
                      <div className="flex flex-col h-full p-5 animate-in fade-in zoom-in-95 duration-300">
                          {/* Top Bar */}
                          <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 border border-white/5`}>
                                      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'animate-pulse' : ''} ${isFocus ? 'bg-pink-400' : 'bg-cyan-400'}`}></div>
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                                          {mode === 'pomodoro' ? 'Focus' : 'Break'}
                                      </span>
                                  </div>
                              </div>
                              <button onClick={() => setIsExpanded(false)} className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                                  <Minimize2 size={16} />
                              </button>
                          </div>

                          {/* Task & Timer */}
                          <div className="flex-1 flex flex-col justify-center items-center text-center">
                              <div className="relative mb-2">
                                  <span className={`text-6xl font-mono font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-lg`}>
                                      {formatTime(timeLeft)}
                                  </span>
                              </div>
                              
                              {focusTask ? (
                                  <div className="flex items-center gap-1.5 max-w-full px-2">
                                      <Zap size={12} className={isFocus ? "text-pink-400" : "text-cyan-400"} />
                                      <p className="text-xs text-white/80 font-bold truncate">
                                          {focusTask}
                                      </p>
                                  </div>
                              ) : (
                                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">No Active Task</p>
                              )}
                          </div>

                          {/* Controls Row */}
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
                              <button onClick={toggleMute} className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                              </button>
                              
                              <div className="flex items-center gap-3">
                                  <button onClick={resetTimer} className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                                      <RotateCcw size={18} />
                                  </button>
                                  <button 
                                    onClick={toggleTimer}
                                    className={`w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-gradient-to-tr ${themeGradient}`}
                                  >
                                      {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                                  </button>
                              </div>

                              <button onClick={(e) => handleTogglePiP(e)} className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors" title="Pop Out Window">
                                  <MonitorPlay size={18} />
                              </button>
                          </div>
                      </div>
                  )}

                  {/* COLLAPSED STATE UI (Dynamic Pill) */}
                  {!isExpanded && (
                      <div 
                        onClick={() => setIsExpanded(true)}
                        className={`h-full w-full flex items-center justify-between px-2 cursor-pointer transition-colors duration-300 ${isFocus ? 'hover:bg-pink-500/10' : 'hover:bg-cyan-500/10'}`}
                      >
                          {/* Status Ring / Play Button */}
                          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                              <svg className="w-full h-full transform -rotate-90 pointer-events-none">
                                  <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/5 transition-colors" />
                                  <circle 
                                    cx="24" cy="24" r="22" 
                                    stroke="currentColor" strokeWidth="3" fill="transparent" 
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className={`${isFocus ? 'text-pink-500' : 'text-cyan-500'} transition-all duration-1000 ease-linear`}
                                  />
                              </svg>
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
                                className="absolute inset-0 flex items-center justify-center text-white hover:scale-110 transition-transform"
                              >
                                  {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                              </button>
                          </div>

                          {/* Time & Hint */}
                          <div className="flex flex-col items-start mr-auto ml-3">
                              <span className="text-lg font-black text-white font-mono leading-none tracking-tight">
                                  {formatTime(timeLeft)}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'animate-pulse' : ''} ${isFocus ? 'bg-pink-500' : 'bg-cyan-500'}`}></span>
                                  <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider">
                                      {mode === 'pomodoro' ? 'Focus' : 'Break'}
                                  </span>
                              </div>
                          </div>

                          {/* Hover Expand Hint */}
                          <div className="p-2 text-white/30 group-hover:text-white transition-colors">
                              <ChevronUp size={20} />
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* --- ANCHORED OVERLAY (If user is on Pomodoro page) --- */}
          {isAnchored && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Anchored state is handled by the main Pomodoro component visuals, this component just manages PiP and audio */}
              </div>
          )}
      </div>

      {PiPContent}
    </>
  );
};

export default GlobalYoutubePlayer;
