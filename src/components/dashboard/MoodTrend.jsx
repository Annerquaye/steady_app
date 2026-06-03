import React from 'react';
import { TrendingUp } from 'lucide-react';

const moodValues = { terrible: 1, low: 2, neutral: 3, good: 4, great: 5 };
const moodEmojis = { terrible: '😞', low: '😔', neutral: '😐', good: '🙂', great: '😊' };

export default function MoodTrend({ journals }) {
  const recent = journals.slice(0, 7).reverse();

  if (recent.length === 0) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-chart-2" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mood trend</span>
        </div>
        <p className="text-sm text-muted-foreground">Start journaling to see your mood trend.</p>
      </div>
    );
  }

  const avgMood = recent.reduce((sum, j) => sum + (moodValues[j.mood] || 3), 0) / recent.length;
  const maxH = 32;

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-chart-2" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mood trend</span>
        <span className="ml-auto text-xs text-muted-foreground">Avg: {moodEmojis[Object.keys(moodValues).find(k => moodValues[k] === Math.round(avgMood))] || '😐'}</span>
      </div>
      <div className="flex items-end gap-1 h-10">
        {recent.map((j, i) => {
          const val = moodValues[j.mood] || 3;
          const h = (val / 5) * maxH;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm bg-primary/30 transition-all"
                style={{ height: `${h}px` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}