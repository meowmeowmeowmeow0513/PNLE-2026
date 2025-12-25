
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext'; // Added Theme Hook
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ArrowRight, Trophy, ShieldCheck, Sparkles, User, Loader2, CheckCircle, Heart, Scroll, Fingerprint, ScanFace, Cat, Dog, Palette, Clock, Calculator, Crown, Zap, Target, Flame, Globe, Baby, Activity, Brain, PenTool, Quote } from 'lucide-react';
import { sendDiscordNotification } from '../utils/discordWebhook';
import { differenceInDays } from 'date-fns'; // Added date logic

// --- CUSTOM ANIMATION STYLES (Ported from Pomodoro) ---
const petStyles = `
  @keyframes float-breath { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-4px) scale(1.02); } }
  @keyframes blink-soft { 0%, 45%, 55%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.1); } }
  @keyframes ear-wiggle { 0%, 100% { transform: rotate(0); } 10% { transform: rotate(5deg); } 20% { transform: rotate(0); } }
  @keyframes tail-sway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
  
  .pet-breathe { animation: float-breath 4s ease-in-out infinite; transform-origin: bottom center; }
  .pet-blink { animation: blink-soft 4s infinite; transform-origin: center; transform-box: fill-box; }
  .pet-ear-L { animation: ear-wiggle 5s infinite 1s; transform-origin: bottom right; transform-box: fill-box; }
  .pet-ear-R { animation: ear-wiggle 5s infinite 2s; transform-origin: bottom left; transform-box: fill-box; }
  .pet-tail { animation: tail-sway 3s ease-in-out infinite; transform-origin: bottom left; }
`;

