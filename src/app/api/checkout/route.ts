/**
 * Stripe Checkout Sessions — upgrade path from Payment Links.
 *
 * Only needed when you require dynamic pricing, coupons, or programmatic
 * control over checkout. For simple one-time payments, use Stripe Payment
 * Links instead (no server code needed — see pay-gate.tsx).
 *
 * Prerequisites:
 *   npm install stripe
 *   .env.local: STRIPE_SECRET_KEY, STRIPE_PRICE_ID
 */
import { createRouteLogger } from '@/lib/route-logger';
import Stripe from 'stripe';

const log = createRouteLogger('checkout');

export async function POST(req: Request): Promise<Response> {
  const ctx = log.begin();

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!secretKey || !priceId) {
      log.warn(ctx.reqId, 'Stripe not configured');
      return log.end(
        ctx,
        Response.json({ error: 'Payment service unavailable' }, { status: 503 }),
      );
    }

    const stripe = new Stripe(secretKey);

    // Derive success URL from request origin
    const origin = new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}?paid=true`,
      cancel_url: origin,
    });

    log.info(ctx.reqId, 'Checkout session created', { sessionId: session.id });
    return log.end(ctx, Response.json({ url: session.url }));
  } catch (error) {
    log.err(ctx, error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
