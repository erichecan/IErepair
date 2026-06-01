import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get("categoryId");

  try {
    const brands = await prisma.deviceBrand.findMany({
      where: categoryId ? { categoryId: parseInt(categoryId, 10) } : undefined,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return Response.json({ brands });
  } catch (error) {
    console.error("[Public DeviceBrands Error]", error);
    return Response.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}
