import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { repairBookings } from "@/lib/db/schema/bookings";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export const config = { api: { bodyParser: false } };

export async function POST(request: NextRequest) {
  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        if (!bookingId) break;

        await db.update(repairBookings).set({
          depositPaid:           true,
          stripePaymentIntentId: session.payment_intent as string,
          status:                "pending",
          updatedAt:             new Date(),
        }).where(eq(repairBookings.id, bookingId));

        console.log(`[stripe webhook] Deposit paid for booking ${bookingId}`);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        if (!bookingId) break;

        // Cancel booking if deposit was never paid
        const booking = await db.query.repairBookings.findFirst({
          where: eq(repairBookings.id, bookingId),
        });
        if (booking && !booking.depositPaid) {
          await db.update(repairBookings).set({
            status:      "cancelled",
            cancelledBy: "system",
            cancelledAt: new Date(),
            updatedAt:   new Date(),
          }).where(eq(repairBookings.id, bookingId));
        }
        break;
      }

      default:
        console.log(`[stripe webhook] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error("[stripe webhook] handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
