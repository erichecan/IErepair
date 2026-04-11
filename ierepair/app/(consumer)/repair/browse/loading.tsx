export default function BrowseLoading() {
  return (
    <div className="pb-10">
      {/* Tabs skeleton */}
      <div className="sticky top-0 z-10 bg-white border-b border-[rgba(34,42,53,0.08)]">
        <div className="max-w-[1600px] mx-auto px-5 md:px-8">
          <div className="flex gap-0">
            {[1, 2].map((i) => (
              <div key={i} className="px-6 py-4 w-20 h-12 bg-[#f0f0f0] animate-pulse rounded m-1" />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-5 md:px-8 pt-6">
        {/* Brand pills skeleton */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-20 bg-[#f0f0f0] animate-pulse rounded-full" />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl"
              style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px" }}>
              <div className="w-20 h-20 rounded-xl bg-[#f0f0f0] animate-pulse" />
              <div className="h-3 w-16 bg-[#f0f0f0] animate-pulse rounded" />
              <div className="h-3 w-10 bg-[#f0f0f0] animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
