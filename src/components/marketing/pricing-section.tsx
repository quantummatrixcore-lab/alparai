import React from 'react';
import Link from 'next/link';

export const PricingSection = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$49',
      interval: '/ay',
      features: ['Temel Özellikler', 'API Erişimi', 'Standart Destek'],
      productId: 'starter-id', // Replace with real LemonSqueezy ID
    },
    {
      name: 'Professional',
      price: '$199',
      interval: '/ay',
      features: ['Tüm Starter Özellikleri', 'Gelişmiş Analitik', 'Öncelikli Destek'],
      productId: 'pro-id', // Replace with real LemonSqueezy ID
    },
    {
      name: 'Enterprise',
      price: '$999',
      interval: '/ay',
      features: ['Tüm Pro Özellikleri', 'Özel Entegrasyonlar', '7/24 Destek'],
      productId: 'ent-id', // Replace with real LemonSqueezy ID
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Fiyatlandırma Paketleri</h2>
          <p className="mt-4 text-xl text-gray-600">14-Day Free Trial, No Credit Card Required</p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-white rounded-lg shadow-lg border border-gray-200 divide-y divide-gray-200">
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-gray-500">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-base font-medium text-gray-500">{plan.interval}</span>
                </p>
                <Link href={`https://alparai.lemonsqueezy.com/checkout/buy/${plan.productId}`} className="mt-8 block w-full bg-blue-600 border border-transparent rounded-md py-3 px-4 text-center text-white font-medium hover:bg-blue-700">
                  Satın Al {plan.name}
                </Link>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">Neler Dahil?</h4>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
