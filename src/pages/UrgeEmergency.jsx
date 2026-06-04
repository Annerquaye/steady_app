import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Wind, Dumbbell, TreePine, PenLine, Droplets, Phone,
  ArrowLeft, Check, X, Timer, MessageCircle, Heart
} from 'lucide-react';

const FEELINGS = ['Anxious', 'Bored', 'Lonely', 'Stressed', 'Tired', 'Sad', 'Restless', 'Angry'];

const INTERVENTIONS = [
  { id: 'breathing', label: 'Breathing exercise', icon: Wind, desc: '4-7-8 breathing for 2 min' },
  { id: 'pushups', label: 'Do 20 push-ups', icon: Dumbbell, desc: 'Physical reset' },
  { id: 'walk', label: 'Walk outside', icon: TreePine, desc: 'Change your environment' },
  { id: 'journal', label: 'Write it out', icon: PenLine, desc: 'Journal your feelings' },
  { id: 'cold_shower', label: 'Cold shower', icon: Droplets, desc: 'Shock your system' },
  { id: 'call', label: 'Call someone', icon: Phone, desc: 'Reach out to a person' },
];

const steps = ['feeling', 'intervention', 'timer', 'result'];

export default function UrgeEmergency() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [feeling, setFeeling] = useState('');
  const [intervention, setIntervention] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [journalNote, setJournalNote] = useState('');
  const [saving, setSaving] = useState(false);
  const timerRef = useRef(null);

  // Timer — clean up on unmount and step change
  useEffect(() => {
    if (steps[step] === 'timer' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]); // only restart when step changes, not on every tick

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleResult = async (outcome) => {
    setSaving(true);
    await base44.entities.UrgeLog.create({
      feeling,
      trigger: feeling,
      intervention_used: intervention,
      outcome,
      duration_minutes: Math.round((600 - timeLeft) / 60),
      time_of_day: new Date().toLocaleTimeString(),
      intensity: 7,
    });
    queryClient.invalidateQueries({ queryKey: ['urges'] });
    setSaving(false);
    navigate('/');
  };

  const progress = ((600 - timeLeft) / 600) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to safety
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {/* Step: Feeling */}
          {steps[step] === 'feeling' && (
            <div className="flex-1">
              <div className="text-center mb-8">
                <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
                <h1 className="text-2xl font-heading font-bold mb-2">You're doing the right thing</h1>
                <p className="text-muted-foreground text-sm">Coming here instead of giving in takes real strength. What are you feeling right now?</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {FEELINGS.map(f => (
                  <button
                    key={f}
                    onClick={() => { setFeeling(f); setStep(1); }}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-medium transition-all",
                      "bg-secondary hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Intervention */}
          {steps[step] === 'intervention' && (
            <div className="flex-1">
              <h1 className="text-xl font-heading font-bold mb-1">Choose your intervention</h1>
              <p className="text-muted-foreground text-sm mb-6">Pick something to do for the next 10 minutes while the urge passes.</p>
              <div className="space-y-2">
                {INTERVENTIONS.map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => { setIntervention(id); setStep(2); }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Timer */}
          {steps[step] === 'timer' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="relative w-48 h-48 mb-8">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Timer className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-3xl font-heading font-bold">{formatTime(timeLeft)}</span>
                  <span className="text-xs text-muted-foreground">remaining</span>
                </div>
              </div>

              <h2 className="text-lg font-heading font-semibold mb-2">
                {timeLeft > 300 ? "The urge will peak and pass." :
                 timeLeft > 60 ? "You're past the hardest part." :
                 timeLeft > 0 ? "Almost there. You've got this." :
                 "The urge has passed."}
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Every second you spend here is your brain rewiring. This is the work.
              </p>

              <Textarea
                placeholder="Write anything you're feeling..."
                value={journalNote}
                onChange={(e) => setJournalNote(e.target.value)}
                className="w-full max-w-sm min-h-[80px] resize-none mb-4"
              />

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/coach')} className="gap-2">
                  <MessageCircle className="w-4 h-4" /> Talk to Coach
                </Button>
                <Button onClick={() => setStep(3)} className="gap-2">
                  I'm ready <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Result */}
          {steps[step] === 'result' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h1 className="text-2xl font-heading font-bold mb-2">How did it go?</h1>
              <p className="text-muted-foreground text-sm mb-8">Be honest. Either answer is valuable data.</p>
              <div className="space-y-3 w-full max-w-xs">
                <Button
                  onClick={() => handleResult('resisted')}
                  disabled={saving}
                  className="w-full gap-2 h-14 text-base"
                >
                  <Check className="w-5 h-5" /> I resisted the urge
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResult('relapsed')}
                  disabled={saving}
                  className="w-full gap-2 h-14 text-base"
                >
                  <X className="w-5 h-5" /> I relapsed
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  {saving ? "Saving..." : "This is data, not defeat. Every log helps you learn."}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}