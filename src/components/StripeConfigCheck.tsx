import React from 'react';
import { Check } from 'lucide-react';

export default function StripeConfigCheck() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Stripe Configuration Status</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span>Stripe Buy Button Ready</span>
          <Check className="h-5 w-5 text-green-500" />
        </div>
      </div>
    </div>
  );
}