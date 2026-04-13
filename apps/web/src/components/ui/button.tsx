import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'cta-gradient text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/25 active:scale-[0.98]',
        outline: 'ghost-border bg-background hover:bg-muted hover:border-primary/50 active:scale-[0.98]',
        secondary: 'bg-[hsl(var(--surface-high))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-highest))] active:scale-[0.98]',
        ghost: 'hover:bg-[hsl(var(--surface-high))] hover:text-foreground active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline',
        premium: 'cta-gradient text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg active:scale-[0.98]',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 px-4 py-2 rounded-lg',
        lg: 'h-12 px-8 py-3 rounded-xl text-base',
        icon: 'h-11 w-11 rounded-xl',
        'icon-sm': 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild: _asChild, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
