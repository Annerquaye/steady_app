import React from 'react';
import { Lock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAY_MILESTONES = [
  { days: 1, emoji: '🌱', label: 'Day 1' },
  { days: 3, emoji: '🍃', label: '3 days' },
  { days: 7, emoji: '🗓️', label: '1 week' },
  { days: 14, emoji: '💫', label: '2 weeks' },
  { days: 30, emoji: '🌙', label: '1 month' },
  { days: 60, emoji: '⭐', label: '2 months' },
  { days: 90, emoji: '🏅', label: '90 days' },
  { days: 180, emoji: '🏆', label: '6 months' },
  { days: 365, emoji: '👑', label: '1 year' },
];

const URGE_MILESTONES = [
  { count: 10, emoji: '✊', label: '10 urges' },
  { count: 25, emoji: '🔥', label: '25 urges' },
  { count: 50, emoji: '⚡', label: '50 urges' },
  { count: 100, emoji: '🛡️', label: '100 urges' },
  { count: 250, emoji: '💎', label: '250 urges' },
  { count: 500, emoji: '🌟', label: '500 urges' },
];

// Milestone achievements: earned vs. locked badges + progress to the next streak milestone
export default function MilestoneAchievements({ currentDays, bestArchivedDays, totalResisted, archivedCount }) {
  const best = Math.max(currentDays || 0, bestArchivedDays || 0);
  const next = DAY_MILESTONES.find(m => m.days > best);
  const progress = next ? Math.min(100, Math.round((best / next.days) * 100)) : 100;
  const resisted = totalResisted || 0;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-5">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-accent" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Milestone achievements</span>
      </div>

      {next && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Next: {next.emoji} {next.label}</span>
            <span className="font-semibold">{best}/{next.days} days</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div>
        <p className="text-[11px] font-semibold mb-2">Streak milestones</p>
        <div className="grid grid-cols-3 gap-2">
          {DAY_MILESTONES.map(m => (
            <Badge key={m.days} earned={best >= m.days} emoji={m.emoji} label={m.label} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold mb-2">Urge resistance milestones</p>
        <div className="grid grid-cols-3 gap-2">
          {URGE_MILESTONES.map(m => (
            <Badge key={m.count} earned={resisted >= m.count} emoji={m.emoji} label={m.label} />
          ))}
        </div>
      </div>

      {archivedCount > 0 && (
        <p className="text-[11px] text-muted-foreground">
          💪 {archivedCount} past streak{archivedCount !== 1 ? 's' : ''} — every restart counts.
        </p>
      )}
    </div>
  );
}

function Badge({ earned, emoji, label }) {
  return (
    <div
      className={cn(
        'rounded-xl border p-2.5 text-center',
        earned ? 'border-primary/25 bg-primary/10' : 'border-border bg-secondary/40 opacity-55'
      )}
    >
      <div className={cn('text-xl', earned ? '' : 'grayscale')}>{emoji}</div>
      <p className="text-[10px] font-medium mt-0.5 leading-tight">{label}</p>
      {!earned && <Lock className="w-2.5 h-2.5 mx-auto mt-0.5 text-muted-foreground" />}
    </div>
  );
}