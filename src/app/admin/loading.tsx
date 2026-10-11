export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-fade-in transition-opacity">
      {/* Title & subtitle skeleton with subtle spinner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-56 rounded-xl bg-gradient-to-r from-pink-500/20 via-purple-500/15 to-indigo-500/20 animate-pulse border border-white/5" />
          <div className="h-4 w-40 rounded-md bg-white/5 animate-pulse" />
        </div>

        {/* Live Loading Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/25 text-pink-300 text-xs font-medium self-start sm:self-auto shadow-[0_0_15px_rgba(236,72,153,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500 shadow-[0_0_6px_#ec4899]"></span>
          </span>
          <span>Loading data...</span>
        </div>
      </div>

      {/* Metric Cards Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md relative overflow-hidden"
          >
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
            <div className="h-3.5 w-28 rounded bg-white/10 mb-3 animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-white/15 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Card Skeleton */}
      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md p-6 space-y-5 relative overflow-hidden">
        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="h-5 w-48 rounded bg-white/15 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-9 w-40 rounded-lg bg-white/5 border border-white/10 animate-pulse" />
            <div className="h-9 w-24 rounded-lg bg-white/5 border border-white/10 animate-pulse" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5"
            >
              <div className="flex items-center gap-3 w-1/3">
                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse shrink-0" />
                <div className="space-y-1.5 w-full">
                  <div className="h-3.5 w-28 rounded bg-white/15 animate-pulse" />
                  <div className="h-2.5 w-20 rounded bg-white/5 animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-24 rounded bg-white/10 animate-pulse hidden sm:block" />
              <div className="h-6 w-20 rounded-full bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
