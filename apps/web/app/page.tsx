"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  ChevronRight,
  FileSearch,
  Receipt,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { CTAProps } from "./types";
import {
  pricing,
  aiInputs,
  reportAnswers,
  aboutIntro,
  aboutSections,
  faqs,
  whyUseCards,
} from "./constants";
import { useSession } from "./lib/supabase";
import AuthMenu from "./components/auth-menu";
import ReportPreview from "./components/report-preview";

const whyIconMap = {
  FileSearch,
  Receipt,
  ShieldCheck,
  Target,
  Camera,
  Users,
} as const;

const whyIconVariants = ["ink", "blue", "gold", "clay", "soft", "blue"] as const;

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
          <a href="#why">Why</a>
          <a href="#pricing">Pricing</a>
          <a href="#faqs">FAQs</a>
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
          <h3>How Ralph turns a listing into a budget-fit report.</h3>
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


      <section className="budget-section">
        <div className="budget-text">
          <h2>Ralph adds up the costs the auction page leaves out.</h2>
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

      <section className="why-section" id="why">
        <div className="section-heading">
          <h2>Check the car before the auction price decides for you.</h2>
        </div>
        <div className="why-grid">
          {whyUseCards.map((card, index) => {
            const Icon = whyIconMap[card.iconName];
            const variant = whyIconVariants[index % whyIconVariants.length];
            return (
              <article className="why-card" key={card.title}>
                <span
                  className={`why-icon why-icon--${variant}`}
                  aria-hidden="true"
                >
                  <Icon />
                </span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            );
          })}
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

      <section className="about-section" id="about">
        <div className="section-heading">
          <h2>How Ask Ralph works, what he reads, and where he stops.</h2>
        </div>
        <p className="about-intro">{aboutIntro}</p>
        <div className="about-mobile-toc" aria-label="">
          {aboutSections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.heading}
            </a>
          ))}
        </div>
        <div className="about-layout">
          <nav className="about-toc" aria-label="e">

            {aboutSections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                <ChevronRight aria-hidden="true" />
                <span>{section.heading}</span>
              </a>
            ))}
          </nav>
          <div className="about-content">
            {aboutSections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="about-article"
              >
                <h3>{section.heading}</h3>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="faqs-bridge">
        <h2>Choose how much help you want from Ralph.</h2>
      </div>

      <section className="faqs-section" id="faqs">
        <div className="section-heading">
          <h2>The questions Ralph hears most often.</h2>
        </div>
        <ul className="faqs-list">
          {faqs.map((faq) => (
            <li key={faq.question}>
              <details className="faqs-item">
                <summary>{faq.question}</summary>
                <div className="faqs-item-body">{faq.answer}</div>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <h2>Don't buy blind. Let Ralph check it first.</h2>
        <CTA>Ask Ralph About This Car</CTA>
        <p>Ralph guides your decision before you buy, from the listing price to your door.</p>
      </footer>

      <nav className="mobile-anchor-bar" aria-label="Quick section navigation">
        <a href="#check">Check</a>
        <a href="#why">Why</a>
        <a href="#pricing">Pricing</a>
        <a href="#faqs">FAQs</a>
      </nav>
    </main>
  );
}
