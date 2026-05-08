import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>(storage.getTheme() || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    storage.setTheme(theme);
  }, [theme]);
  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };
  return {
    theme,
    toggleTheme
  };
}