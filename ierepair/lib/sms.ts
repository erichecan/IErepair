import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
);

const FROM = process.env.TWILIO_PHONE_NUMBER!;

export async function sendOTP(to: string, code: string): Promise<void> {
  await client.messages.create({
    body: `Your IERepair verification code is: ${code}. Valid for 10 minutes.`,
    from: FROM,
    to,
  });
}

export async function sendBookingConfirmation(
  to: string,
  opts: {
    shopName: string;
    scheduledAt: Date;
    bookingRef: string;
  },
): Promise<void> {
  const dateStr = opts.scheduledAt.toLocaleString("en-IE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Dublin",
  });
  await client.messages.create({
    body: `IERepair: Your repair at ${opts.shopName} is confirmed for ${dateStr}. Ref: ${opts.bookingRef}`,
    from: FROM,
    to,
  });
}

export async function sendBookingCancellation(
  to: string,
  opts: { bookingRef: string; reason?: string },
): Promise<void> {
  await client.messages.create({
    body: `IERepair: Booking ${opts.bookingRef} has been cancelled.${opts.reason ? ` Reason: ${opts.reason}` : ""} Contact us if you need help.`,
    from: FROM,
    to,
  });
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
