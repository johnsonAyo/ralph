import * as React from "react";
import { cn } from "../lib/cn";

/** Low-key loading placeholder. Pulses on the muted surface, no shimmer noise. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
