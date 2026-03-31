import { Router } from 'express';
import prisma from '../../config/database.js';

const router = Router();

// GET /shops/:slug — shop detail (info, photos, hours)
router.get('/shops/:slug', async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { slug: req.params.slug },
      include: {
        photos: { orderBy: { sortOrder: 'asc' } },
        businessHours: { orderBy: { dayOfWeek: 'asc' } },
        bookingSlots: true,
      },
    });

    if (!merchant || merchant.status !== 'active') {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Strip sensitive fields
    const { passwordHash, ...shopData } = merchant;
    shopData.ratingAvg = parseFloat(shopData.ratingAvg);

    res.json(shopData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /shops/:slug/services — all active services with prices, grouped by category
router.get('/shops/:slug/services', async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { slug: req.params.slug },
    });

    if (!merchant || merchant.status !== 'active') {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const merchantProducts = await prisma.merchantProduct.findMany({
      where: { merchantId: merchant.id, isActive: true },
      include: {
        product: {
          include: {
            category: true,
            device: { include: { brand: true } },
          },
        },
      },
      orderBy: { product: { name: 'asc' } },
    });

    // Group by category
    const grouped = {};
    for (const mp of merchantProducts) {
      const catName = mp.product.category.name;
      if (!grouped[catName]) {
        grouped[catName] = {
          categoryId: mp.product.category.id,
          categoryName: catName,
          icon: mp.product.category.icon,
          services: [],
        };
      }

      grouped[catName].services.push({
        merchantProductId: mp.id,
        productId: mp.product.id,
        name: mp.product.name,
        brand: mp.product.device.brand.name,
        device: mp.product.device.name,
        price: parseFloat(mp.myPrice),
        inStock: mp.inStock,
        estimatedTime: mp.product.estimatedTime,
        warrantyDays: mp.product.warrantyDays,
        imageUrl: mp.product.imageUrl,
      });
    }

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /shops/:slug/reviews — paginated reviews
router.get('/shops/:slug/reviews', async (req, res) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { slug: req.params.slug },
    });

    if (!merchant) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { merchantId: merchant.id },
        include: { customer: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { merchantId: merchant.id } }),
    ]);

    // Star breakdown
    const breakdown = await prisma.review.groupBy({
      by: ['rating'],
      where: { merchantId: merchant.id },
      _count: true,
    });

    res.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      breakdown: breakdown.map(b => ({ rating: b.rating, count: b._count })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /shops/:slug/slots — available time slots for a date
// Query: ?date=2026-03-31
router.get('/shops/:slug/slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { slug: req.params.slug },
      include: {
        businessHours: true,
        bookingSlots: true,
      },
    });

    if (!merchant || merchant.status !== 'active') {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Get day of week (0=Sunday)
    const targetDate = new Date(date + 'T00:00:00');
    const dayOfWeek = targetDate.getDay();

    const hours = merchant.businessHours.find(h => h.dayOfWeek === dayOfWeek);
    if (!hours || hours.isClosed) {
      return res.json({ date, closed: true, slots: [] });
    }

    // Slot config (use first or defaults)
    const slotConfig = merchant.bookingSlots[0] || {
      slotDuration: 30,
      maxConcurrent: 3,
      bufferMinutes: 0,
    };

    const slotDuration = slotConfig.slotDuration;
    const maxConcurrent = slotConfig.maxConcurrent;
    const buffer = slotConfig.bufferMinutes;

    // Parse open/close times
    const openParts = hours.openTime.split(':').map(Number);
    const closeParts = hours.closeTime.split(':').map(Number);
    const openMinutes = openParts[0] * 60 + openParts[1];
    const closeMinutes = closeParts[0] * 60 + closeParts[1];

    // Get existing bookings for this date
    const existingBookings = await prisma.booking.findMany({
      where: {
        merchantId: merchant.id,
        bookingDate: targetDate,
        status: { in: ['confirmed', 'checked_in', 'in_progress', 'pending_payment'] },
      },
      select: { bookingTime: true },
    });

    // Count bookings per time slot
    const bookingCounts = {};
    for (const b of existingBookings) {
      const time = b.bookingTime;
      bookingCounts[time] = (bookingCounts[time] || 0) + 1;
    }

    // Generate slots
    const slots = [];
    for (let m = openMinutes; m + slotDuration <= closeMinutes; m += slotDuration + buffer) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      const booked = bookingCounts[timeStr] || 0;

      slots.push({
        time: timeStr,
        available: booked < maxConcurrent,
        bookedCount: booked,
        maxConcurrent,
      });
    }

    res.json({ date, closed: false, slots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
