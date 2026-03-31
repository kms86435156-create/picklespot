export default function ClubsLoading() {
  return (
    <div className="min-h-screen bg-dark pt-14">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-brand-cyan/5 to-transparent border-b border-ui-border">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-surface rounded-lg animate-pulse" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">피클볼 동호회</h1>
              <p className="text-sm text-text-muted">전국 피클볼 동호회를 찾아보세요</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter skeleton */}
        <div className="bg-surface border border-ui-border rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] h-10 bg-dark rounded animate-pulse" />
            <div className="w-24 h-10 bg-dark rounded animate-pulse" />
            <div className="w-24 h-10 bg-dark rounded animate-pulse" />
          </div>
        </div>
        {/* Card skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-ui-border rounded-lg p-5 animate-pulse">
              <div className="h-5 w-2/3 bg-white/5 rounded mb-3" />
              <div className="h-4 w-1/3 bg-white/5 rounded mb-4" />
              <div className="h-3 w-full bg-white/5 rounded mb-2" />
              <div className="h-3 w-4/5 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
