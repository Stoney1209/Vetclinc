import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonAppointmentCard() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl ghost-border bg-card animate-pulse">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="h-14 w-1.5 rounded-full" />
        <Skeleton variant="circular" className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="space-y-2 text-right">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}
