import { prisma } from "@/lib/prisma";
import ProductCatalog from "@/components/admin/ProductCatalog";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.productCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const serialized = products.map(p => ({
    ...p,
    basePriceMin: p.basePriceMin ? Number(p.basePriceMin) : null,
    basePriceMax: p.basePriceMax ? Number(p.basePriceMax) : null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>商品母库</h1>
        <p style={{ fontSize: 14, color: "#6e6e73" }}>
          {products.length} 个商品 · {products.filter(p => p.status === "active").length} 个已上架
        </p>
      </div>
      <ProductCatalog initialProducts={serialized} categories={categories} />
    </div>
  );
}
