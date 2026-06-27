import { ReactNode } from "react";
import { X } from "lucide-react";
import { reportPreviewLabels } from "../../labels";
export type DrawerId = "summary" | "reasons" | "noticed" | "repairs" | "budget" | "verify" | "expert";
type AccordionProps = {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
};
export function DrawerAccordion({ title, defaultOpen, children }: AccordionProps) {
    return (<details className="report-accordion" open={defaultOpen}>
      <summary>{title}</summary>
      <div className="report-accordion-body">{children}</div>
    </details>);
}
function DrawerContent({ drawer, onJump }: {
    drawer: DrawerId;
    onJump: (next: DrawerId) => void;
}) {
    const { reasons, noticed, repairWork, hiddenChecks, missingInfo, drawerToc, drawers } = reportPreviewLabels;
    switch (drawer) {
        case "summary":
            return (<div className="report-drawer-stack">
          <div className="report-drawer-summary">{drawers.summaryText}</div>

          <div className="report-drawer-toc">
            {drawerToc.map((item) => (<button key={item.id} type="button" onClick={() => onJump(item.id as DrawerId)} className="report-toc-chip">
                {item.label}
              </button>))}
          </div>

          <DrawerAccordion title="Why Ralph says this" defaultOpen>
            <ul className="report-bullet-list">
              {reasons.map((reason) => (<li key={reason.title}>
                  <strong>{reason.level}</strong>
                  <span>{reason.title}</span>
                </li>))}
            </ul>
          </DrawerAccordion>

          <DrawerAccordion title="What Ralph noticed">
            <div className="report-photo-strip report-photo-strip-drawer">
              {noticed.map((item) => (<figure key={item.photo} className="report-photo-tile">
                  <div className="report-photo-tile-art"/>
                  <figcaption>
                    <strong>{item.photo}</strong>
                    <span>{item.title}</span>
                  </figcaption>
                </figure>))}
            </div>
          </DrawerAccordion>

          <DrawerAccordion title="Repair allowance">
            <p className="report-drawer-copy">{drawers.repairsText}</p>
          </DrawerAccordion>

          <DrawerAccordion title="Budget fit">
            <p className="report-drawer-copy">{drawers.budgetText}</p>
          </DrawerAccordion>
        </div>);
        case "reasons":
            return (<div className="report-drawer-stack">
          <div className="report-drawer-summary">{drawers.reasonsText}</div>
          <div className="report-drawer-toc">
            {drawerToc.map((item) => (<button key={item.id} type="button" onClick={() => onJump(item.id as DrawerId)} className="report-toc-chip">
                {item.label}
              </button>))}
          </div>
          <div className="report-reason-list">
            {reasons.map((reason) => (<article key={reason.title} className="report-reason">
                <span className={`report-severity ${reason.level.toLowerCase()}`}>
                  {reason.level}
                </span>
                <strong>{reason.title}</strong>
                <p>{reason.evidence}</p>
              </article>))}
          </div>
        </div>);
        case "noticed":
            return (<div className="report-drawer-stack">
          <div className="report-drawer-summary">{drawers.noticedText}</div>
          <DrawerAccordion title="Photo clues" defaultOpen>
            <div className="report-photo-strip report-photo-strip-drawer">
              {noticed.map((item) => (<figure key={item.photo} className="report-photo-tile">
                  <div className="report-photo-tile-art"/>
                  <figcaption>
                    <strong>{item.photo}</strong>
                    <span>{item.title}</span>
                  </figcaption>
                </figure>))}
            </div>
          </DrawerAccordion>
          <DrawerAccordion title="What Ralph noticed">
            <ul className="report-bullet-list">
              {noticed.map((item) => (<li key={item.photo}>
                  <strong>{item.title}</strong>
                  <span>{item.note}</span>
                </li>))}
            </ul>
          </DrawerAccordion>
        </div>);
        case "repairs":
            return (<div className="report-drawer-stack">
          <div className="report-drawer-summary">{drawers.repairsText}</div>
          <DrawerAccordion title="Likely work" defaultOpen>
            <div className="report-chip-grid">
              {repairWork.map((item) => (<span key={item} className="report-inline-chip">
                  {item}
                </span>))}
            </div>
          </DrawerAccordion>
          <DrawerAccordion title="Checks Ralph would not ignore">
            <div className="report-chip-grid">
              {hiddenChecks.map((item) => (<span key={item} className="report-inline-chip muted">
                  {item}
                </span>))}
            </div>
          </DrawerAccordion>
          <DrawerAccordion title="What the allowance means">
            <p className="report-drawer-copy">{drawers.repairsDescription}</p>
          </DrawerAccordion>
        </div>);
        case "budget":
            return (<div className="report-drawer-stack">
          <div className="report-drawer-summary">{drawers.budgetText}</div>
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
              Your budget available to buy, move, and fix the car is the total money that has to
              survive the auction price, moving cost, and repairs. Ralph uses the lower end as
              comfortable and the upper end as the limit.
            </p>
          </DrawerAccordion>
        </div>);
        case "verify":
            return (<div className="report-drawer-stack">
          <div className="report-drawer-summary">{drawers.verifyText}</div>
          <DrawerAccordion title="What Ralph could not verify" defaultOpen>
            <ul className="report-bullet-list">
              {missingInfo.map((item) => (<li key={item}>
                  <span>{item}</span>
                </li>))}
            </ul>
          </DrawerAccordion>
          <DrawerAccordion title="Listing details Ralph used">
            <ul className="report-bullet-list">
              <li>
                <span>
                  Listing title, auction site, current bid, and photo set formed the surface report.
                </span>
              </li>
              <li>
                <span>
                  The auction platform influenced the fee assumptions and the way Ralph framed the
                  risk.
                </span>
              </li>
              <li>
                <span>Registration data would expand the MOT/history layer when available.</span>
              </li>
            </ul>
          </DrawerAccordion>
        </div>);
        case "expert":
            return (<div className="report-drawer-stack">
          <div className="report-drawer-summary">{drawers.expertText}</div>
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
                <span>
                  the verdict depends on whether the damage is cosmetic or deeper.
                </span>
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
        </div>);
        default:
            return null;
    }
}
export default function Drawer({ drawer, onClose, onJump, }: {
    drawer: DrawerId;
    onClose: () => void;
    onJump: (next: DrawerId) => void;
}) {
    return (<div className="report-drawer-overlay" role="presentation" onClick={onClose}>
      <aside className="report-drawer" role="dialog" aria-modal="true" aria-label="Ralph report reasoning" onClick={(event) => event.stopPropagation()}>
        <div className="report-drawer-grip"/>
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
            <X size={16} aria-hidden="true"/>
            <span>Close</span>
          </button>
        </header>

        <DrawerContent drawer={drawer} onJump={onJump}/>
      </aside>
    </div>);
}
