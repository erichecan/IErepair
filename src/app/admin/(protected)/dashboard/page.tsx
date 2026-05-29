import { prisma } from "@/lib/prisma";
import Link from "next/link";

function StatCard({ label, value, sub, href }: { label: string; value: number; sub: string; href: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea",
        padding: "24px 28px", cursor: "pointer",
      }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.5px" }}>{value}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", marginTop: 4 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#aeaeb2", marginTop: 2 }}>{sub}</div>
      </div>
    </Link>
  );
}

function ProgressBar({ pct, color = "#146345" }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 6, background: "#f0f0f5", borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: color, borderRadius: 3, transition: "width 0.3s" }} />
    </div>
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
    modelTotal,
    modelsWithServices,
    merchantsWithCoords,
  ] = await Promise.all([
    prisma.merchant.count(),
    prisma.merchant.count({ where: { isActive: true } }),
    prisma.deviceCategory.count(),
    prisma.deviceBrand.count(),
    prisma.repairService.count(),
    prisma.product.count(),
    prisma.product.count({ where: { status: "active" } }),
    prisma.productCategory.count(),
    prisma.deviceModel.count(),
    prisma.deviceModel.count({ where: { repairServices: { some: { isActive: true } } } }),
    prisma.merchant.count({ where: { lat: { not: null }, lng: { not: null } } }),
  ]);

  const stats = [
    { label: "门店账号", value: merchantTotal, sub: `${merchantActive} 个已启用`, href: "/admin/merchants" },
    { label: "维修服务", value: repairServiceCount, sub: `${deviceCatCount} 个设备品类 · ${brandCount} 个品牌`, href: "/admin/repair-catalog" },
    { label: "商品库存", value: productCount, sub: `${productActive} 个已上架 · ${productCatCount} 个商品品类`, href: "/admin/products" },
  ];

  const catalogPct = modelTotal > 0 ? Math.round((modelsWithServices / modelTotal) * 100) : 0;
  const eircodePct = merchantTotal > 0 ? Math.round((merchantsWithCoords / merchantTotal) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>数据概览</h1>
        <p style={{ fontSize: 14, color: "#6e6e73" }}>平台运营全局视图</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Link href="/admin/repair-catalog" style={{ textDecoration: "none" }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.04em" }}>维修目录完整度</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: catalogPct >= 80 ? "#146345" : catalogPct >= 40 ? "#8a6500" : "#c0392b", marginTop: 4 }}>
                  {catalogPct}%
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#6e6e73", textAlign: "right", marginTop: 4 }}>
                <div>{modelsWithServices} / {modelTotal}</div>
                <div>型号已配置服务</div>
              </div>
            </div>
            <ProgressBar pct={catalogPct} color={catalogPct >= 80 ? "#146345" : catalogPct >= 40 ? "#f59e0b" : "#ff3b30"} />
          </div>
        </Link>

        <Link href="/admin/merchants" style={{ textDecoration: "none" }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.04em" }}>Eircode 解析状态</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: eircodePct >= 80 ? "#146345" : eircodePct >= 40 ? "#8a6500" : "#c0392b", marginTop: 4 }}>
                  {eircodePct}%
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#6e6e73", textAlign: "right", marginTop: 4 }}>
                <div>{merchantsWithCoords} / {merchantTotal}</div>
                <div>门店已有坐标</div>
              </div>
            </div>
            <ProgressBar pct={eircodePct} color={eircodePct >= 80 ? "#146345" : eircodePct >= 40 ? "#f59e0b" : "#ff3b30"} />
          </div>
        </Link>
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
