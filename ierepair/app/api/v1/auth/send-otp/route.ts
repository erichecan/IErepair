import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { otpCodes } from "@/lib/db/schema/users";
import { sendOTP, generateOTP } from "@/lib/sms";
import { eq, and, gt } from "drizzle-orm";

// Rate limit: 1 OTP per 60 seconds per phone
const OTP_VALID_MINUTES = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body as { phone: string };

    if (!phone || !/^\+353\d{7,10}$/.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json(
        { success: false, error: "Valid Irish phone number required (+353...)" },
        { status: 400 },
      );
    }

    const normalised = phone.replace(/\s/g, "");

    // Check for recent unused OTP (rate limit)
    const recentOtp = await db.query.otpCodes.findFirst({
      where: (t, { and, eq, gt }) =>
        and(
          eq(t.phone, normalised),
          eq(t.used, false),
          gt(t.expiresAt, new Date(Date.now() - 60_000)), // sent within last 60s
        ),
    });
    if (recentOtp) {
      return NextResponse.json(
        { success: false, error: "Please wait 60 seconds before requesting a new code" },
        { status: 429 },
      );
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_VALID_MINUTES * 60_000);

    await db.insert(otpCodes).values({ phone: normalised, code, expiresAt });

    if (process.env.NODE_ENV === "production") {
      await sendOTP(normalised, code);
    } else {
      // Dev: log code to console instead of sending SMS
      console.log(`[DEV OTP] ${normalised} → ${code}`);
    }

    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("[send-otp]", err);
    return NextResponse.json({ success: false, error: "Failed to send OTP" }, { status: 500 });
  }
}
