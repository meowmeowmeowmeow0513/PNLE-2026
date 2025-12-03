
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { Pause, Play, RotateCcw, ChevronUp, ChevronDown, Maximize2, ExternalLink, Zap } from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { timeLeft, isActive, toggleTimer, resetTimer, mode, focusTask, pipWindow, setPipWindow } = usePomodoro();
  
  // DRAG STATE (For in-page widget only)
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 300 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // WIDGET STATE
  const [isMiniExpanded, setIsMiniExpanded] = useState(true);
  const [isPomodoroPage, setIsPomodoroPage] = useState(false);
  
  // REFS
  const containerRef = useRef<HTMLDivElement>(null);

  // --- FORMAT TIME ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- THEME HELPERS ---
  const getThemeColor = () => {
    switch(mode) {
      case 'shortBreak': return 'text-teal-400';
      case 'longBreak': return 'text-indigo-400';
      default: return 'text-pink-500';
    }
  };

  const getThemeBg = () => {
    switch(mode) {
      case 'shortBreak': return 'bg-teal-500';
      case 'longBreak': return 'bg-indigo-500';
      default: return 'bg-pink-500';
    }
  };

  // --- PICTURE IN PICTURE LOGIC ---
  const togglePiP = async () => {
    if (pipWindow) {
      pipWindow.close(); // Close existing
      return;
    }

    if (!('documentPictureInPicture' in window)) {
      alert("Your browser doesn't support the 'Keep on Top' window feature yet. Try Chrome or Edge!");
      return;
    }

    try {
      const dpip = (window as any).documentPictureInPicture;
      
      // Request a small, vertical window for the timer
      const win = await dpip.requestWindow({
        width: 300,
        height: 350,
      });

      // Copy Styles
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          win.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          if (styleSheet.href) link.href = styleSheet.href;
          win.document.head.appendChild(link);
        }
      });
      
      // Inject Custom Body Class for Dark Mode
      win.document.body.className = "bg-slate-950 text-white flex flex-col items-center justify-center h-full";

      // Handle Close
      win.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      setPipWindow(win);
    } catch (err) {
      console.error("Failed to open PiP window:", err);
    }
  };

  // --- DRAG HANDLERS (Main Window Only) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPomodoroPage || pipWindow) return; 
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
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

  // --- PAGE DETECTION ---
  useEffect(() => {
    const updateLayout = () => {
      setIsPomodoroPage(activeItem === 'Pomodoro Timer');
    };
    updateLayout();
  }, [activeItem]);

  // -----------------------------------------------------------
  // COMPONENT 1: THE TIMER CONTROLS (Can be Portaled)
  // -----------------------------------------------------------
  const TimerControls = (
    <div className={`flex flex-col items-center justify-center w-full h-full p-6 transition-colors ${pipWindow ? 'bg-slate-950' : 'bg-white dark:bg-slate-900'}`}>
        
        {/* Header / Task Info */}
        <div className="mb-4 text-center">
             <div className="flex items-center justify-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${isActive ? `${getThemeBg()} animate-pulse shadow-[0_0_8px_currentColor]` : 'bg-slate-600'}`}></div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {mode === 'pomodoro' ? 'FOCUS' : mode === 'shortBreak' ? 'SHORT BREAK' : 'LONG BREAK'}
                </span>
             </div>
             {focusTask && (
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[250px] mx-auto">
                    {focusTask}
                </p>
             )}
        </div>

        {/* The Big Timer */}
        <div className={`font-mono font-black tracking-tighter leading-none mb-6 drop-shadow-2xl ${getThemeColor()} ${pipWindow ? 'text-7xl' : 'text-5xl'}`}>
             {formatTime(timeLeft)}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-6">
            <button 
                onClick={resetTimer}
                className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
                title="Reset"
            >
                <RotateCcw size={20} />
            </button>

            <button 
                onClick={toggleTimer}
                className={`w-16 h-16 rounded-[2rem] ${getThemeBg()} text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_currentColor] transition-all hover:scale-105 active:scale-95`}
            >
                {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            
            {/* Pop Out Toggle (Only in Main Widget) */}
            {!pipWindow && (
                <button 
                    onClick={togglePiP}
                    className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-pink-500 dark:hover:text-pink-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
                    title="Pop Out Timer"
                >
                    <ExternalLink size={20} />
                </button>
            )}
        </div>
        
        {/* Footer Hint for PiP */}
        {pipWindow && (
            <p className="mt-6 text-[10px] text-slate-600 font-medium uppercase tracking-wider opacity-50">
                Always on Top
            </p>
        )}
    </div>
  );

  // -----------------------------------------------------------
  // RENDER LOGIC
  // -----------------------------------------------------------

  // 1. The Video Player (ALWAYS in Main Window, Hidden if needed)
  // We keep this rendered in the DOM tree so audio keeps playing.
  const VideoPlayer = (
    <div 
        className={`bg-black overflow-hidden transition-all duration-500 ${
            // If we are in Pomodoro Page, we attach to anchor (handled by CSS via Portal below)
            // If we are NOT in Pomodoro Page, we show mini player
            // If PiP is active, we HIDE this but KEEP IT RENDERED (height 0) or Show it as "Audio Only" placeholder
            pipWindow ? 'h-0 opacity-0 pointer-events-none' : 
            (!isPomodoroPage && !isMiniExpanded ? 'h-0' : 'min-h-[180px] flex-1')
        }`}
    >
        <iframe 
          width="100%" 
          height="100%" 
          src="https://www.youtube.com/embed/videoseries?list=PLxoZGx3mVZsxJgQlgxSOBn6zCONGfl6Tm&enablejsapi=1" 
          title="Study Playlist" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerPolicy="strict-origin-when-cross-origin" 
          allowFullScreen
          className="w-full h-full object-cover"
        />
        {/* Drag Handle for Main Widget */}
        {!isPomodoroPage && !pipWindow && (
            <div 
                className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/50 to-transparent z-10 cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
            />
        )}
    </div>
  );


  // 2. Determine where to render the TIMER CONTROLS
  let TimerRenderNode = null;

  if (pipWindow) {
      // CASE A: Render in PiP Window
      TimerRenderNode = createPortal(TimerControls, pipWindow.document.body);
  } else if (isPomodoroPage) {
      // CASE B: Render in Pomodoro Page Anchor (Snap)
      const anchor = document.getElementById('video-anchor');
      if (anchor) {
          // In anchor mode, we don't render the controls here because the Pomodoro Page has its own BIG timer.
          // We ONLY render the VideoPlayer in the anchor.
          TimerRenderNode = createPortal(
            <div className="w-full h-full rounded-3xl overflow-hidden shadow-inner bg-black">
                {VideoPlayer}
            </div>
            , anchor
          );
          // Return early to avoid rendering the floating widget
          return TimerRenderNode; 
      }
  }

  // CASE C: Floating Widget (Default)
  // This renders if NOT PiP and NOT on Pomodoro Page
  // OR if on Pomodoro Page but anchor not found yet.
  if (!pipWindow && !isPomodoroPage) {
    return (
        <div 
            ref={containerRef}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: isMiniExpanded ? '320px' : '220px',
                zIndex: 100,
            }}
            className="rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300"
        >
            {/* Widget Header */}
            <div 
                onMouseDown={handleMouseDown}
                className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 cursor-grab active:cursor-grabbing"
            >
                <div className="flex items-center gap-2">
                    <Zap size={14} className={isActive ? 'text-pink-500 fill-pink-500' : 'text-slate-400'} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Music & Timer</span>
                </div>
                <div className="flex gap-2">
                     <button onClick={togglePiP} className="text-slate-400 hover:text-pink-500"><ExternalLink size={14}/></button>
                     <button onClick={() => setIsMiniExpanded(!isMiniExpanded)} className="text-slate-400 hover:text-white">
                        {isMiniExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                     </button>
                </div>
            </div>

            {/* If Expanded, show Timer Controls in Widget */}
            {isMiniExpanded && (
                <div className="border-b border-slate-100 dark:border-slate-800">
                     {/* Compact Timer for Widget */}
                     <div className="p-4 flex items-center justify-between bg-white dark:bg-slate-900">
                        <div>
                             <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Time Remaining</p>
                             <p className={`font-mono text-3xl font-bold leading-none ${getThemeColor()}`}>{formatTime(timeLeft)}</p>
                        </div>
                        <button 
                            onClick={toggleTimer}
                            className={`w-10 h-10 rounded-full ${getThemeBg()} text-white flex items-center justify-center shadow-lg active:scale-95`}
                        >
                            {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                        </button>
                     </div>
                </div>
            )}

            {/* The Video Player */}
            {VideoPlayer}
        </div>
    );
  }

  // If PiP Window IS active, we still need to keep the VideoPlayer in the main React Tree so it doesn't unmount.
  // We can render it in a hidden container.
  if (pipWindow) {
      return (
          <>
            {TimerRenderNode} {/* Portal to Window */}
            <div className="fixed bottom-4 right-4 w-64 h-36 opacity-0 pointer-events-none z-0">
                {VideoPlayer} {/* Hidden Player to keep audio running */}
            </div>
            {/* Show a placeholder in the app to indicate timer is popped out */}
            {!isPomodoroPage && (
                 <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-4 animate-in slide-in-from-bottom-4 z-50">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 animate-pulse">
                        <ExternalLink size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Timer Popped Out</p>
                        <button onClick={() => { pipWindow.close(); setPipWindow(null); }} className="text-xs text-slate-400 hover:text-white underline mt-0.5">
                            Bring back to App
                        </button>
                    </div>
                 </div>
            )}
          </>
      );
  }

  return null;
};

export default GlobalYoutubePlayer;
