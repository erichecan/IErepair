// TODO: Implement Stripe integration

export async function createCheckoutSession({ bookingId, amount, currency = 'eur' }) {
  // TODO: Create Stripe Checkout Session for 20% deposit payment
  throw new Error('Not implemented');
}

export async function handleWebhookEvent(event) {
  // TODO: Process Stripe webhook events (checkout.session.completed, etc.)
  throw new Error('Not implemented');
}

export async function createRefund({ paymentIntentId, amount }) {
  // TODO: Create a Stripe refund for cancelled bookings
  throw new Error('Not implemented');
}
