import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { getStoredTheme, setStoredTheme } from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

export default function AppearanceSetting() {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const choose = (id) => {
    setTheme(id);
    setStoredTheme(id);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sun className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">Appearance</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => choose(id)}
            className={cn(
              'flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all',
              theme === id
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-secondary/60 border-border hover:border-primary/30'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        System follows your device's light or dark setting.
      </p>
    </div>
  );
}