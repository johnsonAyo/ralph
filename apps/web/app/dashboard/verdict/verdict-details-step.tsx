"use client";
import { useState } from "react";
import { Link2, PencilLine } from "lucide-react";
import { VehicleSourceType } from "@ralph/shared";
import { SOURCE_META } from "./verdict-source-meta";
import { LinkForm, type LinkSubmitData } from "./verdict-link-form";
import { ManualForm, type ManualDraft } from "./verdict-manual-form";

type Mode = "link" | "manual";

interface DetailsStepProps {
  sourceType: VehicleSourceType;
  hasReg: boolean;
  initialUrl?: string;
  manualInitial?: ManualDraft;
  isLoading: boolean;
  error?: string;
  onSubmitLink: (data: LinkSubmitData) => void;
  onReviewManual: (draft: ManualDraft) => void;
  onBack: () => void;
}

export function DetailsStep({
  sourceType,
  hasReg,
  initialUrl,
  manualInitial,
  isLoading,
  error,
  onSubmitLink,
  onReviewManual,
  onBack,
}: DetailsStepProps) {
  const meta = SOURCE_META[sourceType];
  const offMarket = sourceType === VehicleSourceType.OffMarket;
  const [mode, setMode] = useState<Mode>(offMarket ? "manual" : "link");
  const effectiveMode: Mode = offMarket ? "manual" : mode;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="text-[0.72rem] font-[900] uppercase tracking-[0.08em] text-[var(--blue)]">
          {meta.label}
        </span>
        <h2 className="m-0 text-[1.25rem] font-[900] text-foreground">
          {offMarket ? "Tell Ralph about the car" : "Add the car's details"}
        </h2>
        <p className="m-0 text-[0.92rem] text-[var(--muted)]">
          {offMarket
            ? "No listing to pull from, so fill in what you know. Photos help Ralph spot damage."
            : "Paste the advert and we'll pull it in, or type the details yourself."}
        </p>
      </div>

      {!offMarket && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-[12px] border px-3.5 py-2.5 text-[0.88rem] font-[800] transition ${
              effectiveMode === "link"
                ? "border-[var(--blue)] bg-[rgba(47,98,233,0.08)] text-[var(--blue)]"
                : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-foreground"
            }`}
          >
            <Link2 className="size-4" aria-hidden /> Paste a link
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-[12px] border px-3.5 py-2.5 text-[0.88rem] font-[800] transition ${
              effectiveMode === "manual"
                ? "border-[var(--blue)] bg-[rgba(47,98,233,0.08)] text-[var(--blue)]"
                : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-foreground"
            }`}
          >
            <PencilLine className="size-4" aria-hidden /> Enter manually
          </button>
        </div>
      )}

      {effectiveMode === "link" ? (
        <LinkForm
          sourceType={sourceType}
          hasReg={hasReg}
          initialUrl={initialUrl}
          onSubmit={onSubmitLink}
          onSwitchToManual={() => setMode("manual")}
          onBack={onBack}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <ManualForm
          initial={manualInitial}
          onReview={onReviewManual}
          isLoading={isLoading}
          error={error}
          priceLabel={meta.priceLabel}
          onBack={onBack}
        />
      )}
    </section>
  );
}
