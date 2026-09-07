import React from 'react';
import { Loader2 } from 'lucide-react';
import { usePlan } from '@/lib/planAccess';
import FeatureLock from '@/components/FeatureLock';

export default function PlanGate({ feature, children }) {
  const { hasFeature, isLoading } = usePlan();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return hasFeature(feature) ? children : <FeatureLock feature={feature} />;
}