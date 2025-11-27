import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

const Pomodoro: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState(25);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isMuted, setIsMuted] = useState(false);

  const modes: { id: TimerMode; label: string; minutes: number }[] = [
    { id: 'pomodoro', label: 'Pomodoro', minutes: 25 },
    { id: 'shortBreak', label: 'Short Break', minutes: 5 },
    { id: 'longBreak', label: 'Long Break', minutes: 15 },
    { id: 'custom', label: 'Custom', minutes: customTime },
  ];

  // Circle animation config
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (timeLeft / initialTime) * circumference;

  const playSound = (type: 'start' | 'break' | 'end') => {
    if (isMuted) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'end') {
        // Alarm sound
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.setValueAtTime(880, now + 0.1);
        oscillator.frequency.setValueAtTime(440, now + 0.2);
        oscillator.frequency.setValueAtTime(880, now + 0.3);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        oscillator.start(now);
        oscillator.stop(now + 0.6);
      } else if (type === 'start') {
        // High pitch "Work" start
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.linearRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
      } else if (type === 'break') {
        // Softer "Break" start
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.linearRampToValueAtTime(300, now + 0.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
      }
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playSound('end');
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    const selectedMode = modes.find((m) => m.id === newMode);
    if (selectedMode) {
      if (newMode === 'custom') {
         setInitialTime(customTime * 60);
         setTimeLeft(customTime * 60);
      } else {
         setInitialTime(selectedMode.minutes * 60);
         setTimeLeft(selectedMode.minutes * 60);
      }
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0 && val <= 180) {
      setCustomTime(val);
      if (mode === 'custom') {
        setIsActive(false);
        setInitialTime(val * 60);
        setTimeLeft(val * 60);
      }
    }
  };

  const toggleTimer = () => {
    if (!isActive && timeLeft > 0) {
      // Starting
      if (mode === 'pomodoro' || mode === 'custom') {
        playSound('start');
      } else {
        playSound('break');
      }
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    const currentMode = modes.find((m) => m.id === mode);
    if (currentMode) {
       setTimeLeft(currentMode.id === 'custom' ? customTime * 60 : currentMode.minutes * 60);
       setInitialTime(currentMode.id === 'custom' ? customTime * 60 : currentMode.minutes * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-8">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg border border-slate-100 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 to-navy-800"></div>
        
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Pomodoro Timer</h2>
            <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 gap-2 flex-wrap">
          {modes.filter(m => m.id !== 'custom').map((m) => (
            <button
              key={m.id}
              onClick={() => switchMode(m.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === m.id
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
          <button
              onClick={() => switchMode('custom')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === 'custom'
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Custom
          </button>
        </div>

        {mode === 'custom' && (
           <div className="flex justify-center items-center gap-2 mb-6">
             <label className="text-sm text-slate-600">Minutes:</label>
             <input 
               type="number" 
               min="1" 
               max="180" 
               value={customTime} 
               onChange={handleCustomChange}
               className="w-20 p-2 border border-slate-300 rounded-lg text-center"
             />
           </div>
        )}

        {/* Timer Display */}
        <div className="relative w-72 h-72 mx-auto mb-10">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className="fill-none stroke-slate-100"
              strokeWidth="12"
            />
            {/* Progress Ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className="fill-none stroke-pink-accent transition-all duration-500 ease-in-out"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-6xl font-bold text-navy-900 font-mono tracking-tight">
              {formatTime(timeLeft)}
            </span>
            <span className="text-slate-400 font-medium uppercase tracking-widest text-sm mt-2">
              {isActive ? 'Focusing' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={resetTimer}
            className="p-4 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            title="Reset"
          >
            <RotateCcw size={24} />
          </button>

          <button
            onClick={toggleTimer}
            className={`p-6 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95 ${
              isActive ? 'bg-slate-200 text-slate-700' : 'bg-pink-accent text-white hover:bg-pink-500'
            }`}
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
        </div>

        {/* YouTube Embed */}
        <div className="w-full">
          <iframe 
            width="100%" 
            height="200" 
            src="https://www.youtube.com/embed/BMuknRb7woc?playlist=vCTRNKPJr40" 
            title="Lofi Girl Study Playlist" 
            frameBorder="0" 
            style={{ borderRadius: '12px' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
