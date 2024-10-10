import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-primary-dark",
  {
    variants: {
      variant: {
        default:
          "bg-mirage-900 text-mirage-50 shadow hover:bg-mirage-900/90 dark:bg-mirage-200 dark:text-mirage-900 dark:hover:bg-mirage-200/90",
        destructive:
          "bg-red-500 text-mirage-50 shadow-sm hover:bg-red-500/90 dark:bg-red-900 dark:text-mirage-50 dark:hover:bg-red-900/90",
        outline:
          "border border-mirage-300 bg-transparent shadow-sm hover:bg-mirage-200 hover:text-mirage-900 dark:border-mirage-800 dark:bg-transparent dark:hover:bg-mirage-800 dark:hover:text-mirage-50",
        secondary:
          "bg-mirage-300/80 text-mirage-900 shadow-sm hover:bg-mirage-300/60 dark:bg-mirage-800 dark:text-mirage-50 dark:hover:bg-mirage-800/80",
        ghost:
          "hover:bg-mirage-200 hover:text-mirage-900 dark:hover:bg-mirage-800 dark:hover:text-mirage-50",
        link: "text-mirage-900 underline-offset-4 hover:underline dark:text-mirage-50",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
