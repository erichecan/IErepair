import { Router } from 'express';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('hq_admin'));

// GET /merchants — list merchants with filters
router.get('/merchants', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [merchants, total] = await Promise.all([
      prisma.merchant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.merchant.count({ where }),
    ]);

    res.json({
      data: merchants,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get merchants error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /merchants/:id — merchant detail with stats
router.get('/merchants/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: {
        photos: true,
        businessHours: true,
        bookingSlot: true,
        activatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    // Get stats
    const [bookingCount, revenue] = await Promise.all([
      prisma.booking.count({ where: { merchantId: id } }),
      prisma.booking.aggregate({
        where: { merchantId: id, status: 'completed' },
        _sum: { servicePrice: true },
      }),
    ]);

    res.json({
      ...merchant,
      stats: {
        bookingCount,
        revenue: parseFloat(revenue._sum.servicePrice || 0),
      },
    });
  } catch (err) {
    console.error('Get merchant detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /merchants/:id/activate
router.post('/merchants/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;

    const merchant = await prisma.merchant.update({
      where: { id },
      data: {
        status: 'active',
        activatedById: req.user.id,
        activatedAt: new Date(),
      },
    });

    res.json(merchant);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    console.error('Activate merchant error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /merchants/:id/suspend
router.post('/merchants/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params;

    const merchant = await prisma.merchant.update({
      where: { id },
      data: { status: 'suspended' },
    });

    res.json(merchant);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    console.error('Suspend merchant error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
