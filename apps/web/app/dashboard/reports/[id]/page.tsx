"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Camera,
  ChevronDown,
  Gauge,
  ImageOff,
  KeyRound,
  Lightbulb,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { Badge, Button } from "@ralph/ui";
import {
  ExtractionConfidence,
  ReportVerdictCode,
  type ReportSnapshot,
} from "@ralph/shared";
import { useReport } from "../../../lib/use-report";

const VERDICT_CONFIG: Record<
  string,
  { label: string; tone: "success" | "warning" | "danger" | "neutral"; blurb: string }
> = {
  [ReportVerdictCode.GoodCandidate]: {
    label: "Good candidate",
    tone: "success",
    blurb: "Worth bidding within Ralph's range.",
  },
  [ReportVerdictCode.ConsiderBelowCeiling]: {
    label: "Consider with caution",
    tone: "warning",
    blurb: "Only worth it below Ralph's ceiling.",
  },
  [ReportVerdictCode.HighRisk]: {
    label: "High risk — avoid",
    tone: "danger",
    blurb: "Ralph advises walking away from this one.",
  },
  [ReportVerdictCode.InsufficientConfidence]: {
    label: "Not enough to say",
    tone: "neutral",
    blurb: "Too little detail for a confident call.",
  },
};

const TONE_HERO: Record<string, string> = {
  success: "border-l-[5px] border-l-green-500 bg-green-50/60",
  warning: "border-l-[5px] border-l-amber-500 bg-amber-50/60",
  danger: "border-l-[5px] border-l-red-500 bg-red-50/60",
  neutral: "border-l-[5px] border-l-[var(--line)] bg-[var(--surface)]",
};

function money(value: unknown): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isFinite(n) ? `£${n.toLocaleString("en-GB")}` : "—";
}
function num(value: unknown, unit = ""): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toLocaleString("en-GB")}${unit}` : "—";
}
function text(value: unknown): string {
  const s = (value ?? "").toString().trim();
  return s.length ? s : "—";
}

function Stat({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3">
      <span className="flex items-center gap-1.5 text-[0.66rem] font-[900] uppercase tracking-[0.05em] text-[#9a9286]">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </span>
      <span className="text-[0.95rem] font-[850] tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function Disclosure({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="group rounded-[18px] border border-[var(--line)] bg-[var(--surface)] [&_summary]:list-none">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-[0.95rem] font-[850] text-foreground">
        {title}
        <ChevronDown className="size-4 text-[var(--muted)] transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-[var(--line)] px-5 py-4">{children}</div>
    </details>
  );
}

function GalleryImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1.5 bg-[#f4f0e7] text-[#9a9286] ${className ?? ""}`}>
        <ImageOff className="size-6" aria-hidden />
        <span className="text-[0.72rem] font-[700]">No image</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`max-w-full ${className ?? ""}`} />;
}

