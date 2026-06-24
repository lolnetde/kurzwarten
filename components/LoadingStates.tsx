type SkeletonBlockProps = {
  className?: string;
};

export function ButtonSpinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-md bg-slate-200 ${className}`}
    />
  );
}

export function PanelSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="mt-4 h-10 w-3/4" />
      <SkeletonBlock className="mt-4 h-5 w-full" />
      <SkeletonBlock className="mt-2 h-5 w-5/6" />
      <SkeletonBlock className="mt-7 h-14 w-full" />
      <SkeletonBlock className="mt-5 h-14 w-full" />
    </div>
  );
}

export function TicketListSkeleton() {
  return (
    <div className="divide-y divide-slate-200" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <div key={item} className="px-5 py-4">
          <div className="grid gap-3 lg:grid-cols-[10.5rem_minmax(0,1fr)_24rem] lg:items-center">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-8 w-8" />
              <SkeletonBlock className="h-8 w-32 rounded-full" />
            </div>
            <div>
              <SkeletonBlock className="h-6 w-32" />
              <SkeletonBlock className="mt-2 h-5 w-48" />
              <SkeletonBlock className="mt-2 h-5 w-40" />
            </div>
            <div className="flex justify-start gap-2 lg:justify-end">
              <SkeletonBlock className="h-10 w-40" />
              <SkeletonBlock className="h-10 w-28" />
              <SkeletonBlock className="h-10 w-10" />
              <SkeletonBlock className="h-10 w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="divide-y divide-slate-200" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <div key={item} className="grid gap-4 px-5 py-4 md:grid-cols-5">
          <SkeletonBlock className="h-5 w-24" />
          <SkeletonBlock className="h-5 w-16" />
          <SkeletonBlock className="h-5 w-16" />
          <SkeletonBlock className="h-5 w-16" />
          <SkeletonBlock className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
