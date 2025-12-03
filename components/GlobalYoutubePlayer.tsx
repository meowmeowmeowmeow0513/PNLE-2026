
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { Pause, Play, RotateCcw, ChevronUp, ChevronDown, GripHorizontal, Maximize2, X } from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { timeLeft, isActive, toggleTimer, resetTimer, mode, pipWindow } = usePomodoro();
  
  // -- STATE --
  const [isPomodoroPage, setIsPomodoroPage] = useState(false);
  
  // Widget State
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 240 });
  const [isMiniExpanded, setIsMiniExpanded] = useState(true);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  
  // Dragging Logic
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);

  // -- EFFECT: DETECT PAGE & ANCHOR --
  useEffect(() => {
    const isPomo = activeItem === 'Pomodoro Timer';
    setIsPomodoroPage(isPomo);

    // If on Pomodoro page, find the anchor element's position
    const updateAnchor = () => {
        const anchorEl = document.getElementById('video-anchor');
        if (anchorEl && isPomo) {
            const rect = anchorEl.getBoundingClientRect();
            // Check if rect is valid (visible)
            if (rect.width > 0 && rect.height > 0) {
                setAnchorRect(rect);
            }
        } else {
            setAnchorRect(null);
        }
    };

    // Run immediately and on resize/scroll
    updateAnchor();
    const interval = setInterval(updateAnchor, 500); // Polling for layout changes
    window.addEventListener('resize', updateAnchor);
    window.addEventListener('scroll', updateAnchor);

    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', updateAnchor);
        window.removeEventListener('scroll', updateAnchor);
    };
  }, [activeItem]);

  // -- DRAGGING HANDLERS --
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPomodoroPage && !pipWindow) return; // Locked when anchored
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate new position
      let newX = e.clientX - dragStart.current.x;
      let newY = e.clientY - dragStart.current.y;

      // Bounds checking (keep on screen)
      const width = 300; // Approx widget width
      const height = isMiniExpanded ? 200 : 50;
      
      newX = Math.max(0, Math.min(window.innerWidth - width, newX));
      newY = Math.max(0, Math.min(window.innerHeight - height, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isMiniExpanded]);


  // -- RENDERERS --

  // 1. The Iframe (Never Unmounts)
  const VideoIframe = (
      <iframe 
        width="100%" 
        height="100%" 
        src="https://www.youtube.com/embed/videoseries?list=PLxoZGx3mVZsxJgQlgxSOBn6zCONGfl6Tm&enablejsapi=1" 
        title="Study Playlist" 
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerPolicy="strict-origin-when-cross-origin" 
        allowFullScreen
        className="w-full h-full object-cover pointer-events-auto"
      />
  );

  // 2. PiP Content (Portal to New Window)
  const PiPContent = pipWindow ? createPortal(
    <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center select-none bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4 text-pink-500">
            {mode === 'pomodoro' ? 'Focus Session' : 'Break Time'}
        </div>
        
        {/* Timer */}
        <div className="text-8xl font-mono font-black tracking-tighter leading-none mb-8 tabular-nums">
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-6">
             <button 
                onClick={resetTimer} 
                className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"
                title="Reset"
             >
                <RotateCcw size={24} />
             </button>
             
             <button 
                onClick={toggleTimer} 
                className={`p-6 rounded-full text-white shadow-xl transition-transform hover:scale-105 active:scale-95 ${isActive ? 'bg-amber-500' : 'bg-pink-600'}`}
             >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
             </button>
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 w-full">
            <p className="text-[10px] opacity-50 font-medium">
                Music Player is active in main window
            </p>
        </div>
    </div>,
    pipWindow.document.body
  ) : null;

  // -- CALCULATE STYLE FOR PLAYER CONTAINER --
  // If Anchored: Use the anchorRect coordinates (Absolute Overlay)
  // If Widget: Use the position state (Fixed)
  
  const isAnchored = isPomodoroPage && anchorRect && !pipWindow;
  
  const containerStyle: React.CSSProperties = isAnchored
    ? {
        position: 'fixed',
        top: anchorRect.top,
        left: anchorRect.left,
        width: anchorRect.width,
        height: anchorRect.height,
        borderRadius: '1rem', // Match rounded-2xl
        zIndex: 40, // Below dropdowns but above base content
        transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)', // Smooth snap
        boxShadow: 'none',
        pointerEvents: 'none', // Allow clicks to pass through to the anchor div if needed, but we enable pointer-events on iframe/controls
      }
    : {
        position: 'fixed',
        top: position.y,
        left: position.x,
        width: isMiniExpanded ? 300 : 200,
        height: isMiniExpanded ? 220 : 48,
        borderRadius: '1rem',
        zIndex: 9999, // Always on top
        transition: isDragging ? 'none' : 'width 0.3s, height 0.3s',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // shadow-xl
    };

  return (
    <>
      {/* 1. The Persistent Container */}
      <div 
        ref={playerRef}
        style={containerStyle}
        className={`overflow-hidden bg-black flex flex-col border border-slate-200 dark:border-slate-700 ${!isAnchored ? 'bg-white dark:bg-slate-900' : ''}`}
      >
        {/* -- Widget Header (Only visible when floating) -- */}
        {!isAnchored && (
            <div 
                onMouseDown={handleMouseDown}
                className="h-10 flex items-center justify-between px-3 bg-slate-50 dark:bg-slate-800 cursor-grab active:cursor-grabbing border-b border-slate-200 dark:border-slate-700 select-none shrink-0 pointer-events-auto"
            >
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <GripHorizontal size={14} />
                    <span className="font-mono text-xs font-bold text-pink-600 dark:text-pink-400">
                         {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {/* Minimize Toggle */}
                    <button 
                        onClick={() => setIsMiniExpanded(!isMiniExpanded)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors"
                    >
                        {isMiniExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                </div>
            </div>
        )}

        {/* -- Video Area -- */}
        <div className={`relative w-full flex-1 bg-black ${isAnchored ? 'h-full' : ''} pointer-events-auto`}>
            {/* The Iframe Itself */}
            {VideoIframe}

            {/* Drag Guard: Overlay that appears ONLY during drag to prevent iframe from eating mouse events */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-transparent cursor-grabbing"></div>
            )}
        </div>

        {/* -- Mini Controls (Only visible when floating & expanded) -- */}
        {!isAnchored && isMiniExpanded && (
            <div className="h-12 flex items-center justify-center gap-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 pointer-events-auto">
                 <button 
                    onClick={resetTimer}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                 >
                    <RotateCcw size={16} />
                 </button>
                 <button 
                    onClick={toggleTimer}
                    className={`p-2 rounded-full text-white shadow-md transition-transform active:scale-95 ${isActive ? 'bg-amber-500' : 'bg-pink-500'}`}
                 >
                    {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                 </button>
            </div>
        )}
      </div>

      {/* 2. PiP Portal Content */}
      {PiPContent}
    </>
  );
};

export default GlobalYoutubePlayer;
