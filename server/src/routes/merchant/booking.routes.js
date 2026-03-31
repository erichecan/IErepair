import { Router } from 'express';

const router = Router();

// GET /bookings
router.get('/bookings', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// GET /bookings/:id
router.get('/bookings/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// POST /bookings/:id/check-in
router.post('/bookings/:id/check-in', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// POST /bookings/:id/start
router.post('/bookings/:id/start', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// POST /bookings/:id/complete
router.post('/bookings/:id/complete', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// POST /bookings/:id/no-show
router.post('/bookings/:id/no-show', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

export default router;
