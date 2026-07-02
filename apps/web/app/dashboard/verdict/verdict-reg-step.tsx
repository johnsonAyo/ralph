"use client";
import { useState } from "react";
import { Button, Input } from "@ralph/ui";
import { ArrowRight, Check } from "lucide-react";
import type { VehicleSourceType } from "@ralph/shared";
import { SOURCE_META } from "./verdict-source-meta";
import { LABEL_TEXT, HINT_TEXT } from "../../components/check-form/styles";

interface RegStepProps {
  sourceType: VehicleSourceType;
  initialReg?: string;
  // reg is undefined when the buyer doesn't have one.
  onContinue: (reg?: string) => void;
}

type Choice = "yes" | "no" | null;

export function RegStep({ sourceType, initialReg, onContinue }: RegStepProps) {
  const [choice, setChoice] = useState<Choice>(initialReg ? "yes" : null);
  const [reg, setReg] = useState(initialReg ?? "");

  const cleanReg = reg.replace(/\s+/g, "").toUpperCase();
  const regReady = cleanReg.length >= 2;
  const meta = SOURCE_META[sourceType];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 items-center text-center mb-6">
        <h2 className="m-0 text-[1.5rem] sm:text-[1.8rem] font-[900] text-foreground">
          Do you have the car&rsquo;s registration number?
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
        {(["yes", "no"] as const).map((value) => {
          const active = choice === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setChoice(value)}
              aria-pressed={active}
              className={`flex items-center justify-center gap-3 rounded-[24px] border px-6 py-6 text-[1.1rem] font-[800] transition ${
                active
                  ? "border-[var(--blue)] bg-[rgba(47,98,233,0.08)] text-[var(--blue)]"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-foreground hover:border-[var(--blue)]"
              }`}
            >
              {active && <Check className="size-5" aria-hidden />}
              {value === "yes" ? "Yes, I have it" : "No, I don't"}
            </button>
          );
        })}
      </div>

      {choice === "yes" && (
        <label className="flex flex-col gap-3 text-center max-w-xl mx-auto w-full mt-6">
          <span className="text-[1.1rem] font-[800] text-foreground">Vehicle registration</span>
          <Input
            value={reg}
            onChange={(e) => setReg(e.target.value.toUpperCase())}
            placeholder="AB12 CDE"
            autoFocus
            className="h-[64px] rounded-[16px] border-[#d8b707] bg-[#fcd404] text-center text-3xl font-bold uppercase tracking-widest text-black placeholder:text-black/40 focus:border-black focus-visible:border-black"
          />
          <span className="text-[0.95rem] font-semibold text-[var(--muted)]">Ralph uses this to check the DVLA record and MOT history.</span>
        </label>
      )}

      <div className="flex flex-col gap-4 sm:flex-row max-w-xl mx-auto w-full mt-8">
        {choice === "no" ? (
          <Button type="button" onClick={() => onContinue(undefined)} className="sm:flex-1 h-[56px] text-[1.1rem] rounded-[20px]">
            Continue <ArrowRight className="size-5" aria-hidden />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => onContinue(cleanReg)}
            disabled={choice !== "yes" || !regReady}
            className="sm:flex-1 h-[56px] text-[1.1rem] rounded-[20px]"
          >
            Continue <ArrowRight className="size-5" aria-hidden />
          </Button>
        )}
      </div>
    </section>
  );
}
