import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
import crypto from 'crypto';
import mongoose from 'mongoose';
import csurf from 'csurf';
import rateLimit from 'express-rate-limit';
import sanitizeHtml from 'sanitize-html';
import cookieParser from 'cookie-parser';

const router = express.Router();

// PayPal configuration
const paypalClient = new paypal.core.PayPalHttpClient(
  new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

// Payment schema
const PaymentSchema = new mongoose.Schema({
  paymentType: { type: String, required: true, enum: ['PayHere', 'PayPal'] },
  merchant_id: { type: String }, // PayHere
  order_id: { type: String, required: true },
  payment_id: { type: String }, // PayHere
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
  md5sig: { type: String }, // PayHere
  customer: {
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    delivery_address: { type: String },
    delivery_city: { type: String },
    delivery_country: { type: String },
  },
  created_at: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', PaymentSchema);

// Cookie parser for CSRF
router.use(cookieParser());

// CSRF protection with cookies
const csrfProtection = csurf({ cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production' } });

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
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
  res.json({ csrfToken: req.csrfToken() });
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

    // Validate required fields
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
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Sanitize inputs
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

    // Ensure amount has exactly two decimal places
    const formattedAmount = sanitizedData.amount;

    // Get merchant secret from env
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantSecret) {
      return res.status(500).json({
        success: false,
        error: 'PayHere merchant secret not configured',
      });
    }

    // Step 1: MD5 hash the merchant secret and uppercase it
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

    // Step 2: Create the full hash string
    const hashString = sanitizedData.merchant_id + sanitizedData.order_id + formattedAmount + sanitizedData.currency + hashedSecret;

    // Step 3: MD5 hash the final string and uppercase it
    const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    console.log('PayHere payment initiated:', {
      order_id: sanitizedData.order_id,
      amount: formattedAmount,
      currency: sanitizedData.currency,
      items: sanitizedData.items,
    });

    // Store customer details in custom_1 for notify endpoint
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

// POST endpoint for PayHere notification (no CSRF for server-to-server)
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

    // Input validation
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

    // Verify MD5 signature
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

    // Parse customer details from custom_1
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
        };
      }
    } catch (err) {
      console.error('Error parsing custom_1:', err.message);
    }

    // Process payment status
    let status = '';
    if (status_code == 2) {
      status = 'success';
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

// PayPal endpoints
router.post('/create-checkout-session/paypal', csrfProtection, async (req, res) => {
  try {
    const { tripName, amount, quantity, successUrl, cancelUrl, customer } = req.body;
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: (amount / 100).toFixed(2),
          },
          description: tripName,
          quantity: quantity,
        },
      ],
      application_context: {
        return_url: successUrl,
        cancel_url: cancelUrl,
      },
    });

    const response = await paypalClient.execute(request);
    res.json({ orderId: response.result.id });
  } catch (error) {
    console.error('PayPal order creation error:', error.message);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

router.post('/capture-paypal-payment', csrfProtection, async (req, res) => {
  try {
    const { orderId, customer } = req.body;
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const response = await paypalClient.execute(request);
    const { status, purchase_units } = response.result;
    const amount = parseFloat(purchase_units[0].amount.value);
    const currency = purchase_units[0].amount.currency_code;

    // Sanitize customer details
    const sanitizedCustomer = customer
      ? {
          first_name: sanitize(customer.first_name),
          last_name: sanitize(customer.last_name),
          email: sanitize(customer.email),
          phone: sanitize(customer.phone),
          address: sanitize(customer.address),
          city: sanitize(customer.city),
          country: sanitize(customer.country),
        }
      : {};

    const payment = new Payment({
      paymentType: 'PayPal',
      order_id: orderId,
      amount,
      currency,
      status,
      customer: sanitizedCustomer,
    });
    await payment.save();
    console.log('PayPal payment saved to MongoDB:', { orderId, amount, status });

    res.json({ success: true, status });
  } catch (error) {
    console.error('PayPal capture error:', error.message);
    res.status(500).json({ error: 'Failed to capture PayPal payment' });
  }
});

export default router;