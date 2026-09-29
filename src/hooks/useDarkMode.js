import { useEffect } from 'react';

const THEME_KEY = 'recorva_theme';

// Current preference: 'light' | 'dark' | 'system' (default 'system')
export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'system';
  } catch {
    return 'system';
  }
}

// Saves the preference and notifies the running hook (and any other tab)
export function setStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // storage unavailable — theme just won't persist
  }
  window.dispatchEvent(new CustomEvent('recorva-theme-change', { detail: theme }));
}

/**
 * Applies the stored theme (or the OS preference when set to 'system') to the
 * document root's `.dark` class. Works in both browser and WebView (iOS/Android).
 */
export function useDarkMode() {
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const theme = getStoredTheme();
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      root.classList.toggle('dark', dark);
    };

    apply();

    const handler = () => apply();
    mq.addEventListener('change', handler);
    window.addEventListener('recorva-theme-change', handler);
    return () => {
      mq.removeEventListener('change', handler);
      window.removeEventListener('recorva-theme-change', handler);
    };
  }, []);
}