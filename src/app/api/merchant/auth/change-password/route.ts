import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await requireMerchantSession();
    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 8) {
      return Response.json({ error: "密码至少 8 位" }, { status: 400 });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.merchant.update({
      where: { id: session.merchantId },
      data: { passwordHash: hash, mustChangePassword: false },
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Merchant ChangePassword]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
