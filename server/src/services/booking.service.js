import prisma from '../config/database.js';
import crypto from 'crypto';
import { createWarranty } from './warranty.service.js';
import { recordCommission } from './commission.service.js';

/**
 * Generate a unique booking number in the format IRA-YYYYMMDD-XXXX
 */
export function generateBookingNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `IRA-${date}-${rand}`;
}

/**
 * Create a new booking record with a generated QR code token.
 */
export async function createBooking(data) {
  const bookingNumber = generateBookingNumber();
  const qrCode = crypto.randomUUID();

  const booking = await prisma.booking.create({
    data: {
      bookingNumber,
      customerId: data.customerId,
      merchantId: data.merchantId,
      merchantProductId: data.merchantProductId,
      serviceName: data.serviceName,
      servicePrice: data.servicePrice,
      depositAmount: data.depositAmount,
      remainingAmount: data.remainingAmount,
      bookingDate: data.bookingDate,
      bookingTime: data.bookingTime,
      estimatedDuration: data.estimatedDuration || null,
      status: data.status || 'pending_payment',
      customerName: data.customerName || null,
      customerPhone: data.customerPhone || null,
      customerNote: data.customerNote || null,
      qrCode,
    },
    include: {
      merchant: true,
      merchantProduct: { include: { product: true } },
      customer: true,
    },
  });

  return booking;
}

/**
 * Cancel a booking. Enforces the >24h cancellation rule.
 */
export async function cancelBooking(bookingId, customerId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { deposits: true },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking not found'), { status: 404 });
  }

  if (booking.customerId !== customerId) {
    throw Object.assign(new Error('Not authorized'), { status: 403 });
  }

  if (!['confirmed', 'pending_payment'].includes(booking.status)) {
    throw Object.assign(new Error('Booking cannot be cancelled in its current status'), { status: 400 });
  }

  // Check >24h rule
  const bookingDateTime = new Date(booking.bookingDate);
  const [hours, minutes] = booking.bookingTime.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);
  const hoursUntilBooking = (bookingDateTime - new Date()) / (1000 * 60 * 60);

  const canRefund = hoursUntilBooking > 24;

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'cancelled',
    },
  });

  // If within 24h, deposit is forfeited; otherwise mark for refund
  if (canRefund && booking.deposits.length > 0) {
    for (const deposit of booking.deposits) {
      if (deposit.status === 'paid') {
        await prisma.deposit.update({
          where: { id: deposit.id },
          data: { status: 'refunded', refundedAt: new Date() },
        });
      }
    }
  }

  return { booking: updated, refunded: canRefund };
}

/**
 * Check in a booking by verifying the QR code.
 */
export async function checkInBooking(bookingId, qrCode) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking not found'), { status: 404 });
  }

  if (booking.status !== 'confirmed') {
    throw Object.assign(new Error('Booking is not in a confirmed state'), { status: 400 });
  }

  if (booking.qrCode !== qrCode) {
    throw Object.assign(new Error('Invalid QR code'), { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'checked_in',
      checkedInAt: new Date(),
    },
  });

  return updated;
}

/**
 * Complete a booking, trigger warranty creation and commission recording.
 */
export async function completeBooking(bookingId, merchantId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      merchantProduct: { include: { product: true } },
      merchant: true,
      customer: true,
    },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking not found'), { status: 404 });
  }

  if (booking.merchantId !== merchantId) {
    throw Object.assign(new Error('Not authorized'), { status: 403 });
  }

  if (!['checked_in', 'in_progress'].includes(booking.status)) {
    throw Object.assign(new Error('Booking must be checked in or in progress to complete'), { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });

  // Create warranty
  try {
    await createWarranty(booking);
  } catch (err) {
    console.error('Failed to create warranty:', err.message);
  }

  // Record commission
  try {
    await recordCommission(bookingId, merchantId, parseFloat(booking.servicePrice));
  } catch (err) {
    console.error('Failed to record commission:', err.message);
  }

  return updated;
}

/**
 * Mark a booking as no-show, forfeiting the deposit.
 */
export async function markNoShow(bookingId, merchantId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw Object.assign(new Error('Booking not found'), { status: 404 });
  }

  if (booking.merchantId !== merchantId) {
    throw Object.assign(new Error('Not authorized'), { status: 403 });
  }

  if (booking.status !== 'confirmed') {
    throw Object.assign(new Error('Only confirmed bookings can be marked as no-show'), { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'no_show',
    },
  });

  return updated;
}
