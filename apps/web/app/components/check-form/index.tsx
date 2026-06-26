"use client";

import { useReportForm } from "../../lib/use-report-form";
import { landingLabels } from "../../labels";

interface CheckFormProps {
  hideIntro?: boolean;
  variant?: 'default' | 'dashboard';
}

export default function CheckForm({ hideIntro = false, variant = 'default' }: CheckFormProps) {
  const {
    listingUrl,
    setListingUrl,
    budget,
    setBudget,
    postcode,
    setPostcode,
    riskTolerance,
    setRiskTolerance,
    formError,
    isSubmitting,
    submit,
  } = useReportForm();

  return (
    <form 
      className={variant === 'default' ? "check-panel" : "dashboard-form-panel"} 
      onSubmit={submit} 
      id="check-form"
    >
      {!hideIntro && (
        <div className="form-intro">
          <strong>{landingLabels.form.introTitle}</strong>
          <p>{landingLabels.form.introCopy}</p>
        </div>
      )}

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
      <label>
        {landingLabels.form.budgetLabel}
        <input
          id="budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="e.g. £4,000"
          required
        />
        <span>{landingLabels.form.budgetHint}</span>
      </label>
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
      <div className="email-postcode-grid">
        <label>
          Email address
          <input type="email" placeholder="you@example.co.uk" />
          <span>We'll send your report link.</span>
        </label>
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
      </div>
      <div className="risk-selector-container">
        <span className="field-label">{landingLabels.form.riskLabel}</span>
        <div className="risk-cards-grid">
          <label className="risk-card risk-card-low">
            <input
              type="radio"
              name="riskTolerance"
              value="cautious"
              checked={riskTolerance === "cautious"}
              onChange={() => setRiskTolerance("cautious")}
            />
            <span className="risk-title">{landingLabels.form.riskOptions.cautious.title}</span>
            <span className="risk-desc">{landingLabels.form.riskOptions.cautious.desc}</span>
          </label>
          <label className="risk-card risk-card-balanced">
            <input
              type="radio"
              name="riskTolerance"
              value="balanced"
              checked={riskTolerance === "balanced"}
              onChange={() => setRiskTolerance("balanced")}
            />
            <span className="risk-title">{landingLabels.form.riskOptions.balanced.title}</span>
            <span className="risk-desc">{landingLabels.form.riskOptions.balanced.desc}</span>
          </label>
          <label className="risk-card risk-card-high">
            <input
              type="radio"
              name="riskTolerance"
              value="flexible"
              checked={riskTolerance === "flexible"}
              onChange={() => setRiskTolerance("flexible")}
            />
            <span className="risk-title">{landingLabels.form.riskOptions.flexible.title}</span>
            <span className="risk-desc">{landingLabels.form.riskOptions.flexible.desc}</span>
          </label>
        </div>
        <span className="field-hint">{landingLabels.form.riskHint}</span>
      </div>
      
      {formError && <p className="form-error">{formError}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? landingLabels.form.buttonLoadingText : landingLabels.form.buttonText}
      </button>
    </form>
  );
}
