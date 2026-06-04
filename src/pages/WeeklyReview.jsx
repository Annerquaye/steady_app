import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { subDays, differenceInDays, format } from 'date-fns';
import { BarChart3, Loader2, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PageHeader from '@/components/layout/PageHeader';

export default function WeeklyReview() {
  const [report, setReport] = useState(null);
  const [generating, setGenerating] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list(),
    initialData: [],
  });

  const { data: urges } = useQuery({
    queryKey: ['urges'],
    queryFn: () => base44.entities.UrgeLog.list('-created_date', 50),
    initialData: [],
  });

  const { data: journals } = useQuery({
    queryKey: ['journals'],
    queryFn: () => base44.entities.JournalEntry.list('-created_date', 30),
    initialData: [],
  });

  const { data: relapses } = useQuery({
    queryKey: ['relapses'],
    queryFn: () => base44.entities.RelapseLog.list('-created_date', 10),
    initialData: [],
  });

  const profile = profiles[0];

  const generateReport = async () => {
    setGenerating(true);
    const weekAgo = subDays(new Date(), 7);
    const weekUrges = urges.filter(u => new Date(u.created_date) >= weekAgo);
    const weekJournals = journals.filter(j => new Date(j.created_date) >= weekAgo);
    const weekRelapses = relapses.filter(r => new Date(r.created_date) >= weekAgo);

    const streakDays = profile?.streak_start_date
      ? differenceInDays(new Date(), new Date(profile.streak_start_date))
      : 0;

    const prompt = `Generate a weekly recovery report for someone quitting porn. Be warm, practical, and encouraging. Never shame.

Data for this week:
- Days clean this week: ${Math.min(7, streakDays)}
- Total streak: ${streakDays} days
- Urges this week: ${weekUrges.length} (${weekUrges.filter(u => u.outcome === 'resisted').length} resisted, ${weekUrges.filter(u => u.outcome === 'relapsed').length} led to relapse)
- Top triggers: ${[...new Set(weekUrges.map(u => u.trigger).filter(Boolean))].join(', ') || 'none logged'}
- Interventions used: ${[...new Set(weekUrges.map(u => u.intervention_used).filter(Boolean))].join(', ') || 'none'}
- Relapses logged: ${weekRelapses.length}
- Journal entries: ${weekJournals.length}
- Mood trend: ${weekJournals.map(j => j.mood).join(', ') || 'not tracked'}
- User's vulnerable times: ${profile?.vulnerable_times?.join(', ') || 'not set'}
- User's goals: ${profile?.goals?.join(', ') || 'not set'}

Format the report with these sections using markdown:
## This Week's Summary
## Wins & Progress
## Patterns & Insights
## Risk Windows for Next Week
## One Practical Recommendation

Keep it concise but insightful. Reference their specific data.`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setReport(response);
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <PageHeader title="Weekly Review" />
    <div className="p-6 space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">
          {format(subDays(new Date(), 7), 'MMM d')} — {format(new Date(), 'MMM d, yyyy')}
        </p>
      </div>

      {!report ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold">Ready for your review?</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Your AI coach will analyze your week and give you personalized insights.
            </p>
          </div>
          <Button onClick={generateReport} disabled={generating} className="gap-2">
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing your week...</>
            ) : (
              <><Calendar className="w-4 h-4" /> Generate report</>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="prose prose-sm prose-slate max-w-none text-sm leading-relaxed [&>h2]:text-base [&>h2]:font-heading [&>h2]:font-semibold [&>h2]:mt-6 [&>h2]:mb-2 [&>h2:first-child]:mt-0">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </div>
          <Button variant="outline" onClick={() => setReport(null)} className="w-full">
            Generate new report
          </Button>
        </div>
      )}
    </div>
    </div>
  );
}