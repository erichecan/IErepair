import Stripe from 'stripe';
import prisma from '../config/database.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * Create a Stripe Checkout Session for the booking deposit.
 */
export async function createCheckoutSession(booking) {
  const depositAmount = Math.round(parseFloat(booking.depositAmount) * 100); // cents

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Deposit for ${booking.serviceName}`,
            description: `Booking ${booking.bookingNumber}`,
          },
          unit_amount: depositAmount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
    },
    success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/booking/${booking.id}?payment=success`,
    cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/shop/${booking.merchant?.slug || 'unknown'}/book/${booking.merchantProductId}?payment=cancelled`,
  });

  // Create a deposit record linked to the checkout session
  await prisma.deposit.create({
    data: {
      bookingId: booking.id,
      amount: booking.depositAmount,
      stripeCheckoutId: session.id,
      status: 'pending',
    },
  });

  return session;
}

/**
 * Handle Stripe webhook events.
 */
export async function handleWebhookEvent(event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      // Mark booking as confirmed
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'confirmed' },
      });

      // Mark deposit as paid
      await prisma.deposit.updateMany({
        where: {
          bookingId,
          stripeCheckoutId: session.id,
        },
        data: {
          status: 'paid',
          stripePaymentId: session.payment_intent,
        },
      });
    }
  }

  return { received: true };
}

/**
 * Create a Stripe refund for a deposit.
 */
export async function createRefund(depositId) {
  const deposit = await prisma.deposit.findUnique({
    where: { id: depositId },
  });

  if (!deposit) {
    throw Object.assign(new Error('Deposit not found'), { status: 404 });
  }

  if (!deposit.stripePaymentId) {
    throw Object.assign(new Error('No payment to refund'), { status: 400 });
  }

  const refund = await stripe.refunds.create({
    payment_intent: deposit.stripePaymentId,
    amount: Math.round(parseFloat(deposit.amount) * 100),
  });

  await prisma.deposit.update({
    where: { id: depositId },
    data: {
      status: 'refunded',
      refundedAt: new Date(),
    },
  });

  return refund;
}
