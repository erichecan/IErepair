import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { merchants } from "@/lib/db/schema/merchants";

const COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 },
      );
    }

    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.email, email),
    });

    if (!merchant || merchant.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Invalid credentials or account inactive" },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(password, merchant.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials or account inactive" },
        { status: 401 },
      );
    }

    const token = await encode({
      token: {
        sub: merchant.id,
        email: merchant.email,
        role: "merchant",
        merchantId: merchant.id,
      },
      secret: process.env.AUTH_SECRET!,
      salt: COOKIE,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set({
      name: COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return res;
  } catch (err) {
    console.error("[merchant/login]", err);
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
  }
}
