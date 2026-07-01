"use client";
import "./dashboard.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Car, TrendingDown, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button, Input } from "@ralph/ui";
import { ReportVerdictCode } from "@ralph/shared";
import { useReports } from "../lib/use-reports";
import { SUPPORTED_SITES } from "./listings/constants";
import { dashboardLabels } from "../labels";
import {
    reportBidRange,
    reportHeadline,
    reportTitle,
    reportTone,
    relativeTime,
} from "../lib/report-display";
import { DashboardReportsSkeleton, DashboardStatsSkeleton } from "../components/skeleton";

const RECENT_LIMIT = 3;

function QuickCheckWidget() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!url.trim())
            return;
        const params = new URLSearchParams({ url: url.trim() });
        router.push(`/dashboard/verdict?${params.toString()}`);
    }
    return (<form className="mt-5 flex w-full max-w-[640px] flex-col gap-2.5 sm:flex-row sm:items-center" onSubmit={handleSubmit}>
      <Input type="url" className="h-[48px] sm:h-[46px] flex-1 rounded-[12px] shadow-sm text-ellipsis" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a Copart, IAA or other UK listing URL…" required suppressHydrationWarning/>
      <Button type="submit" className="h-[48px] sm:h-[46px] w-full sm:w-auto min-h-0 shrink-0 gap-1.5 rounded-[12px] px-5 text-[0.88rem] shadow-[0_6px_18px_rgba(47,98,233,0.18)] justify-center">
        Analyse
        <ArrowRight size={15} aria-hidden="true"/>
      </Button>
    </form>);
}
function SitePreview({ site }: { site: typeof SUPPORTED_SITES[0] }) {
    const [logoError, setLogoError] = useState(false);
    const domain = new URL(site.url).hostname.replace(/^www\./, "");
    const fallback = `https://icon.horse/icon/${domain}`;
    return (<a href={site.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(47,98,233,0.25)]" style={{ textDecoration: "none", color: "inherit" }}>
      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--line)] bg-white p-1.5">
        {!logoError ? (<img src={site.logo} alt="" className="size-full object-contain" onError={(e) => {
                if (e.currentTarget.src === site.logo) {
                    e.currentTarget.src = fallback;
                }
                else {
                    setLogoError(true);
                }
            }}/>) : (<span className="grid size-full place-items-center rounded-lg bg-[var(--blue)] text-sm font-bold text-white">{site.name.charAt(0)}</span>)}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[0.95rem] font-extrabold text-[var(--ink)] transition-colors group-hover:text-[var(--blue)]">{site.name}</span>
        <span className="truncate text-[0.78rem] font-medium text-[var(--muted)]">{domain}</span>
      </span>
      <ExternalLink size={15} className="ml-auto shrink-0 text-[var(--muted)] transition-colors group-hover:text-[var(--blue)]" aria-hidden="true"/>
    </a>);
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
    const recent = reports?.slice(0, RECENT_LIMIT) ?? [];
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
          <h2 className="dash-section-title">Recent reports</h2>
          {totalChecks > 0 && (
            <Link className="dash-see-all" href="/dashboard/history">
              See all {totalChecks}
              <ArrowRight size={14} aria-hidden="true"/>
            </Link>
          )}
        </header>

        {isLoading && <DashboardReportsSkeleton />}

        {!isLoading && !reports?.length && <EmptyState />}

        {isError && reports && reports.length > 0 && (<p className="dash-error">Could not load reports. Please try again.</p>)}

        {!isLoading && recent.length > 0 && (<div className="dash-report-list">
            {recent.map((report) => (<article key={report.id} className="dash-card">
                <div className={`dash-card-band ${reportTone(report)}`}>
                  <div className="dash-card-dot"/>
                  <span>{reportHeadline(report)}</span>
                </div>

                <div className="dash-card-body">
                  <h3>{reportTitle(report)}</h3>
                  <p className="dash-card-source">{report.listing?.platform ?? "—"}</p>
                  <p className="dash-card-note">
                    {report.result?.summary ?? reportHeadline(report)}
                  </p>
                </div>

                <div className="dash-card-meta">
                  <div className="dash-card-bid">
                    <span>Ralph&apos;s range</span>
                    <strong>{reportBidRange(report)}</strong>
                  </div>
                  <div className="dash-card-footer">
                    <span className="dash-card-when">{relativeTime(report.createdAt)}</span>
                    <a className="dash-card-link" href={`/dashboard/reports/${report.id}`}>
                      Open report
                      <ArrowRight size={13} aria-hidden="true"/>
                    </a>
                  </div>
                </div>
              </article>))}
          </div>)}
      </section>

      <section className="dash-section">
        <header className="dash-section-head">
          <h2 className="dash-section-title">Where to find a car</h2>
          <Link className="dash-see-all" href="/dashboard/listings">
            Browse all
            <ArrowRight size={14} aria-hidden="true"/>
          </Link>
        </header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SUPPORTED_SITES.slice(0, 3).map((site) => (
            <SitePreview key={site.name} site={site}/>
          ))}
        </div>
      </section>
    </div>);
}
