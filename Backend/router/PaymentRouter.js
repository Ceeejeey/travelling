import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
import crypto from 'crypto';

const router = express.Router();

// PayPal configuration
const paypalClient = new paypal.core.PayPalHttpClient(
  new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

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
      country
    } = req.body;

    // Validate required fields
    if (
      !merchant_id || !order_id || !amount || !currency || !items ||
      !return_url || !cancel_url || !notify_url || !first_name || !email
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Ensure amount has exactly two decimal places
    const formattedAmount = parseFloat(amount).toFixed(2);

    // Get merchant secret from env
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantSecret) {
      return res.status(500).json({
        success: false,
        error: 'PayHere merchant secret not configured'
      });
    }

    // Step 1: MD5 hash the merchant secret and uppercase it
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

    // Step 2: Create the full hash string
    const hashString = merchant_id + order_id + formattedAmount + currency + hashedSecret;

    // Step 3: MD5 hash the final string and uppercase it
    const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    console.log('PayHere payment initiated:', {
      order_id,
      amount: formattedAmount,
      currency,
      items
    });

    res.status(200).json({
      success: true,
      status: 'initiated',
      hash
    });
  } catch (error) {
    console.error('Error initiating PayHere payment:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate PayHere payment',
      details: error.message
    });
  }
});

// POST endpoint for PayHere notification
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
      md5sig
    } = req.body;

    // Input validation
    if (!merchant_id || !order_id || !payment_id || !payhere_amount || !payhere_currency || !status_code || !md5sig) {
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

    console.log('PayHere notification received:', {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      localSignature,
      localSignatureInput
    });

    if (localSignature !== md5sig) {
      console.error('Invalid PayHere signature:', { order_id, payment_id, md5sig, localSignature });
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // Process payment status
    if (status_code == 2) {
      console.log('Payment successful:', { order_id, payment_id, payhere_amount, payhere_currency });
      // TODO: Update your database as payment success
      // Example: await updateOrderStatus(order_id, 'completed', payment_id, payhere_amount);
    } else if (status_code == 0) {
      console.log('Payment pending:', { order_id, payment_id, payhere_amount, payhere_currency });
      // TODO: Handle pending payment
    } else if (status_code == -1) {
      console.log('Payment cancelled:', { order_id, payment_id, payhere_amount, payhere_currency });
      // TODO: Handle cancelled payment
    } else if (status_code == -2) {
      console.log('Payment failed:', { order_id, payment_id, payhere_amount, payhere_currency });
      // TODO: Handle failed payment
    } else {
      console.log('Unknown payment status:', { order_id, payment_id, status_code });
    }

    res.status(200).json({ success: true, status: 'notified' });
  } catch (error) {
    console.error('Error processing PayHere notification:', error.message);
    res.status(500).json({ success: false, error: 'Failed to process notification', details: error.message });
  }
});

// PayPal endpoints
router.post('/create-checkout-session/paypal', async (req, res) => {
  try {
    const { tripName, amount, quantity, successUrl, cancelUrl } = req.body;
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
          quantity: quantity
        }
      ],
      application_context: {
        return_url: successUrl,
        cancel_url: cancelUrl
      }
    });

    const response = await paypalClient.execute(request);
    res.json({ orderId: response.result.id });
  } catch (error) {
    console.error('PayPal order creation error:', error.message);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

router.post('/capture-paypal-payment', async (req, res) => {
  try {
    const { orderId } = req.body;
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const response = await paypalClient.execute(request);
    res.json({ success: true, status: response.result.status });
  } catch (error) {
    console.error('PayPal capture error:', error.message);
    res.status(500).json({ error: 'Failed to capture PayPal payment' });
  }
});

export default router;