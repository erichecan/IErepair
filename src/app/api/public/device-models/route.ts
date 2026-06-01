import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get("brandId");

  try {
    const models = await prisma.deviceModel.findMany({
      where: {
        isActive: true,
        ...(brandId ? { brandId: parseInt(brandId, 10) } : {}),
      },
      orderBy: [{ year: "desc" }, { name: "asc" }],
    });
    return Response.json({ models });
  } catch (error) {
    console.error("[Public DeviceModels Error]", error);
    return Response.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}
