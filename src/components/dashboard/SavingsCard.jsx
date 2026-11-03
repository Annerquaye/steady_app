import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Wallet, Pencil, PiggyBank } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStreakTotals } from '@/hooks/useStreakTotals';

const CURRENCIES = ['USD', 'GHS', 'NGN', 'KES', 'ZAR', 'GBP', 'EUR', 'CAD', 'AUD', 'INR'];

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

function formatTime(minutes) {
  const total = Math.round(minutes);
  const days = Math.floor(total / 1440);
  const hours = Math.floor((total % 1440) / 60);
  const mins = total % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function guessCurrency() {
  try {
    const region = (navigator.language || '').split('-')[1];
    const map = { US: 'USD', GH: 'GHS', NG: 'NGN', KE: 'KES', ZA: 'ZAR', GB: 'GBP', CA: 'CAD', AU: 'AUD', IN: 'INR' };
    return map[region] || 'USD';
  } catch {
    return 'USD';
  }
}

// Shows how much time and money the user has saved over all their clean days.
export default function SavingsCard({ profile }) {
  const queryClient = useQueryClient();
  const { totalCleanExact } = useStreakTotals(profile);
  const hasCosts = (profile?.cost_minutes_per_day || 0) > 0 || (profile?.cost_money_per_day || 0) > 0;
  const [editing, setEditing] = useState(false);
  const [minutes, setMinutes] = useState(profile?.cost_minutes_per_day ?? '');
  const [money, setMoney] = useState(profile?.cost_money_per_day ?? '');
  const [currency, setCurrency] = useState(profile?.cost_currency || guessCurrency());

  const save = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['userProfile'], (old) =>
        Array.isArray(old) ? old.map((p) => (p.id === profile.id ? { ...p, ...updated } : p)) : old
      );
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setEditing(false);
    },
  });

  if (!profile) return null;

  if (!hasCosts || editing) {
    const canSave = Number(minutes) > 0 || Number(money) > 0;
    return (
      <section className="bg-card rounded-2xl border border-border/60 shadow-soft p-5">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-9 h-9 rounded-xl bg-accent/10 text-accent grid place-items-center shrink-0">
            <PiggyBank className="w-[18px] h-[18px]" />
          </span>
          <div>
            <h2 className="text-sm font-bold">See what you're winning back</h2>
            <p className="text-xs text-muted-foreground">Roughly what did this habit cost you on a typical day?</p>
          </div>
        </div>
        <form
          className="mt-4 grid grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSave) return;
            save.mutate({
              cost_minutes_per_day: Number(minutes) || 0,
              cost_money_per_day: Number(money) || 0,
              cost_currency: currency,
            });
          }}
        >
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Time (minutes/day)</span>
            <Input id="cost-minutes" type="number" inputMode="numeric" min="0" placeholder="90" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Money (per day)</span>
            <div className="flex gap-1.5">
              <select
                id="cost-currency"
                aria-label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-2 text-sm"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <Input id="cost-money" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0" value={money} onChange={(e) => setMoney(e.target.value)} className="min-w-0" />
            </div>
          </label>
          <div className="col-span-2 flex gap-2 justify-end">
            {editing && <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>}
            <Button type="submit" disabled={!canSave || save.isPending}>{save.isPending ? 'Saving...' : 'Start counting'}</Button>
          </div>
          {save.isError && <p className="col-span-2 text-xs text-destructive">Couldn't save that. Check your connection and try again.</p>}
        </form>
      </section>
    );
  }

  const timeSaved = (profile.cost_minutes_per_day || 0) * totalCleanExact;
  const moneySaved = (profile.cost_money_per_day || 0) * totalCleanExact;

  return (
    <section className="bg-card rounded-2xl border border-border/60 shadow-soft p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold">What you've won back</h2>
        <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {profile.cost_minutes_per_day > 0 && (
          <div className="rounded-xl bg-primary/5 p-3.5">
            <Clock className="w-4 h-4 text-primary mb-2" />
            <div className="text-2xl font-heading font-bold tabular">{formatTime(timeSaved)}</div>
            <div className="text-xs text-muted-foreground">Time saved</div>
          </div>
        )}
        {profile.cost_money_per_day > 0 && (
          <div className="rounded-xl bg-accent/10 p-3.5">
            <Wallet className="w-4 h-4 text-accent mb-2" />
            <div className="text-2xl font-heading font-bold tabular">{formatMoney(moneySaved, profile.cost_currency || 'USD')}</div>
            <div className="text-xs text-muted-foreground">Money saved</div>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Counted across all your clean days, including past streaks.</p>
    </section>
  );
}
