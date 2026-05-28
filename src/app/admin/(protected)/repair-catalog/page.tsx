import { prisma } from "@/lib/prisma";
import Link from "next/link";

const CATEGORY_ICONS: Record<string, string> = {
  smartphone: "📱",
  tablet: "⬛",
  laptop: "💻",
  desktop: "🖥️",
  console: "🎮",
};

export default async function RepairCatalogPage() {
  const categories = await prisma.deviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { brands: true, repairTypes: true } },
      brands: {
        include: { _count: { select: { models: true } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const totalModels = categories.reduce(
    (sum, c) => sum + c.brands.reduce((s, b) => s + b._count.models, 0),
    0
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>产品母库</h1>
        <p style={{ fontSize: 14, color: "#6e6e73", marginTop: 6 }}>
          共 {categories.length} 个设备类别 · {totalModels} 个设备型号
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {categories.map((cat) => {
          const modelCount = cat.brands.reduce((s, b) => s + b._count.models, 0);
          return (
            <Link
              key={cat.id}
              href={`/admin/repair-catalog/${cat.id}`}
              style={{ textDecoration: "none" }}
            >
              <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e5e5ea", cursor: "pointer", transition: "box-shadow 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, background: "#f5f5f7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    {CATEGORY_ICONS[cat.slug] ?? "📦"}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f" }}>{cat.name}</div>
                    <div style={{ fontSize: 12, color: "#6e6e73" }}>{cat.nameEn}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-accent, #146345)" }}>{cat._count.brands}</div>
                    <div style={{ fontSize: 12, color: "#6e6e73" }}>品牌</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f" }}>{modelCount}</div>
                    <div style={{ fontSize: 12, color: "#6e6e73" }}>型号</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f" }}>{cat._count.repairTypes}</div>
                    <div style={{ fontSize: 12, color: "#6e6e73" }}>维修类型</div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
