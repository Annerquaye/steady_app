import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, X, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlan } from '@/lib/planAccess';

const SHOW_FOR_DAYS = 14;
const dismissKey = (id) => `recorva_checklist_dismissed_${id}`;

function readDismissed(id) {
  try { return localStorage.getItem(dismissKey(id)) === '1'; } catch { return false; }
}

// A short setup list for a user's first two weeks, so Home never feels empty
// and new users discover the tools that help most before they need them.
export default function FirstDaysChecklist({ profile, urges = [], journals = [] }) {
  const { hasFeature: can } = usePlan();
  const [dismissed, setDismissed] = useState(() => readDismissed(profile?.id));

  if (!profile || dismissed) return null;

  const created = profile.created_date ? new Date(profile.created_date) : new Date();
  const ageDays = (Date.now() - created.getTime()) / 86400000;
  if (ageDays > SHOW_FOR_DAYS) return null;

  const hasBlocklist = [profile.blocked_websites, profile.blocked_keywords, profile.high_risk_apps]
    .some((list) => Array.isArray(list) && list.length > 0);

  const items = [
    {
      id: 'checkin',
      title: "Do today's check-in",
      hint: 'Takes 30 seconds, just below',
      done: journals.length > 0,
      href: '#daily-checkin',
    },
    {
      id: 'reminder',
      title: 'Turn on a daily reminder',
      hint: 'A nudge at the time that suits you',
      done: !!profile.daily_reminder_enabled,
      to: '/settings',
    },
    can('urge_mode') && {
      id: 'urge',
      title: 'Try Urge Mode once',
      hint: 'Practise it before you need it',
      done: urges.length > 0,
      to: '/urge',
    },
    can('partner_tools') && {
      id: 'partner',
      title: 'Add an accountability partner',
      hint: 'Someone in your corner',
      done: (profile.partners?.length || 0) > 0 || !!profile.accountability_partner_email,
      to: '/settings',
    },
    can('blocking') && {
      id: 'block',
      title: 'Block your first site or app',
      hint: 'Make slips harder to start',
      done: hasBlocklist,
      to: '/blocking',
    },
  ].filter(Boolean);

  const doneCount = items.filter((i) => i.done).length;
  if (doneCount === items.length) return null;

  const dismiss = () => {
    try { localStorage.setItem(dismissKey(profile.id), '1'); } catch { /* storage unavailable */ }
    setDismissed(true);
  };

  return (
    <section className="bg-card rounded-2xl border border-border/60 shadow-soft p-5" aria-labelledby="checklist-title">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <Rocket className="w-[18px] h-[18px]" />
          </span>
          <div>
            <h2 id="checklist-title" className="text-sm font-bold">Set up your recovery</h2>
            <p className="text-xs text-muted-foreground tabular">{doneCount} of {items.length} done</p>
          </div>
        </div>
        <button type="button" onClick={dismiss} aria-label="Hide setup checklist" className="w-8 h-8 -mr-1 -mt-1 rounded-full grid place-items-center text-muted-foreground hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(doneCount / items.length) * 100}%` }} />
      </div>

      <ul className="mt-3 divide-y divide-border/60">
        {items.map((item) => {
          const inner = (
            <>
              <span className={cn(
                'w-6 h-6 rounded-full grid place-items-center shrink-0 border-2',
                item.done ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
              )}>
                {item.done && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              </span>
              <span className="flex-1 min-w-0">
                <span className={cn('block text-sm font-medium', item.done && 'line-through text-muted-foreground')}>{item.title}</span>
                {!item.done && <span className="block text-xs text-muted-foreground">{item.hint}</span>}
              </span>
              {!item.done && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
            </>
          );
          const cls = 'flex items-center gap-3 py-2.5';
          if (item.done) return <li key={item.id} className={cls}>{inner}</li>;
          return (
            <li key={item.id}>
              {item.to
                ? <Link to={item.to} className={cn(cls, 'hover:opacity-80')}>{inner}</Link>
                : <a href={item.href} className={cn(cls, 'hover:opacity-80')}>{inner}</a>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
