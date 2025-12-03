
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { 
    Pause, Play, RotateCcw, Music, 
    ChevronUp, ChevronDown
} from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { 
    timeLeft, isActive, mode, pipWindow, 
    toggleTimer, resetTimer, setPipWindow 
  } = usePomodoro();
  
  // -- STATE --
  const [isAnchored, setIsAnchored] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isMiniExpanded, setIsMiniExpanded] = useState(true);

  // Widget Position (Floating Mode)
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // -- ANCHOR DETECTION --
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
                return;
            }
        }
        
        setIsAnchored(false);
        setAnchorRect(null);
        // Reset to corner if logic requires, but keeping last position is often friendlier
        if (isPomoPage) {
           setPosition({ x: window.innerWidth - 340, y: window.innerHeight - 100 });
        }
    };

    checkAnchor();
    const interval = setInterval(checkAnchor, 200); // Fast poll for smooth snap
    window.addEventListener('resize', checkAnchor);
    window.addEventListener('scroll', checkAnchor);

    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', checkAnchor);
        window.removeEventListener('scroll', checkAnchor);
    };
  }, [activeItem]);


  // -- PIP HANDLER --
  useEffect(() => {
    const handleOpenPiP = async () => {
        if (pipWindow) {
            pipWindow.close();
            return;
        }

        if (!('documentPictureInPicture' in window)) {
            alert("PiP not supported in this browser.");
            return;
        }

        try {
            const dpip = (window as any).documentPictureInPicture;
            const win = await dpip.requestWindow({ width: 300, height: 350 });

            // CRITICAL: Copy All Stylesheets for perfect look
            [...document.styleSheets].forEach((styleSheet) => {
                try {
                    if (styleSheet.href) {
                        const link = win.document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = styleSheet.href;
                        win.document.head.appendChild(link);
                    } else if (styleSheet.cssRules) {
                        const style = win.document.createElement('style');
                        [...styleSheet.cssRules].forEach((rule: any) => {
                            style.textContent += rule.cssText;
                        });
                        win.document.head.appendChild(style);
                    }
                } catch (e) {
                    // console.warn("CORS blocked stylesheet copy", e);
                }
            });

            // Match Theme Class
            const isDark = document.documentElement.classList.contains('dark');
            win.document.body.className = isDark 
                ? "bg-[#0B1120] text-white flex flex-col items-center justify-center h-full overflow-hidden" 
                : "bg-white text-slate-900 flex flex-col items-center justify-center h-full overflow-hidden";
            
            win.addEventListener('pagehide', () => setPipWindow(null));
            setPipWindow(win);

        } catch (err) {
            console.error("PiP Error:", err);
        }
    };

    window.addEventListener('open-pip', handleOpenPiP);
    return () => window.removeEventListener('open-pip', handleOpenPiP);
  }, [pipWindow, setPipWindow]);


  // -- DRAG LOGIC --
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnchored) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      let newX = e.clientX - dragStart.current.x;
      let newY = e.clientY - dragStart.current.y;
      
      const maxX = window.innerWidth - 320;
      const maxY = window.innerHeight - 50;
      
      setPosition({ 
          x: Math.max(0, Math.min(maxX, newX)), 
          y: Math.max(0, Math.min(maxY, newY)) 
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);


  // -- PIP CONTENT (React Portal) --
  const PiPContent = pipWindow ? createPortal(
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 select-none">
         {/* Background Glow */}
         <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-blue-500/5 pointer-events-none"></div>
         
         <div className="text-5xl font-mono font-bold tracking-tighter mb-6 relative z-10">
             {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
         </div>
         
         <div className="flex items-center gap-4 relative z-10">
             <button 
                onClick={toggleTimer}
                className={`p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 text-white ${isActive ? 'bg-amber-500' : 'bg-pink-600'}`}
             >
                {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
             </button>
             
             <button 
                onClick={resetTimer}
                className="p-3 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
             >
                <RotateCcw size={20} />
             </button>
         </div>
         
         <p className="mt-6 text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
             {mode === 'pomodoro' ? 'Focus Mode' : 'Break Time'}
         </p>
    </div>,
    pipWindow.document.body
  ) : null;


  // -- RENDER STYLE LOGIC --
  const containerStyle: React.CSSProperties = isAnchored && anchorRect
    ? {
        position: 'fixed',
        top: anchorRect.top,
        left: anchorRect.left,
        width: anchorRect.width,
        height: anchorRect.height,
        zIndex: 10,
        borderRadius: '1.5rem',
        boxShadow: 'none',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)', // Apple-style spring
      }
    : {
        position: 'fixed',
        top: position.y,
        left: position.x,
        width: isMiniExpanded ? 320 : 160,
        height: isMiniExpanded ? 200 : 48,
        zIndex: 50,
        borderRadius: '16px',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
        transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      };

  return (
    <>
      <div 
        style={containerStyle}
        className={`overflow-hidden flex flex-col bg-black border border-white/10 ${
            !isAnchored ? 'bg-slate-900/95 backdrop-blur-xl border-slate-700/50' : ''
        }`}
      >
        {/* -- Floating Header -- */}
        {!isAnchored && (
            <div 
                onMouseDown={handleMouseDown}
                className="h-8 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing bg-white/5 border-b border-white/5"
            >
                <div className="flex items-center gap-2">
                    <Music size={12} className="text-pink-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Now Playing</span>
                </div>
                <button 
                    onClick={() => setIsMiniExpanded(!isMiniExpanded)}
                    className="text-slate-500 hover:text-white transition-colors"
                >
                    {isMiniExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
            </div>
        )}

        {/* -- Iframe -- */}
        <div className="flex-1 relative bg-black">
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
                    opacity: (!isAnchored && !isMiniExpanded) ? 0 : 1, 
                    pointerEvents: (!isAnchored && !isMiniExpanded) ? 'none' : 'auto',
                    transition: 'opacity 0.3s' 
                }}
            />
            {/* Drag Guard Overlay */}
            {isDragging && <div className="absolute inset-0 z-50 bg-transparent"></div>}
        </div>

        {/* -- Mini Controls -- */}
        {!isAnchored && isMiniExpanded && (
            <div className="h-12 flex items-center justify-between px-4 bg-slate-900 border-t border-white/10">
                 <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                    Lofi Girl - Study Beats
                 </div>
                 <div className="flex gap-3">
                     <button onClick={resetTimer} className="text-slate-500 hover:text-white"><RotateCcw size={14}/></button>
                     <button onClick={toggleTimer} className={`${isActive ? 'text-amber-500' : 'text-pink-500'} hover:scale-110 transition-transform`}>
                        {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                     </button>
                 </div>
            </div>
        )}
      </div>

      {/* -- PiP Portal -- */}
      {PiPContent}
    </>
  );
};

export default GlobalYoutubePlayer;
