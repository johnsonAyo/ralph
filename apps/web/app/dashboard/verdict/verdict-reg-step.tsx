"use client";
import { useState } from "react";
import { Button, Input } from "@ralph/ui";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { VehicleSourceType } from "@ralph/shared";
import { SOURCE_META } from "./verdict-source-meta";
import { LABEL_TEXT, HINT_TEXT } from "../../components/check-form/styles";

interface RegStepProps {
  sourceType: VehicleSourceType;
  initialReg?: string;
  onBack: () => void;
  // reg is undefined when the buyer doesn't have one.
  onContinue: (reg?: string) => void;
}

type Choice = "yes" | "no" | null;

export function RegStep({ sourceType, initialReg, onBack, onContinue }: RegStepProps) {
  const [choice, setChoice] = useState<Choice>(initialReg ? "yes" : null);
  const [reg, setReg] = useState(initialReg ?? "");

  const cleanReg = reg.replace(/\s+/g, "").toUpperCase();
  const regReady = cleanReg.length >= 2;
  const meta = SOURCE_META[sourceType];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="text-[0.72rem] font-[900] uppercase tracking-[0.08em] text-[var(--blue)]">
          {meta.label}
        </span>
        <h2 className="m-0 text-[1.25rem] font-[900] text-foreground">
          Do you have the car&rsquo;s registration number?
        </h2>
        <p className="m-0 text-[0.92rem] text-[var(--muted)]">
          If you do, Ralph pulls the car&rsquo;s DVLA record and full MOT history for free. No plate?
          No problem — you can still get a read from the listing or the details.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["yes", "no"] as const).map((value) => {
          const active = choice === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setChoice(value)}
              aria-pressed={active}
              className={`flex items-center justify-center gap-2 rounded-[14px] border px-4 py-3.5 text-[0.95rem] font-[800] transition ${
                active
                  ? "border-[var(--blue)] bg-[rgba(47,98,233,0.08)] text-[var(--blue)]"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-foreground"
              }`}
            >
              {active && <Check className="size-4" aria-hidden />}
              {value === "yes" ? "Yes, I have it" : "No, I don't"}
            </button>
          );
        })}
      </div>

      {choice === "yes" && (
        <label className="flex flex-col gap-2">
          <span className={LABEL_TEXT}>Vehicle registration</span>
          <Input
            value={reg}
            onChange={(e) => setReg(e.target.value.toUpperCase())}
            placeholder="AB12 CDE"
            autoFocus
            className="h-[52px] rounded-[12px] border-[#d8b707] bg-[#fcd404] text-center text-xl font-bold uppercase tracking-widest text-black placeholder:text-black/40 focus:border-black focus-visible:border-black"
          />
          <span className={HINT_TEXT}>We run a DVSA MOT + DVLA check on this plate.</span>
        </label>
      )}

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button type="button" variant="secondary" onClick={onBack} className="sm:w-auto">
          <ArrowLeft className="size-4" aria-hidden /> Back
        </Button>
        {choice === "no" ? (
          <Button type="button" onClick={() => onContinue(undefined)} className="sm:flex-1">
            Continue <ArrowRight className="size-4" aria-hidden />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => onContinue(cleanReg)}
            disabled={choice !== "yes" || !regReady}
            className="sm:flex-1"
          >
            Continue <ArrowRight className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </section>
  );
}
