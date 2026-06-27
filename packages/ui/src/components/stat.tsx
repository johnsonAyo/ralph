import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Figure display for data-heavy surfaces (prices, mileage, scores).
 * Uses tabular monospace numerals so columns of numbers align.
 */
interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}

const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ label, value, hint, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props}>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </span>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  ),
);
Stat.displayName = "Stat";

export { Stat };
