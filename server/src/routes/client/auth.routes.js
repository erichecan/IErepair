import { Router } from 'express';

const router = Router();

// POST /send-otp
router.post('/send-otp', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// POST /verify-otp
router.post('/verify-otp', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// GET /me
router.get('/me', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

export default router;
