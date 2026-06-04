import { useEffect } from 'react';

/**
 * Syncs the document root's `.dark` class with the OS color-scheme preference.
 * Works in both browser and WebView (iOS/Android).
 */
export function useDarkMode() {
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = (dark) => {
      if (dark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    apply(mq.matches);

    const handler = (e) => apply(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
}