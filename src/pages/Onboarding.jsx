import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Shield, Heart, Target, Clock, Users, Zap, Brain, Coffee, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

const REASONS = [
  { id: 'relationships', label: 'Improve my relationships', emoji: '❤️', description: 'Be more present with people I love' },
  { id: 'focus', label: 'Regain focus & clarity', emoji: '🧠', description: 'Stop the brain fog and distraction' },
  { id: 'self_respect', label: 'Respect myself more', emoji: '🛡️', description: 'Feel proud of who I am' },
  { id: 'energy', label: 'Get my energy back', emoji: '⚡', description: 'Feel motivated and alive again' },
  { id: 'control', label: 'Take back control', emoji: '🎯', description: 'Stop feeling controlled by urges' },
  { id: 'mental_health', label: 'Improve mental health', emoji: '🌱', description: 'Reduce anxiety and depression' },
  { id: 'intimacy', label: 'Fix intimacy issues', emoji: '🔥', description: 'Connect better with a partner' },
  { id: 'personal_growth', label: 'Become a better person', emoji: '✨', description: 'Build the life I actually want' },
];

const TRIGGERS = [
  { label: 'Boredom', emoji: '😴' },
  { label: 'Stress', emoji: '😤' },
  { label: 'Loneliness', emoji: '😔' },
  { label: 'Anxiety', emoji: '😰' },
  { label: 'Late-night scrolling', emoji: '🌙' },
  { label: 'Alcohol', emoji: '🍺' },
  { label: 'Social media', emoji: '📱' },
  { label: 'Being alone', emoji: '🏠' },
  { label: 'Tiredness', emoji: '😩' },
  { label: 'Rejection', emoji: '💔' },
  { label: 'Procrastination', emoji: '⏳' },
  { label: 'After arguments', emoji: '😠' },
];

const TIMES = [
  { label: 'Early morning', sublabel: '5–8 AM', emoji: '🌅' },
  { label: 'Morning', sublabel: '8–11 AM', emoji: '☀️' },
  { label: 'Afternoon', sublabel: '12–3 PM', emoji: '🌤️' },
  { label: 'Late afternoon', sublabel: '3–6 PM', emoji: '🌇' },
  { label: 'Evening', sublabel: '6–9 PM', emoji: '🌆' },
  { label: 'Night', sublabel: '9 PM–12 AM', emoji: '🌙' },
  { label: 'Late night', sublabel: '12–3 AM', emoji: '🌃' },
  { label: 'Very late', sublabel: '3–5 AM', emoji: '🦉' },
];

const GOALS = [
  { id: 'quit_porn', label: 'Quit porn completely', emoji: '🚫' },
  { id: 'reduce_masturbation', label: 'Reduce masturbation', emoji: '📉' },
  { id: 'improve_focus', label: 'Improve focus', emoji: '🎯' },
  { id: 'improve_relationships', label: 'Better relationships', emoji: '❤️' },
  { id: 'improve_self_control', label: 'More self-control', emoji: '💪' },
  { id: 'more_energy', label: 'More energy', emoji: '⚡' },
];

const COMMITMENT_LEVELS = [
  { id: 'casual', label: 'Taking it slow', description: 'Reduce gradually, no pressure', emoji: '🌱' },
  { id: 'serious', label: 'Seriously committed', description: 'I\'m ready to do the work', emoji: '💪' },
  { id: 'urgent', label: 'This is urgent', description: 'It\'s affecting my life badly', emoji: '🚨' },
];

