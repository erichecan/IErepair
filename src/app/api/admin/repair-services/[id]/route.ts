import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const serviceId = parseInt(id);
    if (isNaN(serviceId)) return Response.json({ error: "无效ID" }, { status: 400 });

    await prisma.repairService.delete({ where: { id: serviceId } });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[RepairService DELETE]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();

    const { id } = await params;
    const serviceId = parseInt(id);
    if (isNaN(serviceId)) return Response.json({ error: "无效ID" }, { status: 400 });

    const body = await req.json();
    const updates: {
      isActive?: boolean;
      basePriceMin?: number;
      basePriceMax?: number;
      durationMinutes?: number;
    } = {};

    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
    if (typeof body.basePriceMin === "number") updates.basePriceMin = body.basePriceMin;
    if (typeof body.basePriceMax === "number") updates.basePriceMax = body.basePriceMax;
    if (typeof body.durationMinutes === "number") updates.durationMinutes = body.durationMinutes;

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "无有效更新字段" }, { status: 400 });
    }

    const service = await prisma.repairService.update({
      where: { id: serviceId },
      data: updates,
      include: { repairType: true },
    });

    return Response.json({ service });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Repair Service PATCH Error]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
