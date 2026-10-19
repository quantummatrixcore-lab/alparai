let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import { type NextRequest, NextResponse } from 'next/server';
import { Webhooks } from '@/lib/polar';
import { createAdminClient } from '@/lib/dehost/admin';


const webhookSecret = (vault.read('POLAR_WEBHOOK_SECRET') ?? process.env.POLAR_WEBHOOK_SECRET);

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

    // Handle different event types deterministically
    switch (event.type) {
      case 'order.created': {
        const order = event.data as Record<string, unknown>;
        console.info(`[Polar] Order created: ${order.id} for amount ${order.amount}`);
        try {
          const dehost = createAdminClient();
          await dehost.from('audit_log').insert({
            action: 'polar_order_created',
            entity_type: 'polar_order',
            entity_id: String(order.id ?? ''),
            metadata: {
              amount: order.amount,
              currency: order.currency,
              customer_id: order.customer_id,
              status: order.status,
            },
            created_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('[Polar] Non-fatal order audit recording error:', dbErr);
        }
        break;
      }

      case 'subscription.created': {
        const sub = event.data as Record<string, unknown>;
        console.info(`[Polar] Subscription created: ${sub.id}`);
        try {
          const dehost = createAdminClient();
          await dehost.from('audit_log').insert({
            action: 'polar_subscription_created',
            entity_type: 'polar_subscription',
            entity_id: String(sub.id ?? ''),
            metadata: {
              status: sub.status,
              customer_id: sub.customer_id,
            },
            created_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('[Polar] Non-fatal subscription audit recording error:', dbErr);
        }
        break;
      }

      default:
        console.info(`[Polar] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Polar] Webhook processing failed:', error);
    return NextResponse.json({ error: 'Invalid payload or signature' }, { status: 400 });
  }
}
export const runtime = "nodejs";
