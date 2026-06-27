"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Car, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ReportSnapshot, ReportVerdictCode } from "@ralph/shared";
import { useReports } from "../lib/use-reports";
import { dashboardLabels } from "../labels";
import { DashboardReportsSkeleton, DashboardStatsSkeleton, } from "../components/skeleton";
function QuickCheckWidget() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!url.trim())
            return;
        const params = new URLSearchParams({ url: url.trim() });
        router.push(`/dashboard/new?${params.toString()}`);
    }
    return (<form className="quick-check-widget" onSubmit={handleSubmit}>
      <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a Copart or Autotrader listing URL..." required/>
      <button type="submit" className="button primary">
        Analyse
        <ArrowRight size={15} aria-hidden="true"/>
      </button>
    </form>);
}
function verdictLabel(snapshot: ReportSnapshot): string {
    const verdict = snapshot.result?.verdict;
    const max = snapshot.result?.hardCeiling;
    if (verdict === ReportVerdictCode.GoodCandidate)
        return "Good candidate";
    if (verdict === ReportVerdictCode.ConsiderBelowCeiling) {
        return max ? `Consider below £${max.toLocaleString("en-GB")}` : "Consider with caution";
    }
    if (verdict === ReportVerdictCode.HighRisk)
        return "Avoid";
    if (verdict === ReportVerdictCode.InsufficientConfidence)
        return "Low confidence";
    return snapshot.status;
}
function verdictClass(snapshot: ReportSnapshot): "ok" | "avoid" | "pending" {
    const verdict = snapshot.result?.verdict;
    if (verdict === ReportVerdictCode.GoodCandidate ||
        verdict === ReportVerdictCode.ConsiderBelowCeiling) {
        return "ok";
    }
    if (verdict === ReportVerdictCode.HighRisk)
        return "avoid";
    return "pending";
}
function bidRange(snapshot: ReportSnapshot): string {
    const { safeBidMin, safeBidMax } = snapshot.result ?? {};
    if (safeBidMin && safeBidMax) {
        return `£${safeBidMin.toLocaleString("en-GB")} – £${safeBidMax.toLocaleString("en-GB")}`;
    }
    return "—";
}
function relativeTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0)
        return "Today";
    if (diffDays === 1)
        return "Yesterday";
    if (diffDays < 7)
        return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? "" : "s"} ago`;
}
function EmptyState() {
    return (<div className="dash-empty">
      <div className="dash-empty-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
          <path d="M11 8v6M8 11h6"/>
        </svg>
      </div>
      <div className="dash-empty-body">
        <p className="dash-empty-title">No reports yet</p>
        <p className="dash-empty-text">{dashboardLabels.emptyState}</p>
      </div>
    </div>);
}
export default function DashboardPage() {
    const { data: reports, isLoading, isError } = useReports();
    const totalChecks = reports?.length ?? 0;
    const worthBidding = reports?.filter((r) => r.result?.verdict === ReportVerdictCode.GoodCandidate ||
        r.result?.verdict === ReportVerdictCode.ConsiderBelowCeiling).length ?? 0;
    const advisedSkip = reports?.filter((r) => r.result?.verdict === ReportVerdictCode.HighRisk).length ?? 0;
    let totalSavings = 0;
    if (reports) {
        for (const r of reports) {
            if (r.listing?.currentBid && r.result?.hardCeiling) {
                if (r.listing.currentBid > r.result.hardCeiling) {
                    totalSavings += (r.listing.currentBid - r.result.hardCeiling);
                }
            }
        }
    }
    return (<div className="dashboard-page">
      
      <section className="dash-hero">
        <div className="dash-hero-left">
          <h1 className="dash-title">{dashboardLabels.title}</h1>
          <p className="dash-sub">
            {dashboardLabels.sub}
          </p>
          <QuickCheckWidget />
        </div>

        {isLoading ? (<DashboardStatsSkeleton />) : (<div className="dash-stat-grid">
            <div className="dash-stat">
              <Car size={18} aria-hidden="true"/>
              <strong>{totalChecks}</strong>
              <span>Checks run</span>
            </div>
            <div className="dash-stat">
              <CheckCircle2 size={18} aria-hidden="true"/>
              <strong>{worthBidding}</strong>
              <span>Worth bidding</span>
            </div>
            <div className="dash-stat dash-stat--warn">
              <AlertTriangle size={18} aria-hidden="true"/>
              <strong>{advisedSkip}</strong>
              <span>Advised to skip</span>
            </div>
            <div className="dash-stat">
              <TrendingDown size={18} aria-hidden="true"/>
              <strong>{`£${totalSavings.toLocaleString("en-GB")}`}</strong>
              <span>Guided savings</span>
            </div>
          </div>)}
      </section>

      
      <section className="dash-section">
        <header className="dash-section-head">
          <div>
            <h2 className="dash-section-title">Recent reports</h2>
          </div>
        </header>

        {isLoading && <DashboardReportsSkeleton />}

        {!isLoading && !reports?.length && <EmptyState />}

        {isError && reports && reports.length > 0 && (<p className="dash-error">Could not load reports. Please try again.</p>)}

        {!isLoading && reports && reports.length > 0 && (<div className="dash-report-list">
            {reports.map((report) => (<article key={report.id} className="dash-card">
                <div className={`dash-card-band ${verdictClass(report)}`}>
                  <div className="dash-card-dot"/>
                  <span>{verdictLabel(report)}</span>
                </div>

                <div className="dash-card-body">
                  <h3>{report.listing?.title ?? report.request.listingUrl}</h3>
                  <p className="dash-card-source">{report.listing?.platform ?? "—"}</p>
                  <p className="dash-card-note">
                    {report.result?.summary ?? report.status}
                  </p>
                </div>

                <div className="dash-card-meta">
                  <div className="dash-card-bid">
                    <span>Ralph&apos;s range</span>
                    <strong>{bidRange(report)}</strong>
                  </div>
                  <div className="dash-card-footer">
                    <span className="dash-card-when">{relativeTime(report.createdAt)}</span>
                    <a className="dash-card-link" href={`/reports/${report.id}`}>
                      Open report
                      <ArrowRight size={13} aria-hidden="true"/>
                    </a>
                  </div>
                </div>
              </article>))}
          </div>)}
      </section>
    </div>);
}
