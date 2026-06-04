import Stripe from 'npm:stripe@14.21.0';

const PRICE_IDS = {
  starter_month: 'price_1TeP4QDgtIyh08WPKnftI1ZJ',
  starter_year: 'price_1TeP4QDgtIyh08WPD8Ztcgor',
  recovery_pro_month: 'price_1TeP4QDgtIyh08WPKqs4VJp0',
  recovery_pro_year: 'price_1TeP4QDgtIyh08WPssb5mR0N',
  elite_month: 'price_1TeP4QDgtIyh08WPzFjE3Q92',
  elite_year: 'price_1TeP4QDgtIyh08WP3bpdqc58',
};

const HAS_TRIAL = ['recovery_pro', 'elite'];

Deno.serve(async (req) => {
  try {
    const { plan, billing_interval, email, coupon } = await req.json();

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const priceKey = `${plan}_${billing_interval || 'month'}`;
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
        billing_interval: billing_interval || 'month',
      },
      subscription_data: {
        metadata: { plan, billing_interval: billing_interval || 'month' },
      },
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    if (hasTrial) {
      sessionParams.subscription_data.trial_period_days = 7;
    }

    if (coupon) {
      sessionParams.discounts = [{ coupon }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log('Checkout session created:', session.id, 'plan:', plan);

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createCheckoutSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});