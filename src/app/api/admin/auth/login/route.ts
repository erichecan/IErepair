import { prisma } from "@/lib/prisma";
import { signAdminToken, COOKIE_NAME } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "邮箱和密码不能为空" }, { status: 400 });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.isActive) {
      return Response.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return Response.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const token = await signAdminToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return Response.json({ ok: true, name: admin.name, role: admin.role });
  } catch (error) {
    console.error("[Admin Login Error]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
