import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
import crypto from 'crypto';
import mongoose from 'mongoose';
import csurf from 'csurf';
import rateLimit from 'express-rate-limit';
import sanitizeHtml from 'sanitize-html';
import cookieParser from 'cookie-parser';
import Payment from '../schema/PaymentSchema.js';

const router = express.Router();

// PayPal configuration
const paypalClient = new paypal.core.PayPalHttpClient(
  new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);



// Middleware
router.use(cookieParser());
const csrfProtection = csurf({ cookie: { httpOnly: true, secure: true, sameSite: 'none' } });

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
router.use(limiter);

// Input sanitization
const sanitize = (input) => {
  if (typeof input !== 'string') return input;
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
};

// CSRF token endpoint
router.get('/csrf-token', csrfProtection, (req, res) => {
  const token = req.csrfToken();
  console.log('Generated CSRF token:', token, 'Session ID:', req.sessionID);
  res.json({ csrfToken: token });
});

// Check order status by tripName
router.get('/check-order-status/:tripName', csrfProtection, async (req, res) => {
  try {
    const { tripName } = req.params;
    console.log('Checking order status for trip:', tripName, 'Session ID:', req.sessionID);
    const payment = await Payment.findOne({ 'customer.tripName': sanitize(tripName), paymentType: 'PayPal' }).sort({ created_at: -1 });
    if (payment) {
      console.log('Found existing payment:', { order_id: payment.order_id, status: payment.status });
      return res.json({ status: payment.status });
    }
    res.json({ status: 'NOT_FOUND' });
  } catch (error) {
    console.error('Error checking order status:', error.message);
    res.status(500).json({ error: 'Failed to check order status', details: error.message });
  }
});

router.post('/initiate/payhere', csrfProtection, async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      amount,
      currency,
      items,
      return_url,
      cancel_url,
      notify_url,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      country,
      delivery_address,
      delivery_city,
      delivery_country,
    } = req.body;

    if (
      !merchant_id ||
      !order_id ||
      !amount ||
      !currency ||
      !items ||
      !return_url ||
      !cancel_url ||
      !notify_url ||
      !first_name ||
      !email
    ) {
      console.error('Missing required fields for PayHere:', req.body);
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const sanitizedData = {
      merchant_id: sanitize(merchant_id),
      order_id: sanitize(order_id),
      amount: parseFloat(amount).toFixed(2),
      currency: sanitize(currency),
      items: sanitize(items),
      return_url: sanitize(return_url),
      cancel_url: sanitize(cancel_url),
      notify_url: sanitize(notify_url),
      first_name: sanitize(first_name),
      last_name: sanitize(last_name),
      email: sanitize(email),
      phone: sanitize(phone),
      address: sanitize(address),
      city: sanitize(city),
      country: sanitize(country),
      delivery_address: sanitize(delivery_address),
      delivery_city: sanitize(delivery_city),
      delivery_country: sanitize(delivery_country),
    };

    const formattedAmount = sanitizedData.amount;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantSecret) {
      console.error('PayHere merchant secret not configured');
      return res.status(500).json({
        success: false,
        error: 'PayHere merchant secret not configured',
      });
    }

    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hashString = sanitizedData.merchant_id + sanitizedData.order_id + formattedAmount + sanitizedData.currency + hashedSecret;
    const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    console.log('PayHere payment initiated:', {
      order_id: sanitizedData.order_id,
      amount: formattedAmount,
      currency: sanitizedData.currency,
      items: sanitizedData.items,
      merchant_id: sanitizedData.merchant_id,
      notify_url: sanitizedData.notify_url,
    });

    const custom_1 = JSON.stringify({
      first_name: sanitizedData.first_name,
      last_name: sanitizedData.last_name,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      address: sanitizedData.address,
      city: sanitizedData.city,
      country: sanitizedData.country,
      delivery_address: sanitizedData.delivery_address,
      delivery_city: sanitizedData.delivery_city,
      delivery_country: sanitizedData.delivery_country,
      tripName: sanitizedData.items,
    });

    res.status(200).json({
      success: true,
      status: 'initiated',
      hash,
      custom_1,
    });
  } catch (error) {
    console.error('Error initiating PayHere payment:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate PayHere payment',
      details: error.message,
    });
  }
});

