import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBrandsWithCounts, getDevicesByBrand } from "@/lib/db/queries/repair";
import BrowseClient from "./BrowseClient";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; brand?: string; page?: string }>;
}) {
  const { type, brand, page: pageParam } = await searchParams;
  const deviceType = type === "tablet" ? "tablet" : "phone";
  const selectedBrand = brand ?? null;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [brands, result] = await Promise.all([
    getBrandsWithCounts(deviceType),
    selectedBrand ? getDevicesByBrand(selectedBrand, deviceType, page) : Promise.resolve(null),
  ]);

  return (
    <div>
      {/* ── Header ───────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-5 md:px-8 pt-6 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#898989] hover:text-[#242424] transition-colors mb-4"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </Link>
        <h1
          className="text-2xl md:text-3xl font-bold text-[#242424]"
          style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}
        >
          Browse Repairs
        </h1>
        <p className="text-sm text-[#898989] mt-1">
          Select your device brand and model to see all available repairs
        </p>
      </div>

      {/* ── Client filter UI ─────────────────────────────── */}
      <Suspense fallback={<div className="max-w-[1600px] mx-auto px-5 md:px-8 pt-6 text-sm text-[#898989]">Loading...</div>}>
        <BrowseClient
          deviceType={deviceType}
          brands={brands}
          selectedBrand={selectedBrand}
          devices={result?.items ?? []}
          page={page}
          totalPages={result?.totalPages ?? 1}
          total={result?.total ?? 0}
        />
      </Suspense>
    </div>
  );
}
