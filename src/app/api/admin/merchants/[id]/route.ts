import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const merchantId = parseInt(id);
    if (isNaN(merchantId)) return Response.json({ error: "无效ID" }, { status: 400 });

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
    if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.phone === "string") updates.phone = body.phone.trim() || null;
    if (typeof body.address === "string") updates.address = body.address.trim() || null;
    if (typeof body.eircode === "string") updates.eircode = body.eircode.trim().toUpperCase() || null;
    if (typeof body.password === "string" && body.password.trim()) {
      updates.passwordHash = await bcrypt.hash(body.password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "无有效更新字段" }, { status: 400 });
    }

    const merchant = await prisma.merchant.update({
      where: { id: merchantId },
      data: updates,
      select: { id: true, name: true, email: true, phone: true, address: true, eircode: true, isActive: true, createdAt: true },
    });

    return Response.json({ merchant });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Merchant PATCH]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
