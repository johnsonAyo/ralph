"use client";
import "./report-preview.css";

import { Image as ImageIcon, MapPinned, Wrench } from "lucide-react";

type SectionProps = {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
};

const reportNav = [
  { href: "#report-bid-limit", label: "Bid limit" },
  { href: "#report-reasons", label: "Reasons" },
  { href: "#report-noticed", label: "Noticed" },
  { href: "#report-repairs", label: "Repairs" },
  { href: "#report-verify", label: "Verify" },
  { href: "#report-before-bid", label: "Before you bid" },
] as const;

const summaryChips = [
  ["Budget fit", "Tight but possible"],
  ["Ralph's certainty", "Medium"],
  ["Main concern", "Front-left impact"],
] as const;

const reasons = [
  {
    level: "Worth checking",
    title: "The front-left damage may need more than cosmetic work",
    evidence: "Photos, damage field, and wheel angle all point to possible suspension or alignment work.",
  },
  {
    level: "Worth checking",
    title: "Ralph thinks the budget is workable only if bidding stays controlled",
    evidence: "The current bid still leaves a narrow but real bidding window before Ralph's suggested skip point.",
  },
  {
    level: "Good sign",
    title: "The mileage pattern looks steady enough to support the report",
    evidence: "Visible history does not show an obvious mileage jump, which helps confidence without proving condition.",
  },
] as const;

const noticed = [
  {
    photo: "Photo 4",
    title: "Front-left corner",
    note: "Ralph would not treat this as a simple bumper-only repair because the wheel area is not fully clear.",
  },
  {
    photo: "Photo 6",
    title: "Headlight and wing",
    note: "The gap pattern suggests paint and panel work may be part of the real repair allowance.",
  },
  {
    photo: "Photo 8",
    title: "Wheel stance",
    note: "The wheel angle makes suspension and alignment checks hard to dismiss.",
  },
] as const;

const repairWork = [
  "bumper / trim",
  "headlight",
  "paint blending",
  "wheel or suspension check",
] as const;

const hiddenChecks = [
  "suspension alignment",
  "radiator support",
  "wheel area",
] as const;

const missingInfo = [
  "Final delivery quote is not locked unless you enter it.",
  "Ralph could not verify the suspension area from the available photos.",
  "A missing registration number would stop MOT history from being checked.",
] as const;

const beforeBid = [
  "Confirm the auction delivery quote before increasing the bid.",
  "Recheck the front-left wheel area in the listing photos.",
  "Use Ralph's suggested skip point if bidding moves fast.",
] as const;

