
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

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
    
    const tint = (factor: number) => {
        return `${Math.round(base.r + (255 - base.r) * factor)} ${Math.round(base.g + (255 - base.g) * factor)} ${Math.round(base.b + (255 - base.b) * factor)}`;
    };
    
    const shade = (factor: number) => {
        return `${Math.round(base.r * (1 - factor))} ${Math.round(base.g * (1 - factor))} ${Math.round(base.b * (1 - factor))}`;
    };

    root.style.setProperty('--accent-50', tint(0.95));
    root.style.setProperty('--accent-100', tint(0.9));
    root.style.setProperty('--accent-200', tint(0.7));
    root.style.setProperty('--accent-400', tint(0.2));
    root.style.setProperty('--accent-500', `${base.r} ${base.g} ${base.b}`);
    root.style.setProperty('--accent-600', shade(0.1));
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

  const [accentColor, setAccentColorState] = useState(() => {
      return localStorage.getItem('pnle_accent_color') || '#EC4899';
  });

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
                      if (data.accentColor) setAccentColorState(data.accentColor);
                      // Load A11y Prefs
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
  useEffect(() => {
    const root = document.documentElement;
    
    // 1. Theme Mode
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');

    if (themeMode === 'crescere') root.classList.add('theme-crescere');
    else root.classList.remove('theme-crescere');
    
    // 2. Accessibility Attributes
    root.setAttribute('data-font-size', fontSize);
    root.setAttribute('data-font-family', fontFamily);
    
    if (reduceMotion) root.classList.add('reduce-motion');
    else root.classList.remove('reduce-motion');

    // 3. Persistence
    localStorage.setItem('pnle_theme_mode', themeMode);
    localStorage.setItem('pnle_font_size', fontSize);
    localStorage.setItem('pnle_font_family', fontFamily);
    localStorage.setItem('pnle_reduce_motion', String(reduceMotion));
    
    if (currentUser) {
        const ref = doc(db, 'users', currentUser.uid);
        updateDoc(ref, { 
            themeMode, 
            fontSize, 
            fontFamily, 
            reduceMotion 
        }).catch(() => {});
    }
  }, [themeMode, isDark, fontSize, fontFamily, reduceMotion, currentUser]);

  // Apply Color Variables
  useEffect(() => {
      updateCssVariables(accentColor);
      localStorage.setItem('pnle_accent_color', accentColor);
      if (currentUser) {
          const ref = doc(db, 'users', currentUser.uid);
          updateDoc(ref, { accentColor: accentColor }).catch(() => {});
      }
  }, [accentColor, currentUser]);

  // --- PUBLIC ACTIONS ---

  const setThemeMode = (mode: ThemeMode) => {
      setThemeModeState(mode);
      if (mode === 'crescere') {
          setAccentColorState('#be123c'); // Rose Red for Crescere
      } else {
          setAccentColorState('#EC4899'); // Default Pink for Light/Dark
      }
  };

  const toggleTheme = () => setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  const setAccentColor = (hex: string) => setAccentColorState(hex);
  const setFontSize = (size: FontSize) => setFontSizeState(size);
  const setFontFamily = (family: FontFamily) => setFontFamilyState(family);
  const setReduceMotion = (reduce: boolean) => setReduceMotionState(reduce);

  const resetTheme = () => {
      setAccentColorState('#EC4899');
      setThemeMode('dark');
      setFontSizeState('normal');
      setFontFamilyState('sans');
      setReduceMotionState(false);
  }

  return (
    <ThemeContext.Provider value={{ 
        themeMode, isDark, accentColor, 
        fontSize, fontFamily, reduceMotion,
        setThemeMode, toggleTheme, setAccentColor,
        setFontSize, setFontFamily, setReduceMotion,
        resetTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
