import { type NextRequest, NextResponse } from 'next/server';
import { Webhooks } from '@/lib/polar';

const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error('POLAR_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('webhook-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify the webhook signature using Polar SDK
    const event = Webhooks.verify({
      payload: rawBody,
      headers: {
        'webhook-signature': signature,
      },
      webhookSecret,
    });

    // Handle different event types
    switch (event.type) {
      case 'order.created':
        const order = event.data;
        console.log(`[Polar] Order created: ${order.id} for amount ${order.amount}`);
        // TODO: Handle API Pass granting in your database here
        break;

      case 'subscription.created':
        const sub = event.data;
        console.log(`[Polar] Subscription created: ${sub.id}`);
        // TODO: Handle subscription setup
        break;

      default:
        console.log(`[Polar] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Polar] Webhook processing failed:', error);
    return NextResponse.json({ error: 'Invalid payload or signature' }, { status: 400 });
  }
}
export const runtime = 'edge';
