import { prisma } from "@/lib/prisma";
import CatalogCategoryGrid, { CategoryRow } from "@/components/admin/CatalogCategoryGrid";

export default async function RepairCatalogPage() {
  const categories = await prisma.deviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { brands: true, repairTypes: true } },
      brands: {
        include: { _count: { select: { models: true } } },
      },
    },
  });

  const rows: CategoryRow[] = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    nameEn: cat.nameEn,
    slug: cat.slug,
    modelCount: cat.brands.reduce((s, b) => s + b._count.models, 0),
    brandCount: cat._count.brands,
    repairTypeCount: cat._count.repairTypes,
  }));

  return <CatalogCategoryGrid initialCategories={rows} />;
}
