"use client";
import Link from "next/link";
import { Camera, ChevronRight, FileSearch, Receipt, ShieldCheck, Target, Users, } from "lucide-react";
import { getStripeLookupKey } from "./lib/site-url";
import { landingLabels } from "./labels";
import { pricing, aiInputs, reportAnswers, aboutIntro, aboutSections, faqs, whyUseCards, } from "./constants";
import { useSession } from "./lib/supabase";
import { useCheckout } from "./lib/use-checkout";
import { HomeShellSkeleton } from "./components/skeleton";
import CTA from "./components/cta";
function VideoPlaceholder() {
    return (<div style={{
            width: '100%',
            height: '90vh',
            backgroundColor: '#111',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden'
        }}>
      <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(45deg, rgba(59,130,246,0.2), rgba(16,185,129,0.2))'
        }}/>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 1 }}>
        <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.2)',
            cursor: 'pointer'
        }}>
          <div style={{
            width: 0,
            height: 0,
            borderTop: '15px solid transparent',
            borderBottom: '15px solid transparent',
            borderLeft: '24px solid #fff',
            marginLeft: '8px'
        }}/>
        </div>
        <p style={{ fontSize: '1.2rem', fontWeight: 600, opacity: 0.8 }}>Video Placeholder</p>
      </div>
    </div>);
}
const whyIconMap = {
    FileSearch,
    Receipt,
    ShieldCheck,
    Target,
    Camera,
    Users,
} as const;
const whyIconVariants = ["ink", "blue", "gold", "clay", "soft", "blue"] as const;
export default function Home() {
    const { isLoading } = useSession();
    const checkout = useCheckout();
    if (isLoading) {
        return <HomeShellSkeleton />;
    }
    const checkoutError = checkout.error?.message ?? null;
    function startCheckout(tier: string) {
        checkout.mutate(getStripeLookupKey(tier));
    }
    return (<main>
      <section className="hero" id="top">
        <div className="dot dot-blue"/>
        <div className="dot dot-gold"/>
        <p className="eyebrow pill">{landingLabels.hero.eyebrow}</p>
        <h1>{landingLabels.hero.title}</h1>
        <p className="hero-copy">
          {landingLabels.hero.copy}
        </p>
        <div className="hero-actions">
          <CTA>{landingLabels.hero.cta}</CTA>
          <p>{landingLabels.hero.subtext}</p>
        </div>
      </section>

      <section className="check-section" id="check">
        <VideoPlaceholder />

        <div className="ai-explainer">
          <h3>{landingLabels.aiExplainer.title}</h3>
          <p>
            {landingLabels.aiExplainer.copy}
          </p>
          <div>
            {aiInputs.map((input) => (<span key={input}>{input}</span>))}
          </div>
        </div>

        <div className="form-section">
          <div className="card cta-card" style={{ textAlign: "center", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <h3 style={{ margin: 0 }}>Start a new Ralph check</h3>
            <p style={{ margin: 0, maxWidth: "44ch", color: "var(--ink-dim, #5a6478)" }}>
              The full report form has moved to your dashboard. Sign in and open it from the sidebar.
            </p>
            <Link href="/dashboard/new" className="button primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Open the new report form
              <ChevronRight size={16} aria-hidden="true"/>
            </Link>
          </div>
        </div>
      </section>

      <section className="answers-section" id="answers">
        <div className="section-heading">
          <h2>{landingLabels.answers.title}</h2>
        </div>
        <div className="answer-grid">
          {reportAnswers.map((answer) => (<div className="answer-card" key={answer}>
              {answer}
            </div>))}
        </div>
      </section>

      <section className="budget-section">
        <div className="budget-text">
          <h2>{landingLabels.budget.title}</h2>
          <p>
            {landingLabels.budget.copy}
          </p>
        </div>
        <div className="cost-list">
          {[
            ["Current price", "£2,150"],
            ["Fees/admin", "£570"],
            ["Delivery", "£290"],
            ["Repair allowance", "£1,450"]
        ].map(([label, value]) => (<div className="cost-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>))}
          <div className="cost-total">
            <span>Estimated total cost</span>
            <strong>£4,460</strong>
          </div>
        </div>
      </section>

      <section className="why-section" id="why">
        <div className="section-heading">
          <h2>{landingLabels.why.title}</h2>
        </div>
        <div className="why-grid">
          {whyUseCards.map((card, index) => {
            const Icon = whyIconMap[card.iconName];
            const variant = whyIconVariants[index % whyIconVariants.length];
            return (<article className="why-card" key={card.title}>
                <span className={`why-icon why-icon--${variant}`} aria-hidden="true">
                  <Icon />
                </span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>);
        })}
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="section-heading">
          <h2>{landingLabels.pricing.title}</h2>
          <p className="pricing-note">
            {landingLabels.pricing.note}
          </p>
          {checkoutError && <p className="form-error">{checkoutError}</p>}
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
          {pricing.map(([tier, reports, price, features]) => (<article className={tier === "Buyer" ? "price-card featured" : "price-card"} key={tier}>
              <p>{tier}</p>
              <h3>{reports}</h3>
              <strong>{price}</strong>
              <ul className="price-features">
                {features.map((feature) => (<li key={feature}>{feature}</li>))}
              </ul>
              <button type="button" className={`button ${tier === "Buyer" ? "primary" : "secondary"}`} onClick={() => startCheckout(tier)} disabled={checkout.isPending}>
                {checkout.isPending ? "Connecting..." : tier === "Protected" ? "Get Protected" : "Ask Ralph"}
              </button>
            </article>))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="section-heading">
          <h2>{landingLabels.about.title}</h2>
        </div>
        <p className="about-intro">{aboutIntro}</p>
        <div className="about-mobile-toc" aria-label="">
          {aboutSections.map((section) => (<a key={section.id} href={`#${section.id}`}>
              {section.heading}
            </a>))}
        </div>
        <div className="about-layout">
          <nav className="about-toc" aria-label="e">

            {aboutSections.map((section) => (<a key={section.id} href={`#${section.id}`}>
                <ChevronRight aria-hidden="true"/>
                <span>{section.heading}</span>
              </a>))}
          </nav>
          <div className="about-content">
            {aboutSections.map((section) => (<article key={section.id} id={section.id} className="about-article">
                <h3>{section.heading}</h3>
                <p>{section.body}</p>
              </article>))}
          </div>
        </div>
      </section>

      <div className="faqs-bridge">
        <h2>{landingLabels.pricing.title}</h2>
      </div>

      <section className="faqs-section" id="faqs">
        <div className="section-heading">
          <h2>{landingLabels.faqs.title}</h2>
        </div>
        <ul className="faqs-list">
          {faqs.map((faq) => (<li key={faq.question}>
              <details className="faqs-item">
                <summary>{faq.question}</summary>
                <div className="faqs-item-body">{faq.answer}</div>
              </details>
            </li>))}
        </ul>
      </section>


      <nav className="mobile-anchor-bar" aria-label="Quick section navigation">
        <a href="#check">Check</a>
        <a href="#why">Why</a>
        <a href="#pricing">Pricing</a>
        <a href="#faqs">FAQs</a>
      </nav>
    </main>);
}
