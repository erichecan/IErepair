export default function DeviceLoading() {
  return (
    <div className="pb-10">
      {/* Hero skeleton */}
      <div className="relative w-full bg-[#1a1a2e]">
        <div className="max-w-[1600px] mx-auto px-5 md:px-8 pt-6 pb-8">
          <div className="h-5 w-12 bg-white/10 animate-pulse rounded mb-6" />
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-2xl bg-white/10 animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="h-3 w-16 bg-white/10 animate-pulse rounded" />
              <div className="h-7 w-48 bg-white/10 animate-pulse rounded" />
              <div className="h-4 w-32 bg-white/10 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Services skeleton */}
      <div className="max-w-[1600px] mx-auto px-5 md:px-8 pt-6 space-y-4">
        {[1, 2].map((group) => (
          <div key={group} className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px" }}>
            <div className="px-5 py-3 border-b border-[rgba(34,42,53,0.06)]">
              <div className="h-4 w-24 bg-[#f0f0f0] animate-pulse rounded" />
            </div>
            {[1, 2, 3].map((row) => (
              <div key={row} className="flex items-center justify-between px-5 py-4 border-b border-[rgba(34,42,53,0.06)] last:border-0">
                <div className="h-4 w-40 bg-[#f0f0f0] animate-pulse rounded" />
                <div className="h-4 w-16 bg-[#f0f0f0] animate-pulse rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
