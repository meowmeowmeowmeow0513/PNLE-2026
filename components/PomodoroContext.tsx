
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useStreakSystem } from '../hooks/useStreakSystem';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

interface PomodoroContextType {
  mode: TimerMode;
  timeLeft: number;
  initialTime: number;
  isActive: boolean;
  customTime: number;
  isMuted: boolean; // System sounds mute
  
  // New ADHD Features
  focusTask: string;
  setFocusTask: (task: string) => void;
  isPlayingNoise: boolean; // Brown noise state
  toggleBrownNoise: () => void;

  toggleTimer: () => void;
  resetTimer: () => void;
  switchMode: (mode: TimerMode) => void;
  setCustomTimeValue: (minutes: number) => void;
  toggleMute: () => void;
  triggerConfetti: () => void; // Exposed to trigger from UI if needed, though mostly internal logic
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
  const { completeDailyTask } = useStreakSystem();

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState(25);
  const [isMuted, setIsMuted] = useState(false);

  // Focus Anchor
  const [focusTask, setFocusTask] = useState('');

  // Brown Noise State
  const [isPlayingNoise, setIsPlayingNoise] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
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

  // --- AUDIO LOGIC (System Sounds) ---
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
        // Victory sound
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(523.25, now); // C5
        oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
        oscillator.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        
        oscillator.start(now);
        oscillator.stop(now + 0.8);
      } else if (type === 'start') {
        // Focus ping
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
      } else if (type === 'break') {
        // Relax ping
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.linearRampToValueAtTime(200, now + 0.3);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
      }
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  // --- BROWN NOISE GENERATOR ---
  const toggleBrownNoise = () => {
    if (isPlayingNoise) {
      // Stop
      noiseSourceRef.current?.stop();
      setIsPlayingNoise(false);
    } else {
      // Start
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        const ctx = audioContextRef.current;

        // Create buffer with random noise
        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          // White noise
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        // Create Brown Noise Filter (LowPass around 400Hz creates a deep rumble)
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400; 

        const gain = ctx.createGain();
        gain.gain.value = 0.15; // Soft background volume

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noise.start();
        
        noiseSourceRef.current = noise;
        gainNodeRef.current = gain;
        setIsPlayingNoise(true);
      } catch (e) {
        console.error("Brown noise failed", e);
      }
    }
  };

  // --- TIMER LOGIC ---
  const tick = () => {
    if (!endTimeRef.current) return;
    
    const now = Date.now();
    const remaining = Math.ceil((endTimeRef.current - now) / 1000);

    if (remaining <= 0) {
      // TIMER FINISHED
      setTimeLeft(0);
      setIsActive(false);
      endTimeRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      playSound('end');

      // Auto-Log Streak if Pomodoro
      if (mode === 'pomodoro') {
        completeDailyTask();
      }
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      noiseSourceRef.current?.stop();
      audioContextRef.current?.close();
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
    setFocusTask,
    isPlayingNoise,
    toggleBrownNoise,
    toggleTimer,
    resetTimer,
    switchMode,
    setCustomTimeValue,
    toggleMute,
    triggerConfetti: () => {} // Placeholder if needed
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};
