
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

  useEffect(() => {
    let animationFrameId: number;

    const syncPosition = () => {
        const anchor = document.getElementById('video-anchor');
        
        if (activeItem === 'Pomodoro Timer' && anchor) {
            const rect = anchor.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                setPlayerStyle({
                    position: 'fixed',
                    top: `${rect.top}px`,
                    left: `${rect.left}px`,
                    width: `${rect.width}px`,
                    height: `${rect.height}px`,
                    opacity: 1,
                    zIndex: 40,
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    pointerEvents: 'auto',
                    transition: 'none'
                });
            }
        } 
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

  // --- CONTENT FOR PIP WINDOW (Styled to match Main App) ---
  const PiPContent = pipWindow ? createPortal(
    <div className="flex flex-col items-center justify-center h-full w-full relative p-6 bg-[#020617] text-white font-sans overflow-hidden">
        
        {/* Animated Background Mesh */}
        <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${mode === 'focus' ? 'from-pink-600 via-purple-900 to-transparent' : 'from-cyan-500 via-blue-900 to-transparent'} animate-pulse`}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

        {/* Progress Ring Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
             <div className={`w-48 h-48 rounded-full border-2 ${mode === 'focus' ? 'border-pink-500 box-shadow-[0_0_30px_#ec4899]' : 'border-cyan-500 box-shadow-[0_0_30px_#06b6d4]'} animate-ping`}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full">
            {/* Status Badge */}
            <div className={`mb-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 ${mode === 'focus' ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
                {mode === 'focus' ? <Zap size={10} fill="currentColor" /> : <Coffee size={10} fill="currentColor" />}
                {mode === 'focus' ? 'Focus Mode' : 'Break Time'}
            </div>

            {/* Time Display */}
            <div className="text-6xl font-mono font-black tracking-tighter text-white drop-shadow-2xl tabular-nums leading-none">
                {formatTime(timeLeft)}
            </div>
            
            {/* Focus Task */}
            <div className="mt-6 w-full text-center">
                {focusTask ? (
                    <div className="inline-block px-4 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                        <p className="text-xs font-bold text-white line-clamp-1">
                            {focusTask}
                        </p>
                    </div>
                ) : (
                    <div className="h-px w-12 bg-white/20 mx-auto my-3"></div>
                )}
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">
                    Session {sessionsCompleted} / {sessionGoal}
                </p>
            </div>

            {/* Controls */}
            <div className="mt-8 flex gap-6 items-center">
                <button 
                    onClick={toggleTimer} 
                    className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-2xl border border-white/10 transition-transform hover:scale-105 active:scale-95 ${mode === 'focus' ? 'bg-gradient-to-br from-pink-600 to-rose-600' : 'bg-gradient-to-br from-cyan-600 to-blue-600'}`}
                >
                    {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
            </div>
        </div>
    </div>,
    pipWindow.document.body
  ) : null;

  return (
    <>
        <div style={playerStyle} className="group bg-black">
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/rFRpnSxTWR0?list=PLxoZGx3mVZsxJgQlgxSOBn6zCONGfl6Tm&enablejsapi=1&controls=1&autoplay=0&loop=1" 
                title="Focus Station" 
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                className="w-full h-full object-cover"
            />
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

        {activeItem !== 'Pomodoro Timer' && isActive && !pipWindow && (
            <div className="fixed bottom-6 right-6 z-[999] animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="bg-white/10 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/20 dark:border-white/10 p-2 pr-4 rounded-full shadow-2xl flex items-center gap-4 group hover:scale-105 transition-transform cursor-move">
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
        {PiPContent}
    </>
  );
};

export default GlobalYoutubePlayer;
