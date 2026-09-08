import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Shield, Lock, Star, Zap, Brain, BarChart3, Users, Bell, Globe, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── DATA ───────────────────────────────────────────────────────── */

const MOTIVATIONS = [
  { id: 'relationships', label: 'Save my relationships', emoji: '❤️', cost: 'Distance and disconnection from people I love' },
  { id: 'focus', label: 'Regain focus & clarity', emoji: '🧠', cost: 'Hours of lost productivity and brain fog every day' },
  { id: 'self_respect', label: 'Respect myself again', emoji: '🛡️', cost: 'Shame, guilt, and a sense of losing control' },
  { id: 'energy', label: 'Get my energy back', emoji: '⚡', cost: 'Motivation crashes and constant fatigue' },
  { id: 'control', label: 'Take back my life', emoji: '🎯', cost: 'Feeling enslaved to a habit I can\'t stop' },
  { id: 'mental_health', label: 'Heal my mental health', emoji: '🌱', cost: 'Anxiety, depression, and low self-worth' },
  { id: 'intimacy', label: 'Fix intimacy problems', emoji: '🔥', cost: 'Inability to connect and perform in real relationships' },
  { id: 'confidence', label: 'Build real confidence', emoji: '✨', cost: 'Social anxiety and constant comparison to others' },
];

const TRIGGERS = [
  { label: 'Stress', emoji: '😤' },
  { label: 'Loneliness', emoji: '😔' },
  { label: 'Boredom', emoji: '😴' },
  { label: 'Anxiety', emoji: '😰' },
  { label: 'Social media', emoji: '📱' },
  { label: 'Late-night scrolling', emoji: '🌙' },
  { label: 'Relationship issues', emoji: '💔' },
  { label: 'Procrastination', emoji: '⏳' },
  { label: 'After arguments', emoji: '😠' },
  { label: 'Being alone', emoji: '🏠' },
  { label: 'Other', emoji: '🔄' },
];

const FREQUENCY = [
  { id: 'daily', label: 'Daily or more', hours: 3.5, risk: 92 },
  { id: 'few_week', label: 'A few times a week', hours: 2.0, risk: 74 },
  { id: 'weekly', label: 'About once a week', hours: 1.0, risk: 52 },
  { id: 'monthly', label: 'A few times a month', hours: 0.4, risk: 31 },
];

const TIMES = [
  { label: 'Morning', sublabel: '5–11 AM', emoji: '☀️' },
  { label: 'Afternoon', sublabel: '12–5 PM', emoji: '🌤️' },
  { label: 'Evening', sublabel: '6–9 PM', emoji: '🌆' },
  { label: 'Night', sublabel: '9 PM–midnight', emoji: '🌙' },
  { label: 'Late night', sublabel: 'After midnight', emoji: '🌃' },
];

const TRIED = [
  { id: 'never', label: 'No, first time', emoji: '🌱' },
  { id: 'few', label: 'Yes, a few times', emoji: '🔄' },
  { id: 'many', label: 'Yes, many times', emoji: '💪' },
];

const HABITS = [
  { id: 'porn', label: 'Porn', emoji: '🚫', frequency: 'watch porn' },
  { id: 'social_media', label: 'Social media scrolling', emoji: '📱', frequency: 'scroll social media' },
  { id: 'gambling', label: 'Gambling', emoji: '🎲', frequency: 'gamble' },
  { id: 'alcohol', label: 'Alcohol', emoji: '🍺', frequency: 'drink' },
  { id: 'smoking', label: 'Smoking / vaping', emoji: '🚬', frequency: 'smoke or vape' },
  { id: 'other', label: 'Another habit', emoji: '✨', frequency: 'give in to it' },
];

const GOALS = [
  { id: 'quit_porn', label: 'Quit porn completely', emoji: '🚫' },
  { id: 'focus', label: 'Improve focus', emoji: '🎯' },
  { id: 'relationships', label: 'Better relationships', emoji: '❤️' },
  { id: 'confidence', label: 'Real confidence', emoji: '✨' },
  { id: 'self_control', label: 'More self-control', emoji: '💪' },
  { id: 'peace', label: 'Inner peace', emoji: '🕊️' },
];