const steps = ['welcome', 'reason', 'commitment', 'triggers', 'times', 'goals', 'partner'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    reason_for_quitting: '',
    commitment_level: '',
    triggers: [],
    vulnerable_times: [],
    goals: [],
    accountability_partner_email: '',
    accountability_partner_name: '',
  });
  const [saving, setSaving] = useState(false);

  const toggleArrayItem = (field, item) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const canProceed = () => {
    switch (steps[step]) {
      case 'welcome': return true;
      case 'reason': return data.reason_for_quitting.length > 0;
      case 'commitment': return data.commitment_level.length > 0;
      case 'triggers': return data.triggers.length > 0;
      case 'times': return data.vulnerable_times.length > 0;
      case 'goals': return data.goals.length > 0;
      case 'partner': return true;
      default: return false;
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    const reasonLabel = REASONS.find(r => r.id === data.reason_for_quitting)?.label || data.reason_for_quitting;
    await base44.entities.UserProfile.create({
      reason_for_quitting: reasonLabel,
      triggers: data.triggers,
      vulnerable_times: data.vulnerable_times,
      goals: data.goals,
      accountability_partner_email: data.accountability_partner_email,
      accountability_partner_name: data.accountability_partner_name,
      onboarding_complete: true,
      streak_start_date: new Date().toISOString(),
      total_urges_resisted: 0,
      total_relapses: 0,
      blocked_websites: [],
      blocked_keywords: [],
      high_risk_apps: [],
      lockdown_windows: [],
      hard_mode_enabled: false,
      privacy_level: 'minimal',
      send_weekly_email: false,
      send_relapse_alert: false,
      send_missed_checkin_alert: false,
    });
    navigate('/');
  };

  const pageVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 py-8 max-w-lg mx-auto">
      {/* Progress bar — hidden on welcome */}
      {currentStep !== 'welcome' && (
        <div className="flex gap-1.5 mb-8">
          {steps.slice(1).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i < step ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22 }}
          className="flex-1 flex flex-col"
        >
          {/* WELCOME */}
          {currentStep === 'welcome' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-8">
              <div className="text-6xl">🌿</div>
              <div>
                <h1 className="text-3xl font-heading font-bold mb-3">You're not alone.</h1>
                <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
                  This is a private, judgment-free space to help you break free and build a better life.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {[
                  { icon: '🔒', text: 'Completely private — no one sees your data' },
                  { icon: '🧠', text: 'Science-backed strategies that actually work' },
                  { icon: '💬', text: 'AI coach available 24/7 when you need support' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3 bg-secondary/50 rounded-xl px-4 py-3 text-left">
                    <span className="text-xl">{icon}</span>
                    <p className="text-sm text-foreground/80">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REASON */}
          {currentStep === 'reason' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-heading font-semibold mb-1">Why are you here?</h1>
              <p className="text-muted-foreground text-sm mb-6">Choose what resonates most with you.</p>
              <div className="grid grid-cols-1 gap-2.5">
                {REASONS.map(({ id, label, emoji, description }) => (
                  <button
                    key={id}
                    onClick={() => setData({ ...data, reason_for_quitting: id })}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all border",
                      data.reason_for_quitting === id
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-card border-border hover:border-primary/30 hover:bg-secondary/60"
                    )}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{label}</p>
                      <p className={cn("text-xs mt-0.5", data.reason_for_quitting === id ? "text-primary-foreground/70" : "text-muted-foreground")}>{description}</p>
                    </div>
                    {data.reason_for_quitting === id && <Check className="w-4 h-4 ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COMMITMENT */}
          {currentStep === 'commitment' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-heading font-semibold mb-1">How committed are you?</h1>
              <p className="text-muted-foreground text-sm mb-6">Be honest — there's no wrong answer.</p>
              <div className="flex flex-col gap-3">
                {COMMITMENT_LEVELS.map(({ id, label, description, emoji }) => (
                  <button
                    key={id}
                    onClick={() => setData({ ...data, commitment_level: id })}
                    className={cn(
                      "flex items-center gap-4 px-5 py-5 rounded-2xl text-left transition-all border-2",
                      data.commitment_level === id
                        ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                        : "bg-card border-border hover:border-primary/30"
                    )}
                  >
                    <span className="text-4xl">{emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{label}</p>
                      <p className={cn("text-sm mt-0.5", data.commitment_level === id ? "text-primary-foreground/70" : "text-muted-foreground")}>{description}</p>
                    </div>
                    {data.commitment_level === id && <Check className="w-5 h-5 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TRIGGERS */}
          {currentStep === 'triggers' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-heading font-semibold mb-1">Know your triggers</h1>
              <p className="text-muted-foreground text-sm mb-6">Select all that apply. We'll watch out for these.</p>
              <div className="grid grid-cols-2 gap-2.5">
                {TRIGGERS.map(({ label, emoji }) => (
                  <button
                    key={label}
                    onClick={() => toggleArrayItem('triggers', label)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium text-left transition-all border",
                      data.triggers.includes(label)
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border hover:border-primary/30"
                    )}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="leading-tight">{label}</span>
                    {data.triggers.includes(label) && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TIMES */}
          {currentStep === 'times' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-heading font-semibold mb-1">Vulnerable hours</h1>
              <p className="text-muted-foreground text-sm mb-6">When do urges hit hardest? We'll help you protect these windows.</p>
              <div className="grid grid-cols-2 gap-2.5">
                {TIMES.map(({ label, sublabel, emoji }) => {
                  const value = `${label} (${sublabel})`;
                  const selected = data.vulnerable_times.includes(value);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleArrayItem('vulnerable_times', value)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-xl transition-all border text-center",
                        selected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card border-border hover:border-primary/30"
                      )}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <p className="text-xs font-semibold leading-tight">{label}</p>
                      <p className={cn("text-[10px]", selected ? "text-primary-foreground/70" : "text-muted-foreground")}>{sublabel}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* GOALS */}
          {currentStep === 'goals' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-heading font-semibold mb-1">Your goals</h1>
              <p className="text-muted-foreground text-sm mb-6">What does winning look like for you?</p>
              <div className="grid grid-cols-2 gap-2.5">
                {GOALS.map(({ id, label, emoji }) => (
                  <button
                    key={id}
                    onClick={() => toggleArrayItem('goals', id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 py-5 px-2 rounded-xl transition-all border text-center",
                      data.goals.includes(id)
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border hover:border-primary/30"
                    )}
                  >
                    <span className="text-3xl">{emoji}</span>
                    <p className="text-xs font-semibold leading-tight">{label}</p>
                    {data.goals.includes(id) && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PARTNER */}
          {currentStep === 'partner' && (
            <div className="flex-1 flex flex-col">
              <div className="text-4xl mb-3">🤝</div>
              <h1 className="text-2xl font-heading font-semibold mb-1">Accountability partner</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Optional. People with a trusted partner are 65% more likely to succeed.
              </p>
              <div className="space-y-3">
                <Input
                  placeholder="Their name (e.g. James)"
                  value={data.accountability_partner_name}
                  onChange={(e) => setData({ ...data, accountability_partner_name: e.target.value })}
                  className="h-11"
                />
                <Input
                  type="email"
                  placeholder="their@email.com"
                  value={data.accountability_partner_email}
                  onChange={(e) => setData({ ...data, accountability_partner_email: e.target.value })}
                  className="h-11"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                You control exactly what gets shared. Nothing is sent without your permission.
              </p>

              <div className="mt-6 bg-secondary/50 rounded-xl p-4">
                <p className="text-sm font-medium mb-1">🎉 You're almost ready!</p>
                <p className="text-xs text-muted-foreground">Your personalized recovery plan is set up and your streak starts now.</p>
              </div>
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
        {currentStep === 'partner' && (
          <Button variant="ghost" onClick={handleFinish} disabled={saving} className="text-muted-foreground text-sm">
            Skip
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="gap-2">
            {currentStep === 'welcome' ? "Let's begin" : 'Continue'} <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={saving} className="gap-2">
            {saving ? 'Setting up...' : 'Start my journey'} <Check className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}