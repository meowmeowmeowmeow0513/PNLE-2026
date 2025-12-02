
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

interface PomodoroContextType {
  mode: TimerMode;
  timeLeft: number;
  initialTime: number;
  isActive: boolean;
  customTime: number;
  isMuted: boolean;
  focusTask: string;
  isPlayingNoise: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  switchMode: (mode: TimerMode) => void;
  setCustomTimeValue: (minutes: number) => void;
  toggleMute: () => void;
  setFocusTask: (task: string) => void;
  toggleBrownNoise: () => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};

interface PomodoroProviderProps {
  children: ReactNode;
}

export const PomodoroProvider: React.FC<PomodoroProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState(25);
  const [isMuted, setIsMuted] = useState(false);
  const [focusTask, setFocusTask] = useState('');
  
  // Brown Noise State
  const [isPlayingNoise, setIsPlayingNoise] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Timer Refs
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const modes: Record<TimerMode, number> = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    custom: customTime,
  };

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
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.linearRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
      } else if (type === 'break') {
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

  const toggleBrownNoise = () => {
    if (isPlayingNoise) {
      // Stop logic
      if (audioCtxRef.current?.state === 'running') {
        audioCtxRef.current.suspend();
      }
      setIsPlayingNoise(false);
    } else {
      // Start logic
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
        
        // Create Brown Noise Buffer (2 seconds loop)
        const bufferSize = audioCtxRef.current.sampleRate * 2;
        const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // Gain compensation
        }

        gainNodeRef.current = audioCtxRef.current.createGain();
        gainNodeRef.current.gain.value = 0.05; // Gentle volume
        gainNodeRef.current.connect(audioCtxRef.current.destination);

        noiseNodeRef.current = audioCtxRef.current.createBufferSource();
        noiseNodeRef.current.buffer = buffer;
        noiseNodeRef.current.loop = true;
        noiseNodeRef.current.connect(gainNodeRef.current);
        noiseNodeRef.current.start(0);
      } else {
        audioCtxRef.current.resume();
      }
      setIsPlayingNoise(true);
    }
  };

  const tick = () => {
    if (!endTimeRef.current) return;
    
    const now = Date.now();
    const remaining = Math.ceil((endTimeRef.current - now) / 1000);

    if (remaining <= 0) {
      setTimeLeft(0);
      setIsActive(false);
      endTimeRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
      playSound('end');
    } else {
      setTimeLeft(remaining);
    }
  };

  const toggleTimer = () => {
    if (isActive) {
      // PAUSE
      setIsActive(false);
      endTimeRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      // START
      if (timeLeft === 0) return;
      
      // Play sound based on mode
      if (mode === 'pomodoro' || mode === 'custom') {
        playSound('start');
      } else {
        playSound('break');
      }

      setIsActive(true);
      endTimeRef.current = Date.now() + timeLeft * 1000;
      intervalRef.current = window.setInterval(tick, 200);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    endTimeRef.current = null;
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const time = modes[mode] * 60;
    setTimeLeft(time);
    setInitialTime(time);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    endTimeRef.current = null;
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const minutes = newMode === 'custom' ? customTime : modes[newMode];
    setTimeLeft(minutes * 60);
    setInitialTime(minutes * 60);
  };

  const setCustomTimeValue = (minutes: number) => {
    setCustomTime(minutes);
    if (mode === 'custom') {
      setIsActive(false);
      setTimeLeft(minutes * 60);
      setInitialTime(minutes * 60);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const value = {
    mode,
    timeLeft,
    initialTime,
    isActive,
    customTime,
    isMuted,
    focusTask,
    isPlayingNoise,
    toggleTimer,
    resetTimer,
    switchMode,
    setCustomTimeValue,
    toggleMute,
    setFocusTask,
    toggleBrownNoise
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};
