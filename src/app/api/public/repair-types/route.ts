import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get("categoryId");

  try {
    const types = await prisma.repairType.findMany({
      where: categoryId ? { categoryId: parseInt(categoryId, 10) } : undefined,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return Response.json({ repairTypes: types });
  } catch (error) {
    console.error("[Public RepairTypes Error]", error);
    return Response.json({ error: "Failed to fetch repair types" }, { status: 500 });
  }
}
