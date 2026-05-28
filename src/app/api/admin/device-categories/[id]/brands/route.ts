import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) return Response.json({ error: "无效ID" }, { status: 400 });

    const { name, slug } = await req.json();
    if (!name?.trim() || !slug?.trim()) {
      return Response.json({ error: "品牌名称和标识符为必填项" }, { status: 400 });
    }

    const brand = await prisma.deviceBrand.create({
      data: { name: name.trim(), slug: slug.trim().toLowerCase(), categoryId },
      include: { _count: { select: { models: true } } },
    });
    return Response.json({ brand }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[DeviceBrands POST]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
