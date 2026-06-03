import React from 'react';
import { differenceInDays, differenceInHours } from 'date-fns';
import { Flame } from 'lucide-react';

export default function StreakCard({ streakStartDate }) {
  const now = new Date();
  const start = streakStartDate ? new Date(streakStartDate) : now;
  const days = differenceInDays(now, start);
  const hours = differenceInHours(now, start) % 24;

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/10">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Current Streak</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-heading font-bold text-foreground">{days}</span>
        <span className="text-lg text-muted-foreground">days</span>
        <span className="text-2xl font-heading font-semibold text-foreground/60 ml-2">{hours}h</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {days === 0 ? "Every journey starts with day one." : 
         days < 7 ? "Building momentum. Keep going." :
         days < 30 ? "You're rewiring your brain. Real change is happening." :
         "Incredible discipline. You're becoming a different person."}
      </p>
    </div>
  );
}