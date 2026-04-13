import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text' | 'card' | 'table-row';
}

function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded h-4',
    card: 'rounded-2xl',
    'table-row': 'rounded-lg',
  };

  return (
    <div
      className={cn('skeleton', variantClasses[variant], className)}
      {...props}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl ghost-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="h-12 w-12" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl ghost-border bg-card">
          <Skeleton variant="circular" className="h-10 w-10" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function SkeletonClientCard() {
  return (
    <div className="rounded-2xl ghost-border bg-card p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="h-12 w-12" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="mt-4 pt-4 border-t border-border/50">
        <Skeleton className="h-5 w-24 mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SkeletonAppointmentCard() {
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

function SkeletonProductRow() {
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

function SkeletonStatsCard() {
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

function SkeletonDashboard() {
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

function SkeletonForm() {
  return (
    <div className="space-y-6 p-6 rounded-2xl ghost-border bg-card">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-11 w-full" />
    </div>
  );
}

function SkeletonListGrid({ items = 6 }: { items?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonClientCard key={i} />
      ))}
    </div>
  );
}

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonTable,
  SkeletonClientCard,
  SkeletonAppointmentCard,
  SkeletonProductRow,
  SkeletonStatsCard,
  SkeletonDashboard,
  SkeletonForm,
  SkeletonListGrid,
};