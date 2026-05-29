import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import MerchantDetailForm from "@/components/admin/MerchantDetailForm";

export default async function MerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const merchantId = parseInt(id);
  if (isNaN(merchantId)) notFound();

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      id: true, name: true, email: true, phone: true,
      address: true, eircode: true, lat: true, lng: true,
      isActive: true, createdAt: true, updatedAt: true,
    },
  });

  if (!merchant) notFound();

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Link href="/admin/merchants" style={{ fontSize: 13, color: "var(--color-accent, #146345)", textDecoration: "none" }}>
          ← 门店管理
        </Link>
      </div>

      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>{merchant.name}</h1>
        <span style={{
          padding: "3px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500,
          background: merchant.isActive ? "#e6f7ee" : "#f5f5f7",
          color: merchant.isActive ? "#146345" : "#6e6e73",
        }}>
          {merchant.isActive ? "已启用" : "已停用"}
        </span>
      </div>

      <MerchantDetailForm
        merchant={{
          ...merchant,
          lat: merchant.lat ?? null,
          lng: merchant.lng ?? null,
          createdAt: merchant.createdAt.toISOString(),
          updatedAt: merchant.updatedAt.toISOString(),
        }}
      />
    </div>
  );
}
