import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function StatCard({ label, value, sub, href }: { label: string; value: number; sub: string; href: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea",
        padding: "24px 28px", cursor: "pointer", transition: "box-shadow 0.15s",
      }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.5px" }}>{value}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#aeaeb2", marginTop: 2 }}>{sub}</div>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const [
    merchantTotal,
    merchantActive,
    deviceCatCount,
    brandCount,
    repairServiceCount,
    productCount,
    productActive,
    productCatCount,
  ] = await Promise.all([
    prisma.merchant.count(),
    prisma.merchant.count({ where: { isActive: true } }),
    prisma.deviceCategory.count(),
    prisma.deviceBrand.count(),
    prisma.repairService.count(),
    prisma.product.count(),
    prisma.product.count({ where: { status: "active" } }),
    prisma.productCategory.count(),
  ]);

  const stats = [
    { label: "门店账号", value: merchantTotal, sub: `${merchantActive} 个已启用`, href: "/admin/merchants" },
    { label: "维修服务", value: repairServiceCount, sub: `${deviceCatCount} 个设备品类 · ${brandCount} 个品牌`, href: "/admin/repair-catalog" },
    { label: "商品库存", value: productCount, sub: `${productActive} 个已上架 · ${productCatCount} 个商品品类`, href: "/admin/products" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>数据概览</h1>
        <p style={{ fontSize: 14, color: "#6e6e73" }}>平台运营全局视图</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "24px 28px" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f", margin: "0 0 16px" }}>快速入口</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "管理维修目录", href: "/admin/repair-catalog" },
            { label: "管理门店账号", href: "/admin/merchants" },
            { label: "管理商品母库", href: "/admin/products" },
            { label: "管理品类", href: "/admin/categories" },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "10px 20px", background: "#f5f5f7", borderRadius: 8,
                fontSize: 14, color: "#1d1d1f", textDecoration: "none", fontWeight: 500,
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
