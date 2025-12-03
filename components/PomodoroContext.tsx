
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
  // --- STATE ---
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [customTime, setCustomTime] = useState(25);
  const [isMuted, setIsMuted] = useState(false);
  const [focusTask, setFocusTask] = useState('');
  
  const [isPlayingNoise, setIsPlayingNoise] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  // --- REFS ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const brownNoiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const alarmOscillatorsRef = useRef<OscillatorNode[]>([]);
  const alarmGainNodeRef = useRef<GainNode | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const modes: Record<TimerMode, number> = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    custom: customTime,
  };

  // --- WEB AUDIO API INIT ---
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // --- BROWN NOISE GENERATOR ---
  const toggleBrownNoise = () => {
    const ctx = getAudioContext();
    
    if (isPlayingNoise) {
      if (brownNoiseNodeRef.current) {
        brownNoiseNodeRef.current.stop();
        brownNoiseNodeRef.current.disconnect();
        brownNoiseNodeRef.current = null;
      }
      setIsPlayingNoise(false);
    } else {
      const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.05; // Soft background volume
      
      noise.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start();
      
      brownNoiseNodeRef.current = noise;
      setIsPlayingNoise(true);
    }
  };

  // --- ALARM (Pleasant Chime) ---
  const playAlarmTone = () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    
    // Stop previous if any
    stopAlarm();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.1, ctx.currentTime);
    masterGain.connect(ctx.destination);
    alarmGainNodeRef.current = masterGain;

    // Create a major chord (C5, E5, G5)
    const frequencies = [523.25, 659.25, 783.99]; 
    const oscillators: OscillatorNode[] = [];

    frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Pulsing effect
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 2; // 2Hz pulse
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.05;
        
        osc.connect(lfoGain);
        lfoGain.connect(masterGain);
        
        osc.start();
        oscillators.push(osc);
    });

    alarmOscillatorsRef.current = oscillators;
    setIsAlarmRinging(true);
  };

  const stopAlarm = () => {
    alarmOscillatorsRef.current.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch(e){}
    });
    alarmOscillatorsRef.current = [];
    if (alarmGainNodeRef.current) {
        alarmGainNodeRef.current.disconnect();
        alarmGainNodeRef.current = null;
    }
    setIsAlarmRinging(false);
  };

  // --- TIMER ENGINE ---
  const tick = () => {
    if (!endTimeRef.current) return;
    
    const now = Date.now();
    const remaining = Math.ceil((endTimeRef.current - now) / 1000);

    if (remaining <= 0) {
      // Timer Finished
      setTimeLeft(0);
      setIsActive(false);
      endTimeRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      playAlarmTone();
      setShowBreakModal(true);
    } else {
      setTimeLeft(remaining);
    }
  };

  const toggleTimer = () => {
    getAudioContext(); // Ensure AudioContext is initialized on user interaction

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
      intervalRef.current = window.setInterval(tick, 100); // 100ms for responsiveness
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
      stopAlarm();
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
