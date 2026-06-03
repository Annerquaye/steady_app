import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import StreakCard from '@/components/dashboard/StreakCard';
import StatsGrid from '@/components/dashboard/StatsGrid';
import DailyMessage from '@/components/dashboard/DailyMessage';
import TriggerInsights from '@/components/dashboard/TriggerInsights';
import MoodTrend from '@/components/dashboard/MoodTrend';
import UrgeFrequencyChart from '@/components/dashboard/UrgeFrequencyChart';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, FileText } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: profiles, isLoading: loadingProfile } = useQuery({
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
    if (!loadingProfile && !profile) {
      navigate('/onboarding');
    }
  }, [loadingProfile, profile, navigate]);

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

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-heading font-bold">Your recovery</h1>
        <p className="text-sm text-muted-foreground mt-0.5">One day at a time.</p>
      </div>

      <StreakCard streakStartDate={profile.streak_start_date} />
      <StatsGrid profile={profile} urges={urges} />
      <DailyMessage />
      <MoodTrend journals={journals} />
      <UrgeFrequencyChart urges={urges} />
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