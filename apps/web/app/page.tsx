"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CTAProps } from "./types";
import { pricing, aiInputs, reportAnswers } from "./constants";
import { useSession } from "./lib/supabase";
import AuthMenu from "./components/auth-menu";
import ReportPreview from "./components/report-preview";

function CTA({ children = "Ask Ralph", variant = "primary" }: CTAProps) {
  return (
    <a className={`button ${variant}`} href="#check">
      {children}
    </a>
  );
}

export default function Home() {
  const router = useRouter();
  const { data: user, isLoading } = useSession();

  // Redirect to dashboard when a session is resolved.
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (isLoading) {
    return <main className="auth-page-shell">Loading Ralph...</main>;
  }

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
        <div className="nav-actions">
          <AuthMenu />
          <CTA />
        </div>
      </header>

      <section className="hero" id="top">
        <div className="dot dot-blue" />
        <div className="dot dot-gold" />
        <p className="eyebrow pill">Ralph guides your decision before you buy</p>
        <h1>Found a car online? Ask Ralph before you buy.</h1>
        <p className="hero-copy">
          Paste a listing or start with the information you have. Ralph checks the price, mileage, damage, history, photos and your budget.
        </p>
        <div className="hero-actions">
          <CTA>Ask Ralph About This Car</CTA>
          <p>An intelligence layer that guides your decision before you buy. One sample check is on us.</p>
        </div>
      </section>

      <section className="check-section" id="check">
        <ReportPreview />

        <div className="ai-explainer">
          <h3>He reads the listing. He runs the numbers. He tells you what to pay.</h3>
          <p>
            Ralph takes the car details, your budget, and your risk appetite, then estimates a cost-effective target price with a full breakdown from auction to your door. A good car at the wrong price is still the wrong buy.
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
          <h2>Ralph answers the questions every buyer should ask, but most don't.</h2>
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
          <h2>He tells you the best price to pay, not just good or bad.</h2>
          <p className="pricing-note">
            Ralph estimates a reliable, cost-effective offer price based on condition, risk, and your full budget. Then he shows you exactly why.
          </p>
        </div>
        <div className="decision-grid">
          <article className="decision-card">
            <span>1</span>
            <h3>Worth buying. Here's your target price</h3>
            <p>The listing, condition, and estimated total costs fit your budget. Ralph gives you a confident offer price to negotiate from.</p>
          </article>
          <article className="decision-card">
            <span>2</span>
            <h3>Possible, but only at a lower price</h3>
            <p>The car could work, but the asking price needs to come down. Ralph tells you exactly how much and why.</p>
          </article>
          <article className="decision-card">
            <span>3</span>
            <h3>Not worth it at any price</h3>
            <p>The risk, condition, or total cost puts this car outside your budget range. Ralph explains what would have to change.</p>
          </article>
        </div>
      </section>

      <section className="budget-section">
        <div className="budget-text">
          <h2>A £4,000 budget can still fail on a £2,150 car.</h2>
          <p>
            Most buyers only see the asking price. Ralph breaks down every cost from auction to your doorstep: fees, delivery, repairs, and risk buffer, so you know your real spend before you commit.
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
            <h2>When Ralph flags uncertainty, bring in a human expert.</h2>
            <p>
              Expert review is not a default upsell. Ralph surfaces it when the photos, damage type, mileage pattern, or cost analysis leave a real gap that needs a trained eye.
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
            Start with a free check on one car, analyse a shortlist, or go Protected when you want an expert to validate Ralph's analysis before you hand over your money.
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
        <h2>Don't buy blind. Let Ralph check it first.</h2>
        <CTA>Ask Ralph About This Car</CTA>
        <p>Ralph guides your decision before you buy, from the listing price to your door.</p>
      </footer>
    </main>
  );
}
