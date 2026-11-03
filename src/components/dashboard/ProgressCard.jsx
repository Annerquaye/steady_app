import React from 'react';
import { differenceInDays, differenceInHours } from 'date-fns';
import { Flame, Shield, TrendingUp, Star } from 'lucide-react';
import { useStreakTotals } from '@/hooks/useStreakTotals';

const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365];

function getMilestone(days) {
  const next = MILESTONES.find(m => m > days);
  const prev = [...MILESTONES].reverse().find(m => m <= days);
  return { next, prev };
}

export default function ProgressCard({ profile, urges }) {
  const { bestDays, totalCleanDays, resets } = useStreakTotals(profile);
  const now = new Date();
  const start = profile?.streak_start_date ? new Date(profile.streak_start_date) : now;
  const days = differenceInDays(now, start);
  const hours = differenceInHours(now, start) % 24;

  const currentStreakUrges = urges.filter(u => new Date(u.created_date) >= start);
  const totalUrges = currentStreakUrges.length;
  const resisted = currentStreakUrges.filter(u => u.outcome === 'resisted').length;
  const resistRate = totalUrges > 0 ? Math.round((resisted / totalUrges) * 100) : 0;

  const { next, prev } = getMilestone(days);
  const fractionalDays = days + hours / 24;
  const progress = next ? Math.round((fractionalDays / next) * 100) : days > 0 ? 100 : 0;

  const streakMessage =
    days === 0 ? 'Every journey starts with day one.' :
    days < 3 ? 'Early days — your brain is already adjusting.' :
    days < 7 ? 'Building real momentum. Keep going.' :
    days < 14 ? "One week done. You're rewiring your brain." :
    days < 30 ? 'Two weeks of clarity. The fog is lifting.' :
    days < 60 ? 'A full month. You\'re a different person.' :
    days < 90 ? 'Two months strong. This is who you are now.' :
    'Extraordinary. You\'ve built a new identity.';

  const tiles = [
    { icon: Shield, value: resisted, label: 'Urges beaten', tone: 'text-primary bg-primary/10' },
    { icon: TrendingUp, value: totalUrges > 0 ? `${resistRate}%` : '–', label: 'Success rate', tone: 'text-accent bg-accent/10' },
    { icon: Flame, value: totalUrges, label: 'Urges logged', tone: 'text-chart-3 bg-chart-3/10' },
  ];

  return (
    <div className="space-y-3">
      {/* Streak hero */}
      <div className="relative overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-lg bg-gradient-to-br from-primary via-primary to-[hsl(165_35%_20%)]">
        <div aria-hidden="true" className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute -right-2 top-16 w-24 h-24 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-full bg-white/15 grid place-items-center">
              <Flame className="w-4 h-4 animate-sway" />
            </span>
            <span className="text-sm font-semibold text-white/85">Clean streak</span>
          </div>
          <div className="flex items-baseline gap-2">
            {days === 0 && hours === 0 ? (
              <span className="text-3xl font-heading font-extrabold">Day 1 begins now</span>
            ) : (
              <>
                <span className="text-6xl font-heading font-extrabold tracking-tight tabular animate-pop-in">{days}</span>
                <span className="text-xl font-semibold text-white/80">day{days !== 1 ? 's' : ''}</span>
                {hours > 0 && (
                  <span className="text-xl font-heading font-semibold text-white/55 ml-1 tabular">{hours}h</span>
                )}
              </>
            )}
          </div>
          <p className="text-sm text-white/85 mt-2">{streakMessage}</p>
          {resets > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
              <span className="px-2.5 py-1 rounded-full bg-white/15 tabular">Best: {bestDays} day{bestDays !== 1 ? 's' : ''}</span>
              <span className="px-2.5 py-1 rounded-full bg-white/15 tabular">Total clean: {totalCleanDays} day{totalCleanDays !== 1 ? 's' : ''}</span>
            </div>
          )}

          {next && (
            <div className="mt-5">
              <div className="flex justify-between items-center mb-2 text-xs font-medium">
                <span className="text-white/75">{prev ? `${prev}-day reached` : 'Start'}</span>
                <span className="flex items-center gap-1 text-white">
                  <Star className="w-3.5 h-3.5 fill-[hsl(42_95%_62%)] text-[hsl(42_95%_62%)]" />
                  {next}-day milestone
                </span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <p className="text-xs text-white/75 mt-2">
                {next - days} day{next - days !== 1 ? 's' : ''} to go
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Urge stats */}
      <div className="grid grid-cols-3 gap-3">
        {tiles.map(({ icon: Icon, value, label, tone }) => (
          <div key={label} className="bg-card rounded-2xl border border-border/60 shadow-soft p-3.5 text-center">
            <span className={`mx-auto mb-2 w-8 h-8 rounded-full grid place-items-center ${tone}`}>
              <Icon className="w-4 h-4" />
            </span>
            <div className="text-2xl font-heading font-bold tabular">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {resisted > 0 && (
        <p className="text-sm text-center text-muted-foreground px-4">
          You've beaten <span className="font-semibold text-foreground">{resisted} urge{resisted !== 1 ? 's' : ''}</span>. That's {resisted} time{resisted !== 1 ? 's' : ''} you chose yourself.
        </p>
      )}
    </div>
  );
}
