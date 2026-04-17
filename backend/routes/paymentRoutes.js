const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_fallback_key');
const { protect } = require('../middleware/authMiddleware');
const { logPayment } = require('../utils/excelSync');
const router = express.Router();

router.post('/confirm-mock', async (req, res) => {
  const { passengerName, flightId, amount, paymentIntentId } = req.body;
  try {
    await logPayment(passengerName, flightId, amount, paymentIntentId);
    res.status(200).json({ message: "Mock Booking confirmed & logged to Excel" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { amount, flightId, passengerName } = req.body;

    const amountInCents = amount * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { 
        flightId: flightId, 
        passengerName: passengerName 
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
