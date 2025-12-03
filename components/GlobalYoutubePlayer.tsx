
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { Pause, Play, RotateCcw, ChevronUp, ChevronDown, GripHorizontal, Maximize2, X, Music } from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { timeLeft, initialTime, isActive, toggleTimer, resetTimer, mode, pipWindow } = usePomodoro();
  
  // -- STATE --
  const [isPomodoroPage, setIsPomodoroPage] = useState(false);
  
  // Widget State
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: window.innerHeight - 250 });
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
      const height = isMiniExpanded ? 200 : 40;
      
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
  // We need a Mini SVG calculation here for the PiP window
  const pipRadius = 80;
  const pipCircumference = 2 * Math.PI * pipRadius;
  const pipProgress = timeLeft / initialTime;
  const pipDashOffset = pipCircumference * (1 - pipProgress);
  const ringColor = mode === 'pomodoro' ? '#ec4899' : (mode === 'shortBreak' ? '#10b981' : '#8b5cf6');

  const PiPContent = pipWindow ? createPortal(
    <div className="flex flex-col items-center justify-center w-full h-full p-4 select-none relative overflow-hidden">
        {/* Simplified Visual Timer for PiP */}
        <div className="relative mb-6">
            <svg width="180" height="180" className="transform -rotate-90 relative z-10">
                <circle cx="90" cy="90" r={pipRadius} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <circle 
                    cx="90" cy="90" r={pipRadius} fill="transparent" stroke={ringColor} strokeWidth="6"
                    strokeLinecap="round" strokeDasharray={pipCircumference} strokeDashoffset={pipDashOffset}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-mono font-bold text-slate-800 dark:text-white">
                     {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                </span>
            </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-6 relative z-20">
             <button 
                onClick={resetTimer} 
                className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
             >
                <RotateCcw size={20} />
             </button>
             
             <button 
                onClick={toggleTimer} 
                className={`p-4 rounded-full text-white shadow-xl transition-transform hover:scale-105 active:scale-95 ${isActive ? 'bg-amber-500' : 'bg-pink-600'}`}
             >
                {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
             </button>
        </div>
        
        <div className="mt-auto w-full text-center">
             <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                {mode === 'pomodoro' ? 'Focus Session' : 'Break Time'}
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
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth snap
        boxShadow: 'none',
        pointerEvents: 'none', // Allow clicks to pass through to the anchor div if needed
      }
    : {
        position: 'fixed',
        top: position.y,
        left: position.x,
        width: isMiniExpanded ? 300 : 180,
        height: isMiniExpanded ? 200 : 40,
        borderRadius: '16px', // Dynamic Island feel
        zIndex: 9999, // Always on top
        transition: isDragging ? 'none' : 'width 0.3s, height 0.3s, border-radius 0.3s',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', // heavy shadow
        backdropFilter: 'blur(20px)',
    };

  return (
    <>
      {/* 1. The Persistent Container */}
      <div 
        ref={playerRef}
        style={containerStyle}
        className={`overflow-hidden flex flex-col border transition-colors ${
            !isAnchored 
            ? 'bg-white/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-white/10' 
            : 'bg-black border-transparent'
        }`}
      >
        {/* -- Widget Header (Only visible when floating) -- */}
        {!isAnchored && (
            <div 
                onMouseDown={handleMouseDown}
                className="h-9 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing select-none shrink-0 pointer-events-auto group"
            >
                <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                    <GripHorizontal size={14} className="text-slate-400" />
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                         {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {/* Minimize Toggle */}
                    <button 
                        onClick={() => setIsMiniExpanded(!isMiniExpanded)}
                        className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-slate-400 transition-colors"
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
            <div className="h-12 flex items-center justify-center gap-6 bg-white dark:bg-slate-900 shrink-0 pointer-events-auto border-t border-slate-100 dark:border-white/5">
                 <button 
                    onClick={resetTimer}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                 >
                    <RotateCcw size={16} />
                 </button>
                 <button 
                    onClick={toggleTimer}
                    className={`p-2 rounded-full text-white shadow-md transition-transform active:scale-95 ${isActive ? 'bg-amber-500' : 'bg-pink-500'}`}
                 >
                    {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                 </button>
                 <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {mode === 'pomodoro' ? 'Focus' : 'Break'}
                 </div>
            </div>
        )}
      </div>

      {/* 2. PiP Portal Content */}
      {PiPContent}
    </>
  );
};

export default GlobalYoutubePlayer;
