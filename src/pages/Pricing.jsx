import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Shield, Lock, Star, Zap, Brain, BarChart3, Users, Globe, Bell, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 5.99,
    annualPrice: 57.50,
    badge: null,
    desc: 'Build the foundation of your recovery.',
    features: ['Streak tracking', 'Daily check-ins', 'Journal entries', 'Progress dashboard', 'Trigger logging'],
    cta: 'Choose Starter',
    trial: false,
    highlight: false,
  },
  {
    id: 'recovery_pro',
    name: 'Recovery Pro',
    monthlyPrice: 9.99,
    annualPrice: 95.99,
    badge: 'Most Popular',
    badgeColor: 'bg-primary text-primary-foreground',
    desc: 'The complete recovery system for lasting change.',
    features: ['Everything in Starter', 'AI Recovery Coach (24/7)', 'Urge Emergency Mode', 'Trigger Analytics', 'Weekly Progress Reports', 'Accountability Partner Tools', 'Website Blocking', 'Smart Notifications'],
    cta: 'Start 7-Day Free Trial',
    trial: true,
    highlight: true,
  },
  {
    id: 'elite',
    name: 'Elite Recovery',
    monthlyPrice: 13.99,
    annualPrice: 134.30,
    badge: 'Maximum Support',
    badgeColor: 'bg-accent text-accent-foreground',
    desc: 'The highest level of structure and personalization.',
    features: ['Everything in Pro', 'Advanced AI Coaching (deeper, plan-aware context)', 'Personalized AI Recovery Plan', 'Multiple Accountability Partners', 'Deep Behavioral Analytics'],
    cta: 'Start 7-Day Free Trial',
    trial: true,
    highlight: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutFailed = searchParams.get('checkout') === 'failed' || searchParams.get('checkout') === 'canceled';
  const isRestore = searchParams.get('restore') === '1';
  const [billing, setBilling] = useState('month');
  const [restoreEmail, setRestoreEmail] = useState('');
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState('');

  const handleRestore = async () => {
    if (!restoreEmail) return;
    setRestoreLoading(true);
    setRestoreMsg('');
    const res = await base44.functions.invoke('verifyCheckoutSession', { email: restoreEmail, restore: true });
    setRestoreLoading(false);
    setRestoreMsg(res.data?.success
      ? '✅ Subscription restored! Please log in again to apply.'
      : '❌ No active subscription found for that email.');
  };

  const handleSelect = (plan) => {
    navigate(`/checkout?plan=${plan.id}&billing=${billing}`);
  };

  const annualSavings = (monthly, annual) => Math.round(((monthly * 12 - annual) / (monthly * 12)) * 100);

  return (
    <div className="min-h-screen bg-background px-4 py-10 max-w-2xl mx-auto">
      {checkoutFailed && (
        <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">We couldn't process your payment.</p>
            <p className="text-xs text-muted-foreground mt-1">Please try again or choose a different plan below.</p>
          </div>
        </div>
      )}

      {isRestore && (
        <div className="mb-8 bg-card rounded-2xl border border-border p-5 space-y-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Restore Purchases</h2>
          </div>
          <p className="text-xs text-muted-foreground">Enter the email address you used to subscribe.</p>
          <Input
            type="email"
            placeholder="you@email.com"
            value={restoreEmail}
            onChange={e => setRestoreEmail(e.target.value)}
            className="h-11"
          />
          <Button className="w-full" onClick={handleRestore} disabled={restoreLoading || !restoreEmail}>
            {restoreLoading ? 'Checking...' : 'Restore Subscription'}
          </Button>
          {restoreMsg && <p className="text-sm text-center">{restoreMsg}</p>}
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Choose Your Recovery Plan</h1>
        <p className="text-muted-foreground text-sm">Start your free trial. Cancel anytime, no commitment.</p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setBilling('month')}
          className={cn("text-sm font-medium px-4 py-1.5 rounded-full transition-all", billing === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling('year')}
          className={cn("text-sm font-medium px-4 py-1.5 rounded-full transition-all flex items-center gap-2", billing === 'year' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
        >
          Annual <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", billing === 'year' ? 'bg-white/20' : 'bg-primary/10 text-primary')}>Save up to 20%</span>
        </button>
      </div>

      <div className="space-y-4">
        {PLANS.map(plan => {
          const price = billing === 'year' ? plan.annualPrice : plan.monthlyPrice;
          const savings = annualSavings(plan.monthlyPrice, plan.annualPrice);

          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-2xl border-2 p-5 transition-all",
                plan.highlight ? "border-primary bg-primary/3" : "border-border bg-card"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="font-heading font-bold text-lg">{plan.name}</h2>
                    {plan.badge && (
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", plan.badgeColor)}>{plan.badge}</span>
                    )}
                  </div>
                  {plan.trial && <p className="text-xs text-primary font-semibold">7-day free trial included</p>}
                  <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <div className="text-2xl font-heading font-bold">${price.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">/{billing === 'year' ? 'year' : 'month'}</div>
                  {billing === 'year' && <div className="text-[10px] text-primary font-semibold">Save {savings}%</div>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1 mb-4">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-primary flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSelect(plan)}
                className={cn("w-full gap-2", plan.highlight ? "" : "variant-outline")}
                variant={plan.highlight ? "default" : "outline"}
              >
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center gap-8 text-center">
        {[
          { icon: Lock, label: 'Encrypted\npayments' },
          { icon: Shield, label: 'Cancel\nanytime' },
          { icon: Star, label: '4.9★\nrating' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <Icon className="w-5 h-5 text-primary" />
            <p className="text-[10px] text-muted-foreground whitespace-pre-line leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}