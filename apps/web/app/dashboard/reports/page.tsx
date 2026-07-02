"use client";

import "../dashboard.css";
import "../verdict/verdict-report.css";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Loader2, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useReports } from "../../lib/use-reports";
import { useReport } from "../../lib/use-report";
import { useDeleteReport } from "../../lib/use-delete-report";
import { VerdictReport } from "../verdict/verdict-report";
import {
  reportBidRange,
  reportHeadline,
  reportTitle,
  reportTone,
  relativeTime,
} from "../../lib/report-display";
import { DashboardReportsSkeleton } from "../../components/skeleton";
import { AnalysisSource, VehicleVerdictReport } from "@ralph/shared";

function ReportsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id") ?? undefined;

  const { data: reports, isLoading: loadingList } = useReports();
  const { data: saved, isLoading: loadingSaved, isError: savedError } = useReport(reportId);
  const del = useDeleteReport();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Delete this report? This can’t be undone.")) {
      del.mutate(id);
    }
  };

  const handleReset = () => {
    router.push("/dashboard/reports");
  };

  // Map database response to ui report structure
  const savedReport: VehicleVerdictReport | null =
    saved && saved.result
      ? {
          id: saved.id,
          sources: [
            saved.request?.registration ? AnalysisSource.Registration : null,
            saved.listing || saved.request?.listingUrl ? AnalysisSource.Listing : null,
            saved.request?.manual ? AnalysisSource.Manual : null,
          ].filter(Boolean) as AnalysisSource[],
          request: saved.request,
          profile: saved.profile,
          listing: saved.listing,
          result: saved.result,
          generatedAt: saved.updatedAt,
        }
      : null;

  // Single report viewer
  if (reportId) {
    if (loadingSaved) {
      return (
        <div className="dashboard-page">
          <div className="mx-auto w-full max-w-3xl">
            <div className="h-[320px] animate-pulse rounded-[24px] bg-[var(--line)]/40" />
          </div>
        </div>
      );
    }

    if (savedError || !savedReport) {
      return (
        <div className="dashboard-page">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 py-16 text-center">
            <h1 className="m-0 text-2xl font-extrabold text-[var(--ink)]">Report not found</h1>
            <p className="m-0 text-[var(--muted)]">This report doesn&rsquo;t exist or isn&rsquo;t yours.</p>
            <Link href="/dashboard/verdict" className="font-bold text-[var(--blue)] hover:underline">Run a new check</Link>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-page">
        <div className="mx-auto w-full max-w-5xl">
          <VerdictReport report={savedReport} onReset={handleReset} />
        </div>
      </div>
    );
  }

  // Reports list view
  return (
    <div className="dashboard-page">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-[1.7rem]">
            Reports
          </h1>
          <p className="mt-1 text-[0.95rem] leading-relaxed text-[var(--muted)]">
            Every check you’ve run. Open a report to revisit it, or remove ones you no longer need.
          </p>
        </header>

        {loadingList && <DashboardReportsSkeleton />}

        {!loadingList && (!reports || reports.length === 0) && (
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="dashboard-empty-title">No reports yet</h3>
            <p className="dashboard-empty-text">
              When you run a check you can see the reports here.
            </p>
            <Link
              href="/dashboard/verdict"
              className="dashboard-empty-cta"
            >
              Ask Ralph <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}

        {!loadingList && reports && reports.length > 0 && (
          <ul className="dashboard-history-list">
            {reports.map((report) => (
              <li
                key={report.id}
                className="dashboard-history-item cursor-pointer"
                onClick={() => router.push(`/dashboard/reports?id=${report.id}`)}
              >
                <span className={`dashboard-history-tone-bar ${reportTone(report)}`} aria-hidden="true" />
                <div className="dashboard-history-info">
                  <span className="dashboard-history-title">{reportTitle(report)}</span>
                  <span className="dashboard-history-meta">
                    {reportHeadline(report)} · {report.listing?.platform ?? "—"} · {relativeTime(report.createdAt)}
                  </span>
                </div>
                <span className="dashboard-history-price">
                  {reportBidRange(report)}
                </span>
                <Link
                  href={`/dashboard/reports?id=${report.id}`}
                  className="dashboard-history-open-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={(e) => handleDelete(report.id, e)}
                  disabled={del.isPending}
                  aria-label="Delete report"
                  className="dashboard-history-delete-btn"
                >
                  {del.isPending && del.variables === report.id ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="size-4" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={null}>
      <ReportsPageInner />
    </Suspense>
  );
}
