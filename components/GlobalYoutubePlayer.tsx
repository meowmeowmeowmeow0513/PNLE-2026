import React, { useEffect, useState, useRef } from 'react';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { Pause, Play, RotateCcw, ChevronUp, ChevronDown, Maximize2 } from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { timeLeft, isActive, toggleTimer, resetTimer, mode, focusTask } = usePomodoro();
  
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    width: '320px',
    height: 'auto',
    borderRadius: '1rem',
    zIndex: 50,
  });

  const [isMiniExpanded, setIsMiniExpanded] = useState(true);
  const [isPomodoroMode, setIsPomodoroMode] = useState(false);
  
  // Ref for the player container
  const containerRef = useRef<HTMLDivElement>(null);

  // Format helper
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let animationFrameId: number;

    const updatePosition = () => {
      const anchor = document.getElementById('video-anchor');
      
      if (activeItem === 'Pomodoro Timer' && anchor) {
        // --- POMODORO MODE (Snaps to anchor) ---
        setIsPomodoroMode(true);
        const rect = anchor.getBoundingClientRect();
        
        setStyle({
          position: 'fixed',
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          borderRadius: '1.5rem', // Match the rounded-3xl of the placeholder
          zIndex: 40, // Below modals but above base content if needed
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        });
      } else {
        // --- MINI MODE (Floating Widget) ---
        setIsPomodoroMode(false);
        
        setStyle({
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: isMiniExpanded ? '320px' : '200px',
          height: 'auto', // Allow content to dictate height
          borderRadius: '1rem',
          zIndex: 100, // Always on top when floating
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        });
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true); // Capture scroll to update anchor pos

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [activeItem, isMiniExpanded]);

  return (
    <div 
      ref={containerRef}
      style={style}
      className={`
        overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl 
        border border-slate-200 dark:border-slate-700
      `}
    >
      {/* 
         MINI PLAYER HEADER 
         Only visible when NOT in Pomodoro Mode
      */}
      {!isPomodoroMode && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/50">
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {mode === 'pomodoro' ? 'Focus' : 'Break'}
              </span>
           </div>
           <div className="flex items-center gap-2">
               {/* Expand/Collapse Button */}
               <button 
                 onClick={() => setIsMiniExpanded(!isMiniExpanded)}
                 className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
               >
                 {isMiniExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
               </button>
           </div>
        </div>
      )}

      {/* 
          MINI PLAYER CONTROLS (Timer & Task)
          Only visible when NOT in Pomodoro Mode AND Expanded
      */}
      {!isPomodoroMode && isMiniExpanded && (
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
             {/* Timer */}
             <div className="flex items-center justify-between mb-3">
                <span className={`font-mono text-3xl font-black tracking-tighter ${
                    isActive ? 'text-pink-500 dark:text-pink-400' : 'text-slate-700 dark:text-white'
                }`}>
                    {formatTime(timeLeft)}
                </span>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={toggleTimer}
                        className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 transition-transform active:scale-95"
                    >
                        {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>
                    {!isActive && (
                        <button 
                            onClick={resetTimer}
                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors"
                        >
                            <RotateCcw size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Current Task */}
            {focusTask && (
                <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Focusing On</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                        {focusTask}
                    </p>
                </div>
            )}
        </div>
      )}

      {/* 
          YOUTUBE IFRAME CONTAINER 
          This is the permanent home of the IFrame.
          When in Mini Mode, it behaves like a small video embed.
          When in Pomodoro Mode, it fills the anchor area.
      */}
      <div 
        className={`
          relative w-full bg-black transition-all duration-500
          ${isPomodoroMode ? 'h-full rounded-3xl' : (isMiniExpanded ? 'aspect-video' : 'h-0')}
        `}
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
        
        {/* Helper overlay for dragging if needed, currently just acts as click blocker for header */}
        {!isPomodoroMode && (
            <div className="absolute top-0 left-0 w-full h-8 bg-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default GlobalYoutubePlayer;
