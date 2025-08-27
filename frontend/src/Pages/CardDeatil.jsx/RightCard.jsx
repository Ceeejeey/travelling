import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { TravelContext } from '../../Context/TravelContext';
import { toast } from 'react-toastify';

// Error Boundary Component
class ErrorBoundary extends React.Component {
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
  const [isPayPalDisabled, setIsPayPalDisabled] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    delivery_address: '',
    delivery_city: '',
    delivery_country: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [showForm, setShowForm] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');
  const hasFetchedCsrf = useRef(false);
  const retryCount = useRef(0);

  // Clear all storage and cookies
  const clearSessionData = async () => {
    try {
      // Clear storage
      sessionStorage.clear();
      localStorage.clear();
      setCsrfToken('');
      hasFetchedCsrf.current = false;

      // Clear cookies
      const domain = window.location.hostname === 'localhost' ? undefined : 'ceejeey.me';
      document.cookie = `session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;${domain ? ` domain=${domain};` : ''} secure=${window.location.protocol === 'http:'}; SameSite=none`;
      document.cookie = `_csrf=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;${domain ? ` domain=${domain};` : ''} secure=${window.location.protocol === 'http:'}; SameSite=none`;

      // Clear backend order and session
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/clear-order`,
        { tripName: item?.name || item?.duration, paymentType: 'paypal' },
        { withCredentials: true }
      );
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/logout`,
        {},
        { withCredentials: true }
      );
      console.log('Session data, cookies, and order state cleared');
    } catch (err) {
      console.error('Error clearing session data:', err);
    }
  };

  // Fetch CSRF token once with retry on session error
  const fetchCsrfToken = useCallback(async () => {
    if (hasFetchedCsrf.current) {
      console.log('CSRF token already fetched, skipping...');
      return;
    }
    hasFetchedCsrf.current = true;
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/payments/csrf-token`, {
        withCredentials: true,
      });
      const token = response.data.csrfToken;
      setCsrfToken(token);
      sessionStorage.setItem('csrfToken', token);
      console.log('CSRF token fetched:', token);
    } catch (err) {
      console.error('Failed to fetch CSRF token:', err.message);
      if ((err.response?.status === 500 && err.response?.data?.error === 'Session not initialized') && retryCount.current < 2) {
        console.log('Retrying CSRF token fetch due to session initialization failure, attempt:', retryCount.current + 1);
        retryCount.current += 1;
        hasFetchedCsrf.current = false; // Allow retry
        await clearSessionData();
        await fetchCsrfToken(); // Retry
      } else {
        setError('Failed to initialize payment system. Please try again.');
        toast.error('Payment system initialization failed');
        hasFetchedCsrf.current = false;
      }
    }
  }, []);

  // Validate session cookies
  const validateSession = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/payments/check-session`, {
        withCredentials: true,
      });
      console.log('Session validated:', response.data);
      return response.data.valid;
    } catch (err) {
      console.error('Session validation failed:', err.message);
      if (err.response?.status === 404) {
        console.warn('Session check endpoint not found, proceeding without validation');
        return true;
      }
      await clearSessionData();
      await fetchCsrfToken();
      return false;
    }
  };

  // Log component mount and fetch CSRF token
  useEffect(() => {
    console.log('RightCard mounted for item:', item?.name || item?.duration);
    fetchCsrfToken();
    return () => {
      console.log('RightCard unmounted for item:', item?.name || item?.duration);
    };
  }, [item, fetchCsrfToken]);

  // Load PayHere SDK
  useEffect(() => {
    const payhereScriptUrl = 'https://www.payhere.lk/lib/payhere.js';
    const script = document.createElement('script');
    script.src = payhereScriptUrl;
    script.async = true;
    script.onload = () => {
      console.log('PayHere SDK loaded successfully from:', payhereScriptUrl);
      if (window.payhere) {
        window.payhere.onCompleted = (orderId) => {
          console.log('Payment completed. OrderID:', orderId);
          setIsLoading(false);
          setShowForm(true);
          toast.success(`PayHere payment completed: OrderID ${orderId}`);
          navigate(`/success?orderId=${orderId}`);
        };
        window.payhere.onDismissed = async () => {
          console.log('Payment dismissed');
          setIsLoading(false);
          setShowPayPal(false);
          setShowForm(true);
          setError('PayHere payment was cancelled.');
          toast.info('PayHere payment cancelled');
          await clearSessionData();
          await fetchCsrfToken();
        };
        window.payhere.onError = async (error) => {
          console.error('PayHere error:', error);
          setIsLoading(false);
          setShowPayPal(false);
          setShowForm(true);
          setError(`PayHere payment failed: ${error}`);
          toast.error(`PayHere payment failed: ${error}`);
          await clearSessionData();
          await fetchCsrfToken();
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.country.trim()) errors.country = 'Country is required';
    if (!formData.delivery_address.trim()) errors.delivery_address = 'Delivery address is required';
    if (!formData.delivery_city.trim()) errors.delivery_city = 'Delivery city is required';
    if (!formData.delivery_country.trim()) errors.delivery_country = 'Delivery country is required';
    return errors;
  };

  // Handle form submission
  const handleFormSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fill in all required fields correctly');
      return;
    }
    setShowForm(false);
    setError(null);
    setIsPayPalDisabled(false);
  };

  // Handle back to form
  const handleBackToForm = async () => {
    setShowForm(true);
    setShowPayPal(false);
    setError(null);
    setIsPayPalDisabled(false);
    await clearSessionData();
    await fetchCsrfToken();
  };

  const handlePayHerePayment = async () => {
    if (!csrfToken) {
      setError('CSRF token not loaded. Please refresh and try again.');
      toast.error('CSRF token not loaded');
      return;
    }
    if (!item || !item.price || !item.duration) {
      setError('Invalid package data');
      toast.error('Invalid package data');
      setShowForm(true);
      return;
    }
    if (!window.payhere) {
      setError('Payment system not loaded. Please try again.');
      toast.error('Payment system not loaded');
      setShowForm(true);
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
      notify_url: `https://376c6260f905.ngrok-free.app/api/payments/notify/payhere`,
      order_id: `ORDER_${Date.now()}`,
      items: item.name || item.duration,
      amount: item.price.toFixed(2),
      currency: 'LKR',
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      delivery_address: formData.delivery_address,
      delivery_city: formData.delivery_city,
      delivery_country: formData.delivery_country,
      custom_1: '',
      custom_2: '',
      iframe: false,
    };
    try {
      console.log('Sending payment request to backend:', payment);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/initiate/payhere`,
        payment,
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      console.log('Backend response:', response.data);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to initiate PayHere payment');
      }
      payment.hash = response.data.hash;
      payment.custom_1 = response.data.custom_1;
      console.log('Initiating PayHere payment:', payment);
      window.payhere.startPayment(payment);
      console.log('Modal triggered, waiting for user interaction');
    } catch (err) {
      setError('Failed to initiate PayHere payment. Please try again.');
      console.error('PayHere payment error:', err.response?.data || err.message);
      setIsLoading(false);
      setShowForm(true);
      toast.error('PayHere payment initiation failed: ' + err.response?.data?.error || err.message);
      await clearSessionData();
      await fetchCsrfToken();
    }
  };

  const handlePayPalClick = async () => {
    const isSessionValid = await validateSession();
    if (!isSessionValid) {
      setError('Session invalid. Please refresh and try again.');
      toast.error('Session invalid. Please try again.');
      return;
    }
    setShowPayPal(true);
    setError(null);
    setIsPayPalDisabled(true);
  };

  const createPayPalOrder = async () => {
    if (!csrfToken) {
      setError('CSRF token not loaded. Please refresh and try again.');
      toast.error('CSRF token not loaded');
      setIsPayPalDisabled(false);
      return;
    }
    if (!item || !item.price || !item.duration) {
      setError('Invalid package data');
      setIsLoading(false);
      setShowPayPal(false);
      setShowForm(true);
      setIsPayPalDisabled(false);
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
      customer: {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
      },
    };
    try {
      console.log('Creating new PayPal order:', bookingData);
      // Clear order state before checking status
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/clear-order`,
        { tripName: bookingData.tripName, paymentType: 'paypal' },
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      console.log('Order state cleared before status check');
      const checkResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/check-order-status/${bookingData.tripName}`,
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      console.log('Order status check:', checkResponse.data);
      if (checkResponse.data.status === 'APPROVED' || checkResponse.data.status === 'COMPLETED') {
        setError('Previous order is already approved or completed. Please start a new payment.');
        toast.error('Previous order is already approved. Starting a new payment.');
        setIsLoading(false);
        setShowPayPal(false);
        setShowForm(true);
        setIsPayPalDisabled(false);
        await clearSessionData();
        await fetchCsrfToken();
        return;
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/create-checkout-session/paypal`,
        bookingData,
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      console.log('PayPal order created:', response.data.orderId);
      retryCount.current = 0;
      return response.data.orderId;
    } catch (err) {
      if (String(err).includes('global_session_not_found') && retryCount.current < 2) {
        console.log('Retrying PayPal order creation due to global_session_not_found, attempt:', retryCount.current + 1);
        retryCount.current += 1;
        await clearSessionData();
        await fetchCsrfToken();
        return createPayPalOrder(); // Retry
      }
      setError('Failed to initiate PayPal payment. Please try again.');
      console.error('PayPal order creation error:', err.response?.data || err.message);
      setIsLoading(false);
      setShowPayPal(false);
      setShowForm(true);
      setIsPayPalDisabled(false);
      toast.error('PayPal payment initiation failed');
      await clearSessionData();
      await fetchCsrfToken();
      retryCount.current = 0;
      throw err;
    }
  };

  const onPayPalApprove = async (data, actions) => {
    if (!csrfToken) {
      setError('CSRF token not loaded. Please refresh and try again.');
      toast.error('CSRF token not loaded');
      setIsPayPalDisabled(false);
      return;
    }
    try {
      console.log('Approving PayPal order:', { orderId: data.orderID, data, actions: Object.keys(actions), payer: data.payer });
      setIsLoading(true);
      const orderDetails = await actions.order.get();
      console.log('PayPal order details on approve:', orderDetails);
      if (orderDetails.status === 'COMPLETED') {
        setError('Order already completed. Please start a new payment.');
        toast.error('Order already completed. Starting a new payment.');
        setIsLoading(false);
        setShowPayPal(false);
        setShowForm(true);
        setIsPayPalDisabled(false);
        await clearSessionData();
        await fetchCsrfToken();
        return;
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/capture-paypal-payment`,
        {
          orderId: data.orderID,
          tripName: item.name || item.duration,
          customer: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            tripName: item.name || item.duration,
          },
        },
        {
          headers: { 'X-CSRF-Token': csrfToken },
          withCredentials: true,
        }
      );
      console.log('Backend capture response:', response.data);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to capture PayPal payment');
      }
      setIsLoading(false);
      setShowPayPal(false);
      toast.success('PayPal payment completed successfully');
      navigate(`/success?orderId=${data.orderID}`);
    } catch (err) {
      setIsLoading(false);
      setShowPayPal(false);
      setShowForm(true);
      setIsPayPalDisabled(false);
      if (err.response?.data?.error === 'Order already completed') {
        setError('This payment has already been processed. Please start a new payment.');
        toast.error('Payment already processed. Please try a new payment.');
      } else {
        setError('Failed to capture PayPal payment. Please try again.');
        toast.error('PayPal payment failed: ' + err.message);
      }
      console.error('PayPal capture error:', err.response?.data || err.message);
      await clearSessionData();
      await fetchCsrfToken();
    }
  };

  const onPayPalCancel = async () => {
    console.log('PayPal modal cancelled');
    setIsLoading(false);
    setShowPayPal(false);
    setShowForm(true);
    setIsPayPalDisabled(false);
    setError('PayPal payment was cancelled.');
    toast.info('PayPal payment cancelled');
    await clearSessionData();
    await fetchCsrfToken();
  };

  return (
    <ErrorBoundary>
      <div className="w-full md:w-1/3">
        <div className="sticky bg-green-100 p-4 rounded-xl shadow-lg shadow-green-800 space-y-6 border border-gray-200 self-start mt-10">
          <div>
            <h3 className="text-gray-600 text-sm">Duration</h3>
            <p className="text-gray-800 font-semibold text-base">{item.duration}</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-black mb-1">
              Book before <span className="font-normal ml-2">{item.book_before}</span>
            </p>
            <p className="font-semibold text-black">
              Stay between <span className="font-normal ml-2">{item.stay_between}</span>
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-black">USD ${item.price}</p>
            <p className="text-sm text-gray-600">Per Person</p>
          </div>
          {showForm && (
            <div className="space-y-4">
              <h3 className="text-gray-600 text-sm font-semibold">Enter Your Details</h3>
              <div>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                {formErrors.first_name && <p className="text-xs text-red-500">{formErrors.first_name}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                {formErrors.last_name && <p className="text-xs text-red-500">{formErrors.last_name}</p>}
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                {formErrors.address && <p className="text-xs text-red-500">{formErrors.address}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                {formErrors.city && <p className="text-xs text-red-500">{formErrors.city}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                {formErrors.country && <p className="text-xs text-red-500">{formErrors.country}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleInputChange}
                  placeholder="Delivery Address"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                {formErrors.delivery_address && <p className="text-xs text-red-500">{formErrors.delivery_address}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="delivery_city"
                  value={formData.delivery_city}
                  onChange={handleInputChange}
                  placeholder="Delivery City"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                {formErrors.delivery_city && <p className="text-xs text-red-500">{formErrors.delivery_city}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="delivery_country"
                  value={formData.delivery_country}
                  onChange={handleInputChange}
                  placeholder="Delivery Country"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                {formErrors.delivery_country && <p className="text-xs text-red-500">{formErrors.delivery_country}</p>}
              </div>
              <button
                onClick={handleFormSubmit}
                className="bg-green-500 text-white px-6 py-2 rounded-full transition text-sm font-semibold hover:bg-green-600"
              >
                Submit Details
              </button>
            </div>
          )}
          {!showForm && (
            <div className="space-y-2">
              <h3 className="text-gray-600 text-sm font-semibold">Your Details</h3>
              <p className="text-sm text-gray-800">Name: {formData.first_name} {formData.last_name}</p>
              <p className="text-sm text-gray-800">Email: {formData.email}</p>
              <p className="text-sm text-gray-800">Phone: {formData.phone}</p>
              <p className="text-sm text-gray-800">Address: {formData.address}, {formData.city}, {formData.country}</p>
              <p className="text-sm text-gray-800">Delivery: {formData.delivery_address}, {formData.delivery_city}, {formData.delivery_country}</p>
              <button
                onClick={handleBackToForm}
                className="bg-gray-500 text-white px-4 py-1 rounded-full transition text-xs font-semibold hover:bg-gray-600"
              >
                Edit Details
              </button>
            </div>
          )}
          {isLoading && (
            <div className="text-center text-gray-600">Processing payment...</div>
          )}
          {!showForm && (
            <div className="flex flex-col space-y-4">
              <button
                id="payhere-payment"
                onClick={handlePayHerePayment}
                disabled={isLoading || !csrfToken}
                className={`bg-green-500 text-white px-6 py-2 rounded-full transition text-sm font-semibold ${
                  isLoading || !csrfToken ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
                }`}
              >
                {isLoading ? 'Processing...' : 'Pay with PayHere'}
              </button>
              <button
                onClick={handlePayPalClick}
                disabled={isLoading || !csrfToken || isPayPalDisabled}
                className={`bg-blue-600 text-white px-6 py-2 rounded-full transition text-sm font-semibold ${
                  isLoading || !csrfToken || isPayPalDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isLoading && showPayPal ? 'Processing...' : 'Pay with PayPal'}
              </button>
              {showPayPal && (
                <PayPalScriptProvider
                  options={{
                    'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
                    currency: 'USD',
                    components: 'buttons',
                    intent: 'authorize',
                  }}
                >
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
                    disabled={isLoading}
                    createOrder={createPayPalOrder}
                    onApprove={onPayPalApprove}
                    onError={async (err) => {
                      setError('PayPal payment failed. Please try again.');
                      console.error('PayPal button error:', err);
                      setIsLoading(false);
                      setShowPayPal(false);
                      setShowForm(true);
                      setIsPayPalDisabled(false);
                      toast.error('PayPal payment failed');
                      await clearSessionData();
                      await fetchCsrfToken();
                    }}
                    onCancel={onPayPalCancel}
                  />
                </PayPalScriptProvider>
              )}
            </div>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <p className="text-xs text-gray-500">*Our reply time is almost instant</p>
          <img
            src="https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg"
            alt="Travel"
            className="w-1/2"
          />
        </div>
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