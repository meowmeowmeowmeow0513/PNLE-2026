import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
    Play, Pause, RotateCcw, Waves, MonitorPlay, 
    Brain, Target, Music, Settings, X, Save, Trophy, SkipForward, Layers, AlertTriangle, Zap, Coffee, Heart, Cat, Dog, Sparkles, Star, Edit2, Check, Fish, Bone, CloudRain, Volume2, Cloud, ShieldCheck, ArrowRight, XCircle, Maximize2, Info
} from 'lucide-react';
import { usePomodoro, PresetName, TimerSettings, TimerMode, PetType, SoundscapeType, PetStage } from './PomodoroContext';
import { useTasks } from '../TaskContext';
import { isWithinInterval } from 'date-fns';
import confetti from 'canvas-confetti';
import PomodoroStats from './PomodoroStats';
import PomodoroFullScreen from './PomodoroFullScreen';

// --- ADVANCED PET STYLES ---
const petStyles = `
  /* Keyframes */
  @keyframes float-breath { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-4px) scale(1.02); } }
  @keyframes tail-sway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
  @keyframes tail-wag-fast { 0%, 100% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } }
  @keyframes blink-soft { 0%, 45%, 55%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.1); } }
  @keyframes ear-wiggle { 0%, 100% { transform: rotate(0); } 10% { transform: rotate(5deg); } 20% { transform: rotate(0); } }
  @keyframes squish-happy { 0% { transform: scale(1); } 40% { transform: scale(1.15, 0.85) translateY(5px); } 100% { transform: scale(1); } }
  @keyframes sleep-bubble { 0% { transform: scale(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: scale(1.5) translate(20px, -30px); opacity: 0; } }
  @keyframes pop-up { 
      0% { transform: scale(0) translateY(10px) rotate(var(--r)); opacity: 0; } 
      50% { opacity: 1; } 
      100% { transform: scale(1) translateY(-60px) rotate(var(--r)); opacity: 0; } 
  }
  @keyframes glow-pulse { 0%, 100% { filter: drop-shadow(0 0 2px rgba(255,255,255,0.5)); } 50% { filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)); } }
  @keyframes halo-spin { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.1); } 100% { transform: rotate(360deg) scale(1); } }
  @keyframes sunburst { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes egg-wobble { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }

  /* Classes */
  .pet-container { perspective: 1000px; }
  .pet-breathe { animation: float-breath 4s ease-in-out infinite; transform-origin: bottom center; }
  .pet-tail-slow { animation: tail-sway 3s ease-in-out infinite; transform-origin: bottom left; }
  .pet-tail-fast { animation: tail-wag-fast 0.5s ease-in-out infinite; transform-origin: bottom center; }
  .pet-blink { animation: blink-soft 4s infinite; transform-origin: center; transform-box: fill-box; }
  .pet-ear-L { animation: ear-wiggle 5s infinite 1s; transform-origin: bottom right; transform-box: fill-box; }
  .pet-ear-R { animation: ear-wiggle 5s infinite 2s; transform-origin: bottom left; transform-box: fill-box; }
  .pet-squish { animation: squish-happy 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  .pet-wobble { animation: egg-wobble 2s ease-in-out infinite; transform-origin: bottom center; }
  .zzz-bubble { animation: sleep-bubble 3s linear infinite; }
  .love-popup { animation: pop-up 0.8s ease-out forwards; }
  .pet-glow { animation: glow-pulse 3s infinite; }
  .sunburst-spin { animation: sunburst 20s linear infinite; }
`;

// --- INTERACTIVE PET AVATAR ---
interface PetAvatarProps {
    type: PetType;
    stage: PetStage;
    status: 'sleeping' | 'awake' | 'celebrating';
    hasHalo?: boolean;
    onPet?: (e: React.MouseEvent) => void;
    scale?: number;
}

