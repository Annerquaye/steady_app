import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { weekBuckets } from '@/lib/analyticsUtils';

// Long-term trend: weekly urge volume vs. urges resisted
export default function WeeklyVolumeChart({ urges, weeks = 12 }) {
  const data = weekBuckets(urges, weeks).map(w => ({
    label: w.label,
    Urges: w.items.length,
    Resisted: w.items.filter(u => u.outcome === 'resisted').length,
  }));

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Urge volume vs. resisted</p>
        <span className="text-[10px] text-muted-foreground">last {weeks} weeks</span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="volUrges" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" interval={1} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={22} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid hsl(var(--border))' }} />
            <Area type="monotone" dataKey="Urges" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#volUrges)" />
            <Area type="monotone" dataKey="Resisted" stroke="hsl(var(--chart-3))" strokeWidth={2} fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-sm bg-[hsl(var(--chart-1))]" /> All urges
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-sm bg-[hsl(var(--chart-3))]" /> Resisted
        </span>
      </div>
    </div>
  );
}