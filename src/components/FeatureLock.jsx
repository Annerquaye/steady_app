import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FEATURE_INFO, PLAN_NAMES } from '@/lib/planAccess';

export default function FeatureLock({ feature, compact = false }) {
  const navigate = useNavigate();
  const info = FEATURE_INFO[feature] || { label: 'This feature', minPlan: 'recovery_pro' };
  const planName = PLAN_NAMES[info.minPlan] || 'Recovery Pro';

  if (compact) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{info.label}</p>
          <p className="text-xs text-muted-foreground">Included in {planName}</p>
        </div>
        <Button size="sm" onClick={() => navigate('/pricing')} className="flex-shrink-0">
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Lock className="w-7 h-7 text-primary" />
      </div>
      <h1 className="text-xl font-heading font-bold mb-1">{info.label}</h1>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {info.label} is part of {planName}. Upgrade to unlock it — cancel anytime.
      </p>
      <Button onClick={() => navigate('/pricing')} className="gap-2 px-8">
        <Zap className="w-4 h-4" /> View Plans
      </Button>
    </div>
  );
}