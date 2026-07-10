import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

export default function TriggerInsights({ urges, profile }) {
  // Count trigger frequency
  const triggerCounts = {};
  urges.forEach(u => {
    if (u.trigger) {
      triggerCounts[u.trigger] = (triggerCounts[u.trigger] || 0) + 1;
    }
  });
  const topTriggers = Object.entries(triggerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const nextVulnerableTime = profile?.vulnerable_times?.[0] || null;

  return (
    <div className="space-y-3">
      {topTriggers.length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top triggers</span>
          </div>
          <div className="space-y-2">
            {topTriggers.map(([trigger, count]) => (
              <div key={trigger} className="flex items-center justify-between gap-3">
                <span className="text-sm truncate">{trigger}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="h-2 rounded-full bg-primary/15 w-20 sm:w-24">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(count / Math.max(...Object.values(triggerCounts))) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-right">{count}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nextVulnerableTime && (
        <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-destructive" />
            <span className="text-xs font-medium text-destructive/80 uppercase tracking-wider">Next vulnerable window</span>
          </div>
          <p className="text-sm mt-2 text-foreground/80">{nextVulnerableTime}</p>
          <p className="text-xs text-muted-foreground mt-1">Plan ahead. Have your interventions ready.</p>
        </div>
      )}
    </div>
  );
}