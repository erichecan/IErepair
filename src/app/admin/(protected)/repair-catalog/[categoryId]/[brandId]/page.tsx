import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import ModelAccordion, { type DeviceModel, type RepairTypeOption } from "@/components/admin/ModelAccordion";

export default async function BrandModelsPage({
  params,
}: {
  params: Promise<{ categoryId: string; brandId: string }>;
}) {
  const { categoryId, brandId } = await params;
  const catId = parseInt(categoryId);
  const brdId = parseInt(brandId);
  if (isNaN(catId) || isNaN(brdId)) notFound();

  const [brand, repairTypesRaw] = await Promise.all([
    prisma.deviceBrand.findUnique({
      where: { id: brdId },
      include: {
        category: { select: { id: true, name: true } },
        models: {
          orderBy: [{ year: "desc" }, { name: "asc" }],
          include: {
            repairServices: {
              orderBy: { repairType: { sortOrder: "asc" } },
              include: { repairType: { select: { name: true, nameEn: true } } },
            },
          },
        },
      },
    }),
    prisma.repairType.findMany({
      where: { categoryId: catId },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, nameEn: true },
    }),
  ]);

  if (!brand || brand.categoryId !== catId) notFound();

  const modelsData: DeviceModel[] = brand.models.map(m => ({
    id: m.id,
    name: m.name,
    year: m.year,
    isActive: m.isActive,
    repairServices: m.repairServices.map(s => ({
      id: s.id,
      repairType: { name: s.repairType.name, nameEn: s.repairType.nameEn },
      basePriceMin: Number(s.basePriceMin),
      basePriceMax: Number(s.basePriceMax),
      durationMinutes: s.durationMinutes,
      isActive: s.isActive,
    })),
  }));

  const repairTypesData: RepairTypeOption[] = repairTypesRaw;

  const totalServices = modelsData.reduce((sum, m) => sum + m.repairServices.length, 0);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Link
          href={`/admin/repair-catalog/${catId}`}
          style={{ fontSize: 13, color: "var(--color-accent, #146345)", textDecoration: "none" }}
        >
          ← {brand.category.name}
        </Link>
      </div>

      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "8px 0 4px" }}>
            {brand.name}
          </h1>
          <p style={{ fontSize: 14, color: "#6e6e73" }}>
            {brand.models.length} 个型号 · {totalServices} 项维修服务
          </p>
        </div>
        <p style={{ fontSize: 12, color: "#aeaeb2", marginBottom: 4 }}>
          点击型号名称 / 年份 / 价格 / 时长可直接编辑
        </p>
      </div>

      <ModelAccordion initialModels={modelsData} brandId={brdId} repairTypes={repairTypesData} />
    </div>
  );
}
