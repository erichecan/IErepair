import { Router } from 'express';

const router = Router();

// GET /warranty-claims
router.get('/warranty-claims', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// POST /warranty-claims
router.post('/warranty-claims', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

export default router;
