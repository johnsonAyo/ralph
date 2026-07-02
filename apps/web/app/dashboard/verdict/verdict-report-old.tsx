"use client";
import { AlertTriangle, ArrowRight, ChevronDown, Wrench, ReceiptText, ShieldCheck, Tag, Info, AlertCircle } from "lucide-react";
import { Badge, Button } from "@ralph/ui";
import type { VehicleVerdictReport } from "@ralph/shared";
import { VehicleVerdictCode, ExtractionConfidence, BudgetFitCode, FindingTone } from "@ralph/shared";

interface VerdictReportProps {
  report: VehicleVerdictReport;
  onReset: () => void;
}

const VERDICT_CONFIG: Record<
  string,
  { tone: "success" | "warning" | "danger" | "neutral" }
> = {
  [VehicleVerdictCode.SoundBuy]: { tone: "success" },
  [VehicleVerdictCode.ConsiderWithCaution]: { tone: "warning" },
  [VehicleVerdictCode.BudgetStretch]: { tone: "danger" },
  [VehicleVerdictCode.InsufficientData]: { tone: "neutral" },
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

function Stat({ icon: Icon, label, value, subValue }: { icon: any; label: string; value: string; subValue?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3">
      <span className="flex items-center gap-1.5 text-[0.66rem] font-[900] uppercase tracking-[0.05em] text-[#9a9286]">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </span>
      <span className="text-[0.95rem] font-[850] tabular-nums text-foreground">{value}</span>
      {subValue && <span className="text-[0.75rem] font-medium text-[var(--muted)]">{subValue}</span>}
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

export function VerdictReportOld({ report, onReset }: VerdictReportProps) {
  const { result, profile, request } = report;
  const verdictConfig = VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG[VehicleVerdictCode.InsufficientData];
  const confidenceTone =
    result.confidence === ExtractionConfidence.High ? "success" : result.confidence === ExtractionConfidence.Medium ? "warning" : "neutral";

  const title =
    [profile?.identity.yearOfManufacture, profile?.identity.make, profile?.identity.model].filter(Boolean).join(" ") ||
    [request.manual?.year, request.manual?.make, request.manual?.model].filter(Boolean).join(" ") ||
    report.listing?.title ||
    "Vehicle";
  const registration = profile?.registration || request.registration;

  const budgetFitTone = 
    result.budgetFit.rating === BudgetFitCode.Comfortable ? "text-green-600 bg-green-50" :
    result.budgetFit.rating === BudgetFitCode.Tight ? "text-amber-600 bg-amber-50" :
    result.budgetFit.rating === BudgetFitCode.Over ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50";

  return (
    <div className="flex flex-col gap-5 pb-12">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-foreground">Your MOT Check</h1>
        <Button onClick={onReset} size="sm" variant="secondary">Check another</Button>
      </div>

      {/* Hero Section */}
      <section className={`flex flex-col gap-4 rounded-[24px] border border-[var(--line)] p-6 sm:p-7 ${TONE_HERO[verdictConfig.tone]}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
           <Badge variant="neutral" className="font-[800] uppercase tracking-widest bg-[#fcd404] text-black border-[#d8b707]">
             {registration}
           </Badge>
          <Badge variant={confidenceTone as any} className="font-[800] capitalize">
            {result.confidence} confidence
          </Badge>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-[clamp(1.5rem,3vw,2rem)] font-[900] leading-[1.05] tracking-[-0.04em] text-foreground">
            {result.headline}
          </h2>
          <span className="text-[0.95rem] font-bold text-[#625c52]">{title}</span>
        </div>

        <p className="m-0 text-[0.95rem] leading-[1.5] text-foreground">{result.summary}</p>

        {result.nextStep && (
          <div className="flex items-start gap-2.5 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
            <ArrowRight className="mt-0.5 size-4 shrink-0 text-[var(--blue)]" aria-hidden />
            <p className="m-0 text-[0.9rem] font-[700] leading-[1.45] text-foreground">{result.nextStep}</p>
          </div>
        )}
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat 
          icon={ReceiptText} 
          label="Your Budget" 
          value={money(request.totalBudget)} 
        />
        <div className="col-span-2 flex flex-col gap-1 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 sm:col-span-1">
           <span className="flex items-center gap-1.5 text-[0.66rem] font-[900] uppercase tracking-[0.05em] text-[#9a9286]">
            <ShieldCheck className="size-3.5" aria-hidden />
            Budget Fit
          </span>
          <span className={`w-fit rounded px-1.5 py-0.5 text-[0.85rem] font-[850] uppercase tracking-wider ${budgetFitTone}`}>
            {result.budgetFit.rating}
          </span>
        </div>
        <Stat 
          icon={Tag} 
          label="Est. Value" 
          value={`${money(result.valueEstimate.typicalPriceLow)} - ${money(result.valueEstimate.typicalPriceHigh)}`} 
          subValue={result.valueEstimate.basis}
        />
        <Stat 
          icon={Wrench} 
          label="Near-Term Repairs" 
          value={`${money(result.runningCost.nearTermRepairLow)} - ${money(result.runningCost.nearTermRepairHigh)}`} 
        />
      </div>

      {/* Price guidance — only when there's a price on the table */}
      {result.priceGuidance && (
        <section className="flex flex-col gap-3 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
          <h2 className="m-0 text-[1.15rem] font-[900] text-foreground">{result.priceGuidance.framing}</h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {result.priceGuidance.maxSensible != null && (
              <Stat icon={Tag} label="Max sensible" value={money(result.priceGuidance.maxSensible)} />
            )}
            {result.priceGuidance.walkAwayAbove != null && (
              <Stat icon={AlertCircle} label="Walk away above" value={money(result.priceGuidance.walkAwayAbove)} />
            )}
          </div>
          <p className="m-0 text-[0.9rem] leading-relaxed text-[var(--muted)]">{result.priceGuidance.note}</p>
        </section>
      )}

      {/* Findings */}
      {result.findings.length > 0 && (
        <section className="flex flex-col gap-3 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
          <h2 className="m-0 text-[1.15rem] font-[900] text-foreground">Ralph's Findings</h2>
          <div className="flex flex-col gap-4">
            {result.findings.map((finding, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="mt-0.5 shrink-0">
                  {finding.tone === FindingTone.Good ? (
                    <Info className="size-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="size-5 text-amber-500" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.95rem] font-bold text-foreground">{finding.title}</span>
                  <span className="text-[0.9rem] text-[var(--muted)]">{finding.evidence}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Checklists */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {result.whatToCheck.length > 0 && (
          <div className="flex flex-col gap-3 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-5">
            <h3 className="text-[0.95rem] font-bold flex items-center gap-1.5"><ShieldCheck className="size-4 text-[var(--blue)]" /> What to check in person</h3>
            <ul className="flex flex-col gap-2">
              {result.whatToCheck.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-[0.88rem] text-[var(--muted)]">
                  <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--blue)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.couldNotVerify.length > 0 && (
          <div className="flex flex-col gap-3 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-5">
            <h3 className="text-[0.95rem] font-bold flex items-center gap-1.5"><AlertCircle className="size-4 text-amber-500" /> What we couldn't verify</h3>
            <ul className="flex flex-col gap-2">
              {result.couldNotVerify.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-[0.88rem] text-[var(--muted)]">
                  <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Disclosure title="Budget Fit Details">
        <p className="text-[0.9rem] text-[var(--muted)] leading-relaxed">{result.budgetFit.note}</p>
      </Disclosure>

      <Disclosure title="Running Cost Outlook">
        <p className="text-[0.9rem] text-[var(--muted)] leading-relaxed">{result.runningCost.note}</p>
      </Disclosure>

    </div>
  );
}
