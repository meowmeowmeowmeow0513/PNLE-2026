
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { Pause, Play, RotateCcw, ChevronUp, ChevronDown, Maximize2, Move, ExternalLink } from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { timeLeft, isActive, toggleTimer, resetTimer, mode, focusTask, pipWindow, setPipWindow } = usePomodoro();
  
  // DRAG STATE
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 300 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // WIDGET STATE
  const [isMiniExpanded, setIsMiniExpanded] = useState(true);
  const [isPomodoroMode, setIsPomodoroMode] = useState(false);
  
  // REFS
  const containerRef = useRef<HTMLDivElement>(null);

  // HELPER: Format Time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- PICTURE IN PICTURE LOGIC ---
  const togglePiP = async () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    // Check if API is available
    if (!('documentPictureInPicture' in window)) {
      alert("Your browser doesn't support the 'Keep on Top' window feature yet. Try Chrome or Edge!");
      return;
    }

    try {
      const dpip = (window as any).documentPictureInPicture;
      const win = await dpip.requestWindow({
        width: 320,
        height: 400,
      });

      // Copy Styles to new Window
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
          link.media = styleSheet.media.mediaText;
          if (styleSheet.href) {
             link.href = styleSheet.href;
          }
          win.document.head.appendChild(link);
        }
      });

      // Handle Close
      win.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      setPipWindow(win);
    } catch (err) {
      console.error("Failed to open PiP window:", err);
    }
  };

  // --- DRAG HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPomodoroMode || pipWindow) return; // Disable drag in focused mode or PiP
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

  // --- POSITIONING LOGIC ---
  useEffect(() => {
    let animationFrameId: number;

    const updateLayout = () => {
      const anchor = document.getElementById('video-anchor');
      
      if (activeItem === 'Pomodoro Timer' && anchor && !pipWindow) {
        setIsPomodoroMode(true);
        // If in Pomodoro Mode, snap to anchor via standard CSS (managed by classnames below)
      } else {
        setIsPomodoroMode(false);
      }
      animationFrameId = requestAnimationFrame(updateLayout);
    };

    updateLayout();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeItem, pipWindow]);

  // --- RENDER CONTENT ---
  const PlayerContent = (
    <div 
      ref={containerRef}
      style={!isPomodoroMode && !pipWindow ? {
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isMiniExpanded ? '320px' : '220px',
          zIndex: 100,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      } : { 
          width: '100%', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
      }}
      className={`
        overflow-hidden transition-all duration-300 ease-out
        ${isPomodoroMode && !pipWindow 
            ? 'absolute inset-0 rounded-3xl' // Snap to anchor
            : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl' // Floating style
        }
        ${pipWindow ? 'h-full w-full' : ''}
      `}
    >
      {/* HEADER: Visible only in Mini/PiP Mode */}
      {(!isPomodoroMode || pipWindow) && (
        <div 
          onMouseDown={handleMouseDown}
          className={`flex items-center justify-between px-4 py-3 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800/50 cursor-grab active:cursor-grabbing select-none`}
        >
           <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-pink-500 animate-pulse' : 'bg-slate-400'}`}></div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {mode === 'pomodoro' ? 'Focus' : 'Break'}
              </span>
           </div>
           <div className="flex items-center gap-2">
               {!pipWindow && (
                  <>
                    <button 
                        onClick={togglePiP}
                        className="text-slate-400 hover:text-pink-500 transition-colors"
                        title="Pop Out (Keep on Top)"
                    >
                        <ExternalLink size={14} />
                    </button>
                    <button 
                        onClick={() => setIsMiniExpanded(!isMiniExpanded)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        {isMiniExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                  </>
               )}
           </div>
        </div>
      )}

      {/* CONTROLS: Timer & Task Info */}
      {((!isPomodoroMode && isMiniExpanded) || pipWindow) && (
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900">
             {/* Big Timer */}
             <div className="flex items-center justify-between mb-4">
                <span className={`font-mono text-4xl font-black tracking-tighter ${
                    isActive ? 'text-pink-500 dark:text-pink-400' : 'text-slate-700 dark:text-white'
                }`}>
                    {formatTime(timeLeft)}
                </span>
                
                <div className="flex items-center gap-3">
                    {!isActive && (
                        <button 
                            onClick={resetTimer}
                            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors"
                        >
                            <RotateCcw size={16} />
                        </button>
                    )}
                    <button 
                        onClick={toggleTimer}
                        className="w-12 h-12 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 transition-transform active:scale-95"
                    >
                        {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                    </button>
                </div>
            </div>

            {/* Current Task */}
            {focusTask && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5 flex items-center gap-1">
                        <Maximize2 size={10} /> Focusing On
                    </p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {focusTask}
                    </p>
                </div>
            )}
        </div>
      )}

      {/* VIDEO CONTAINER */}
      <div 
        className={`relative bg-black transition-all duration-500 flex-1 ${!isMiniExpanded && !isPomodoroMode && !pipWindow ? 'h-0' : 'min-h-[180px]'}`}
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
        
        {/* Drag Overlay (Transparent) */}
        {!isPomodoroMode && !pipWindow && (
            <div 
                className="absolute top-0 left-0 w-full h-8 bg-transparent z-10 cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
            />
        )}
      </div>
    </div>
  );

  // --- RENDER LOGIC ---
  // 1. If PiP is active, Portal to the new window.
  if (pipWindow) {
    return createPortal(
        <div className="h-screen w-screen bg-slate-900 text-white flex flex-col">
            {PlayerContent}
        </div>, 
        pipWindow.document.body
    );
  }

  // 2. If Pomodoro Mode (and no PiP), Portal to the anchor element inside Pomodoro.tsx
  if (isPomodoroMode) {
      const anchor = document.getElementById('video-anchor');
      if (anchor) {
          return createPortal(PlayerContent, anchor);
      }
  }

  // 3. Otherwise, render as a fixed floating widget in the main App
  return PlayerContent;
};

export default GlobalYoutubePlayer;
