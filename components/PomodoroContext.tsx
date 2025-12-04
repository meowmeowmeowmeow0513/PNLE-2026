
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useGamification } from '../hooks/useGamification';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { isSameDay } from 'date-fns';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

export type PresetName = 'micro' | 'classic' | 'long' | 'custom';

export interface PomodoroSession {
  id: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  duration: number;  // Seconds
  type: TimerMode;
  subject: string;
  createdAt: string; // ISO for sorting
}

interface PomodoroContextType {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  activePreset: PresetName;
  timerSettings: TimerSettings;
  sessionGoal: number;
  sessionsCompleted: number;
  focusTask: string;
  isBrownNoiseOn: boolean;
  pipWindow: Window | null;
  
  // Stats & History
  sessionHistory: PomodoroSession[];
  dailyProgress: number; // Minutes
  
  toggleTimer: () => void;
  resetTimer: () => void; // Standard reset
  stopSessionEarly: (save: boolean) => Promise<void>; // New: Handle early stop with option to save
  setPreset: (name: PresetName) => void;
  setCustomSettings: (settings: TimerSettings) => void;
  setSessionGoal: (goal: number) => void;
  setFocusTask: (task: string) => void;
  toggleBrownNoise: () => void;
  togglePiP: () => Promise<void>;
  stopAlarm: () => void;
  skipForward: () => void;
  deleteSession: (id: string) => Promise<void>;
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
  custom: { focus: 45 * 60, shortBreak: 10 * 60, longBreak: 25 * 60 },
};

