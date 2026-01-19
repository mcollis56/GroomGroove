"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

export default function PricingPage() {
  const [loadingTrial, setLoadingTrial] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);

  const PRICE_ID = "price_1SpjQlGzqO94XgciE9C3FjsE";

  async function handleCheckout(skipTrial: boolean) {
    if (skipTrial) setLoadingBuy(true);
    else setLoadingTrial(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: PRICE_ID,
          skipTrial: skipTrial,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error creating checkout session.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoadingTrial(false);
      setLoadingBuy(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Upgrade to Pro</h1>
      <p className="text-gray-500 mb-12">Unlock the full power of Groom Groove.</p>

      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden max-w-md mx-auto">
        <div className="bg-blue-50 p-6 border-b border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900">Pro Plan</h2>
          <div className="mt-4 flex items-baseline justify-center">
            <span className="text-5xl font-extrabold text-gray-900">$79</span>
            <span className="ml-2 text-xl text-gray-500">/month</span>
          </div>
        </div>

        <div className="p-8">
          <ul className="space-y-4 text-left mb-8">
            {[
              "Unlimited Dogs",
              "SMS Reminders",
              "Revenue Reports",
              "Priority Support",
            ].map((feat) => (
              <li key={feat} className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-4">
            <Button
              onClick={() => handleCheckout(false)}
              disabled={loadingTrial || loadingBuy}
              className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loadingTrial ? "Loading..." : "Start 14-Day Free Trial"}
            </Button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <Button
              onClick={() => handleCheckout(true)}
              disabled={loadingTrial || loadingBuy}
              variant="outline"
              className="w-full h-12 text-lg font-bold border-2 border-gray-200 hover:bg-gray-50 text-gray-700"
            >
              {loadingBuy ? "Loading..." : "Pay Now (Skip Trial)"}
            </Button>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
