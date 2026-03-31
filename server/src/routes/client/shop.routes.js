import { Router } from 'express';

const router = Router();

// GET /shops/:slug
router.get('/shops/:slug', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// GET /shops/:slug/services
router.get('/shops/:slug/services', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// GET /shops/:slug/reviews
router.get('/shops/:slug/reviews', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// GET /shops/:slug/slots
router.get('/shops/:slug/slots', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

export default router;
