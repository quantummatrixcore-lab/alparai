import React from 'react';
import { PricingSection } from '@/components/marketing/pricing-section';
import Script from 'next/script';

export const metadata = {
  title: 'Pricing | AlparAi',
  description: 'Choose the right plan for your business.',
};

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AlparAi Pricing",
    "description": "Pricing plans for AlparAi",
    "mainEntity": {
      "@type": "OfferCatalog",
      "name": "AlparAi Plans",
      "itemListElement": [
        {
          "@type": "Offer",
          "name": "Starter",
          "price": "49.00",
          "priceCurrency": "USD",
          "url": "https://alparai.lemonsqueezy.com/checkout/buy/starter-id"
        },
        {
          "@type": "Offer",
          "name": "Professional",
          "price": "199.00",
          "priceCurrency": "USD",
          "url": "https://alparai.lemonsqueezy.com/checkout/buy/pro-id"
        },
        {
          "@type": "Offer",
          "name": "Enterprise",
          "price": "999.00",
          "priceCurrency": "USD",
          "url": "https://alparai.lemonsqueezy.com/checkout/buy/ent-id"
        }
      ]
    }
  };

  return (
    <>
      <Script
        id="pricing-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <PricingSection />
      </main>
    </>
  );
}

