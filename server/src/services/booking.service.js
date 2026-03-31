// TODO: Implement booking business logic with Prisma

export async function createBooking(data) {
  // TODO: Create booking record, generate booking number, initiate Stripe checkout
  throw new Error('Not implemented');
}

export async function cancelBooking(bookingId) {
  // TODO: Cancel booking, handle refund logic (>24h = full refund, <24h = no refund)
  throw new Error('Not implemented');
}

export async function checkInBooking(bookingId) {
  // TODO: Verify QR code, update status to CHECKED_IN
  throw new Error('Not implemented');
}

export async function completeBooking(bookingId) {
  // TODO: Mark as COMPLETED, trigger warranty creation, calculate commission
  throw new Error('Not implemented');
}

export async function markNoShow(bookingId) {
  // TODO: Mark as NO_SHOW, forfeit deposit (non-refundable)
  throw new Error('Not implemented');
}

export function generateBookingNumber() {
  // TODO: Generate unique booking number (e.g., IRA-20260330-XXXX)
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `IRA-${date}-${rand}`;
}
