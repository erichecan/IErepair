import { Router } from 'express';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { checkInBooking, completeBooking, markNoShow } from '../../services/booking.service.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('merchant'));

// GET /bookings — list this merchant's bookings
router.get('/bookings', async (req, res) => {
  try {
    const merchantId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const { status, date } = req.query;

    const where = { merchantId };
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.bookingDate = { gte: d, lt: next };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          merchantProduct: { include: { product: true } },
        },
        orderBy: [{ bookingDate: 'desc' }, { bookingTime: 'desc' }],
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      data: bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get merchant bookings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /bookings/:id — booking detail
router.get('/bookings/:id', async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        merchantProduct: { include: { product: true } },
        deposits: true,
        warranty: true,
        review: true,
      },
    });

    if (!booking || booking.merchantId !== merchantId) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    console.error('Get booking detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /bookings/:id/check-in
router.post('/bookings/:id/check-in', async (req, res) => {
  try {
    const { id } = req.params;
    const { qrCode } = req.body;

    // Verify this booking belongs to this merchant
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking || booking.merchantId !== req.user.id) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updated = await checkInBooking(id, qrCode);
    res.json(updated);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

// POST /bookings/:id/start — set status to in_progress
router.post('/bookings/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking || booking.merchantId !== merchantId) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'checked_in') {
      return res.status(400).json({ error: 'Booking must be checked in to start' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'in_progress' },
    });

    res.json(updated);
  } catch (err) {
    console.error('Start booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /bookings/:id/complete
router.post('/bookings/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await completeBooking(id, req.user.id);
    res.json(updated);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

// POST /bookings/:id/no-show
router.post('/bookings/:id/no-show', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await markNoShow(id, req.user.id);
    res.json(updated);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

export default router;
