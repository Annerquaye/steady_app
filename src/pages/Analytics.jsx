import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { daysSince, triggerStats } from '@/lib/analyticsUtils';
import WeeklyVolumeChart from '@/components/analytics/WeeklyVolumeChart';
import WeeklyMoodChart from '@/components/analytics/WeeklyMoodChart';
import StreakHistoryChart from '@/components/analytics/StreakHistoryChart';
import TriggerOutcomeList from '@/components/analytics/TriggerOutcomeList';
import TriggerTimeMatrix from '@/components/analytics/TriggerTimeMatrix';
import MilestoneAchievements from '@/components/analytics/MilestoneAchievements';

export default function Analytics() {
  const { data: profiles, isLoading: loadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list(),
    initialData: [],
  });
  const profile = profiles[0];

  const { data: urges, isLoading: loadingUrges } = useQuery({
    queryKey: ['urges'],
    queryFn: () => base44.entities.UrgeLog.list('-created_date', 200),
    initialData: [],
  });
  const { data: journals, isLoading: loadingJournals } = useQuery({
    queryKey: ['journals'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date', 200),
    initialData: [],
  });
  const { data: archived, isLoading: loadingArchived } = useQuery({
    queryKey: ['archivedStreaks'],
    queryFn: () => base44.entities.ArchivedStreak.list('-created_date', 100),
    initialData: [],
  });

  const loading = loadingProfile || loadingUrges || loadingJournals || loadingArchived;

  const header = (
    <div className="flex items-center gap-2">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          Advanced Analytics
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">Elite</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Long-term trends, correlations & milestones.</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-5 space-y-4">
        {header}
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  const safeUrges = urges || [];
  const safeJournals = journals || [];
  const safeArchived = archived || [];
  const currentDays = daysSince(profile?.streak_start_date);
  const bestArchived = Math.max(0, ...safeArchived.map(s => s.duration_days || 0));
  const stats = triggerStats(safeUrges);
  const totalResisted = Math.max(
    profile?.total_urges_resisted || 0,
    safeUrges.filter(u => u.outcome === 'resisted').length
  );
  const hasData = safeUrges.length > 0 || safeJournals.length > 0 || safeArchived.length > 0 || currentDays > 0;

  if (!hasData) {
    return (
      <div className="p-5 space-y-5">
        {header}
        <div className="bg-card rounded-2xl border border-border p-8 text-center space-y-3">
          <Sparkles className="w-6 h-6 text-primary mx-auto" />
          <p className="text-sm font-medium">Your analytics will appear here</p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Log daily check-ins, urges, and reflections — your long-term trends, trigger correlations, and milestones
            will build up automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      {header}

      <section className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Long-term trends</p>
        <WeeklyVolumeChart urges={safeUrges} />
        <WeeklyMoodChart journals={safeJournals} />
        <StreakHistoryChart archived={safeArchived} currentDays={currentDays} />
      </section>

      <section className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Trigger correlations</p>
        <TriggerOutcomeList stats={stats} />
        <TriggerTimeMatrix stats={stats} />
      </section>

      <section className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Milestones</p>
        <MilestoneAchievements
          currentDays={currentDays}
          bestArchivedDays={bestArchived}
          totalResisted={totalResisted}
          archivedCount={safeArchived.length}
        />
      </section>
    </div>
  );
}