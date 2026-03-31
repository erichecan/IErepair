import { Router } from 'express';

const router = Router();

// GET /merchants
router.get('/merchants', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// GET /merchants/:id
router.get('/merchants/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// POST /merchants/:id/activate
router.post('/merchants/:id/activate', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// POST /merchants/:id/suspend
router.post('/merchants/:id/suspend', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

export default router;
