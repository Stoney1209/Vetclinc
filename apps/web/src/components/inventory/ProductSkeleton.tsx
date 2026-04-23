import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonProductRow() {
  return (
    <div className="grid grid-cols-12 items-center gap-4 p-4 rounded-xl ghost-border bg-card animate-pulse">
      <div className="col-span-1">
        <Skeleton variant="circular" className="h-10 w-10" />
      </div>
      <div className="col-span-4 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="col-span-2">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="col-span-2">
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="col-span-2">
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="col-span-1 flex justify-end gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonProductTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonProductRow key={i} />
      ))}
    </div>
  );
}
