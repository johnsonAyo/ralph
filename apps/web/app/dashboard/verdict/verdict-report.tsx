"use client";

import { ReactNode, useEffect, useState } from "react";
import { ArrowRight, ChevronRight, Image as ImageIcon, MapPinned, Sparkles, Wrench, X } from "lucide-react";
import type { VehicleVerdictReport } from "@ralph/shared";
import { FindingTone } from "@ralph/shared";

type DrawerId = "summary" | "reasons" | "noticed" | "repairs" | "budget" | "verify" | "expert";

type SectionProps = {
  id: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  className?: string;
};

type AccordionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};


function money(value: unknown): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isFinite(n) ? `£${n.toLocaleString("en-GB")}` : "—";
}

function SectionPanel({ id, title, subtitle, actionLabel = "See how Ralph got this", onAction, className, children }: SectionProps) {
  return (
    <section className={`report-panel ${className ?? ""}`} id={id}>
      <div className="report-panel-head">
        <div>
          <h4>{title}</h4>
          <p>{subtitle}</p>
        </div>
        {onAction ? (
          <button className="report-drill-link" type="button" onClick={onAction} aria-label={`${actionLabel} for ${title}`}>
            <span>{actionLabel}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function DrawerAccordion({ title, defaultOpen, children }: AccordionProps) {
  return (
    <details className="report-accordion" open={defaultOpen}>
      <summary>{title}</summary>
      <div className="report-accordion-body">{children}</div>
    </details>
  );
}

function DrawerContent({ drawer, report, onJump }: { drawer: DrawerId; report: VehicleVerdictReport; onJump: (next: DrawerId) => void }) {
  const { result } = report;
  const drawerToc = [
    { id: "reasons", label: "Reasons" },
    { id: "repairs", label: "Repairs" },
    { id: "budget", label: "Budget" },
    { id: "verify", label: "Missing info" },
  ] as const;

  switch (drawer) {
    case "summary":
      return (
        <div className="report-drawer-stack">
          <div className="report-drawer-summary">
            {result.summary}
          </div>

          <div className="report-drawer-toc">
            {drawerToc.map((item) => (
              <button key={item.id} type="button" onClick={() => onJump(item.id as any)} className="report-toc-chip">
                {item.label}
              </button>
            ))}
          </div>

          <DrawerAccordion title="Why Ralph says this" defaultOpen>
            <ul className="report-bullet-list">
              {result.findings.map((reason, idx) => (
                <li key={idx}>
                  <strong>{reason.tone === FindingTone.Good ? "Helpful" : "Watch"}</strong>
                  <span>{reason.title}</span>
                </li>
              ))}
            </ul>
          </DrawerAccordion>

          <DrawerAccordion title="Repair allowance">
            <p className="report-drawer-copy">
              {result.runningCost.note}
            </p>
          </DrawerAccordion>

          <DrawerAccordion title="Budget fit">
            <p className="report-drawer-copy">
              {result.budgetFit.note}
            </p>
          </DrawerAccordion>
        </div>
      );
    case "reasons":
      return (
        <div className="report-drawer-stack">
          <div className="report-drawer-summary">
            Ralph's reason is a mix of vehicle uncertainty and money pressure. The report is not saying the car is broken; it is saying the visible clues do not justify loose bidding.
          </div>
          <div className="report-drawer-toc">
            {drawerToc.map((item) => (
              <button key={item.id} type="button" onClick={() => onJump(item.id as any)} className="report-toc-chip">
                {item.label}
              </button>
            ))}
          </div>
          <div className="report-reason-list">
            {result.findings.map((reason, idx) => (
              <article key={idx} className="report-reason">
                <span className={`report-severity ${reason.tone === FindingTone.Good ? 'helpful' : 'watch'}`}>
                  {reason.tone === FindingTone.Good ? "Helpful" : "Watch"}
                </span>
                <strong>{reason.title}</strong>
                <p>{reason.evidence}</p>
              </article>
            ))}
          </div>
        </div>
      );
    case "repairs":
      return (
        <div className="report-drawer-stack">
          <div className="report-drawer-summary">
            Ralph allowed a repair range rather than a quote because the photos can hint at work, but they cannot verify the full cost.
          </div>
          <DrawerAccordion title="What the allowance means" defaultOpen>
            <p className="report-drawer-copy">
              {result.runningCost.note}
            </p>
          </DrawerAccordion>
        </div>
      );
    case "budget":
      return (
        <div className="report-drawer-stack">
          <div className="report-drawer-summary">
            Budget fit is only useful when it is tied back to the vehicle. Ralph keeps the surface simple and hides the arithmetic unless the user wants the rabbit hole.
          </div>
          <DrawerAccordion title="How Ralph interprets the budget" defaultOpen>
            <p className="report-drawer-copy">
              {result.budgetFit.note}
            </p>
          </DrawerAccordion>
        </div>
      );
    case "verify":
      return (
        <div className="report-drawer-stack">
          <div className="report-drawer-summary">
            Ralph tells you what could not be verified because the missing information affects certainty, not because the report wants to sound cautious.
          </div>
          <DrawerAccordion title="What Ralph could not verify" defaultOpen>
            <ul className="report-bullet-list">
              {result.couldNotVerify.map((item, idx) => (
                <li key={idx}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </DrawerAccordion>
        </div>
      );
    case "expert":
      return (
        <div className="report-drawer-stack">
          <div className="report-drawer-summary">
            Expert review is not the main verdict. It is the extra confidence layer when the photos leave a real judgement gap.
          </div>
          <DrawerAccordion title="Expert options" defaultOpen>
            <div className="report-expert-options">
              <button type="button" className="report-expert-btn">
                Standard review <span>within 24h</span>
              </button>
              <button type="button" className="report-expert-btn primary">
                Priority review <span>within 4h</span>
              </button>
            </div>
          </DrawerAccordion>
        </div>
      );
    default:
      return null;
  }
}

function Drawer({ drawer, report, onClose, onJump }: { drawer: DrawerId; report: VehicleVerdictReport; onClose: () => void; onJump: (next: DrawerId) => void }) {
  return (
    <div className="report-drawer-overlay" role="presentation" onClick={onClose}>
      <aside
        className="report-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Ralph report reasoning"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="report-drawer-grip" />
        <header className="report-drawer-header">
          <div>
            <div className="report-drawer-kicker">See how Ralph got this</div>
            <h3>
              {drawer === "summary"
                ? "Start here"
                : drawer === "reasons"
                  ? "Why Ralph says this"
                  : drawer === "repairs"
                    ? "Repair allowance Ralph used"
                    : drawer === "budget"
                      ? "Budget fit"
                      : drawer === "verify"
                        ? "What Ralph could not verify"
                        : "Expert review"}
            </h3>
          </div>
          <button type="button" className="report-drawer-close" onClick={onClose}>
            <X size={16} aria-hidden="true" />
            <span>Close</span>
          </button>
        </header>

        <DrawerContent drawer={drawer} report={report} onJump={onJump} />
      </aside>
    </div>
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

export function VerdictReport({ report, onReset }: { report: VehicleVerdictReport; onReset: () => void }) {
  const [activeDrawer, setActiveDrawer] = useState<DrawerId | null>(null);

  useEffect(() => {
    if (!activeDrawer) return;

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

  const { result, profile, request } = report;

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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-foreground">Your MOT Check</h1>
        <button onClick={onReset} className="text-sm font-bold text-[var(--blue)] hover:underline">Check another</button>
      </div>

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
                <ReportPhotoFrame />
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

                <button type="button" className="report-hero-drill" onClick={() => setActiveDrawer("summary")}>
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
                  onAction={() => setActiveDrawer("reasons")}
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
                onAction={() => setActiveDrawer("repairs")}
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
                  onAction={() => setActiveDrawer("verify")}
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
                onAction={() => setActiveDrawer("expert")}
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

      {activeDrawer ? (
        <Drawer
          drawer={activeDrawer}
          report={report}
          onClose={() => setActiveDrawer(null)}
          onJump={(next) => setActiveDrawer(next)}
        />
      ) : null}
    </div>
  );
}
