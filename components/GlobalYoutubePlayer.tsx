
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { Pause, Play, RotateCcw, ChevronUp, ChevronDown, ExternalLink, Zap } from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { timeLeft, isActive, toggleTimer, resetTimer, mode, pipWindow } = usePomodoro();
  
  // DRAG STATE (For Mini Widget only)
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // WIDGET STATE
  const [isMiniExpanded, setIsMiniExpanded] = useState(false); // Collapsed by default
  const [isPomodoroPage, setIsPomodoroPage] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // --- FORMAT TIME ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- DRAG HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging if we are in "Widget Mode"
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
    setIsPomodoroPage(activeItem === 'Pomodoro Timer');
  }, [activeItem]);


  // -----------------------------------------------------------
  // COMPONENT: VIDEO PLAYER (Always Rendered Here)
  // -----------------------------------------------------------
  // This is the source of truth for the audio. 
  // We use CSS to move it visually or Portal it to anchors.
  const VideoPlayerNode = (
    <div className="w-full h-full bg-black relative group">
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
        {/* Overlay for Dragging when in Widget Mode */}
        {!isPomodoroPage && !pipWindow && (
            <div 
                className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/50 to-transparent z-10 cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
            />
        )}
    </div>
  );

  // -----------------------------------------------------------
  // COMPONENT: TIMER CONTROLS (Only for PiP Window)
  // -----------------------------------------------------------
  const PiPTimerControls = (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">
            {mode}
        </div>
        <div className="text-7xl font-mono font-black tracking-tighter leading-none mb-6">
            {formatTime(timeLeft)}
        </div>
        <div className="flex gap-4">
             <button onClick={resetTimer} className="p-3 bg-slate-200 dark:bg-slate-800 rounded-full hover:scale-110 transition-transform">
                <RotateCcw size={20} className="text-slate-600 dark:text-slate-400" />
             </button>
             <button onClick={toggleTimer} className="p-4 bg-pink-600 rounded-full text-white hover:scale-110 transition-transform shadow-lg">
                {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
             </button>
        </div>
        <p className="mt-8 text-[10px] text-slate-500">Music playing in main window</p>
    </div>
  );

  // -----------------------------------------------------------
  // RENDER LOGIC
  // -----------------------------------------------------------

  // 1. If PiP Window is Active
  if (pipWindow) {
      // Portal the TIMER into the PiP Window
      // Keep the VIDEO hidden in the main app (bottom right)
      return (
        <>
            {createPortal(PiPTimerControls, pipWindow.document.body)}
            
            {/* Hidden persistent player in main app */}
            <div className="fixed bottom-4 right-4 w-64 h-36 opacity-0 pointer-events-none z-0">
                {VideoPlayerNode}
            </div>
            
            {/* Visual Indicator in Main App if NOT on Pomodoro Page */}
            {!isPomodoroPage && (
                 <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-4 z-[9999]">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold">Timer is Popped Out</span>
                 </div>
            )}
        </>
      );
  }

  // 2. If on Pomodoro Page
  if (isPomodoroPage) {
      // Try to find the anchor element
      const anchor = document.getElementById('video-anchor');
      if (anchor) {
          // Portal the VIDEO into the anchor
          return createPortal(VideoPlayerNode, anchor);
      }
  }

  // 3. Default: Floating Mini Widget (on other pages)
  return (
    <div 
        ref={containerRef}
        style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: isMiniExpanded ? '300px' : '220px',
            zIndex: 9999,
        }}
        className="rounded-xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col"
    >
        {/* Widget Header */}
        <div 
            onMouseDown={handleMouseDown}
            className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 cursor-grab active:cursor-grabbing border-b border-slate-200 dark:border-slate-700"
        >
            <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-pink-500' : 'text-slate-500'}`}>
                    {isActive ? 'Focusing' : 'Paused'}
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                    {formatTime(timeLeft)}
                </span>
            </div>
            <button onClick={() => setIsMiniExpanded(!isMiniExpanded)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                {isMiniExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
        </div>

        {/* Video Area (Only shown if expanded or audio playing) */}
        <div className={`transition-all duration-300 ${isMiniExpanded ? 'h-48' : 'h-0'}`}>
             {VideoPlayerNode}
        </div>
        
        {/* Mini Controls (If expanded) */}
        {isMiniExpanded && (
            <div className="p-3 flex justify-center bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                 <button onClick={toggleTimer} className="p-2 rounded-full bg-pink-500 text-white shadow-md hover:scale-105 active:scale-95 transition-all">
                    {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                 </button>
            </div>
        )}
    </div>
  );
};

export default GlobalYoutubePlayer;
