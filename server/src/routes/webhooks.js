import { Router } from 'express';
import express from 'express';
import Stripe from 'stripe';
import { handleWebhookEvent } from '../services/stripe.service.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Stripe requires the raw body for webhook signature verification
router.use(express.raw({ type: 'application/json' }));

// POST /api/v1/webhooks/stripe
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    let event;
    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // For development without signature verification
      event = JSON.parse(req.body.toString());
    }

    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
});

export default router;
