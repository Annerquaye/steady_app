import { format } from 'date-fns';

export const MOOD_SCORES = { great: 5, good: 4, neutral: 3, low: 2, terrible: 1 };

export const TIME_BUCKETS = ['Morning', 'Afternoon', 'Evening', 'Night'];

export function timeBucket(dateStr) {
  const h = new Date(dateStr).getHours();
  if (h >= 5 && h < 12) return 'Morning';
  if (h >= 12 && h < 17) return 'Afternoon';
  if (h >= 17 && h < 22) return 'Evening';
  return 'Night';
}

// Buckets items into the last `weeks` rolling 7-day windows (oldest → newest)
export function weekBuckets(items, weeks = 12, dateKey = 'created_date') {
  const now = new Date();
  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7, 23, 59, 59);
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6, 0, 0, 0);
    out.push({
      label: format(start, 'MMM d'),
      items: (items || []).filter(it => {
        const t = new Date(it[dateKey]).getTime();
        return t >= start.getTime() && t <= end.getTime();
      }),
    });
  }
  return out;
}

export function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
}

// Per-trigger aggregation: totals, outcomes, intensity, and time-of-day spread
export function triggerStats(urges) {
  const map = {};
  (urges || []).forEach(u => {
    const t = (u.trigger || '').trim();
    if (!t) return;
    if (!map[t]) {
      map[t] = { trigger: t, total: 0, resisted: 0, relapsed: 0, intensitySum: 0, intensityCount: 0, byTime: { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 } };
    }
    const s = map[t];
    s.total += 1;
    if (u.outcome === 'resisted') s.resisted += 1;
    if (u.outcome === 'relapsed') s.relapsed += 1;
    if (typeof u.intensity === 'number') {
      s.intensitySum += u.intensity;
      s.intensityCount += 1;
    }
    s.byTime[timeBucket(u.created_date)] += 1;
  });
  return Object.values(map)
    .map(s => ({
      ...s,
      resistRate: s.total ? Math.round((s.resisted / s.total) * 100) : 0,
      avgIntensity: s.intensityCount ? +(s.intensitySum / s.intensityCount).toFixed(1) : null,
    }))
    .sort((a, b) => b.total - a.total);
}