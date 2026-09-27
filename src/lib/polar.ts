import { Polar } from '@polar-sh/sdk';

if (!process.env.POLAR_ACCESS_TOKEN) {
  console.warn('⚠️ POLAR_ACCESS_TOKEN is not defined in environment variables.');
}

/**
 * Polar SDK Client Instance
 * Used for creating checkouts, managing subscriptions, and interacting with the Polar API.
 */
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? '',
  // Set to 'sandbox' for testing, 'production' for live
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});
