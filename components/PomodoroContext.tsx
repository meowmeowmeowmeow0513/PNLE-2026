
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
  focusTaskId: string | null;
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
  setFocusTaskId: (id: string | null) => void;
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
  
  // Task Integration
  const [focusTask, setFocusTask] = useState('');
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  
  const [isPlayingNoise, setIsPlayingNoise] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  // --- AUDIO REFS ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const brownNoiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainNodeRef = useRef<GainNode | null>(null);
  const alarmOscillatorsRef = useRef<OscillatorNode[]>([]);
  const alarmGainNodeRef = useRef<GainNode | null>(null);
  
  // --- TIMER REFS ---
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const modes: Record<TimerMode, number> = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    custom: customTime,
  };

  // --- AUDIO ENGINE INIT ---
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

  // --- BROWN NOISE ENGINE (Warm Texture) ---
  const toggleBrownNoise = () => {
    const ctx = getAudioContext();
    const fadeTime = 2; // Seconds

    if (isPlayingNoise) {
      // Fade Out
      if (noiseGainNodeRef.current) {
        noiseGainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + fadeTime);
        setTimeout(() => {
            if (brownNoiseSourceRef.current) {
                try {
                  brownNoiseSourceRef.current.stop();
                  brownNoiseSourceRef.current.disconnect();
                } catch (e) {}
            }
        }, fadeTime * 1000);
      }
      setIsPlayingNoise(false);
    } else {
      // Create Brown Noise Buffer
      const bufferSize = ctx.sampleRate * 2; // 2 seconds loop
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise integration
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Compensate gain
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Create Low Pass Filter (Make it warm)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400; // Hz

      // Gain Node for Volume
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + fadeTime);

      // Connect Graph
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      noise.start();
      
      brownNoiseSourceRef.current = noise;
      noiseGainNodeRef.current = gainNode;
      setIsPlayingNoise(true);
    }
  };

  // --- ALARM ENGINE (Ethereal Chord) ---
  const playAlarmTone = () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    
    // Do not restart if already ringing
    if (isAlarmRinging) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.1, ctx.currentTime);
    masterGain.connect(ctx.destination);
    alarmGainNodeRef.current = masterGain;

    // Major 7th Chord (Cmaj7: C, E, G, B)
    const frequencies = [523.25, 659.25, 783.99, 987.77]; 
    const oscillators: OscillatorNode[] = [];

    frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Subtle LFO for pulsing effect
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 3; // 3Hz pulse
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.3; // Depth
        
        osc.connect(lfoGain);
        lfoGain.connect(masterGain);
        
        // LOOP the oscillator indefinitely until stopAlarm is called
        osc.start();
        oscillators.push(osc);
    });

    alarmOscillatorsRef.current = oscillators;
    setIsAlarmRinging(true);
  };

  const stopAlarm = () => {
    if (!isAlarmRinging) return;

    alarmOscillatorsRef.current.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch(e){}
    });
    alarmOscillatorsRef.current = [];
    
    if (alarmGainNodeRef.current) {
        try {
            alarmGainNodeRef.current.disconnect(); 
        } catch(e) {}
        alarmGainNodeRef.current = null;
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
      playAlarmTone();
      setShowBreakModal(true);
    } else {
      setTimeLeft(remaining);
    }
  };

  const toggleTimer = () => {
    getAudioContext(); // Wake up audio context
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
      intervalRef.current = window.setInterval(tick, 100);
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

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // We don't auto-stop brown noise on unmount to keep vibes unless explicit
      if (audioCtxRef.current) audioCtxRef.current.suspend();
    };
  }, []);

  const value = {
    mode, timeLeft, initialTime, isActive, customTime, isMuted, focusTask, focusTaskId,
    isPlayingNoise, isAlarmRinging, showBreakModal, pipWindow,
    toggleTimer, resetTimer, switchMode, setCustomTimeValue,
    toggleMute, setFocusTask, setFocusTaskId, toggleBrownNoise, stopAlarm, setShowBreakModal, setPipWindow
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};
