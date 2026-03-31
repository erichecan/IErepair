import { Router } from 'express';
import express from 'express';

const router = Router();

// Stripe requires the raw body for webhook signature verification
router.use(express.raw({ type: 'application/json' }));

// POST /api/v1/webhooks/stripe
router.post('/stripe', (req, res) => {
  // TODO: Implement Stripe webhook handler
  res.json({ received: true });
});

export default router;
