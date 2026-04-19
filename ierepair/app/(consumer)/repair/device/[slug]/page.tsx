import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, ChevronRight, Wrench } from "lucide-react";
import { getDeviceBySlug, RepairServiceItem } from "@/lib/db/queries/repair";

/* ── Category grouping for display ─────────────────── */
type CategoryGroup = {
  label: string;
  slugFragments: string[];
  color: string;
};

const CATEGORY_GROUPS: CategoryGroup[] = [
  { label: "Screen Repair",        slugFragments: ["screen", "lcd"],     color: "#2258c8" },
  { label: "Battery Replacement",  slugFragments: ["battery"],           color: "#22a85c" },
  { label: "Back Glass",           slugFragments: ["back"],              color: "#d97706" },
  { label: "Charging Port",        slugFragments: ["charging"],          color: "#9333ea" },
  { label: "Camera",               slugFragments: ["camera"],            color: "#0891b2" },
  { label: "Other Repairs",        slugFragments: [],                    color: "#6b7280" },
];

function groupServices(services: RepairServiceItem[]) {
  const assigned = new Set<string>();
  const result: Array<{ group: CategoryGroup; items: RepairServiceItem[] }> = [];

  for (const group of CATEGORY_GROUPS) {
    if (group.slugFragments.length === 0) continue; // "Other" handled below
    const items = services.filter(
      (s) => !assigned.has(s.id) && group.slugFragments.some((f) => s.categorySlug.toLowerCase().includes(f))
    );
    if (items.length > 0) {
      items.forEach((s) => assigned.add(s.id));
      result.push({ group, items });
    }
  }

  // Remaining as "Other"
  const other = services.filter((s) => !assigned.has(s.id));
  if (other.length > 0) {
    result.push({ group: CATEGORY_GROUPS[CATEGORY_GROUPS.length - 1], items: other });
  }

  return result;
}

/* ── Service row ────────────────────────────────────── */
function ServiceRow({ service, accentColor }: { service: RepairServiceItem; accentColor: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[rgba(34,42,53,0.06)] last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm font-medium text-[#242424]">{service.name}</div>
        {service.estimatedMin && (
          <div className="flex items-center gap-1 text-xs text-[#898989] mt-1">
            <Clock size={11} />
            {service.estimatedMin} min
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        {service.basePrice != null ? (
          <div className="text-base font-bold" style={{ color: accentColor }}>
            €{service.basePrice.toFixed(0)}
          </div>
        ) : (
          <div className="text-xs text-[#898989]">Price on<br />request</div>
        )}
      </div>
    </div>
  );
}

/* ── Category section ───────────────────────────────── */
function CategorySection({ group, items }: { group: CategoryGroup; items: RepairServiceItem[] }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.03) 0px 2px 8px" }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: `2px solid ${group.color}20` }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: group.color }}
        />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: group.color }}>
          {group.label}
        </span>
      </div>

      {/* Services */}
      <div className="px-5">
        {items.map((s) => (
          <ServiceRow key={s.id} service={s} accentColor={group.color} />
        ))}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────── */
export default async function DevicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const device = await getDeviceBySlug(slug);

  if (!device) notFound();

  const grouped = groupServices(device.services);
  const hasAnyPrice = device.services.some((s) => s.basePrice != null);

  return (
    <div className="pb-10">
      {/* ── Device hero ──────────────────────────────── */}
      <div
        className="relative w-full"
        style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 45%, #0f3460 100%)" }}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pt-6 pb-8 relative">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          <div className="flex items-center gap-6">
            {/* Device image */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 relative overflow-hidden">
              {device.imageUrl ? (
                <Image
                  src={device.imageUrl}
                  alt={device.deviceModel}
                  fill
                  className="object-contain p-2"
                  sizes="128px"
                  unoptimized
                />
              ) : (
                <Wrench size={32} className="text-white/40" />
              )}
            </div>

            {/* Device info */}
            <div>
              <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
                {device.deviceBrand}
              </div>
              <h1
                className="text-xl md:text-2xl font-bold text-white leading-tight"
                style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}
              >
                {device.deviceModel}
              </h1>
              <div className="text-white/50 text-sm mt-2">
                {device.services.length} repair service{device.services.length !== 1 ? "s" : ""} available
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Services ─────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pt-6 space-y-4">
        {grouped.length === 0 ? (
          <div className="text-center py-16 text-[#898989] text-sm">
            No services available for this device.
          </div>
        ) : (
          grouped.map(({ group, items }) => (
            <CategorySection key={group.label} group={group} items={items} />
          ))
        )}

        {/* CTA */}
        <div
          className="bg-[#242424] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div>
            <div className="text-white font-semibold text-base">Ready to book your repair?</div>
            <div className="text-white/50 text-sm mt-1">Pay only 20% deposit to secure your slot</div>
          </div>
          <Link
            href={`/repair/device/${device.deviceSlug}/book`}
            className="px-6 py-3 bg-[#e05c2a] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
          >
            Book Repair
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
