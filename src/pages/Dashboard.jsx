import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ProgressCard from '@/components/dashboard/ProgressCard';
import DailyCheckIn from '@/components/dashboard/DailyCheckIn';
import DailyMessage from '@/components/dashboard/DailyMessage';
import TriggerInsights from '@/components/dashboard/TriggerInsights';
import MilestoneTracker from '@/components/dashboard/MilestoneTracker';
import MoodTrend from '@/components/dashboard/MoodTrend';
import UrgeFrequencyChart from '@/components/dashboard/UrgeFrequencyChart';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, FileText } from 'lucide-react';
import { dummyProfile, dummyUrges, dummyJournals } from '@/components/dashboard/screenshotDummyData';

// ╔══════════════════════════════════════════════════════╗
// ║  SCREENSHOT DUMMY DATA — set to false after capturing ║
// ╚══════════════════════════════════════════════════════╝
const USE_DUMMY_DATA = true;

export default function Dashboard() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const touchStartX = useRef(null);

  const { data: profiles, isLoading: loadingProfile, isFetched: profileFetched } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list(),
    initialData: USE_DUMMY_DATA ? [dummyProfile] : [],
    staleTime: 0,
    enabled: !USE_DUMMY_DATA,
  });

  const profile = USE_DUMMY_DATA ? dummyProfile : profiles[0];

  const { data: urges, isLoading: loadingUrges } = useQuery({
    queryKey: ['urges'],
    queryFn: () => base44.entities.UrgeLog.list('-created_date', 100),
    enabled: !!profile && !USE_DUMMY_DATA,
    staleTime: 0,
  });

  const { data: journals, isLoading: loadingJournals } = useQuery({
    queryKey: ['journals'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date', 100),
    enabled: !!profile && !USE_DUMMY_DATA,
    staleTime: 0,
  });

  useEffect(() => {
    if (!USE_DUMMY_DATA && profileFetched && !profile) {
      navigate('/onboarding');
    }
  }, [profileFetched, profile, navigate, USE_DUMMY_DATA]);

  if (!USE_DUMMY_DATA && loadingProfile) {
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

  const alreadyDoneToday = USE_DUMMY_DATA ? true : (journals || []).some(j => {
    const d = new Date(j.created_date);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
  });

  const PAGE_LABELS = ['Progress', 'Trends', 'Insights'];

  const safeUrges = USE_DUMMY_DATA ? dummyUrges : (urges || []);
  const safeJournals = USE_DUMMY_DATA ? dummyJournals : (journals || []);
  // True while fetching OR before the fetch has started (data still undefined)
  const isLoadingData = USE_DUMMY_DATA ? false : (loadingUrges || loadingJournals || urges === undefined || journals === undefined);

  const renderPage = (i) => {
    if (i === 0) return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-heading font-bold">Your recovery</h1>
          <p className="text-sm text-muted-foreground mt-0.5">One day at a time.</p>
        </div>
        <ProgressCard profile={profile} urges={safeUrges} />
        <DailyCheckIn alreadyDoneToday={alreadyDoneToday} />
        <DailyMessage />
      </div>
    );
    if (i === 1) {
      if (isLoadingData) return (
        <div className="space-y-4 pt-4">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      );
      return (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-heading font-bold">Your trends</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track patterns over time.</p>
          </div>
          <MoodTrend journals={safeJournals} />
          <UrgeFrequencyChart urges={safeUrges} />
        </div>
      );
    }
    if (i === 2) {
      if (isLoadingData) return (
        <div className="space-y-4 pt-4">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      );
      return (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-heading font-bold">Insights</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Milestones & triggers.</p>
          </div>
          <MilestoneTracker profile={profile} urges={safeUrges} />
          <TriggerInsights urges={safeUrges} profile={profile} />
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
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && page < PAGE_LABELS.length - 1) setPage(p => p + 1);
      if (diff < 0 && page > 0) setPage(p => p - 1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="flex flex-col h-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tab navigation bar */}
      <div className="flex items-center border-b border-border bg-background flex-shrink-0 px-4 pt-2">
        {PAGE_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`flex-1 pb-2.5 text-sm font-medium transition-colors relative ${
              i === page ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {label}
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

      {/* Tab content */}
      <div className="overflow-y-auto flex-1 px-5 py-4 pb-8">
        {renderPage(page)}
      </div>
    </div>
  );
}