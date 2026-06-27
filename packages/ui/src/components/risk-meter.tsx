import * as React from "react";
import { cn } from "../lib/cn";

export type RiskLevel = "low" | "caution" | "high";

const config: Record<
  RiskLevel,
  { label: string; bar: string; text: string; fill: number }
> = {
  low: { label: "Low risk", bar: "bg-success", text: "text-success", fill: 33 },
  caution: {
    label: "Worth a look",
    bar: "bg-warning",
    text: "text-warning",
    fill: 66,
  },
  high: {
    label: "High risk",
    bar: "bg-destructive",
    text: "text-destructive",
    fill: 100,
  },
};

interface RiskMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  level: RiskLevel;
  label?: string;
}

/** Three-segment risk indicator for a checked listing. */
const RiskMeter = React.forwardRef<HTMLDivElement, RiskMeterProps>(
  ({ level, label, className, ...props }, ref) => {
    const c = config[level];
    return (
      <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
        <div className="flex items-center justify-between">
          <span className={cn("text-sm font-semibold", c.text)}>
            {label ?? c.label}
          </span>
        </div>
        <div className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i < c.fill / 33.4 ? c.bar : "bg-muted",
              )}
            />
          ))}
        </div>
      </div>
    );
  },
);
RiskMeter.displayName = "RiskMeter";

export { RiskMeter };
