import { Router } from 'express';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('merchant'));

// GET /dashboard/today — today's booking stats
router.get('/dashboard/today', async (req, res) => {
  try {
    const merchantId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalBookings, completedRevenue, pendingCheckIns] = await Promise.all([
      // Count all bookings for today
      prisma.booking.count({
        where: {
          merchantId,
          bookingDate: { gte: today, lt: tomorrow },
        },
      }),
      // Sum revenue from completed bookings today
      prisma.booking.aggregate({
        where: {
          merchantId,
          bookingDate: { gte: today, lt: tomorrow },
          status: 'completed',
        },
        _sum: { servicePrice: true },
      }),
      // Count confirmed bookings (pending check-in)
      prisma.booking.count({
        where: {
          merchantId,
          bookingDate: { gte: today, lt: tomorrow },
          status: 'confirmed',
        },
      }),
    ]);

    res.json({
      totalBookings,
      revenue: parseFloat(completedRevenue._sum.servicePrice || 0),
      pendingCheckIns,
    });
  } catch (err) {
    console.error('Dashboard today error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /dashboard/stats — weekly/monthly revenue aggregation
router.get('/dashboard/stats', async (req, res) => {
  try {
    const merchantId = req.user.id;
    const now = new Date();

    // Weekly: last 7 days
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    // Monthly: last 30 days
    const monthStart = new Date(now);
    monthStart.setDate(monthStart.getDate() - 30);
    monthStart.setHours(0, 0, 0, 0);

    const [weeklyRevenue, monthlyRevenue, weeklyBookings, monthlyBookings] = await Promise.all([
      prisma.booking.aggregate({
        where: {
          merchantId,
          status: 'completed',
          completedAt: { gte: weekStart },
        },
        _sum: { servicePrice: true },
      }),
      prisma.booking.aggregate({
        where: {
          merchantId,
          status: 'completed',
          completedAt: { gte: monthStart },
        },
        _sum: { servicePrice: true },
      }),
      prisma.booking.count({
        where: {
          merchantId,
          status: 'completed',
          completedAt: { gte: weekStart },
        },
      }),
      prisma.booking.count({
        where: {
          merchantId,
          status: 'completed',
          completedAt: { gte: monthStart },
        },
      }),
    ]);

    res.json({
      weekly: {
        revenue: parseFloat(weeklyRevenue._sum.servicePrice || 0),
        bookings: weeklyBookings,
      },
      monthly: {
        revenue: parseFloat(monthlyRevenue._sum.servicePrice || 0),
        bookings: monthlyBookings,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
