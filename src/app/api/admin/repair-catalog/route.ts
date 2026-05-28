import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdminSession();

    const categories = await prisma.deviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { brands: true, repairTypes: true },
        },
        brands: {
          include: {
            _count: { select: { models: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return Response.json({ categories });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Repair Catalog API Error]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
