"use client";

import React, { useState } from "react";
import { CTAProps, OutcomeType } from "./types";
import { pricing, aiInputs, reportAnswers } from "./constants";

function CTA({ children = "Ask Ralph", variant = "primary" }: CTAProps) {
  return (
    <a className={`button ${variant}`} href="#check">
      {children}
    </a>
  );
}

function ReportPreview() {
  const [showExpertNote, setShowExpertNote] = useState(false);
  const [outcome, setOutcome] = useState<OutcomeType>(null);
  const [paidPrice, setPaidPrice] = useState("");
  const [outcomeSubmitted, setOutcomeSubmitted] = useState(false);

  const handleOutcomeClick = (selectedOutcome: NonNullable<OutcomeType>) => {
    if (selectedOutcome === "bought") {
      setOutcome("bought");
    } else {
      setOutcome(selectedOutcome);
      setOutcomeSubmitted(true);
    }
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOutcomeSubmitted(true);
  };

  return (
    <article className="report-preview" aria-label="Sample car buy check report">
      <div className="report-header">
        <div>
          <h3>Ford Focus 1.0 EcoBoost, Cat S</h3>
          <div className="header-meta">
            <a href="#check" className="lot-link">example listing with photos and history</a>
            <span className="separator">•</span>
            <span className="reg-text">Mileage and MOT pattern checked</span>
          </div>
        </div>
        <div className="report-verdict consider">
          <span>Budget fit</span>
          <strong>Slightly stretched</strong>
          <span className="verdict-reason">Good only if the price stays controlled</span>
        </div>
      </div>

      <div className="report-metrics-grid">
        <div className="metric-box">
          <span>Smart Price Range</span>
          <strong>£1,600 - £1,850</strong>
          <span className="sub-text">Where the deal still makes sense for this buyer</span>
        </div>
        <div className="metric-box">
          <span>Maximum Sensible Price</span>
          <strong>£1,900</strong>
          <span className="sub-text">Above this, the risk stops matching the budget</span>
        </div>
        <div className="metric-box budget-style">
          <span>Your Budget</span>
          <strong>£4,000</strong>
          <span className="sub-text">Total money available, not just car price</span>
        </div>
      </div>

      <div className="report-details-grid">
        <div className="details-card">
          <div className="card-header">
            <span className="card-title">Budget Fit Breakdown</span>
            <span className="card-subtitle">Non-car costs: £1,800 - £2,300 | sensible price room: £1,700 - £2,000</span>
          </div>
          <div className="details-list">
            <div className="detail-item">
              <div className="item-label">
                <span>Current price shown</span>
                <span className="edu-tag">Starting point</span>
              </div>
              <strong>£2,150</strong>
              <p>This is already close to the limit for this buyer.</p>
            </div>
            <div className="detail-item">
              <div className="item-label">
                <span>Fees and admin allowance</span>
                <span className="edu-tag">Cost range</span>
              </div>
              <strong>£450 - £650</strong>
              <p>Marketplace, auction, dealer or paperwork fees can change the real price.</p>
            </div>
            <div className="detail-item">
              <div className="item-label">
                <span>Delivery or collection</span>
                <span className="edu-tag">M12 4AB</span>
              </div>
              <strong>£180 - £320</strong>
              <p>Distance and vehicle condition affect whether the deal still fits.</p>
            </div>
            <div className="detail-item">
              <div className="item-label">
                <span>Repair allowance</span>
                <span className="edu-tag">Planning range</span>
              </div>
              <strong>£700 - £1,200</strong>
              <p>Visible front damage and suspension uncertainty need a repair buffer.</p>
            </div>
            <div className="detail-item">
              <div className="item-label">
                <span>Safety buffer</span>
                <span className="edu-tag">Private buyer</span>
              </div>
              <strong>£300</strong>
              <p>Reserved for surprises before committing all of the budget.</p>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="card-header">
            <span className="card-title">Car Quality Signals</span>
            <span className="card-subtitle">Mileage, damage, history and photo clues</span>
          </div>
          <div className="details-list">
            <div className="detail-item">
              <span>Mileage pattern</span>
              <strong>Looks consistent</strong>
              <p>No obvious mileage jump in the visible history.</p>
            </div>
            <div className="detail-item">
              <span>History check</span>
              <strong>Mixed but explainable</strong>
              <p>Previous headlamp and coil spring issues matter because the current damage is also front-end.</p>
            </div>
            <div className="detail-item highlight-warn">
              <span>Damage type</span>
              <strong className="warning-text">Front-left impact with suspension concern</strong>
              <p>The visible damage may be more than cosmetic.</p>
            </div>
            <div className="detail-item">
              <span>Photo summary</span>
              <p className="damage-text">
                Front-left bumper, headlight, bonnet edge and wing show visible impact. Wheel angle makes the repair cost uncertain.
              </p>
            </div>
            <div className="inline-education">
              <div className="edu-box">
                <strong>Good buy for someone else:</strong> A car can be decent and still wrong for your budget.
              </div>
              <div className="edu-box">
                <strong>Maximum sensible price:</strong> This is advice, not a command. The final choice stays with you.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="report-footer-grid">
        <div className="footer-column">
          <span className="card-title">What You Should Notice</span>
          <ul className="risk-bullets">
            <li><strong>Budget pressure:</strong> the bad-case total can pass £4,000.</li>
            <li><strong>Damage location:</strong> front-left impact can hide steering or suspension cost.</li>
            <li><strong>History pattern:</strong> previous suspension advisories make the current damage more important.</li>
            <li><strong>Price discipline:</strong> paying above £1,900 makes this less wise for this buyer.</li>
          </ul>
        </div>
        <div className="footer-column">
          <span className="card-title">Before You Commit</span>
          <ol className="advice-checklist">
            <li>Check the full cost, not just the car price.</li>
            <li>Confirm what is known from photos, mileage and history.</li>
            <li>Treat £1,900 as the maximum sensible price for this budget.</li>
            <li>If the seller price moves higher, decide whether the extra risk is worth it.</li>
            <li>Use expert review if the damage or history feels unclear.</li>
          </ol>
        </div>
      </div>

      <div className="expert-upgrade-card">
        <div className="expert-card-left">
          <span className="upgrade-tag">Optional confidence check</span>
          <h4>Ask a human expert to look at the grey areas</h4>
          <p className="expert-desc">
            This report is useful, but the front-left damage is uncertain. A human reviewer can look at the photos, history pattern and budget pressure before you decide.
          </p>
          <div className="expert-buttons-row">
            <button className="expert-btn standard" type="button">
              Standard Review <span>(within 24h) • £39</span>
            </button>
            <button className="expert-btn priority" type="button">
              Priority Review <span>(within 4h) • £69</span>
            </button>
          </div>
        </div>
        <div className="expert-card-right">
          <div className="sample-review-toggle">
            <button
              type="button"
              className={`toggle-note-btn ${showExpertNote ? "active" : ""}`}
              onClick={() => setShowExpertNote(!showExpertNote)}
            >
              {showExpertNote ? "Hide Sample Expert Note" : "View Sample Expert Note"}
            </button>
            {showExpertNote && (
              <div className="sample-expert-note-content">
                <div className="expert-verdict-tag avoid">Expert note: be careful</div>
                <p className="expert-note-text">
                  "The car is not automatically bad, but I would not stretch past the sensible price range. The visible wheel angle and past suspension advisories make the repair budget fragile."
                </p>
                <span className="expert-signature">Reviewed by Ralph's expert team</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="outcome-followup-widget">
        <div className="outcome-header">
          <strong>Did this advice change your decision?</strong>
          <p>Outcome feedback helps improve future price and risk guidance.</p>
        </div>
        {!outcomeSubmitted ? (
          <div className="outcome-interactive">
            <div className="outcome-buttons">
              <button type="button" className="outcome-btn" onClick={() => handleOutcomeClick("walked-away")}>I walked away</button>
              <button type="button" className="outcome-btn" onClick={() => handleOutcomeClick("negotiated")}>I negotiated lower</button>
              <button type="button" className="outcome-btn won" onClick={() => handleOutcomeClick("bought")}>I bought it</button>
              <button type="button" className="outcome-btn" onClick={() => handleOutcomeClick("deciding")}>I'm still deciding</button>
            </div>
            {outcome === "bought" && (
              <form onSubmit={handlePriceSubmit} className="won-subform">
                <label htmlFor="paidPriceInput">What price did you commit to?</label>
                <div className="won-input-row">
                  <span className="currency-prefix">£</span>
                  <input
                    id="paidPriceInput"
                    type="number"
                    value={paidPrice}
                    onChange={(e) => setPaidPrice(e.target.value)}
                    placeholder="e.g. 1750"
                    required
                  />
                  <button type="submit" className="won-submit-btn">Submit Price</button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="outcome-thanks">
            <span>✓</span> Thank you. This helps improve future checks.
          </div>
        )}
      </div>

      <p className="report-disclaimer">
        This report is buying guidance, not a mechanical inspection or guarantee. It points out budget pressure, visible risk and missing information so you can make a better decision.
      </p>
    </article>
  );
}

export default function Home() {
  return (
    <main>
      <header className="nav">
        <a className="brand" href="#top" aria-label="Ask Ralph home">
          <span className="brand-mark">R</span>
          <span>Ask<br />Ralph</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#check">Check</a>
          <a href="#answers">Report</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <CTA />
      </header>

      <section className="hero" id="top">
        <div className="dot dot-blue" />
        <div className="dot dot-gold" />
        <p className="eyebrow pill">Ralph guides your decision before you buy</p>
        <h1>Found a car online? Ask Ralph before you buy.</h1>
        <p className="hero-copy">
          Paste a listing or start with the information you have. Ralph checks the price, mileage, damage, history, photos and your budget, then guides your decision in plain English.
        </p>
        <div className="hero-actions">
          <CTA>Ask Ralph About This Car</CTA>
          <p>Get one sample check, then use paid credits when you want Ralph to check more cars or bring in an expert.</p>
        </div>
      </section>

      <section className="check-section" id="check">
        <ReportPreview />

        <div className="ai-explainer">
          <h3>He checks the car and checks the deal.</h3>
          <p>
            A car can be a good car and still be wrong for your budget. Ralph separates vehicle risk from budget fit so you can decide with your eyes open.
          </p>
          <div>
            {aiInputs.map((input) => (
              <span key={input}>{input}</span>
            ))}
          </div>
        </div>

        <div className="form-section">
          <form className="check-panel">
            <div className="form-intro">
              <strong>Tell Ralph what you know</strong>
              <p>Manual details and photo upload come inside the full check flow.</p>
            </div>
            <label>
              Listing source
              <select defaultValue="marketplace">
                <option value="marketplace">Marketplace listing</option>
                <option value="auction">Auction listing</option>
                <option value="dealer">Dealer listing</option>
                <option value="private">Private seller</option>
              </select>
              <span>Works best when the listing has photos, mileage, price and damage notes.</span>
            </label>
            <label>
              Your full budget
              <input placeholder="e.g. £4,000" />
              <span>The most you want to spend in total, including known costs.</span>
            </label>
            <label>
              Listing URL
              <input placeholder="https://example.com/car-listing" />
              <span>Paste the car advert, auction lot or dealer page.</span>
            </label>
            <div className="email-postcode-grid">
              <label>
                Email address
                <input type="email" placeholder="you@example.co.uk" />
                <span>We'll send your report link.</span>
              </label>
              <label>
                Your postcode
                <input placeholder="e.g. M12 4AB" />
                <span>Used for delivery and distance pressure.</span>
              </label>
            </div>
            <div className="risk-selector-container">
              <span className="field-label">How cautious should the check be?</span>
              <div className="risk-cards-grid">
                <label className="risk-card risk-card-low">
                  <input type="radio" name="riskTolerance" value="low" defaultChecked />
                  <span className="risk-title">Careful</span>
                  <span className="risk-desc">Best for normal buyers</span>
                </label>
                <label className="risk-card risk-card-balanced">
                  <input type="radio" name="riskTolerance" value="balanced" />
                  <span className="risk-title">Balanced</span>
                  <span className="risk-desc">Some repair risk is okay</span>
                </label>
                <label className="risk-card risk-card-high">
                  <input type="radio" name="riskTolerance" value="high" />
                  <span className="risk-title">Experienced</span>
                  <span className="risk-desc">For buyers with repair support</span>
                </label>
              </div>
              <span className="field-hint">Careful is recommended when you do not know the car market well.</span>
            </div>
            <button type="button">Ask Ralph About This Car</button>
          </form>
        </div>
      </section>

      <section className="answers-section" id="answers">
        <div className="section-heading">
          <h2>Ralph answers what a normal buyer actually wants to know.</h2>
        </div>
        <div className="answer-grid">
          {reportAnswers.map((answer) => (
            <div className="answer-card" key={answer}>
              {answer}
            </div>
          ))}
        </div>
      </section>

      <section className="decision-section">
        <div className="section-heading">
          <h2>He does not simply say good or bad.</h2>
          <p className="pricing-note">
            Ralph explains whether the car fits your budget, what price still makes sense, and what facts could change the decision.
          </p>
        </div>
        <div className="decision-grid">
          <article className="decision-card">
            <span>1</span>
            <h3>Good fit for your budget</h3>
            <p>The price, likely costs and visible condition leave enough room for normal surprises.</p>
          </article>
          <article className="decision-card">
            <span>2</span>
            <h3>Slightly outside budget</h3>
            <p>The car may still be a good buy, but you need to know exactly where the pressure is.</p>
          </article>
          <article className="decision-card">
            <span>3</span>
            <h3>Risky for your budget</h3>
            <p>The car may suit someone else, but the numbers or condition do not fit your situation.</p>
          </article>
        </div>
      </section>

      <section className="budget-section">
        <div className="budget-text">
          <h2>A £4,000 budget can still fail on a £2,150 car.</h2>
          <p>
            Buyers focus on the advertised price and miss fees, delivery, repairs and the cost of being wrong. Ralph maps those pressures before you commit.
          </p>
        </div>
        <div className="cost-list">
          {[
            ["Current price", "£2,150"],
            ["Fees/admin", "£570"],
            ["Delivery", "£290"],
            ["Repair allowance", "£1,450"]
          ].map(([label, value]) => (
            <div className="cost-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
          <div className="cost-total">
            <span>Estimated total cost</span>
            <strong>£4,460</strong>
          </div>
        </div>
      </section>

      <section className="expert-section">
        <div className="expert-card">
          <div>
            <h2>When the report names uncertainty, get a human check.</h2>
            <p>
              Expert review should not be a funnel. It appears when the photos, damage type, mileage pattern or budget pressure leave a real judgement gap.
            </p>
          </div>
          <div className="expert-cta">
            <CTA>Ask Ralph About This Car</CTA>
            <p>The decision stays with you.</p>
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="section-heading">
          <h2>Choose how much help you want from Ralph.</h2>
          <p className="pricing-note">
            Start with one car, compare a few options, or choose the protected plan when you want an expert to review the grey areas with Ralph.
          </p>
        </div>
        <div className="pricing-unlocks">
          <span>Paid checks can include</span>
          <ul>
            <li>Ralph's budget-fit report</li>
            <li>Photo and manual detail upload</li>
            <li>Saved report history</li>
            <li>Expert review on Protected</li>
          </ul>
        </div>
        <div className="pricing-grid">
          {pricing.map(([tier, reports, price, features]) => (
            <article className={tier === "Buyer" ? "price-card featured" : "price-card"} key={tier}>
              <p>{tier}</p>
              <h3>{reports}</h3>
              <strong>{price}</strong>
              <ul className="price-features">
                {features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <CTA>{tier === "Protected" ? "Get Protected" : "Ask Ralph"}</CTA>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">
        <h2>Not sure about the car? Ralph has got you.</h2>
        <CTA>Ask Ralph About This Car</CTA>
        <p>A good car for someone else can still be the wrong buy for you.</p>
      </footer>
    </main>
  );
}
