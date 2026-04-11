import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ChevronRight, Wrench } from "lucide-react";
import { getDevicesByCategory, CATEGORY_GROUPS, DeviceListItem } from "@/lib/db/queries/repair";

/* ── Category display config ─────────────────────────── */
const CATEGORY_META: Record<string, { label: string; description: string }> = {
  screen:       { label: "Screen Repair",        description: "OLED & LCD screen replacements with 180-day warranty" },
  battery:      { label: "Battery Replacement",  description: "OEM quality batteries, done in 30 minutes" },
  "back-glass": { label: "Back Glass Repair",    description: "Cracked back glass replacement, same-day service" },
  charging:     { label: "Charging Port Repair", description: "Fix charging issues and port replacements" },
};

/* ── Brand priority ordering ────────────────────────── */
const BRAND_ORDER = ["Apple", "Samsung", "Google", "OnePlus", "Oppo", "XiaoMi", "Gaming Repair", "Computer Repair"];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* ── Device card ────────────────────────────────────── */
function DeviceCard({ device }: { device: DeviceListItem }) {
  return (
    <Link
      href={`/repair/device/${device.deviceSlug}`}
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl hover:bg-[#f8f8f8] transition-colors group"
      style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.03) 0px 2px 8px" }}
    >
      {/* Device image */}
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

      {/* Info */}
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

/* ── Page ───────────────────────────────────────────── */
export const dynamic = "force-dynamic";

export default async function RepairListPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) notFound();

  const devices = await getDevicesByCategory(category);

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
        <ArrowLeft size={16} />
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
    </div>
  );
}
