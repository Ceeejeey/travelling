import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
import crypto from 'crypto';
import mongoose from 'mongoose';
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
router.get('/csrf-token', (req, res) => {
  const token = req.csrfToken();
  console.log('Generated CSRF token:', token, 'Session ID:', req.sessionID);
  res.json({ csrfToken: token });
});

// Check Session
router.get('/check-session', (req, res) => {
  if (req.sessionID) {
    console.log('Session check passed for ID:', req.sessionID);
    res.json({ valid: true, sessionId: req.sessionID });
  } else {
    console.log('No session found');
    res.status(401).json({ valid: false, error: 'No session found' });
  }
});

// Clear Order
router.post('/clear-order', async (req, res) => {
  try {
    const { tripName, paymentType } = req.body;
    if (!tripName) {
      return res.status(400).json({ error: 'tripName is required' });
    }
    console.log('Clearing order state for trip:', tripName, 'Payment Type:', paymentType);
    const payment = await Payment.findOne({ 'customer.tripName': sanitize(tripName), paymentType });
    if (payment && paymentType === 'PayPal' && payment.status === 'APPROVED') {
      try {
        const voidRequest = new paypal.orders.OrdersVoidRequest(payment.order_id);
        await paypalClient.execute(voidRequest);
        console.log('Voided PayPal order:', payment.order_id);
      } catch (paypalErr) {
        console.error('PayPal void error:', paypalErr.message);
      }
    }
    await Payment.deleteOne({ 'customer.tripName': sanitize(tripName), paymentType, status: { $in: ['APPROVED', 'PENDING'] } });
    res.json({ success: true, message: 'Order state cleared' });
  } catch (err) {
    console.error('Error clearing order:', err);
    res.status(500).json({ error: 'Failed to clear order' });
  }
});

// Check order status by tripName
router.get('/check-order-status/:tripName', async (req, res) => {
  try {
    const { tripName } = req.params;
    console.log('Checking order status for trip:', tripName, 'Session ID:', req.sessionID);
    const payment = await Payment.findOne({ 'customer.tripName': sanitize(tripName), paymentType: 'PayPal' }).sort({ created_at: -1 });
    if (payment && (payment.status === 'APPROVED' || payment.status === 'COMPLETED')) {
      // Check PayPal order status
      const request = new paypal.orders.OrdersGetRequest(payment.order_id);
      try {
        const paypalOrder = await paypalClient.execute(request);
        console.log('PayPal order status:', paypalOrder.result.status, 'Order ID:', payment.order_id);
        if (paypalOrder.result.status === 'APPROVED') {
          // Void the order
          try {
            const voidRequest = new paypal.orders.OrdersVoidRequest(payment.order_id);
            await paypalClient.execute(voidRequest);
            console.log('Voided PayPal order:', payment.order_id);
            await Payment.deleteOne({ order_id: payment.order_id });
            res.json({ status: 'NOT_FOUND' });
          } catch (voidErr) {
            console.error('Failed to void PayPal order:', payment.order_id, 'Error:', voidErr.message);
            await Payment.deleteOne({ order_id: payment.order_id });
            res.json({ status: 'NOT_FOUND' });
          }
        } else if (paypalOrder.result.status === 'COMPLETED') {
          res.json({ status: 'COMPLETED' });
        } else {
          await Payment.deleteOne({ order_id: payment.order_id });
          res.json({ status: 'NOT_FOUND' });
        }
      } catch (paypalErr) {
        console.error('PayPal order check error:', paypalErr.message);
        await Payment.deleteOne({ order_id: payment.order_id });
        res.json({ status: 'NOT_FOUND' });
      }
    } else {
      res.json({ status: 'NOT_FOUND' });
    }
  } catch (error) {
    console.error('Error checking order status:', error.message);
    res.status(500).json({ error: 'Failed to check order status', details: error.message });
  }
});

