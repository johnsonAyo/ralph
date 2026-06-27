import type { CSSProperties, ReactElement } from "react";
type SkeletonVariant = "text" | "block" | "circle" | "pill";
interface SkeletonProps {
    variant?: SkeletonVariant;
    width?: string | number;
    height?: string | number;
    className?: string;
    style?: CSSProperties;
}
export function Skeleton({ variant = "text", width, height, className, style, }: SkeletonProps): ReactElement {
    const computed: CSSProperties = {
        width: typeof width === "number" ? `${width}px` : width,
        height: height ??
            (variant === "circle"
                ? "40px"
                : variant === "pill"
                    ? "32px"
                    : variant === "block"
                        ? "120px"
                        : "0.85rem"),
    };
    if (variant === "circle" && computed.height !== undefined && computed.width === undefined) {
        computed.width = computed.height;
    }
    return (<span aria-hidden="true" className={`skeleton skeleton--${variant}${className ? ` ${className}` : ""}`} style={{ ...computed, ...style }}/>);
}
interface SkeletonTextProps {
    lines?: number;
    lastLineWidth?: string;
    gap?: string | number;
    className?: string;
    style?: CSSProperties;
}
export function SkeletonText({ lines = 1, lastLineWidth = "60%", gap = "0.5rem", className, style, }: SkeletonTextProps): ReactElement {
    const stack: ReactElement[] = [];
    for (let i = 0; i < lines; i += 1) {
        const isLast = i === lines - 1;
        stack.push(<Skeleton key={i} variant="text" width={isLast && lines > 1 ? lastLineWidth : "100%"}/>);
    }
    return (<span aria-hidden="true" className={`skeleton-text${className ? ` ${className}` : ""}`} style={{ display: "grid", gap, ...style }}>
      {stack}
    </span>);
}
export function DashboardStatsSkeleton(): ReactElement {
    return (<div className="dash-stat-grid" role="status" aria-live="polite" aria-busy="true" aria-label="Loading dashboard statistics">
      {[0, 1, 2, 3].map((i) => {
            const warn = i === 2;
            return (<div key={i} className={`dash-stat${warn ? " dash-stat--warn" : ""}`} style={{ pointerEvents: "none" }}>
            <Skeleton variant="circle" width={18} height={18}/>
            <Skeleton variant="text" width="70%" style={{ height: "var(--font-stat)" }}/>
            <Skeleton variant="text" width="55%" style={{ height: "var(--font-stat-label)" }}/>
          </div>);
        })}
    </div>);
}
const reportCardStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    gap: "clamp(14px, 2.5vw, 24px)",
    border: "1px solid var(--line)",
    borderRadius: "22px",
    background: "var(--surface)",
    padding: "18px clamp(16px, 2.5vw, 24px)",
    minHeight: "104px",
    pointerEvents: "none",
};
export function DashboardReportsSkeleton({ rows = 3 }: {
    rows?: number;
}): ReactElement {
    return (<div className="dash-report-list" role="status" aria-live="polite" aria-busy="true" aria-label="Loading recent reports">
      {Array.from({ length: rows }).map((_, i) => (<div key={i} style={reportCardStyle}>
          
          <Skeleton variant="pill" width={100} height={48}/>
          
          <span style={{ display: "grid", gap: "6px", minWidth: 0 }}>
            <Skeleton variant="text" width="78%" style={{ height: "1.05rem" }}/>
            <Skeleton variant="text" width="32%" style={{ height: "0.7rem" }}/>
            <Skeleton variant="text" width="92%" style={{ height: "0.75rem" }}/>
          </span>
          
          <span style={{ display: "grid", gap: "8px", justifyItems: "end" }}>
            <span style={{ display: "grid", gap: "3px", justifyItems: "end" }}>
              <Skeleton variant="text" width="70px"/>
              <Skeleton variant="text" width="92px" style={{ height: "1rem" }}/>
            </span>
            <Skeleton variant="text" width="80px" style={{ height: "0.7rem" }}/>
          </span>
        </div>))}
    </div>);
}
export function ProfileHeaderSkeleton(): ReactElement {
    return (<section className="profile-identity-card" role="status" aria-live="polite" aria-busy="true" aria-label="Loading profile">
      <Skeleton variant="block" width={56} height={56} style={{ borderRadius: "18px" }}/>
      <span style={{ display: "grid", gap: "8px", minWidth: 0, flex: 1 }}>
        <Skeleton variant="text" width="220px" style={{ height: "1rem" }}/>
        <span style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <Skeleton variant="pill" width={150} height={22}/>
        </span>
      </span>
    </section>);
}
export function ProfileBlockSkeleton(): ReactElement {
    return (<section className="profile-block" role="status" aria-live="polite" aria-busy="true" aria-label="Loading profile detail">
      <Skeleton variant="block" width={40} height={40} style={{ borderRadius: "12px" }}/>
      <span style={{ display: "grid", gap: "6px", flex: 1, minWidth: 0 }}>
        <Skeleton variant="text" width="90px" style={{ height: "0.7rem" }}/>
        <Skeleton variant="text" width="60%" style={{ height: "0.92rem" }}/>
      </span>
      <Skeleton variant="pill" width={92} height={32}/>
    </section>);
}
export function ReportHeaderSkeleton(): ReactElement {
    return (<header className="report-header" role="status" aria-live="polite" aria-busy="true" aria-label="Loading report header">
      <span style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <Skeleton variant="pill" width={110} height={22}/>
        <Skeleton variant="text" width="120px"/>
      </span>
      <Skeleton variant="text" width="68%" style={{ height: "1.8rem" }}/>
      <Skeleton variant="text" width="20%" style={{ height: "0.85rem" }}/>
    </header>);
}
export function ReportVerdictSkeleton(): ReactElement {
    return (<div className="report-verdict-banner" role="status" aria-live="polite" aria-busy="true" aria-label="Loading verdict" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <Skeleton variant="circle" width={20} height={20}/>
      <Skeleton variant="text" width="55%" style={{ height: "1rem" }}/>
    </div>);
}
export function ReportBidGridSkeleton({ cells = 4 }: {
    cells?: number;
}): ReactElement {
    return (<div className="report-bid-grid" role="status" aria-live="polite" aria-busy="true" aria-label="Loading price guidance">
      {Array.from({ length: cells }).map((_, i) => (<div key={i} className="report-bid-cell" style={{ pointerEvents: "none" }}>
          <Skeleton variant="text" width="40%" style={{ height: "0.7rem" }}/>
          <Skeleton variant="text" width="68%" style={{ height: "1.1rem" }}/>
        </div>))}
    </div>);
}
export function ReportSectionSkeleton({ paragraphs = 1 }: {
    paragraphs?: number;
}): ReactElement {
    return (<section className="report-section" role="status" aria-live="polite" aria-busy="true" aria-label="Loading section">
      <Skeleton variant="text" width="140px" style={{ height: "0.75rem" }}/>
      <SkeletonText lines={paragraphs} lastLineWidth="78%"/>
    </section>);
}
export function ReportListSkeleton({ items = 3 }: {
    items?: number;
}): ReactElement {
    return (<ul className="report-list" role="status" aria-live="polite" aria-busy="true" aria-label="Loading list" style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "10px" }}>
      {Array.from({ length: items }).map((_, i) => (<li key={i}>
          <Skeleton variant="text" width={`${70 - i * 6}%`}/>
        </li>))}
    </ul>);
}
export function ReportMetaGridSkeleton({ rows = 4 }: {
    rows?: number;
}): ReactElement {
    return (<dl className="report-meta-grid" role="status" aria-live="polite" aria-busy="true" aria-label="Loading listing details" style={{ pointerEvents: "none" }}>
      {Array.from({ length: rows }).map((_, i) => (<span key={i} style={{ display: "contents" }}>
          <dt>
            <Skeleton variant="text" width="80%"/>
          </dt>
          <dd>
            <Skeleton variant="text" width="60%"/>
          </dd>
        </span>))}
    </dl>);
}
export function ReportStatusCardSkeleton(): ReactElement {
    return (<section className="analysis-status-card" role="status" aria-live="polite" aria-busy="true" aria-label="Loading analysis status">
      <div className="spinner-container">
        <Skeleton variant="circle" width={32} height={32}/>
      </div>
      <div className="status-text-content">
        <Skeleton variant="text" width="60%" style={{ height: "1.1rem" }}/>
        <span style={{ display: "grid", gap: "6px", marginTop: "8px" }}>
          <Skeleton variant="text" width="92%"/>
          <Skeleton variant="text" width="78%"/>
        </span>
      </div>
    </section>);
}
export function ReportDetailSkeleton(): ReactElement {
    return (<div className="report-detail-page" aria-busy="true">
      <span className="report-back-link" style={{ pointerEvents: "none" }}>
        <Skeleton variant="circle" width={15} height={15}/>
        <Skeleton variant="text" width="80px"/>
      </span>

      <ReportHeaderSkeleton />
      <ReportVerdictSkeleton />
      <ReportSectionSkeleton paragraphs={2}/>
      <span className="report-section">
        <Skeleton variant="text" width="140px" style={{ height: "0.75rem", marginBottom: "12px" }}/>
        <ReportBidGridSkeleton />
      </span>
      <span className="report-section">
        <Skeleton variant="text" width="100px" style={{ height: "0.75rem", marginBottom: "12px" }}/>
        <ReportListSkeleton items={3}/>
      </span>
      <span className="report-section">
        <Skeleton variant="text" width="180px" style={{ height: "0.75rem", marginBottom: "12px" }}/>
        <ReportMetaGridSkeleton rows={4}/>
      </span>
    </div>);
}
export function DashboardLayoutSkeleton(): ReactElement {
    return (<div className="dashboard-layout" aria-busy="true">
      
      <aside className="dashboard-sidebar">
        <span className="dashboard-sidebar-header">
          <Skeleton variant="block" width={140} height={32} style={{ borderRadius: "10px" }}/>
        </span>
        <span className="dashboard-sidebar-nav">
          {[0, 1, 2, 3].map((i) => (<span key={i} className="dashboard-nav-item" style={{ pointerEvents: "none" }}>
              <Skeleton variant="circle" width={18} height={18}/>
              <Skeleton variant="text" width={`${60 - i * 8}%`}/>
            </span>))}
        </span>
        <span className="dashboard-sidebar-footer">
          <span className="dashboard-credits-widget">
            <span className="dashboard-credits-info">
              <Skeleton variant="circle" width={18} height={18}/>
              <span className="dashboard-credits-text">
                <Skeleton variant="text" width="78%"/>
                <Skeleton variant="text" width="60%"/>
              </span>
            </span>
          </span>
          <span className="dashboard-user-widget">
            <Skeleton variant="block" width={36} height={36} style={{ borderRadius: "8px" }}/>
            <Skeleton variant="text" width="70%" style={{ height: "0.85rem" }}/>
          </span>
        </span>
      </aside>

      
      <div className="dashboard-main-wrap">
        <header className="dashboard-topbar">
          <Skeleton variant="text" width={140} style={{ height: "1rem" }}/>
          <span className="dashboard-topbar-right">
            <Skeleton variant="pill" width={110} height={32}/>
            <Skeleton variant="block" width={38} height={38} style={{ borderRadius: "10px" }}/>
          </span>
        </header>
        <main className="dashboard-main">
          <DashboardReportsSkeleton rows={3}/>
        </main>
      </div>
    </div>);
}
export function HomeShellSkeleton(): ReactElement {
    return (<main aria-busy="true">
      <section className="hero">
        <Skeleton variant="pill" width={240} height={36}/>
        <Skeleton variant="block" width="80%" height="3.4rem" style={{ marginTop: "34px" }}/>
        <SkeletonText lines={2} lastLineWidth="60%"/>
        <span style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "22px" }}>
          <Skeleton variant="pill" width={210} height={56}/>
          <Skeleton variant="text" width={180}/>
        </span>
      </section>

      <section className="check-section">
        <Skeleton variant="block" width="100%" height="320px" style={{ borderRadius: "32px" }}/>
        <Skeleton variant="block" width="100%" height="220px" style={{ borderRadius: "28px" }}/>
      </section>

      <section className="answers-section">
        <Skeleton variant="text" width="60%" style={{ height: "1.6rem", marginBottom: "24px" }}/>
        <span style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "18px",
        }}>
          {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} variant="block" width="100%" height={120} style={{ borderRadius: "var(--radius)" }}/>))}
        </span>
      </section>

      <section className="pricing-section">
        <Skeleton variant="text" width="50%" style={{ height: "1.6rem", marginBottom: "14px" }}/>
        <Skeleton variant="text" width="80%" style={{ height: "0.95rem", marginBottom: "26px" }}/>
        <span style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "20px",
        }}>
          {Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} variant="block" width="100%" height={320} style={{ borderRadius: "var(--radius)" }}/>))}
        </span>
      </section>

      <section className="faqs-section">
        <Skeleton variant="text" width="40%" style={{ height: "1.6rem", marginBottom: "20px" }}/>
        <span style={{ display: "grid", gap: "10px" }}>
          {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} variant="block" width="100%" height={64} style={{ borderRadius: "18px" }}/>))}
        </span>
      </section>
    </main>);
}
export function AuthShellSkeleton(): ReactElement {
    return (<main className="auth-page-shell" role="status" aria-live="polite" aria-busy="true" aria-label="Loading sign-in form">
      <section className="auth-card" style={{ pointerEvents: "none" }}>
        <span style={{ display: "grid", gap: "10px", marginBottom: "14px" }}>
          <Skeleton variant="text" width="60%" style={{ height: "1.4rem" }}/>
          <Skeleton variant="text" width="84%"/>
        </span>

        <span style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "10px",
            margin: "12px 0 16px",
        }}>
          {[0, 1].map((i) => (<span key={i} className="auth-platform-tile">
              <Skeleton variant="block" width={44} height={44} style={{ borderRadius: "12px" }}/>
              <span style={{ display: "grid", gap: "4px" }}>
                <Skeleton variant="text" width="80%"/>
                <Skeleton variant="text" width="60%"/>
              </span>
            </span>))}
        </span>

        <form className="auth-form">
          <span style={{ display: "grid", gap: "8px" }}>
            <Skeleton variant="text" width="35%" style={{ height: "0.78rem" }}/>
            <Skeleton variant="block" width="100%" height={44} style={{ borderRadius: "12px" }}/>
          </span>
          <Skeleton variant="block" width="100%" height={44} style={{ borderRadius: "12px", marginTop: "6px" }}/>
        </form>
      </section>
    </main>);
}
