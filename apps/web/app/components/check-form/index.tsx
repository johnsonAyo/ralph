"use client";

import { useReportForm } from "../../lib/use-report-form";
import { landingLabels } from "../../labels";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCredits } from "../../lib/use-credits";
import { useSession, getSupabaseBrowserClient } from "../../lib/supabase";
import Link from "next/link";
import { API_BASE_URL } from "../../constants";
import { CheckCircle2 } from "lucide-react";

interface CheckFormProps {
  hideIntro?: boolean;
  variant?: 'default' | 'dashboard';
}

export default function CheckForm({ hideIntro = false, variant = 'default' }: CheckFormProps) {
  const router = useRouter();
  const [simpleUrl, setSimpleUrl] = useState("");

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

  // Edit fields for confirmation stage
  const [editTitle, setEditTitle] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editMileage, setEditMileage] = useState("");
  const [editCurrentBid, setEditCurrentBid] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editPrimaryDamage, setEditPrimaryDamage] = useState("");
  const [editSecondaryDamage, setEditSecondaryDamage] = useState("");
  const [editRunCondition, setEditRunCondition] = useState("");
  const [editHasKeys, setEditHasKeys] = useState(true);
  const [editV5Status, setEditV5Status] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      setEditTitle(listingData.title ?? "");
      setEditYear(listingData.year?.toString() ?? "");
      setEditMileage(listingData.mileage?.toString() ?? "");
      setEditCurrentBid(listingData.currentBid?.toString() ?? "");
      setEditLocation(listingData.location ?? "");
      setEditPrimaryDamage(listingData.primaryDamage ?? "");
      setEditSecondaryDamage(listingData.secondaryDamage ?? "");
      setEditRunCondition(listingData.runCondition ?? "");
      setEditHasKeys(listingData.hasKeys ?? true);
      setEditV5Status(listingData.v5Status ?? "");
      setCurrentImageIndex(0);
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
  const { data: credits = 0, isLoading: loadingCredits } = useCredits();
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
          <input
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
        <button type="submit" disabled={!simpleReady}>
          Ask Ralph About This Car
        </button>
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
    const images = extractedListing?.images || [];
    const mainImageUrl = images[currentImageIndex]?.fullUrl || images[currentImageIndex]?.highResUrl;

    const handleConfirmSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      submit(e, {
        ...extractedListing,
        title: editTitle,
        year: editYear ? parseInt(editYear, 10) : undefined,
        mileage: editMileage ? parseInt(editMileage, 10) : undefined,
        currentBid: editCurrentBid ? parseFloat(editCurrentBid) : undefined,
        location: editLocation,
        primaryDamage: editPrimaryDamage,
        secondaryDamage: editSecondaryDamage,
        runCondition: editRunCondition,
        hasKeys: editHasKeys,
        v5Status: editV5Status,
      });
    };

    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
      <div className="dashboard-form-panel" style={{ maxWidth: '100%' }}>
        <div className="form-intro" style={{ marginBottom: '2rem' }}>
          <strong>Confirm Car Details</strong>
          <p>Please review the details Ralph extracted from the listing. Correct any errors or add missing details before generating the analysis.</p>
        </div>

        <form onSubmit={handleConfirmSubmit} className="confirm-listing-form-inline">
          <div className="confirm-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            
            {/* Media slider */}
            <div className="confirm-media-section">
              {images.length > 0 ? (
                <div className="slider-wrapper" style={{ margin: '0 auto', maxWidth: '480px' }}>
                  <div className="slider-image-container">
                    <img src={mainImageUrl} alt={editTitle || "Car listing photo"} />
                    {images.length > 1 && (
                      <>
                        <button type="button" className="slider-nav-btn slider-nav-btn--left" onClick={prevImage}>&larr;</button>
                        <button type="button" className="slider-nav-btn slider-nav-btn--right" onClick={nextImage}>&rarr;</button>
                        <div className="slider-counter">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="slider-placeholder">No images found</div>
              )}
            </div>

            {/* Editable fields */}
            <div className="confirm-fields-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <label className="form-field">
                <span className="field-label">Vehicle Title</span>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
              </label>

              <div className="fields-row-2">
                <label className="form-field">
                  <span className="field-label">Year</span>
                  <input type="number" value={editYear} onChange={(e) => setEditYear(e.target.value)} />
                </label>
                <label className="form-field">
                  <span className="field-label">Mileage (mi)</span>
                  <input type="number" value={editMileage} onChange={(e) => setEditMileage(e.target.value)} />
                </label>
              </div>

              <div className="fields-row-2">
                <label className="form-field">
                  <span className="field-label">Current Bid (£)</span>
                  <input type="number" step="0.01" value={editCurrentBid} onChange={(e) => setEditCurrentBid(e.target.value)} />
                </label>
                <label className="form-field">
                  <span className="field-label">Location</span>
                  <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                </label>
              </div>

              <div className="fields-row-2">
                <label className="form-field">
                  <span className="field-label">Primary Damage</span>
                  <input type="text" value={editPrimaryDamage} onChange={(e) => setEditPrimaryDamage(e.target.value)} />
                </label>
                <label className="form-field">
                  <span className="field-label">Secondary Damage</span>
                  <input type="text" value={editSecondaryDamage} onChange={(e) => setEditSecondaryDamage(e.target.value)} />
                </label>
              </div>

              <div className="fields-row-2">
                <label className="form-field">
                  <span className="field-label">Run Condition</span>
                  <input type="text" value={editRunCondition} onChange={(e) => setEditRunCondition(e.target.value)} />
                </label>
                <label className="form-field">
                  <span className="field-label">V5 Logbook Status</span>
                  <input type="text" value={editV5Status} onChange={(e) => setEditV5Status(e.target.value)} />
                </label>
              </div>

              <label className="form-field checkbox-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={editHasKeys} onChange={(e) => setEditHasKeys(e.target.checked)} />
                <span className="field-label" style={{ marginBottom: 0 }}>Has Keys</span>
              </label>
            </div>

          </div>

          {formError && <p className="form-error" style={{ marginTop: '1.5rem' }}>{formError}</p>}

          <div className="confirm-actions-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--line, #e6ded0)' }}>
            <button type="button" className="btn btn-secondary" onClick={handleWrongListing}>
              Wrong listing?
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm & Run AI Analysis
            </button>
          </div>
        </form>
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
        <select defaultValue="auction">
          <option value="marketplace">{landingLabels.form.sourceOptions.marketplace}</option>
          <option value="auction">{landingLabels.form.sourceOptions.auction}</option>
          <option value="dealer">{landingLabels.form.sourceOptions.dealer}</option>
          <option value="private">{landingLabels.form.sourceOptions.private}</option>
        </select>
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
            <input
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
            <input
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
        <input
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
        <input
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
          <button type="submit" disabled={!isReady || isSubmitting || hasInsufficientCredits} style={{ width: "100%", cursor: "not-allowed" }}>
            Ask Ralph About This Car
          </button>
        </div>
      ) : (
        <button type="submit" disabled={!isReady || isSubmitting}>
          Ask Ralph About This Car
        </button>
      )}
    </form>
  );
}
