import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
type SectionProps = {
    id: string;
    title: string;
    subtitle: string;
    actionLabel?: string;
    onAction?: () => void;
    children: ReactNode;
    className?: string;
};
export default function SectionPanel({ id, title, subtitle, actionLabel = "See how Ralph got this", onAction, className, children, }: SectionProps) {
    return (<section className={`report-panel ${className ?? ""}`} id={id}>
      <div className="report-panel-head">
        <div>
          <h4>{title}</h4>
          <p>{subtitle}</p>
        </div>
        {onAction ? (<button className="report-drill-link" type="button" onClick={onAction} aria-label={`${actionLabel} for ${title}`}>
            <span>{actionLabel}</span>
            <ChevronRight size={16} aria-hidden="true"/>
          </button>) : null}
      </div>
      {children}
    </section>);
}
