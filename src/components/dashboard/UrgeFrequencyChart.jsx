import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { subDays, format, isAfter } from 'date-fns';

export default function UrgeFrequencyChart({ urges }) {
  const last30 = subDays(new Date(), 30);

  // Build a map of day -> { resisted, relapsed }
  const dayMap = {};
  for (let i = 29; i >= 0; i--) {
    const key = format(subDays(new Date(), i), 'MMM d');
    dayMap[key] = { day: key, resisted: 0, relapsed: 0 };
  }

  urges
    .filter(u => isAfter(new Date(u.created_date), last30))
    .forEach(u => {
      const key = format(new Date(u.created_date), 'MMM d');
      if (dayMap[key]) {
        if (u.outcome === 'resisted') dayMap[key].resisted += 1;
        else if (u.outcome === 'relapsed') dayMap[key].relapsed += 1;
      }
    });

  // Condense into weekly buckets for readability
  const allDays = Object.values(dayMap);
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    const chunk = allDays.slice(i, i + 7);
    weeks.push({
      week: chunk[0].day,
      resisted: chunk.reduce((s, d) => s + d.resisted, 0),
      relapsed: chunk.reduce((s, d) => s + d.relapsed, 0),
    });
  }

  const total = urges.filter(u => isAfter(new Date(u.created_date), last30)).length;
  const resisted = urges.filter(u => isAfter(new Date(u.created_date), last30) && u.outcome === 'resisted').length;

  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold">Urge frequency</h3>
        <span className="text-xs text-muted-foreground">Last 30 days</span>
      </div>
      {total > 0 && (
        <p className="text-xs text-muted-foreground mb-4">
          {resisted} of {total} urges resisted ({Math.round((resisted / total) * 100)}%)
        </p>
      )}
      {total === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No urge data yet. Use Urge Mode to start tracking.</p>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeks} barGap={4} margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
            <XAxis dataKey="week" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} minTickGap={15} />
            <YAxis hide allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              formatter={(val, name) => [val, name === 'resisted' ? '✅ Resisted' : '❌ Relapsed']}
            />
            <Bar dataKey="resisted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="relapsed" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      )}
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
          <span className="text-xs text-muted-foreground">Resisted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-destructive" />
          <span className="text-xs text-muted-foreground">Relapsed</span>
        </div>
      </div>
    </div>
  );
}