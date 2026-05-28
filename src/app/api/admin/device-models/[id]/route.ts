import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();

    const { id } = await params;
    const modelId = parseInt(id);
    if (isNaN(modelId)) return Response.json({ error: "无效ID" }, { status: 400 });

    const body = await req.json();
    const updates: { name?: string; year?: number | null; isActive?: boolean } = {};

    if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
    if (body.year === null || (typeof body.year === "number" && !isNaN(body.year))) updates.year = body.year;
    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "无有效更新字段" }, { status: 400 });
    }

    const model = await prisma.deviceModel.update({
      where: { id: modelId },
      data: updates,
    });

    return Response.json({ model });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Device Model PATCH Error]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
