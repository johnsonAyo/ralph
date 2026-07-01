"use client";
import { useState } from "react";
import { Button, Input } from "@ralph/ui";
import { LABEL_TEXT, HINT_TEXT, CONTROL_CLASS, PANEL_CLASS } from "../../components/check-form/styles";


interface SmartFormSubmitData {
  registration: string;
  totalBudget: number;
  askingPrice?: number;
  listingUrl?: string;
}

interface SmartFormProps {
  onSubmit: (data: SmartFormSubmitData) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export function VerdictSmartForm({ onSubmit, isLoading, error }: SmartFormProps) {
  const [registration, setRegistration] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [listingUrl, setListingUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration || !totalBudget) return;
    
    onSubmit({
      registration: registration.replace(/\s+/g, "").toUpperCase(),
      totalBudget: Number(totalBudget.replace(/,/g, "")),
      askingPrice: askingPrice ? Number(askingPrice.replace(/,/g, "")) : undefined,
      listingUrl: listingUrl.trim() || undefined,
    });
  };

  const hasReg = registration.trim().length >= 2;
  const hasLink = /^https?:\/\//i.test(listingUrl.trim());
  const hasBudget = Number(totalBudget.replace(/,/g, "")) > 0;
  const isReady = (hasReg || hasLink) && hasBudget;

  return (
    <form className={PANEL_CLASS} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className={LABEL_TEXT}>Vehicle Registration (Optional)</span>
          <Input
            value={registration}
            onChange={(e) => setRegistration(e.target.value.toUpperCase())}
            placeholder="e.g. AB12 CDE"
            className={`${CONTROL_CLASS} text-center font-bold tracking-widest bg-[#fcd404] border-[#d8b707] uppercase text-black placeholder:text-black/40 focus-visible:border-black focus:border-black text-xl h-[52px]`}
            disabled={isLoading}
          />
          <span className={HINT_TEXT}>Provide the registration plate for a DVSA check, or leave blank if you only have a listing.</span>
        </label>

        <label className="flex flex-col gap-2">
          <span className={LABEL_TEXT}>Listing Link (Optional)</span>
          <Input
            value={listingUrl}
            onChange={(e) => setListingUrl(e.target.value)}
            placeholder="Paste the advert URL (AutoTrader, Copart…)"
            className={CONTROL_CLASS}
            disabled={isLoading}
          />
          <span className={HINT_TEXT}>Add the link if you have it. We&rsquo;ll scrape the asking price and photos to match against DVLA records.</span>
        </label>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={LABEL_TEXT}>Your Total Budget (£)</span>
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
            <span className={HINT_TEXT}>The maximum you can afford to spend, including initial repairs.</span>
          </label>

          <label className="flex flex-col gap-2">
            <span className={LABEL_TEXT}>Asking Price (£) (Optional)</span>
            <Input
              type="text"
              inputMode="numeric"
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              placeholder="e.g. 4,500"
              className={CONTROL_CLASS}
              disabled={isLoading}
            />
            <span className={HINT_TEXT}>Helps Ralph judge if this specific deal is fair.</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[0.92rem] font-medium text-red-800">
          {error}
        </div>
      )}

      <Button type="submit" disabled={!isReady || isLoading} className="w-full">
        {isLoading ? "Running DVSA MOT Check & Analysis..." : "Ask Ralph"}
      </Button>
    </form>
  );
}
