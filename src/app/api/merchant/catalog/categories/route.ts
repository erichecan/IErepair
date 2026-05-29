import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET() {
  try {
    await requireMerchantSession();
    const categories = await prisma.productCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    });
    return Response.json({ categories });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
