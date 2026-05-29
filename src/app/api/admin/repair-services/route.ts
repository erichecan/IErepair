import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdminSession();
    const { deviceModelId, repairTypeId, basePriceMin, basePriceMax, durationMinutes } = await req.json();

    if (!deviceModelId || !repairTypeId || basePriceMin == null || basePriceMax == null || !durationMinutes) {
      return Response.json({ error: "所有字段为必填项" }, { status: 400 });
    }

    const service = await prisma.repairService.create({
      data: {
        deviceModelId: parseInt(deviceModelId),
        repairTypeId: parseInt(repairTypeId),
        basePriceMin: parseFloat(basePriceMin),
        basePriceMax: parseFloat(basePriceMax),
        durationMinutes: parseInt(durationMinutes),
      },
      include: { repairType: true },
    });
    return Response.json({ service }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return Response.json({ error: "该型号已存在此维修类型的服务" }, { status: 409 });
    }
    console.error("[Repair Services POST]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
