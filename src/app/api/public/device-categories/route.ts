import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.deviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return Response.json({ categories });
  } catch (error) {
    console.error("[Public DeviceCategories Error]", error);
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
