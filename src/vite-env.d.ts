/// <reference types="vite/client" />

interface Window {
  Stripe?: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    'stripe-buy-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'buy-button-id': string;
      'publishable-key': string;
    };
  }
}