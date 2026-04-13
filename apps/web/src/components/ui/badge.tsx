import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-[hsl(var(--primary)_/_0.1)] text-[hsl(var(--primary))]',
        secondary: 'bg-[hsl(var(--secondary-container))] text-[hsl(var(--on-secondary-container))]',
        destructive: 'bg-[hsl(var(--destructive)_/_0.1)] text-[hsl(var(--destructive))]',
        outline: 'bg-transparent text-[hsl(var(--foreground))]',
        urgency: 'bg-[hsl(var(--destructive))] text-white',
        consultation: 'bg-blue-500/10 text-blue-600',
        surgery: 'bg-purple-500/10 text-purple-600',
        vaccination: 'bg-green-500/10 text-green-600',
        grooming: 'bg-amber-500/10 text-amber-600',
        success: 'bg-green-500/10 text-green-600',
        warning: 'bg-amber-500/10 text-amber-600',
        info: 'bg-blue-500/10 text-blue-600',
      },
      size: {
        default: 'px-3 py-1 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div 
      className={cn(badgeVariants({ variant, size }), className)} 
      {...props} 
    />
  );
}

export { Badge, badgeVariants };
