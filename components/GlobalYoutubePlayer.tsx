
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { 
    Pause, Play, RotateCcw, Maximize2, 
    ChevronUp, ChevronDown, Volume2, VolumeX, 
    MonitorPlay, Minimize2, ExternalLink, Activity, Zap, Radio, 
    Headphones, Music2
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // -- AUDIO SYNC LOGIC --
  // Sync Play/Pause with Timer Active State & Mute State
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    
    // Command mapping for YouTube IFrame API
    // We only play if the timer is RUNNING and NOT muted.
    const command = (isActive && !isMuted) ? 'playVideo' : 'pauseVideo';
    
    try {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({
            'event': 'command',
            'func': command,
            'args': []
        }), '*');
    } catch (e) {
        console.error("YouTube API Error", e);
    }

  }, [isActive, isMuted]);

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
            if (rect.width > 0 && rect.height > 0) {
                setAnchorRect(rect);
                setIsAnchored(true);
                // Auto-expand if anchoring
                setIsExpanded(true); 
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
  }, [activeItem]);

  // -- PIP LOGIC --
  const handleTogglePiP = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (pipWindow) {
        pipWindow.close();
        return;
    }

    if (!('documentPictureInPicture' in window)) {
        alert("Picture-in-Picture API not supported in this browser.");
        return;
    }

    try {
        const dpip = (window as any).documentPictureInPicture;
        // Request a square-ish window
        const win = await dpip.requestWindow({ width: 350, height: 350 });

        // Initial setup - Theme handled by useEffect now
        const isDark = document.documentElement.classList.contains('dark');
        win.document.documentElement.className = isDark ? 'dark' : '';
        // We force dark mode background in PiP for aesthetic consistency
        win.document.body.className = "bg-[#020617] text-white flex flex-col h-full overflow-hidden select-none m-0 p-0 transition-colors duration-300";
        
        // Inject styles
        const style = win.document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; }
            * { box-sizing: border-box; }
            ::-webkit-scrollbar { width: 0px; background: transparent; }
            .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        `;
        win.document.head.appendChild(style);
        
        // Try to copy Tailwind styles from parent
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

        win.addEventListener('pagehide', () => setPipWindow(null));
        setPipWindow(win);

    } catch (err) {
        console.error("PiP Error:", err);
    }
  };

  // -- STYLE CALCULATION --
  const getContainerStyle = (): React.CSSProperties => {
      if (isAnchored && anchorRect) {
          // Docked Mode
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
          // Floating Mode
          return {
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: isExpanded ? '320px' : '180px',
              height: isExpanded ? '240px' : '64px',
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
  const isFocus = mode === 'pomodoro' || mode === 'custom';
  
  // Pink/Rose for Focus, Cyan/Teal for Break
  const themeGradient = isFocus 
    ? 'from-pink-600 via-rose-500 to-orange-500' 
    : 'from-cyan-600 via-teal-500 to-emerald-500';
  
  const bgGradient = isFocus
    ? 'bg-gradient-to-br from-[#0f172a] via-[#1f1018] to-[#0f172a]'
    : 'bg-gradient-to-br from-[#0f172a] via-[#0f1d24] to-[#0f172a]';

  const glowColor = isFocus ? 'bg-pink-500' : 'bg-cyan-500';
  const textColor = isFocus ? 'text-pink-400' : 'text-cyan-400';

  // -- PIP CONTENT (EXTERNAL WINDOW) --
  const PiPContent = pipWindow ? createPortal(
    <div className={`relative w-full h-full flex flex-col justify-between overflow-hidden`}>
        
        {/* Animated Background Mesh */}
        <div className={`absolute inset-0 bg-gradient-to-br ${isFocus ? 'from-pink-900/40 to-black' : 'from-cyan-900/40 to-black'} z-0`}></div>
        
        {/* Animated Glow Blob */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${glowColor} rounded-full blur-[100px] opacity-20 animate-pulse-slow pointer-events-none`}></div>

        <div className="relative z-10 flex flex-col h-full p-8 justify-between">
            
            {/* Top Info */}
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${textColor}`}>
                        {mode === 'pomodoro' ? 'FOCUS MODE' : 'BREAK TIME'}
                    </span>
                    {focusTask && (
                        <div className="text-white font-bold text-lg leading-tight mt-1 line-clamp-2">
                            {focusTask}
                        </div>
                    )}
                </div>
                <div className={`w-3 h-3 rounded-full ${isActive ? 'animate-ping' : ''} ${glowColor}`}></div>
            </div>

            {/* Timer Display */}
            <div className="flex-1 flex flex-col items-center justify-center">
                 <span className="text-[5.5rem] font-mono font-black tracking-tighter text-white leading-none drop-shadow-2xl tabular-nums">
                     {formatTime(timeLeft)}
                 </span>
            </div>

            {/* Status Bar */}
            <div>
                <div className="flex justify-between items-end mb-2">
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">{isActive ? 'RUNNING' : 'PAUSED'}</span>
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">{Math.round((1 - (timeLeft/initialTime)) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ease-linear bg-gradient-to-r ${themeGradient}`} style={{ width: `${(1 - (timeLeft/initialTime)) * 100}%` }}></div>
                </div>
            </div>
        </div>
        
        {/* Hidden control overlay for returning */}
        <div className="absolute top-4 right-4 z-50">
             <button onClick={() => handleTogglePiP()} className="text-white/30 hover:text-white transition-colors" title="Return to App">
                <ExternalLink size={20} />
             </button>
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
            ${!isAnchored ? `backdrop-blur-xl border border-white/10 ${bgGradient} shadow-2xl` : ''}
        `}
      >
          {/* --- HIDDEN AUDIO ENGINE (Lofi Girl) --- */}
          {/* We ensure this is always mounted to keep audio playing */}
          <div className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none overflow-hidden -z-50">
             <iframe 
                ref={iframeRef}
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/rFRpnSxTWR0?enablejsapi=1&autoplay=0&controls=0&disablekb=1&fs=0&loop=1&modestbranding=1&playsinline=1"
                title="Lofi Audio Engine" 
                allow="autoplay; encrypted-media"
            />
          </div>

          {/* --- VISUAL INTERFACE --- */}
          <div className={`relative z-20 flex flex-col h-full w-full ${isAnchored ? 'bg-white dark:bg-slate-900/50' : ''}`}>
                  
                  {/* EXPANDED / DOCKED STATE UI */}
                  {isExpanded ? (
                      <div className={`flex flex-col h-full p-6 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden ${isAnchored ? 'bg-transparent' : ''}`}>
                          
                          {/* Floating Mode Background FX */}
                          {!isAnchored && (
                              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${themeGradient}`}></div>
                          )}

                          {/* Top Bar */}
                          <div className="flex justify-between items-start mb-4 relative z-10">
                              <div className="flex items-center gap-2">
                                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isAnchored ? 'bg-slate-100 dark:bg-white/10' : 'bg-white/10 border border-white/5'}`}>
                                      <div className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''} ${isFocus ? 'bg-pink-500' : 'bg-cyan-500'}`}></div>
                                      <span className={`text-[10px] font-black uppercase tracking-widest ${isAnchored ? 'text-slate-600 dark:text-white' : 'text-white/90'}`}>
                                          {mode === 'pomodoro' ? 'Focus Station' : 'Break Lounge'}
                                      </span>
                                  </div>
                              </div>
                              
                              <div className="flex gap-2">
                                  {!isAnchored && (
                                    <button onClick={() => setIsExpanded(false)} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                                        <Minimize2 size={16} />
                                    </button>
                                  )}
                              </div>
                          </div>

                          {/* Task & Timer - Center Stage */}
                          <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                              <div className="relative mb-2 group/timer cursor-pointer" onClick={toggleTimer}>
                                  <span className={`text-6xl md:text-7xl font-mono font-black tracking-tighter ${isAnchored ? 'text-slate-900 dark:text-white' : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-2xl'}`}>
                                      {formatTime(timeLeft)}
                                  </span>
                                  {/* Hover Play/Pause Overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/timer:opacity-100 transition-opacity">
                                      {isActive ? <Pause size={40} className={isAnchored ? 'text-slate-900 dark:text-white' : 'text-white'} /> : <Play size={40} className={isAnchored ? 'text-slate-900 dark:text-white' : 'text-white'} />}
                                  </div>
                              </div>
                              
                              <div className={`flex items-center gap-2 max-w-full px-4 py-2 rounded-xl ${isAnchored ? 'bg-slate-50 dark:bg-white/5' : 'bg-white/5 border border-white/5'}`}>
                                  {focusTask ? (
                                      <>
                                        <Zap size={14} className={isFocus ? "text-pink-500" : "text-cyan-500"} fill="currentColor" />
                                        <p className={`text-sm font-bold truncate ${isAnchored ? 'text-slate-700 dark:text-slate-200' : 'text-white/90'}`}>
                                            {focusTask}
                                        </p>
                                      </>
                                  ) : (
                                      <p className={`text-xs uppercase tracking-widest font-bold ${isAnchored ? 'text-slate-400' : 'text-white/40'}`}>No Active Task</p>
                                  )}
                              </div>
                          </div>

                          {/* Controls Row */}
                          <div className={`flex items-center justify-between mt-auto pt-4 ${isAnchored ? 'border-t border-slate-100 dark:border-white/5' : 'border-t border-white/10'}`}>
                              <div className="flex items-center gap-2">
                                  <button onClick={toggleMute} className={`p-2.5 rounded-xl transition-colors ${isAnchored ? 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'}`} title={isMuted ? "Unmute Lofi" : "Mute Lofi"}>
                                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                  </button>
                                  {/* Audio Indicator */}
                                  {!isMuted && isActive && (
                                      <div className="flex gap-0.5 items-end h-4">
                                          <div className={`w-1 bg-${isFocus ? 'pink' : 'cyan'}-500 animate-[bounce_1s_infinite] h-2`}></div>
                                          <div className={`w-1 bg-${isFocus ? 'pink' : 'cyan'}-500 animate-[bounce_1.2s_infinite] h-3`}></div>
                                          <div className={`w-1 bg-${isFocus ? 'pink' : 'cyan'}-500 animate-[bounce_0.8s_infinite] h-1.5`}></div>
                                      </div>
                                  )}
                              </div>
                              
                              <div className="flex items-center gap-4">
                                  <button onClick={resetTimer} className={`p-2.5 rounded-full transition-colors ${isAnchored ? 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                                      <RotateCcw size={20} />
                                  </button>
                                  
                                  {/* Main Toggle Button */}
                                  <button 
                                    onClick={toggleTimer}
                                    className={`w-14 h-14 rounded-2xl text-white shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-gradient-to-tr ${themeGradient}`}
                                  >
                                      {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                                  </button>
                              </div>

                              <button onClick={(e) => handleTogglePiP(e)} className={`p-2.5 rounded-xl transition-colors ${isAnchored ? 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'}`} title="Pop Out Window">
                                  <MonitorPlay size={20} />
                              </button>
                          </div>
                      </div>
                  ) : (
                      /* COLLAPSED STATE UI (Floating Pill) */
                      <div 
                        onClick={() => setIsExpanded(true)}
                        className={`h-full w-full flex items-center justify-between px-3 cursor-pointer transition-colors duration-300 ${isFocus ? 'hover:bg-pink-500/10' : 'hover:bg-cyan-500/10'}`}
                      >
                          {/* Status Ring / Play Button */}
                          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                              <svg className="w-full h-full transform -rotate-90 pointer-events-none">
                                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/10 transition-colors" />
                                  <circle 
                                    cx="20" cy="20" r="18" 
                                    stroke="currentColor" strokeWidth="2" fill="transparent" 
                                    strokeDasharray={strokeDasharray} // Adjusted radius ratio logic in styles if needed, reusing var
                                    strokeDashoffset={(2 * Math.PI * 18) - (progress / 100) * (2 * Math.PI * 18)}
                                    strokeLinecap="round"
                                    className={`${isFocus ? 'text-pink-500' : 'text-cyan-500'} transition-all duration-1000 ease-linear`}
                                  />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-white/80">
                                  {isActive ? <Activity size={16} className="animate-pulse" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                              </div>
                          </div>

                          {/* Time & Hint */}
                          <div className="flex flex-col items-start mr-auto ml-3">
                              <span className="text-lg font-black text-white font-mono leading-none tracking-tight">
                                  {formatTime(timeLeft)}
                              </span>
                              <span className="text-[8px] text-white/50 font-bold uppercase tracking-wider mt-0.5">
                                  {mode === 'pomodoro' ? 'Focus' : 'Break'}
                              </span>
                          </div>

                          {/* Hover Expand Hint */}
                          <div className="p-2 text-white/30 group-hover:text-white transition-colors">
                              <ChevronUp size={18} />
                          </div>
                      </div>
                  )}
          </div>
      </div>

      {PiPContent}
    </>
  );
};

export default GlobalYoutubePlayer;
