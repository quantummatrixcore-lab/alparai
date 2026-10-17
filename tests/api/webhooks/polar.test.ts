import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { NextRequest } from 'next/server';

const TEST_SECRET = 'whsec_polar_test_secret_998877665544332211';

vi.hoisted(() => {
  process.env.POLAR_WEBHOOK_SECRET = 'whsec_polar_test_secret_998877665544332211';
});

const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockFrom = vi.fn().mockReturnValue({
  insert: mockInsert,
});

vi.mock('@/lib/dehost/admin', () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

import { POST } from '@/app/api/webhooks/polar/route';

function signPayload(payload: string, secret: string = TEST_SECRET): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function createRequest(body: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost:3000/api/webhooks/polar', {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  });
}

describe('Polar Webhook Route POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when webhook-signature header is missing', async () => {
    const payload = JSON.stringify({ type: 'order.created', data: { id: 'ord_1' } });
    const req = createRequest(payload, {});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing signature');
  });

  it('returns 400 when webhook signature is forged or invalid', async () => {
    const payload = JSON.stringify({ type: 'order.created', data: { id: 'ord_1' } });
    const badSig = '0000000000000000000000000000000000000000000000000000000000000000';
    const req = createRequest(payload, { 'webhook-signature': badSig });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid payload or signature');
  });

  it('returns 200 and logs audit record for valid order.created', async () => {
    const payload = JSON.stringify({
      type: 'order.created',
      data: {
        id: 'ord_999',
        amount: 5000,
        currency: 'USD',
        customer_id: 'cust_123',
        status: 'paid',
      },
    });
    const sig = signPayload(payload);
    const req = createRequest(payload, { 'webhook-signature': sig });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('audit_log');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'polar_order_created',
        entity_id: 'ord_999',
      })
    );
  });

  it('returns 200 and logs audit record for valid subscription.created', async () => {
    const payload = JSON.stringify({
      type: 'subscription.created',
      data: {
        id: 'sub_888',
        status: 'active',
        customer_id: 'cust_456',
      },
    });
    const sig = signPayload(payload);
    const req = createRequest(payload, { 'webhook-signature': sig });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('audit_log');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'polar_subscription_created',
        entity_id: 'sub_888',
      })
    );
  });
});