const MIN_SAVE_DURATION = 5 * 60; // 5 Minutes

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { trackAction } = useGamification();

  // --- STATE ---
  const [mode, setMode] = useState<TimerMode>('focus');
  const [activePreset, setActivePreset] = useState<PresetName>('classic');
  
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
  const [isBrownNoiseOn, setIsBrownNoiseOn] = useState(false);
  
  // --- ANALYTICS STATE ---
  const [sessionHistory, setSessionHistory] = useState<PomodoroSession[]>([]);
  const [dailyProgress, setDailyProgress] = useState(0);

  // --- REFS ---
  const endTimeRef = useRef<number | null>(null);
  const timerIdRef = useRef<number | null>(null);
  const initialDurationRef = useRef<number>(DEFAULT_PRESETS.classic.focus); // Track full duration for elapsed calc
  const startTimeRef = useRef<string | null>(null); // Track when session actually started

  const audioCtxRef = useRef<AudioContext | null>(null);
  const brownNoiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  // --- DATABASE SYNC ---
  useEffect(() => {
    if (!currentUser) {
        setSessionHistory([]);
        setDailyProgress(0);
        return;
    }

    // Only fetch last 24h or recent 50 to save reads/bandwidth for now, 
    // but user requested "Today" logic. Let's fetch all and filter in memory or query reasonably.
    // For Vitals, we need "Today".
    const q = query(
        collection(db, 'users', currentUser.uid, 'pomodoro_sessions'),
        orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PomodoroSession));
        setSessionHistory(history);

        // Calculate Daily Progress
        const today = new Date();
        const todaysMinutes = history
            .filter(s => s.type === 'focus' && isSameDay(new Date(s.startTime), today))
            .reduce((acc, curr) => acc + curr.duration, 0) / 60;
        
        setDailyProgress(Math.round(todaysMinutes));
    });

    return () => unsubscribe();
  }, [currentUser]);

  // --- HELPERS: SAVE SESSION ---
  const saveSession = async (duration: number, sessionType: TimerMode) => {
      if (!currentUser || duration < MIN_SAVE_DURATION) return; // Anti-Abuse

      try {
          const now = new Date();
          const start = startTimeRef.current ? new Date(startTimeRef.current) : new Date(now.getTime() - duration * 1000);
          
          await addDoc(collection(db, 'users', currentUser.uid, 'pomodoro_sessions'), {
              startTime: start.toISOString(),
              endTime: now.toISOString(),
              duration: duration,
              type: sessionType,
              subject: focusTask || 'General Review',
              createdAt: now.toISOString()
          });
      } catch (error) {
          console.error("Failed to save session:", error);
      }
  };

  const deleteSession = async (id: string) => {
      if (!currentUser) return;
      try {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'pomodoro_sessions', id));
      } catch (error) {
          console.error("Failed to delete session", error);
      }
  };

  // --- TIMER LOGIC ---
  
  const initTimer = (duration: number) => {
      initialDurationRef.current = duration;
      setTimeLeft(duration);
  };

  const startTimer = () => {
      if (timeLeft <= 0) return;
      setIsActive(true);
      endTimeRef.current = Date.now() + timeLeft * 1000;
      if (!startTimeRef.current) startTimeRef.current = new Date().toISOString();
      timerIdRef.current = window.setInterval(tick, 200);
      stopAlarm();
  };

  const pauseTimer = () => {
      setIsActive(false);
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      endTimeRef.current = null;
  };

  const tick = () => {
    if (!endTimeRef.current) return;
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));

    setTimeLeft(remaining);

    if (remaining <= 0) {
      handleComplete(false); // Natural completion
    }
  };

  const handleComplete = (wasSkipped: boolean) => {
    pauseTimer();
    const elapsed = initialDurationRef.current; // Full duration completed
    
    // Logic for next state
    let nextMode: TimerMode = 'focus';
    let nextTime = timerSettings.focus;

    if (mode === 'focus') {
        if (!wasSkipped) {
            saveSession(elapsed, 'focus');
            trackAction('finish_pomodoro');
            setSessionsCompleted(prev => prev + 1);
        }
        
        if ((sessionsCompleted + 1) % 4 === 0) {
            nextMode = 'longBreak';
            nextTime = timerSettings.longBreak;
        } else {
            nextMode = 'shortBreak';
            nextTime = timerSettings.shortBreak;
        }
    } else {
        // Break ending
        if (!wasSkipped) saveSession(elapsed, mode); // Save breaks too? Optional. Let's save them for "O2 Saturation" calc.
        nextMode = 'focus';
        nextTime = timerSettings.focus;
    }

    setMode(nextMode);
    initTimer(nextTime);
    startTimeRef.current = null; // Reset start time for next session

    if (!wasSkipped) {
       startAlarmLoop();
    }
  };

  // --- PUBLIC ACTIONS ---

  const toggleTimer = () => {
    if (isActive) pauseTimer();
    else startTimer();
  };

  const resetTimer = () => {
    // Just reset to initial state of CURRENT mode
    pauseTimer();
    stopAlarm();
    initTimer(mode === 'focus' ? timerSettings.focus : mode === 'shortBreak' ? timerSettings.shortBreak : timerSettings.longBreak);
    startTimeRef.current = null;
  };

  const stopSessionEarly = async (save: boolean) => {
      pauseTimer();
      stopAlarm();
      
      const elapsed = initialDurationRef.current - timeLeft;
      
      if (save && elapsed >= MIN_SAVE_DURATION) {
          await saveSession(elapsed, mode);
      }

      // Reset to Focus Mode fresh start
      setMode('focus');
      initTimer(timerSettings.focus);
      startTimeRef.current = null;
  };

  const skipForward = () => {
      handleComplete(true); // Treat as skip
      stopAlarm();
  };

  const setPreset = (name: PresetName) => {
      pauseTimer();
      stopAlarm();
      setActivePreset(name);
      const newSettings = name === 'custom' ? customSettings : DEFAULT_PRESETS[name];
      setTimerSettings(newSettings);
      
      setMode('focus');
      initTimer(newSettings.focus);
      startTimeRef.current = null;
  };

  const setCustomSettings = (settings: TimerSettings) => {
      setCustomState(settings);
      localStorage.setItem('pomodoro_custom_settings', JSON.stringify(settings));
      if (activePreset === 'custom') {
          setTimerSettings(settings);
          if (!isActive && mode === 'focus') {
              initTimer(settings.focus);
          }
      }
  };

  // --- AUDIO ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playBrownNoise = () => {
    try {
        const ctx = initAudio();
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
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        const gain = ctx.createGain();
        gain.gain.value = 0.15;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
        brownNoiseNodeRef.current = source;
    } catch (e) {}
  };

  const stopBrownNoise = () => {
    brownNoiseNodeRef.current?.stop();
    brownNoiseNodeRef.current = null;
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

  const startAlarmLoop = () => {
      // Simple beep
      const play = () => {
          const ctx = initAudio();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
      };
      play();
      if (!alarmIntervalRef.current) {
          alarmIntervalRef.current = window.setInterval(play, 2000);
      }
  };

  const stopAlarm = () => {
      if (alarmIntervalRef.current) {
          clearInterval(alarmIntervalRef.current);
          alarmIntervalRef.current = null;
      }
  };

  // --- PIP ---
  const togglePiP = async () => {
      // Implementation passed to UI via context, logic same as before or simplified
      if (pipWindow) {
          pipWindow.close();
          setPipWindow(null);
          return;
      }
      if ('documentPictureInPicture' in window) {
          try {
              // @ts-ignore
              const win = await window.documentPictureInPicture.requestWindow({ width: 300, height: 300 });
              // Copy styles... (omitted for brevity, same as previous)
              win.document.body.className = "bg-slate-900 text-white flex items-center justify-center";
              win.addEventListener('pagehide', () => setPipWindow(null));
              setPipWindow(win);
          } catch(e) {}
      }
  };

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
    sessionHistory,
    dailyProgress,
    toggleTimer,
    resetTimer,
    stopSessionEarly,
    setPreset,
    setCustomSettings,
    setSessionGoal,
    setFocusTask,
    toggleBrownNoise,
    togglePiP,
    stopAlarm,
    skipForward,
    deleteSession
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};
