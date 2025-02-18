import React, { useState, useEffect } from 'react';
import { Crown, X, Save } from 'lucide-react';

interface PremiumPromptProps {
  onClose: () => void;
  onUpgrade: () => void;
  onSaveAndReturn?: () => void;
  showSaveOption?: boolean;
}

export default function PremiumPrompt({ onClose, onUpgrade, onSaveAndReturn, showSaveOption = false }: PremiumPromptProps) {
  const [showBuyButton, setShowBuyButton] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  useEffect(() => {
    // Check if Stripe script is loaded
    const checkStripeLoaded = () => {
      if (window.Stripe) {
        setStripeLoaded(true);
      }
    };

    // Check immediately
    checkStripeLoaded();

    // Also check when script loads
    const script = document.querySelector('script[src*="buy-button.js"]');
    if (script) {
      script.addEventListener('load', checkStripeLoaded);
    }

    return () => {
      if (script) {
        script.removeEventListener('load', checkStripeLoaded);
      }
    };
  }, []);

  const handleUpgradeClick = () => {
    setShowBuyButton(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="editor-sidebar rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {!showBuyButton ? (
          <>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold">Unlock Premium Features</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-500">✓</span>
                  </div>
                  <span>Unlimited notes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-500">✓</span>
                  </div>
                  <span>Advanced export options (PDF, Word, Google Docs)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-500">✓</span>
                  </div>
                  <span>Priority support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-500">✓</span>
                  </div>
                  <span>Early access to new features</span>
                </li>
              </ul>
            </div>

            <div className="text-center mb-8">
              <div className="text-3xl font-bold mb-2">$10<span className="text-lg opacity-75">/month</span></div>
              <p className="text-sm opacity-75">Cancel anytime</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleUpgradeClick}
                className="btn btn-primary w-full h-12 inline-flex items-center justify-center space-x-2"
              >
                <Crown className="h-5 w-5" />
                <span>Upgrade Now</span>
              </button>
              {showSaveOption && onSaveAndReturn && (
                <button
                  onClick={onSaveAndReturn}
                  className="btn btn-secondary w-full h-12 inline-flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>Save and Return to Dashboard</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="btn btn-secondary w-full"
              >
                Maybe Later
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Complete Your Purchase</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {stripeLoaded ? (
              <div className="min-h-[400px]">
                <stripe-buy-button
                  buy-button-id="buy_btn_1QqLR0EWwDIsISN7FeurKkbs"
                  publishable-key="pk_live_51OG4stEWwDIsISN7XykWAuxMFMMzlJ1MSTq9HqJQQQdOPyZtz3pYsTBSmHz6JjIKO7ZVYnlpJM80N4V2LxHGVehN00VbWGtNyC"
                >
                </stripe-buy-button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}