const PetAvatar: React.FC<PetAvatarProps> = ({ type, stage, status, hasHalo, onPet, scale = 1 }) => {
    const [isInteracting, setIsInteracting] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        if (onPet) {
            setIsInteracting(true);
            setTimeout(() => setIsInteracting(false), 300); 
            onPet(e);
        }
    };

    const containerClass = `w-40 h-40 overflow-visible cursor-pointer ${isInteracting ? 'pet-squish' : status === 'celebrating' ? 'animate-bounce' : 'pet-breathe'}`;

    const NurseCap = () => (
        <g transform="translate(70, 45) scale(0.8)">
            <path d="M10 40 L20 10 L80 10 L90 40 Z" fill="white" stroke="#e2e8f0" strokeWidth="2" />
            <rect x="45" y="18" width="10" height="14" fill="#ef4444" />
            <rect x="37" y="22" width="26" height="6" fill="#ef4444" />
        </g>
    );

    // --- COSMIC CAT RENDERER (Blob Style) ---
    const renderCat = () => {
        // EGG STAGE
        if (stage === 'egg') {
            return (
                <svg viewBox="0 0 200 200" className={`${containerClass} pet-wobble`} style={{ transform: `scale(${scale})` }}>
                    <defs>
                        <linearGradient id="eggCat" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f0abfc" />
                            <stop offset="100%" stopColor="#c026d3" />
                        </linearGradient>
                    </defs>
                    <ellipse cx="100" cy="120" rx="50" ry="65" fill="url(#eggCat)" stroke="#a21caf" strokeWidth="3" />
                    {status === 'sleeping' && <text x="140" y="80" fontSize="24" className="zzz-bubble">Z</text>}
                </svg>
            );
        }

        const isLegendary = stage === 'legendary';
        const isBaby = stage === 'baby';
        const scaleFactor = isBaby ? 0.7 : isLegendary ? 1.1 : 1;

        return (
            <svg viewBox="0 0 200 200" className={containerClass} style={{ transform: `scale(${scale * scaleFactor})` }}>
                <defs>
                    <linearGradient id="catBody" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f0abfc" /> {/* Pink-300 */}
                        <stop offset="100%" stopColor="#c026d3" /> {/* Fuchsia-600 */}
                    </linearGradient>
                    <linearGradient id="catBelly" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fdf4ff" /> 
                        <stop offset="100%" stopColor="#fae8ff" /> 
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {hasHalo && (
                    <ellipse cx="100" cy="60" rx="40" ry="10" fill="none" stroke="#fbbf24" strokeWidth="4" className="animate-[halo-spin_4s_linear_infinite]" style={{ transformOrigin: '100px 60px' }} />
                )}

                {/* Tail */}
                <path 
                    d="M160 150 Q 190 120 180 100 Q 170 80 150 120" 
                    fill="none" 
                    stroke="#d946ef" 
                    strokeWidth={isBaby ? "8" : "12"} 
                    strokeLinecap="round" 
                    className={status === 'sleeping' ? '' : 'pet-tail-slow'} 
                />

                {/* Body (Loaf Shape) */}
                <g transform="translate(100, 130)">
                    <ellipse cx="0" cy="0" rx={isBaby ? 50 : 70} ry={isBaby ? 35 : 50} fill="url(#catBody)" filter="url(#glow)" />
                    <ellipse cx="0" cy="15" rx={isBaby ? 30 : 40} ry={isBaby ? 20 : 30} fill="url(#catBelly)" opacity="0.6" />
                </g>

                {/* Head Group */}
                <g transform={`translate(100, ${isBaby ? 105 : 95})`}>
                    {/* Ears */}
                    <path d="M-45 -20 L-55 -65 L-15 -35 Z" fill="url(#catBody)" stroke="#a21caf" strokeWidth="4" strokeLinejoin="round" className="pet-ear-L" />
                    <path d="M45 -20 L55 -65 L15 -35 Z" fill="url(#catBody)" stroke="#a21caf" strokeWidth="4" strokeLinejoin="round" className="pet-ear-R" />
                    
                    {/* Head Base */}
                    <ellipse cx="0" cy="0" rx={isBaby ? 45 : 55} ry={isBaby ? 35 : 45} fill="url(#catBody)" filter="url(#glow)" />
                    
                    {/* Face */}
                    {status === 'sleeping' ? (
                        <g fill="none" stroke="#701a75" strokeWidth="3" strokeLinecap="round" transform="translate(0, 5)">
                            <path d="M-25 0 Q-15 8 -5 0" /> {/* Left Eye Closed */}
                            <path d="M5 0 Q15 8 25 0" />   {/* Right Eye Closed */}
                            <path d="M-2 15 Q0 18 2 15" strokeWidth="2" /> {/* Mouth */}
                        </g>
                    ) : (
                        <g transform="translate(0, 5)">
                            {/* Eyes Open */}
                            <g fill="#4a044e">
                                <ellipse cx="-20" cy="-5" rx={isBaby ? 8 : 6} ry={isBaby ? 10 : 8} className="pet-blink" />
                                <ellipse cx="20" cy="-5" rx={isBaby ? 8 : 6} ry={isBaby ? 10 : 8} className="pet-blink" />
                                <circle cx="-18" cy="-8" r="2" fill="white" />
                                <circle cx="22" cy="-8" r="2" fill="white" />
                            </g>
                            {/* Cheeks */}
                            <circle cx="-35" cy="10" r="6" fill="#fbcfe8" opacity="0.6" />
                            <circle cx="35" cy="10" r="6" fill="#fbcfe8" opacity="0.6" />
                            {/* Mouth */}
                            <path d="M-5 12 Q0 16 5 12" fill="none" stroke="#701a75" strokeWidth="3" strokeLinecap="round" />
                        </g>
                    )}
                </g>
                
                {isLegendary && <NurseCap />}

                {/* ZZZ Particles */}
                {status === 'sleeping' && (
                    <g className="zzz-bubble" style={{ transformOrigin: '140px 60px' }}>
                        <text x="140" y="60" fontSize="24" fill="#a855f7" fontWeight="bold" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'}}>Z</text>
                    </g>
                )}
            </svg>
        );
    };

    // --- SUNNY DOGE RENDERER (Blob Style) ---
    const renderDog = () => {
        // EGG STAGE
        if (stage === 'egg') {
            return (
                <svg viewBox="0 0 200 200" className={`${containerClass} pet-wobble`} style={{ transform: `scale(${scale})` }}>
                    <defs>
                        <linearGradient id="eggDog" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fcd34d" />
                            <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                    </defs>
                    <ellipse cx="100" cy="120" rx="50" ry="65" fill="url(#eggDog)" stroke="#b45309" strokeWidth="3" />
                    {status === 'sleeping' && <text x="140" y="80" fontSize="24" className="zzz-bubble">Z</text>}
                </svg>
            );
        }

        const isLegendary = stage === 'legendary';
        const isBaby = stage === 'baby';
        const scaleFactor = isBaby ? 0.7 : isLegendary ? 1.1 : 1;

        return (
            <svg viewBox="0 0 200 200" className={containerClass} style={{ transform: `scale(${scale * scaleFactor})` }}>
                <defs>
                    <linearGradient id="dogBody" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fcd34d" /> {/* Amber-300 */}
                        <stop offset="100%" stopColor="#d97706" /> {/* Amber-600 */}
                    </linearGradient>
                    <linearGradient id="dogSnout" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fffbeb" /> 
                        <stop offset="100%" stopColor="#fef3c7" /> 
                    </linearGradient>
                    <filter id="glowDog" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {hasHalo && (
                    <ellipse cx="100" cy="50" rx="40" ry="10" fill="none" stroke="#fbbf24" strokeWidth="4" className="animate-[halo-spin_4s_linear_infinite]" style={{ transformOrigin: '100px 50px' }} />
                )}

                {/* Tail (Wagging) */}
                <path 
                    d="M150 140 Q 170 110 180 130" 
                    fill="none" 
                    stroke="#b45309" 
                    strokeWidth={isBaby ? "6" : "10"} 
                    strokeLinecap="round" 
                    className={status === 'sleeping' ? '' : 'pet-tail-fast'} 
                />

                {/* Body */}
                <g transform="translate(100, 135)">
                    <rect x={isBaby ? "-45" : "-60"} y={isBaby ? "-35" : "-45"} width={isBaby ? "90" : "120"} height={isBaby ? "70" : "90"} rx="40" fill="url(#dogBody)" filter="url(#glowDog)" />
                    <ellipse cx="0" cy="10" rx={isBaby ? 25 : 35} ry={isBaby ? 18 : 25} fill="url(#dogSnout)" opacity="0.5" />
                </g>

                {/* Head Group */}
                <g transform={`translate(100, ${isBaby ? 100 : 90})`}>
                    {/* Ears */}
                    <path d="M-40 -35 L-50 -10 L-25 -5 Z" fill="#b45309" stroke="#92400e" strokeWidth="3" strokeLinejoin="round" className={status === 'awake' || status === 'celebrating' ? 'pet-ear-L' : ''} />
                    <path d="M40 -35 L50 -10 L25 -5 Z" fill="#b45309" stroke="#92400e" strokeWidth="3" strokeLinejoin="round" className={status === 'awake' || status === 'celebrating' ? 'pet-ear-R' : ''} />

                    {/* Head Base */}
                    <rect x={isBaby ? "-40" : "-50"} y={isBaby ? "-35" : "-45"} width={isBaby ? "80" : "100"} height={isBaby ? "70" : "90"} rx="35" fill="url(#dogBody)" filter="url(#glowDog)" />
                    
                    {/* Snout Area */}
                    <ellipse cx="0" cy="20" rx={isBaby ? 25 : 35} ry={isBaby ? 20 : 28} fill="url(#dogSnout)" />

                    {/* Face */}
                    {status === 'sleeping' ? (
                        <g fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" transform="translate(0, -5)">
                            <path d="M-20 0 Q-10 5 0 0" />
                            <path d="M0 0 Q10 5 20 0" />
                            <circle cx="0" cy="15" r="5" fill="#451a03" stroke="none" />
                        </g>
                    ) : (
                        <g transform="translate(0, -5)">
                            {/* Eyes */}
                            <g fill="#451a03">
                                <circle cx="-20" cy="-5" r={isBaby ? 9 : 7} className="pet-blink" />
                                <circle cx="20" cy="-5" r={isBaby ? 9 : 7} className="pet-blink" />
                                <circle cx="-18" cy="-8" r="2.5" fill="white" />
                                <circle cx="22" cy="-8" r="2.5" fill="white" />
                            </g>
                            {/* Nose */}
                            <path d="M-8 15 Q0 10 8 15 Q0 25 -8 15" fill="#451a03" />
                            {/* Mouth */}
                            <path d="M0 25 L0 30 M-10 30 Q0 38 10 30" fill="none" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
                            {/* Tongue */}
                            <path d="M-5 35 Q0 45 5 35" fill="#ef4444" />
                        </g>
                    )}
                </g>

                {isLegendary && <NurseCap />}

                {/* ZZZ Particles */}
                {status === 'sleeping' && (
                    <g className="zzz-bubble" style={{ transformOrigin: '140px 50px' }}>
                        <text x="140" y="50" fontSize="24" fill="#f59e0b" fontWeight="bold" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'}}>Z</text>
                    </g>
                )}
            </svg>
        );
    };

    return (
        <div 
            className="relative transition-transform hover:scale-105 active:scale-95" 
            onClick={handleClick}
            title="Pet me!"
        >
            <style>{petStyles}</style>
            {type === 'cat' ? renderCat() : renderDog()}
        </div>
    );
};

