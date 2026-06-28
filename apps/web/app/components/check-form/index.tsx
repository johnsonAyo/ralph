"use client";

import { useReportForm } from "../../lib/use-report-form";
import { landingLabels } from "../../labels";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCredits } from "../../lib/use-credits";
import { useSession, getSupabaseBrowserClient } from "../../lib/supabase";
import Link from "next/link";
import { API_BASE_URL } from "../../constants";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ralph/ui";
import ConfirmListing from "./confirm-listing";
import ManualEntry from "./manual-entry";
import { CONTROL_CLASS, HINT_TEXT, LABEL_TEXT, PANEL_CLASS } from "./styles";

interface CheckFormProps {
  hideIntro?: boolean;
  variant?: 'default' | 'dashboard';
}

const RISK_OPTIONS = [
  {
    value: "cautious",
    option: landingLabels.form.riskOptions.cautious,
    checked: "has-[:checked]:border-green-500 has-[:checked]:bg-green-50",
  },
  {
    value: "balanced",
    option: landingLabels.form.riskOptions.balanced,
    checked: "has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50",
  },
  {
    value: "flexible",
    option: landingLabels.form.riskOptions.flexible,
    checked: "has-[:checked]:border-red-500 has-[:checked]:bg-red-50",
  },
] as const;

