import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await requireAdminSession();
    const merchants = await prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, phone: true,
        address: true, eircode: true, isActive: true, createdAt: true,
      },
    });
    return Response.json({ merchants });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminSession();
    const { name, email, phone, password, address, eircode } = await req.json();

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return Response.json({ error: "姓名、邮箱和密码为必填项" }, { status: 400 });
    }

    const existing = await prisma.merchant.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "该邮箱已注册" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const merchant = await prisma.merchant.create({
      data: { name: name.trim(), email: email.trim().toLowerCase(), passwordHash, phone, address, eircode },
      select: { id: true, name: true, email: true, phone: true, address: true, eircode: true, isActive: true, createdAt: true },
    });

    return Response.json({ merchant }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Merchants POST]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
