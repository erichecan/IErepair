export default function ListLoading() {
  return (
    <div className="px-5 md:px-8 pt-6 pb-10 max-w-[1600px] mx-auto">
      {/* Back skeleton */}
      <div className="h-5 w-12 bg-[#f0f0f0] animate-pulse rounded mb-6" />

      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-[#f0f0f0] animate-pulse rounded mb-2" />
        <div className="h-4 w-72 bg-[#f0f0f0] animate-pulse rounded" />
      </div>

      {/* Devices grid skeleton */}
      <div className="space-y-8">
        {[1, 2].map((brand) => (
          <div key={brand}>
            <div className="h-3 w-16 bg-[#f0f0f0] animate-pulse rounded mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl"
                  style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px" }}>
                  <div className="w-20 h-20 bg-[#f0f0f0] animate-pulse rounded-xl" />
                  <div className="h-3 w-16 bg-[#f0f0f0] animate-pulse rounded" />
                  <div className="h-3 w-10 bg-[#f0f0f0] animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
