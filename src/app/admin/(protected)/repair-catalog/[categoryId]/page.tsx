import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import CatalogTree, { type CatalogBrand, type RepairTypeOption } from "@/components/admin/CatalogTree";
import AddBrandButton from "@/components/admin/AddBrandButton";
import RepairTypeManager from "@/components/admin/RepairTypeManager";

export default async function CategoryBrandsPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const id = parseInt(categoryId);
  if (isNaN(id)) notFound();

  const category = await prisma.deviceCategory.findUnique({
    where: { id },
    include: {
      repairTypes: { orderBy: { sortOrder: "asc" } },
      brands: {
        orderBy: { sortOrder: "asc" },
        include: {
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
      },
    },
  });

  if (!category) notFound();

  const repairTypesData: RepairTypeOption[] = category.repairTypes.map(rt => ({
    id: rt.id,
    name: rt.name,
    nameEn: rt.nameEn,
  }));

  const brandsData: CatalogBrand[] = category.brands.map(b => ({
    id: b.id,
    name: b.name,
    models: b.models.map(m => ({
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
    })),
  }));

  const totalModels = brandsData.reduce((s, b) => s + b.models.length, 0);
  const totalServices = brandsData.reduce((s, b) => s + b.models.reduce((ms, m) => ms + m.repairServices.length, 0), 0);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Link href="/admin/repair-catalog" style={{ fontSize: 13, color: "var(--color-accent, #146345)", textDecoration: "none" }}>
          ← 返回产品母库
        </Link>
      </div>

      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "8px 0 4px" }}>{category.name}</h1>
          <p style={{ fontSize: 14, color: "#6e6e73" }}>
            {brandsData.length} 个品牌 · {totalModels} 个型号 · {totalServices} 项服务
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <p style={{ fontSize: 12, color: "#aeaeb2", margin: 0 }}>
            点击品牌展开 → 展开型号 → 点击价格 / 时长 / 名称可直接编辑
          </p>
          <AddBrandButton categoryId={id} />
        </div>
      </div>

      <RepairTypeManager categoryId={id} initialRepairTypes={repairTypesData} />

      <CatalogTree initialBrands={brandsData} categoryId={id} repairTypes={repairTypesData} />
    </div>
  );
}
