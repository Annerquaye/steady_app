import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const PLAN_NAMES = { starter: 'Starter', recovery_pro: 'Recovery Pro', elite: 'Elite Recovery' };

const TIER_LEVELS = { starter: 1, recovery_pro: 2, elite: 3 };

// Minimum tier required for each gated feature
export const FEATURE_INFO = {
  ai_coach: { label: 'AI Recovery Coach', minPlan: 'recovery_pro' },
  urge_mode: { label: 'Urge Emergency Mode', minPlan: 'recovery_pro' },
  blocking: { label: 'Website Blocking', minPlan: 'recovery_pro' },
  weekly_review: { label: 'Weekly Progress Reports', minPlan: 'recovery_pro' },
  trigger_analytics: { label: 'Trigger Analytics', minPlan: 'recovery_pro' },
  partner_tools: { label: 'Accountability Partner Tools', minPlan: 'recovery_pro' },
  multiple_partners: { label: 'Multiple Partners', minPlan: 'elite' },
  recovery_plan: { label: 'Personalized Recovery Plan', minPlan: 'elite' },
  advanced_coach: { label: 'Advanced AI Coaching', minPlan: 'elite' },
  advanced_analytics: { label: 'Deep Behavioral Analytics', minPlan: 'elite' },
};

export function usePlan() {
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 1),
    initialData: [],
  });

  const sub = subscriptions?.[0];
  const active = sub && (sub.status === 'active' || sub.status === 'trialing');
  const plan = active ? sub.plan : 'starter';
  const tierLevel = active ? (TIER_LEVELS[sub.plan] || 1) : 1;

  const hasFeature = (feature) => {
    const info = FEATURE_INFO[feature];
    if (!info) return true;
    return tierLevel >= TIER_LEVELS[info.minPlan];
  };

  return {
    plan,
    tierLevel,
    hasFeature,
    isPro: tierLevel >= 2,
    isElite: tierLevel >= 3,
    subscription: sub || null,
    isLoading,
  };
}