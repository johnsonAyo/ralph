"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  Image as ImageIcon,
  MapPinned,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

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
  ["Expert review", "Could help"],
] as const;

const reasons = [
  {
    level: "Major",
    title: "The front-left damage may need more than cosmetic work",
    evidence: "Photos, damage field, and wheel angle all point to possible suspension or alignment work.",
  },
  {
    level: "Watch",
    title: "Ralph thinks the budget is workable only if bidding stays controlled",
    evidence: "The current bid still leaves a narrow but real bidding window before Ralph's suggested skip point.",
  },
  {
    level: "Helpful",
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
  "Open expert review if the suspension area still feels unclear.",
] as const;

const drawerToc = [
  { id: "reasons", label: "Reasons" },
  { id: "noticed", label: "Photos" },
  { id: "repairs", label: "Repairs" },
  { id: "budget", label: "Budget" },
  { id: "verify", label: "Missing info" },
] as const;

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

function DrawerContent({ drawer, onJump }: { drawer: DrawerId; onJump: (next: DrawerId) => void }) {
  switch (drawer) {
    case "summary":
      return (
        <div className="report-drawer-stack">
          <div className="report-drawer-summary">
            Ralph does not dodge the decision. This car stays in the Consider below £1,850 lane because the visible damage can still fit, but only with controlled bidding and enough repair headroom.
          </div>

          <div className="report-drawer-toc">
            {drawerToc.map((item) => (
              <button key={item.id} type="button" onClick={() => onJump(item.id)} className="report-toc-chip">
                {item.label}
              </button>
            ))}
          </div>

          <DrawerAccordion title="Why Ralph says this" defaultOpen>
            <ul className="report-bullet-list">
              {reasons.map((reason) => (
                <li key={reason.title}>
                  <strong>{reason.level}</strong>
                  <span>{reason.title}</span>
                </li>
              ))}
            </ul>
          </DrawerAccordion>

          <DrawerAccordion title="What Ralph noticed">
            <div className="report-photo-strip report-photo-strip-drawer">
              {noticed.map((item) => (
                <figure key={item.photo} className="report-photo-tile">
                  <div className="report-photo-tile-art" />
                  <figcaption>
                    <strong>{item.photo}</strong>
                    <span>{item.title}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </DrawerAccordion>

          <DrawerAccordion title="Repair allowance">
            <p className="report-drawer-copy">
              Ralph allowed £700 - £1,200 because the visible damage may need bumper, headlight, paint, and a suspension check.
            </p>
          </DrawerAccordion>

          <DrawerAccordion title="Budget fit">
            <p className="report-drawer-copy">
              The budget stays in play only if bidding remains controlled. If the price moves too quickly, Ralph would advise skipping rather than forcing the fit.
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
              <button key={item.id} type="button" onClick={() => onJump(item.id)} className="report-toc-chip">
                {item.label}
              </button>
            ))}
          </div>
          <div className="report-reason-list">
            {reasons.map((reason) => (
              <article key={reason.title} className="report-reason">
                <span className={`report-severity ${reason.level.toLowerCase()}`}>{reason.level}</span>
                <strong>{reason.title}</strong>
                <p>{reason.evidence}</p>
              </article>
            ))}
          </div>
        </div>
      );
    case "noticed":
      return (
        <div className="report-drawer-stack">
          <div className="report-drawer-summary">
            Ralph is not just restating the listing. The photos matter because they change the repair allowance and the confidence around hidden work.
          </div>
          <DrawerAccordion title="Photo clues" defaultOpen>
            <div className="report-photo-strip report-photo-strip-drawer">
              {noticed.map((item) => (
                <figure key={item.photo} className="report-photo-tile">
                  <div className="report-photo-tile-art" />
                  <figcaption>
                    <strong>{item.photo}</strong>
                    <span>{item.title}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </DrawerAccordion>
          <DrawerAccordion title="What Ralph noticed">
            <ul className="report-bullet-list">
              {noticed.map((item) => (
                <li key={item.photo}>
                  <strong>{item.title}</strong>
                  <span>{item.note}</span>
                </li>
              ))}
            </ul>
          </DrawerAccordion>
        </div>
      );
    case "repairs":
      return (
        <div className="report-drawer-stack">
          <div className="report-drawer-summary">
            Ralph allowed a repair range rather than a quote because the photos can hint at work, but they cannot verify the full cost.
          </div>
          <DrawerAccordion title="Likely work" defaultOpen>
            <div className="report-chip-grid">
              {repairWork.map((item) => (
                <span key={item} className="report-inline-chip">
                  {item}
                </span>
              ))}
            </div>
          </DrawerAccordion>
          <DrawerAccordion title="Checks Ralph would not ignore">
            <div className="report-chip-grid">
              {hiddenChecks.map((item) => (
                <span key={item} className="report-inline-chip muted">
                  {item}
                </span>
              ))}
            </div>
          </DrawerAccordion>
          <DrawerAccordion title="What the allowance means">
            <p className="report-drawer-copy">
              The range is an allowance, not a mechanic quote. It is meant to protect the user from being surprised by paint, panel, or alignment work after the auction.
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
          <DrawerAccordion title="Budget assumptions" defaultOpen>
            <ul className="report-bullet-list">
              <li>
                <strong>Fees:</strong>
                <span>auction and admin costs can move the total quickly.</span>
              </li>
              <li>
                <strong>Delivery:</strong>
                <span>the quote matters more when the car cannot be driven home.</span>
              </li>
              <li>
                <strong>Repairs:</strong>
                <span>Ralph keeps room for work that is visible and work that is not.</span>
              </li>
            </ul>
          </DrawerAccordion>
          <DrawerAccordion title="How Ralph interprets the budget">
            <p className="report-drawer-copy">
              Your budget available to buy, move, and fix the car is the total money that has to survive the auction price, moving cost, and repairs. Ralph uses the lower end as comfortable and the upper end as the limit.
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
              {missingInfo.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </DrawerAccordion>
          <DrawerAccordion title="Listing details Ralph used">
            <ul className="report-bullet-list">
              <li>
                <span>Listing title, auction site, current bid, and photo set formed the surface report.</span>
              </li>
              <li>
                <span>The auction platform influenced the fee assumptions and the way Ralph framed the risk.</span>
              </li>
              <li>
                <span>Registration data would expand the MOT/history layer when available.</span>
              </li>
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
          <DrawerAccordion title="When expert review helps" defaultOpen>
            <ul className="report-bullet-list">
              <li>
                <strong>Could help:</strong>
                <span>the front-left wheel area is not fully clear.</span>
              </li>
              <li>
                <strong>Could help:</strong>
                <span>the budget fit is workable but still tight enough to matter.</span>
              </li>
              <li>
                <strong>Strongly worth considering:</strong>
                <span>the verdict depends on whether the damage is cosmetic or deeper.</span>
              </li>
            </ul>
          </DrawerAccordion>
          <DrawerAccordion title="Expert options">
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

function Drawer({ drawer, onClose, onJump }: { drawer: DrawerId; onClose: () => void; onJump: (next: DrawerId) => void }) {
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
                  : drawer === "noticed"
                    ? "What Ralph noticed"
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

        <DrawerContent drawer={drawer} onJump={onJump} />
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

export default function ReportPreview() {
  const [activeDrawer, setActiveDrawer] = useState<DrawerId | null>(null);

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
                onAction={() => setActiveDrawer("reasons")}
              >
                <div className="report-reason-list">
                  {reasons.map((reason) => (
                    <article className="report-reason" key={reason.title}>
                      <span className={`report-severity ${reason.level.toLowerCase()}`}>{reason.level}</span>
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
                  <div className="report-expert-pill soft">Not needed right now if the damage is clearly cosmetic</div>
                  <div className="report-expert-pill strong">Strongly worth considering if the wheel area stays unclear</div>
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
