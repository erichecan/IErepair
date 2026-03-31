import { Router } from 'express';

const router = Router();

// POST /login
router.post('/login', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

export default router;
