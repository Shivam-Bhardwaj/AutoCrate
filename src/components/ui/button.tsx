import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  `btn focus-professional disabled:pointer-events-none disabled:opacity-50
   active:scale-95 hover:scale-[1.02] transition-all duration-fast`,
  {
    variants: {
      variant: {
        default: 'btn-primary',
        destructive: 'btn-destructive',
        outline: 'btn-secondary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'btn-success',
        warning: 'btn-warning',
      },
      size: {
        default: 'btn-md',
        sm: 'btn-sm',
        lg: 'btn-lg',
        icon: 'btn-icon',
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
