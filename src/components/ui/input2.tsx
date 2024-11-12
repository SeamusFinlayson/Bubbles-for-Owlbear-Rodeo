import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input2 = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[34px] w-full rounded-md border-0 border-transparent bg-transparent px-3 text-sm outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-mirage-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-mirage-400",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input2.displayName = "Input2";

export { Input2 };
