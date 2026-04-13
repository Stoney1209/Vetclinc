import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex h-11 w-full rounded-xl bg-[hsl(var(--surface-lowest))] px-4 py-2 text-sm ring-offset-background transition-all duration-200 ghost-border',
  {
    variants: {
      state: {
        default: 'placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:shadow-lg focus-visible:shadow-primary/10',
        error: 'border-destructive ring-1 ring-destructive/30 placeholder:text-destructive/60 focus-visible:outline-none focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/40 focus-visible:shadow-lg focus-visible:shadow-destructive/10',
        success: 'border-green-500 ring-1 ring-green-500/30 focus-visible:outline-none focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/40',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, state, ...props }, ref) => {
    return (
      <input
        className={cn(
          inputVariants({ state }),
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[hsl(var(--surface-low))]',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
