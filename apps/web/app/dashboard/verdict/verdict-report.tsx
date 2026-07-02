"use client";

import { ReactNode } from "react";
import { Image as ImageIcon, MapPinned, Wrench } from "lucide-react";
import type { VehicleVerdictReport } from "@ralph/shared";
import { FindingTone } from "@ralph/shared";
import { ListingGallery, type GalleryImageData } from "../../components/listing-gallery";

type SectionProps = {
  id: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
};


function money(value: unknown): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isFinite(n) ? `£${n.toLocaleString("en-GB")}` : "—";
}

function SectionPanel({ id, title, subtitle, className, children }: SectionProps) {
  return (
    <section className={`report-panel ${className ?? ""}`} id={id}>
      <div className="report-panel-head">
        <div>
          <h4>{title}</h4>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function VerdictReport({ report }: { report: VehicleVerdictReport; onReset?: () => void }) {
  const { result, profile, request } = report;

  // Real vehicle photos: prefer the scraped listing, fall back to the buyer's
  // manually uploaded shots.
  const galleryImages: GalleryImageData[] =
    ((report.listing?.images as GalleryImageData[] | undefined)?.length
      ? (report.listing!.images as GalleryImageData[])
      : (request.manual?.images as GalleryImageData[] | undefined)) ?? [];

  const title =
    [profile?.identity.yearOfManufacture, profile?.identity.make, profile?.identity.model].filter(Boolean).join(" ") ||
    [request.manual?.year, request.manual?.make, request.manual?.model].filter(Boolean).join(" ") ||
    report.listing?.title ||
    "Vehicle";

  const reportNav = [
    ...(result.priceGuidance ? [{ href: "#report-bid-limit", label: "Bid limit" }] : []),
    { href: "#report-reasons", label: "Reasons" },
    { href: "#report-repairs", label: "Repairs" },
    { href: "#report-verify", label: "Verify" },
    { href: "#report-before-bid", label: "Before you bid" },
  ] as const;

  const summaryChips = [
    ["Budget fit", result.budgetFit.rating],
    ["Ralph's certainty", result.confidence],
  ] as const;

  const askingPriceFormatted = request.askingPrice ? money(request.askingPrice) : money(result.valueEstimate.typicalPriceHigh);
  const totalBudgetFormatted = money(request.totalBudget);

  return (
    <div className="flex flex-col gap-5 pb-12">
      <article className="report-artifact" aria-label="Ralph report">
        <div className="report-shell">
          <div className="report-main">
            <section className="report-hero">
              <div className="report-hero-media">
                <h3 className="report-hero-name">{title}</h3>
                {report.sources.includes("listing" as any) && (
                  <div className="report-photo-badge">
                    <ImageIcon size={14} aria-hidden="true" />
                    <span>Listing photo used</span>
                  </div>
                )}
                <ListingGallery images={galleryImages} alt={title} />
              </div>

              <div className="report-hero-copy">
                <div className="report-topline">
                  <span>{request.sourceType || "Private Sale"}</span>
                  <span className="report-topline-dot">•</span>
                  <MapPinned size={14} aria-hidden="true" />
                  <span>{request.postcode ? `Postcode: ${request.postcode}` : "Location unknown"}</span>
                </div>

                <div className="report-verdict-panel">
                  <span className="report-verdict-kicker">Verdict</span>
                  <strong>{result.headline}</strong>
                  <p>{result.summary}</p>
                </div>

                <div className="report-header-grid">
                  <div className="report-header-value">
                    <span>Price / Target</span>
                    <strong>{askingPriceFormatted}</strong>
                  </div>
                  <div className="report-header-value">
                    <span>Total Budget</span>
                    <strong>{totalBudgetFormatted}</strong>
                  </div>
                </div>

                <div className="report-summary-chip-row">
                  {summaryChips.map(([label, value]) => (
                    <div className="report-summary-chip" key={label}>
                      <span>{label}</span>
                      <strong className="capitalize">{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="report-dock">
              <div className="report-sticky-summary">
                <div className="report-sticky-item">
                  <span>Verdict</span>
                  <strong className="truncate" title={result.headline}>{result.headline}</strong>
                </div>
                {result.priceGuidance && result.priceGuidance.maxSensible && (
                  <div className="report-sticky-item">
                    <span>Target</span>
                    <strong>{money(result.priceGuidance.maxSensible)}</strong>
                  </div>
                )}
                <div className="report-sticky-item">
                  <span>Certainty</span>
                  <strong className="capitalize">{result.confidence}</strong>
                </div>
                <div className="report-sticky-item">
                  <span>Budget</span>
                  <strong className="capitalize">{result.budgetFit.rating}</strong>
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
              {result.priceGuidance && (
                <SectionPanel
                  id="report-bid-limit"
                  title={result.priceGuidance.framing || "Price limit"}
                  subtitle={result.priceGuidance.note}
                  className="span-2"
                >
                  <div className="report-bid-line">
                    <div className="report-bid-line-row highlight">
                      <span>Max sensible</span>
                      <strong>{money(result.priceGuidance.maxSensible)}</strong>
                    </div>
                    {result.priceGuidance.walkAwayAbove && (
                      <div className="report-bid-line-row muted">
                        <span>Walk away above</span>
                        <strong>{money(result.priceGuidance.walkAwayAbove)}</strong>
                      </div>
                    )}
                  </div>
                </SectionPanel>
              )}

              {result.findings.length > 0 && (
                <SectionPanel
                  id="report-reasons"
                  title="Why Ralph says this"
                  subtitle="The reasons behind the verdict"
                >
                  <div className="report-reason-list">
                    {result.findings.map((reason, idx) => (
                      <article className="report-reason" key={idx}>
                        <span className={`report-severity ${reason.tone === FindingTone.Good ? 'helpful' : 'watch'}`}>
                          {reason.tone === FindingTone.Good ? "Helpful" : "Watch"}
                        </span>
                        <strong>{reason.title}</strong>
                        <p>{reason.evidence}</p>
                      </article>
                    ))}
                  </div>
                </SectionPanel>
              )}

              <SectionPanel
                id="report-repairs"
                title="Repair allowance Ralph used"
                subtitle="What Ralph allowed for, not a quote"
              >
                <div className="report-repair-panel">
                  <div className="report-repair-range">
                    <Wrench size={16} aria-hidden="true" />
                    <span>Ralph allowed</span>
                    <strong>{money(result.runningCost.nearTermRepairLow)} - {money(result.runningCost.nearTermRepairHigh)}</strong>
                  </div>
                  <p className="report-section-note">{result.runningCost.note}</p>
                </div>
              </SectionPanel>

              {result.couldNotVerify.length > 0 && (
                <SectionPanel
                  id="report-verify"
                  title="What Ralph could not verify"
                  subtitle="The missing bits that affect certainty"
                >
                  <ul className="report-check-list">
                    {result.couldNotVerify.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </SectionPanel>
              )}

              {result.whatToCheck.length > 0 && (
                <SectionPanel
                  id="report-before-bid"
                  title="Before you commit"
                  subtitle="A short reminder before the pressure starts"
                  className="span-2"
                >
                  <ol className="report-check-list ordered">
                    {result.whatToCheck.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ol>
                </SectionPanel>
              )}

              <SectionPanel
                id="report-expert"
                title="Expert review"
                subtitle="Only where the uncertainty really matters"
                className="span-2"
              >
                <div className="report-expert-surface">
                  <div className="report-expert-pill could-help">Could help</div>
                  <div className="report-expert-pill soft">Not needed right now if the damage is clearly cosmetic</div>
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
    </div>
  );
}
