import { Router } from 'express';
import prisma from '../../config/database.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { createBooking, cancelBooking } from '../../services/booking.service.js';
import { createCheckoutSession } from '../../services/stripe.service.js';

const router = Router();

// POST /bookings — create a booking + Stripe Checkout (requires auth)
router.post('/bookings', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const { merchantProductId, date, time, name, phone, note } = req.body;

    if (!merchantProductId || !date || !time || !name || !phone) {
      return res.status(400).json({ error: 'merchantProductId, date, time, name, and phone are required' });
    }

    // Validate merchant_product exists and is active
    const merchantProduct = await prisma.merchantProduct.findUnique({
      where: { id: merchantProductId },
      include: {
        product: { include: { device: { include: { brand: true } } } },
        merchant: true,
      },
    });

    if (!merchantProduct || !merchantProduct.isActive) {
      return res.status(404).json({ error: 'Service not found or not available' });
    }

    if (merchantProduct.merchant.status !== 'active') {
      return res.status(400).json({ error: 'This shop is not currently active' });
    }

    // Calculate deposit (20%)
    const servicePrice = parseFloat(merchantProduct.myPrice);
    const depositAmount = Math.round(servicePrice * 20) / 100; // 20%, rounded to 2 decimals
    const remainingAmount = servicePrice - depositAmount;

    // Create booking
    const booking = await createBooking({
      customerId: req.user.id,
      merchantId: merchantProduct.merchantId,
      merchantProductId: merchantProduct.id,
      serviceName: merchantProduct.product.name,
      servicePrice,
      depositAmount,
      remainingAmount,
      bookingDate: new Date(date),
      bookingTime: time,
      estimatedDuration: merchantProduct.product.estimatedTime,
      customerName: name,
      customerPhone: phone,
      customerNote: note || null,
      status: 'pending_payment',
    });

    // Create Stripe Checkout Session
    const session = await createCheckoutSession(booking);

    res.status(201).json({
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      checkoutUrl: session.url,
      deposit: depositAmount,
      total: servicePrice,
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /bookings/:id — booking detail (requires auth, must be owner)
router.get('/bookings/:id', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        merchant: {
          select: {
            id: true, slug: true, name: true, address: true, city: true,
            phone: true, latitude: true, longitude: true, logoUrl: true,
          },
        },
        merchantProduct: {
          include: { product: { include: { category: true } } },
        },
        deposits: { select: { id: true, amount: true, status: true, createdAt: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.customerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /bookings/:id/cancel — cancel a booking (requires auth)
router.post('/bookings/:id/cancel', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const result = await cancelBooking(req.params.id, req.user.id);
    res.json({
      message: result.refunded ? 'Booking cancelled, deposit will be refunded' : 'Booking cancelled, deposit forfeited (within 24h)',
      refunded: result.refunded,
      booking: result.booking,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
