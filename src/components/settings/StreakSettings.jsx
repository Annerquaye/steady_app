import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Flame, RotateCcw, CalendarDays } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useStreakTotals } from '@/hooks/useStreakTotals';

const toDateInput = (iso) => {
  try { return format(iso ? new Date(iso) : new Date(), 'yyyy-MM-dd'); } catch { return ''; }
};

// Counters only change here or by logging urges and relapses. Every reset asks first.
export default function StreakSettings({ profile, updateProfile }) {
  const queryClient = useQueryClient();
  const { resets, totalCleanDays } = useStreakTotals(profile);
  const [startDate, setStartDate] = useState(toDateInput(profile?.streak_start_date));
  const [pending, setPending] = useState(null); // which reset is awaiting confirmation
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  if (!profile) return null;

  const today = toDateInput();
  const startChanged = startDate && startDate !== toDateInput(profile.streak_start_date);

  const ACTIONS = {
    relapses: {
      title: 'Reset relapse count?',
      body: `Your relapse count goes from ${profile.total_relapses || 0} back to 0. Your streak and journal are not affected.`,
      run: async () => updateProfile({ total_relapses: 0 }),
      done: 'Relapse count reset.',
    },
    urges: {
      title: 'Reset urges beaten?',
      body: `Your all-time "urges beaten" total goes from ${profile.total_urges_resisted || 0} back to 0. Your urge log is kept.`,
      run: async () => updateProfile({ total_urges_resisted: 0 }),
      done: 'Urges beaten reset.',
    },
    history: {
      title: 'Clear streak history?',
      body: `This permanently deletes ${resets} past streak${resets === 1 ? '' : 's'}. Your best streak and total clean days will only count your current streak. This can't be undone.`,
      run: async () => {
        const archived = await base44.entities.ArchivedStreak.list('-created_date', 500);
        await Promise.all(archived.map((s) => base44.entities.ArchivedStreak.delete(s.id)));
        queryClient.invalidateQueries({ queryKey: ['archivedStreaks'] });
      },
      done: 'Streak history cleared.',
    },
    start: {
      title: 'Change your streak start date?',
      body: `Your current streak will count from ${startDate ? format(new Date(`${startDate}T00:00:00`), 'd MMM yyyy') : ''}. Use this if you were clean before you joined, or to correct a mistake.`,
      run: async () => updateProfile({ streak_start_date: new Date(`${startDate}T00:00:00`).toISOString() }),
      done: 'Streak start date updated.',
    },
  };

  const confirm = async () => {
    const action = ACTIONS[pending];
    if (!action) return;
    setBusy(true);
    try {
      await action.run();
      setMessage(action.done);
    } catch {
      setMessage("That didn't save. Check your connection and try again.");
    }
    setBusy(false);
    setPending(null);
  };

  const Row = ({ label, value, actionLabel, onAction, disabled }) => (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground tabular">{value}</p>
      </div>
      <Button variant="outline" size="sm" className="shrink-0 rounded-full" onClick={onAction} disabled={disabled}>
        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />{actionLabel}
      </Button>
    </div>
  );

  return (
    <section className="bg-card rounded-2xl border border-border/60 shadow-soft p-5" aria-labelledby="streak-settings-title">
      <div className="flex items-center gap-3 mb-1">
        <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
          <Flame className="w-[18px] h-[18px]" />
        </span>
        <div>
          <h3 id="streak-settings-title" className="text-sm font-semibold">Streak & counters</h3>
          <p className="text-xs text-muted-foreground">Counts go up automatically. Resets only happen here.</p>
        </div>
      </div>

      {/* Streak start date */}
      <div className="py-3 border-b border-border/60">
        <label htmlFor="streak-start" className="text-sm font-medium flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-muted-foreground" /> Current streak started
        </label>
        <div className="mt-2 flex gap-2">
          <Input id="streak-start" type="date" max={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1" />
          <Button size="sm" className="rounded-full h-10 px-4" disabled={!startChanged || startDate > today} onClick={() => setPending('start')}>Save</Button>
        </div>
      </div>

      <div className="divide-y divide-border/60">
        <Row
          label="Relapses logged"
          value={`${profile.total_relapses || 0} total`}
          actionLabel="Reset"
          onAction={() => setPending('relapses')}
          disabled={!profile.total_relapses}
        />
        <Row
          label="Urges beaten"
          value={`${profile.total_urges_resisted || 0} all time`}
          actionLabel="Reset"
          onAction={() => setPending('urges')}
          disabled={!profile.total_urges_resisted}
        />
        <Row
          label="Streak history"
          value={`${resets} past streak${resets === 1 ? '' : 's'} · ${totalCleanDays} clean days in total`}
          actionLabel="Clear"
          onAction={() => setPending('history')}
          disabled={resets === 0}
        />
        <div className="flex items-center justify-between gap-4 pt-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">Reset "urges beaten" after a relapse</p>
            <p className="text-xs text-muted-foreground">Off: the total keeps counting up for good</p>
          </div>
          <Switch
            className="shrink-0"
            aria-label='Reset "urges beaten" after a relapse'
            checked={!!profile.reset_urges_on_relapse}
            onCheckedChange={(v) => updateProfile({ reset_urges_on_relapse: v })}
          />
        </div>
      </div>

      {message && <p className="mt-3 text-xs font-medium text-primary" role="status">{message}</p>}

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && !busy && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ACTIONS[pending]?.title}</AlertDialogTitle>
            <AlertDialogDescription>{ACTIONS[pending]?.body}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => { e.preventDefault(); confirm(); }}
              className={pending === 'history' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
            >
              {busy ? 'Saving...' : pending === 'history' ? 'Delete history' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
