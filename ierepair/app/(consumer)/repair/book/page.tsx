import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { merchants } from "@/lib/db/schema/merchants";
import { merchantServices, repairServices } from "@/lib/db/schema/repair-services";
import { eq, and } from "drizzle-orm";
import BookFlowClient, { type StoreService } from "./BookFlowClient";

export const revalidate = 60;

async function loadStore(storeId: string): Promise<{
  storeName: string;
  services: StoreService[];
} | null> {
  const store = await db.query.merchants.findFirst({
    where: (t, { or, eq }) => or(eq(t.id, storeId), eq(t.slug, storeId)),
    columns: { id: true, shopName: true, status: true },
  });
  if (!store || store.status !== "active") return null;

  const services = await db
    .select({
      merchantServiceId: merchantServices.id,
      price: merchantServices.price,
      depositAmount: merchantServices.depositAmount,
      serviceName: repairServices.name,
      deviceModel: repairServices.deviceModel,
      deviceBrand: repairServices.deviceBrand,
      deviceSlug: repairServices.deviceSlug,
      estimatedMin: repairServices.estimatedMin,
      imageUrl: repairServices.imageUrl,
    })
    .from(merchantServices)
    .innerJoin(
      repairServices,
      eq(merchantServices.repairServiceId, repairServices.id),
    )
    .where(
      and(
        eq(merchantServices.merchantId, store.id),
        eq(merchantServices.isAvailable, true),
        eq(repairServices.isActive, true),
      ),
    );

  return {
    storeName: store.shopName,
    services: services.map((s) => ({
      merchantServiceId: s.merchantServiceId,
      serviceName: s.serviceName,
      deviceModel: s.deviceModel,
      deviceBrand: s.deviceBrand,
      deviceSlug: s.deviceSlug,
      price: s.price,
      depositAmount: s.depositAmount,
      estimatedMin: s.estimatedMin,
      imageUrl: s.imageUrl,
    })),
  };
}

export default async function BookRepairPage({
  searchParams,
}: {
  searchParams: Promise<{
    storeId?: string;
    storeName?: string;
    deviceSlug?: string;
    cancelled?: string;
  }>;
}) {
  const sp = await searchParams;
  const storeId = sp.storeId ?? "";
  const deviceSlug = sp.deviceSlug ?? "";

  // No shop chosen yet — route the user into the discovery flow.
  if (!storeId) {
    if (deviceSlug) {
      redirect(`/repair/device/${deviceSlug}/book`);
    }
    redirect("/repair/browse");
  }

  const store = await loadStore(storeId);

  if (!store) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-[#242424] mb-2">
            Shop not found
          </h1>
          <p className="text-sm text-[#898989] mb-6">
            The shop you&apos;re trying to book at isn&apos;t available right
            now. Browse other shops that can repair your device.
          </p>
          <Link
            href="/repair/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#242424] text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Browse repairs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <BookFlowClient
      storeId={storeId}
      storeName={sp.storeName ?? store.storeName}
      deviceSlug={deviceSlug || null}
      services={store.services}
      cancelled={sp.cancelled === "1"}
    />
  );
}
