import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const { action, subscription_id } = await req.json();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'cancel') {
      const updated = await stripe.subscriptions.update(subscription_id, {
        cancel_at_period_end: true,
      });

      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: subscription_id,
      });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
          cancel_at_period_end: true,
        });
      }

      console.log('Subscription set to cancel at period end:', subscription_id);
      return Response.json({ success: true, cancel_at_period_end: updated.cancel_at_period_end });
    }

    if (action === 'reactivate') {
      const updated = await stripe.subscriptions.update(subscription_id, {
        cancel_at_period_end: false,
      });

      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: subscription_id,
      });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
          cancel_at_period_end: false,
        });
      }

      return Response.json({ success: true, cancel_at_period_end: updated.cancel_at_period_end });
    }

    if (action === 'portal') {
      const existing = await base44.asServiceRole.entities.Subscription.filter({});
      const sub = existing.find(s => s.stripe_subscription_id === subscription_id) || existing[0];

      if (!sub?.stripe_customer_id) {
        return Response.json({ error: 'No customer found' }, { status: 404 });
      }

      const appUrl = req.headers.get('origin') || 'https://app.base44.com';
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: `${appUrl}/settings`,
      });

      return Response.json({ url: portalSession.url });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('manageSubscription error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});