const FEATURES = [
  { icon: Brain, label: 'AI Recovery Coach', desc: 'Available 24/7 when urges hit' },
  { icon: Zap, label: 'Urge Emergency Mode', desc: 'Guided intervention in the moment' },
  { icon: BarChart3, label: 'Advanced Trigger Analytics', desc: 'Understand your patterns deeply' },
  { icon: Users, label: 'Accountability Partner Tools', desc: 'Controlled progress sharing' },
  { icon: Globe, label: 'Website Blocking', desc: 'Remove temptation at the source' },
  { icon: Star, label: 'Weekly Recovery Reports', desc: 'AI-powered progress summaries' },
  { icon: Bell, label: 'Personalized Habit Plans', desc: 'Recovery roadmap built for you' },
];

const TESTIMONIALS = [
  { text: '"I tried every app out there. This one finally helped me hit 90 days."', author: 'Marcus, 28' },
  { text: '"The AI coach talked me through my worst moment. I didn\'t relapse."', author: 'Jordan, 34' },
  { text: '"My relationship improved dramatically. She noticed the difference."', author: 'Alex, 31' },
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$5.99',
    period: '/month',
    badge: null,
    desc: 'For users beginning their recovery journey.',
    features: ['Streak tracking', 'Daily check-ins', 'Basic journaling', 'Progress dashboard'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Recovery Pro',
    price: '$9.99',
    period: '/month',
    trial: '7-day free trial',
    badge: 'Most Popular',
    badgeColor: 'bg-primary text-primary-foreground',
    desc: 'For users serious about lasting change.',
    features: ['Everything in Starter', 'AI Recovery Coach', 'Urge Emergency Mode', 'Trigger Analytics', 'Weekly Reports', 'Accountability Features', 'Smart Notifications'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    id: 'elite',
    name: 'Elite Recovery',
    price: '$13.99',
    period: '/month',
    trial: '7-day free trial',
    badge: 'Maximum Support',
    badgeColor: 'bg-accent text-accent-foreground',
    desc: 'For users who want the highest level of structure.',
    features: ['Everything in Pro', 'Advanced AI Coaching', 'Personalized Recovery Plans', 'Multiple Partners', 'Family Progress Sharing', 'Deep Behavioral Analytics', 'Priority Support', 'Early Access Features'],
    cta: 'Start Free Trial',
    highlight: false,
  },
];

const pageVariants = {
  enter: { opacity: 0, x: 28 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 },
};

/* ─── HELPERS ─────────────────────────────────────────────────────── */
function calcResults(data) {
  const freq = FREQUENCY.find(f => f.id === data.frequency) || FREQUENCY[1];
  const hoursLostWeekly = freq.hours;
  const annualHours = Math.round(hoursLostWeekly * 52);
  const baseRisk = freq.risk;
  const tried = data.tried_before === 'many' ? 8 : data.tried_before === 'few' ? 5 : 0;
  const nightRisk = data.vulnerable_times?.some(t => t.includes('Night') || t.includes('Late')) ? 12 : 0;
  const recoveryScore = Math.max(10, Math.min(95, 100 - baseRisk + tried - nightRisk));
  const highRiskTime = data.vulnerable_times?.find(t => t.includes('Night') || t.includes('Late')) || data.vulnerable_times?.[0] || 'Evening';
  return { annualHours, recoveryScore, highRiskTime, riskLevel: baseRisk > 70 ? 'High' : baseRisk > 45 ? 'Moderate' : 'Low' };
}

/* ─── STEP COMPONENTS ─────────────────────────────────────────────── */

function SelectGrid({ items, field, data, toggle, cols = 2 }) {
  return (
    <div className={`grid grid-cols-${cols} gap-2.5`}>
      {items.map(item => {
        const key = item.id || item.label;
        const val = item.id || item.label;
        const selected = Array.isArray(data[field]) ? data[field].includes(val) : data[field] === val;
        return (
          <button
            key={key}
            onClick={() => toggle(field, val)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium text-left transition-all border",
              selected ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card border-border hover:border-primary/30"
            )}
          >
            {item.emoji && <span className="text-xl flex-shrink-0">{item.emoji}</span>}
            <div className="flex-1 min-w-0">
              <p className="leading-tight truncate">{item.label}</p>
              {item.sublabel && (
                <p className={cn("text-[10px]", selected ? "text-primary-foreground/70" : "text-muted-foreground")}>{item.sublabel}</p>
              )}
            </div>
            {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

/* ─── MAIN ────────────────────────────────────────────────────────── */

const STEPS = ['welcome', 'habit', 'motivation', 'cost', 'triggers', 'risk_profile', 'results', 'trial', 'pricing', 'partner'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [data, setData] = useState({
    target_habit: '',
    motivation: [],
    what_its_costing: [],
    what_would_improve: [],
    triggers: [],
    frequency: '',
    vulnerable_times: [],
    tried_before: '',
    goals: [],
    accountability_partner_email: '',
    accountability_partner_name: '',
  });

  const current = STEPS[step];

  const set = (field, val) => setData(prev => ({ ...prev, [field]: val }));

  const toggle = (field, val) => {
    setData(prev => ({
      ...prev,
      [field]: Array.isArray(prev[field])
        ? prev[field].includes(val) ? prev[field].filter(v => v !== val) : [...prev[field], val]
        : prev[field] === val ? '' : val,
    }));
  };

  const toggleMotivation = (id) => {
    setData(prev => {
      const arr = Array.isArray(prev.motivation) ? prev.motivation : [];
      if (arr.includes(id)) return { ...prev, motivation: arr.filter(v => v !== id) };
      if (arr.length >= 3) return prev;
      return { ...prev, motivation: [...arr, id] };
    });
  };

  const canProceed = () => {
    switch (current) {
      case 'welcome': return true;
      case 'habit': return !!data.target_habit;
      case 'motivation': return data.motivation.length > 0;
      case 'cost': return data.what_its_costing.length > 0 || data.what_would_improve.length > 0;
      case 'triggers': return data.triggers.length > 0;
      case 'risk_profile': return !!data.frequency && data.vulnerable_times.length > 0 && !!data.tried_before;
      case 'results': return true;
      case 'trial': return true;
      case 'pricing': return true;
      case 'partner': return true;
      default: return false;
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    const motIds = Array.isArray(data.motivation) ? data.motivation : [data.motivation];
    const motLabel = motIds.map(id => MOTIVATIONS.find(m => m.id === id)?.label || id).join(', ');
    const habitLabel = HABITS.find(h => h.id === data.target_habit)?.label || data.target_habit;
    await base44.entities.UserProfile.create({
      target_habit: habitLabel,
      reason_for_quitting: motLabel,
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

  const results = calcResults(data);

  const showProgress = !['welcome', 'results', 'trial', 'pricing'].includes(current);
  const progressSteps = ['habit', 'motivation', 'cost', 'triggers', 'risk_profile'];
  const progressIdx = progressSteps.indexOf(current);

  return (
    <div
      className="min-h-screen bg-background flex flex-col max-w-lg mx-auto"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Top bar */}
      {showProgress && (
        <div className="px-5 pt-6 pb-0">
          <div className="flex gap-1.5 mb-5">
            {progressSteps.map((_, i) => (
              <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-400", i <= progressIdx ? "bg-primary" : "bg-border")} />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col px-5 pb-8"
        >
          {/* ── WELCOME ── */}
          {current === 'welcome' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-7 py-10">
              <div className="text-7xl">🌿</div>
              <div className="space-y-3">
                <h1 className="text-3xl font-heading font-bold leading-tight">Take Back Control<br />of Your Attention</h1>
                <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
                  A private, science-backed recovery companion that helps you rewire your habits, understand your triggers, and rebuild the life you want.
                </p>
              </div>
              <div className="w-full space-y-2">
                {[
                  { icon: Lock, text: 'Completely private — encrypted, never shared' },
                  { icon: Brain, text: 'AI-powered coaching when you need it most' },
                  { icon: Shield, text: 'Proven strategies backed by behavioral science' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 bg-secondary/60 rounded-xl px-4 py-3 text-left">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-sm text-foreground/80">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── HABIT ── */}
          {current === 'habit' && (
            <div className="flex-1 flex flex-col pt-2">
              <h1 className="text-2xl font-heading font-semibold mb-1">What do you want to quit?</h1>
              <p className="text-sm text-muted-foreground mb-5">We'll personalize your journey around this.</p>
              <div className="space-y-2">
                {HABITS.map(({ id, label, emoji }) => (
                  <button
                    key={id}
                    onClick={() => set('target_habit', id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all border",
                      data.target_habit === id
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-card border-border hover:border-primary/30"
                    )}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <p className="text-sm font-semibold flex-1">{label}</p>
                    {data.target_habit === id && <Check className="w-4 h-4 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── MOTIVATION ── */}
          {current === 'motivation' && (
            <div className="flex-1 flex flex-col pt-2">
              <h1 className="text-2xl font-heading font-semibold mb-1">Why do you want to quit?</h1>
              <p className="text-sm text-muted-foreground mb-5">Your reason is your fuel. Choose up to {3} that resonate most.</p>
              <div className="space-y-2">
                {MOTIVATIONS.map(({ id, label, emoji }) => (
                  <button
                    key={id}
                    onClick={() => toggleMotivation(id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all border",
                      data.motivation.includes(id)
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-card border-border hover:border-primary/30"
                    )}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <p className="text-sm font-semibold flex-1">{label}</p>
                    {data.motivation.includes(id) && <Check className="w-4 h-4 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── COST / VISION ── */}
          {current === 'cost' && (
            <div className="flex-1 flex flex-col pt-2 gap-5">
              <div>
                <div className="text-3xl mb-2">💭</div>
                <h1 className="text-2xl font-heading font-semibold mb-1">What is this costing you?</h1>
                <p className="text-sm text-muted-foreground mb-4">Select all that apply.</p>
                <SelectGrid
                  items={[
                    { id: 'time', label: 'Hours of lost time', emoji: '⏰' },
                    { id: 'shame', label: 'Shame & guilt', emoji: '😔' },
                    { id: 'focus', label: 'Focus & productivity', emoji: '🧠' },
                    { id: 'relationships', label: 'My relationships', emoji: '💔' },
                    { id: 'confidence', label: 'Self-confidence', emoji: '😶' },
                    { id: 'sleep', label: 'Sleep quality', emoji: '😴' },
                    { id: 'motivation', label: 'Drive & motivation', emoji: '🔋' },
                    { id: 'intimacy', label: 'Real intimacy', emoji: '🔒' },
                  ]}
                  field="what_its_costing"
                  data={data}
                  toggle={toggle}
                  cols={2}
                />
              </div>
              <div>
                <p className="text-sm font-semibold mb-2.5">What would improve if you succeeded?</p>
                <SelectGrid
                  items={[
                    { id: 'energy', label: 'More energy', emoji: '⚡' },
                    { id: 'pride', label: 'Feel proud of myself', emoji: '🏆' },
                    { id: 'focus2', label: 'Sharper focus', emoji: '🎯' },
                    { id: 'relationships2', label: 'Better relationships', emoji: '❤️' },
                    { id: 'confidence2', label: 'Real confidence', emoji: '✨' },
                    { id: 'peace', label: 'Inner peace', emoji: '🕊️' },
                  ]}
                  field="what_would_improve"
                  data={data}
                  toggle={toggle}
                  cols={2}
                />
              </div>
            </div>
          )}

          {/* ── TRIGGERS ── */}
          {current === 'triggers' && (
            <div className="flex-1 flex flex-col pt-2">
              <h1 className="text-2xl font-heading font-semibold mb-1">Know your triggers</h1>
              <p className="text-sm text-muted-foreground mb-5">Select all that apply — we'll watch out for these patterns.</p>
              <SelectGrid items={TRIGGERS} field="triggers" data={data} toggle={toggle} cols={2} />
            </div>
          )}

          {/* ── RISK PROFILE ── */}
          {current === 'risk_profile' && (
            <div className="flex-1 flex flex-col pt-2 gap-6">
              <div>
                <h1 className="text-2xl font-heading font-semibold mb-1">Your risk profile</h1>
                <p className="text-sm text-muted-foreground">A few more questions to personalize your plan.</p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2.5">
                  How often do you {HABITS.find(h => h.id === data.target_habit)?.frequency || 'give in to it'}?
                </p>
                <div className="space-y-2">
                  {FREQUENCY.map(f => (
                    <button
                      key={f.id}
                      onClick={() => set('frequency', f.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border",
                        data.frequency === f.id ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card border-border hover:border-primary/30"
                      )}
                    >
                      <span className="flex-1">{f.label}</span>
                      {data.frequency === f.id && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2.5">When are urges strongest?</p>
                <div className="grid grid-cols-2 gap-2">
                  {TIMES.map(({ label, sublabel, emoji }) => {
                    const val = `${label} (${sublabel})`;
                    const sel = data.vulnerable_times.includes(val);
                    return (
                      <button
                        key={label}
                        onClick={() => toggle('vulnerable_times', val)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all border",
                          sel ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/30"
                        )}
                      >
                        <span>{emoji}</span>
                        <div>
                          <p className="text-xs font-semibold">{label}</p>
                          <p className={cn("text-[10px]", sel ? "text-primary-foreground/70" : "text-muted-foreground")}>{sublabel}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2.5">Have you tried quitting before?</p>
                <div className="space-y-2">
                  {TRIED.map(({ id, label, emoji }) => (
                    <button
                      key={id}
                      onClick={() => set('tried_before', id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border",
                        data.tried_before === id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/30"
                      )}
                    >
                      <span>{emoji}</span>
                      <span className="flex-1">{label}</span>
                      {data.tried_before === id && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          {current === 'results' && (
            <div className="flex-1 flex flex-col pt-4 gap-5">
              <div className="text-center">
                <div className="text-5xl mb-3">📊</div>
                <h1 className="text-2xl font-heading font-bold mb-1">Your Recovery Profile</h1>
                <p className="text-sm text-muted-foreground">Personalized based on your answers</p>
              </div>

              {/* Recovery score */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 border border-primary/15 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Recovery Score</p>
                <div className="text-6xl font-heading font-bold text-foreground">{results.recoveryScore}</div>
                <div className="text-xs text-muted-foreground mt-1">out of 100</div>
                <div className={cn(
                  "inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold",
                  results.riskLevel === 'High' ? "bg-destructive/15 text-destructive" :
                  results.riskLevel === 'Moderate' ? "bg-accent/20 text-accent-foreground" :
                  "bg-primary/15 text-primary"
                )}>
                  {results.riskLevel} Risk Profile
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <div className="text-2xl font-heading font-bold text-destructive">{results.annualHours}h</div>
                  <p className="text-xs text-muted-foreground mt-1">Estimated hours lost per year</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 text-center">
                  <div className="text-2xl font-heading font-bold text-accent">{data.triggers.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Identified triggers</p>
                </div>
              </div>

              {/* Key findings */}
              <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
                <p className="text-sm font-semibold">Key findings</p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-primary mt-0.5">→</span>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Highest-risk period:</span> {results.highRiskTime}
                    </p>
                  </div>
                  {data.triggers.slice(0, 2).map(t => (
                    <div key={t} className="flex gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      <p className="text-muted-foreground"><span className="font-medium text-foreground">{t}</span> is a primary trigger</p>
                    </div>
                  ))}
                  {data.tried_before !== 'never' && (
                    <div className="flex gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      <p className="text-muted-foreground">Previous attempts show <span className="font-medium text-foreground">high motivation</span> — a structured plan makes the difference</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed">
                💡 <em>"Based on your profile, your highest-risk period is {results.highRiskTime.toLowerCase()}. Users with similar patterns who implement accountability and urge interventions consistently report significantly better outcomes."</em>
              </div>
            </div>
          )}

          {/* ── TRIAL PITCH ── */}
          {current === 'trial' && (
            <div className="flex-1 flex flex-col pt-4 gap-5">
              <div className="text-center">
                <div className="text-5xl mb-3">🗝️</div>
                <h1 className="text-2xl font-heading font-bold mb-2">Your Personalized Recovery Plan Is Ready</h1>
                <p className="text-muted-foreground text-sm">Start with a free trial. Cancel anytime. No commitment.</p>
              </div>

              {/* Features unlocked */}
              <div className="bg-gradient-to-br from-primary/8 to-transparent rounded-2xl border border-primary/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-primary mb-3">Unlocked during your free trial</p>
                <div className="space-y-2.5">
                  {FEATURES.map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social proof */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5">What others say</p>
                <div className="space-y-2">
                  {TESTIMONIALS.map(({ text, author }) => (
                    <div key={author} className="bg-card rounded-xl border border-border p-3.5">
                      <p className="text-sm text-foreground/80 italic leading-relaxed">{text}</p>
                      <p className="text-xs text-muted-foreground mt-2">— {author}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust signals */}
              <div className="flex justify-center gap-6 py-2">
                {[
                  { icon: Lock, label: 'End-to-end\nencrypted' },
                  { icon: Shield, label: 'Never\nshared' },
                  { icon: Star, label: '4.9★\nrating' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 text-center">
                    <Icon className="w-5 h-5 text-primary" />
                    <p className="text-[10px] text-muted-foreground whitespace-pre-line leading-tight">{label}</p>
                  </div>
                ))}
              </div>

              {/* Milestones */}
              <div className="bg-secondary/40 rounded-xl p-4">
                <p className="text-xs font-semibold mb-2 text-muted-foreground">Milestones our community has reached</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[['12,400+', 'urges resisted'], ['3,200+', '30-day streaks'], ['890+', '90-day streaks']].map(([n, l]) => (
                    <div key={l}>
                      <div className="text-sm font-bold text-foreground">{n}</div>
                      <div className="text-[10px] text-muted-foreground">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PRICING ── */}
          {current === 'pricing' && (
            <div className="flex-1 flex flex-col pt-4 gap-4 items-center justify-center text-center">
              <div className="text-5xl">🎯</div>
              <h1 className="text-2xl font-heading font-bold">Your plan is ready</h1>
              <p className="text-sm text-muted-foreground max-w-xs">
                Choose the right plan on the next screen. Recovery Pro includes a 7-day free trial — no charge until your trial ends.
              </p>
              <div className="bg-primary/10 rounded-2xl border border-primary/20 p-4 w-full text-left space-y-2">
                {['AI Recovery Coach (24/7)', 'Urge Emergency Mode', 'Trigger Analytics & Insights', 'Accountability Partner Tools', '7-day free trial included'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Cancel anytime. Secured by Stripe.</span>
              </div>
            </div>
          )}

          {/* ── PARTNER ── */}
          {current === 'partner' && (
            <div className="flex-1 flex flex-col pt-2 gap-5">
              <div>
                <div className="text-4xl mb-2">🤝</div>
                <h1 className="text-2xl font-heading font-semibold mb-1">Add an accountability partner</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Optional — but people with a trusted partner are <strong>65% more likely</strong> to succeed.
                </p>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Their name (e.g. James)"
                  value={data.accountability_partner_name}
                  onChange={e => set('accountability_partner_name', e.target.value)}
                  className="h-11"
                />
                <Input
                  type="email"
                  placeholder="their@email.com"
                  value={data.accountability_partner_email}
                  onChange={e => set('accountability_partner_email', e.target.value)}
                  className="h-11"
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You control exactly what they see. Nothing is shared without your explicit permission.
              </p>
              <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl border border-primary/20 p-4">
                <p className="text-sm font-semibold mb-0.5">🎉 You're ready to begin</p>
                <p className="text-xs text-muted-foreground">Your personalized recovery plan is set up. Your streak starts now.</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className={cn("flex items-center gap-3 px-5 pb-6 pt-3 border-t border-border bg-background", ['welcome', 'results', 'trial', 'pricing'].includes(current) ? '' : '')}>
        {step > 0 && !['results', 'trial', 'pricing'].includes(current) && (
          <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        )}
        {['results', 'trial', 'pricing'].includes(current) && (
          <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="gap-1 text-muted-foreground text-sm">
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
        )}
        <div className="flex-1" />
        {current === 'partner' && (
          <Button variant="ghost" onClick={handleFinish} disabled={saving} className="text-muted-foreground text-sm">
            Skip
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          current === 'pricing' ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setStep(s => s + 1)} className="text-muted-foreground text-sm">
                Continue without a plan
              </Button>
              <Button asChild size="lg" className="gap-2 px-8">
                <Link to="/pricing">
                  See Plans <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className={cn("gap-2", current === 'welcome' || current === 'trial' || current === 'results' ? 'px-8' : '')}
              size={current === 'welcome' || current === 'trial' || current === 'results' ? 'lg' : 'default'}
            >
              {current === 'welcome' && 'Get Started'}
              {current === 'habit' && 'Continue'}
              {current === 'motivation' && 'Continue'}
              {current === 'cost' && 'Continue'}
              {current === 'triggers' && 'Continue'}
              {current === 'risk_profile' && 'See My Results'}
              {current === 'results' && 'View My Recovery Plan'}
              {current === 'trial' && 'See Pricing'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )
        ) : (
          <Button onClick={handleFinish} disabled={saving} className="gap-2">
            {saving ? 'Setting up...' : 'Begin My Journey'} <Check className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}