import * as React from "react";
import { cn } from "../lib/cn";

/** Centered page width. One place to control the product's max line length. */
const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8", className)}
    {...props}
  />
));
Container.displayName = "Container";

export { Container };
