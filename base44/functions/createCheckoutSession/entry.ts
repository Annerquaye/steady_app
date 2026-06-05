import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PRICE_IDS = {
  starter_month: 'price_1Tf6VkDu4AfNdbFnVixrrHaA',
  starter_year: 'price_1Tf6VkDu4AfNdbFnwSzoKzbY',
  recovery_pro_month: 'price_1Tf6VkDu4AfNdbFnDFsnEkna',
  recovery_pro_year: 'price_1Tf6VkDu4AfNdbFnfStxemnS',
  elite_month: 'price_1Tf6VkDu4AfNdbFnsKvnvScB',
  elite_year: 'price_1Tf6VkDu4AfNdbFnhjWrcZ78',
};

const VALID_PLANS = ['starter', 'recovery_pro', 'elite'];
const VALID_INTERVALS = ['month', 'year'];
const HAS_TRIAL = ['recovery_pro', 'elite'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth required
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan, billing_interval, email, coupon } = body;

    // Input validation
    if (!plan || !VALID_PLANS.includes(plan)) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }
    if (billing_interval && !VALID_INTERVALS.includes(billing_interval)) {
      return Response.json({ error: 'Invalid billing interval' }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Prevent duplicate active subscriptions
    const existingSubs = await base44.asServiceRole.entities.Subscription.filter({
      email: user.email,
    });
    const activeSub = existingSubs.find(s =>
      s.status === 'active' || s.status === 'trialing'
    );
    if (activeSub) {
      return Response.json({ error: 'You already have an active subscription.' }, { status: 409 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const interval = billing_interval || 'month';
    const priceKey = `${plan}_${interval}`;
    const priceId = PRICE_IDS[priceKey];

    if (!priceId) {
      return Response.json({ error: 'Invalid plan or billing interval' }, { status: 400 });
    }

    const hasTrial = HAS_TRIAL.includes(plan);
    const appUrl = req.headers.get('origin') || 'https://app.base44.com';

    const sessionParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/?subscription=active&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      allow_promotion_codes: !coupon,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        plan,
        billing_interval: interval,
        user_id: user.id,
      },
      subscription_data: {
        metadata: { plan, billing_interval: interval, user_id: user.id },
      },
    };

    if (email || user.email) {
      sessionParams.customer_email = email || user.email;
    }

    if (hasTrial) {
      sessionParams.subscription_data.trial_period_days = 7;
    }

    if (coupon) {
      // Sanitize coupon — alphanumeric + dash/underscore only
      const cleanCoupon = String(coupon).replace(/[^a-zA-Z0-9_-]/g, '');
      if (cleanCoupon) {
        sessionParams.discounts = [{ coupon: cleanCoupon }];
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log('Checkout session created:', session.id, 'plan:', plan, 'user:', user.id);

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createCheckoutSession error:', error.message);
    return Response.json({ error: 'Unable to create checkout session. Please try again.' }, { status: 500 });
  }
});