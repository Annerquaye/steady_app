import React from 'react';
import { differenceInDays, differenceInHours } from 'date-fns';
import { Flame, Shield, TrendingUp, Star } from 'lucide-react';

const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365];

function getMilestone(days) {
  const next = MILESTONES.find(m => m > days);
  const prev = [...MILESTONES].reverse().find(m => m <= days);
  return { next, prev };
}

export default function ProgressCard({ profile, urges }) {
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

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 border border-primary/15 space-y-5">
      {/* Streak header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Clean streak</span>
        </div>
        <div className="flex items-baseline gap-2">
          {days === 0 && hours === 0 ? (
            <span className="text-3xl font-heading font-bold text-foreground">Day 1 begins now</span>
          ) : (
            <>
              <span className="text-5xl font-heading font-bold text-foreground">{days}</span>
              <span className="text-lg text-muted-foreground">days</span>
              {hours > 0 && (
                <span className="text-2xl font-heading font-semibold text-foreground/50 ml-1">{hours}h</span>
              )}
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">{streakMessage}</p>
      </div>

      {/* Milestone progress bar */}
      {next && (
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-muted-foreground">
              {prev ? `${prev}-day ✓` : 'Start'}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-accent" />
              <span className="text-xs font-medium text-accent">{next}-day milestone</span>
            </div>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {next - days} day{next - days !== 1 ? 's' : ''} until your next milestone
          </p>
        </div>
      )}

      {/* Urge victories */}
      <div className="border-t border-primary/10 pt-4 grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-heading font-bold">{resisted}</div>
          <div className="text-[10px] text-muted-foreground leading-tight">Urges<br />conquered</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-heading font-bold">{resistRate}%</div>
          <div className="text-[10px] text-muted-foreground leading-tight">Success<br />rate</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Flame className="w-4 h-4 text-chart-3" />
          </div>
          <div className="text-2xl font-heading font-bold">{totalUrges}</div>
          <div className="text-[10px] text-muted-foreground leading-tight">Urges<br />tracked</div>
        </div>
      </div>

      {resisted > 0 && (
        <p className="text-xs text-center text-primary font-medium -mt-1">
          🏆 You've beaten {resisted} urge{resisted !== 1 ? 's' : ''}. That's {resisted} times you chose yourself.
        </p>
      )}
    </div>
  );
}