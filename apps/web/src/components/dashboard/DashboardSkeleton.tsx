import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonAppointmentCard } from '@/components/appointments/AppointmentSkeleton';
import { SkeletonClientCard } from '@/components/clients/ClientSkeleton';

export function SkeletonStatsCard() {
  return (
    <div className="rounded-2xl ghost-border bg-card p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="circular" className="h-12 w-12" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl ghost-border bg-card p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonAppointmentCard key={i} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl ghost-border bg-card p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonClientCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
