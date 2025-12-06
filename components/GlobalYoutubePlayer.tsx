
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from '../types';
import { usePomodoro, PetType } from './PomodoroContext';
import { 
    Pause, Play, MonitorPlay, Maximize2, Zap, Coffee, Cat, Dog 
} from 'lucide-react';

interface GlobalYoutubePlayerProps {
  activeItem: NavigationItem;
}

// Mini Pet Component for PiP
const MiniPet = ({ type, mode }: { type: PetType, mode: string }) => {
    const isSleep = mode !== 'focus';
    
    // Simple SVG representation for PiP
    if (type === 'cat') {
        return (
            <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-lg">
                <circle cx="50" cy="50" r="40" fill={isSleep ? "#f0abfc" : "#e879f9"} />
                <path d="M20 20 L30 50 L50 40 Z" fill="#d946ef" />
                <path d="M80 20 L70 50 L50 40 Z" fill="#d946ef" />
                {isSleep ? (
                    <text x="50" y="60" fontSize="30" textAnchor="middle" fill="#86198f">Zzz</text>
                ) : (
                    <g fill="#86198f">
                        <circle cx="35" cy="45" r="5" />
                        <circle cx="65" cy="45" r="5" />
                        <path d="M45 60 Q50 65 55 60" fill="none" stroke="#86198f" strokeWidth="3" />
                    </g>
                )}
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-lg">
            <circle cx="50" cy="50" r="40" fill={isSleep ? "#fcd34d" : "#fbbf24"} />
            <path d="M20 30 L30 50 L50 40 Z" fill="#b45309" />
            <path d="M80 30 L70 50 L50 40 Z" fill="#b45309" />
            {isSleep ? (
                <text x="50" y="60" fontSize="30" textAnchor="middle" fill="#78350f">Zzz</text>
            ) : (
                <g fill="#78350f">
                    <circle cx="35" cy="45" r="5" />
                    <circle cx="65" cy="45" r="5" />
                    <path d="M40 60 Q50 70 60 60" fill="none" stroke="#78350f" strokeWidth="3" />
                </g>
            )}
        </svg>
    );
};

const GlobalYoutubePlayer: React.FC<GlobalYoutubePlayerProps> = ({ activeItem }) => {
  const { 
    timeLeft, isActive, mode, pipWindow, focusTask, sessionsCompleted, sessionGoal,
    toggleTimer, togglePiP, timerSettings, petType
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

  // Calculate Progress for Ring
  const totalTime = mode === 'focus' ? timerSettings.focus : (mode === 'shortBreak' ? timerSettings.shortBreak : timerSettings.longBreak);
  const progress = timeLeft / totalTime;
  const radius = 65; // Smaller radius for 220px window
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);

  // --- CONTENT FOR PIP WINDOW (Styled to match Main App) ---
  const PiPContent = pipWindow ? createPortal(
    <div className={`flex flex-col items-center justify-center h-full w-full relative p-2 font-sans overflow-hidden ${mode === 'focus' ? 'bg-[#020617]' : 'bg-[#0f172a]'}`}>
        
        {/* Animated Background Mesh */}
        <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${mode === 'focus' ? 'from-pink-600 via-purple-900 to-transparent' : 'from-cyan-500 via-blue-900 to-transparent'} animate-pulse`}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

        <div className="relative z-10 flex flex-col items-center w-full h-full justify-between py-1">
            
            {/* Top Bar: Task & Status */}
            <div className="w-full flex items-center justify-between px-2">
                 <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${mode === 'focus' ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
                    {mode === 'focus' ? <Zap size={8} fill="currentColor" /> : <Coffee size={8} fill="currentColor" />}
                    {mode === 'focus' ? 'Focus' : 'Break'}
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                    {sessionsCompleted}/{sessionGoal}
                </div>
            </div>

            {/* Central Ring & Time */}
            <div className="relative flex items-center justify-center my-1">
                 <svg width="140" height="140" className="transform -rotate-90">
                    <circle cx="70" cy="70" r="65" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
                    <circle 
                        cx="70" cy="70" r="65" 
                        stroke={mode === 'focus' ? '#ec4899' : '#06b6d4'} 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeLinecap="round" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset} 
                        className="transition-all duration-300 ease-linear"
                    />
                 </svg>
                 
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <div className="mb-1 transform scale-75 origin-center">
                         <MiniPet type={petType} mode={mode} />
                     </div>
                     <span className="text-3xl font-mono font-black tracking-tighter text-white drop-shadow-lg leading-none">
                        {formatTime(timeLeft)}
                     </span>
                 </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 items-center">
                <button 
                    onClick={toggleTimer} 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 transition-transform hover:scale-105 active:scale-95 ${mode === 'focus' ? 'bg-gradient-to-br from-pink-600 to-rose-600' : 'bg-gradient-to-br from-cyan-600 to-blue-600'}`}
                >
                    {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                </button>
            </div>
            
            {focusTask && (
                <div className="w-full text-center mt-1 px-4">
                    <p className="text-[9px] font-bold text-white/60 truncate">{focusTask}</p>
                </div>
            )}
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
                    className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-50 backdrop-blur-md z-50"
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
