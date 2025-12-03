
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { Pause, Play, RotateCcw, ChevronUp, ChevronDown, GripHorizontal } from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { timeLeft, isActive, toggleTimer, resetTimer, mode, pipWindow } = usePomodoro();
  
  // WIDGET POSITION STATE
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // WIDGET UI STATE
  const [isMiniExpanded, setIsMiniExpanded] = useState(true);
  const [isPomodoroPage, setIsPomodoroPage] = useState(false);
  
  // PAGE DETECTION
  useEffect(() => {
    setIsPomodoroPage(activeItem === 'Pomodoro Timer');
  }, [activeItem]);

  // FORMAT TIME HELPER
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- DRAG LOGIC (Only active when widget is floating) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPomodoroPage && !pipWindow) return; // Locked when anchored
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


  // -----------------------------------------------------------
  // COMPONENT: THE VIDEO IFRAME (PERSISTENT)
  // -----------------------------------------------------------
  // This node is created once and moved around the DOM.
  // We apply 'pointer-events-auto' explicitly to ensure interaction works.
  const VideoPlayerNode = (
    <div className="w-full h-full bg-black relative flex flex-col pointer-events-auto">
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
        
        {/* Drag Overlay: ONLY visible when in Widget Mode to allow dragging */}
        {!isPomodoroPage && !pipWindow && (
            <div 
                className="absolute top-0 left-0 w-full h-6 bg-transparent z-20 cursor-move hover:bg-black/10 transition-colors flex items-center justify-center group"
                onMouseDown={handleMouseDown}
            >
                <div className="w-10 h-1 rounded-full bg-white/30 group-hover:bg-white/60"></div>
            </div>
        )}
    </div>
  );

  // -----------------------------------------------------------
  // COMPONENT: PIP CONTROLS (Rendered inside Pop-out Window)
  // -----------------------------------------------------------
  const PiPTimerControls = (
    <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center select-none">
        <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4 text-current">
            {mode.replace(/([A-Z])/g, ' $1').trim()}
        </div>
        
        {/* Giant Timer */}
        <div className="text-7xl font-mono font-black tracking-tighter leading-none mb-8 text-current">
            {formatTime(timeLeft)}
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-6">
             <button 
                onClick={resetTimer} 
                className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Reset"
             >
                <RotateCcw size={20} className="opacity-70" />
             </button>
             
             <button 
                onClick={toggleTimer} 
                className={`p-5 rounded-full text-white shadow-xl transition-transform hover:scale-105 active:scale-95 ${isActive ? 'bg-amber-500' : 'bg-pink-600'}`}
             >
                {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
             </button>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 w-full">
            <p className="text-[10px] opacity-50 font-medium">
                Video playing in main window
            </p>
        </div>
    </div>
  );


  // -----------------------------------------------------------
  // RENDER LOGIC
  // -----------------------------------------------------------

  // CASE 1: PIP WINDOW ACTIVE
  // - Video: Hidden in main app (bottom left) to keep audio.
  // - Timer: Portaled to PiP Window.
  if (pipWindow) {
      return (
        <>
            {/* 1. Timer Controls in PiP */}
            {createPortal(PiPTimerControls, pipWindow.document.body)}
            
            {/* 2. Minimized Video Player (Main App) */}
            <div className="fixed bottom-4 left-4 w-64 h-36 rounded-lg overflow-hidden shadow-2xl border border-slate-700 z-50 opacity-90 hover:opacity-100 transition-opacity">
                {VideoPlayerNode}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 text-white text-[10px] font-bold rounded">
                    AUDIO ACTIVE
                </div>
            </div>
        </>
      );
  }

  // CASE 2: POMODORO PAGE ACTIVE
  // - Video: Portaled to the #video-anchor div in Pomodoro.tsx
  if (isPomodoroPage) {
      const anchor = document.getElementById('video-anchor');
      if (anchor) {
          return createPortal(VideoPlayerNode, anchor);
      }
  }

  // CASE 3: DEFAULT WIDGET (Any other page)
  // - Video: Inside a draggable floating card.
  return (
    <div 
        style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: isMiniExpanded ? '280px' : '200px',
            zIndex: 9999,
        }}
        className="rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300"
    >
        {/* Widget Header */}
        <div 
            onMouseDown={handleMouseDown}
            className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 cursor-grab active:cursor-grabbing border-b border-slate-100 dark:border-slate-700 select-none"
        >
            <div className="flex items-center gap-2">
                <GripHorizontal size={14} className="text-slate-400" />
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                    {formatTime(timeLeft)}
                </span>
            </div>
            <button 
                onClick={() => setIsMiniExpanded(!isMiniExpanded)} 
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
                {isMiniExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
        </div>

        {/* Video Container */}
        <div className={`transition-all duration-300 ease-in-out bg-black ${isMiniExpanded ? 'h-40' : 'h-0'}`}>
             {VideoPlayerNode}
        </div>
        
        {/* Mini Play/Pause Control */}
        {isMiniExpanded && (
            <div className="p-2 flex justify-center bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                 <button 
                    onClick={toggleTimer} 
                    className={`p-2 rounded-full text-white shadow-sm transition-transform active:scale-95 ${isActive ? 'bg-amber-500' : 'bg-pink-500'}`}
                 >
                    {isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                 </button>
            </div>
        )}
    </div>
  );
};

export default GlobalYoutubePlayer;
