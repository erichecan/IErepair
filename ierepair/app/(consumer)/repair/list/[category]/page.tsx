import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ChevronRight, ChevronLeft, Wrench } from "lucide-react";
import { getDevicesByCategory, CATEGORY_GROUPS, DeviceListItem } from "@/lib/db/queries/repair";
import { PAGE_SIZE } from "@/lib/db/queries/repair-constants";

/* ── Category display config ─────────────────────────── */
const CATEGORY_META: Record<string, { label: string; description: string }> = {
  screen:       { label: "Screen Repair",        description: "OLED & LCD screen replacements with 180-day warranty" },
  battery:      { label: "Battery Replacement",  description: "OEM quality batteries, done in 30 minutes" },
  "back-glass": { label: "Back Glass Repair",    description: "Cracked back glass replacement, same-day service" },
  charging:     { label: "Charging Port Repair", description: "Fix charging issues and port replacements" },
};

/* ── Brand priority ordering ────────────────────────── */
const BRAND_ORDER = ["Apple", "Samsung", "Google", "OnePlus", "Oppo", "XiaoMi", "Gaming Repair", "Computer Repair"];

/* ── Device card ────────────────────────────────────── */
function DeviceCard({ device }: { device: DeviceListItem }) {
  return (
    <Link
      href={`/repair/device/${device.deviceSlug}`}
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl hover:bg-[#f8f8f8] transition-colors group"
      style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.03) 0px 2px 8px" }}
    >
      <div className="w-20 h-20 flex items-center justify-center relative overflow-hidden">
        {device.imageUrl ? (
          <Image
            src={device.imageUrl}
            alt={device.deviceModel}
            fill
            className="object-contain"
            sizes="80px"
            unoptimized
          />
        ) : (
          <Wrench size={28} className="text-[#898989]" />
        )}
      </div>
      <div className="text-xs font-semibold text-[#242424] text-center leading-tight line-clamp-2">{device.deviceModel}</div>
      {device.minPrice != null ? (
        <div className="text-xs text-[#e05c2a] font-medium">From €{device.minPrice.toFixed(0)}</div>
      ) : (
        <div className="text-xs text-[#898989]">Price on request</div>
      )}
    </Link>
  );
}

/* ── Brand section ──────────────────────────────────── */
function BrandSection({ brand, devices }: { brand: string; devices: DeviceListItem[] }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-[#898989] uppercase tracking-widest mb-3 px-1">{brand}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {devices.map((d) => (
          <DeviceCard key={d.deviceSlug} device={d} />
        ))}
      </div>
    </div>
  );
}

/* ── Pagination ─────────────────────────────────────── */
function Pagination({
  category,
  page,
  totalPages,
  total,
}: {
  category: string;
  page: number;
  totalPages: number;
  total: number;
}) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex items-center justify-between pt-6 mt-2 border-t border-[rgba(34,42,53,0.08)]">
      <span className="text-sm text-[#898989]">
        {start}–{end} of {total} devices
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={`/repair/list/${category}?page=${page - 1}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#242424] bg-white rounded-lg hover:bg-[#f8f8f8] transition-colors"
            style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px" }}
          >
            <ChevronLeft size={14} aria-hidden="true" />
            Prev
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#c0c0c0] bg-white rounded-lg cursor-not-allowed"
            style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px" }}>
            <ChevronLeft size={14} aria-hidden="true" />
            Prev
          </span>
        )}
        <span className="px-3 py-2 text-sm text-[#898989]">
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={`/repair/list/${category}?page=${page + 1}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#242424] bg-white rounded-lg hover:bg-[#f8f8f8] transition-colors"
            style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px" }}
          >
            Next
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#c0c0c0] bg-white rounded-lg cursor-not-allowed"
            style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px" }}>
            Next
            <ChevronRight size={14} aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────── */
export const dynamic = "force-dynamic";

export default async function RepairListPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ category }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const meta = CATEGORY_META[category];
  if (!meta) notFound();

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { items: devices, total, totalPages } = await getDevicesByCategory(category, page);

  // Group by brand
  const byBrand: Record<string, DeviceListItem[]> = {};
  for (const d of devices) {
    const brand = d.deviceBrand || "Other";
    if (!byBrand[brand]) byBrand[brand] = [];
    byBrand[brand].push(d);
  }

  // Sort brands by priority
  const sortedBrands = Object.keys(byBrand).sort((a, b) => {
    const ia = BRAND_ORDER.indexOf(a);
    const ib = BRAND_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <div className="px-5 md:px-8 pt-6 pb-10 max-w-[1600px] mx-auto">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#898989] hover:text-[#242424] transition-colors mb-6">
        <ArrowLeft size={16} aria-hidden="true" />
        Back
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl md:text-3xl font-bold text-[#242424] mb-1"
          style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}
        >
          {meta.label}
        </h1>
        <p className="text-sm text-[#898989]">{meta.description}</p>
      </div>

      {/* Device list grouped by brand */}
      {sortedBrands.length === 0 ? (
        <div className="text-center py-16 text-[#898989] text-sm">
          No devices found for this category.
        </div>
      ) : (
        <div className="space-y-8">
          {sortedBrands.map((brand) => (
            <BrandSection key={brand} brand={brand} devices={byBrand[brand]} />
          ))}
        </div>
      )}

      <Pagination category={category} page={page} totalPages={totalPages} total={total} />
    </div>
  );
}
