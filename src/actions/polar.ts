'use server';

import { polar } from '@/lib/polar';
import { redirect } from 'next/navigation';

interface CreateCheckoutParams {
  productId: string;
  customerEmail?: string;
  customerName?: string;
  successUrl: string;
}

/**
 * Creates a Polar Checkout Session and redirects the user to the payment page.
 */
export async function createPolarCheckout(params: CreateCheckoutParams) {
  try {
    const checkout = await polar.checkouts.custom.create({
      productId: params.productId,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      successUrl: params.successUrl,
    });

    if (!checkout || !checkout.url) {
      throw new Error('Failed to generate checkout URL');
    }

    // Redirect to Polar's hosted checkout page
    redirect(checkout.url);
  } catch (error: unknown) {
    console.error('Polar Checkout Error:', error);
    // You can handle error responses here (e.g., throwing a user-friendly message)
    throw new Error('Failed to create checkout page. Please try again later.');
  }
}
