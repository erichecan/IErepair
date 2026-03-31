import { Router } from 'express';

const router = Router();

// GET /catalog
router.get('/catalog', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// POST /catalog/sync
router.post('/catalog/sync', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// PATCH /catalog/:id
router.patch('/catalog/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// POST /catalog/bulk-sync
router.post('/catalog/bulk-sync', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

export default router;
