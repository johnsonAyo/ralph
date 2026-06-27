import * as React from "react";
import { cn } from "../lib/cn";

/** Matches the product's base input fill/border, sized for multi-line entry. */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[96px] w-full rounded-[14px] border border-input bg-[#fffdf9] px-3.5 py-2.5 text-[0.85rem] font-[750] text-foreground transition-colors",
      "placeholder:font-medium placeholder:text-muted-foreground/60",
      "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/25",
      "disabled:cursor-not-allowed disabled:opacity-55",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
