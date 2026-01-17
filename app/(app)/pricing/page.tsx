'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      // Calls your backend to start the session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // We send the Price ID. If you set STRIPE_PRICE_ID in Vercel, 
        // the backend can default to it, but sending it explicitly is safer.
        body: JSON.stringify({ 
          priceId: 'price_1SpjQlGzqO94XgciE9C3FJsE' 
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        console.error('No checkout URL returned', data);
        alert('Something went wrong starting checkout. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error connecting to checkout. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Simple, Transparent Pricing
        </h2>
        <p className="mt-4 text-xl text-gray-500">
          Everything you need to manage your salon.
        </p>
      </div>

      <div className="mt-16 max-w-lg mx-auto rounded-lg shadow-lg overflow-hidden lg:max-w-none lg:flex lg:justify-center">
        <div className="flex-1 bg-white px-6 py-8 lg:p-12 max-w-md">
          <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            GroomGroove Pro
          </h3>
          <p className="mt-6 text-base text-gray-500">
            The complete toolkit for professional groomers. Unlimited dogs, appointments, and peace of mind.
          </p>
          <div className="mt-8">
            <div className="flex items-center">
              <h4 className="flex-shrink-0 pr-4 bg-white text-sm tracking-wider font-semibold uppercase text-indigo-600">
                What's included
              </h4>
              <div className="flex-1 border-t-2 border-gray-200" />
            </div>
            <ul className="mt-8 space-y-5 lg:space-y-0 lg:grid lg:grid-cols-1 lg:gap-x-8 lg:gap-y-5">
              {[
                'Unlimited Client & Dog Profiles',
                'Visual Calendar & Booking',
                'SMS Appointment Reminders',
                'Grooming History & Notes',
                'Revenue Reporting',
                'Mobile & Tablet Optimized',
              ].map((feature) => (
                <li key={feature} className="flex items-start lg:col-span-1">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
                  </div>
                  <p className="ml-3 text-sm text-gray-700">{feature}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="py-8 px-6 text-center bg-gray-50 lg:flex-shrink-0 lg:flex lg:flex-col lg:justify-center lg:p-12 border-t lg:border-t-0 lg:border-l border-gray-200">
          <p className="text-lg leading-6 font-medium text-gray-900">
            Monthly Subscription
          </p>
          <div className="mt-4 flex items-center justify-center text-5xl font-extrabold text-gray-900">
            <span>$79</span>
            <span className="ml-3 text-xl font-medium text-gray-500">
              /mo
            </span>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Cancel anytime.
          </p>
          <div className="mt-6">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Preparing Checkout...' : 'Subscribe Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