export default function CheckForm({ hideIntro = false, variant = 'default' }: CheckFormProps) {
  const router = useRouter();
  const [simpleUrl, setSimpleUrl] = useState("");
  const [listingSource, setListingSource] = useState("auction");
  const [entryMode, setEntryMode] = useState<'link' | 'manual'>('link');

  const {
    listingUrl,
    setListingUrl,
    budgetMin,
    setBudgetMin,
    budgetMax,
    setBudgetMax,
    postcode,
    setPostcode,
    riskTolerance,
    setRiskTolerance,
    formError,
    isSubmitting,
    isReady,
    submit,
  } = useReportForm();


  const [stage, setStage] = useState<'form' | 'scraping' | 'confirm'>('form');
  const [extractedListing, setExtractedListing] = useState<any | null>(null);
  const [scrapingError, setScrapingError] = useState("");

  const handleStartCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setScrapingError("");
    setStage('scraping');
    try {
      const supabase = getSupabaseBrowserClient();
      const accessToken = supabase
        ? (await supabase.auth.getSession()).data.session?.access_token
        : null;

      const response = await fetch(`${API_BASE_URL}/reports/preview-listing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ listingUrl: listingUrl.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to load listing information. Check that the link is correct.");
      }

      const listingData = await response.json();
      setExtractedListing(listingData);
      setStage('confirm');
    } catch (err) {
      setScrapingError(err instanceof Error ? err.message : "Scraping failed.");
      setStage('form');
    }
  };

  const handleWrongListing = () => {
    setStage('form');
    setExtractedListing(null);
  };

  const { data: user } = useSession();
  const { data: creditInfo, isLoading: loadingCredits } = useCredits(user?.id);
  const credits = creditInfo?.balance ?? 0;
  const hasInsufficientCredits = !!user && !loadingCredits && credits <= 0;

  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ url: simpleUrl.trim() });
    router.push(`/dashboard/new?${params.toString()}`);
  };

  if (variant === 'default') {
    const simpleReady = simpleUrl.trim().length > 0;
    return (
      <form className="check-panel" onSubmit={handleSimpleSubmit} id="check-form">
        {!hideIntro && (
          <div className="form-intro" style={{ textAlign: 'center' }}>
            <strong>{landingLabels.form.introTitle}</strong>
            <p>{landingLabels.form.introCopy}</p>
          </div>
        )}
        <label>
          {landingLabels.form.listingUrlLabel}
          <Input
            id="listingUrl"
            type="url"
            value={simpleUrl}
            onChange={(e) => setSimpleUrl(e.target.value)}
            placeholder="https://www.copart.co.uk/lot/..."
            required
            style={{ textAlign: 'center' }}
          />
          <span style={{ textAlign: 'center' }}>{landingLabels.form.listingUrlHint}</span>
        </label>
        <Button type="submit" disabled={!simpleReady}>
          Ask Ralph About This Car
        </Button>
      </form>
    );
  }

  if (isSubmitting || stage === 'scraping') {
    const isAnalysis = isSubmitting;
    return (
      <div className={`${PANEL_CLASS} min-h-[350px] items-center justify-center text-center`}>
        <div className="spinner" style={{ width: "50px", height: "50px", border: "4px solid rgba(0, 0, 0, 0.1)", borderTop: "4px solid var(--blue, #2f62e9)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "1.5rem" }} />
        <h2 className="mb-2 text-xl font-extrabold text-[var(--ink)]">
          {isAnalysis ? "Running AI Analysis…" : "Retrieving car information…"}
        </h2>
        <p className="max-w-[340px] text-[0.95rem] leading-relaxed text-[var(--muted)]">
          {isAnalysis
            ? "Creating report and debiting credit. Analysing the vehicle history, damage, and bid strategy."
            : "Ralph is analysing the link and extracting listing details."}
        </p>
      </div>
    );
  }

  if (stage === 'confirm') {
    return (
      <div className="rounded-[24px] border border-[#e6ded0] bg-white p-5 shadow-[0_22px_60px_rgba(60,45,26,0.12)] sm:p-7">
        <ConfirmListing
          listing={extractedListing}
          submitting={isSubmitting}
          error={formError}
          onBack={handleWrongListing}
          onConfirm={(event, edited) => submit(event, edited)}
        />
      </div>
    );
  }

  const manualParamsReady =
    budgetMin.trim() !== "" && budgetMax.trim() !== "" && postcode.trim().length >= 3;

  const tabClass = (mode: 'link' | 'manual') =>
    `flex-1 rounded-xl px-3 py-2.5 text-[0.8rem] font-extrabold tracking-tight transition-all duration-200 sm:text-[0.85rem] ${
      entryMode === mode
        ? "bg-[var(--blue)] text-white shadow-[0_6px_16px_rgba(47,98,233,0.28)]"
        : "text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]"
    }`;

  const sharedParams = (
    <>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className={LABEL_TEXT}>{landingLabels.form.budgetLabel}</span>
          {(budgetMin || budgetMax) && (
            <span className="text-[0.88rem] font-extrabold text-[var(--blue)]">
              £{budgetMin || "0"} – £{budgetMax || "0"}
            </span>
          )}
        </div>
        <div className="flex items-end gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-[0.8rem] font-bold text-[var(--muted)]">Minimum</span>
            <Input
              id="budgetMin" type="text" inputMode="numeric"
              value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)}
              placeholder="3,000" aria-label="Minimum budget"
              className={CONTROL_CLASS}
            />
          </div>
          <span className="shrink-0 pb-3 text-lg font-bold text-[#c4bdb4]" aria-hidden="true">–</span>
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-[0.8rem] font-bold text-[var(--muted)]">Maximum</span>
            <Input
              id="budgetMax" type="text" inputMode="numeric"
              value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="6,000" aria-label="Maximum budget"
              className={CONTROL_CLASS}
            />
          </div>
        </div>
        <span className={HINT_TEXT}>{landingLabels.form.budgetHint}</span>
      </div>

      <label className="flex flex-col gap-2">
        <span className={LABEL_TEXT}>{landingLabels.form.postcodeLabel}</span>
        <Input
          id="postcode"
          value={postcode} onChange={(e) => setPostcode(e.target.value)}
          placeholder="e.g. M12 4AB"
          className={CONTROL_CLASS}
        />
        <span className={HINT_TEXT}>{landingLabels.form.postcodeHint}</span>
      </label>

      <div className="flex flex-col gap-3">
        <span className={LABEL_TEXT}>{landingLabels.form.riskLabel}</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {RISK_OPTIONS.map(({ value, option, checked }) => (
            <label
              key={value}
              className={`relative flex cursor-pointer select-none flex-col gap-1 rounded-2xl border-2 border-[var(--line)] bg-[#fffdf9] p-3.5 transition duration-200 hover:-translate-y-0.5 hover:bg-white has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--blue)] ${checked}`}
            >
              <input
                type="radio" name="riskTolerance" value={value} className="sr-only"
                checked={riskTolerance === value}
                onChange={() => setRiskTolerance(value)}
              />
              <span className="text-[0.85rem] font-extrabold text-[var(--ink)]">{option.title}</span>
              <span className="text-xs font-medium leading-snug text-[var(--muted)]">{option.desc}</span>
            </label>
          ))}
        </div>
        <span className={HINT_TEXT}>{landingLabels.form.riskHint}</span>
      </div>
    </>
  );

  const creditWarning = hasInsufficientCredits ? (
    <p className="form-error" style={{ marginBottom: "0.25rem", textAlign: "center" }}>
      You have 0 credits remaining. Please{" "}
      <Link href="/#pricing" style={{ textDecoration: "underline", fontWeight: 600 }}>
        buy credits
      </Link>{" "}
      to run a check.
    </p>
  ) : null;

  return (
    <div className={PANEL_CLASS}>
      {!hideIntro && (
        <div className="form-intro">
          <strong>{landingLabels.form.introTitle}</strong>
          <p>{landingLabels.form.introCopy}</p>
        </div>
      )}

      <div className="flex gap-1.5 rounded-2xl border border-[var(--line)] bg-[#f4f0e7] p-1.5">
        <button type="button" onClick={() => setEntryMode('link')} className={tabClass('link')}>
          From a link
        </button>
        <button type="button" onClick={() => setEntryMode('manual')} className={tabClass('manual')}>
          Enter manually
        </button>
      </div>

      {entryMode === 'link' ? (
        <form className="flex flex-col gap-7" onSubmit={handleStartCheck} id="check-form">
          <label className="flex flex-col gap-2">
            <span className={LABEL_TEXT}>{landingLabels.form.sourceLabel}</span>
            <Select value={listingSource} onValueChange={setListingSource}>
              <SelectTrigger className={CONTROL_CLASS}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketplace">{landingLabels.form.sourceOptions.marketplace}</SelectItem>
                <SelectItem value="auction">{landingLabels.form.sourceOptions.auction}</SelectItem>
                <SelectItem value="dealer">{landingLabels.form.sourceOptions.dealer}</SelectItem>
                <SelectItem value="private">{landingLabels.form.sourceOptions.private}</SelectItem>
              </SelectContent>
            </Select>
            <span className={HINT_TEXT}>{landingLabels.form.sourceHint}</span>
          </label>

          <label className="flex flex-col gap-2">
            <span className={LABEL_TEXT}>{landingLabels.form.listingUrlLabel}</span>
            <Input
              id="listingUrl" type="url"
              value={listingUrl} onChange={(e) => setListingUrl(e.target.value)}
              placeholder="https://www.copart.co.uk/lot/..." required
              className={CONTROL_CLASS}
            />
            <span className={HINT_TEXT}>{landingLabels.form.listingUrlHint}</span>
          </label>

          {sharedParams}

          {scrapingError && <p className="form-error">{scrapingError}</p>}
          {formError && <p className="form-error">{formError}</p>}
          {creditWarning}

          {hasInsufficientCredits ? (
            <div className="button-tooltip-container" data-tooltip="You don't have enough credits to run a check. Please purchase more credits.">
              <Button type="submit" className="w-full" disabled>
                Fetch listing details
              </Button>
            </div>
          ) : (
            <Button type="submit" className="w-full" disabled={!isReady || isSubmitting}>
              Fetch listing details
            </Button>
          )}
        </form>
      ) : (
        <div className="flex flex-col gap-7">
          {sharedParams}
          {creditWarning}
          <ManualEntry
            paramsReady={manualParamsReady && !hasInsufficientCredits}
            submitting={isSubmitting}
            error={formError}
            userId={user?.id}
            onAnalyse={(event, listing) => submit(event, listing)}
          />
        </div>
      )}
    </div>
  );
}
