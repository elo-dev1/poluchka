import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border-white/20',
        gold: 'border-amber-500/30 bg-amber-500/15 text-amber-300 font-bold',
        rank1: 'border-amber-500/50 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-black shadow-md shadow-amber-500/30',
        rank2: 'border-slate-400/50 bg-gradient-to-r from-slate-400 to-slate-600 text-white font-black',
        rank3: 'border-amber-800/50 bg-gradient-to-r from-amber-700 to-amber-900 text-white font-black',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
