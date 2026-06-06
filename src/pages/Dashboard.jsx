import React, { useState, useRef } from 'react';
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
import { BarChart3, FileText } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const touchStartX = useRef(null);
  const containerRef = useRef(null);

  const { data: profiles, isLoading: loadingProfile, isFetched: profileFetched, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list(),
    initialData: [],
    staleTime: 0,
  });

  const profile = profiles[0];

  const { data: urges, refetch: refetchUrges } = useQuery({
    queryKey: ['urges'],
    queryFn: () => base44.entities.UrgeLog.list('-created_date', 100),
    initialData: [],
    staleTime: 0,
  });

  const { data: journals, refetch: refetchJournals } = useQuery({
    queryKey: ['journals'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date', 100),
    initialData: [],
    staleTime: 0,
  });

  // Refetch data whenever switching to Trends or Insights tabs
  React.useEffect(() => {
    if (page > 0) {
      refetchUrges();
      refetchJournals();
      refetchProfile();
    }
  }, [page]);

  React.useEffect(() => {
    if (profileFetched && !profile) {
      navigate('/onboarding');
    }
  }, [profileFetched, profile, navigate]);

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

  const pages = [
    {
      label: 'Progress',
      content: (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-heading font-bold">Your recovery</h1>
            <p className="text-sm text-muted-foreground mt-0.5">One day at a time.</p>
          </div>
          <ProgressCard profile={profile} urges={urges} />
          <DailyCheckIn alreadyDoneToday={alreadyDoneToday} />
          <DailyMessage />
        </div>
      ),
    },
    {
      label: 'Trends',
      content: (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-heading font-bold">Your trends</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track patterns over time.</p>
          </div>
          <MoodTrend journals={journals} />
          <UrgeFrequencyChart urges={urges} />
        </div>
      ),
    },
    {
      label: 'Insights',
      content: (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-heading font-bold">Insights</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Milestones & triggers.</p>
          </div>
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
      ),
    },
  ];

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && page < pages.length - 1) setPage(p => p + 1);
      if (diff < 0 && page > 0) setPage(p => p - 1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tab navigation bar */}
      <div className="flex items-center border-b border-border bg-background flex-shrink-0 px-4 pt-2">
        {pages.map((p, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`flex-1 pb-2.5 text-sm font-medium transition-colors relative ${
              i === page ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {p.label}
            {i === page && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Swipe hint on first load */}
      {page === 0 && (
        <div className="flex items-center justify-end gap-1 px-5 pt-2 pb-0 flex-shrink-0">
          <span className="text-[11px] text-muted-foreground">Swipe to explore</span>
          <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}

      {/* Sliding pages */}
      <div className="overflow-hidden flex-1">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${page * 100}%)`, width: `${pages.length * 100}%` }}
        >
          {pages.map((p, i) => (
            <div
              key={i}
              className="overflow-y-auto px-5 py-4 pb-8"
              style={{ width: `${100 / pages.length}%` }}
            >
              {p.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}