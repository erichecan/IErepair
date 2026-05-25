import { Router } from 'express';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';

const router = Router();

// GET /warranties — customer's warranty cards (requires auth)
router.get('/warranties', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const warranties = await prisma.warranty.findMany({
      where: { customerId: req.user.id },
      include: {
        originalMerchant: {
          select: { id: true, slug: true, name: true, city: true },
        },
        product: {
          select: { id: true, name: true, imageUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(warranties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /warranties/:id — warranty detail (requires auth)
router.get('/warranties/:id', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const warranty = await prisma.warranty.findUnique({
      where: { id: req.params.id },
      include: {
        originalMerchant: {
          select: { id: true, slug: true, name: true, address: true, city: true, phone: true },
        },
        product: {
          include: { category: true, device: { include: { brand: true } } },
        },
        booking: {
          select: { id: true, bookingNumber: true, servicePrice: true, completedAt: true },
        },
        claims: {
          include: {
            claimingMerchant: { select: { id: true, name: true, city: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!warranty) {
      return res.status(404).json({ error: 'Warranty not found' });
    }

    if (warranty.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(warranty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
