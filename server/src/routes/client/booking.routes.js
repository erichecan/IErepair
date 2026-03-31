import { Router } from 'express';

const router = Router();

// POST /bookings
router.post('/bookings', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// GET /bookings/:id
router.get('/bookings/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// POST /bookings/:id/cancel
router.post('/bookings/:id/cancel', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

export default router;
