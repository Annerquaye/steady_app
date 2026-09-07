import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Ensures the Apple review account (recorvaadmin@gmail.com) has an active
// Elite subscription record. The app matches subscriptions to users by the
// email field, so this grants the reviewer full access to paid features
// without a Stripe payment. Idempotent — safe to re-run.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const REVIEWER_EMAIL = 'recorvaadmin@gmail.com';
    const existing = await base44.asServiceRole.entities.Subscription.filter({ email: REVIEWER_EMAIL });
    const active = existing.find(s => s.status === 'active' || s.status === 'trialing');
    if (active) {
      return Response.json({ ok: true, plan: active.plan, status: active.status, alreadyExisted: true });
    }

    const now = Date.now();
    const sub = await base44.asServiceRole.entities.Subscription.create({
      plan: 'elite',
      status: 'active',
      billing_interval: 'year',
      email: REVIEWER_EMAIL,
      current_period_start: new Date(now).toISOString(),
      current_period_end: new Date(now + 365 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
    });
    return Response.json({ ok: true, plan: sub.plan, status: sub.status, subscriptionId: sub.id });
  } catch (error) {
    console.error('seedReviewerAccount error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}