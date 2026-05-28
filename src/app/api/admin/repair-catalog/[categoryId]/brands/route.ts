import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    await requireAdminSession();

    const { categoryId } = await params;
    const id = parseInt(categoryId);
    if (isNaN(id)) return Response.json({ error: "无效ID" }, { status: 400 });

    const brands = await prisma.deviceBrand.findMany({
      where: { categoryId: id },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { models: true } },
      },
    });

    return Response.json({ brands });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Brands API Error]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
