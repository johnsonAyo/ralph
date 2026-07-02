"use client";
import { ArrowRight } from "lucide-react";
import type { VehicleSourceType } from "@ralph/shared";
import { SOURCE_META, SOURCE_ORDER } from "./verdict-source-meta";

interface SourceStepProps {
  selected?: VehicleSourceType;
  onSelect: (source: VehicleSourceType) => void;
}

export function SourceStep({ selected, onSelect }: SourceStepProps) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="m-0 text-[1.25rem] font-[900] text-foreground">
          Where are you buying the car from?
        </h2>
        <p className="m-0 text-[0.92rem] text-[var(--muted)]">
          This helps Ralph judge the price fairly. A fixed dealer price, a live auction bid and a
          private seller&rsquo;s asking price all get weighed differently.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SOURCE_ORDER.map((type) => {
          const meta = SOURCE_META[type];
          const Icon = meta.Icon;
          const active = selected === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              aria-pressed={active}
              className={`group flex items-start gap-3.5 rounded-[18px] border p-4 text-left transition ${active
                  ? "border-[var(--blue)] bg-[rgba(47,98,233,0.06)]"
                  : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--blue)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(47,98,233,0.35)]"
                }`}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl border transition ${active
                    ? "border-[var(--blue)] bg-[var(--blue)] text-white"
                    : "border-[var(--line)] bg-[#fbfaf6] text-[var(--blue)] group-hover:bg-[rgba(47,98,233,0.08)]"
                  }`}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-[0.98rem] font-[850] text-foreground">
                  {meta.label}
                  <ArrowRight
                    className="size-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden
                  />
                </span>
                <span className="text-[0.82rem] font-semibold text-[var(--muted)]">{meta.blurb}</span>
                <span className="mt-0.5 text-[0.75rem] text-[#9a9286]">{meta.examples}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
