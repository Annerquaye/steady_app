import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function RecoveryPlan() {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list(),
    initialData: [],
  });
  const profile = profiles[0];

  const generate = async () => {
    if (!profile || generating) return;
    setGenerating(true);
    setError('');
    try {
      const streakDays = profile.streak_start_date
        ? Math.floor((Date.now() - new Date(profile.streak_start_date)) / 86400000)
        : 0;
      const prompt = `You are creating a personalized recovery plan for someone quitting pornography addiction.

Their context:
- Reason for quitting: ${profile.reason_for_quitting || 'not specified'}
- Main triggers: ${(profile.triggers || []).join(', ') || 'not specified'}
- Most vulnerable times: ${(profile.vulnerable_times || []).join(', ') || 'not specified'}
- Goals: ${(profile.goals || []).join(', ') || 'not specified'}
- Current streak: ${streakDays} days

Write a warm, practical, non-shaming recovery plan in markdown with exactly these sections:
## My Why
## Daily Routine
## Trigger Strategies
(For each of their main triggers, one concrete counter-move)
## Warning Signs
(their personal early-relapse signals, based on their vulnerable times)
## Weekly Focus
(one specific focus for the next 7 days)
## Milestone Goals

Keep each section short and actionable. No religious language, no moralizing, no guilt.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      const planText = typeof res === 'string' ? res : String(res);
      await base44.entities.UserProfile.update(profile.id, {
        recovery_plan: planText,
        recovery_plan_updated: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    } catch (e) {
      setError('Could not generate your plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-sm text-muted-foreground">Complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-10">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl font-heading font-bold">My Recovery Plan</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">Elite</span>
          </div>
          <p className="text-sm text-muted-foreground">Personalized to your triggers, goals, and journey.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generate}
          disabled={generating}
          className="gap-2 flex-shrink-0"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {profile.recovery_plan ? 'Regenerate' : 'Generate'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      {generating && !profile.recovery_plan && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      )}

      {profile.recovery_plan ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="prose prose-sm prose-slate max-w-none text-sm leading-relaxed [&>*:first-child]:mt-0">
            <ReactMarkdown>{profile.recovery_plan}</ReactMarkdown>
          </div>
        </div>
      ) : !generating ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium mb-1">No plan yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            Generate a plan built from your triggers, goals, and history.
          </p>
          <Button onClick={generate} disabled={generating} className="gap-2">
            <Sparkles className="w-4 h-4" /> Create my plan
          </Button>
        </div>
      ) : null}
    </div>
  );
}