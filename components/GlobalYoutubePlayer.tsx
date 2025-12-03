
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { 
    Pause, Play, RotateCcw, Maximize2, X, Music, 
    ChevronUp, ChevronDown, GripHorizontal 
} from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { 
    timeLeft, initialTime, isActive, mode, pipWindow, 
    toggleTimer, resetTimer, setPipWindow 
  } = usePomodoro();
  
  // -- STATE --
  const [isAnchored, setIsAnchored] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isMiniExpanded, setIsMiniExpanded] = useState(true);

  // Widget Position (for Floating Mode)
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
            // Only anchor if the element is actually layout-ed
            if (rect.width > 0 && rect.height > 0) {
                setAnchorRect(rect);
                setIsAnchored(true);
                return;
            }
        }
        setIsAnchored(false);
        setAnchorRect(null);
        // Default widget position if not anchoring
        if (isPomoPage) {
             // Reset widget to corner if we leave anchored mode
             setPosition({ x: window.innerWidth - 340, y: window.innerHeight - 100 });
        }
    };

    // Check immediately and on loop to catch layout shifts
    checkAnchor();
    const interval = setInterval(checkAnchor, 500);
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
            alert("Picture-in-Picture API not supported.");
            return;
        }

        try {
            const dpip = (window as any).documentPictureInPicture;
            // Request a small square window
            const win = await dpip.requestWindow({ width: 300, height: 350 });
            
            // CRITICAL: Copy Styles
            [...document.styleSheets].forEach((styleSheet) => {
                try {
                    if (styleSheet.href) {
                        const link = win.document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = styleSheet.href;
                        win.document.head.appendChild(link);
                    } else if (styleSheet.cssRules) {
                        const style = win.document.createElement('style');
                        [...styleSheet.cssRules].forEach(rule => {
                            style.textContent += rule.cssText;
                        });
                        win.document.head.appendChild(style);
                    }
                } catch (e) {
                    // Ignore CORS errors for external stylesheets
                }
            });

            // Force Dark Mode Body
            win.document.body.className = "bg-[#0B1120] text-white overflow-hidden flex flex-col items-center justify-center";
            
            // Listen for close
            win.addEventListener('pagehide', () => setPipWindow(null));
            setPipWindow(win);

        } catch (err) {
            console.error("Failed to open PiP", err);
        }
    };

    window.addEventListener('open-pip', handleOpenPiP);
    return () => window.removeEventListener('open-pip', handleOpenPiP);
  }, [pipWindow, setPipWindow]);


  // -- DRAGGING LOGIC (For Floating Widget) --
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
      
      // Constraints
      const maxX = window.innerWidth - 320;
      const maxY = window.innerHeight - 50;
      newX = Math.max(0, Math.min(maxX, newX));
      newY = Math.max(0, Math.min(maxY, newY));

      setPosition({ x: newX, y: newY });
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


  // -- RENDER: PIP CONTENT (React Portal) --
  const PiPContent = pipWindow ? createPortal(
    <div className="flex flex-col items-center justify-center w-full h-full p-6 select-none relative">
         {/* Background Glow */}
         <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-blue-500/10"></div>
         
         <div className="relative z-10 text-center">
             <div className="text-6xl font-mono font-bold tracking-tighter text-white mb-4 drop-shadow-xl">
                 {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
             </div>
             
             <div className="flex items-center justify-center gap-4">
                 <button 
                    onClick={toggleTimer}
                    className={`p-4 rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isActive ? 'bg-amber-500' : 'bg-pink-600'}`}
                 >
                    {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                 </button>
                 
                 <button 
                    onClick={resetTimer}
                    className="p-3 rounded-full bg-white/10 text-slate-300 hover:bg-white/20 transition-colors"
                 >
                    <RotateCcw size={20} />
                 </button>
             </div>
             
             <p className="mt-4 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                 {mode === 'pomodoro' ? 'Focus Session' : 'Break Time'}
             </p>
         </div>
    </div>,
    pipWindow.document.body
  ) : null;


  // -- RENDER: MAIN PLAYER CONTAINER --
  // We determine style based on Anchored vs Floating
  const containerStyle: React.CSSProperties = isAnchored && anchorRect
    ? {
        position: 'fixed',
        top: anchorRect.top,
        left: anchorRect.left,
        width: anchorRect.width,
        height: anchorRect.height,
        borderRadius: '1.5rem', // Match rounded-3xl of anchor
        zIndex: 10,
        boxShadow: 'none',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)', // Smooth Apple-like spring
      }
    : {
        position: 'fixed',
        top: position.y, // Bottom Right
        left: position.x,
        width: isMiniExpanded ? 320 : 180,
        height: isMiniExpanded ? 200 : 48,
        borderRadius: '16px',
        zIndex: 50, // Always on top when floating
        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)',
        transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      };

  return (
    <>
      <div 
        style={containerStyle}
        className={`overflow-hidden flex flex-col bg-black border border-white/10 ${
            !isAnchored ? 'backdrop-blur-xl bg-[#0B1120]/90' : ''
        }`}
      >
        {/* -- Floating Header (Drag Handle) -- */}
        {!isAnchored && (
            <div 
                onMouseDown={handleMouseDown}
                className="h-8 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing bg-white/5 border-b border-white/5"
            >
                <div className="flex items-center gap-2">
                    <Music size={12} className="text-pink-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Now Playing</span>
                </div>
                
                {/* Expand/Collapse */}
                <button 
                    onClick={() => setIsMiniExpanded(!isMiniExpanded)}
                    className="text-slate-500 hover:text-white transition-colors"
                >
                    {isMiniExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
            </div>
        )}

        {/* -- Iframe Container -- */}
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
                style={{ opacity: (!isAnchored && !isMiniExpanded) ? 0 : 1, transition: 'opacity 0.3s' }}
            />
            {/* Drag Guard (prevents iframe mouse capture during drag) */}
            {isDragging && <div className="absolute inset-0 z-50 bg-transparent"></div>}
        </div>

        {/* -- Mini Controls (Only visible when expanded & floating) -- */}
        {!isAnchored && isMiniExpanded && (
            <div className="h-10 flex items-center justify-between px-4 bg-[#0B1120] border-t border-white/10">
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
