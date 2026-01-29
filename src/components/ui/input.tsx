import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex w-full rounded-md border border-white/15 bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