const OnboardingFlow: React.FC = () => {
  const { currentUser, reloadUser, completeOnboarding, updateUserProfile } = useAuth();
  const { accentColor, setAccentColor } = useTheme(); // Use Theme Context
  const [step, setStep] = useState(1);
  const [name, setName] = useState(currentUser?.displayName || '');
  const [mantra, setMantra] = useState('Soar High, Future RN!');
  
  // Companion State
  const [petType, setPetType] = useState<'cat' | 'dog' | null>(null);
  const [petName, setPetName] = useState('');
  const MAX_PET_NAME_LENGTH = 12;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Exit Animation State
  const [isExiting, setIsExiting] = useState(false);

  // Bio-Lock State (Step 5)
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef<number | null>(null);
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const totalSteps = 6;

  // QoL: Calculate Days Remaining
  const daysRemaining = differenceInDays(new Date('2026-08-29'), new Date());

  // --- AUDIO & HAPTICS ENGINE ---
  const initAudio = () => {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
      }
  };

  const startBioFeedback = () => {
      initAudio();
      if (!audioCtxRef.current) return;

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, audioCtxRef.current.currentTime); // Deep hum start
      
      gain.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime); // Low volume start
      
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      
      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
  };

  const updateBioFeedback = (progress: number) => {
      // Audio Modulate
      if (audioCtxRef.current && oscRef.current && gainRef.current) {
          const now = audioCtxRef.current.currentTime;
          // Pitch rises: 60Hz -> 180Hz (Tension)
          const newFreq = 60 + (progress * 1.5); 
          oscRef.current.frequency.setTargetAtTime(newFreq, now, 0.1);
          
          // Volume rises: 0.05 -> 0.3
          const newVol = 0.05 + (progress / 300);
          gainRef.current.gain.setTargetAtTime(newVol, now, 0.1);
      }

      // Haptics
      if (navigator.vibrate && progress % 10 < 2) { // Vibrate every ~10% roughly based on interval tick
          navigator.vibrate(15); 
      }
  };

  const stopBioFeedback = () => {
      if (oscRef.current && audioCtxRef.current) {
          if (gainRef.current) {
               // Quick fade out to avoid pop
               gainRef.current.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.1);
          }
          oscRef.current.stop(audioCtxRef.current.currentTime + 0.1);
          oscRef.current = null;
          gainRef.current = null;
      }
  };

  // --- BIO-LOCK HANDLERS ---
  const startHold = () => {
      if (holdProgress >= 100) return;
      setIsHolding(true);
      startBioFeedback();

      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = window.setInterval(() => {
          setHoldProgress(prev => {
              if (prev >= 100) {
                  if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
                  stopBioFeedback();
                  if (navigator.vibrate) navigator.vibrate([50, 50, 50]); // Success pattern
                  return 100;
              }
              const next = prev + 1.2; // Approx 1.3s to fill
              updateBioFeedback(next);
              return next;
          });
      }, 16);
  };

  const stopHold = () => {
      if (holdProgress >= 100) return; 
      setIsHolding(false);
      stopBioFeedback();

      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      // Fast decay
      holdIntervalRef.current = window.setInterval(() => {
          setHoldProgress(prev => {
              if (prev <= 0) {
                  if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
                  return 0;
              }
              return prev - 5; 
          });
      }, 16);
  };

  // Trigger Next on Bio-Lock Complete
  useEffect(() => {
      let timer: number;
      if (holdProgress >= 100) {
          timer = window.setTimeout(() => {
              handleNext();
              // Reset for cleanup
              setHoldProgress(0);
              setIsHolding(false);
          }, 300);
      }
      return () => {
          if (timer) clearTimeout(timer);
      };
  }, [holdProgress]);

  // Clean up audio on unmount
  useEffect(() => {
      return () => {
          if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
          stopBioFeedback();
          if (audioCtxRef.current) audioCtxRef.current.close();
      };
  }, []);

  const handleNext = () => {
    setError('');
    if (step === 2 && !name.trim()) {
      setError("Please enter your name/nickname.");
      return;
    }
    if (step === 3 && !mantra.trim()) {
      setError("Please define your mantra.");
      return;
    }
    if (step === 4 && !petType) {
      setError("Please choose a companion.");
      return;
    }
    
    // Prevent skipping past last step
    setStep(prev => {
        const next = prev + 1;
        return next > totalSteps ? totalSteps : next;
    });
    
    // Scroll to top on step change for mobile
    window.scrollTo(0, 0);
  };

  const handleFinish = async () => {
    if (!currentUser || loading) return;
    setLoading(true);
    
    try {
      await updateUserProfile(name, currentUser.photoURL);

      const finalPetName = petName.trim() || (petType === 'cat' ? 'Mochi' : 'Buddy');

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        mantra: mantra,
        petType: petType,
        catName: petType === 'cat' ? finalPetName : 'Mochi',
        dogName: petType === 'dog' ? finalPetName : 'Buddy',
        hasCompletedOnboarding: true,
        onboardingCompletedAt: new Date().toISOString(),
        accentColor: accentColor // Save the chosen Aura
      });

      // Send Discord Notification
      sendDiscordNotification(
        "New Recruit Joined",
        `**${name}** has initialized their system.\nMantra: "${mantra}"\nCompanion: ${finalPetName} (${petType})`,
        'stats',
        'success'
      );

      setIsExiting(true);
      
      setTimeout(async () => {
          await completeOnboarding(); 
          await reloadUser();
      }, 800);
      
    } catch (err) {
      console.error("Onboarding Error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
      setIsExiting(false);
    }
  };

  // --- RENDER HELPERS ---

  const renderStep1_Welcome = () => (
    <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700 w-full px-4">
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] mx-auto mb-6 md:mb-8 shadow-[0_0_50px_-10px_currentColor] flex items-center justify-center transform rotate-3 ring-4 ring-white/10" style={{ backgroundColor: accentColor, color: accentColor }}>
        <span className="text-3xl md:text-4xl font-bold text-white">RN</span>
      </div>
      <h1 className="text-3xl md:text-6xl font-black text-white mb-4 md:mb-6 tracking-tight leading-tight">
        Welcome to your <br/> <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, white, ${accentColor})` }}>Sanctuary.</span>
      </h1>
      <p className="text-slate-400 text-base md:text-lg mb-8 md:mb-12 max-w-md mx-auto leading-relaxed">
        This isn't just an app. It's your companion for the most important battle of your career.
      </p>
      <button 
        onClick={handleNext}
        className="px-10 py-4 md:px-12 md:py-5 bg-white text-slate-900 rounded-full font-bold text-base md:text-lg hover:bg-slate-200 transition-all flex items-center gap-2 mx-auto shadow-2xl hover:scale-105 active:scale-95 group"
      >
        Initialize System <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );

  const renderStep2_Identity = () => {
    // Generate initials for preview
    const initials = name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const colors = [
        '#ec4899', // Pink (Default)
        '#8b5cf6', // Violet
        '#3b82f6', // Blue
        '#10b981', // Emerald
        '#f59e0b', // Amber
    ];

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-right-8 duration-500 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">Identity & Aura</h2>
        <p className="text-slate-400 text-center mb-8 md:mb-10 text-sm md:text-base">Calibrate your system interface.</p>
        
        {/* Avatar Preview */}
        <div className="flex justify-center mb-8">
            <div className="relative group">
                <div className="absolute -inset-0.5 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500" style={{ backgroundColor: accentColor }}></div>
                <div className="relative w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-900 overflow-hidden">
                    {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-black tracking-widest" style={{ color: accentColor }}>
                            {initials || <User size={32} className="text-slate-600" />}
                        </span>
                    )}
                </div>
                {/* ID Badge Decoration */}
                <div className="absolute -bottom-2 -right-2 bg-white text-slate-900 p-1.5 rounded-full shadow-lg border-2 border-slate-900">
                    <ScanFace size={14} />
                </div>
            </div>
        </div>

        <div className="relative group mb-6">
            <div className="absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" style={{ backgroundColor: accentColor }}></div>
            <div className="relative bg-slate-900 ring-1 ring-white/10 rounded-2xl p-2 flex items-center">
                <div className="p-3 text-slate-500">
                    <User size={24} />
                </div>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter Name or Callsign"
                    className="w-full bg-transparent border-none text-white text-lg md:text-xl placeholder:text-slate-600 focus:ring-0 focus:outline-none py-3 font-medium"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                />
            </div>
        </div>

        {/* QoL: Aura Selection */}
        <div className="flex justify-center gap-4 mb-4">
            {colors.map((c) => (
                <button
                    key={c}
                    onClick={() => setAccentColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 border-2 ${accentColor === c ? 'border-white scale-110 shadow-[0_0_15px_currentColor]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    style={{ backgroundColor: c, color: c }}
                />
            ))}
        </div>
        <p className="text-center text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center justify-center gap-2">
            <Palette size={12} /> Select Interface Color
        </p>
        
        {error && <p className="text-red-500 text-sm mt-3 text-center font-bold">{error}</p>}

        <button 
            onClick={handleNext}
            disabled={!name.trim()}
            className="w-full py-4 text-white rounded-xl font-bold transition-all shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: accentColor, boxShadow: `0 10px 30px -10px ${accentColor}66` }}
        >
            Confirm Identity
        </button>
        </div>
    );
  };

  const renderStep3_Mantra = () => {
    const inspirations = [
        "Soar High, Future RN!",
        "Padayon, Ramonian.",
        "Trust the Process.",
        "Manifesting 2026.",
        "Grit & Grace."
    ];

    return (
        <div className="w-full max-w-lg mx-auto animate-in fade-in slide-in-from-right-8 duration-500 px-4 py-4">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Forge Your Mantra</h2>
                <p className="text-slate-400 text-sm md:text-base">A phrase to anchor you when the days get hard. <br/> This will be displayed on your personal folder.</p>
            </div>

            {/* Preview Card */}
            <div className="mb-8 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl opacity-50 blur-sm"></div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Quote size={48} className="text-white" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Preview</p>
                    <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400 tracking-tighter leading-tight drop-shadow-sm break-words">
                        {mantra || "Your Mantra Here"}
                    </h1>
                </div>
            </div>

            {/* Input */}
            <div className="relative group mb-6">
                <div className="absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" style={{ backgroundColor: accentColor }}></div>
                <div className="relative bg-slate-900 ring-1 ring-white/10 rounded-2xl p-2 flex items-center">
                    <div className="p-3 text-slate-500">
                        <PenTool size={24} />
                    </div>
                    <input 
                        type="text" 
                        value={mantra}
                        onChange={(e) => setMantra(e.target.value)}
                        placeholder="Type your affirmation..."
                        className="w-full bg-transparent border-none text-white text-lg placeholder:text-slate-600 focus:ring-0 focus:outline-none py-3 font-medium"
                        maxLength={40}
                    />
                    <span className="text-[10px] font-mono text-slate-600 px-3">{mantra.length}/40</span>
                </div>
            </div>

            {/* Inspirations */}
            <div className="mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Inspirations</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {inspirations.map((text) => (
                        <button
                            key={text}
                            onClick={() => setMantra(text)}
                            className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-700 hover:text-white transition-all active:scale-95"
                        >
                            {text}
                        </button>
                    ))}
                </div>
            </div>

            {error && <p className="text-red-500 text-sm font-bold mt-6 text-center">{error}</p>}

            <button 
                onClick={handleNext}
                disabled={!mantra.trim()}
                className="w-full py-4 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                style={{ backgroundColor: accentColor }}
            >
                Confirm Mantra
            </button>
        </div>
    );
  };

  const renderPetPreview = (type: 'cat' | 'dog', isSelected: boolean) => {
      const palette = type === 'cat' 
        ? { from: '#f0abfc', to: '#c026d3', stroke: '#a21caf', accent: '#fdf4ff' }
        : { from: '#fcd34d', to: '#d97706', stroke: '#b45309', accent: '#fffbeb' };
      
      const gradId = `${type}-preview-${isSelected ? 'on' : 'off'}`;
      const isCat = type === 'cat';

      return (
        <svg viewBox="0 0 200 200" className={`w-28 h-28 drop-shadow-xl transition-all duration-500 ${isSelected ? 'scale-110 pet-breathe' : 'scale-90 opacity-70 grayscale-[0.3]'}`}>
            <defs>
                <linearGradient id={`${gradId}-body`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={palette.from} /> 
                    <stop offset="100%" stopColor={palette.to} /> 
                </linearGradient>
                <linearGradient id={`${gradId}-belly`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={palette.accent} /> 
                    <stop offset="100%" stopColor={palette.accent} stopOpacity="0.8" /> 
                </linearGradient>
                <filter id={`${gradId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Tail */}
            <path 
                d={isCat ? "M160 150 Q 190 120 180 100 Q 170 80 150 120" : "M150 140 Q 170 110 180 130"} 
                fill="none" 
                stroke={palette.to} 
                strokeWidth={isCat ? "8" : "6"} 
                strokeLinecap="round" 
                className={isSelected ? "pet-tail" : ""} 
            />

            {/* Body Group */}
            <g transform={isCat ? "translate(100, 130)" : "translate(100, 135)"}>
                {isCat ? (
                    <>
                        <ellipse cx="0" cy="0" rx={50} ry={35} fill={`url(#${gradId}-body)`} filter={`url(#${gradId}-glow)`} />
                        <ellipse cx="0" cy="15" rx={30} ry={20} fill={`url(#${gradId}-belly)`} opacity="0.6" />
                    </>
                ) : (
                    <>
                        <rect x="-45" y="-35" width="90" height="70" rx="40" fill={`url(#${gradId}-body)`} filter={`url(#${gradId}-glow)`} />
                        <ellipse cx="0" cy="10" rx="25" ry="18" fill={`url(#${gradId}-belly)`} opacity="0.5" />
                    </>
                )}
            </g>

            {/* Head Group */}
            <g transform={isCat ? "translate(100, 105)" : "translate(100, 100)"}>
                {isCat ? (
                    // Cat Head
                    <>
                        <path d="M-45 -20 L-55 -65 L-15 -35 Z" fill={`url(#${gradId}-body)`} stroke={palette.stroke} strokeWidth="4" strokeLinejoin="round" className={isSelected ? "pet-ear-L" : ""} />
                        <path d="M45 -20 L55 -65 L15 -35 Z" fill={`url(#${gradId}-body)`} stroke={palette.stroke} strokeWidth="4" strokeLinejoin="round" className={isSelected ? "pet-ear-R" : ""} />
                        <ellipse cx="0" cy="0" rx={45} ry={35} fill={`url(#${gradId}-body)`} filter={`url(#${gradId}-glow)`} />
                    </>
                ) : (
                    // Dog Head
                    <>
                        <path d="M-40 -35 L-50 -10 L-25 -5 Z" fill={palette.stroke} stroke={palette.stroke} strokeWidth="3" strokeLinejoin="round" className={isSelected ? "pet-ear-L" : ""} />
                        <path d="M40 -35 L50 -10 L25 -5 Z" fill={palette.stroke} stroke={palette.stroke} strokeWidth="3" strokeLinejoin="round" className={isSelected ? "pet-ear-R" : ""} />
                        <rect x="-40" y="-35" width="80" height="70" rx="35" fill={`url(#${gradId}-body)`} filter={`url(#${gradId}-glow)`} />
                        <ellipse cx="0" cy="20" rx="25" ry="20" fill={`url(#${gradId}-snout)`} />
                    </>
                )}

                {/* Face Expression */}
                {!isSelected ? (
                    // Sleeping
                    <g fill="none" stroke={isCat ? palette.stroke : "#78350f"} strokeWidth="3" strokeLinecap="round" transform={isCat ? "translate(0, 5)" : "translate(0, -5)"}>
                        <path d="M-25 0 Q-15 8 -5 0" />
                        <path d="M5 0 Q15 8 25 0" />
                        {isCat && <path d="M-2 15 Q0 18 2 15" strokeWidth="2" />}
                        {!isCat && <circle cx="0" cy="15" r="5" fill="#451a03" stroke="none" />}
                    </g>
                ) : (
                    // Awake
                    <g transform={isCat ? "translate(0, 5)" : "translate(0, -5)"}>
                        <g fill={isCat ? palette.stroke : "#451a03"}>
                            <ellipse cx="-20" cy="-5" rx={isCat ? 8 : 9} ry={isCat ? 10 : 9} className="pet-blink" />
                            <ellipse cx="20" cy="-5" rx={isCat ? 8 : 9} ry={isCat ? 10 : 9} className="pet-blink" />
                            <circle cx="-18" cy="-8" r="2" fill="white" />
                            <circle cx="22" cy="-8" r="2" fill="white" />
                        </g>
                        {isCat ? (
                            <>
                                <circle cx="-35" cy="10" r="6" fill="#fbcfe8" opacity="0.6" />
                                <circle cx="35" cy="10" r="6" fill="#fbcfe8" opacity="0.6" />
                                <path d="M-5 12 Q0 16 5 12" fill="none" stroke={palette.stroke} strokeWidth="3" strokeLinecap="round" />
                            </>
                        ) : (
                            <>
                                <path d="M-8 15 Q0 10 8 15 Q0 25 -8 15" fill="#451a03" />
                                <path d="M-5 35 Q0 45 5 35" fill="#ef4444" />
                            </>
                        )}
                    </g>
                )}
            </g>
        </svg>
      );
  };

  const renderStep4_Companion = () => (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500 px-4 py-4">
        <style>{petStyles}</style>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">Choose Your Companion</h2>
        <p className="text-slate-400 text-center mb-8 text-sm md:text-base">Someone to watch over you during late night reviews.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* CAT OPTION */}
            <div 
                onClick={() => setPetType('cat')}
                className={`relative cursor-pointer rounded-3xl p-6 transition-all duration-300 group overflow-hidden border ${
                    petType === 'cat' 
                    ? 'bg-gradient-to-br from-pink-900/60 to-purple-900/60 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)] transform scale-[1.02]' 
                    : 'bg-slate-900/50 border-white/5 hover:border-pink-500/30'
                }`}
            >
                <div className="absolute top-0 right-0 p-4 opacity-50"><Cat size={24} className={petType === 'cat' ? 'text-pink-400' : 'text-slate-600'} /></div>
                
                <div className="h-32 flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-105">
                    {renderPetPreview('cat', petType === 'cat')}
                </div>
                
                <div className="text-center">
                    <h3 className={`font-bold text-lg ${petType === 'cat' ? 'text-pink-300' : 'text-slate-300'}`}>The Cat</h3>
                    <p className="text-xs text-slate-500 mt-1">Calm energy. Purrs when you focus.</p>
                </div>
            </div>

            {/* DOG OPTION */}
            <div 
                onClick={() => setPetType('dog')}
                className={`relative cursor-pointer rounded-3xl p-6 transition-all duration-300 group overflow-hidden border ${
                    petType === 'dog' 
                    ? 'bg-gradient-to-br from-amber-900/60 to-orange-900/60 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] transform scale-[1.02]' 
                    : 'bg-slate-900/50 border-white/5 hover:border-amber-500/30'
                }`}
            >
                <div className="absolute top-0 right-0 p-4 opacity-50"><Dog size={24} className={petType === 'dog' ? 'text-amber-400' : 'text-slate-600'} /></div>

                <div className="h-32 flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-105">
                    {renderPetPreview('dog', petType === 'dog')}
                </div>

                <div className="text-center">
                    <h3 className={`font-bold text-lg ${petType === 'dog' ? 'text-amber-300' : 'text-slate-300'}`}>The Dog</h3>
                    <p className="text-xs text-slate-500 mt-1">Loyal energy. Protects your streak.</p>
                </div>
            </div>
        </div>

        {/* Naming Section */}
        <div className={`transition-all duration-500 ${petType ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Give them a name</label>
            <div className="relative max-w-xs mx-auto group">
                <input 
                    type="text" 
                    value={petName}
                    maxLength={MAX_PET_NAME_LENGTH}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder={petType === 'cat' ? "e.g. Mochi" : "e.g. Buddy"}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500 transition-colors"
                    style={{ borderColor: petName ? accentColor : undefined }}
                />
                <div className={`text-[10px] text-right mt-1 font-bold transition-colors ${petName.length >= MAX_PET_NAME_LENGTH ? 'text-red-500' : 'text-slate-600 group-focus-within:text-slate-400'}`}>
                    {petName.length}/{MAX_PET_NAME_LENGTH}
                </div>
            </div>
        </div>

        {error && <p className="text-red-500 text-sm font-bold mt-6 text-center">{error}</p>}

        <button 
            onClick={handleNext}
            disabled={!petType}
            className="w-full mt-8 py-4 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg hover:scale-[1.02]"
            style={{ backgroundColor: accentColor }}
        >
            Adopt Companion
        </button>
    </div>
  );

  const renderStep5_Manifesto = () => (
      <div className="w-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 text-center px-4">
          <Scroll size={40} className="text-amber-400 mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8 uppercase tracking-widest">The Pledge</h2>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-8 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50"></div>
              <p className="text-base md:text-xl text-slate-200 font-serif italic leading-relaxed">
                  "I promise to show up for myself, even on the hard days. <br/>
                  I am not studying to pass a test. <br/>
                  I am studying to save lives."
              </p>
              <div className="mt-6 flex justify-center">
                  <Heart size={24} style={{ color: accentColor }} className="animate-pulse" fill="currentColor" />
              </div>
          </div>

          <div className="flex flex-col items-center justify-center mt-4 select-none">
                <div 
                    className="relative cursor-pointer group touch-none"
                    onMouseDown={startHold}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={startHold}
                    onTouchEnd={stopHold}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    {/* Ring SVG */}
                    <svg className="w-28 h-28 transform -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100">
                        <circle 
                            cx="50" cy="50" r="46" 
                            stroke="#1e293b" strokeWidth="6" fill="transparent" 
                        />
                        <circle 
                            cx="50" cy="50" r="46" 
                            stroke={holdProgress >= 100 ? '#22c55e' : accentColor} 
                            strokeWidth="6" fill="transparent" 
                            strokeDasharray={289}
                            strokeDashoffset={289 - (289 * holdProgress) / 100}
                            className="transition-all duration-75 ease-linear"
                            strokeLinecap="round"
                        />
                    </svg>
                    
                    {/* Icon */}
                    <div className={`absolute inset-0 flex items-center justify-center rounded-full transition-transform duration-200 ${isHolding ? 'scale-95' : 'scale-100'}`}>
                        <div className={`p-5 rounded-full transition-colors duration-300 ${holdProgress >= 100 ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-amber-500'}`}>
                            <Fingerprint size={40} className={`transition-opacity ${isHolding && holdProgress < 100 ? 'animate-pulse text-amber-500' : ''}`} />
                        </div>
                    </div>
                </div>
                
                <p className={`mt-6 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${isHolding ? 'text-amber-500' : 'text-slate-600'}`}>
                    {holdProgress >= 100 ? 'Biometrics Verified' : isHolding ? 'Scanning Biometrics...' : 'Hold to Commit'}
                </p>
          </div>
      </div>
  );

  const renderStep6_Completion = () => (
    <div className="text-center animate-in zoom-in duration-500 px-4">
      <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 md:mb-8">
         {loading ? (
             <div className="absolute inset-0 border-4 border-slate-800 border-t-pink-500 rounded-full animate-spin"></div>
         ) : (
            <div className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                 <CheckCircle size={56} className="text-white md:w-16 md:h-16" />
            </div>
         )}
      </div>

      <h2 className="text-2xl md:text-4xl font-black text-white mb-4 tracking-tight">
        {loading ? `Waking up ${petName || (petType === 'cat' ? 'Mochi' : 'Buddy')}...` : `Welcome Home, ${name}.`}
      </h2>
      <p className="text-slate-400 mb-8 max-w-sm mx-auto text-base md:text-lg">
        {loading ? "Initializing your dashboard." : "Your license awaits."}
      </p>

      {!loading && (
        <button 
            onClick={handleFinish}
            className="w-full md:w-auto px-10 py-4 md:px-12 md:py-5 bg-pink-600 hover:bg-pink-500 text-white rounded-full font-bold shadow-[0_0_40px_-5px_rgba(236,72,153,0.6)] transition-all hover:scale-105 text-base md:text-lg"
            style={{ backgroundColor: accentColor }}
        >
            Enter Dashboard
        </button>
      )}
    </div>
  );

  return (
    <div className={`fixed inset-0 z-[100] bg-[#020617] flex flex-col font-sans selection:bg-pink-500/30 transition-opacity duration-700 ease-in-out overflow-y-auto overflow-x-hidden custom-scrollbar ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="min-h-full flex flex-col relative">
        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[128px] animate-pulse" style={{ backgroundColor: `${accentColor}1A` }} />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[128px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        {/* Header / Progress */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 md:py-8 flex items-center justify-between shrink-0">
           <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div 
                      key={s} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                          s <= step ? 'w-4 md:w-6 shadow-lg' : 'w-2 bg-slate-800'
                      }`}
                      style={{ backgroundColor: s <= step ? accentColor : undefined }} 
                  />
              ))}
           </div>
           {step > 1 && step < 6 && (
               <button 
                  onClick={() => setStep(s => s - 1)}
                  className="text-slate-500 hover:text-white text-xs md:text-sm font-bold uppercase tracking-widest transition-colors px-2 py-1"
               >
                   Back
               </button>
           )}
        </div>

        {/* Main Content Card */}
        <main className="flex-1 flex flex-col items-center justify-center py-8 md:py-12 relative z-10">
           {step === 1 && renderStep1_Welcome()}
           {step === 2 && renderStep2_Identity()}
           {step === 3 && renderStep3_Mantra()}
           {step === 4 && renderStep4_Companion()}
           {step === 5 && renderStep5_Manifesto()}
           {step >= 6 && renderStep6_Completion()}
        </main>

        {/* Footer Decoration */}
        <footer className="relative z-10 py-6 md:py-8 text-center shrink-0">
            <p className="text-slate-600 text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 font-black">
                <Sparkles size={12} style={{ color: accentColor }} />
                Batch Crescere 2026
            </p>
        </footer>
      </div>
    </div>
  );
};

export default OnboardingFlow;
