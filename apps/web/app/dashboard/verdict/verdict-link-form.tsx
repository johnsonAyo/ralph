"use client";
import { useState } from "react";
import { Button, Input } from "@ralph/ui";
import { ArrowLeft, PencilLine, Loader2, Lock } from "lucide-react";
import { VehicleSourceType } from "@ralph/shared";
import { LABEL_TEXT, HINT_TEXT, CONTROL_CLASS, PANEL_CLASS } from "../../components/check-form/styles";

export interface LinkSubmitData {
  listingUrl?: string;
  totalBudget: number;
}

interface LinkFormProps {
  sourceType: VehicleSourceType;
  hasReg: boolean;
  initialUrl?: string;
  onSubmit: (data: LinkSubmitData) => void;
  onSwitchToManual: () => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string;
}

export function LinkForm({
  sourceType,
  hasReg,
  initialUrl,
  onSubmit,
  onSwitchToManual,
  onBack,
  isLoading,
  error,
}: LinkFormProps) {
  const [listingUrl, setListingUrl] = useState(initialUrl ?? "");
  const [totalBudget, setTotalBudget] = useState("");

  const hasLink = /^https?:\/\//i.test(listingUrl.trim());
  const isDealer = sourceType === VehicleSourceType.Dealership;
  const budget = Number(totalBudget.replace(/,/g, ""));
  const hasBudget = budget > 0;
  // With a link we scrape it; with a reg but no link we can still analyse the
  // reg alone; with neither there's nothing to go on.
  const canSubmit = (isDealer || hasBudget) && (hasLink || hasReg);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      listingUrl: hasLink ? listingUrl.trim() : undefined,
      totalBudget: budget,
    });
  };

  const buttonLabel = hasLink
    ? isLoading
      ? "Fetching the listing…"
      : "Fetch the listing"
    : isLoading
      ? "Getting car details…"
      : "Get car details";

  if (isLoading) {
    return (
      <div className={`${PANEL_CLASS} flex flex-col items-center justify-center min-h-[300px] text-center gap-4 py-12`}>
        <Loader2 className="size-10 animate-spin text-[var(--blue)]" />
        <h3 className="text-xl font-bold text-foreground">Fetching car details</h3>
        <p className="text-[0.95rem] text-[var(--muted)] max-w-[320px]">
          Please wait for a few minutes while we securely fetch the advert and extract the car details.
        </p>
      </div>
    );
  }

  return (
    <form className={PANEL_CLASS} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className={LABEL_TEXT}>Listing link {hasReg ? "(optional)" : ""}</span>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="size-4 text-[var(--muted)]" aria-hidden />
            </div>
            <Input
              value={listingUrl}
              onChange={(e) => setListingUrl(e.target.value)}
              placeholder="Premium feature"
              className={`${CONTROL_CLASS} pl-10 opacity-70`}
              disabled={true}
            />
          </div>
          <span className={`${HINT_TEXT} text-amber-600 font-medium`}>
            Automatic link scraping is a premium feature. Please use manual entry.
          </span>
        </label>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {sourceType !== VehicleSourceType.Dealership && (
            <label className="flex flex-col gap-2">
              <span className={LABEL_TEXT}>Your total budget (£)</span>
              <Input
                type="text"
                inputMode="numeric"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="e.g. 5,000"
                className={CONTROL_CLASS}
                disabled={isLoading}
                required
              />
              <span className={HINT_TEXT}>The most you can spend, including initial repairs.</span>
            </label>
          )}
        </div>
      </div>



      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[0.92rem] font-medium text-red-800">
          {error}
        </div>
      )}

      <Button type="submit" disabled={!canSubmit || isLoading} className="w-full h-[56px] text-[1.1rem] rounded-[20px]">
        {buttonLabel}
      </Button>

      <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-5 mt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-[44px] items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-transparent px-5 text-[0.95rem] font-bold text-[var(--muted)] transition-all hover:border-[var(--muted)] hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back
        </button>
        <button
          type="button"
          onClick={onSwitchToManual}
          className="inline-flex h-[44px] items-center justify-center gap-2 rounded-full bg-[rgba(47,98,233,0.08)] px-5 text-[0.95rem] font-bold text-[var(--blue)] transition-all hover:bg-[rgba(47,98,233,0.15)]"
        >
          <PencilLine className="size-4" aria-hidden /> No link? Enter the details manually
        </button>
      </div>
    </form>
  );
}
