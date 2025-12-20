
import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import { useGamification } from '../hooks/useGamification';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { collection, query, orderBy, onSnapshot, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { isSameDay, format } from 'date-fns';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
export type PetType = 'cat' | 'dog';
export type SoundscapeType = 'brown' | 'white';
export type PetStage = 'egg' | 'baby' | 'child' | 'teen' | 'legendary';

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
  soundscape: SoundscapeType;
  pipWindow: Window | null;
  petType: PetType;
  petName: string; 
  catName: string;
  dogName: string;
  petStage: PetStage; 
  totalFocusMinutes: number; 
  focusIntegrity: number; 
  completionEvent: { type: 'focus_complete' | 'break_complete' | 'goal_complete' | null, timestamp: number };
  clearCompletionEvent: () => void;
  
  sessionHistory: PomodoroSession[];
  dailyProgress: number; 
  
  toggleTimer: () => void;
  resetTimer: () => void;
  stopSessionEarly: (save: boolean) => Promise<void>;
  setPreset: (name: PresetName) => void;
  setCustomSettings: (settings: TimerSettings) => void;
  setSessionGoal: (goal: number) => void;
  setFocusTask: (task: string) => void;
  toggleBrownNoise: () => void;
  setSoundscape: (type: SoundscapeType) => void;
  togglePiP: () => Promise<void>;
  stopAlarm: () => void;
  skipForward: () => void;
  deleteSession: (id: string) => Promise<void>;
  setPetType: (type: PetType) => void;
  setPetName: (name: string) => void;
  getPetMessage: (status: 'focus' | 'break' | 'idle' | 'complete') => string;
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

const MIN_SAVE_DURATION = 10; 

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

  // --- PET STATE (Synced to Firebase) ---
  const [petType, setPetTypeState] = useState<PetType>('cat');
  const [catName, setCatNameState] = useState<string>('Mochi');
  const [dogName, setDogNameState] = useState<string>('Buddy');

  // Load Pet Prefs from Firestore
  useEffect(() => {
    if (!currentUser) return;
    const fetchPetPrefs = async () => {
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                const data = snap.data();
                if (data.petType) setPetTypeState(data.petType);
                if (data.catName) setCatNameState(data.catName);
                if (data.dogName) setDogNameState(data.dogName);
            }
        } catch (e) {
            console.error("Error fetching pet prefs", e);
        }
    };
    fetchPetPrefs();
  }, [currentUser]);

  const petName = petType === 'cat' ? catName : dogName;

  const [timerSettings, setTimerSettings] = useState<TimerSettings>(DEFAULT_PRESETS.classic);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_PRESETS.classic.focus);
  const [isActive, setIsActive] = useState(false);
  
  const [sessionGoal, setSessionGoal] = useState(4);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [focusTask, setFocusTask] = useState('');
  
  const [isBrownNoiseOn, setIsBrownNoiseOn] = useState(false);
  const [soundscape, setSoundscapeState] = useState<SoundscapeType>('brown');
  
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  
  const [focusIntegrity, setFocusIntegrity] = useState(100); 
  const [completionEvent, setCompletionEvent] = useState<{ type: 'focus_complete' | 'break_complete' | 'goal_complete' | null, timestamp: number }>({ type: null, timestamp: 0 });

  const [sessionHistory, setSessionHistory] = useState<PomodoroSession[]>([]);
  const [dailyProgress, setDailyProgress] = useState(0);

  // --- REFS ---
  const endTimeRef = useRef<number | null>(null);
  const timerIdRef = useRef<number | null>(null);
  const initialDurationRef = useRef<number>(DEFAULT_PRESETS.classic.focus); 
  const startTimeRef = useRef<string | null>(null); 

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  // --- DATABASE SYNC (NEW: Daily Bucketing) ---
  useEffect(() => {
    if (!currentUser) {
        setSessionHistory([]);
        setDailyProgress(0);
        return;
    }

    // New Collection: pomodoro_logs (Documents named by Date YYYY-MM-DD)
    // Order by date descending to get recent days first
    const q = query(
        collection(db, 'users', currentUser.uid, 'pomodoro_logs'),
        orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        let allSessions: PomodoroSession[] = [];
        
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.sessions && Array.isArray(data.sessions)) {
                allSessions = [...allSessions, ...data.sessions];
            }
        });

        // Sort all sessions descending by time (newest first)
        allSessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        
        setSessionHistory(allSessions);

        // Calc Daily Progress
        const today = new Date();
        const todaysMinutes = allSessions
            .filter(s => s.type === 'focus' && isSameDay(new Date(s.startTime), today))
            .reduce((acc, curr) => acc + curr.duration, 0) / 60;
        
        setDailyProgress(Math.round(todaysMinutes));
    });

    return () => unsubscribe();
  }, [currentUser]);

  // --- DERIVED PET EVOLUTION ---
  const totalFocusMinutes = useMemo(() => {
      // Calculate total cumulative minutes from history
      return sessionHistory
          .filter(s => s.type === 'focus')
          .reduce((acc, curr) => acc + curr.duration, 0) / 60;
  }, [sessionHistory]);

  const petStage = useMemo<PetStage>(() => {
      if (totalFocusMinutes < 60) return 'egg';
      if (totalFocusMinutes < 300) return 'baby';
      if (totalFocusMinutes < 1000) return 'child';
      if (totalFocusMinutes < 2500) return 'teen';
      return 'legendary';
  }, [totalFocusMinutes]);

  // --- HELPERS: SAVE SESSION (EFFICIENT) ---
  const saveSession = async (duration: number, sessionType: TimerMode) => {
      if (!currentUser) return;
      if (duration < MIN_SAVE_DURATION) return;

      try {
          const now = new Date();
          const start = startTimeRef.current ? new Date(startTimeRef.current) : new Date(now.getTime() - duration * 1000);
          const dateKey = format(start, 'yyyy-MM-dd');

          const newSession: PomodoroSession = {
              id: crypto.randomUUID(),
              startTime: start.toISOString(),
              endTime: now.toISOString(),
              duration: duration,
              type: sessionType,
              subject: focusTask || 'General Review',
              createdAt: now.toISOString()
          };
          
          // Use arrayUnion on a daily document
          // This creates the doc if it doesn't exist, or appends to array if it does
          const docRef = doc(db, 'users', currentUser.uid, 'pomodoro_logs', dateKey);
          
          await setDoc(docRef, {
              date: dateKey,
              sessions: arrayUnion(newSession)
          }, { merge: true });

      } catch (error) {
          console.error("Failed to save session:", error);
      }
  };

  const deleteSession = async (id: string) => {
      if (!currentUser) return;
      try {
          // 1. Find the session in local state to know its date key
          const sessionToDelete = sessionHistory.find(s => s.id === id);
          if (!sessionToDelete) return;

          const dateKey = format(new Date(sessionToDelete.startTime), 'yyyy-MM-dd');
          const docRef = doc(db, 'users', currentUser.uid, 'pomodoro_logs', dateKey);

          // 2. Read, Filter, Update (Reliable Array Removal)
          // Note: arrayRemove only works if you have the EXACT object. Since we might miss fields or timestamps might differ slightly in serialization, 
          // a read-modify-write is safer for deletion by ID.
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
              const currentSessions = docSnap.data().sessions as PomodoroSession[];
              const updatedSessions = currentSessions.filter(s => s.id !== id);
              
              await updateDoc(docRef, {
                  sessions: updatedSessions
              });
          }
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
      handleComplete(false); 
    }
  };

  const handleComplete = (wasSkipped: boolean) => {
    pauseTimer();
    const elapsed = initialDurationRef.current; 
    
    let nextMode: TimerMode = 'focus';
    let nextTime = timerSettings.focus;
    let eventType: 'focus_complete' | 'break_complete' | 'goal_complete' = 'break_complete';

    if (mode === 'focus') {
        if (!wasSkipped) {
            saveSession(elapsed, 'focus');
            trackAction('finish_pomodoro');
            
            const newCompleted = sessionsCompleted + 1;
            setSessionsCompleted(newCompleted);
            setFocusIntegrity(prev => Math.min(100, prev + 5)); 
            
            if (newCompleted % sessionGoal === 0 && newCompleted > 0) {
                eventType = 'goal_complete';
            } else {
                eventType = 'focus_complete';
            }
            
            setCompletionEvent({ type: eventType, timestamp: Date.now() });
        }
        
        if ((sessionsCompleted + 1) % 4 === 0) {
            nextMode = 'longBreak';
            nextTime = timerSettings.longBreak;
        } else {
            nextMode = 'shortBreak';
            nextTime = timerSettings.shortBreak;
        }
    } else {
        if (!wasSkipped) {
            saveSession(elapsed, mode);
            setCompletionEvent({ type: 'break_complete', timestamp: Date.now() });
        }
        nextMode = 'focus';
        nextTime = timerSettings.focus;
    }

    setMode(nextMode);
    initTimer(nextTime);
    startTimeRef.current = null;

    if (!wasSkipped) {
       startAlarmLoop();
    }
  };

  const clearCompletionEvent = () => {
      setCompletionEvent({ type: null, timestamp: 0 });
  };

  // --- PUBLIC ACTIONS ---
  const toggleTimer = () => {
    if (isActive) pauseTimer();
    else startTimer();
  };

  const resetTimer = () => {
    pauseTimer();
    stopAlarm();
    initTimer(mode === 'focus' ? timerSettings.focus : mode === 'shortBreak' ? timerSettings.shortBreak : timerSettings.longBreak);
    startTimeRef.current = null;
  };

  const stopSessionEarly = async (save: boolean) => {
      pauseTimer();
      stopAlarm();
      const elapsed = initialDurationRef.current - timeLeft;
      if (save) {
          await saveSession(elapsed, mode);
      } else {
          setFocusIntegrity(prev => Math.max(0, prev - 10));
      }
      setMode('focus');
      initTimer(timerSettings.focus);
      startTimeRef.current = null;
  };

  const skipForward = () => {
      handleComplete(true); 
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

  const setPetType = (type: PetType) => {
      setPetTypeState(type);
      if (currentUser) {
          updateDoc(doc(db, 'users', currentUser.uid), { petType: type }).catch(console.error);
      }
  }

  const setPetName = (name: string) => {
      if (petType === 'cat') {
          setCatNameState(name);
          if (currentUser) updateDoc(doc(db, 'users', currentUser.uid), { catName: name }).catch(console.error);
      } else {
          setDogNameState(name);
          if (currentUser) updateDoc(doc(db, 'users', currentUser.uid), { dogName: name }).catch(console.error);
      }
  }

  const getPetMessage = (status: 'focus' | 'break' | 'idle' | 'complete') => {
      if (petType === 'cat') {
          switch(status) {
              case 'focus': return "Shh... I'm hunting (studying)...";
              case 'break': return "Meow! Time to stretch!";
              case 'complete': return "Purrfect! You did it!";
              case 'idle': return "Ready when you are, human!";
              default: return "Meow?";
          }
      } else {
          switch(status) {
              case 'focus': return "Guarding your focus! Grrr...";
              case 'break': return "Woof! Play time!";
              case 'complete': return "Good job! You're a good boy/girl!";
              case 'idle': return "Let's go! I'm ready!";
              default: return "Woof?";
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

  const playNoise = () => {
    try {
        const ctx = initAudio();
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        if (soundscape === 'white') {
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        } else {
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; 
            }
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = soundscape === 'white' ? 1000 : 400;
        
        const gain = ctx.createGain();
        gain.gain.value = soundscape === 'white' ? 0.05 : 0.15; 
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
        noiseNodeRef.current = source;
    } catch (e) {
        console.error("Audio generation failed", e);
    }
  };

  const stopNoise = () => {
    noiseNodeRef.current?.stop();
    noiseNodeRef.current = null;
  };

  const toggleBrownNoise = () => {
    if (isBrownNoiseOn) {
      stopNoise();
      setIsBrownNoiseOn(false);
    } else {
      playNoise();
      setIsBrownNoiseOn(true);
    }
  };

  const setSoundscape = (type: SoundscapeType) => {
      setSoundscapeState(type);
      if (isBrownNoiseOn) {
          stopNoise();
          setTimeout(() => {
              playNoise();
          }, 50);
      }
  }

  const startAlarmLoop = () => {
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

  const togglePiP = async () => {
      if (pipWindow) {
          pipWindow.close();
          setPipWindow(null);
          return;
      }
      if ('documentPictureInPicture' in window) {
          try {
              // @ts-ignore
              const win = await window.documentPictureInPicture.requestWindow({ width: 220, height: 220 });
              Array.from(document.styleSheets).forEach((styleSheet) => {
                try {
                  if (styleSheet.cssRules) {
                    const newStyleEl = win.document.createElement('style');
                    Array.from(styleSheet.cssRules).forEach((cssRule) => {
                      newStyleEl.appendChild(win.document.createTextNode(cssRule.cssText));
                    });
                    win.document.head.appendChild(newStyleEl);
                  }
                } catch (e) {}
              });
              
              win.document.body.className = "bg-slate-900 text-white flex items-center justify-center overflow-hidden";
              win.addEventListener('pagehide', () => setPipWindow(null));
              setPipWindow(win);
          } catch(e) {
              console.error("PiP failed", e);
          }
      } else {
          alert("Picture-in-Picture is not supported in this browser.");
      }
  };

  useEffect(() => {
      return () => {
          stopNoise();
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
    soundscape,
    pipWindow,
    petType,
    petName,
    catName,
    dogName,
    petStage,
    totalFocusMinutes,
    focusIntegrity,
    completionEvent,
    clearCompletionEvent,
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
    setSoundscape,
    togglePiP,
    stopAlarm,
    skipForward,
    deleteSession,
    setPetType,
    setPetName,
    getPetMessage
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};
