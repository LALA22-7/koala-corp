'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check local storage or system preference
    const saved = localStorage.getItem('koala-theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') {
      setThemeState(saved);
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('koala-theme', t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Animated Dark Mode Toggle Switch
 */
export function DarkModeToggle({
  className = '',
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-xs font-medium text-koala-grey select-none">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
        onClick={toggleTheme}
        className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-koala-lime/50 ${
          isDark
            ? 'bg-deep-charcoal border border-koala-lime/40 shadow-[0_0_12px_rgba(164,210,51,0.25)]'
            : 'bg-divider-grey/80 border border-divider-grey'
        }`}
      >
        <span
          className={`pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-surface shadow-md transition-transform duration-300 ease-in-out ${
            isDark ? 'translate-x-6 bg-koala-lime text-deep-charcoal' : 'translate-x-0 bg-white text-koala-grey'
          }`}
        >
          {isDark ? (
            <Moon size={13} className="animate-pulse" />
          ) : (
            <Sun size={13} />
          )}
        </span>
      </button>
    </div>
  );
}
