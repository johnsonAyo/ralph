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

interface CheckFormProps {
  hideIntro?: boolean;
  variant?: 'default' | 'dashboard';
}

// Trigger styling matched to the original .dashboard-form-panel select.
const SELECT_TRIGGER_CLASS =
  "min-h-[46px] rounded-[12px] border-[1.5px] border-input bg-[#fefdfb] px-4 text-[0.95rem] font-semibold focus:ring-[3px] focus:ring-ring/15";

export default function CheckForm({ hideIntro = false, variant = 'default' }: CheckFormProps) {
  const router = useRouter();
  const [simpleUrl, setSimpleUrl] = useState("");
  const [listingSource, setListingSource] = useState("auction");

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

  // Multi-stage states
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
  const { data: credits = 0, isLoading: loadingCredits } = useCredits(user?.id);
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

  // Dashboard Loader screens
  if (isSubmitting) {
    return (
      <div className="dashboard-form-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "350px", textAlign: "center", padding: "3rem" }}>
        <div className="spinner" style={{ width: "50px", height: "50px", border: "4px solid rgba(0, 0, 0, 0.1)", borderTop: "4px solid var(--blue, #2f62e9)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "1.5rem" }} />
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--ink, #111)", marginBottom: "0.5rem" }}>Running AI Analysis...</h2>
        <p style={{ color: "var(--ink-gray, #666)", fontSize: "0.95rem", maxWidth: "340px", lineHeight: "1.5" }}>Creating report and debiting credit. Analyzing the vehicle history, damage, and bid strategy.</p>
      </div>
    );
  }

  if (stage === 'scraping') {
    return (
      <div className="dashboard-form-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "350px", textAlign: "center", padding: "3rem" }}>
        <div className="spinner" style={{ width: "50px", height: "50px", border: "4px solid rgba(0, 0, 0, 0.1)", borderTop: "4px solid var(--blue, #2f62e9)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "1.5rem" }} />
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--ink, #111)", marginBottom: "0.5rem" }}>Retrieving car information...</h2>
        <p style={{ color: "var(--ink-gray, #666)", fontSize: "0.95rem", maxWidth: "320px", lineHeight: "1.5" }}>Ralph is analyzing the link and extracting listing details.</p>
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

  return (
    <form
      className="dashboard-form-panel"
      onSubmit={handleStartCheck}
      id="check-form"
    >
      {!hideIntro && (
        <div className="form-intro">
          <strong>{landingLabels.form.introTitle}</strong>
          <p>{landingLabels.form.introCopy}</p>
        </div>
      )}

      {/* Listing source */}
      <label>
        {landingLabels.form.sourceLabel}
        <Select value={listingSource} onValueChange={setListingSource}>
          <SelectTrigger className={SELECT_TRIGGER_CLASS}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="marketplace">{landingLabels.form.sourceOptions.marketplace}</SelectItem>
            <SelectItem value="auction">{landingLabels.form.sourceOptions.auction}</SelectItem>
            <SelectItem value="dealer">{landingLabels.form.sourceOptions.dealer}</SelectItem>
            <SelectItem value="private">{landingLabels.form.sourceOptions.private}</SelectItem>
          </SelectContent>
        </Select>
        <span>{landingLabels.form.sourceHint}</span>
      </label>

      {/* Budget range */}
      <div className="budget-range-field">
        <div className="budget-range-header">
          <span className="budget-range-label">{landingLabels.form.budgetLabel}</span>
          {(budgetMin || budgetMax) && (
            <span className="budget-range-preview">
              £{budgetMin || "0"} – £{budgetMax || "0"}
            </span>
          )}
        </div>
        <div className="budget-range-row">
          <div className="budget-range-col">
            <p className="budget-range-sublabel">Minimum</p>
            <Input
              id="budgetMin"
              type="text"
              inputMode="numeric"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              placeholder="3,000"
              required
              aria-label="Minimum budget"
            />
          </div>
          <span className="budget-range-sep" aria-hidden="true">–</span>
          <div className="budget-range-col">
            <p className="budget-range-sublabel">Maximum</p>
            <Input
              id="budgetMax"
              type="text"
              inputMode="numeric"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="6,000"
              required
              aria-label="Maximum budget"
            />
          </div>
        </div>
        <span className="budget-range-hint">{landingLabels.form.budgetHint}</span>
      </div>

      {/* Listing URL */}
      <label>
        {landingLabels.form.listingUrlLabel}
        <Input
          id="listingUrl"
          type="url"
          value={listingUrl}
          onChange={(e) => setListingUrl(e.target.value)}
          placeholder="https://www.copart.co.uk/lot/..."
          required
        />
        <span>{landingLabels.form.listingUrlHint}</span>
      </label>

      {/* Postcode */}
      <label>
        {landingLabels.form.postcodeLabel}
        <Input
          id="postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="e.g. M12 4AB"
          required
        />
        <span>{landingLabels.form.postcodeHint}</span>
      </label>

      {/* Risk tolerance */}
      <div className="risk-selector-container">
        <span className="field-label">{landingLabels.form.riskLabel}</span>
        <div className="risk-cards-grid">
          <label className="risk-card risk-card-low">
            <input type="radio" name="riskTolerance" value="cautious"
              checked={riskTolerance === "cautious"} onChange={() => setRiskTolerance("cautious")} />
            <span className="risk-title">{landingLabels.form.riskOptions.cautious.title}</span>
            <span className="risk-desc">{landingLabels.form.riskOptions.cautious.desc}</span>
          </label>
          <label className="risk-card risk-card-balanced">
            <input type="radio" name="riskTolerance" value="balanced"
              checked={riskTolerance === "balanced"} onChange={() => setRiskTolerance("balanced")} />
            <span className="risk-title">{landingLabels.form.riskOptions.balanced.title}</span>
            <span className="risk-desc">{landingLabels.form.riskOptions.balanced.desc}</span>
          </label>
          <label className="risk-card risk-card-high">
            <input type="radio" name="riskTolerance" value="flexible"
              checked={riskTolerance === "flexible"} onChange={() => setRiskTolerance("flexible")} />
            <span className="risk-title">{landingLabels.form.riskOptions.flexible.title}</span>
            <span className="risk-desc">{landingLabels.form.riskOptions.flexible.desc}</span>
          </label>
        </div>
        <span className="field-hint">{landingLabels.form.riskHint}</span>
      </div>

      {scrapingError && <p className="form-error">{scrapingError}</p>}
      {formError && <p className="form-error">{formError}</p>}

      {hasInsufficientCredits && (
        <p className="form-error" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          You have 0 credits remaining. Please{" "}
          <Link href="/#pricing" style={{ textDecoration: "underline", fontWeight: 600 }}>
            buy credits
          </Link>{" "}
          to run a check.
        </p>
      )}

      {hasInsufficientCredits ? (
        <div className="button-tooltip-container" data-tooltip="You don't have enough credits to run a check. Please purchase more credits.">
          <Button type="submit" disabled={!isReady || isSubmitting || hasInsufficientCredits} className="w-full cursor-not-allowed">
            Ask Ralph About This Car
          </Button>
        </div>
      ) : (
        <Button type="submit" disabled={!isReady || isSubmitting}>
          Ask Ralph About This Car
        </Button>
      )}
    </form>
  );
}
