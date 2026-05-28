import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdminSession();
    const categories = await prisma.productCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return Response.json({ categories });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminSession();
    const { name, nameEn, slug } = await req.json();
    if (!name?.trim() || !nameEn?.trim() || !slug?.trim()) {
      return Response.json({ error: "名称、英文名和标识符为必填项" }, { status: 400 });
    }
    const category = await prisma.productCategory.create({
      data: { name: name.trim(), nameEn: nameEn.trim(), slug: slug.trim().toLowerCase() },
      include: { _count: { select: { products: true } } },
    });
    return Response.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[ProductCategories POST]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
