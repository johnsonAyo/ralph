import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Matches the product's base `input` styling (44px tall, 14px radius, warm
 * off-white fill, 750 weight). Surface-specific CSS in globals.css still
 * out-specifies these utilities, so swapping native inputs is transparent.
 */
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "min-h-[44px] w-full rounded-[14px] border border-input bg-[#fffdf9] px-3.5 text-[0.85rem] font-[750] text-foreground transition-colors",
      "placeholder:font-medium placeholder:text-muted-foreground/60",
      "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/25",
      "disabled:cursor-not-allowed disabled:opacity-55",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
