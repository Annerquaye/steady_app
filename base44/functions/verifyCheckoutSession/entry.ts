import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const { session_id } = await req.json();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const base44 = createClientFromRequest(req);

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer'],
    });

    if (session.payment_status !== 'paid' && session.subscription?.status !== 'trialing') {
      return Response.json({ success: false, status: session.payment_status });
    }

    const sub = session.subscription;
    const plan = session.metadata?.plan || 'starter';
    const billing_interval = session.metadata?.billing_interval || 'month';

    // Upsert subscription record
    const existing = await base44.asServiceRole.entities.Subscription.filter({
      stripe_subscription_id: sub.id,
    });

    const subData = {
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
      stripe_subscription_id: sub.id,
      stripe_price_id: sub.items.data[0]?.price?.id,
      plan,
      billing_interval,
      status: sub.status,
      trial_start: sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : null,
      trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      email: session.customer_details?.email || '',
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.Subscription.update(existing[0].id, subData);
    } else {
      await base44.asServiceRole.entities.Subscription.create(subData);
    }

    console.log('Subscription verified and saved:', sub.id, 'plan:', plan, 'status:', sub.status);

    return Response.json({
      success: true,
      plan,
      billing_interval,
      status: sub.status,
      trial_end: subData.trial_end,
      current_period_end: subData.current_period_end,
      email: subData.email,
    });
  } catch (error) {
    console.error('verifyCheckoutSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});