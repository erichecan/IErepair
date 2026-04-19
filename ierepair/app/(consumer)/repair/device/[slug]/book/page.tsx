import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star, MapPin, ChevronRight, Wrench } from "lucide-react";
import {
  getDeviceBySlug,
  getMerchantsForDevice,
} from "@/lib/db/queries/repair";

/* Static-time rendered shop picker — server component, fast. */
export const revalidate = 120;

export default async function PickShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [device, merchants] = await Promise.all([
    getDeviceBySlug(slug),
    getMerchantsForDevice(slug),
  ]);

  if (!device) notFound();

  return (
    <div className="pb-16">
      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pt-6">
        <Link
          href={`/repair/device/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-[#898989] hover:text-[#242424] transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to {device.deviceModel}
        </Link>
      </div>

      {/* ── Device summary ──────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pt-4">
        <div className="flex items-center gap-4 py-4 border-b border-[rgba(34,42,53,0.08)]">
          <div className="w-16 h-16 rounded-2xl bg-[#f8f8f8] flex items-center justify-center shrink-0 relative overflow-hidden">
            {device.imageUrl ? (
              <Image
                src={device.imageUrl}
                alt={device.deviceModel}
                fill
                sizes="64px"
                className="object-contain p-2"
                unoptimized
              />
            ) : (
              <Wrench size={20} className="text-[#898989]" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-[#898989] font-medium">
              {device.deviceBrand}
            </div>
            <h1
              className="text-xl md:text-2xl font-bold text-[#242424] leading-tight"
              style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}
            >
              Pick a shop to repair your {device.deviceModel}
            </h1>
            <p className="text-sm text-[#898989] mt-1">
              {merchants.length} shop{merchants.length !== 1 ? "s" : ""} available ·
              {" "}
              Pay 20% deposit to secure your slot
            </p>
          </div>
        </div>
      </div>

      {/* ── Shop list ────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pt-6 space-y-3">
        {merchants.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#898989]">
            No partner shops offer repairs for this device yet.
            <br />
            <Link
              href="/pages/contact"
              className="inline-block mt-3 text-[#e05c2a] font-semibold hover:underline"
            >
              Contact us for a custom quote →
            </Link>
          </div>
        ) : (
          merchants.map((m) => (
            <Link
              key={m.merchantId}
              href={`/repair/book?storeId=${m.merchantId}&storeName=${encodeURIComponent(
                m.shopName,
              )}&deviceSlug=${slug}`}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-[#f8f8f8] transition-colors group"
              style={{
                boxShadow:
                  "rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.03) 0px 2px 8px",
              }}
            >
              {/* Shop logo */}
              <div className="w-14 h-14 rounded-xl bg-[#f8f8f8] flex items-center justify-center shrink-0 overflow-hidden">
                {m.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.logoUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-lg" aria-hidden="true">
                    🔧
                  </span>
                )}
              </div>

              {/* Shop info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#242424] text-[15px] leading-tight">
                  {m.shopName}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#898989]">
                  {m.city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} aria-hidden="true" />
                      {m.city}
                    </span>
                  )}
                  {m.rating && Number(m.rating) > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Star size={11} aria-hidden="true" className="fill-[#f59e0b] text-[#f59e0b]" />
                      {Number(m.rating).toFixed(1)}
                      {m.reviewCount > 0 && (
                        <span className="text-[#c0c0c0]">({m.reviewCount})</span>
                      )}
                    </span>
                  )}
                  <span>
                    {m.serviceCount} service{m.serviceCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Price range */}
              <div className="text-right shrink-0">
                {m.minPrice != null ? (
                  <>
                    <div className="text-xs text-[#898989]">From</div>
                    <div className="text-lg font-bold text-[#e05c2a]">
                      €{m.minPrice.toFixed(0)}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-[#898989]">Request</div>
                )}
              </div>

              <ChevronRight
                size={18}
                aria-hidden="true"
                className="text-[#c0c0c0] group-hover:text-[#242424] transition-colors shrink-0"
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
