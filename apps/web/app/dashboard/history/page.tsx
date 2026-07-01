"use client";
import "../dashboard.css";
import Link from "next/link";
import { ArrowRight, Loader2, Trash2 } from "lucide-react";
import { useReports } from "../../lib/use-reports";
import { useDeleteReport } from "../../lib/use-delete-report";
import {
  reportBidRange,
  reportHeadline,
  reportTitle,
  reportTone,
  relativeTime,
} from "../../lib/report-display";
import { DashboardReportsSkeleton } from "../../components/skeleton";

export default function HistoryPage() {
  const { data: reports, isLoading } = useReports();
  const del = useDeleteReport();

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this report? This can’t be undone.")) {
      del.mutate(id);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-[1.7rem]">
            Check history
          </h1>
          <p className="mt-1 text-[0.95rem] leading-relaxed text-[var(--muted)]">
            Every check you’ve run. Open a report to revisit it, or remove ones you no longer need.
          </p>
        </header>

        {isLoading && <DashboardReportsSkeleton />}

        {!isLoading && (!reports || reports.length === 0) && (
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
            <h3 className="dashboard-empty-title">No checks yet</h3>
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

        {!isLoading && reports && reports.length > 0 && (
          <ul className="dashboard-history-list">
            {reports.map((report) => (
              <li
                key={report.id}
                className="dashboard-history-item"
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
                  href={`/dashboard/verdict?id=${report.id}`}
                  className="dashboard-history-open-btn"
                >
                  Open
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(report.id)}
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
