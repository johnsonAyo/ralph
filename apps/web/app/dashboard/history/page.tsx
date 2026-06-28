"use client";

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
  const { data: reports, isLoading, isError } = useReports();
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

        {!isLoading && !isError && !reports?.length && (
          <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-10 text-center">
            <p className="m-0 font-extrabold text-[var(--ink)]">No checks yet</p>
            <p className="mt-1 text-[0.92rem] text-[var(--muted)]">Run your first check to see it here.</p>
            <Link href="/dashboard/new" className="mt-4 inline-flex items-center gap-1.5 text-[0.9rem] font-extrabold text-[var(--blue)] hover:underline">
              Run a new check <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        )}

        {isError && <p className="dash-error">Could not load your history. Please try again.</p>}

        {!isLoading && reports && reports.length > 0 && (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {reports.map((report) => (
              <li
                key={report.id}
                className="flex items-center gap-4 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-4"
              >
                <span className={`h-10 w-1.5 shrink-0 rounded-full ${report.id && reportTone(report) === "ok" ? "bg-green-500" : reportTone(report) === "avoid" ? "bg-red-500" : "bg-[var(--line)]"}`} aria-hidden="true" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[0.95rem] font-extrabold text-[var(--ink)]">{reportTitle(report)}</span>
                  <span className="text-[0.78rem] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {reportHeadline(report)} · {report.listing?.platform ?? "—"} · {relativeTime(report.createdAt)}
                  </span>
                </div>
                <span className="hidden shrink-0 text-[0.85rem] font-bold tabular-nums text-[var(--ink)] sm:block">
                  {reportBidRange(report)}
                </span>
                <Link
                  href={`/dashboard/reports/${report.id}`}
                  className="inline-flex shrink-0 items-center gap-1 rounded-[10px] px-3 py-2 text-[0.82rem] font-extrabold text-[var(--blue)] transition-colors hover:bg-[rgba(47,98,233,0.08)]"
                >
                  Open
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(report.id)}
                  disabled={del.isPending}
                  aria-label="Delete report"
                  className="grid size-9 shrink-0 place-items-center rounded-[10px] text-[var(--muted)] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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
