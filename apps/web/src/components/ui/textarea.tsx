import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-xl bg-[hsl(var(--surface-lowest))] px-4 py-3 text-sm ring-offset-background ghost-border transition-all duration-200',
  {
    variants: {
      state: {
        default: 'placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 resize-y',
        error: 'border-destructive ring-1 ring-destructive/30 placeholder:text-destructive/60 focus-visible:outline-none focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/40 resize-y',
        success: 'border-green-500 ring-1 ring-green-500/30 focus-visible:outline-none focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/40 resize-y',
        none: 'placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 resize-none',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          textareaVariants({ state }),
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[hsl(var(--surface-low))]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
