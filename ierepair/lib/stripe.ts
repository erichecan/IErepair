import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
});

/**
 * Create a Stripe Checkout Session for repair booking deposit.
 */
export async function createDepositCheckoutSession(opts: {
  bookingId: string;
  bookingRef: string;
  serviceName: string;
  shopName: string;
  depositAmountCents: number;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: opts.customerEmail,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Repair Deposit — ${opts.serviceName}`,
            description: `${opts.shopName} | Booking #${opts.bookingRef}`,
          },
          unit_amount: opts.depositAmountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: opts.bookingId,
      bookingRef: opts.bookingRef,
    },
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
  });
}

/**
 * Issue a full or partial refund on a PaymentIntent.
 */
export async function issueRefund(
  paymentIntentId: string,
  amountCents?: number,
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amountCents ? { amount: amountCents } : {}),
  });
}
