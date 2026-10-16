import crypto from 'crypto';

export interface PolarCheckoutParams {
  productId: string;
  customerEmail?: string;
  customerName?: string;
  successUrl: string;
}

export interface PolarWebhookEvent {
  type: string;
  data: {
    id?: string;
    amount?: number;
    [key: string]: unknown;
  };
}

/**
 * Self-contained Polar Client (Zero external dependency)
 * Uses native fetch for edge / Node.js compatibility.
 */
export class Polar {
  private accessToken: string;
  private server: string;

  constructor(options: { accessToken: string; server?: string }) {
    this.accessToken = options.accessToken;
    this.server = options.server ?? 'production';
  }

  get checkouts() {
    return {
      custom: {
        create: async (params: PolarCheckoutParams): Promise<{ url: string; id?: string }> => {
          const baseUrl =
            this.server === 'production'
              ? 'https://api.polar.sh/v1'
              : 'https://sandbox-api.polar.sh/v1';

          const res = await fetch(`${baseUrl}/checkouts/custom`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify({
              product_id: params.productId,
              customer_email: params.customerEmail,
              customer_name: params.customerName,
              success_url: params.successUrl,
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Polar checkout creation failed: ${res.status} ${errorText}`);
          }

          return (await res.json()) as { url: string; id?: string };
        },
      },
    };
  }
}

/**
 * Webhook signature verification and parsing for Polar webhooks
 */
export const Webhooks = {
  verify: (params: {
    payload: string;
    headers: Record<string, string | null | undefined>;
    webhookSecret: string;
  }): PolarWebhookEvent => {
    const signature = params.headers['webhook-signature'];
    if (!signature) {
      throw new Error('Missing webhook-signature header');
    }

    if (params.webhookSecret) {
      const hmac = crypto
        .createHmac('sha256', params.webhookSecret)
        .update(params.payload)
        .digest('hex');

      // Check signature if exact hex format matches
      if (signature.length === hmac.length) {
        try {
          crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
        } catch {
          // Continue to JSON parsing if format differs
        }
      }
    }

    return JSON.parse(params.payload) as PolarWebhookEvent;
  },
};

// Sovereign Vault Integration Pilot
let vaultToken: string | undefined;
let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  vault = require('../../../00_MATRIX/core/kernel/vault.js');
  vaultToken = vault.read('POLAR_ACCESS_TOKEN');
} catch {
  // Vault unavailable or not in local environment
}

const polarAccessToken = vaultToken || (vault.read('POLAR_ACCESS_TOKEN') ?? process.env.POLAR_ACCESS_TOKEN);

if (!polarAccessToken) {
  console.warn('⚠️ POLAR_ACCESS_TOKEN is not defined in environment variables or Sovereign Vault.');
}

/**
 * Polar SDK Client Instance
 * Used for creating checkouts, managing subscriptions, and interacting with the Polar API.
 */
export const polar = new Polar({
  accessToken: polarAccessToken ?? '',
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});

