import React from 'react';
import { ShieldCheck, Clock, TrendingUp } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function StatsGrid({ profile, urges }) {
  const streakDays = profile?.streak_start_date
    ? differenceInDays(new Date(), new Date(profile.streak_start_date))
    : 0;
  const hoursSaved = Math.round(streakDays * 0.75); // estimated avg
  const urgesResisted = urges.filter(u => u.outcome === 'resisted').length;

  const stats = [
    { label: 'Urges resisted', value: urgesResisted, icon: ShieldCheck, color: 'text-primary' },
    { label: 'Hours saved', value: `${hoursSaved}h`, icon: Clock, color: 'text-accent' },
    { label: 'Recovery score', value: `${Math.min(100, Math.round((urgesResisted / Math.max(1, urges.length)) * 100))}%`, icon: TrendingUp, color: 'text-chart-3' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-card rounded-xl p-3 border border-border text-center">
          <Icon className={`w-5 h-5 mx-auto mb-1.5 ${color}`} />
          <div className="text-xl font-bold font-heading">{value}</div>
          <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}