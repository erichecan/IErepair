import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import ServiceToggle from "@/components/admin/ServiceToggle";

export default async function ModelServicesPage({
  params,
}: {
  params: Promise<{ categoryId: string; brandId: string; modelId: string }>;
}) {
  const { categoryId, brandId, modelId } = await params;
  const catId = parseInt(categoryId);
  const brdId = parseInt(brandId);
  const mdlId = parseInt(modelId);
  if (isNaN(catId) || isNaN(brdId) || isNaN(mdlId)) notFound();

  const model = await prisma.deviceModel.findUnique({
    where: { id: mdlId },
    include: {
      brand: {
        include: { category: { select: { id: true, name: true } } },
      },
      repairServices: {
        orderBy: { repairType: { sortOrder: "asc" } },
        include: { repairType: true },
      },
    },
  });

  if (!model || model.brand.id !== brdId || model.brand.categoryId !== catId) notFound();

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", gap: 8, fontSize: 13, color: "var(--color-accent, #146345)" }}>
        <Link href={`/admin/repair-catalog/${catId}`} style={{ color: "inherit", textDecoration: "none" }}>
          {model.brand.category.name}
        </Link>
        <span style={{ color: "#c7c7cc" }}>›</span>
        <Link href={`/admin/repair-catalog/${catId}/${brdId}`} style={{ color: "inherit", textDecoration: "none" }}>
          {model.brand.name}
        </Link>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "8px 0 4px" }}>
          {model.brand.name} {model.name}
        </h1>
        <p style={{ fontSize: 14, color: "#6e6e73" }}>
          {model.year ? `${model.year} 年款 · ` : ""}{model.repairServices.length} 项维修服务
        </p>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f7" }}>
              <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.05em" }}>维修类型</th>
              <th style={{ padding: "12px 20px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.05em" }}>参考价格 (€)</th>
              <th style={{ padding: "12px 20px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.05em" }}>预计时长</th>
              <th style={{ padding: "12px 20px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.05em" }}>状态</th>
            </tr>
          </thead>
          <tbody>
            {model.repairServices.map((svc, idx) => (
              <tr key={svc.id} style={{ borderTop: idx > 0 ? "1px solid #f0f0f0" : "none" }}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>{svc.repairType.name}</div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>{svc.repairType.nameEn}</div>
                </td>
                <td style={{ padding: "14px 20px", textAlign: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>
                    €{Number(svc.basePriceMin)} – €{Number(svc.basePriceMax)}
                  </span>
                </td>
                <td style={{ padding: "14px 20px", textAlign: "center", fontSize: 13, color: "#6e6e73" }}>
                  {svc.durationMinutes} 分钟
                </td>
                <td style={{ padding: "14px 20px", textAlign: "center" }}>
                  <ServiceToggle serviceId={svc.id} isActive={svc.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