// PayHere initiation
router.post('/initiate/payhere', async (req, res) => {
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

// PayHere notification
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
// ✅ Create PayPal order
router.post('/create-checkout-session/paypal', async (req, res) => {
  try {
    const { tripName, amount, quantity, successUrl, cancelUrl, customer } = req.body;
    console.log('Creating PayPal order:', { tripName, amount, quantity, successUrl, cancelUrl, sessionId: req.sessionID });

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'AUTHORIZE', // can also be "CAPTURE" if you want immediate settlement
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: (amount / 100).toFixed(2),
          },
          description: sanitize(tripName),
          quantity,
        },
      ],
      application_context: {
        return_url: sanitize(successUrl),
        cancel_url: sanitize(cancelUrl),
        user_action: 'CONTINUE',
      },
    });

    const response = await paypalClient.execute(request);
    console.log('PayPal order created:', { orderId: response.result.id, status: response.result.status });

    // Save initial order as CREATED
    const sanitizedCustomer = customer ? {
      first_name: sanitize(customer.first_name),
      last_name: sanitize(customer.last_name),
      email: sanitize(customer.email),
      phone: sanitize(customer.phone),
      address: sanitize(customer.address),
      city: sanitize(customer.city),
      country: sanitize(customer.country),
      tripName: sanitize(tripName),
    } : {};

    await Payment.findOneAndUpdate(
      { order_id: response.result.id, paymentType: 'PayPal' },
      {
        order_id: response.result.id,
        payment_id: response.result.id,
        paymentType: 'PayPal',
        amount: parseFloat((amount / 100).toFixed(2)),
        currency: 'USD',
        status: response.result.status,
        customer: sanitizedCustomer,
      },
      { upsert: true, new: true }
    );

    res.json({ orderId: response.result.id });
  } catch (error) {
    console.error('PayPal order creation error:', error.message, error.response?.result);
    res.status(500).json({ error: 'Failed to create PayPal order', details: error.message });
  }
});
// ✅ Capture/Authorize PayPal order
router.post('/capture-paypal-payment', async (req, res) => {
  try {
    const { orderId, tripName, customer, amount } = req.body;
    console.log('Processing PayPal payment:', { orderId, tripName, sessionId: req.sessionID });

    // Fetch existing payment doc
    let existingPayment = await Payment.findOne({ order_id: orderId, paymentType: 'PayPal' });

    // If already completed/approved, stop
    if (existingPayment && ['COMPLETED', 'APPROVED'].includes(existingPayment.status)) {
      console.log('PayPal payment already finalized:', { orderId, status: existingPayment.status });
      return res.json({ success: true, status: existingPayment.status });
    }

    // Get current PayPal order status
    const orderRequest = new paypal.orders.OrdersGetRequest(orderId);
    const orderResponse = await paypalClient.execute(orderRequest);
    console.log('PayPal order status check:', { orderId, status: orderResponse.result.status });

    let finalStatus = orderResponse.result.status;
    let purchaseUnit = orderResponse.result.purchase_units[0];
    let amountObj = purchaseUnit.amount;

    // If still CREATED → authorize it
    if (finalStatus === 'CREATED') {
      const authRequest = new paypal.orders.OrdersAuthorizeRequest(orderId);
      authRequest.requestBody({});
      const authResponse = await paypalClient.execute(authRequest);
      console.log('PayPal order authorized:', { orderId, authStatus: authResponse.result.status });

      finalStatus = authResponse.result.status;
      purchaseUnit = authResponse.result.purchase_units[0];
      amountObj = purchaseUnit.amount;
    }

    // Update or create payment record
    const sanitizedCustomer = customer ? {
      first_name: sanitize(customer.first_name),
      last_name: sanitize(customer.last_name),
      email: sanitize(customer.email),
      phone: sanitize(customer.phone),
      address: sanitize(customer.address),
      city: sanitize(customer.city),
      country: sanitize(customer.country),
      tripName: sanitize(tripName),
    } : {};

    const updatedPayment = await Payment.findOneAndUpdate(
      { order_id: orderId, paymentType: 'PayPal' },
      {
        order_id: orderId,
        payment_id: orderResponse.result.id,
        paymentType: 'PayPal',
        amount: parseFloat(amountObj.value || (amount / 100).toFixed(2)),
        currency: amountObj.currency_code,
        status: finalStatus,
        customer: sanitizedCustomer,
      },
      { upsert: true, new: true }
    );

    console.log('PayPal payment saved to MongoDB:', {
      orderId,
      payment_id: updatedPayment.payment_id,
      amount: updatedPayment.amount,
      status: updatedPayment.status,
    });

    res.json({ success: true, status: updatedPayment.status });
  } catch (error) {
    console.error('PayPal payment error:', error.message, error.response?.result);
    res.status(500).json({ success: false, error: 'Failed to process PayPal payment', details: error.message });
  }
});

export default router;