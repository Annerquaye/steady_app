import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Share2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStreakTotals } from '@/hooks/useStreakTotals';

const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365];

const MESSAGES = {
  1: 'The first day is the hardest one. You did it.',
  3: 'Three days. Your brain is already starting to adjust.',
  7: 'A full week. This is real momentum.',
  14: 'Two weeks clean. The fog is lifting.',
  30: 'One month. You are becoming someone new.',
  60: 'Two months. This is who you are now.',
  90: 'Ninety days. A milestone many people never reach.',
  180: 'Half a year of choosing yourself.',
  365: 'One full year. Extraordinary.',
};

const label = (m) => (m === 1 ? '1 day' : m === 365 ? '1 year' : `${m} days`);

function celebratedKey(profile, m) {
  return `recorva_celebrated_${profile.id}_${profile.streak_start_date || 'start'}_${m}`;
}

function fireConfetti() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#2f6b4f', '#e9a23b', '#ffffff', '#7fb59a'];
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 }, colors, disableForReducedMotion: true });
    setTimeout(() => confetti({ particleCount: 60, spread: 110, origin: { y: 0.5 }, colors, disableForReducedMotion: true }), 250);
  } catch { /* confetti is decorative */ }
}

// Celebrates the most recent streak milestone once, the first time Home opens after reaching it.
export default function MilestoneCelebration({ profile }) {
  const { currentDays } = useStreakTotals(profile);
  const [milestone, setMilestone] = useState(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!profile?.id || profile.milestone_notifications_enabled === false) return;
    const reached = [...MILESTONES].reverse().find((m) => m <= currentDays);
    if (!reached) return;
    const key = celebratedKey(profile, reached);
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
    } catch { return; }
    setMilestone(reached);
    const t = setTimeout(fireConfetti, 200);
    return () => clearTimeout(t);
  }, [profile?.id, profile?.streak_start_date, profile?.milestone_notifications_enabled, currentDays]);

  const share = async () => {
    const text = `${label(milestone)} clean with Recorva. One day at a time.`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setShared(true);
    } catch { /* user cancelled or sharing unavailable */ }
  };

  return (
    <Dialog open={!!milestone} onOpenChange={(open) => !open && setMilestone(null)}>
      <DialogContent className="max-w-sm rounded-3xl text-center p-0 overflow-hidden">
        {milestone && (
          <>
            <div className="bg-gradient-to-br from-primary to-[hsl(165_35%_20%)] text-primary-foreground px-6 pt-8 pb-7">
              <span className="mx-auto w-16 h-16 rounded-full bg-white/15 grid place-items-center">
                <Trophy className="w-8 h-8 text-[hsl(42_95%_62%)]" />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/75">Milestone reached</p>
              <DialogTitle className="mt-1 text-4xl font-heading font-extrabold text-white">{label(milestone)}</DialogTitle>
            </div>
            <div className="px-6 pb-6 pt-5 space-y-5">
              <DialogDescription className="text-base text-foreground">{MESSAGES[milestone]}</DialogDescription>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={share}>
                  {shared ? <><Check className="w-4 h-4 mr-1.5" />Shared</> : <><Share2 className="w-4 h-4 mr-1.5" />Share</>}
                </Button>
                <Button className="flex-1" onClick={() => setMilestone(null)}>Keep going</Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
