
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

export type PresetName = 'micro' | 'classic' | 'long' | 'custom';

interface PomodoroContextType {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  activePreset: PresetName;
  timerSettings: TimerSettings;
  sessionGoal: number;
  sessionsCompleted: number;
  focusTask: string; // The ID or Title of the task
  isBrownNoiseOn: boolean;
  pipWindow: Window | null;
  
  toggleTimer: () => void;
  resetTimer: () => void;
  setPreset: (name: PresetName) => void;
  setCustomSettings: (settings: TimerSettings) => void;
  setSessionGoal: (goal: number) => void;
  setFocusTask: (task: string) => void;
  toggleBrownNoise: () => void;
  setPipWindow: (win: Window | null) => void;
  stopAlarm: () => void;
  skipForward: () => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};

const DEFAULT_PRESETS: Record<PresetName, TimerSettings> = {
  micro: { focus: 15 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 },
  classic: { focus: 25 * 60, shortBreak: 5 * 60, longBreak: 20 * 60 },
  long: { focus: 50 * 60, shortBreak: 10 * 60, longBreak: 30 * 60 },
  custom: { focus: 45 * 60, shortBreak: 10 * 60, longBreak: 25 * 60 }, // Default custom base
};

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [mode, setMode] = useState<TimerMode>('focus');
  const [activePreset, setActivePreset] = useState<PresetName>('classic');
  
  // Load custom settings from localStorage or use default
  const [customSettings, setCustomState] = useState<TimerSettings>(() => {
      const saved = localStorage.getItem('pomodoro_custom_settings');
      return saved ? JSON.parse(saved) : DEFAULT_PRESETS.custom;
  });

  const [timerSettings, setTimerSettings] = useState<TimerSettings>(DEFAULT_PRESETS.classic);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_PRESETS.classic.focus);
  const [isActive, setIsActive] = useState(false);
  
  const [sessionGoal, setSessionGoal] = useState(4);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [focusTask, setFocusTask] = useState('');
  
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  
  // --- AUDIO STATE & REFS ---
  const [isBrownNoiseOn, setIsBrownNoiseOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const brownNoiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  // --- TIMING REFS (Persistence) ---
  const endTimeRef = useRef<number | null>(null);
  const timerIdRef = useRef<number | null>(null);

  // --- AUDIO ENGINE: SETUP ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // --- AUDIO ENGINE: BROWN NOISE ---
  const playBrownNoise = () => {
    try {
        const ctx = initAudio();
        // Create 2 seconds of brown noise buffer
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; 
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        // Lowpass filter to make it "Brown" (Warm/Deep)
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400; // Deep rumble

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.15; 

        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        noiseSource.start();
        
        brownNoiseNodeRef.current = noiseSource;
        gainNodeRef.current = gainNode;
    } catch (e) {
        console.error("Audio Context Error", e);
    }
  };

  const stopBrownNoise = () => {
    if (brownNoiseNodeRef.current) {
      try {
        brownNoiseNodeRef.current.stop();
        brownNoiseNodeRef.current.disconnect();
      } catch(e) {}
      brownNoiseNodeRef.current = null;
    }
  };

  const toggleBrownNoise = () => {
    if (isBrownNoiseOn) {
      stopBrownNoise();
      setIsBrownNoiseOn(false);
    } else {
      playBrownNoise();
      setIsBrownNoiseOn(true);
    }
  };

  // --- AUDIO ENGINE: CODE BLUE ALARM (Subtle but urgent) ---
  const playAlarmTone = () => {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  };

  const startAlarmLoop = () => {
    playAlarmTone(); // Immediate
    if (!alarmIntervalRef.current) {
        alarmIntervalRef.current = window.setInterval(() => {
            playAlarmTone();
        }, 2000); // Loop every 2s
    }
  };

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
    }
  };

  // --- LOGIC: PRESETS ---
  const setPreset = (name: PresetName) => {
      setIsActive(false);
      stopAlarm();
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      endTimeRef.current = null;

      setActivePreset(name);
      
      const newSettings = name === 'custom' ? customSettings : DEFAULT_PRESETS[name];
      setTimerSettings(newSettings);
      
      // Reset to start of Focus mode
      setMode('focus');
      setTimeLeft(newSettings.focus);
  };

  const setCustomSettings = (settings: TimerSettings) => {
      setCustomState(settings);
      localStorage.setItem('pomodoro_custom_settings', JSON.stringify(settings));
      
      // If we are currently on custom, apply immediately
      if (activePreset === 'custom') {
          setTimerSettings(settings);
          if (!isActive && mode === 'focus') {
              setTimeLeft(settings.focus);
          }
      }
  };

  // --- TIMER LOGIC (DELTA TIME) ---
  const tick = () => {
    if (!endTimeRef.current) return;
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));

    setTimeLeft(remaining);

    if (remaining <= 0) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    if (timerIdRef.current) clearInterval(timerIdRef.current);
    endTimeRef.current = null;
    setTimeLeft(0);
    
    // Logic for auto-switching or waiting user input
    if (mode === 'focus') {
        setSessionsCompleted(prev => prev + 1);
        // Decide next mode
        if ((sessionsCompleted + 1) % 4 === 0) {
            setMode('longBreak');
            setTimeLeft(timerSettings.longBreak);
        } else {
            setMode('shortBreak');
            setTimeLeft(timerSettings.shortBreak);
        }
    } else {
        // Break over, back to focus
        setMode('focus');
        setTimeLeft(timerSettings.focus);
    }

    startAlarmLoop();
  };

  const toggleTimer = () => {
    if (isActive) {
      // Pause
      setIsActive(false);
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      endTimeRef.current = null;
    } else {
      // Start/Resume
      if (timeLeft <= 0) return;
      setIsActive(true);
      endTimeRef.current = Date.now() + timeLeft * 1000;
      timerIdRef.current = window.setInterval(tick, 200); 
      stopAlarm(); // Stop alarm if it was ringing
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    if (timerIdRef.current) clearInterval(timerIdRef.current);
    endTimeRef.current = null;
    stopAlarm();
    // Reset to current mode's max time
    const maxTime = mode === 'focus' ? timerSettings.focus : (mode === 'shortBreak' ? timerSettings.shortBreak : timerSettings.longBreak);
    setTimeLeft(maxTime);
  };

  const skipForward = () => {
      // Manual skip to next state
      handleComplete();
      stopAlarm(); // Auto-stop alarm when manually skipping
      setIsActive(false); // Don't auto-start next
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBrownNoise();
      stopAlarm();
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, []);

  const value = {
    mode,
    timeLeft,
    isActive,
    activePreset,
    timerSettings,
    sessionGoal,
    sessionsCompleted,
    focusTask,
    isBrownNoiseOn,
    pipWindow,
    toggleTimer,
    resetTimer,
    setPreset,
    setCustomSettings,
    setSessionGoal,
    setFocusTask,
    toggleBrownNoise,
    setPipWindow,
    stopAlarm,
    skipForward
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};
