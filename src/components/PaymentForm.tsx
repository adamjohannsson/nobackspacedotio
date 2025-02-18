import React from 'react';

export default function PaymentForm() {
  return (
    <div className="space-y-6">
      <stripe-buy-button
        buy-button-id="buy_btn_1QqLR0EWwDIsISN7FeurKkbs"
        publishable-key="pk_live_51OG4stEWwDIsISN7XykWAuxMFMMzlJ1MSTq9HqJQQQdOPyZtz3pYsTBSmHz6JjIKO7ZVYnlpJM80N4V2LxHGVehN00VbWGtNyC"
      >
      </stripe-buy-button>
    </div>
  );
}