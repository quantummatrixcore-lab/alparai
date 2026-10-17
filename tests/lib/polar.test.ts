import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { Webhooks, verifyPolarSignature } from '@/lib/polar';

describe('Polar Webhook Signature Verification', () => {
  const secret = 'polar_whsec_test_secret_1234567890';
  const payload = JSON.stringify({
    type: 'order.created',
    data: {
      id: 'ord_12345',
      amount: 4900,
      currency: 'usd',
    },
  });

  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  describe('verifyPolarSignature', () => {
    it('returns true for a genuine, valid HMAC signature', () => {
      const result = verifyPolarSignature(validSignature, payload, secret);
      expect(result).toBe(true);
    });

    it('returns false for forged signature with same length', () => {
      const forgedSig = 'a'.repeat(validSignature.length);
      const result = verifyPolarSignature(forgedSig, payload, secret);
      expect(result).toBe(false);
    });

    it('returns false for signature with mismatched length without throwing', () => {
      const shortSig = 'invalid_short_sig';
      const result = verifyPolarSignature(shortSig, payload, secret);
      expect(result).toBe(false);
    });

    it('returns false when payload is tampered', () => {
      const tamperedPayload = payload + ' ';
      const result = verifyPolarSignature(validSignature, tamperedPayload, secret);
      expect(result).toBe(false);
    });

    it('returns false when secret is empty or missing', () => {
      expect(verifyPolarSignature(validSignature, payload, '')).toBe(false);
      expect(verifyPolarSignature(validSignature, payload, undefined)).toBe(false);
    });

    it('returns false when signature is empty or missing', () => {
      expect(verifyPolarSignature('', payload, secret)).toBe(false);
      expect(verifyPolarSignature(undefined, payload, secret)).toBe(false);
    });
  });

  describe('Webhooks.validateSignature', () => {
    it('returns true when webhook-signature header matches', () => {
      const result = Webhooks.validateSignature({
        payload,
        headers: { 'webhook-signature': validSignature },
        webhookSecret: secret,
      });
      expect(result).toBe(true);
    });

    it('returns false when webhook-signature is missing or invalid', () => {
      expect(
        Webhooks.validateSignature({
          payload,
          headers: {},
          webhookSecret: secret,
        })
      ).toBe(false);

      expect(
        Webhooks.validateSignature({
          payload,
          headers: { 'webhook-signature': 'bad_signature' },
          webhookSecret: secret,
        })
      ).toBe(false);
    });
  });

  describe('Webhooks.verify', () => {
    it('successfully parses payload on valid signature', () => {
      const event = Webhooks.verify({
        payload,
        headers: { 'webhook-signature': validSignature },
        webhookSecret: secret,
      });
      expect(event.type).toBe('order.created');
      expect(event.data.id).toBe('ord_12345');
      expect(event.data.amount).toBe(4900);
    });

    it('throws error when webhook-signature header is missing', () => {
      expect(() => {
        Webhooks.verify({
          payload,
          headers: {},
          webhookSecret: secret,
        });
      }).toThrow('Missing webhook-signature header');
    });

    it('throws error when webhookSecret is missing (preventing bypass)', () => {
      expect(() => {
        Webhooks.verify({
          payload,
          headers: { 'webhook-signature': validSignature },
          webhookSecret: '',
        });
      }).toThrow('Missing webhook secret');
    });

    it('throws error when signature is invalid or forged', () => {
      expect(() => {
        Webhooks.verify({
          payload,
          headers: { 'webhook-signature': '0000000000000000000000000000000000000000000000000000000000000000' },
          webhookSecret: secret,
        });
      }).toThrow('Invalid webhook signature');
    });
  });
});
