'use client'

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { setupBusiness } from "@/lib/actions/onboarding";
import { Rocket, AlertCircle } from "lucide-react";

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This wrapper function handles the submission
  const clientAction = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    // We call the server action. 
    // If it succeeds and redirects, the browser will navigate away immediately.
    // If it fails, it returns an object with { error: ... }
    try {
      await setupBusiness(formData);
      // If success, the server action redirects and we never reach here
    } catch (err) {
      // Handle any errors that occur during setup
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to GroomGroove!</h1>
          <p className="text-gray-500 mt-2">Let's get your salon set up in 30 seconds.</p>
        </div>

        {/* ERROR MESSAGE DISPLAY */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* CHANGED: Use action={clientAction} instead of onSubmit */}
        <form action={clientAction} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
            <Input name="businessName" placeholder="e.g. Paws & Claws" required className="text-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salon Phone</label>
            <Input name="phone" placeholder="e.g. 0400 000 000" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
            <Input name="currency" defaultValue="$" className="w-20 text-center font-bold" />
          </div>

          <Button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-6 text-lg rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? "Setting up..." : "Start Grooming 🚀"}
          </Button>
        </form>
      </div>
    </div>
  );
}
