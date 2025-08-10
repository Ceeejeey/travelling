import React, { useState, useContext, useEffect, Component } from 'react';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { TravelContext } from '../../Context/TravelContext';
import { toast } from 'react-toastify';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 text-center p-4">
          <p>Something went wrong: {this.state.errorMessage}</p>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const RightCard = ({ item }) => {
  const { navigate } = useContext(TravelContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPayPal, setShowPayPal] = useState(false);

  // Load PayHere SDK
  useEffect(() => {
    const payhereScriptUrl = 'https://www.payhere.lk/lib/payhere.js';

    const script = document.createElement('script');
    script.src = payhereScriptUrl;
    script.async = true;
    script.onload = () => {
      console.log('PayHere SDK loaded successfully');
      if (window.payhere) {
        window.payhere.onCompleted = (orderId) => {
          console.log('Payment completed. OrderID:', orderId);
          setIsLoading(false);
          toast.success(`PayHere payment completed: OrderID ${orderId}`);
          navigate('/success');
        };

        window.payhere.onDismissed = () => {
          console.log('Payment dismissed');
          setIsLoading(false);
          setError('PayHere payment was cancelled.');
          toast.info('PayHere payment cancelled');
        };

        window.payhere.onError = (error) => {
          console.error('PayHere error:', error);
          setIsLoading(false);
          setError(`PayHere payment failed: ${error}`);
          toast.error(`PayHere payment failed: ${error}`);
        };
      } else {
        console.error('PayHere SDK not initialized');
        setError('Failed to load payment system. Please try again.');
        toast.error('Payment system unavailable');
      }
    };
    script.onerror = () => {
      console.error('Failed to load PayHere SDK from:', payhereScriptUrl);
      setError('Failed to load payment system. Please try again.');
      toast.error('Payment system unavailable');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (window.payhere) {
        window.payhere.onCompleted = null;
        window.payhere.onDismissed = null;
        window.payhere.onError = null;
      }
    };
  }, [navigate]);

  const handlePayHerePayment = async () => {
    if (!item || !item.price || !item.duration) {
      setError('Invalid package data');
      toast.error('Invalid package data');
      return;
    }

    if (!window.payhere) {
      setError('Payment system not loaded. Please try again.');
      toast.error('Payment system not loaded');
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowPayPal(false);

    const payment = {
      sandbox: true,
      merchant_id: import.meta.env.VITE_PAYHERE_MERCHANT_ID,
      return_url: `${window.location.origin}/success`,
      cancel_url: `${window.location.origin}/custompage`,
      notify_url: `https://232db9201b90.ngrok-free.app/api/payments/notify/payhere`,
      order_id: `ORDER_${Date.now()}`,
      items: item.name || item.duration,
      amount: item.price.toFixed(2),
      currency: 'USD',
      first_name: 'Customer',
      last_name: 'Traveler',
      email: 'customer@example.com',
      phone: '1234567890',
      address: '123 Travel St',
      city: 'Travel City',
      country: 'United States',
      delivery_address: '123 Travel St',
      delivery_city: 'Travel City',
      delivery_country: 'United States',
      custom_1: '',
      custom_2: '',
      iframe: false // Explicitly disable iframe mode
    };

    try {
      console.log('Sending payment request to backend:', payment);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/initiate/payhere`,
        payment
      );
      console.log('Backend response:', response.data);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to initiate PayHere payment');
      }
      payment.hash = response.data.hash;
      console.log('Initiating PayHere payment:', payment);
      window.payhere.startPayment(payment);
    } catch (err) {
      setError('Failed to initiate PayHere payment. Please try again.');
      console.error('PayHere payment error:', err.message);
      setIsLoading(false);
      toast.error('PayHere payment initiation failed: ' + err.message);
    }
  };

  const handlePayPalClick = () => {
    setShowPayPal(true);
    setError(null);
  };

  const createPayPalOrder = async () => {
    if (!item || !item.price || !item.duration) {
      setError('Invalid package data');
      setIsLoading(false);
      setShowPayPal(false);
      toast.error('Invalid package data');
      return;
    }

    setIsLoading(true);
    setError(null);

    const bookingData = {
      tripName: item.name || item.duration,
      amount: Math.round(item.price * 100),
      quantity: 1,
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/custompage`,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/create-checkout-session/paypal`,
        bookingData
      );
      return response.data.orderId;
    } catch (err) {
      setError('Failed to initiate PayPal payment. Please try again.');
      console.error('PayPal order creation error:', err);
      setIsLoading(false);
      setShowPayPal(false);
      toast.error('PayPal payment initiation failed');
      throw err;
    }
  };

  const onPayPalApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture();
      setIsLoading(false);
      setShowPayPal(false);
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/payments/capture-paypal-payment`, {
        orderId: data.orderID,
      });
      toast.success('PayPal payment completed successfully');
      navigate('/success');
    } catch (err) {
      setError('Failed to capture PayPal payment. Please try again.');
      console.error('PayPal capture error:', err);
      setIsLoading(false);
      setShowPayPal(false);
      toast.error('PayPal payment failed');
    }
  };

  const onPayPalCancel = () => {
    console.log('PayPal modal cancelled');
    setIsLoading(false);
    setShowPayPal(false);
    setError('PayPal payment was cancelled.');
    toast.info('PayPal payment cancelled');
  };

  return (
    <ErrorBoundary>
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

          {/* Loading Spinner */}
          {isLoading && (
            <div className="text-center text-gray-600">Processing payment...</div>
          )}

          {/* Payment Buttons */}
          <div className="flex flex-col space-y-4">
            <button
              id="payhere-payment"
              onClick={handlePayHerePayment}
              disabled={isLoading}
              className={`bg-green-500 text-white px-6 py-2 rounded-full transition text-sm font-semibold ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
              }`}
            >
              {isLoading ? 'Processing...' : 'Pay with PayHere'}
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

            {/* PayPal Buttons */}
            {showPayPal && (
              <PayPalScriptProvider
                options={{
                  'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
                  currency: 'USD',
                  components: 'buttons,card-fields',
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
                    setShowPayPal(false);
                    toast.error('PayPal payment failed');
                  }}
                  onCancel={onPayPalCancel}
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
    </ErrorBoundary>
  );
};

export default RightCard;