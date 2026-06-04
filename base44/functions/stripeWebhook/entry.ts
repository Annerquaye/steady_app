import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;

      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: sub.id,
      });

      const updateData = {
        status: sub.status,
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      };

      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, updateData);
        console.log('Subscription updated via webhook:', sub.id, 'status:', sub.status);
      } else {
        console.warn('Webhook received for unknown subscription:', sub.id);
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const subId = invoice.subscription;
      if (subId) {
        const existing = await base44.asServiceRole.entities.Subscription.filter({
          stripe_subscription_id: subId,
        });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            status: 'past_due',
          });
          console.log('Subscription marked past_due due to payment failure:', subId);
        }
      }
    }

    if (event.type === 'checkout.session.completed') {
      // Subscription record is created via verifyCheckoutSession on the client side.
      // Log for audit purposes only — no sensitive data.
      console.log('Checkout session completed:', event.data.object.id, 'plan:', event.data.object.metadata?.plan);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error.message);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
});