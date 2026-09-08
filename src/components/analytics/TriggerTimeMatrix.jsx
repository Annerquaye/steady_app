import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { TIME_BUCKETS } from '@/lib/analyticsUtils';

const SERIES_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

// Trigger correlation: when each top trigger strikes, by time of day
export default function TriggerTimeMatrix({ stats }) {
  const top = stats.slice(0, 4);
  const data = TIME_BUCKETS.map(t => {
    const row = { time: t };
    top.forEach(s => { row[s.trigger] = s.byTime[t] || 0; });
    return row;
  });

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Triggers × time of day</p>
        {top.length > 0 && <span className="text-[10px] text-muted-foreground">top {top.length}</span>}
      </div>
      {top.length === 0 ? (
        <p className="text-xs text-muted-foreground">Log urges with triggers to see when they strike.</p>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={22} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid hsl(var(--border))' }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {top.map((s, i) => (
                <Bar key={s.trigger} dataKey={s.trigger} fill={SERIES_COLORS[i]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}