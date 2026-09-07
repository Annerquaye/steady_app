import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
} from 'recharts';

const TIME_BUCKETS = [
  { label: 'Morning', match: h => h >= 5 && h < 12 },
  { label: 'Afternoon', match: h => h >= 12 && h < 17 },
  { label: 'Evening', match: h => h >= 17 && h < 22 },
  { label: 'Night', match: h => h >= 22 || h < 5 },
];

export default function AdvancedAnalytics({ urges }) {
  const safeUrges = urges || [];

  const timeData = TIME_BUCKETS.map(b => ({
    time: b.label,
    urges: safeUrges.filter(u => b.match(new Date(u.created_date).getHours())).length,
  }));

  const intensityData = safeUrges
    .filter(u => typeof u.intensity === 'number')
    .reduce((acc, u) => {
      const day = new Date(u.created_date).toISOString().slice(0, 10);
      const entry = acc.find(d => d.day === day);
      if (entry) {
        entry.sum += u.intensity;
        entry.count += 1;
      } else {
        acc.push({ day, sum: u.intensity, count: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-14)
    .map(d => ({ day: d.day.slice(5), intensity: +(d.sum / d.count).toFixed(1) }));

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Deep Analytics</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">Elite</span>
      </div>

      {safeUrges.length === 0 ? (
        <p className="text-xs text-muted-foreground">Log a few urges to unlock deep behavioral patterns.</p>
      ) : (
        <>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Urges by time of day</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData}>
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={22} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="urges" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {intensityData.length > 1 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Urge intensity trend (avg per day)</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={intensityData}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={22} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid hsl(var(--border))' }} />
                    <Line type="monotone" dataKey="intensity" stroke="hsl(var(--chart-2))" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}