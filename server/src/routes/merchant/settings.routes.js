import { Router } from 'express';

const router = Router();

// GET /settings
router.get('/settings', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// PATCH /settings
router.patch('/settings', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// PUT /settings/hours
router.put('/settings/hours', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// PATCH /settings/slots
router.patch('/settings/slots', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// POST /settings/photos
router.post('/settings/photos', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

// DELETE /settings/photos/:id
router.delete('/settings/photos/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet', endpoint: req.originalUrl });
});

export default router;
