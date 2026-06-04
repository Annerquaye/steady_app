import React, { useState } from 'react';
import { differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

const STREAK_BADGES = [
  { id: 'streak_1',   req: 1,   emoji: '🌱', label: '1 Day',    desc: 'The hardest step.' },
  { id: 'streak_3',   req: 3,   emoji: '🔥', label: '3 Days',   desc: 'Momentum building.' },
  { id: 'streak_7',   req: 7,   emoji: '⭐', label: '1 Week',   desc: 'Brain chemistry shifting.' },
  { id: 'streak_14',  req: 14,  emoji: '🏅', label: '2 Weeks',  desc: 'Dopamine resetting.' },
  { id: 'streak_30',  req: 30,  emoji: '🥇', label: '1 Month',  desc: 'New neural pathways formed.' },
  { id: 'streak_60',  req: 60,  emoji: '💎', label: '2 Months', desc: 'Lifestyle change locked in.' },
  { id: 'streak_90',  req: 90,  emoji: '👑', label: '90 Days',  desc: 'Full rewire complete.' },
  { id: 'streak_365', req: 365, emoji: '🦅', label: '1 Year',   desc: 'Extraordinary. True freedom.' },
];

const URGE_BADGES = [
  { id: 'urge_1',   req: 1,   emoji: '🛡️', label: 'First Win',   desc: 'You resisted once.' },
  { id: 'urge_5',   req: 5,   emoji: '💪', label: '5 Urges',     desc: 'Pattern of strength.' },
  { id: 'urge_10',  req: 10,  emoji: '🎯', label: '10 Urges',    desc: 'Discipline in action.' },
  { id: 'urge_25',  req: 25,  emoji: '🌟', label: '25 Urges',    desc: 'Mastery developing.' },
  { id: 'urge_50',  req: 50,  emoji: '🏆', label: '50 Urges',    desc: 'Warrior mindset.' },
  { id: 'urge_100', req: 100, emoji: '🦁', label: '100 Urges',   desc: 'Unstoppable.' },
];

function Badge({ emoji, label, desc, earned, next }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <button
      onClick={() => setShowTip(s => !s)}
      className={cn(
        "relative flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all text-center",
        earned
          ? "bg-primary/8 border-primary/25 shadow-sm"
          : next
          ? "bg-secondary/60 border-dashed border-border/80"
          : "bg-card border-border opacity-40"
      )}
    >
      <span className={cn("text-2xl leading-none", !earned && !next && "grayscale")}>{emoji}</span>
      <span className={cn("text-[10px] font-semibold leading-tight", earned ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
      {earned && (
        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
          <span className="text-[8px] text-primary-foreground font-bold">✓</span>
        </span>
      )}
      {next && !earned && (
        <span className="text-[8px] text-primary font-medium">next</span>
      )}
      {showTip && (
        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] rounded-lg px-2.5 py-1.5 w-28 text-center z-10 pointer-events-none shadow-lg">
          {earned ? `🎉 ${desc}` : `Locked — ${desc}`}
        </div>
      )}
    </button>
  );
}

export default function MilestoneTracker({ profile, urges }) {
  const streakDays = profile?.streak_start_date
    ? differenceInDays(new Date(), new Date(profile.streak_start_date))
    : 0;
  const resisted = urges.filter(u => u.outcome === 'resisted').length;

  const earnedStreak = STREAK_BADGES.filter(b => streakDays >= b.req).map(b => b.id);
  const nextStreakIdx = STREAK_BADGES.findIndex(b => streakDays < b.req);

  const earnedUrge = URGE_BADGES.filter(b => resisted >= b.req).map(b => b.id);
  const nextUrgeIdx = URGE_BADGES.findIndex(b => resisted < b.req);

  const totalEarned = earnedStreak.length + earnedUrge.length;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Achievements</h3>
          <p className="text-xs text-muted-foreground">{totalEarned} badge{totalEarned !== 1 ? 's' : ''} earned</p>
        </div>
        <span className="text-lg">🏆</span>
      </div>

      {/* Streak badges */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Streak milestones</p>
        <div className="grid grid-cols-4 gap-2">
          {STREAK_BADGES.map((b, i) => (
            <Badge
              key={b.id}
              {...b}
              earned={earnedStreak.includes(b.id)}
              next={i === nextStreakIdx}
            />
          ))}
        </div>
      </div>

      {/* Urge resistance badges */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Urges conquered</p>
        <div className="grid grid-cols-4 gap-2">
          {URGE_BADGES.map((b, i) => (
            <Badge
              key={b.id}
              {...b}
              earned={earnedUrge.includes(b.id)}
              next={i === nextUrgeIdx}
            />
          ))}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">Tap any badge to learn more</p>
    </div>
  );
}