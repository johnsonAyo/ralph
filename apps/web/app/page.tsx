"use client";
import { Camera, FileSearch, Receipt, ShieldCheck, Target, Users, } from "lucide-react";
import { Button } from "@ralph/ui";
import { getStripeLookupKey } from "./lib/site-url";
import { landingLabels } from "./labels";
import { pricing, aiInputs, reportAnswers, faqs, whyUseCards, } from "./constants";
import { useSession } from "./lib/supabase";
import { useCheckout } from "./lib/use-checkout";
import { HomeShellSkeleton } from "./components/skeleton";
import CTA from "./components/cta";
import PublicRegCheck from "./components/public-reg-check";
import RalphCinema from "./components/ralph-cinema";
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
        <RalphCinema />

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
          <PublicRegCheck />
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
              <Button type="button" variant={tier === "Buyer" ? "gold" : "primary"} onClick={() => startCheckout(tier)} disabled={checkout.isPending} className="mt-auto w-full">
                {checkout.isPending ? "Connecting..." : tier === "Protected" ? "Get Protected" : "Ask Ralph"}
              </Button>
            </article>))}
        </div>
      </section>

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
