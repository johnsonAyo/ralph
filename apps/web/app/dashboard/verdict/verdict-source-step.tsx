"use client";
import { ArrowRight } from "lucide-react";
import { Button } from "@ralph/ui";
import type { VehicleSourceType } from "@ralph/shared";
import { SOURCE_META, SOURCE_ORDER } from "./verdict-source-meta";

interface SourceStepProps {
  selected?: VehicleSourceType;
  onSelect: (source: VehicleSourceType) => void;
}

export function SourceStep({ selected, onSelect }: SourceStepProps) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 items-center text-center mb-6">
        <h2 className="m-0 text-[1.5rem] sm:text-[1.8rem] font-[900] text-foreground">
          Where are you buying the car from?
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              className={`group flex items-start gap-5 rounded-[24px] border p-6 text-left transition ${active
                  ? "border-[var(--blue)] bg-[rgba(47,98,233,0.06)]"
                  : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--blue)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(47,98,233,0.35)]"
                }`}
            >
              <span
                className={`grid size-14 shrink-0 place-items-center rounded-2xl border transition ${active
                    ? "border-[var(--blue)] bg-[var(--blue)] text-white"
                    : "border-[var(--line)] bg-[#fbfaf6] text-[var(--blue)] group-hover:bg-[rgba(47,98,233,0.08)]"
                  }`}
              >
                <Icon className="size-6" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[1.1rem] font-[850] text-foreground">
                  {meta.label}
                </span>
                <span className="text-[0.9rem] font-semibold text-[var(--muted)]">{meta.blurb}</span>
                <span className="mt-0.5 text-[0.8rem] text-[#9a9286]">{meta.examples}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Registration step will appear progressively below */}
    </section>
  );
}
