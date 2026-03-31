import { Router } from 'express';

const router = Router();

// GET /warranties
router.get('/warranties', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// GET /warranties/:id
router.get('/warranties/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

export default router;
