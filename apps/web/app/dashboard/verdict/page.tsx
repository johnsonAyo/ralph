"use client";
import "../dashboard.css";
import "./verdict-report.css";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  ListingSnapshot,
  VehicleVerdictRequest,
  VehicleVerdictReport,
} from "@ralph/shared";
import { 
  AnalysisSource, 
  VehicleSourceType,
  VehicleVerdictCode,
  BudgetFitCode,
  FindingTone,
} from "@ralph/shared";
import { SourceStep } from "./verdict-source-step";
import { RegStep } from "./verdict-reg-step";
import { DetailsStep } from "./verdict-details-step";
import { type ManualDraft } from "./verdict-manual-form";
import { ManualConfirm } from "./verdict-manual-confirm";
import { type LinkSubmitData } from "./verdict-link-form";
import { VerdictReport } from "./verdict-report";
import ConfirmListing from "../../components/check-form/confirm-listing";
import { getSupabaseBrowserClient } from "../../lib/supabase";
import { useReport } from "../../lib/use-report";
import { API_BASE_URL } from "../../constants";

type Step = "basics" | "details" | "confirm-listing" | "confirm-manual";

const STEP_LABELS = ["Vehicle Basics", "Details"] as const;
function stepIndex(step: Step): number {
  if (step === "basics") return 0;
  return 1; // details + both confirm stages
}

function parseSource(value: string | null): VehicleSourceType | undefined {
  if (!value) return undefined;
  return (Object.values(VehicleSourceType) as string[]).includes(value)
    ? (value as VehicleSourceType)
    : undefined;
}

function VerdictPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const savedId = searchParams.get("id") ?? undefined;
  const prefillReg = searchParams.get("reg") ?? undefined;
  const prefillUrl = searchParams.get("url") ?? undefined;
  const prefillSource = parseSource(searchParams.get("source"));

  // If a source is deep-linked we skip straight to the reg question by just having it prefilled.
  const [step, setStep] = useState<Step>("basics");
  const [sourceType, setSourceType] = useState<VehicleSourceType | null>(prefillSource ?? null);
  const [registration, setRegistration] = useState<string | undefined>(prefillReg);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<VehicleVerdictReport | null>(null);

  // Listing confirm flow carries the fetched listing + the money entered with it.
  const [fetchedListing, setFetchedListing] = useState<ListingSnapshot | null>(null);
  const [pending, setPending] = useState<{ totalBudget: number; askingPrice?: number } | null>(null);
  // Manual confirm flow.
  const [manualDraft, setManualDraft] = useState<ManualDraft | null>(null);

  // Reopen a saved report from history (?id=).
  const { data: saved, isLoading: loadingSaved, isError: savedError } = useReport(savedId);
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

  async function authedPost<T>(path: string, body: unknown): Promise<T> {
    const supabase = getSupabaseBrowserClient();
    const accessToken = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Something went wrong. Please try again.");
    }
    return response.json();
  }

  async function analyse(request: VehicleVerdictRequest) {
    setIsLoading(true);
    setError("");
    try {
      // TEMP DEV BYPASS: Return mock report to avoid rate limits during styling
      const mockReport: VehicleVerdictReport = {
        id: "mock-123",
        sources: [AnalysisSource.Manual],
        // TEMP: sample photos so the report carousel is visible during styling.
        request: {
          ...request,
          manual: {
            ...(request.manual ?? {}),
            images: [
              { fullUrl: "https://picsum.photos/seed/ralphcar1/1200/900" },
              { fullUrl: "https://picsum.photos/seed/ralphcar2/1200/900" },
              { fullUrl: "https://picsum.photos/seed/ralphcar3/1200/900" },
            ],
          },
        },
        result: {
          verdict: VehicleVerdictCode.ConsiderWithCaution,
          confidence: "medium" as any,
          headline: "Consider below £1,850",
          summary: "Ralph thinks this is possible if bidding stays controlled because the front-left damage may need more than cosmetic work.",
          budgetFit: { rating: BudgetFitCode.Tight, note: "Tight but possible if bidding remains controlled." },
          valueEstimate: { typicalPriceLow: 1600, typicalPriceHigh: 1850, basis: "Based on typical auction results for this condition." },
          runningCost: { nearTermRepairLow: 700, nearTermRepairHigh: 1200, note: "Allowance for bumper, headlight, paint, and suspension check." },
          priceGuidance: {
            maxSensible: 1850,
            walkAwayAbove: 1900,
            framing: "Ralph's target range",
            note: "If bidding moves fast, use Ralph's range before increasing your bid."
          },
          findings: [
            { tone: FindingTone.Watch, title: "Front-left damage", evidence: "May need more than cosmetic work." }
          ],
          whatToCheck: ["Suspension alignment", "Wheel area"],
          couldNotVerify: ["Final delivery quote"],
          nextStep: "Confirm the auction delivery quote before increasing the bid."
        },
        generatedAt: new Date().toISOString()
      };
      
      setReport(mockReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  // --- Step 1: source ---
  const handleSelectSource = (source: VehicleSourceType) => {
    setSourceType(source);
    setError("");
  };

  // --- Step 2: registration ---
  const handleRegContinue = (reg?: string) => {
    setRegistration(reg);
    setError("");
    setStep("details");
  };

  // --- Step 3a: link path (or reg-only when no link) ---
  const handleSubmitLink = async (data: LinkSubmitData) => {
    if (!sourceType) return;
    setError("");
    if (data.listingUrl) {
      setIsLoading(true);
      try {
        const listing = await authedPost<ListingSnapshot>("/vehicle/preview-listing", { listingUrl: data.listingUrl });
        setFetchedListing(listing);
        setPending({ totalBudget: data.totalBudget, askingPrice: undefined });
        setStep("confirm-listing");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't fetch that listing. Check the link or enter details manually.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // No link but we have a reg — analyse the reg + budget alone.
      analyse({
        sourceType,
        registration,
        totalBudget: data.totalBudget,
        askingPrice: undefined,
      });
    }
  };

  const handleConfirmListing = (_e: React.FormEvent, edited: ListingSnapshot) => {
    if (!sourceType || !pending) return;
    analyse({
      sourceType,
      registration,
      listing: edited,
      totalBudget: pending.totalBudget,
      askingPrice: pending.askingPrice,
    });
  };

  // --- Step 3b: manual path: fill → confirm → analyse ---
  const handleReviewManual = (draft: ManualDraft) => {
    setManualDraft(draft);
    setError("");
    setStep("confirm-manual");
  };
  const handleConfirmManual = () => {
    if (!sourceType || !manualDraft) return;
    analyse({
      sourceType,
      registration,
      manual: manualDraft.manual,
      totalBudget: manualDraft.totalBudget,
      askingPrice: manualDraft.askingPrice,
    });
  };

  const handleReset = () => {
    setReport(null);
    setError("");
    setStep("basics");
    setSourceType(prefillSource ?? null);
    setRegistration(prefillReg);
    setFetchedListing(null);
    setPending(null);
    setManualDraft(null);
    if (savedId) {
      router.push("/dashboard/verdict");
    } else {
      window.history.replaceState(null, "", "/dashboard/verdict");
    }
  };

  // ---- Reopened saved report ----
  if (savedId) {
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

  // ---- Fresh report ----
  if (report) {
    return (
      <div className="dashboard-page">
        <div className="mx-auto w-full max-w-5xl">
          <VerdictReport report={report} onReset={handleReset} />
        </div>
      </div>
    );
  }

  const current = stepIndex(step);

  return (
    <div className="dashboard-page">
      <div className="mx-auto w-full max-w-5xl">
        {/* Progress stepper */}
        <ol className="mb-12 flex items-center justify-center gap-4 max-w-4xl mx-auto w-full">
          {STEP_LABELS.map((label, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-[var(--font-label)] font-[900] transition ${
                    done
                      ? "bg-[var(--blue)] text-white"
                      : active
                        ? "border-2 border-[var(--blue)] text-[var(--blue)]"
                        : "border border-[var(--line)] text-[var(--muted)]"
                  }`}
                >
                  {done ? <Check className="size-4" aria-hidden /> : i + 1}
                </span>
                <span
                  className={`text-[var(--font-body)] font-[800] ${
                    active ? "text-foreground" : "text-[var(--muted)]"
                  }`}
                >
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <span className={`h-px flex-1 ${done ? "bg-[var(--blue)]" : "bg-[var(--line)]"}`} />
                )}
              </li>
            );
          })}
        </ol>

        {step === "basics" && (
          <div className="flex flex-col gap-12">
            <SourceStep
              selected={sourceType ?? undefined}
              onSelect={handleSelectSource}
            />
            {sourceType && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <RegStep
                  sourceType={sourceType}
                  initialReg={registration}
                  onContinue={handleRegContinue}
                />
              </div>
            )}
          </div>
        )}

        {step === "details" && sourceType && (
          <DetailsStep
            sourceType={sourceType}
            hasReg={Boolean(registration)}
            initialUrl={prefillUrl}
            manualInitial={manualDraft ?? undefined}
            isLoading={isLoading}
            error={error}
            onSubmitLink={handleSubmitLink}
            onReviewManual={handleReviewManual}
            onBack={() => setStep("basics")}
          />
        )}

        {step === "confirm-listing" && fetchedListing && (
          <ConfirmListing
            listing={fetchedListing}
            registration={registration}
            submitting={isLoading}
            error={error || null}
            onBack={() => setStep("details")}
            onConfirm={handleConfirmListing}
          />
        )}

        {step === "confirm-manual" && manualDraft && (
          <ManualConfirm
            draft={manualDraft}
            submitting={isLoading}
            error={error || null}
            onEdit={() => setStep("details")}
            onConfirm={handleConfirmManual}
          />
        )}
      </div>
    </div>
  );
}

export default function VerdictPage() {
  return (
    <Suspense fallback={null}>
      <VerdictPageInner />
    </Suspense>
  );
}
