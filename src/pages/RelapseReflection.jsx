import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/layout/PageHeader';
import { ArrowRight, ArrowLeft, Heart, Check } from 'lucide-react';

const MOODS = ['great', 'good', 'neutral', 'low', 'terrible'];
const moodEmojis = { great: '😊', good: '🙂', neutral: '😐', low: '😔', terrible: '😞' };

const reflectionSteps = ['trigger', 'before', 'change', 'options'];

export default function RelapseReflection() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    trigger: '',
    what_happened_before: '',
    what_to_change: '',
    mood_before: 'neutral',
    tighten_restrictions: false,
    notify_partner: false,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list(),
    initialData: [],
  });
  const profile = profiles[0];

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.RelapseLog.create(data);

    // Reset streak
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, {
        streak_start_date: new Date().toISOString(),
        total_relapses: (profile.total_relapses || 0) + 1,
      });
    }

    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    queryClient.invalidateQueries({ queryKey: ['relapses'] });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <PageHeader title="Relapse Reflection" />
      <div className="flex-1 flex flex-col p-6">
      {/* Supportive header */}
      <div className="text-center mb-8">
        <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
        <h1 className="text-xl font-heading font-bold">This is data, not defeat</h1>
        <p className="text-sm text-muted-foreground mt-1">Let's learn from this together. No shame.</p>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {reflectionSteps.map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          {reflectionSteps[step] === 'trigger' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">What triggered it?</h2>
              <Textarea
                placeholder="Be specific — was it a feeling, a situation, an app?"
                value={data.trigger}
                onChange={(e) => setData({ ...data, trigger: e.target.value })}
                className="min-h-[120px] resize-none"
              />
              <div>
                <label className="text-sm font-medium mb-2 block">How were you feeling before?</label>
                <div className="flex gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m}
                      onClick={() => setData({ ...data, mood_before: m })}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all",
                        data.mood_before === m
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      )}
                    >
                      <span className="text-lg">{moodEmojis[m]}</span>
                      <span className="text-[10px] capitalize">{m}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {reflectionSteps[step] === 'before' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">What happened before it?</h2>
              <p className="text-sm text-muted-foreground">Think about the 30 minutes before. What were you doing? Where were you?</p>
              <Textarea
                placeholder="I was scrolling on my phone in bed..."
                value={data.what_happened_before}
                onChange={(e) => setData({ ...data, what_happened_before: e.target.value })}
                className="min-h-[140px] resize-none"
              />
            </div>
          )}

          {reflectionSteps[step] === 'change' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">What can you change next time?</h2>
              <p className="text-sm text-muted-foreground">Even one small change can break the pattern.</p>
              <Textarea
                placeholder="Next time I feel that way, I could..."
                value={data.what_to_change}
                onChange={(e) => setData({ ...data, what_to_change: e.target.value })}
                className="min-h-[140px] resize-none"
              />
            </div>
          )}

          {reflectionSteps[step] === 'options' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Options</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
                  <div>
                    <p className="text-sm font-medium">Tighten restrictions?</p>
                    <p className="text-xs text-muted-foreground">Add more blocks or enable hard mode</p>
                  </div>
                  <Switch
                    checked={data.tighten_restrictions}
                    onCheckedChange={(v) => setData({ ...data, tighten_restrictions: v })}
                  />
                </div>
                {profile?.accountability_partner_email && (
                  <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
                    <div>
                      <p className="text-sm font-medium">Notify your partner?</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.accountability_partner_name || 'Your partner'} will receive a brief notification
                      </p>
                    </div>
                    <Switch
                      checked={data.notify_partner}
                      onCheckedChange={(v) => setData({ ...data, notify_partner: v })}
                    />
                  </div>
                )}
              </div>
              <Textarea
                placeholder="Any other notes..."
                value={data.notes}
                onChange={(e) => setData({ ...data, notes: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        )}
        <div className="flex-1" />
        {step < reflectionSteps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="gap-2">
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? 'Saving...' : 'Complete reflection'} <Check className="w-4 h-4" />
          </Button>
        )}
      </div>
      </div>
    </div>
  );
}