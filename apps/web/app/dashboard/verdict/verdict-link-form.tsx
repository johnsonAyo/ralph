"use client";
import { useState } from "react";
import { Button, Input } from "@ralph/ui";
import { ArrowLeft, PencilLine } from "lucide-react";
import type { VehicleSourceType } from "@ralph/shared";
import { SOURCE_META } from "./verdict-source-meta";
import { LABEL_TEXT, HINT_TEXT, CONTROL_CLASS, PANEL_CLASS } from "../../components/check-form/styles";

export interface LinkSubmitData {
  listingUrl?: string;
  totalBudget: number;
  askingPrice?: number;
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
  const meta = SOURCE_META[sourceType];
  const [listingUrl, setListingUrl] = useState(initialUrl ?? "");
  const [totalBudget, setTotalBudget] = useState("");
  const [askingPrice, setAskingPrice] = useState("");

  const hasLink = /^https?:\/\//i.test(listingUrl.trim());
  const budget = Number(totalBudget.replace(/,/g, ""));
  const hasBudget = budget > 0;
  // With a link we scrape it; with a reg but no link we can still analyse the
  // reg alone; with neither there's nothing to go on.
  const canSubmit = hasBudget && (hasLink || hasReg);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      listingUrl: hasLink ? listingUrl.trim() : undefined,
      totalBudget: budget,
      askingPrice: askingPrice ? Number(askingPrice.replace(/,/g, "")) : undefined,
    });
  };

  const buttonLabel = hasLink
    ? isLoading
      ? "Fetching the listing…"
      : "Fetch the listing"
    : isLoading
      ? "Asking Ralph…"
      : "Ask Ralph";

  return (
    <form className={PANEL_CLASS} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className={LABEL_TEXT}>Listing link {hasReg ? "(optional)" : ""}</span>
          <Input
            value={listingUrl}
            onChange={(e) => setListingUrl(e.target.value)}
            placeholder="Paste the advert URL"
            className={CONTROL_CLASS}
            disabled={isLoading}
          />
          <span className={HINT_TEXT}>
            We&rsquo;ll pull the price, photos and spec so you can check them before Ralph reads it.
          </span>
        </label>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

          <label className="flex flex-col gap-2">
            <span className={LABEL_TEXT}>{meta.priceLabel} (optional)</span>
            <Input
              type="text"
              inputMode="numeric"
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              placeholder="e.g. 4,500"
              className={CONTROL_CLASS}
              disabled={isLoading}
            />
            <span className={HINT_TEXT}>{meta.priceHint}</span>
          </label>
        </div>
      </div>

      {!hasLink && !hasReg && (
        <p className="rounded-xl border border-[var(--line)] bg-[#fbfaf6] p-3.5 text-[0.85rem] text-[var(--muted)]">
          Paste the advert link above, or enter the car&rsquo;s details manually.
        </p>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[0.92rem] font-medium text-red-800">
          {error}
        </div>
      )}

      <Button type="submit" disabled={!canSubmit || isLoading} className="w-full">
        {buttonLabel}
      </Button>

      <div className="flex flex-col gap-2.5 border-t border-[var(--line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[0.85rem] font-bold text-[var(--muted)] transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back
        </button>
        <button
          type="button"
          onClick={onSwitchToManual}
          className="inline-flex items-center gap-1.5 text-[0.85rem] font-bold text-[var(--blue)] transition hover:underline"
        >
          <PencilLine className="size-4" aria-hidden /> No link? Enter the details manually
        </button>
      </div>
    </form>
  );
}
