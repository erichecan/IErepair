import { Router } from 'express';

const router = Router();

// GET /dashboard/today
router.get('/dashboard/today', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// GET /dashboard/stats
router.get('/dashboard/stats', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

export default router;