// --- PET INFO MODAL ---
const PetInfoModal = ({ onClose }: { onClose: () => void }) => {
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-zoom-in" onClick={e => e.stopPropagation()}>
                
                <div className="p-6 md:p-8 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-pink-500">
                                <Heart size={24} fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Companion Guide</h3>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Care & Evolution</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar max-h-[60vh]">
                    {/* EVOLUTION CHAIN */}
                    <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles size={14} /> Evolution Stages
                        </h4>
                        <div className="space-y-4">
                            {[
                                { stage: 'Egg', time: '0 - 1 hr', desc: 'A new beginning.' },
                                { stage: 'Baby', time: '1 - 5 hrs', desc: 'Needs constant attention.' },
                                { stage: 'Child', time: '5 - 16 hrs', desc: 'Growing and learning.' },
                                { stage: 'Teen', time: '16 - 40 hrs', desc: 'Developing personality.' },
                                { stage: 'Legend', time: '40+ hrs', desc: 'Fully trained Nurse Companion.' }
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 4 ? 'bg-amber-400 text-amber-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-800 dark:text-white text-sm">{s.stage}</span>
                                            <span className="font-mono text-xs text-pink-500 font-bold">{s.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MECHANICS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                            <Zap size={20} className="text-blue-500 mb-2" />
                            <h5 className="font-bold text-slate-800 dark:text-white text-xs uppercase mb-1">Focus Energy</h5>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                Your pet gains XP while the timer is running. Consistency is key to growth.
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800">
                            <ShieldCheck size={20} className="text-amber-500 mb-2" />
                            <h5 className="font-bold text-slate-800 dark:text-white text-xs uppercase mb-1">Integrity Halo</h5>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                Completing sessions without quitting earns a golden halo. Integrity matters.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- ENHANCED NOTIFICATION WINDOW ---
const NotificationWindow = () => {
    const { completionEvent, clearCompletionEvent, petType, petStage, focusIntegrity, toggleTimer, stopSessionEarly, getPetMessage } = usePomodoro();
    const [show, setShow] = useState(false);
    const [animationState, setAnimationState] = useState<'enter' | 'idle' | 'exit'>('enter');

    useEffect(() => {
        if (completionEvent.type) {
            setShow(true);
            setAnimationState('enter');
            
            if (completionEvent.type === 'focus_complete' || completionEvent.type === 'goal_complete') {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 9999 });
            }
        }
    }, [completionEvent]);

    const handleClose = () => {
        setAnimationState('exit');
        setTimeout(() => {
            setShow(false);
            clearCompletionEvent();
        }, 400);
    };

    const handleContinue = () => {
        // Starts the next timer phase immediately
        handleClose();
        setTimeout(() => {
            toggleTimer();
        }, 450);
    };

    const handleEndSession = () => {
        handleClose();
        stopSessionEarly(true); // Stop and save if anything pending
    };

    if (!show) return null;

    let title = "";
    let message = "";
    let bgColor = "from-white to-slate-50 dark:from-slate-900 dark:to-slate-800";
    let accentColor = "text-yellow-500";
    let petStatus: 'celebrating' | 'awake' | 'sleeping' = 'celebrating';
    let sunburstColor = "bg-yellow-400";
    let petChat = "";
    
    // Action Logic
    let primaryAction = "Continue";
    let secondaryAction = "Dismiss";
    let showSecondary = true;

    if (completionEvent.type === 'focus_complete') {
        title = "Session Complete!";
        message = `Amazing focus! Take a breather.`;
        petChat = getPetMessage('complete');
        bgColor = "from-pink-50 to-white dark:from-pink-900/40 dark:to-slate-900";
        accentColor = "text-pink-500";
        sunburstColor = "bg-pink-400";
        primaryAction = "Start Break";
    } else if (completionEvent.type === 'break_complete') {
        title = "Break Over!";
        message = "Batteries recharged. Let's get back to work!";
        petChat = getPetMessage('break');
        bgColor = "from-cyan-50 to-white dark:from-cyan-900/40 dark:to-slate-900";
        accentColor = "text-cyan-500";
        petStatus = 'awake';
        sunburstColor = "bg-cyan-400";
        primaryAction = "Start Focus";
    } else if (completionEvent.type === 'goal_complete') {
        title = "Goal Crushed!";
        message = "You are absolutely unstoppable today! Session goal met.";
        petChat = "Wow! You're on fire!";
        bgColor = "from-amber-50 to-white dark:from-amber-900/40 dark:to-slate-900";
        accentColor = "text-amber-500";
        sunburstColor = "bg-amber-400";
        primaryAction = "Keep Going";
        secondaryAction = "End Session";
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <div className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${animationState === 'enter' ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}></div>
            
            {/* Main Card */}
            <div className={`relative z-10 w-[90%] max-w-sm md:max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/20 dark:border-white/10 transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) flex flex-col items-center overflow-hidden ${animationState === 'enter' ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 translate-y-10 opacity-0'}`}>
                
                {/* Sunburst Background Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none opacity-10 dark:opacity-20 animate-[spin_20s_linear_infinite]">
                     {[...Array(12)].map((_, i) => (
                         <div key={i} className={`absolute top-1/2 left-1/2 w-full h-8 ${sunburstColor} -translate-y-1/2 origin-left`} style={{ transform: `rotate(${i * 30}deg)` }}></div>
                     ))}
                </div>

                {/* Close X */}
                <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors z-20">
                    <XCircle size={24} />
                </button>

                {/* Pet Container */}
                <div className="relative -mt-4 mb-6 flex justify-center w-full">
                    {/* Pet Chat Bubble */}
                    <div className="absolute -top-4 right-0 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl rounded-bl-none shadow-lg border border-slate-100 dark:border-slate-700 animate-bounce z-20">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{petChat}</p>
                    </div>

                    <div className="relative z-10 filter drop-shadow-2xl">
                        <PetAvatar type={petType} stage={petStage} status={petStatus} scale={1.3} hasHalo={focusIntegrity > 90} />
                    </div>
                    {/* Sparkles */}
                    <Sparkles className={`absolute top-0 right-10 ${accentColor} animate-bounce`} size={24} />
                    <Star className={`absolute bottom-0 left-10 text-yellow-400 animate-pulse`} size={20} fill="currentColor" />
                </div>
                
                <div className="text-center relative z-10 w-full">
                    <h3 className={`text-3xl font-black ${accentColor} leading-tight mb-3 drop-shadow-sm`}>{title}</h3>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed mb-8 px-4">{message}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 w-full">
                        <button 
                            onClick={handleContinue}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 ${completionEvent.type === 'break_complete' ? 'bg-cyan-500 hover:bg-cyan-400' : completionEvent.type === 'focus_complete' ? 'bg-pink-500 hover:bg-pink-400' : 'bg-amber-500 hover:bg-amber-400'}`}
                        >
                            <Play size={18} fill="currentColor" /> {primaryAction}
                        </button>
                        
                        {showSecondary && (
                            <button 
                                onClick={completionEvent.type === 'goal_complete' ? handleEndSession : handleClose}
                                className="w-full py-3 rounded-2xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-sm uppercase tracking-wider"
                            >
                                {secondaryAction}
                            </button>
                        )}
                    </div>

                    {/* Integrity Bonus Badge */}
                    {completionEvent.type === 'focus_complete' && (
                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                            <ShieldCheck size={12} className="fill-emerald-500/20" /> +Integrity Boost
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN WIDGET ---
const FocusPetWidget = () => {
    const { isActive, mode, timeLeft, timerSettings, petType, setPetType, petName, setPetName, petStage, totalFocusMinutes, focusIntegrity, getPetMessage } = usePomodoro();
    const [hearts, setHearts] = useState<{ id: number, x: number, y: number, r: number, content: React.ReactNode }[]>([]);
    
    // Rename State
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(petName);
    
    // Info Modal State
    const [showInfo, setShowInfo] = useState(false);

    // Sync temp name when petName changes (e.g. switching pets)
    useEffect(() => {
        setTempName(petName);
    }, [petName]);

    // Combo System
    const [combo, setCombo] = useState(0);
    const comboTimeoutRef = useRef<number | null>(null);

    // Calculate Energy Progress
    const totalTime = mode === 'focus' ? timerSettings.focus : (mode === 'shortBreak' ? timerSettings.shortBreak : timerSettings.longBreak); 
    const progress = Math.min(100, Math.max(0, ((totalTime - timeLeft) / totalTime) * 100));
    
    let status: 'sleeping' | 'awake' | 'celebrating' = 'awake';
    let message = getPetMessage('idle');
    
    if (isActive) {
        if (mode === 'focus') {
            status = 'sleeping';
            message = getPetMessage('focus');
        } else {
            status = 'awake';
            message = getPetMessage('break');
        }
    } else {
        status = 'awake';
        message = getPetMessage('idle');
    }

    const handlePetClick = (e: React.MouseEvent) => {
        // Increment Combo
        setCombo(prev => prev + 1);
        if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
        comboTimeoutRef.current = window.setTimeout(() => setCombo(0), 2000);

        const rect = (e.target as HTMLElement).getBoundingClientRect();
        // Generate random offset around the click
        const x = e.clientX - rect.left + (Math.random() * 60 - 30); 
        const y = e.clientY - rect.top - 20;
        const r = Math.random() * 30 - 15; // Random rotation
        
        const id = Date.now() + Math.random();
        
        // Randomize content based on combo and pet type
        let content = <Heart size={20} fill="currentColor" />;
        
        if (petType === 'cat') {
             if (Math.random() > 0.7) content = <span className="text-xs font-bold text-pink-500">Meow!</span>;
             if (Math.random() > 0.9) content = <Fish size={20} className="text-blue-400" fill="currentColor" />;
             if (Math.random() > 0.85) content = <span className="text-xs font-bold text-purple-500">Purr...</span>;
        } else {
             if (Math.random() > 0.7) content = <span className="text-xs font-bold text-amber-600">Woof!</span>;
             if (Math.random() > 0.9) content = <Bone size={20} className="text-slate-300" fill="currentColor" />;
             if (Math.random() > 0.85) content = <span className="text-xs font-bold text-orange-500">Bark!</span>;
        }

        if (combo > 5 && Math.random() > 0.8) content = <span className="text-xs font-black text-emerald-500">XP+</span>;
        if (combo > 10 && Math.random() > 0.9) content = <Star size={24} fill="currentColor" className="text-yellow-400" />;

        setHearts(prev => [...prev, { id, x, y, r, content }]);
        
        // Remove heart after animation
        setTimeout(() => {
            setHearts(prev => prev.filter(h => h.id !== id));
        }, 800);
    };

    const handleSaveName = () => {
        const trimmed = tempName.trim();
        if (trimmed) {
            setPetName(trimmed);
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: petType === 'cat' ? ['#ec4899', '#f0abfc'] : ['#f59e0b', '#fbbf24']
            });
        } else {
            setTempName(petName); // Revert if empty
        }
        setIsEditingName(false);
    };

    const getStageTitle = (s: PetStage) => {
        switch(s) {
            case 'egg': return 'Egg';
            case 'baby': return 'Baby';
            case 'child': return 'Child';
            case 'teen': return 'Teen';
            case 'legendary': return 'RN';
            default: return '';
        }
    }

    return (
        <>
        <div className="flex-1 flex flex-col bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm relative overflow-hidden group min-h-[220px]">
            {/* Background Decor */}
            <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] pointer-events-none transition-colors duration-1000 ${petType === 'cat' ? 'bg-pink-500/20' : 'bg-amber-500/20'}`}></div>
            
            {/* Pet Toggle Switch */}
            <div className="absolute top-3 right-3 z-30 flex bg-white/80 dark:bg-black/40 rounded-full p-1 border border-white/20 backdrop-blur-md shadow-sm">
                <button 
                    onClick={() => setPetType('cat')}
                    className={`p-2 rounded-full transition-all ${petType === 'cat' ? 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-300 shadow-sm scale-110' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                    title="Switch to Cat"
                >
                    <Cat size={16} />
                </button>
                <button 
                    onClick={() => setPetType('dog')}
                    className={`p-2 rounded-full transition-all ${petType === 'dog' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 shadow-sm scale-110' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                    title="Switch to Dog"
                >
                    <Dog size={16} />
                </button>
            </div>

            {/* Level Badge & Info Trigger */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${petType === 'cat' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                    Lvl: {getStageTitle(petStage)}
                </span>
                <button 
                    onClick={() => setShowInfo(true)}
                    className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors"
                    title="Guide"
                >
                    <Info size={12} />
                </button>
            </div>

            {/* Combo Counter */}
            {combo > 1 && (
                <div className="absolute top-10 left-4 z-30 animate-bounce">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-full shadow-lg border-2 border-white transform -rotate-6 inline-block">
                        {combo}x COMBO!
                    </span>
                </div>
            )}

            <div className="flex-1 relative z-10 flex flex-col items-center justify-center mt-2">
                {/* Floating Particles Container */}
                <div className="absolute inset-0 pointer-events-none z-50 overflow-visible">
                    {hearts.map(h => (
                        <div 
                            key={h.id} 
                            className="absolute love-popup text-pink-500 dark:text-pink-400 drop-shadow-md font-bold"
                            style={{ left: h.x, top: h.y, '--r': `${h.r}deg` } as any}
                        >
                            {h.content}
                        </div>
                    ))}
                </div>

                {/* Name Badge */}
                <div className="mb-2 relative group/name">
                    {isEditingName ? (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in absolute bottom-0 left-1/2 -translate-x-1/2 min-w-[120px] bg-white dark:bg-slate-900 p-2 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rename {petType === 'cat' ? 'Kitty' : 'Puppy'}</span>
                            <div className="flex items-center gap-1 w-full">
                                <input 
                                    type="text" 
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="w-full text-xs font-bold text-center bg-slate-100 dark:bg-black/40 rounded-lg py-1 px-2 focus:outline-none text-slate-800 dark:text-white border border-transparent focus:border-pink-500"
                                    autoFocus
                                    placeholder={petType === 'cat' ? "Name your kitty..." : "Name your puppy..."}
                                    onBlur={handleSaveName}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                />
                                <button onClick={handleSaveName} className="p-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"><Check size={12} /></button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => { setTempName(petName); setIsEditingName(true); }}
                            className="flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 rounded-full border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        >
                            {petName}
                            <Edit2 size={10} className="opacity-0 group-hover/name:opacity-100 transition-opacity" />
                        </button>
                    )}
                </div>

                <PetAvatar type={petType} stage={petStage} status={status} onPet={handlePetClick} hasHalo={focusIntegrity > 90} />
                
                <div className="text-center -mt-2 relative z-20 pointer-events-none">
                    <h4 className="text-sm font-black text-slate-800 dark:text-white transition-colors duration-300 tracking-tight bg-white/50 dark:bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm border border-white/20">
                        {message}
                    </h4>
                </div>
            </div>

            {/* Focus Energy Bar */}
            <div className="mt-4 relative z-10">
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <span className="flex items-center gap-1"><Zap size={10} className="text-amber-400 fill-current" /> Energy</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-white/5 shadow-inner">
                    <div 
                        className={`h-full bg-gradient-to-r shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all duration-1000 ease-linear ${petType === 'cat' ? 'from-pink-400 to-fuchsia-500' : 'from-amber-400 to-orange-500'}`}
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_1.5s_infinite]"></div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Info Modal */}
        {showInfo && <PetInfoModal onClose={() => setShowInfo(false)} />}
        </>
    );
};

// --- SOUNDSCAPE CONTROL UI ---
const SoundscapeControl = () => {
    const { isBrownNoiseOn, toggleBrownNoise, soundscape, setSoundscape } = usePomodoro();
    const [isOpen, setIsOpen] = useState(false);

    // Restricted options as requested: Brown and White only.
    const options: { id: SoundscapeType, label: string, icon: any }[] = [
        { id: 'brown', label: 'Brown Noise', icon: Waves },
        { id: 'white', label: 'White Noise', icon: Cloud },
    ];

    const current = options.find(o => o.id === soundscape) || options[0];

    return (
        <div className="relative h-full">
            <button 
                onClick={toggleBrownNoise} 
                className={`w-full h-full py-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${isBrownNoiseOn ? 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'bg-white dark:bg-[#0B1221] border-slate-200 dark:border-slate-800 text-slate-500 hover:border-indigo-300'}`}
            >
                <div className="flex items-center gap-2">
                    <current.icon size={16} className={isBrownNoiseOn ? 'animate-pulse' : ''} />
                    <span className="text-[9px] font-bold uppercase">{isBrownNoiseOn ? 'On' : 'Off'}</span>
                </div>
            </button>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="absolute right-1 top-1 bottom-1 w-6 flex items-center justify-center hover:bg-black/5 rounded dark:hover:bg-white/5 text-slate-400"
            >
                <Settings size={10} />
            </button>

            {/* CHANGED: top-full mt-2 to drop DOWNWARDS as requested */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1 animate-in slide-in-from-top-2">
                        {options.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => { setSoundscape(opt.id); setIsOpen(false); }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${soundscape === opt.id ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                            >
                                <opt.icon size={14} />
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const Pomodoro: React.FC = () => {
  const { 
    mode, timeLeft, isActive, activePreset, timerSettings, sessionGoal, sessionsCompleted, focusTask,
    toggleTimer, resetTimer, stopSessionEarly, setPreset, setSessionGoal, setFocusTask, skipForward, togglePiP, setCustomSettings
  } = usePomodoro();

  const { tasks } = useTasks();
  
  // Local state
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // New: Early Exit Modal State
  const [showEarlyExitModal, setShowEarlyExitModal] = useState(false);
  
  // Custom Timer Form State
  const [customForm, setCustomForm] = useState<TimerSettings>({ focus: 25 * 60, shortBreak: 5 * 60, longBreak: 20 * 60 });

  useEffect(() => {
      if (isCustomModalOpen && activePreset === 'custom') {
          setCustomForm(timerSettings);
      }
  }, [isCustomModalOpen, activePreset, timerSettings]);

  // --- AUTOMATIC TASK SYNC ---
  useEffect(() => {
      if (!isActive && !focusTask && tasks.length > 0) {
          const now = new Date();
          const activeTask = tasks.find(t => {
              const start = new Date(t.start);
              const end = new Date(t.end);
              return !t.completed && isWithinInterval(now, { start, end });
          });
          if (activeTask) setFocusTask(activeTask.title);
      }
  }, [isActive, focusTask, tasks, setFocusTask]);

  // --- HANDLERS ---
  
  const handleStopClick = () => {
      const maxTime = mode === 'focus' ? timerSettings.focus : (mode === 'shortBreak' ? timerSettings.shortBreak : timerSettings.longBreak);
      if (timeLeft < maxTime && timeLeft > 0) {
          setShowEarlyExitModal(true);
      } else {
          resetTimer();
      }
  };

  const handleEarlyExit = async (action: 'save' | 'discard' | 'resume') => {
      setShowEarlyExitModal(false);
      if (action === 'resume') return;
      
      if (action === 'save') {
          await stopSessionEarly(true);
      } else {
          await stopSessionEarly(false);
      }
  };

  // --- SVG MATH ---
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const totalTime = mode === 'focus' ? timerSettings.focus : (mode === 'shortBreak' ? timerSettings.shortBreak : timerSettings.longBreak);
  const progress = timeLeft / totalTime;
  const strokeDashoffset = circumference - (progress * circumference);
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isFocus = mode === 'focus';
  const themeColor = isFocus ? 'text-pink-600 dark:text-pink-500' : 'text-cyan-600 dark:text-cyan-500';
  const strokeColor = isFocus ? '#ec4899' : '#06b6d4'; 
  const bgTransition = isFocus ? 'bg-pink-500' : 'bg-cyan-600';

  const incompleteTasks = tasks.filter(t => !t.completed).slice(0, 50);

  const handleInputChange = (field: keyof TimerSettings, value: string) => {
      // Limit length to 3 digits to prevent overflow
      if (value.length > 3) return;

      const parsed = parseInt(value);
      if (!isNaN(parsed) && parsed >= 0) {
          setCustomForm(prev => ({...prev, [field]: parsed * 60}));
      } else if (value === '') {
          setCustomForm(prev => ({...prev, [field]: 0}));
      }
  };

  const handleCustomSave = (e: React.FormEvent) => {
      e.preventDefault();
      setCustomSettings(customForm);
      setPreset('custom');
      setIsCustomModalOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-100px)] w-full flex flex-col relative overflow-hidden font-sans transition-colors duration-1000">
      
      {/* Background Ambience */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-10 dark:opacity-20 pointer-events-none transition-colors duration-1000 ${bgTransition}`}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-7xl mx-auto p-4 md:p-6 z-10 flex-1 h-full items-stretch">
        
        {/* LEFT: STATS (Refined Width) */}
        <div className="lg:col-span-3 flex flex-col h-full order-2 lg:order-1 min-h-[400px]">
            <PomodoroStats />
        </div>

        {/* CENTER: THE RING */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2 py-8 lg:py-0 relative">
            
            {/* OVERLAY for Transition (Centered Window) */}
            <NotificationWindow />

            <div className="relative group cursor-pointer" onClick={toggleTimer}>
                {/* Outer Glow Ring */}
                <div className={`absolute inset-0 rounded-full border-[1px] opacity-10 transform scale-110 pointer-events-none ${isFocus ? 'border-pink-500' : 'border-cyan-500'}`}></div>
                {/* Pulse Ring */}
                <div className={`absolute inset-0 rounded-full border-4 opacity-20 pointer-events-none transition-colors duration-500 ${isActive ? 'animate-ping' : ''} ${isFocus ? 'border-pink-500' : 'border-cyan-500'}`}></div>

                <svg width="340" height="340" className="transform -rotate-90 drop-shadow-2xl">
                    <circle cx="170" cy="170" r="140" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                    <circle 
                        cx="170" cy="170" r="140" 
                        stroke={strokeColor} 
                        strokeWidth="16" 
                        fill="transparent" 
                        strokeLinecap="round" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset} 
                        className={`transition-all duration-300 ease-linear ${isActive ? isFocus ? 'drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]' : 'drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]' : ''}`}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <span className={`text-7xl md:text-8xl font-mono font-black tracking-tighter tabular-nums drop-shadow-lg text-slate-800 dark:text-white`}>
                        {formatTime(timeLeft)}
                    </span>
                    <span className={`mt-4 text-xs font-black uppercase tracking-[0.4em] ${themeColor}`}>
                        {isActive ? 'RUNNING' : 'PAUSED'}
                    </span>
                </div>
            </div>

            {/* Main Action Buttons */}
            <div className="mt-12 flex items-center gap-6">
                <button 
                    onClick={handleStopClick} 
                    className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all active:scale-95 shadow-sm"
                    title="Stop Session"
                >
                    <RotateCcw size={24} />
                </button>
                
                <button 
                    onClick={toggleTimer} 
                    className={`w-24 h-24 rounded-[3rem] flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 ${
                        isActive 
                        ? 'bg-white text-slate-900 border-4 border-slate-100' 
                        : `${isFocus ? 'bg-pink-600 shadow-pink-500/40' : 'bg-cyan-600 shadow-cyan-500/40'} text-white`
                    }`}
                >
                    {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                </button>

                <button 
                    onClick={skipForward} 
                    className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
                    title="Skip"
                >
                    <SkipForward size={24} />
                </button>
            </div>
        </div>

        {/* RIGHT: MISSION CONTROL (Compact Layout) */}
        <div className="lg:col-span-3 flex flex-col gap-3 order-3 h-full">
             
             {/* 1. Presets (Compact) */}
             <div className="bg-white/80 dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm backdrop-blur-md">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Layers size={10} /> Presets</h3>
                    <button onClick={() => setIsCustomModalOpen(true)} className="text-pink-500 hover:text-pink-600"><Settings size={12} /></button>
                </div>
                <div className="grid grid-cols-4 gap-1">
                    {(['micro', 'classic', 'long', 'custom'] as PresetName[]).map((p) => (
                        <button 
                            key={p}
                            onClick={() => {
                                if (p === 'custom' && activePreset === 'custom') setIsCustomModalOpen(true);
                                else setPreset(p);
                            }}
                            className={`py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wide transition-all border ${
                                activePreset === p 
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-sm' 
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            {p === 'micro' ? '15/5' : p === 'classic' ? '25/5' : p === 'long' ? '50/10' : 'Cust'}
                        </button>
                    ))}
                </div>
             </div>

             {/* 2. Session Control (Merged Target & Goal) */}
             <div className="bg-white/80 dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur-md relative z-50 flex flex-col gap-4">
                 
                 {/* Top: Goal Slider */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Target size={12} /> Session Goal
                        </h3>
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                             <span className="text-[10px] font-bold text-pink-500">{sessionsCompleted}</span>
                             <span className="text-[8px] text-slate-400">/</span>
                             <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{sessionGoal}</span>
                        </div>
                    </div>
                    <input 
                        type="range" min="1" max="12" step="1"
                        value={sessionGoal}
                        onChange={(e) => setSessionGoal(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                 </div>

                 {/* Bottom: Task Input */}
                 <div className="relative">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-2">
                        <Brain size={12} /> Focus Target
                    </h3>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors">
                            <Brain size={14} />
                        </div>
                        <input 
                            type="text" 
                            value={focusTask}
                            onChange={(e) => setFocusTask(e.target.value)}
                            onFocus={() => setShowTaskDropdown(true)}
                            onBlur={() => setTimeout(() => setShowTaskDropdown(false), 200)}
                            placeholder="What are you working on?"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                        />
                        {/* Dropdown */}
                        {showTaskDropdown && incompleteTasks.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[100] max-h-48 overflow-y-auto custom-scrollbar p-1 animate-in slide-in-from-top-2 fade-in">
                                {incompleteTasks.map(t => (
                                    <button key={t.id} onClick={() => setFocusTask(t.title)} className="w-full text-left px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-pink-900/20 truncate rounded-lg transition-colors mb-0.5 last:mb-0 flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${t.priority === 'High' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                                        {t.title}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                 </div>

             </div>

             {/* 3. Media Controls (Compact & Aligned) */}
             <div className="grid grid-cols-3 gap-2 h-14 relative z-10">
                <SoundscapeControl />
                <button onClick={togglePiP} className="h-full py-2 rounded-xl bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-pink-500 hover:border-pink-500/50 flex flex-col items-center justify-center gap-1 transition-all shadow-sm">
                    <MonitorPlay size={16} />
                    <span className="text-[9px] font-bold uppercase">Mini</span>
                </button>
                <button onClick={() => setIsFullScreen(true)} className="h-full py-2 rounded-xl bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-pink-500 hover:border-pink-500/50 flex flex-col items-center justify-center gap-1 transition-all shadow-sm">
                    <Maximize2 size={16} />
                    <span className="text-[9px] font-bold uppercase">Zen</span>
                </button>
             </div>

             {/* 4. FOCUS COMPANION PET (Fills space) */}
             <FocusPetWidget />

             {/* 5. Video Anchor (Cleaned up, no text) */}
             <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 relative group shrink-0">
                 {/* Only show label if empty */}
                 <div className="absolute top-2 left-2 z-20 bg-black/60 px-2 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="flex items-center gap-1 text-[9px] font-bold text-white uppercase"><Music size={10} /> Focus Cam</div>
                 </div>
                 
                 {/* The Anchor itself - now empty of text to prevent overlap */}
                 <div id="video-anchor" className="w-full h-full bg-slate-900 relative">
                     {/* Placeholder icon if needed, but portal will cover */}
                 </div>
             </div>
        </div>
      </div>

      {/* --- EARLY EXIT MODAL --- */}
      {showEarlyExitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setShowEarlyExitModal(false)}>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-white/20 relative animate-zoom-in" onClick={e => e.stopPropagation()}>
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 text-yellow-600 dark:text-yellow-400">
                          <AlertTriangle size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">End Session Early?</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">
                          Quitting now will reduce your <span className="text-pink-500 font-bold">Focus Integrity</span>. Are you sure?
                      </p>
                      
                      <div className="flex flex-col gap-3 w-full">
                          <button 
                              onClick={() => handleEarlyExit('save')}
                              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                          >
                              <Save size={18} /> Complete & Save (Safe)
                          </button>
                          <button 
                              onClick={() => handleEarlyExit('discard')}
                              className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-500 rounded-xl font-bold flex items-center justify-center gap-2"
                          >
                              <X size={18} /> Discard & Lose Integrity
                          </button>
                          <button 
                              onClick={() => handleEarlyExit('resume')}
                              className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 hover:text-slate-600 dark:hover:text-white"
                          >
                              Resume Timer
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- CUSTOM TIMER MODAL --- */}
      {isCustomModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-white/20 relative">
                  <button onClick={() => setIsCustomModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Settings className="text-pink-500" /> Configure Timer</h3>
                  <form onSubmit={handleCustomSave} className="space-y-5">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Focus (Minutes)</label>
                          <input type="number" value={Math.floor(customForm.focus / 60) || ''} onChange={(e) => handleInputChange('focus', e.target.value)} className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-lg font-bold text-slate-800 dark:text-white" min="1" max="180" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Short Break</label>
                              <input type="number" value={Math.floor(customForm.shortBreak / 60) || ''} onChange={(e) => handleInputChange('shortBreak', e.target.value)} className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-lg font-bold text-slate-800 dark:text-white" min="1" max="60" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase">Long Break</label>
                              <input type="number" value={Math.floor(customForm.longBreak / 60) || ''} onChange={(e) => handleInputChange('longBreak', e.target.value)} className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-lg font-bold text-slate-800 dark:text-white" min="1" max="120" />
                          </div>
                      </div>
                      <button type="submit" className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg mt-4"><Save size={18} className="inline mr-2" /> Save & Apply</button>
                  </form>
              </div>
          </div>
      )}

      {/* --- FULLSCREEN ZEN MODE --- */}
      {isFullScreen && <PomodoroFullScreen onClose={() => setIsFullScreen(false)} />}
    </div>
  );
};

export default Pomodoro;
