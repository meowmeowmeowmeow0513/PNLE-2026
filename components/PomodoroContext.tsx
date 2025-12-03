
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
  isAlarmRinging: boolean;
  showBreakModal: boolean;
  pipWindow: Window | null;
  toggleTimer: () => void;
  resetTimer: () => void;
  switchMode: (mode: TimerMode) => void;
  setCustomTimeValue: (minutes: number) => void;
  toggleMute: () => void;
  setFocusTask: (task: string) => void;
  toggleBrownNoise: () => void;
  stopAlarm: () => void;
  setShowBreakModal: (show: boolean) => void;
  setPipWindow: (win: Window | null) => void;
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
  // Timer State
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState(25);
  const [isMuted, setIsMuted] = useState(false);
  const [focusTask, setFocusTask] = useState('');
  
  // Audio State
  const [isPlayingNoise, setIsPlayingNoise] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  
  // PiP State
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  // Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const brownNoiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);
  
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const modes: Record<TimerMode, number> = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    custom: customTime,
  };

  // --- AUDIO ENGINE ---
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    // Resume if suspended (browser policy)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const toggleBrownNoise = () => {
    const ctx = getAudioContext();
    
    if (isPlayingNoise) {
      if (brownNoiseNodeRef.current) {
        brownNoiseNodeRef.current.stop();
        brownNoiseNodeRef.current = null;
      }
      setIsPlayingNoise(false);
    } else {
      // Generate Brown Noise Buffer
      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; 
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.05; // Gentle volume
      
      noise.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start();
      
      brownNoiseNodeRef.current = noise;
      setIsPlayingNoise(true);
    }
  };

  const triggerAlarm = () => {
    if (isMuted) return;
    setIsAlarmRinging(true);
    
    const ctx = getAudioContext();
    
    // Create a pulsing alarm effect
    const playBeep = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    };

    playBeep();
    alarmIntervalRef.current = window.setInterval(playBeep, 1500);
  };

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setIsAlarmRinging(false);
  };

  // --- TIMER LOGIC ---
  const tick = () => {
    if (!endTimeRef.current) return;
    
    const now = Date.now();
    const remaining = Math.ceil((endTimeRef.current - now) / 1000);

    if (remaining <= 0) {
      setTimeLeft(0);
      setIsActive(false);
      endTimeRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      // Timer Complete!
      triggerAlarm();
      setShowBreakModal(true);
    } else {
      setTimeLeft(remaining);
    }
  };

  const toggleTimer = () => {
    const ctx = getAudioContext(); // Ensure AudioContext is unlocked by user interaction
    
    if (isActive) {
      // Pause
      setIsActive(false);
      endTimeRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      // Start
      if (timeLeft === 0) return;
      setIsActive(true);
      endTimeRef.current = Date.now() + timeLeft * 1000;
      intervalRef.current = window.setInterval(tick, 200);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    endTimeRef.current = null;
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopAlarm();
    
    const time = modes[mode] * 60;
    setTimeLeft(time);
    setInitialTime(time);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    endTimeRef.current = null;
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopAlarm();
    
    const minutes = newMode === 'custom' ? customTime : modes[newMode];
    setTimeLeft(minutes * 60);
    setInitialTime(minutes * 60);
  };

  const setCustomTimeValue = (minutes: number) => {
    const clamped = Math.min(180, Math.max(1, Math.floor(minutes)));
    setCustomTime(clamped);
    if (mode === 'custom') {
      setIsActive(false);
      setTimeLeft(clamped * 60);
      setInitialTime(clamped * 60);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
      if (brownNoiseNodeRef.current) brownNoiseNodeRef.current.stop();
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
    isAlarmRinging,
    showBreakModal,
    pipWindow,
    toggleTimer,
    resetTimer,
    switchMode,
    setCustomTimeValue,
    toggleMute,
    setFocusTask,
    toggleBrownNoise,
    stopAlarm,
    setShowBreakModal,
    setPipWindow
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};
