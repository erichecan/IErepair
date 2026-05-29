import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdminSession();
    const { brandId, name, year } = await req.json();

    if (!brandId || !name?.trim()) {
      return Response.json({ error: "品牌ID和型号名称为必填项" }, { status: 400 });
    }

    const model = await prisma.deviceModel.create({
      data: {
        brandId: parseInt(brandId),
        name: name.trim(),
        year: year ? parseInt(year) : null,
      },
    });
    return Response.json({ model }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return Response.json({ error: "该品牌下已存在同名型号" }, { status: 409 });
    }
    console.error("[Device Models POST]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
