import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { format } from 'date-fns';

// Long-term trend: every past streak + the current one, by duration
export default function StreakHistoryChart({ archived, currentDays }) {
  const history = (archived || [])
    .slice()
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .map(s => ({
      label: s.start_date ? format(new Date(s.start_date), 'MMM d') : 'Past',
      Days: s.duration_days || 0,
    }));
  const data = [...history, { label: 'Current', Days: currentDays || 0 }];
  const best = Math.max(0, ...data.map(d => d.Days || 0));

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Streak history</p>
        <span className="text-[10px] text-muted-foreground">best: {best} days</span>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" interval={0} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={22} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid hsl(var(--border))' }} />
            <Bar dataKey="Days" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={i === data.length - 1 ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}