import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const DAY_MS = 86400000;

// Current streak, best streak and total clean days across all streaks.
// A reset never erases the clean days someone has already earned.
export function useStreakTotals(profile) {
  const { data: archived = [] } = useQuery({
    queryKey: ['archivedStreaks'],
    queryFn: () => base44.entities.ArchivedStreak.list('-created_date', 200),
    enabled: !!profile,
    initialData: [],
  });

  const start = profile?.streak_start_date ? new Date(profile.streak_start_date) : new Date();
  const currentExact = Math.max(0, (Date.now() - start.getTime()) / DAY_MS);
  const currentDays = Math.floor(currentExact);
  const pastDays = archived.reduce((sum, s) => sum + (Number(s.duration_days) || 0), 0);
  const bestPast = archived.reduce((max, s) => Math.max(max, Number(s.duration_days) || 0), 0);

  return {
    currentDays,
    currentExact,
    bestDays: Math.max(bestPast, currentDays),
    bestPast,
    totalCleanDays: pastDays + currentDays,
    totalCleanExact: pastDays + currentExact,
    resets: archived.length,
  };
}
