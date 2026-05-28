import { prisma } from "@/lib/prisma";
import MerchantList from "@/components/admin/MerchantList";

export default async function MerchantsPage() {
  const merchants = await prisma.merchant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, phone: true,
      address: true, eircode: true, isActive: true, createdAt: true,
    },
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>门店管理</h1>
        <p style={{ fontSize: 14, color: "#6e6e73" }}>
          {merchants.length} 个门店账号 · {merchants.filter(m => m.isActive).length} 个已启用
        </p>
      </div>
      <MerchantList initialMerchants={merchants.map(m => ({ ...m, createdAt: m.createdAt.toISOString() }))} />
    </div>
  );
}
