"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Wrench, ChevronRight } from "lucide-react";
import Link from "next/link";
import { BrandWithCount, DeviceBrowseItem } from "@/lib/db/queries/repair";

type Props = {
  deviceType: string;
  brands: BrandWithCount[];
  selectedBrand: string | null;
  devices: DeviceBrowseItem[];
};

const DEVICE_TYPES = [
  { value: "phone",  label: "Phone" },
  { value: "tablet", label: "Tablet" },
];

export default function BrowseClient({ deviceType, brands, selectedBrand, devices }: Props) {
  const router = useRouter();

  function setType(type: string) {
    router.push(`/repair/browse?type=${type}`);
  }

  function setBrand(brand: string) {
    router.push(`/repair/browse?type=${deviceType}&brand=${encodeURIComponent(brand)}`);
  }

  return (
    <div className="pb-10">
      {/* ── Device Type Tabs ────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white border-b border-[rgba(34,42,53,0.08)]">
        <div className="max-w-2xl mx-auto px-5 md:px-8">
          <div className="flex gap-0">
            {DEVICE_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  deviceType === t.value
                    ? "border-[#242424] text-[#242424]"
                    : "border-transparent text-[#898989] hover:text-[#242424]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-6">
        {/* ── Brand Pills ──────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => {
              const params = new URLSearchParams();
              params.set("type", deviceType);
              router.push(`/repair/browse?${params.toString()}`);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !selectedBrand
                ? "bg-[#242424] text-white border-[#242424]"
                : "bg-white text-[#242424] border-[rgba(34,42,53,0.16)] hover:border-[#242424]"
            }`}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b.brand}
              onClick={() => setBrand(b.brand)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                selectedBrand === b.brand
                  ? "bg-[#242424] text-white border-[#242424]"
                  : "bg-white text-[#242424] border-[rgba(34,42,53,0.16)] hover:border-[#242424]"
              }`}
            >
              {b.brand}
              <span className="ml-1.5 text-xs opacity-60">{b.count}</span>
            </button>
          ))}
        </div>

        {/* ── Model Grid ───────────────────────────────────── */}
        {devices.length === 0 ? (
          <div className="text-center py-16 text-[#898989] text-sm">
            {selectedBrand
              ? `No devices found for ${selectedBrand}.`
              : "Select a brand to see devices."}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {devices.map((device) => (
              <Link
                key={device.deviceSlug}
                href={`/repair/device/${device.deviceSlug}`}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl hover:bg-[#f8f8f8] transition-colors group"
                style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.03) 0px 2px 8px" }}
              >
                {/* Device image */}
                <div className="w-16 h-16 rounded-xl bg-[#f5f5f5] flex items-center justify-center relative overflow-hidden">
                  {device.imageUrl ? (
                    <Image
                      src={device.imageUrl}
                      alt={device.deviceModel}
                      fill
                      className="object-contain p-1.5"
                      sizes="64px"
                      unoptimized
                    />
                  ) : (
                    <Wrench size={24} className="text-[#898989]" aria-hidden="true" />
                  )}
                </div>

                {/* Model name */}
                <div className="text-xs font-semibold text-[#242424] text-center leading-tight line-clamp-2">
                  {device.deviceModel}
                </div>

                {/* Price */}
                {device.minPrice != null ? (
                  <div className="text-xs text-[#e05c2a] font-medium">
                    From &euro;{device.minPrice.toFixed(0)}
                  </div>
                ) : (
                  <div className="text-xs text-[#898989]">On request</div>
                )}

                <ChevronRight size={14} className="text-[#c0c0c0] group-hover:text-[#242424] transition-colors mt-auto" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
