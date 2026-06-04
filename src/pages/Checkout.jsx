import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Shield, Check, ChevronLeft, AlertCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

const PLAN_META = {
  starter: {
    name: 'Starter',
    monthlyPrice: 4.99,
    annualPrice: 47.99,
    trial: false,
    features: ['Streak tracking', 'Daily check-ins', 'Journal entries', 'Progress dashboard'],
  },
  recovery_pro: {
    name: 'Recovery Pro',
    monthlyPrice: 14.99,
    annualPrice: 143.99,
    trial: true,
    badge: 'Most Popular',
    features: ['AI Recovery Coach (24/7)', 'Urge Emergency Mode', 'Trigger Analytics', 'Weekly Reports', 'Accountability Tools', 'Website Blocking'],
  },
  elite: {
    name: 'Elite Recovery',
    monthlyPrice: 29.99,
    annualPrice: 287.99,
    trial: true,
    badge: 'Maximum Support',
    features: ['Everything in Pro', 'Advanced AI Coaching', 'Personalized Plans', 'Multiple Partners', 'Priority Support', 'Early Access Features'],
  },
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const VALID_PLANS = ['starter', 'recovery_pro', 'elite'];
  const VALID_BILLING = ['month', 'year'];
  const rawPlan = searchParams.get('plan') || 'recovery_pro';
  const rawBilling = searchParams.get('billing') || 'month';
  const plan = VALID_PLANS.includes(rawPlan) ? rawPlan : 'recovery_pro';
  const billing = VALID_BILLING.includes(rawBilling) ? rawBilling : 'month';

  const meta = PLAN_META[plan] || PLAN_META.recovery_pro;
  const price = billing === 'year' ? meta.annualPrice : meta.monthlyPrice;
  const trialEnd = addDays(new Date(), 7);
  const nextBillingDate = meta.trial ? trialEnd : addDays(new Date(), 30);

  const [email, setEmail] = useState('');
  const [coupon, setCoupon] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!email) { setError('Please enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    if (!agreed) { setError('Please accept the terms to continue.'); return; }

    // Check if running in an iframe (preview mode)
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app. Please open the app directly.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await base44.functions.invoke('createCheckoutSession', {
      plan,
      billing_interval: billing,
      email,
      coupon: coupon || undefined,
    });

    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      setError(res.data?.error || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <Link to="/pricing" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to plans
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* LEFT: Plan summary */}
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Your plan</p>
              <h1 className="text-2xl font-heading font-bold">{meta.name}</h1>
              {meta.badge && (
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">{meta.badge}</span>
              )}
            </div>

            {/* Pricing summary */}
            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
              {meta.trial && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">7-day free trial</span>
                  <span className="font-semibold text-primary">$0.00</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Then {billing === 'year' ? 'annually' : 'monthly'}</span>
                <span className="font-semibold">${price}/{billing === 'year' ? 'yr' : 'mo'}</span>
              </div>
              {meta.trial && (
                <div className="flex justify-between items-center text-sm pt-2 border-t border-border">
                  <span className="text-muted-foreground">Next payment</span>
                  <span className="font-semibold">{format(nextBillingDate, 'MMM d, yyyy')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-border">
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-primary flex-shrink-0" />
                  {meta.trial
                    ? 'You will not be charged until your 7-day trial ends. Cancel anytime.'
                    : 'You will be billed immediately. Cancel anytime.'}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">What's included</p>
              <div className="space-y-2">
                {meta.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: Lock, label: 'SSL\nEncrypted' },
                { icon: Shield, label: 'Cancel\nAnytime' },
                { icon: Star, label: '4.9★\nRating' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="bg-card rounded-xl border border-border p-3 flex flex-col items-center gap-1">
                  <Icon className="w-4 h-4 text-primary" />
                  <p className="text-[10px] text-muted-foreground whitespace-pre-line leading-tight">{label}</p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              🔒 Your personal data is never sold or shared. All health information is end-to-end encrypted and only accessible by you.
            </p>
          </div>

          {/* RIGHT: Payment form */}
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-heading font-semibold mb-1">Complete your setup</h2>
              <p className="text-sm text-muted-foreground">Your personalized recovery plan is ready.</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">Email address</label>
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">Coupon code (optional)</label>
                <Input
                  placeholder="Enter code"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="bg-muted/50 rounded-xl p-3.5 text-sm text-muted-foreground flex items-start gap-2">
                <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Card information is collected securely by Stripe. We never store your card details.</span>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I agree to the <Link to="/terms" className="text-primary underline" target="_blank">Terms of Service</Link> and <Link to="/privacy" className="text-primary underline" target="_blank">Privacy Policy</Link>.
                  {meta.trial && ' I understand my trial ends in 7 days and I can cancel before being charged.'}
                </span>
              </label>

              {error && (
                <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full h-12 text-base gap-2 font-semibold"
              >
                <Lock className="w-4 h-4" />
                {loading ? 'Redirecting to Stripe...' : meta.trial ? 'Start 7-Day Free Trial' : `Subscribe — $${price}/${billing === 'year' ? 'yr' : 'mo'}`}
              </Button>

              <p className="text-[10px] text-center text-muted-foreground">
                Secured by Stripe · 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}