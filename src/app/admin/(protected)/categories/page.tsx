import { prisma } from "@/lib/prisma";
import CategoriesManager from "@/components/admin/CategoriesManager";

export default async function CategoriesPage() {
  const [deviceCats, productCats] = await Promise.all([
    prisma.deviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { brands: true, repairTypes: true } } },
    }),
    prisma.productCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>品类管理</h1>
        <p style={{ fontSize: 14, color: "#6e6e73" }}>
          {deviceCats.length} 个设备品类 · {productCats.length} 个商品品类
        </p>
      </div>
      <CategoriesManager initialDeviceCats={deviceCats} initialProductCats={productCats} />
    </div>
  );
}
