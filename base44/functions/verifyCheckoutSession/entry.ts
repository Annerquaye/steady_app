import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // ── RESTORE BY EMAIL ──────────────────────────────────────────────────────
    if (body.restore === true) {
      const { email } = body;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return Response.json({ error: 'Invalid email' }, { status: 400 });
      }

      const existing = await base44.asServiceRole.entities.Subscription.filter({ email });
      const active = existing.find(s => s.status === 'active' || s.status === 'trialing');

      if (!active) {
        console.log('Restore attempt: no active subscription found for', email);
        return Response.json({ success: false, error: 'No active subscription found for that email.' });
      }

      console.log('Subscription restored for email:', email, 'plan:', active.plan);
      return Response.json({ success: true, plan: active.plan, status: active.status });
    }

    // ── VERIFY CHECKOUT SESSION ───────────────────────────────────────────────
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id } = body;

    if (!session_id || typeof session_id !== 'string' || !session_id.startsWith('cs_')) {
      return Response.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer'],
    });

    if (session.payment_status !== 'paid' && session.subscription?.status !== 'trialing') {
      return Response.json({ success: false, status: session.payment_status });
    }

    // Verify this session belongs to the authenticated user
    const sessionUserId = session.metadata?.user_id;
    if (sessionUserId && sessionUserId !== user.id) {
      console.warn('Session user mismatch — possible tampering. session user:', sessionUserId, 'auth user:', user.id);
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sub = session.subscription;
    const plan = session.metadata?.plan || 'starter';
    const billing_interval = session.metadata?.billing_interval || 'month';

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
      email: session.customer_details?.email || user.email || '',
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.Subscription.update(existing[0].id, subData);
    } else {
      await base44.asServiceRole.entities.Subscription.create(subData);
    }

    console.log('Subscription verified and saved:', sub.id, 'plan:', plan, 'status:', sub.status, 'user:', user.id);

    return Response.json({
      success: true,
      plan,
      billing_interval,
      status: sub.status,
      trial_end: subData.trial_end,
      current_period_end: subData.current_period_end,
    });
  } catch (error) {
    console.error('verifyCheckoutSession error:', error.message);
    return Response.json({ error: 'Unable to verify session. Please contact support.' }, { status: 500 });
  }
});