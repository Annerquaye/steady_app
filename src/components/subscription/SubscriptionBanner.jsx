import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { differenceInDays } from 'date-fns';
import { Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function SubscriptionBanner() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  const [activated, setActivated] = useState(false);
  const verifiedRef = useRef(false);

  // Verify subscription on return from Stripe
  const sessionId = searchParams.get('session_id');
  const subscriptionActive = searchParams.get('subscription') === 'active';

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 1),
    initialData: [],
  });

  useEffect(() => {
    // Guard against double-invoke in strict mode / re-renders
    if (sessionId && subscriptionActive && !verifiedRef.current) {
      verifiedRef.current = true;
      base44.functions.invoke('verifyCheckoutSession', { session_id: sessionId }).then(() => {
        setActivated(true);
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        // Clean up URL params
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('session_id');
        newParams.delete('subscription');
        setSearchParams(newParams, { replace: true });
      }).catch(err => {
        console.error('Failed to verify checkout session:', err);
      });
    }
  }, [sessionId]);

  const sub = subscriptions?.[0];
  if (!sub || dismissed) return null;

  const isTrialing = sub.status === 'trialing';
  const daysLeft = sub.trial_end ? differenceInDays(new Date(sub.trial_end), new Date()) : null;

  if (sub.status === 'active' && !isTrialing && !activated) return null;

  if (activated) {
    return (
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-semibold text-primary">🎉 Your subscription is active!</span>
          <span className="text-muted-foreground hidden sm:inline">Welcome to your recovery journey.</span>
        </div>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (isTrialing && daysLeft !== null && daysLeft <= 3) {
    return (
      <div className="bg-accent/10 border-b border-accent/20 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-accent" />
          <span className="font-medium">Trial ends in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>. Continue your progress uninterrupted.</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate('/settings')}>Manage</Button>
          <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}