import { randomBytes } from "crypto";
import QRCode from "qrcode";

/** Generate a short booking reference like "IRE-A3F9X2" */
export function generateBookingRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "";
  const bytes = randomBytes(6);
  for (const byte of bytes) {
    ref += chars[byte % chars.length];
  }
  return `IRE-${ref.slice(0, 3)}${ref.slice(3)}`;
}

/** Generate a QR code data URL for a booking reference */
export async function generateBookingQR(bookingRef: string): Promise<string> {
  return QRCode.toDataURL(bookingRef, {
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#00D084", light: "#121418" },
  });
}

/** Calculate deposit amount (20% of service price) in cents for Stripe */
export function calculateDepositCents(servicePrice: string | number): number {
  const price = typeof servicePrice === "string" ? parseFloat(servicePrice) : servicePrice;
  return Math.round(price * 0.2 * 100);
}

/** Calculate deposit amount as decimal */
export function calculateDeposit(servicePrice: string | number): number {
  const price = typeof servicePrice === "string" ? parseFloat(servicePrice) : servicePrice;
  return Math.round(price * 0.2 * 100) / 100;
}
