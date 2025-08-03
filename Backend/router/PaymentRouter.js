import express from 'express';
const router = express.Router();
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import paypal from '@paypal/checkout-server-sdk';

// Middleware to validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Stripe secret key is not set in environment variables.');
  process.exit(1);
}
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  console.error('PayPal client ID or secret is not set in environment variables.');
  process.exit(1);
}

// Configure PayPal SDK
const paypalEnv = process.env.NODE_ENV === 'production'
  ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
  : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnv);

// POST endpoint for Stripe checkout session
router.post('/create-checkout-session/stripe', async (req, res) => {
  try {
    const { tripName, amount, quantity, successUrl, cancelUrl } = req.body;

    // Input validation
    if (!tripName || !amount || !quantity || !successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tripName, amount, quantity, successUrl, cancelUrl'
      });
    }

    // Validate amount and quantity
    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount: must be a positive integer in cents'
      });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity: must be a positive integer'
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tripName,
              description: `Booking for ${tripName}`,
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tripName,
        bookingType: 'travel'
      }
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url
    });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create Stripe checkout session',
      details: error.message
    });
  }
});

// POST endpoint for PayPal payment creation
router.post('/create-checkout-session/paypal', async (req, res) => {
  try {
    const { tripName, amount, quantity, successUrl, cancelUrl } = req.body;

    // Input validation
    if (!tripName || !amount || !quantity || !successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tripName, amount, quantity, successUrl, cancelUrl'
      });
    }

    // Validate amount and quantity
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount: must be a positive number'
      });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity: must be a positive integer'
      });
    }

    // Create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: (amount * quantity / 100).toFixed(2), // Convert cents to dollars
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: (amount * quantity / 100).toFixed(2)
              }
            }
          },
          items: [
            {
              name: tripName,
              description: `Booking for ${tripName}`,
              quantity: quantity,
              unit_amount: {
                currency_code: 'USD',
                value: (amount / 100).toFixed(2) // Amount per item in dollars
              }
            }
          ]
        }
      ],
      application_context: {
        return_url: successUrl,
        cancel_url: cancelUrl,
        brand_name: 'Your Travel Booking',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW'
      }
    });

    const order = await paypalClient.execute(request);

    // Find approval link
    const approvalLink = order.result.links.find(link => link.rel === 'approve');

    if (!approvalLink) {
      throw new Error('No approval link found in PayPal response');
    }

    res.status(200).json({
      success: true,
      orderId: order.result.id,
      approvalUrl: approvalLink.href
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create PayPal order',
      details: error.message
    });
  }
});

// POST endpoint to capture PayPal payment
router.post('/capture-paypal-payment', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Missing orderId'
      });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const capture = await paypalClient.execute(request);

    if (capture.result.status === 'COMPLETED') {
      res.status(200).json({
        success: true,
        captureId: capture.result.id,
        status: capture.result.status
      });
    } else {
      throw new Error('Payment capture failed');
    }
  } catch (error) {
    console.error('Error capturing PayPal payment:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to capture PayPal payment',
      details: error.message
    });
  }
});

export default router;