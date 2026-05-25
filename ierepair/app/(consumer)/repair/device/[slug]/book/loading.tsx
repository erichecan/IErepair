export default function Loading() {
  return (
    <div className="pb-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pt-6">
        <div className="h-5 w-32 bg-[#f0f0f0] rounded animate-pulse" />
        <div className="flex items-center gap-4 py-6 border-b border-[rgba(34,42,53,0.08)] mt-4">
          <div className="w-16 h-16 rounded-2xl bg-[#f0f0f0] animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 bg-[#f0f0f0] rounded animate-pulse" />
            <div className="h-6 w-3/4 bg-[#f0f0f0] rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-[#f0f0f0] rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-3 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl"
              style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px" }}>
              <div className="w-14 h-14 rounded-xl bg-[#f0f0f0] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-[#f0f0f0] rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-[#f0f0f0] rounded animate-pulse" />
              </div>
              <div className="w-16 h-8 bg-[#f0f0f0] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
