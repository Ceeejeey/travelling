import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const RightCard = ({ item }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPayPal, setShowPayPal] = useState(false); // Toggle PayPal buttons visibility
  const stripe = useStripe();

  const handleStripePayment = async () => {
    setIsLoading(true);
    setError(null);
    setShowPayPal(false); // Hide PayPal buttons if visible

    const bookingData = {
      tripName: item.duration, // Adjust if you have a specific name field
      amount: Math.round(item.price * 100), // Convert dollars to cents
      quantity: 1,
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/custompage`,
    };

    try {
      const response = await axios.post(
        'http://localhost:4000/api/payments/create-checkout-session/stripe',
        bookingData
      );

      // Redirect to Stripe Checkout using the session ID
      const { sessionId } = response.data;
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      setError('Failed to initiate Stripe payment. Please try again.');
      console.error('Stripe payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayPalClick = () => {
    setShowPayPal(true); // Show PayPal buttons
    setError(null); // Clear any existing errors
  };

  const createPayPalOrder = async () => {
    setIsLoading(true);
    setError(null);

    const bookingData = {
      tripName: item.duration, // Adjust if you have a specific name field
      amount: Math.round(item.price * 100), // Convert dollars to cents for consistency
      quantity: 1,
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/custompage`,
    };

    try {
      const response = await axios.post(
        'http://localhost:4000/api/payments/create-checkout-session/paypal',
        bookingData
      );
      return response.data.orderId;
    } catch (err) {
      setError('Failed to initiate PayPal payment. Please try again.');
      console.error('PayPal order creation error:', err);
      setIsLoading(false);
      throw err;
    }
  };

  const onPayPalApprove = async (data, actions) => {
    try {
      // Capture the payment on PayPal's servers
      const details = await actions.order.capture();
      setIsLoading(false);
      // Notify backend to store payment details
      await axios.post('http://localhost:4000/api/payments/capture-paypal-payment', {
        orderId: data.orderID,
      });
      // Redirect to success page
      window.location.href = `${window.location.origin}/success`;
    } catch (err) {
      setError('Failed to capture PayPal payment. Please try again.');
      console.error('PayPal capture error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-1/3">
      <div className="sticky bg-green-100 p-4 rounded-xl shadow-lg shadow-green-800 space-y-6 border border-gray-200 self-start mt-10">
        {/* Duration */}
        <div>
          <h3 className="text-gray-600 text-sm">Duration</h3>
          <p className="text-gray-800 font-semibold text-base">{item.duration}</p>
        </div>

        {/* Booking Info */}
        <div className="text-sm">
          <p className="font-semibold text-black mb-1">
            Book before <span className="font-normal ml-2">{item.book_before}</span>
          </p>
          <p className="font-semibold text-black">
            Stay between <span className="font-normal ml-2">{item.stay_between}</span>
          </p>
        </div>

        {/* Price */}
        <div>
          <p className="text-2xl font-bold text-black">USD ${item.price}</p>
          <p className="text-sm text-gray-600">Per Person</p>
        </div>

        {/* Payment Buttons */}
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleStripePayment}
            disabled={isLoading || !stripe}
            className={`bg-green-500 text-white px-6 py-2 rounded-full transition text-sm font-semibold ${
              isLoading || !stripe ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
            }`}
          >
            {isLoading && !showPayPal ? 'Processing...' : 'Pay with Stripe'}
          </button>
          <button
            onClick={handlePayPalClick}
            disabled={isLoading}
            className={`bg-blue-600 text-white px-6 py-2 rounded-full transition text-sm font-semibold ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isLoading && showPayPal ? 'Processing...' : 'Pay with PayPal'}
          </button>

          {/* PayPal Buttons (shown only after clicking PayPal button) */}
          {showPayPal && (
            <PayPalScriptProvider
              options={{
                'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
                currency: 'USD',
              }}
            >
              <PayPalButtons
                style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
                disabled={isLoading}
                createOrder={createPayPalOrder}
                onApprove={onPayPalApprove}
                onError={(err) => {
                  setError('PayPal payment failed. Please try again.');
                  console.error('PayPal button error:', err);
                  setIsLoading(false);
                }}
              />
            </PayPalScriptProvider>
          )}
        </div>

        {/* Error Message */}
        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Reply Note */}
        <p className="text-xs text-gray-500">*Our reply time is almost instant</p>

        <img
          src="https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg"
          alt="Travel"
          className="w-1/2"
        />
      </div>

      {/* More Detail */}
      <div className="mt-10">
        <p className="prata-regular text-sm sm:text-xl mt-10">More Detail</p>
        <p className="inter-regular text-base sm:text-sm mt-10 letter-spacing: var(--tracking-wide)">
          {item.moreDetail}
        </p>
      </div>
    </div>
  );
};

// Wrap with Stripe Elements provider
const WrappedRightCard = (props) => (
  <Elements stripe={stripePromise}>
    <RightCard {...props} />
  </Elements>
);

export default WrappedRightCard;