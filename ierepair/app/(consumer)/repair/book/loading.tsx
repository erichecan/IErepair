export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-[48px] z-20 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="px-5 pt-5 pb-4 max-w-2xl mx-auto">
          <div className="h-5 w-40 bg-[#f0f0f0] rounded animate-pulse mb-5" />
          <div className="h-6 bg-[#f0f0f0] rounded animate-pulse" />
        </div>
      </div>
      <div className="px-5 pt-8 pb-16 max-w-2xl mx-auto space-y-4">
        <div className="h-4 w-24 bg-[#f0f0f0] rounded animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-20 bg-[#f0f0f0] rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
