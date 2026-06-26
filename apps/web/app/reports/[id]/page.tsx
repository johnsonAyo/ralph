"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, AlertTriangle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { reportSnapshotSchema, ReportSnapshot, ReportStatusCode, ReportVerdictCode } from "@ralph/shared";
import { API_BASE_URL } from "../../constants";
import { getSupabaseBrowserClient } from "../../lib/supabase";

async function fetchReport(id: string): Promise<ReportSnapshot> {
  const supabase = getSupabaseBrowserClient();
  const accessToken = supabase
    ? (await supabase.auth.getSession()).data.session?.access_token
    : null;

  const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!response.ok) {
    throw new Error(response.status === 404 ? "Report not found." : "Could not load report.");
  }

  return reportSnapshotSchema.parse(await response.json());
}

function useReport(id: string) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => fetchReport(id),
    staleTime: 60_000,
  });
}

const VERDICT_META: Record<
  ReportVerdictCode,
  { label: string; className: string; Icon: React.ElementType }
> = {
  [ReportVerdictCode.GoodCandidate]: {
    label: "Good candidate",
    className: "verdict-badge verdict-badge--ok",
    Icon: CheckCircle2,
  },
  [ReportVerdictCode.ConsiderBelowCeiling]: {
    label: "Consider with caution",
    className: "verdict-badge verdict-badge--ok",
    Icon: CheckCircle2,
  },
  [ReportVerdictCode.HighRisk]: {
    label: "Avoid",
    className: "verdict-badge verdict-badge--avoid",
    Icon: XCircle,
  },
  [ReportVerdictCode.InsufficientConfidence]: {
    label: "Insufficient confidence",
    className: "verdict-badge verdict-badge--low",
    Icon: HelpCircle,
  },
};

function formatMoney(value: number | undefined): string {
  if (value === undefined) return "—";
  return `£${value.toLocaleString("en-GB")}`;
}

function StatusPill({ status }: { status: string }) {
  const isPending =
    status === ReportStatusCode.Queued ||
    status === ReportStatusCode.Extracting ||
    status === ReportStatusCode.Analysing;

  return (
    <span className={`status-pill ${isPending ? "status-pill--pending" : ""}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function VerdictBanner({ result }: { result: NonNullable<ReportSnapshot["result"]> }) {
  const meta = VERDICT_META[result.verdict];
  const { Icon } = meta;

  return (
    <div className={`report-verdict-banner ${meta.className}`}>
      <Icon size={20} aria-hidden="true" />
      <div>
        <strong>{meta.label}</strong>
        {result.hardCeiling && (
          <span> — max bid {formatMoney(result.hardCeiling)}</span>
        )}
      </div>
    </div>
  );
}

function BidRange({ result }: { result: NonNullable<ReportSnapshot["result"]> }) {
  if (!result.safeBidMin && !result.safeBidMax) return null;

  return (
    <section className="report-section">
      <h2>Ralph&apos;s target range</h2>
      <div className="report-bid-grid">
        <div className="report-bid-cell">
          <span>Safe minimum</span>
          <strong>{formatMoney(result.safeBidMin)}</strong>
        </div>
        <div className="report-bid-cell">
          <span>Safe maximum</span>
          <strong>{formatMoney(result.safeBidMax)}</strong>
        </div>
        {result.hardCeiling && (
          <div className="report-bid-cell">
            <span>Hard ceiling</span>
            <strong>{formatMoney(result.hardCeiling)}</strong>
          </div>
        )}
        {result.estimatedTotalCost && (
          <div className="report-bid-cell">
            <span>Estimated total cost</span>
            <strong>{formatMoney(result.estimatedTotalCost)}</strong>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: report, isLoading, isError, error } = useReport(id);

  if (isLoading) {
    return (
      <div className="report-detail-page">
        <div className="report-loading">Loading report...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="report-detail-page">
        <div className="report-error">
          <AlertTriangle size={24} aria-hidden="true" />
          <p>{error instanceof Error ? error.message : "Something went wrong."}</p>
          <Link className="button" href="/dashboard">
            <ArrowLeft size={15} aria-hidden="true" />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="report-detail-page">
      
      <Link className="report-back-link" href="/dashboard">
        <ArrowLeft size={15} aria-hidden="true" />
        Dashboard
      </Link>

      
      <header className="report-header">
        <div className="report-header-meta">
          <StatusPill status={report.status} />
          <span className="report-header-date">
            {new Date(report.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <h1 className="report-title">
          {report.listing?.title ?? report.request.listingUrl}
        </h1>
        {report.listing?.platform && (
          <p className="report-subtitle">{report.listing.platform}</p>
        )}
      </header>

      
      {report.result && <VerdictBanner result={report.result} />}

      
      {report.result?.summary && (
        <section className="report-section">
          <h2>Ralph&apos;s summary</h2>
          <p>{report.result.summary}</p>
        </section>
      )}

      
      {report.result && <BidRange result={report.result} />}

      
      {report.result?.keyRisks && report.result.keyRisks.length > 0 && (
        <section className="report-section">
          <h2>Key risks</h2>
          <ul className="report-list">
            {report.result.keyRisks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </section>
      )}

      
      {report.result?.assumptions && report.result.assumptions.length > 0 && (
        <section className="report-section">
          <h2>Assumptions Ralph made</h2>
          <ul className="report-list report-list--secondary">
            {report.result.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
        </section>
      )}

      
      {report.result?.recommendedNextStep && (
        <section className="report-section report-next-step">
          <h2>Recommended next step</h2>
          <p>{report.result.recommendedNextStep}</p>
        </section>
      )}

      
      {report.listing && (
        <section className="report-section">
          <h2>Listing details</h2>
          <dl className="report-meta-grid">
            {report.listing.lotNumber && (
              <>
                <dt>Lot</dt>
                <dd>{report.listing.lotNumber}</dd>
              </>
            )}
            {report.listing.currentBid !== undefined && (
              <>
                <dt>Current bid</dt>
                <dd>{formatMoney(report.listing.currentBid)}</dd>
              </>
            )}
            {report.listing.mileage !== undefined && (
              <>
                <dt>Mileage</dt>
                <dd>{report.listing.mileage.toLocaleString("en-GB")} mi</dd>
              </>
            )}
            {report.listing.extractionConfidence && (
              <>
                <dt>Extraction confidence</dt>
                <dd>{report.listing.extractionConfidence}</dd>
              </>
            )}
            {report.listing.missingFields && report.listing.missingFields.length > 0 && (
              <>
                <dt>Missing fields</dt>
                <dd>{report.listing.missingFields.join(", ")}</dd>
              </>
            )}
          </dl>
        </section>
      )}

      
      <section className="report-section">
        <h2>Original listing</h2>
        <a
          href={report.request.listingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="report-listing-link"
        >
          {report.request.listingUrl}
        </a>
      </section>
    </div>
  );
}