function SectionPanel({ id, title, subtitle, className, children }: SectionProps) {
  return (
    <section className={`report-panel ${className ?? ""}`} id={id}>
      <div className="report-panel-head">
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function ReportPhotoFrame() {
  return (
    <figure className="report-photo-tile report-photo-tile-hero">
      <div className="report-photo-tile-art">
        <div className="report-photo-body" />
        <div className="report-photo-wheels">
          <span />
          <span />
        </div>
        <div className="report-photo-window" />
        <div className="report-photo-glow" />
      </div>
    </figure>
  );
}

export default function ReportPreview() {
  return (
    <article className="report-artifact" aria-label="Sample Ralph report">
      <div className="report-shell">
        <div className="report-main">
          <section className="report-hero">
            <div className="report-hero-media">
              <h3 className="report-hero-name">Ford Focus 1.0 EcoBoost, CAT S</h3>
              <div className="report-photo-badge">
                <ImageIcon size={14} aria-hidden="true" />
                <span>Listing photo used</span>
              </div>
              <ReportPhotoFrame />
            </div>

            <div className="report-hero-copy">
              <div className="report-topline">
                <span>Copart UK</span>
                <span className="report-topline-dot">•</span>
                <MapPinned size={14} aria-hidden="true" />
                <span>Auction site: Nottingham</span>
              </div>

              <div className="report-verdict-panel">
                <span className="report-verdict-kicker">Verdict</span>
                <strong>Consider below £1,850</strong>
                <p>
                  Ralph thinks this is possible if bidding stays controlled because the front-left damage may need more than cosmetic work.
                </p>
              </div>

              <div className="report-header-grid">
                <div className="report-header-value">
                  <span>Current bid</span>
                  <strong>£2,150</strong>
                </div>
                <div className="report-header-value">
                  <span>Budget available to buy, move, and fix</span>
                  <strong>£3,500 - £4,500</strong>
                </div>
              </div>

              <div className="report-summary-chip-row">
                {summaryChips.map(([label, value]) => (
                  <div className="report-summary-chip" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="report-dock">
            <div className="report-sticky-summary">
              <div className="report-sticky-item">
                <span>Verdict</span>
                <strong>Consider below £1,850</strong>
              </div>
              <div className="report-sticky-item">
                <span>Target range</span>
                <strong>£1,600 - £1,850</strong>
              </div>
              <div className="report-sticky-item">
                <span>Certainty</span>
                <strong>Medium</strong>
              </div>
              <div className="report-sticky-item">
                <span>Current bid</span>
                <strong>£2,150</strong>
              </div>
            </div>

            <nav className="report-mini-nav" aria-label="Report sections">
              {reportNav.map((item) => (
                <a key={item.label} href={item.href} className="report-mini-chip">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="report-sections">
            <SectionPanel
              id="report-bid-limit"
              title="Bid limit"
              subtitle="What Ralph would advise when the auction starts moving"
              className="span-2"
            >
              <div className="report-bid-line">
                <div className="report-bid-line-row">
                  <span>Current bid</span>
                  <strong>£2,150</strong>
                </div>
                <div className="report-bid-line-row highlight">
                  <span>Ralph's target range</span>
                  <strong>£1,600 - £1,850</strong>
                </div>
                <div className="report-bid-line-row">
                  <span>Ralph would advise skipping above</span>
                  <strong>£1,900</strong>
                </div>
                <div className="report-bid-line-row muted">
                  <span>Room before Ralph would advise skipping</span>
                  <strong>£600</strong>
                </div>
              </div>
              <p className="report-section-note">If bidding moves fast, use Ralph's range before increasing your bid.</p>
            </SectionPanel>

            <SectionPanel
              id="report-reasons"
              title="Why Ralph says this"
              subtitle="The reasons behind the verdict"
            >
              <div className="report-reason-list">
                {reasons.map((reason) => (
                  <article className="report-reason" key={reason.title}>
                    <span className={`report-severity ${reason.level === "Good sign" ? "good" : "watch"}`}>{reason.level}</span>
                    <strong>{reason.title}</strong>
                    <p>{reason.evidence}</p>
                  </article>
                ))}
              </div>
            </SectionPanel>

            <SectionPanel
              id="report-noticed"
              title="What Ralph noticed"
              subtitle="What changed Ralph's view"
            >
              <div className="report-photo-strip">
                {noticed.map((item) => (
                  <figure className="report-photo-tile" key={item.photo}>
                    <div className="report-photo-tile-art" />
                    <figcaption>
                      <strong>{item.photo}</strong>
                      <span>{item.title}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div className="report-notice-list">
                {noticed.map((item) => (
                  <p key={item.photo}>
                    <strong>{item.title}:</strong> {item.note}
                  </p>
                ))}
              </div>
            </SectionPanel>

            <SectionPanel
              id="report-repairs"
              title="Repair allowance Ralph used"
              subtitle="What Ralph allowed for, not a quote"
            >
              <div className="report-repair-panel">
                <div className="report-repair-range">
                  <Wrench size={16} aria-hidden="true" />
                  <span>Ralph allowed</span>
                  <strong>£700 - £1,200</strong>
                </div>
                <div className="report-chip-grid">
                  {repairWork.map((item) => (
                    <span className="report-inline-chip" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
                <div className="report-chip-grid">
                  {hiddenChecks.map((item) => (
                    <span className="report-inline-chip muted" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
                <p className="report-section-note">Treat this as an allowance, not a repair quote.</p>
              </div>
            </SectionPanel>

            <SectionPanel
              id="report-verify"
              title="What Ralph could not verify"
              subtitle="The missing bits that affect certainty"
            >
              <ul className="report-check-list">
                {missingInfo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </SectionPanel>

            <SectionPanel
              id="report-before-bid"
              title="Before you bid"
              subtitle="A short reminder before the pressure starts"
              className="span-2"
            >
              <ol className="report-check-list ordered">
                {beforeBid.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </SectionPanel>

            <SectionPanel
              id="report-expert"
              title="Want a second opinion?"
              subtitle="A reviewer can look at the photos with you"
              className="span-2"
            >
              <p className="report-section-note">
                Worth it mainly if the front-left wheel area still feels unclear from the photos alone.
              </p>
              <button type="button" className="report-followup-button primary">
                Request expert review
              </button>
            </SectionPanel>
          </div>
        </div>
      </div>
    </article>
  );
}
