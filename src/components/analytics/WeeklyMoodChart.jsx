import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MOOD_SCORES, weekBuckets } from '@/lib/analyticsUtils';

const MOOD_LABELS = { 5: 'Great', 4: 'Good', 3: 'Neutral', 2: 'Low', 1: 'Terrible' };

// Long-term trend: weekly average mood from journal check-ins
export default function WeeklyMoodChart({ journals, weeks = 12 }) {
  const data = weekBuckets(journals, weeks).map(w => {
    const scores = w.items.map(j => MOOD_SCORES[j.mood]).filter(Boolean);
    return {
      label: w.label,
      Mood: scores.length ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null,
    };
  });

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mood over time</p>
        <span className="text-[10px] text-muted-foreground">weekly average</span>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" interval={1} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={22} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid hsl(var(--border))' }}
              formatter={(v) => (v == null ? '—' : `${v} · ${MOOD_LABELS[Math.round(v)] || ''}`)}
            />
            <Line type="monotone" dataKey="Mood" stroke="hsl(var(--chart-2))" strokeWidth={2.5} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}