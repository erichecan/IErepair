import { Router } from 'express';

const router = Router();

// GET /commission/rules
router.get('/commission/rules', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// POST /commission/rules
router.post('/commission/rules', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// PATCH /commission/rules/:id
router.patch('/commission/rules/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// DELETE /commission/rules/:id
router.delete('/commission/rules/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

export default router;
