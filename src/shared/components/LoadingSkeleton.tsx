export const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse" role="status" aria-label="Loading content">
    <div className="h-24 rounded-3xl bg-slate-200" />
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="h-40 rounded-3xl bg-slate-200" />
      <div className="h-40 rounded-3xl bg-slate-200" />
      <div className="h-40 rounded-3xl bg-slate-200" />
    </div>
    <div className="h-80 rounded-3xl bg-slate-200" />
  </div>
);
