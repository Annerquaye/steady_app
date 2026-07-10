import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { subDays, format, isAfter } from 'date-fns';

const MOOD_SCORE = { terrible: 1, low: 2, neutral: 3, good: 4, great: 5 };
const MOOD_EMOJI = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😊' };

export default function MoodTrend({ journals }) {
  const last30 = subDays(new Date(), 30);

  const recent = journals.filter(j => isAfter(new Date(j.created_date), last30));

  if (recent.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold">Mood trend</h3>
          <span className="text-xs text-muted-foreground">Last 30 days</span>
        </div>
        <p className="text-xs text-muted-foreground py-4 text-center">No journal entries yet. Start journaling to see your mood trend.</p>
      </div>
    );
  }

  // Group by day and average mood
  const dayMap = {};
  recent.forEach(j => {
    const date = new Date(j.created_date);
    const key = format(date, 'MMM d');
    if (!dayMap[key]) dayMap[key] = { scores: [], ts: date.getTime() };
    dayMap[key].scores.push(MOOD_SCORE[j.mood] || 3);
  });

  const data = Object.entries(dayMap)
    .sort(([, a], [, b]) => a.ts - b.ts)
    .map(([day, { scores }]) => ({
      day,
      mood: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)),
    }));

  const avgMood = data.reduce((s, d) => s + d.mood, 0) / data.length;
  const avgEmoji = MOOD_EMOJI[Math.round(avgMood)];

  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold">Mood trend</h3>
        <span className="text-xs text-muted-foreground">Last 30 days</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Average mood: {avgEmoji} {['', 'Terrible', 'Low', 'Neutral', 'Good', 'Great'][Math.round(avgMood)]}
      </p>
      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={20} />
          <YAxis domain={[0.5, 5.5]} hide />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            formatter={(val) => [MOOD_EMOJI[Math.round(val)] + ' ' + ['', 'Terrible', 'Low', 'Neutral', 'Good', 'Great'][Math.round(val)], 'Mood']}
          />
          <Area type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#moodGrad)" dot={{ r: 3, fill: 'hsl(var(--primary))' }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}