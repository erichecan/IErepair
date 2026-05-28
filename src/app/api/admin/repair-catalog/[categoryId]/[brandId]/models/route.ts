import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ categoryId: string; brandId: string }> }
) {
  try {
    await requireAdminSession();

    const { brandId } = await params;
    const id = parseInt(brandId);
    if (isNaN(id)) return Response.json({ error: "无效ID" }, { status: 400 });

    const models = await prisma.deviceModel.findMany({
      where: { brandId: id },
      orderBy: [{ year: "desc" }, { name: "asc" }],
      include: {
        _count: { select: { repairServices: true } },
      },
    });

    return Response.json({ models });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Models API Error]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
