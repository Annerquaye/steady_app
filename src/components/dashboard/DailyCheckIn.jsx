import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Zap, CheckCircle2 } from 'lucide-react';

const ENERGY_OPTIONS = [
  { value: 'low', label: 'Low', emoji: '🪫', desc: 'Drained' },
  { value: 'medium', label: 'Medium', emoji: '🔋', desc: 'Okay' },
  { value: 'high', label: 'High', emoji: '⚡', desc: 'Energised' },
];

const MOOD_OPTIONS = [
  { value: 'terrible', emoji: '😞' },
  { value: 'low', emoji: '😕' },
  { value: 'neutral', emoji: '😐' },
  { value: 'good', emoji: '🙂' },
  { value: 'great', emoji: '😊' },
];

export default function DailyCheckIn({ alreadyDoneToday }) {
  const [open, setOpen] = useState(false);
  const [energy, setEnergy] = useState('medium');
  const [mood, setMood] = useState('neutral');
  const [takeaway, setTakeaway] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(alreadyDoneToday);

  const handleSave = async () => {
    if (!takeaway.trim()) return;
    setSaving(true);
    await base44.entities.JournalEntry.create({
      mood,
      energy_level: energy,
      notes: takeaway.trim(),
      outcome: 'no_urge',
    });
    setSaving(false);
    setDone(true);
    setOpen(false);
    setTakeaway('');
  };

  return (
    <>
      <button
        onClick={() => !done && setOpen(true)}
        className={cn(
          "w-full flex items-center gap-3 rounded-2xl px-5 py-4 border transition-all text-left",
          done
            ? "bg-primary/8 border-primary/20 cursor-default"
            : "bg-card border-border hover:border-primary/30 hover:bg-secondary/40 active:scale-[0.99]"
        )}
      >
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
          done ? "bg-primary/15" : "bg-secondary"
        )}>
          {done
            ? <CheckCircle2 className="w-5 h-5 text-primary" />
            : <Zap className="w-5 h-5 text-accent" />}
        </div>
        <div>
          <p className="text-sm font-semibold">
            {done ? "Today's check-in done ✓" : "Daily check-in"}
          </p>
          <p className="text-xs text-muted-foreground">
            {done ? "Come back tomorrow to keep your streak." : "30 seconds. Log your energy & one takeaway."}
          </p>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Daily check-in</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            {/* Mood */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">How are you feeling?</p>
              <div className="flex justify-between">
                {MOOD_OPTIONS.map(({ value, emoji }) => (
                  <button
                    key={value}
                    onClick={() => setMood(value)}
                    className={cn(
                      "text-2xl w-11 h-11 rounded-xl flex items-center justify-center transition-all border",
                      mood === value
                        ? "border-primary bg-primary/10 scale-110"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Energy level</p>
              <div className="grid grid-cols-3 gap-2">
                {ENERGY_OPTIONS.map(({ value, label, emoji, desc }) => (
                  <button
                    key={value}
                    onClick={() => setEnergy(value)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-3 rounded-xl border text-center transition-all",
                      energy === value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/20"
                    )}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-xs font-medium">{label}</span>
                    <span className="text-[10px] text-muted-foreground">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Takeaway */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">One key takeaway from today</p>
              <Textarea
                placeholder="e.g. I noticed stress triggers me most after work..."
                value={takeaway}
                onChange={e => setTakeaway(e.target.value)}
                className="resize-none text-sm"
                rows={3}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={!takeaway.trim() || saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Save check-in'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}