import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireMerchantSession();
    const { id } = await params;
    const { price, isActive } = await req.json();

    const item = await prisma.merchantProduct.findUnique({ where: { id: parseInt(id) } });
    if (!item || item.merchantId !== session.merchantId) {
      return Response.json({ error: "记录不存在" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (price !== undefined && price > 0) data.price = price;
    if (isActive !== undefined) data.isActive = isActive;

    const updated = await prisma.merchantProduct.update({ where: { id: parseInt(id) }, data });
    return Response.json({ id: updated.id, price: Number(updated.price), isActive: updated.isActive });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireMerchantSession();
    const { id } = await params;

    const item = await prisma.merchantProduct.findUnique({ where: { id: parseInt(id) } });
    if (!item || item.merchantId !== session.merchantId) {
      return Response.json({ error: "记录不存在" }, { status: 404 });
    }

    await prisma.merchantProduct.delete({ where: { id: parseInt(id) } });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
