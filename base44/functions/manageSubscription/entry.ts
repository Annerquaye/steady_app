import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const VALID_ACTIONS = ['cancel', 'reactivate', 'portal'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, subscription_id } = await req.json();

    if (!action || !VALID_ACTIONS.includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Verify the subscription belongs to the current user
    const userSubs = await base44.asServiceRole.entities.Subscription.filter({
      email: user.email,
    });

    if (action === 'cancel' || action === 'reactivate') {
      if (!subscription_id || typeof subscription_id !== 'string' || !subscription_id.startsWith('sub_')) {
        return Response.json({ error: 'Invalid subscription ID' }, { status: 400 });
      }

      const ownedSub = userSubs.find(s => s.stripe_subscription_id === subscription_id);
      if (!ownedSub) {
        console.warn('Unauthorized subscription access attempt by user:', user.id, 'sub:', subscription_id);
        return Response.json({ error: 'Subscription not found' }, { status: 404 });
      }

      const cancelAtEnd = action === 'cancel';
      const updated = await stripe.subscriptions.update(subscription_id, {
        cancel_at_period_end: cancelAtEnd,
      });

      await base44.asServiceRole.entities.Subscription.update(ownedSub.id, {
        cancel_at_period_end: cancelAtEnd,
      });

      console.log(`Subscription ${action}:`, subscription_id, 'user:', user.id);
      return Response.json({ success: true, cancel_at_period_end: updated.cancel_at_period_end });
    }

    if (action === 'portal') {
      const sub = userSubs[0];
      if (!sub?.stripe_customer_id) {
        return Response.json({ error: 'No active subscription found' }, { status: 404 });
      }

      const appUrl = req.headers.get('origin') || 'https://app.base44.com';
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: `${appUrl}/settings`,
      });

      console.log('Billing portal session created for user:', user.id);
      return Response.json({ url: portalSession.url });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('manageSubscription error:', error.message);
    return Response.json({ error: 'Unable to process request. Please try again.' }, { status: 500 });
  }
});