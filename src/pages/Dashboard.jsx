import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ProgressCard from '@/components/dashboard/ProgressCard';
import DailyCheckIn from '@/components/dashboard/DailyCheckIn';
import DailyMessage from '@/components/dashboard/DailyMessage';
import TriggerInsights from '@/components/dashboard/TriggerInsights';
import MilestoneTracker from '@/components/dashboard/MilestoneTracker';
import MoodTrend from '@/components/dashboard/MoodTrend';
import UrgeFrequencyChart from '@/components/dashboard/UrgeFrequencyChart';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, FileText, RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading: loadingProfile, isFetched: profileFetched } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list(),
    initialData: [],
  });

  const profile = profiles[0];

  const { data: urges } = useQuery({
    queryKey: ['urges'],
    queryFn: () => base44.entities.UrgeLog.list('-created_date', 100),
    initialData: [],
  });

  const { data: journals } = useQuery({
    queryKey: ['journals'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date', 100),
    initialData: [],
  });

  React.useEffect(() => {
    if (profileFetched && !profile) {
      navigate('/onboarding');
    }
  }, [profileFetched, profile, navigate]);

  // Pull-to-refresh: invalidates all dashboard queries
  const handleRefresh = React.useCallback(() => {
    return queryClient.invalidateQueries();
  }, [queryClient]);

  const { pullDistance, refreshing } = usePullToRefresh(handleRefresh);

  if (loadingProfile) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  if (!profile) return null;

  const alreadyDoneToday = journals.some(j => {
    const d = new Date(j.created_date);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
  });

  return (
    <div className="p-6 space-y-5">
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || refreshing) && (
        <div
          className="flex items-center justify-center text-muted-foreground text-xs gap-2 transition-all"
          style={{ height: Math.min(pullDistance, 56), overflow: 'hidden' }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing…' : 'Pull to refresh'}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-heading font-bold">Your recovery</h1>
        <p className="text-sm text-muted-foreground mt-0.5">One day at a time.</p>
      </div>

      <ProgressCard profile={profile} urges={urges} />
      <DailyCheckIn alreadyDoneToday={alreadyDoneToday} />
      <DailyMessage />
      <MoodTrend journals={journals} />
      <UrgeFrequencyChart urges={urges} />
      <MilestoneTracker profile={profile} urges={urges} />
      <TriggerInsights urges={urges} profile={profile} />

      <div className="grid grid-cols-2 gap-3">
        <Link to="/review">
          <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-colors">
            <BarChart3 className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-medium">Weekly Review</p>
            <p className="text-xs text-muted-foreground">AI-powered insights</p>
          </div>
        </Link>
        <Link to="/relapse">
          <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-colors">
            <FileText className="w-5 h-5 text-accent mb-2" />
            <p className="text-sm font-medium">Log Relapse</p>
            <p className="text-xs text-muted-foreground">Reflect & learn</p>
          </div>
        </Link>
      </div>
    </div>
  );
}