router.post('/notify/payhere', async (req, res) => {
  console.log('PayHere notification received:', req.body);
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      custom_1,
    } = req.body;

    if (
      !merchant_id ||
      !order_id ||
      !payment_id ||
      !payhere_amount ||
      !payhere_currency ||
      !status_code ||
      !md5sig
    ) {
      console.error('Missing required fields in PayHere notification:', req.body);
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantSecret) {
      console.error('PayHere merchant secret not configured');
      return res.status(500).json({ success: false, error: 'Merchant secret not configured' });
    }
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const localSignatureInput = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`;
    const localSignature = crypto
      .createHash('md5')
      .update(localSignatureInput)
      .digest('hex')
      .toUpperCase();

    console.log('PayHere notification details:', {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      localSignature,
      localSignatureInput,
    });

    if (localSignature !== md5sig) {
      console.error('Invalid PayHere signature:', { order_id, payment_id, md5sig, localSignature });
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    let customer = {};
    try {
      if (custom_1) {
        customer = JSON.parse(custom_1);
        customer = {
          first_name: sanitize(customer.first_name),
          last_name: sanitize(customer.last_name),
          email: sanitize(customer.email),
          phone: sanitize(customer.phone),
          address: sanitize(customer.address),
          city: sanitize(customer.city),
          country: sanitize(customer.country),
          delivery_address: sanitize(customer.delivery_address),
          delivery_city: sanitize(customer.delivery_city),
          delivery_country: sanitize(customer.delivery_country),
          tripName: sanitize(customer.tripName),
        };
      }
    } catch (err) {
      console.error('Error parsing custom_1:', err.message);
    }

    let status = '';
    if (status_code == 2) {
      status = 'success';
      const existingPayment = await Payment.findOne({ order_id, paymentType: 'PayHere' });
      if (existingPayment) {
        console.log('PayHere payment already exists:', { order_id, payment_id });
        return res.status(200).json({ success: true, status: 'already_processed' });
      }
      const payment = new Payment({
        paymentType: 'PayHere',
        merchant_id,
        order_id,
        payment_id,
        amount: parseFloat(payhere_amount),
        currency: payhere_currency,
        status,
        md5sig,
        customer,
      });
      await payment.save();
      console.log('Payment success saved to MongoDB:', { order_id, payment_id, payhere_amount, status });
    } else if (status_code == 0) {
      status = 'pending';
      console.log('Payment pending:', { order_id, payment_id, payhere_amount, payhere_currency });
    } else if (status_code == -1) {
      status = 'cancelled';
      console.log('Payment cancelled:', { order_id, payment_id, payhere_amount, payhere_currency });
    } else if (status_code == -2) {
      status = 'failed';
      console.log('Payment failed:', { order_id, payment_id, payhere_amount, payhere_currency });
    } else {
      status = 'unknown';
      console.log('Unknown payment status:', { order_id, payment_id, status_code });
    }

    res.status(200).json({ success: true, status: 'notified' });
  } catch (error) {
    console.error('Error processing PayHere notification:', error.message);
    res.status(500).json({ success: false, error: 'Failed to process notification', details: error.message });
  }
});

router.post('/create-checkout-session/paypal', csrfProtection, async (req, res) => {
  try {
    const { tripName, amount, quantity, successUrl, cancelUrl, customer } = req.body;
    console.log('Creating PayPal order:', { tripName, amount, quantity, successUrl, cancelUrl, sessionId: req.sessionID });
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'AUTHORIZE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: (amount / 100).toFixed(2),
          },
          description: sanitize(tripName),
          quantity: quantity,
        },
      ],
      application_context: {
        return_url: sanitize(successUrl),
        cancel_url: sanitize(cancelUrl),
        user_action: 'CONTINUE',
      },
    });

    const response = await paypalClient.execute(request);
    console.log('PayPal order created:', { orderId: response.result.id, status: response.result.status, sessionId: req.sessionID });
    res.json({ orderId: response.result.id });
  } catch (error) {
    console.error('PayPal order creation error:', error.message, error.response?.result);
    res.status(500).json({ error: 'Failed to create PayPal order', details: error.message });
  }
});

router.post('/capture-paypal-payment', csrfProtection, async (req, res) => {
  try {
    const { orderId, tripName, customer, amount } = req.body; // Added amount from request
    console.log('Processing PayPal payment:', { orderId, tripName, sessionId: req.sessionID });

    // Check if payment already exists in MongoDB
    const existingPayment = await Payment.findOne({ order_id: orderId, paymentType: 'PayPal' });
    if (existingPayment) {
      console.log('PayPal payment already processed:', { orderId, status: existingPayment.status });
      return res.status(400).json({
        success: false,
        error: 'Order already processed',
        details: 'This PayPal order has already been processed in the database.',
      });
    }

    // Check PayPal order status
    const orderRequest = new paypal.orders.OrdersGetRequest(orderId);
    const orderResponse = await paypalClient.execute(orderRequest);
    console.log('PayPal order status check:', { orderId, status: orderResponse.result.status, details: orderResponse.result });

    // Save payment if status is APPROVED or COMPLETED
    if (orderResponse.result.status === 'APPROVED' || orderResponse.result.status === 'COMPLETED') {
      const purchaseUnit = orderResponse.result.purchase_units[0];
      const amountObj = purchaseUnit.amount;
      if (!amountObj || !amountObj.currency_code || !amountObj.value) {
        console.error('Invalid order amount:', amountObj);
        throw new Error('Invalid order response: missing amount data');
      }

      const sanitizedCustomer = customer
        ? {
            first_name: sanitize(customer.first_name),
            last_name: sanitize(customer.last_name),
            email: sanitize(customer.email),
            phone: sanitize(customer.phone),
            address: sanitize(customer.address),
            city: sanitize(customer.city),
            country: sanitize(customer.country),
            tripName: sanitize(tripName),
          }
        : {};

      const payment = new Payment({
        paymentType: 'PayPal',
        order_id: orderId,
        payment_id: orderResponse.result.id, // Use orderId as payment_id
        amount: parseFloat(amountObj.value || (amount / 100).toFixed(2)), // Fallback to request amount
        currency: amountObj.currency_code,
        status: orderResponse.result.status,
        customer: sanitizedCustomer,
      });
      await payment.save();
      console.log('PayPal payment saved to MongoDB:', {
        orderId,
        payment_id: orderResponse.result.id,
        amount: payment.amount,
        status: payment.status,
      });

      return res.json({ success: true, status: payment.status });
    }

    // Authorize the order (optional, for non-APPROVED cases)
    const authRequest = new paypal.orders.OrdersAuthorizeRequest(orderId);
    authRequest.requestBody({});
    const authResponse = await paypalClient.execute(authRequest);
    console.log('PayPal order authorized:', { orderId, authDetails: authResponse.result });

    // Save payment after authorization
    const purchaseUnit = authResponse.result.purchase_units[0];
    const amountObj = purchaseUnit.amount;
    if (!amountObj || !amountObj.currency_code || !amountObj.value) {
      console.error('Invalid authorization amount:', amountObj);
      throw new Error('Invalid authorization response: missing amount data');
    }

    const sanitizedCustomer = customer
      ? {
          first_name: sanitize(customer.first_name),
          last_name: sanitize(customer.last_name),
          email: sanitize(customer.email),
          phone: sanitize(customer.phone),
          address: sanitize(customer.address),
          city: sanitize(customer.city),
          country: sanitize(customer.country),
          tripName: sanitize(tripName),
        }
      : {};

    const payment = new Payment({
      paymentType: 'PayPal',
      order_id: orderId,
      payment_id: authResponse.result.id, // Use orderId as payment_id
      amount: parseFloat(amountObj.value || (amount / 100).toFixed(2)), // Fallback to request amount
      currency: amountObj.currency_code,
      status: authResponse.result.status,
      customer: sanitizedCustomer,
    });
    await payment.save();
    console.log('PayPal payment saved to MongoDB:', {
      orderId,
      payment_id: authResponse.result.id,
      amount: payment.amount,
      status: payment.status,
    });

    res.json({ success: true, status: payment.status });
  } catch (error) {
    console.error('PayPal payment error:', error.message, error.response?.result);
    res.status(500).json({ success: false, error: 'Failed to process PayPal payment', details: error.message });
  }
});

export default router;