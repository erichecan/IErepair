import { prisma } from "@/lib/prisma";
import { signMerchantToken, MERCHANT_COOKIE_NAME } from "@/lib/merchant-auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return Response.json({ error: "邮箱和密码为必填项" }, { status: 400 });
    }

    const merchant = await prisma.merchant.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!merchant || !merchant.isActive) {
      return Response.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, merchant.passwordHash);
    if (!valid) {
      return Response.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const token = await signMerchantToken({ merchantId: merchant.id, email: merchant.email });
    const cookieStore = await cookies();
    cookieStore.set(MERCHANT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return Response.json({ ok: true, mustChangePassword: merchant.mustChangePassword });
  } catch (error) {
    console.error("[Merchant Login]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
