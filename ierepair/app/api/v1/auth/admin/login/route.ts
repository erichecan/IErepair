import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { adminUsers } from "@/lib/db/schema/admin";

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

    const admin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email),
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Update lastLoginAt in background (non-blocking)
    db.update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, admin.id))
      .catch((e) => console.error("[admin/login] lastLoginAt update failed", e));

    const token = await encode({
      token: {
        sub: admin.id,
        email: admin.email,
        role: "admin",
        adminRole: admin.role,
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
    console.error("[admin/login]", err);
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
  }
}
