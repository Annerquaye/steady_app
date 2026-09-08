import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const rateColor = (rate) => (rate >= 70 ? 'bg-primary' : rate >= 40 ? 'bg-accent' : 'bg-destructive');

// Trigger correlation: resist rate & intensity per trigger, with strongest/toughest callouts
export default function TriggerOutcomeList({ stats }) {
  const top = stats.slice(0, 6);
  const meaningful = stats.filter(s => s.total >= 3);
  const toughest = meaningful.length ? meaningful.reduce((a, b) => (a.resistRate <= b.resistRate ? a : b)) : null;
  const strongest = meaningful.length ? meaningful.reduce((a, b) => (a.resistRate >= b.resistRate ? a : b)) : null;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-accent" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trigger × outcome</span>
      </div>

      {top.length === 0 ? (
        <p className="text-xs text-muted-foreground">Log urges with triggers to see your personal correlations.</p>
      ) : (
        <div className="space-y-3">
          {top.map(s => (
            <div key={s.trigger}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium truncate">{s.trigger}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                  {s.total} urge{s.total !== 1 ? 's' : ''}{s.avgIntensity ? ` · ~${s.avgIntensity}/10` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', rateColor(s.resistRate))}
                    style={{ width: `${s.resistRate}%` }}
                  />
                </div>
                <span className="text-xs font-semibold w-11 text-right">{s.resistRate}%</span>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground text-right">bar = % of urges resisted</p>
        </div>
      )}

      {toughest && toughest.resistRate < 70 && (
        <div className="bg-destructive/5 border border-destructive/15 rounded-xl p-3 text-xs leading-relaxed">
          <span className="font-semibold">Hardest trigger: {toughest.trigger}.</span>{' '}
          You resist only {toughest.resistRate}% of these urges. Plan a specific intervention for the next time it hits.
        </div>
      )}
      {strongest && strongest.resistRate >= 70 && (
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 text-xs leading-relaxed flex gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">Strength: {strongest.trigger}.</span> You've resisted {strongest.resistRate}% of
            these — lean on what works there.
          </span>
        </div>
      )}
    </div>
  );
}