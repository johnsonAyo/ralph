"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Image as ImageIcon,
  MapPinned,
  Sparkles,
  Wrench,
} from "lucide-react";
import { reportPreviewLabels } from "../../labels";
import SectionPanel from "./section-panel";
import ReportPhotoFrame from "./photo-frame";
import Drawer, { DrawerId } from "./drawer";

export default function ReportPreview() {
  const [activeDrawer, setActiveDrawer] = useState<DrawerId | null>(null);
  const { nav, summaryChips, reasons, noticed, repairWork, hiddenChecks, missingInfo, beforeBid } =
    reportPreviewLabels;

  useEffect(() => {
    if (!activeDrawer) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDrawer(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeDrawer]);

  return (
    <>
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
                    Ralph thinks this is possible if bidding stays controlled because the front-left
                    damage may need more than cosmetic work.
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

                <button
                  type="button"
                  className="report-hero-drill"
                  onClick={() => setActiveDrawer("summary")}
                >
                  <Sparkles size={16} aria-hidden="true" />
                  <span>See how Ralph got this</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
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
                {nav.map((item) => (
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
                <p className="report-section-note">
                  If bidding moves fast, use Ralph's range before increasing your bid.
                </p>
              </SectionPanel>

              <SectionPanel
                id="report-reasons"
                title="Why Ralph says this"
                subtitle="The reasons behind the verdict"
                onAction={() => setActiveDrawer("reasons")}
              >
                <div className="report-reason-list">
                  {reasons.map((reason) => (
                    <article className="report-reason" key={reason.title}>
                      <span className={`report-severity ${reason.level.toLowerCase()}`}>
                        {reason.level}
                      </span>
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
                onAction={() => setActiveDrawer("noticed")}
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
                  {noticed.slice(0, 2).map((item) => (
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
                onAction={() => setActiveDrawer("repairs")}
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
                onAction={() => setActiveDrawer("verify")}
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
                title="Expert review"
                subtitle="Only where the uncertainty really matters"
                onAction={() => setActiveDrawer("expert")}
                className="span-2"
              >
                <div className="report-expert-surface">
                  <div className="report-expert-pill could-help">Could help</div>
                  <div className="report-expert-pill soft">
                    Not needed right now if the damage is clearly cosmetic
                  </div>
                  <div className="report-expert-pill strong">
                    Strongly worth considering if the wheel area stays unclear
                  </div>
                </div>
              </SectionPanel>

              <SectionPanel
                id="report-follow-up"
                title="After auction follow-up"
                subtitle="What happened with this listing?"
                className="span-2"
              >
                <div className="report-followup-actions">
                  <button type="button" className="report-followup-button">
                    I skipped it
                  </button>
                  <button type="button" className="report-followup-button">
                    I bid but lost
                  </button>
                  <button type="button" className="report-followup-button primary">
                    I won it
                  </button>
                  <button type="button" className="report-followup-button">
                    I'm still deciding
                  </button>
                </div>
              </SectionPanel>
            </div>
          </div>
        </div>
      </article>

      {activeDrawer ? (
        <Drawer
          drawer={activeDrawer}
          onClose={() => setActiveDrawer(null)}
          onJump={(next) => setActiveDrawer(next)}
        />
      ) : null}
    </>
  );
}
