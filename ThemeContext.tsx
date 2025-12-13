
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export type ThemeMode = 'light' | 'dark' | 'crescere';
export type FontSize = 'small' | 'normal' | 'large' | 'extra-large';
export type FontFamily = 'sans' | 'serif' | 'mono';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  accentColor: string;
  fontSize: FontSize;
  fontFamily: FontFamily;
  reduceMotion: boolean;
  
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setAccentColor: (hex: string) => void;
  setFontSize: (size: FontSize) => void;
  setFontFamily: (family: FontFamily) => void;
  setReduceMotion: (reduce: boolean) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// --- COLOR UTILS ---
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 236, g: 72, b: 153 };
};

const updateCssVariables = (hex: string) => {
    const root = document.documentElement;
    const base = hexToRgb(hex);
    
    // Helper to mix white/black for tints/shades
    const mix = (color: {r: number, g: number, b: number}, mixColor: {r: number, g: number, b: number}, weight: number) => {
        return `${Math.round(color.r * (1 - weight) + mixColor.r * weight)} ${Math.round(color.g * (1 - weight) + mixColor.g * weight)} ${Math.round(color.b * (1 - weight) + mixColor.b * weight)}`;
    };

    const w = {r: 255, g: 255, b: 255};
    const b = {r: 0, g: 0, b: 0};

    // Generating a full Tailwind-like palette from one color
    root.style.setProperty('--accent-50', mix(base, w, 0.95));
    root.style.setProperty('--accent-100', mix(base, w, 0.9));
    root.style.setProperty('--accent-200', mix(base, w, 0.8));
    root.style.setProperty('--accent-300', mix(base, w, 0.6));
    root.style.setProperty('--accent-400', mix(base, w, 0.4));
    
    // Base Color (500)
    root.style.setProperty('--accent-500', `${base.r} ${base.g} ${base.b}`);
    
    // Shades
    root.style.setProperty('--accent-600', mix(base, b, 0.1));
    root.style.setProperty('--accent-700', mix(base, b, 0.3));
    root.style.setProperty('--accent-800', mix(base, b, 0.5));
    root.style.setProperty('--accent-900', mix(base, b, 0.7));
    root.style.setProperty('--accent-950', mix(base, b, 0.85));
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // --- BASIC THEME STATE ---
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pnle_theme_mode');
      if (saved === 'crescere' || saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // STORE: User's selected accent color (Persisted)
  // This preserves the choice (e.g., Blue) even if Crescere mode forces Pink visually.
  const [userAccentColor, setUserAccentColor] = useState(() => {
      return localStorage.getItem('pnle_accent_color') || '#EC4899';
  });

  // COMPUTED: The actual color applied to CSS
  // If Crescere mode is active, FORCE Rose Red (#be123c).
  // Otherwise, use the user's selected color.
  const activeAccentColor = themeMode === 'crescere' ? '#be123c' : userAccentColor;

  // --- ACCESSIBILITY STATE ---
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
      return (localStorage.getItem('pnle_font_size') as FontSize) || 'normal';
  });

  const [fontFamily, setFontFamilyState] = useState<FontFamily>(() => {
      return (localStorage.getItem('pnle_font_family') as FontFamily) || 'sans';
  });

  const [reduceMotion, setReduceMotionState] = useState<boolean>(() => {
      return localStorage.getItem('pnle_reduce_motion') === 'true';
  });

  const isDark = themeMode === 'dark';

  // --- LOAD PREFERENCES ---
  useEffect(() => {
      const loadPreferences = async () => {
          if (currentUser) {
              try {
                  const ref = doc(db, 'users', currentUser.uid);
                  const snap = await getDoc(ref);
                  if (snap.exists()) {
                      const data = snap.data();
                      if (data.themeMode) setThemeModeState(data.themeMode as ThemeMode);
                      
                      // Important: Load the USER'S preference, not the potentially overridden active color
                      if (data.accentColor) setUserAccentColor(data.accentColor);
                      
                      if (data.fontSize) setFontSizeState(data.fontSize);
                      if (data.fontFamily) setFontFamilyState(data.fontFamily);
                      if (data.reduceMotion !== undefined) setReduceMotionState(data.reduceMotion);
                  }
              } catch (e) {
                  console.error("Failed to load theme prefs", e);
              }
          }
      };
      loadPreferences();
  }, [currentUser]);

  // --- APPLY EFFECTS TO DOM ---
  
  // 1. Theme Mode Classes
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');

    if (themeMode === 'crescere') root.classList.add('theme-crescere');
    else root.classList.remove('theme-crescere');
    
    localStorage.setItem('pnle_theme_mode', themeMode);
    
    if (currentUser) {
        const ref = doc(db, 'users', currentUser.uid);
        updateDoc(ref, { themeMode }).catch(() => {});
    }
  }, [themeMode, isDark, currentUser]);

  // 2. CSS Variables & Color Persistence
  useEffect(() => {
      // Apply the ACTIVE color to CSS variables (UI update)
      updateCssVariables(activeAccentColor);
      
      // Persist the USER'S preference to storage/DB
      localStorage.setItem('pnle_accent_color', userAccentColor);
      if (currentUser) {
          const ref = doc(db, 'users', currentUser.uid);
          updateDoc(ref, { accentColor: userAccentColor }).catch(() => {});
      }
  }, [activeAccentColor, userAccentColor, currentUser]);

  // 3. Accessibility Settings
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', fontSize);
    root.setAttribute('data-font-family', fontFamily);
    
    if (reduceMotion) root.classList.add('reduce-motion');
    else root.classList.remove('reduce-motion');

    localStorage.setItem('pnle_font_size', fontSize);
    localStorage.setItem('pnle_font_family', fontFamily);
    localStorage.setItem('pnle_reduce_motion', String(reduceMotion));
    
    if (currentUser) {
        const ref = doc(db, 'users', currentUser.uid);
        updateDoc(ref, { 
            fontSize, 
            fontFamily, 
            reduceMotion 
        }).catch(() => {});
    }
  }, [fontSize, fontFamily, reduceMotion, currentUser]);


  // --- PUBLIC ACTIONS ---

  const setThemeMode = (mode: ThemeMode) => {
      setThemeModeState(mode);
      // No need to manually set accentColor here; derived logic handles the visual switch
  };

  const toggleTheme = () => setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  
  const setAccentColor = (hex: string) => {
      // Updates the user's preference. 
      // If in Crescere mode, this won't visually change immediately, but will be saved for when they exit Crescere.
      setUserAccentColor(hex);
  };

  const setFontSize = (size: FontSize) => setFontSizeState(size);
  const setFontFamily = (family: FontFamily) => setFontFamilyState(family);
  const setReduceMotion = (reduce: boolean) => setReduceMotionState(reduce);

  const resetTheme = () => {
      setUserAccentColor('#EC4899'); // Reset to default Pink
      setThemeMode('dark');
      setFontSizeState('normal');
      setFontFamilyState('sans');
      setReduceMotionState(false);
  }

  return (
    <ThemeContext.Provider value={{ 
        themeMode, isDark, 
        accentColor: activeAccentColor, // Consumers see the *active* color (Rose if Crescere, User's if not)
        fontSize, fontFamily, reduceMotion,
        setThemeMode, toggleTheme, 
        setAccentColor, // Updates the *user's* preference
        setFontSize, setFontFamily, setReduceMotion,
        resetTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