function PendingState({ report }: { report: ReportSnapshot }) {
  const failed = report.status === "failed";
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-10 text-center">
      {failed ? (
        <>
          <div className="grid size-12 place-items-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle className="size-6" aria-hidden />
          </div>
          <h2 className="m-0 text-xl font-[900] text-foreground">Analysis didn&rsquo;t finish</h2>
          <p className="m-0 max-w-[36ch] text-[0.92rem] text-[var(--muted)]">
            Something went wrong analysing this car. Your credit hasn&rsquo;t been spent — try running the check again.
          </p>
          <Button asChild size="md">
            <Link href="/dashboard/new">Run a new check</Link>
          </Button>
        </>
      ) : (
        <>
          <div className="size-10 animate-spin rounded-full border-4 border-[rgba(0,0,0,0.1)] border-t-[var(--blue)]" />
          <h2 className="m-0 text-xl font-[900] text-foreground">Ralph is analysing…</h2>
          <p className="m-0 max-w-[36ch] text-[0.92rem] text-[var(--muted)]">
            Weighing the price, damage, mileage and your budget. This page updates automatically.
          </p>
        </>
      )}
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const { data: report, isLoading, isError } = useReport(id);

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="mx-auto w-full max-w-3xl">
          <div className="h-[320px] animate-pulse rounded-[24px] bg-[var(--line)]/40" />
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="dashboard-page">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 py-16 text-center">
          <h1 className="m-0 text-2xl font-[900] text-foreground">Report not found</h1>
          <p className="m-0 text-[var(--muted)]">This report doesn&rsquo;t exist or isn&rsquo;t yours.</p>
          <Button asChild size="md"><Link href="/dashboard">Back to dashboard</Link></Button>
        </div>
      </div>
    );
  }

  const back = (
    <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[0.82rem] font-[800] text-[#625c52] transition-colors hover:text-foreground">
      <ArrowLeft className="size-4" aria-hidden />
      Back to dashboard
    </Link>
  );

  if (report.status !== "completed" || !report.result) {
    return (
      <div className="dashboard-page">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          {back}
          <PendingState report={report} />
        </div>
      </div>
    );
  }

  const { result, listing, request } = report;
  const verdict = VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG[ReportVerdictCode.InsufficientConfidence];
  const images = listing?.images ?? [];
  const hero = images[0]?.fullUrl || images[0]?.highResUrl || images[0]?.thumbnailUrl;
  const title = listing?.title || [listing?.year, listing?.make, listing?.model].filter(Boolean).join(" ") || "Your check";
  const confidence = result.confidence;
  const confidenceTone =
    confidence === ExtractionConfidence.High ? "success" : confidence === ExtractionConfidence.Medium ? "warning" : "neutral";

  const bidRange =
    result.safeBidMin != null && result.safeBidMax != null
      ? `${money(result.safeBidMin)} – ${money(result.safeBidMax)}`
      : result.safeBidMax != null
        ? `up to ${money(result.safeBidMax)}`
        : "—";

  return (
    <div className="dashboard-page">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        {back}

        <section className={`flex flex-col gap-4 rounded-[24px] border border-[var(--line)] p-6 sm:p-7 ${TONE_HERO[verdict.tone]}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[0.72rem] font-[900] uppercase tracking-[0.06em] text-[#625c52]">Ralph&rsquo;s verdict</span>
            <Badge variant={confidenceTone === "success" ? "success" : confidenceTone === "warning" ? "warning" : "neutral"} className="font-[800] capitalize">
              {confidence} confidence
            </Badge>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-[clamp(1.5rem,3vw,2rem)] font-[900] leading-[1.05] tracking-[-0.04em] text-foreground">
              {verdict.label}
            </h1>
            <p className="m-0 text-[0.95rem] font-[650] text-[#625c52]">{verdict.blurb}</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <Stat icon={Tag} label="Safe bid" value={bidRange} />
            <Stat icon={ShieldCheck} label="Hard ceiling" value={money(result.hardCeiling)} />
            <Stat icon={ReceiptText} label="All-in cost" value={money(result.estimatedTotalCost)} />
          </div>

          <p className="m-0 text-[0.95rem] leading-[1.5] text-foreground">{result.summary}</p>

          {result.recommendedNextStep ? (
            <div className="flex items-start gap-2.5 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-[var(--blue)]" aria-hidden />
              <p className="m-0 text-[0.9rem] font-[700] leading-[1.45] text-foreground">{result.recommendedNextStep}</p>
            </div>
          ) : null}
        </section>

        {result.keyRisks.length > 0 ? (
          <section className="flex flex-col gap-3 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
            <h2 className="m-0 flex items-center gap-2 text-[1.05rem] font-[900] text-foreground">
              <AlertTriangle className="size-[18px] text-amber-500" aria-hidden />
              Why this verdict
            </h2>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {result.keyRisks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[0.92rem] leading-[1.45] text-foreground">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                  {risk}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="flex flex-col gap-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="m-0 truncate text-[1.15rem] font-[900] tracking-[-0.02em] text-foreground">{title}</h2>
              <span className="text-[0.74rem] font-[800] uppercase tracking-[0.04em] text-[#9a9286]">
                {text(listing?.platform).replace(/_/g, " ")}
                {listing?.lotNumber ? ` · Lot ${listing.lotNumber}` : ""}
              </span>
            </div>
          </div>

          {hero ? (
            <div className="overflow-hidden rounded-[18px] border border-[var(--line)] bg-[#f4f0e7]">
              <GalleryImage src={hero} alt={title} className="aspect-[16/9] w-full object-cover" />
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <Stat icon={ReceiptText} label="Current bid" value={money(listing?.currentBid)} />
            <Stat icon={Gauge} label="Mileage" value={num(listing?.mileage, " mi")} />
            <Stat icon={Calendar} label="Year" value={text(listing?.year)} />
            <Stat icon={MapPin} label="Location" value={text(listing?.location)} />
            <Stat icon={Tag} label="Est. retail" value={money(listing?.estimatedRetailValue)} />
            <Stat icon={KeyRound} label="Keys" value={listing?.hasKeys == null ? "—" : listing.hasKeys ? "Yes" : "No"} />
          </div>

          <div className="flex flex-wrap gap-2">
            {text(listing?.primaryDamage) !== "—" ? <Badge variant="danger" className="font-[800]">Primary: {listing?.primaryDamage}</Badge> : null}
            {text(listing?.secondaryDamage) !== "—" ? <Badge variant="warning" className="font-[800]">Secondary: {listing?.secondaryDamage}</Badge> : null}
            {text(listing?.runCondition) !== "—" ? <Badge variant="neutral" className="font-[800]">{listing?.runCondition}</Badge> : null}
            {text(listing?.v5Status) !== "—" ? <Badge variant="info" className="font-[800]">V5: {listing?.v5Status}</Badge> : null}
            {text(listing?.category) !== "—" ? <Badge variant="neutral" className="font-[800]">{listing?.category}</Badge> : null}
          </div>
        </section>

        {result.assumptions.length > 0 ? (
          <Disclosure title="What Ralph assumed">
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {result.assumptions.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[0.9rem] leading-[1.45] text-[#625c52]">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-[var(--muted)]" aria-hidden />
                  {a}
                </li>
              ))}
            </ul>
          </Disclosure>
        ) : null}

        {images.length > 1 ? (
          <Disclosure title={`All photos (${images.length})`}>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {images.map((img, i) => (
                <div key={i} className="overflow-hidden rounded-[12px] border border-[var(--line)] bg-[#f4f0e7]">
                  <GalleryImage src={img.fullUrl || img.highResUrl || img.thumbnailUrl} alt={`Photo ${i + 1}`} className="aspect-square w-full object-cover" />
                </div>
              ))}
            </div>
          </Disclosure>
        ) : null}

        <Disclosure title="Your check parameters">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <Stat icon={ReceiptText} label="Your budget" value={money(request.totalUserBudget)} />
            <Stat icon={MapPin} label="Postcode" value={text(request.postcode)} />
            <Stat icon={ShieldCheck} label="Risk appetite" value={text(request.riskTolerance)} />
          </div>
          {request.listingUrl ? (
            <a href={request.listingUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[0.85rem] font-[800] text-[var(--blue)] hover:underline">
              <Camera className="size-4" aria-hidden />
              View original listing
            </a>
          ) : null}
        </Disclosure>

        <div className="pt-1">
          <Button asChild size="md" variant="secondary">
            <Link href="/dashboard/new">Run another check</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
