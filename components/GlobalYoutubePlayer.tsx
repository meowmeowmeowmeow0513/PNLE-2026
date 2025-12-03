
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { 
    Pause, Play, RotateCcw, Maximize2, 
    ChevronUp, ChevronDown, Music 
} from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { 
    timeLeft, isActive, mode, pipWindow, focusTask,
    toggleTimer, resetTimer, setPipWindow 
  } = usePomodoro();
  
  // -- STATE --
  const [isAnchored, setIsAnchored] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isExpanded, setIsExpanded] = useState(false); // For floating widget

  // -- ANCHOR SYSTEM --
  // We poll the DOM to see if the "video-anchor" element exists in the Pomodoro page.
  // If it does, we assume its dimensions. If not, we float.
  useEffect(() => {
    const checkAnchor = () => {
        const anchorEl = document.getElementById('video-anchor');
        const isPomoPage = activeItem === 'Pomodoro Timer';
        
        if (isPomoPage && anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                setAnchorRect(rect);
                setIsAnchored(true);
                return;
            }
        }
        setIsAnchored(false);
    };

    checkAnchor();
    const interval = setInterval(checkAnchor, 100); // 10Hz poll for snappy response
    window.addEventListener('resize', checkAnchor);
    window.addEventListener('scroll', checkAnchor);

    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', checkAnchor);
        window.removeEventListener('scroll', checkAnchor);
    };
  }, [activeItem]);

  // -- PIP LOGIC --
  useEffect(() => {
    const handleOpenPiP = async () => {
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
            const win = await dpip.requestWindow({ width: 320, height: 320 });

            // 1. Force Dark Mode
            win.document.body.className = "dark bg-[#020617] text-white flex flex-col items-center justify-center h-full overflow-hidden";
            
            // 2. Clone Stylesheets (Robust Method)
            const style = win.document.createElement('style');
            let cssRules = '';
            
            Array.from(document.styleSheets).forEach(sheet => {
                try {
                    // Try to access rules (might fail on CORS)
                    const rules = Array.from(sheet.cssRules).map(rule => rule.cssText).join('');
                    cssRules += rules;
                } catch (e) {
                    // Fallback for CDN links
                    if (sheet.href) {
                        const link = win.document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = sheet.href;
                        win.document.head.appendChild(link);
                    }
                }
            });
            style.textContent = cssRules;
            win.document.head.appendChild(style);

            // 3. State Sync
            win.addEventListener('pagehide', () => setPipWindow(null));
            setPipWindow(win);

        } catch (err) {
            console.error("PiP Error:", err);
        }
    };

    window.addEventListener('open-pip', handleOpenPiP);
    return () => window.removeEventListener('open-pip', handleOpenPiP);
  }, [pipWindow, setPipWindow]);

  // -- STYLE CALCULATION --
  // Transition between "Overlay" (Anchored) and "Floating Capsule" (Widget)
  const getContainerStyle = (): React.CSSProperties => {
      if (isAnchored && anchorRect) {
          return {
              position: 'fixed',
              top: anchorRect.top,
              left: anchorRect.left,
              width: anchorRect.width,
              height: anchorRect.height,
              zIndex: 10,
              borderRadius: '1.5rem',
              transform: 'none',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: 'none',
          };
      } else {
          // Floating "Dynamic Island" Widget
          return {
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: isExpanded ? '340px' : '180px',
              height: isExpanded ? '240px' : '56px',
              zIndex: 50,
              borderRadius: isExpanded ? '20px' : '100px',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
              backgroundColor: 'rgba(2, 6, 23, 0.8)', // Deep Midnight
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)'
          };
      }
  };

  // -- PIP PORTAL CONTENT --
  const PiPContent = pipWindow ? createPortal(
    <div className="w-full h-full flex flex-col items-center justify-center p-6 relative select-none">
        {/* Neon Glow Background */}
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${isActive ? 'from-pink-500 to-purple-600' : 'from-cyan-500 to-blue-600'}`}></div>
        
        <div className="relative z-10 flex flex-col items-center gap-4">
             {/* Timer */}
             <span className="text-6xl font-mono font-bold tracking-tighter tabular-nums drop-shadow-2xl">
                 {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
             </span>
             
             {/* Controls */}
             <div className="flex items-center gap-4 mt-2">
                 <button onClick={resetTimer} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                     <RotateCcw size={20} />
                 </button>
                 <button onClick={toggleTimer} className={`p-4 rounded-full text-white shadow-lg scale-110 ${isActive ? 'bg-amber-500' : 'bg-pink-500'}`}>
                     {isActive ? <Pause size={24} fill="currentColor"/> : <Play size={24} fill="currentColor"/>}
                 </button>
             </div>
             
             <p className="text-xs font-bold uppercase tracking-widest opacity-50 mt-4">
                 {mode === 'pomodoro' ? 'Focusing' : 'Break Time'}
             </p>
        </div>
    </div>,
    pipWindow.document.body
  ) : null;

  return (
    <>
      <div style={getContainerStyle()} className="overflow-hidden flex flex-col">
          
          {/* -- FLOATING HEADER (Only when NOT anchored) -- */}
          {!isAnchored && (
              <div 
                className={`flex items-center justify-between px-4 cursor-pointer ${isExpanded ? 'h-10 border-b border-white/5' : 'h-full'}`}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                  {!isExpanded ? (
                    // Collapsed State: Mini Player
                    <div className="flex items-center gap-3 w-full">
                         {/* Mini Progress Ring */}
                         <div className={`relative w-6 h-6 rounded-full border-2 ${isActive ? 'border-pink-500 animate-pulse' : 'border-slate-600'}`}>
                            {isActive && <div className="absolute inset-0 bg-pink-500 rounded-full opacity-20"></div>}
                         </div>
                         
                         <div className="flex flex-col flex-1 min-w-0">
                             <span className="text-sm font-bold text-white font-mono leading-none">
                                {Math.floor(timeLeft / 60)}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                             </span>
                             {focusTask && (
                                <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                                    {focusTask}
                                </span>
                             )}
                         </div>

                         {/* Mini Controls */}
                         <button 
                            onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
                            className="p-1.5 rounded-full hover:bg-white/10 text-white"
                         >
                            {isActive ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
                         </button>
                    </div>
                  ) : (
                    // Expanded Header
                    <>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <Music size={12} className="text-pink-500" />
                            <span>Audio Active</span>
                        </div>
                        <ChevronDown size={14} className="text-slate-400" />
                    </>
                  )}
              </div>
          )}

          {/* -- VIDEO CONTAINER -- */}
          <div className="flex-1 bg-black relative w-full h-full">
             <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/videoseries?list=PLxoZGx3mVZsxJgQlgxSOBn6zCONGfl6Tm&enablejsapi=1" 
                title="Study Playlist" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
                className="w-full h-full object-cover"
                style={{ 
                    // Hide video visuals when floating collapsed, but KEEP AUDIO PLAYING
                    opacity: (!isAnchored && !isExpanded) ? 0 : 1, 
                    pointerEvents: (!isAnchored && !isExpanded) ? 'none' : 'auto',
                    transition: 'opacity 0.3s'
                }}
            />
            
            {/* Overlay Gradient for Anchor Mode to blend it */}
            {isAnchored && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
            )}
          </div>
      </div>

      {PiPContent}
    </>
  );
};

export default GlobalYoutubePlayer;
