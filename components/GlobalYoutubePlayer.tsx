
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro } from './PomodoroContext';
import { 
    Pause, Play, MonitorPlay, Maximize2, Zap, Coffee 
} from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { 
    timeLeft, isActive, mode, pipWindow, focusTask, sessionsCompleted, sessionGoal,
    toggleTimer, togglePiP
  } = usePomodoro();

  // --- PHANTOM OVERLAY STRATEGY ---
  // We keep the player in a FIXED position div always mounted.
  // If we are on the 'Pomodoro Timer' page, we find the #video-anchor element
  // and match our fixed div's position to it exactly.
  // If we are NOT on the page, we hide the player (opacity 0, 1x1 pixel) but keep it mounted.
  
  const [playerStyle, setPlayerStyle] = useState<React.CSSProperties>({
      position: 'fixed',
      bottom: 0,
      right: 0,
      width: '1px',
      height: '1px',
      opacity: 0,
      pointerEvents: 'none',
      zIndex: -1
  });

  const anchorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const syncPosition = () => {
        const anchor = document.getElementById('video-anchor');
        
        // 1. If we are on the Pomodoro page AND the anchor exists
        if (activeItem === 'Pomodoro Timer' && anchor) {
            const rect = anchor.getBoundingClientRect();
            
            // Only update if dimensions imply visibility
            if (rect.width > 0 && rect.height > 0) {
                setPlayerStyle({
                    position: 'fixed',
                    top: `${rect.top}px`,
                    left: `${rect.left}px`,
                    width: `${rect.width}px`,
                    height: `${rect.height}px`,
                    opacity: 1,
                    zIndex: 40, // Above normal content, below modals/tooltips
                    borderRadius: '0.75rem', // Match rounded-xl
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    pointerEvents: 'auto',
                    transition: 'none' // Instant snapping to avoid lag during scroll
                });
            }
        } 
        // 2. Otherwise, hide it (Phantom Mode)
        else {
            setPlayerStyle({
                position: 'fixed',
                bottom: '10px',
                right: '10px',
                width: '1px',
                height: '1px',
                opacity: 0,
                zIndex: -1,
                pointerEvents: 'none'
            });
        }

        animationFrameId = requestAnimationFrame(syncPosition);
    };

    syncPosition();

    return () => cancelAnimationFrame(animationFrameId);
  }, [activeItem]);

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- CONTENT FOR PIP WINDOW ---
  const PiPContent = pipWindow ? createPortal(
    <div className="flex flex-col items-center justify-center h-full w-full relative p-6">
        {/* Animated Background Gradient */}
        <div className={`absolute inset-0 opacity-30 bg-gradient-to-br ${mode === 'focus' ? 'from-pink-600 to-purple-900' : 'from-cyan-500 to-blue-900'} animate-pulse`}></div>
        
        {/* Progress Ring Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
             <div className={`w-64 h-64 rounded-full border-4 ${mode === 'focus' ? 'border-pink-500' : 'border-cyan-500'} animate-ping`}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full">
            {/* Status Pill */}
            <div className={`mb-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 ${mode === 'focus' ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>
                {mode === 'focus' ? <Zap size={10} fill="currentColor" /> : <Coffee size={10} fill="currentColor" />}
                {mode === 'focus' ? 'Focus Mode' : 'Break Time'}
            </div>

            {/* Time */}
            <div className="text-6xl font-mono font-black tracking-tighter text-white drop-shadow-2xl tabular-nums">
                {formatTime(timeLeft)}
            </div>
            
            {/* Task or Goal */}
            <div className="mt-4 w-full text-center">
                {focusTask ? (
                    <p className="text-xs font-bold text-slate-300 line-clamp-1 border-b border-white/10 pb-2 mb-2">
                        {focusTask}
                    </p>
                ) : (
                    <div className="h-px w-1/2 bg-white/10 mx-auto mb-3"></div>
                )}
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    Session {sessionsCompleted} / {sessionGoal}
                </p>
            </div>

            {/* Controls */}
            <div className="mt-6 flex gap-4">
                <button 
                    onClick={toggleTimer} 
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-110 active:scale-95 ${mode === 'focus' ? 'bg-pink-600 hover:bg-pink-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                >
                    {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
            </div>
        </div>
    </div>,
    pipWindow.document.body
  ) : null;

  return (
    <>
        {/* PERMANENT PLAYER CONTAINER (Moving Overlay) */}
        <div style={playerStyle} className="group bg-black">
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/rFRpnSxTWR0?si=1zzNmH_5xoEnXC8X&enablejsapi=1&controls=1&autoplay=0&loop=1" 
                title="Focus Station" 
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                className="w-full h-full object-cover"
            />
            
            {/* Overlay Button for PiP (Visible only when hovering the player on the Pomodoro page) */}
            {activeItem === 'Pomodoro Timer' && (
                <button 
                    onClick={togglePiP}
                    className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-500 backdrop-blur-md z-50"
                    title="Pop Out Widget"
                >
                    <MonitorPlay size={16} />
                </button>
            )}
        </div>

        {/* FLOATING PILL (When Active + Away from Page + NOT PiP) */}
        {activeItem !== 'Pomodoro Timer' && isActive && !pipWindow && (
            <div className="fixed bottom-6 right-6 z-[999] animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="bg-white/10 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/20 dark:border-white/10 p-2 pr-4 rounded-full shadow-2xl flex items-center gap-4 group hover:scale-105 transition-transform cursor-move">
                    {/* Mini Circle */}
                    <button 
                        onClick={toggleTimer}
                        className={`relative w-12 h-12 flex items-center justify-center rounded-full shadow-lg ${mode === 'focus' ? 'bg-pink-500 text-white' : 'bg-cyan-500 text-white'}`}
                    >
                        {isActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>
                    
                    <div className="flex flex-col min-w-[80px]">
                        <span className="font-mono text-xl font-black text-slate-800 dark:text-white leading-none tracking-tight">
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            {mode === 'focus' ? 'Focusing' : 'Resting'}
                        </span>
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

                    <button 
                        onClick={togglePiP} 
                        className="text-slate-400 hover:text-pink-500 dark:hover:text-white transition-colors"
                        title="Keep on Top"
                    >
                        <Maximize2 size={18} />
                    </button>
                </div>
            </div>
        )}

        {/* PiP Portal Content */}
        {PiPContent}
    </>
  );
};

export default GlobalYoutubePlayer;
