import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) return Response.json({ error: "无效ID" }, { status: 400 });

    const repairTypes = await prisma.repairType.findMany({
      where: { categoryId },
      orderBy: { sortOrder: "asc" },
    });
    return Response.json({ repairTypes });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) return Response.json({ error: "无效ID" }, { status: 400 });

    const { name, nameEn } = await req.json();
    if (!name?.trim() || !nameEn?.trim()) {
      return Response.json({ error: "名称和英文名为必填项" }, { status: 400 });
    }

    const repairType = await prisma.repairType.create({
      data: { name: name.trim(), nameEn: nameEn.trim(), categoryId },
    });
    return Response.json({ repairType }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return Response.json({ error: "该分类下已存在同名维修类型" }, { status: 409 });
    }
    console.error("[RepairTypes POST]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
