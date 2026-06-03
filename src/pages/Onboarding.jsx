import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Shield, Heart, Target, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const TRIGGERS = [
  'Boredom', 'Stress', 'Loneliness', 'Anxiety', 'Late-night scrolling',
  'Alcohol', 'Social media', 'Being alone', 'Tiredness', 'Rejection',
  'Procrastination', 'After arguments'
];

const TIMES = [
  'Early morning (5-8 AM)', 'Morning (8-11 AM)', 'Afternoon (12-3 PM)',
  'Late afternoon (3-6 PM)', 'Evening (6-9 PM)', 'Night (9 PM-12 AM)',
  'Late night (12-3 AM)', 'Very late (3-5 AM)'
];

const GOALS = [
  { id: 'quit_porn', label: 'Quit porn', icon: Shield },
  { id: 'reduce_masturbation', label: 'Reduce masturbation', icon: Target },
  { id: 'improve_focus', label: 'Improve focus', icon: Target },
  { id: 'improve_relationships', label: 'Improve relationships', icon: Heart },
  { id: 'improve_self_control', label: 'Improve self-control', icon: Shield },
  { id: 'more_energy', label: 'More energy', icon: Clock },
];

const steps = ['reason', 'triggers', 'times', 'goals', 'partner'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    reason_for_quitting: '',
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
      case 'reason': return data.reason_for_quitting.trim().length > 0;
      case 'triggers': return data.triggers.length > 0;
      case 'times': return data.vulnerable_times.length > 0;
      case 'goals': return data.goals.length > 0;
      case 'partner': return true;
      default: return false;
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    await base44.entities.UserProfile.create({
      ...data,
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

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i <= step ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col"
        >
          {/* Step: Reason */}
          {steps[step] === 'reason' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-heading font-semibold mb-2">Welcome</h1>
              <p className="text-muted-foreground mb-8">
                This is your private space. No judgment, no shame — just you taking back control.
              </p>
              <label className="text-sm font-medium mb-2">Why are you here?</label>
              <Textarea
                placeholder="Write in your own words what made you decide to make this change..."
                value={data.reason_for_quitting}
                onChange={(e) => setData({ ...data, reason_for_quitting: e.target.value })}
                className="min-h-[140px] resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">This stays completely private and is only used to personalize your experience.</p>
            </div>
          )}

          {/* Step: Triggers */}
          {steps[step] === 'triggers' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-heading font-semibold mb-2">Know your triggers</h1>
              <p className="text-muted-foreground mb-6">
                Understanding what pulls you in is the first step to breaking free.
              </p>
              <div className="flex flex-wrap gap-2">
                {TRIGGERS.map(trigger => (
                  <button
                    key={trigger}
                    onClick={() => toggleArrayItem('triggers', trigger)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      data.triggers.includes(trigger)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Vulnerable Times */}
          {steps[step] === 'times' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-heading font-semibold mb-2">Vulnerable hours</h1>
              <p className="text-muted-foreground mb-6">
                When are you most likely to struggle? We'll help you protect these windows.
              </p>
              <div className="space-y-2">
                {TIMES.map(time => (
                  <button
                    key={time}
                    onClick={() => toggleArrayItem('vulnerable_times', time)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl text-sm font-medium text-left transition-all flex items-center gap-3",
                      data.vulnerable_times.includes(time)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Goals */}
          {steps[step] === 'goals' && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-heading font-semibold mb-2">Your goals</h1>
              <p className="text-muted-foreground mb-6">
                What does success look like for you?
              </p>
              <div className="space-y-2">
                {GOALS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => toggleArrayItem('goals', id)}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl text-sm font-medium text-left transition-all flex items-center gap-3",
                      data.goals.includes(id)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Accountability Partner */}
          {steps[step] === 'partner' && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-heading font-semibold">Accountability</h1>
              </div>
              <p className="text-muted-foreground mb-6">
                Optional: add someone you trust. You control exactly what gets shared.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Partner's name</label>
                  <Input
                    placeholder="Their name"
                    value={data.accountability_partner_name}
                    onChange={(e) => setData({ ...data, accountability_partner_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Partner's email</label>
                  <Input
                    type="email"
                    placeholder="their@email.com"
                    value={data.accountability_partner_email}
                    onChange={(e) => setData({ ...data, accountability_partner_email: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">You can always add or change this later in settings. Nothing is shared without your explicit permission.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        )}
        <div className="flex-1" />
        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleFinish}
            disabled={saving}
            className="gap-2"
          >
            {saving ? 'Setting up...' : 'Start my journey'} <Check className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}