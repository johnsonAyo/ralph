"use client";
import "../dashboard.css";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Hash, PencilLine } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  ListingSnapshot,
  VehicleVerdictRequest,
  VehicleVerdictReport,
} from "@ralph/shared";
import { AnalysisSource } from "@ralph/shared";
import { VerdictSmartForm } from "./verdict-smart-form";
import { ManualForm, type ManualDraft } from "./verdict-manual-form";
import { ManualConfirm } from "./verdict-manual-confirm";
import { VerdictReport } from "./verdict-report";
import ConfirmListing from "../../components/check-form/confirm-listing";
import { getSupabaseBrowserClient } from "../../lib/supabase";
import { useReport } from "../../lib/use-report";
import { API_BASE_URL } from "../../constants";

const TABS: { id: Tab; label: string; Icon: typeof Hash }[] = [
  { id: "smart", label: "Auto Search", Icon: Hash },
  { id: "manual", label: "Fill it in manually", Icon: PencilLine },
];

type Tab = "smart" | "manual";
type Stage = "input" | "confirm-listing" | "confirm-manual";

function VerdictPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const savedId = searchParams.get("id") ?? undefined;

  const [tab, setTab] = useState<Tab>("smart");
  const [stage, setStage] = useState<Stage>("input");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<VehicleVerdictReport | null>(null);

  // Listing confirm flow carries the fetched listing + the budget entered with it.
  const [fetchedListing, setFetchedListing] = useState<ListingSnapshot | null>(null);
  const [listingBudget, setListingBudget] = useState<{ totalBudget: number; askingPrice?: number; registration?: string } | null>(null);
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
      const result = await authedPost<VehicleVerdictReport>("/vehicle/verdict", request);
      setReport(result);
      if (result?.id) {
        window.history.replaceState(null, "", `/dashboard/verdict?id=${result.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  // --- Hybrid: Reg and/or Listing ---
  const handleHybridSubmit = async (data: { registration?: string; listingUrl?: string; totalBudget: number; askingPrice?: number }) => {
    setIsLoading(true);
    setError("");
    
    if (data.listingUrl) {
      try {
        const listing = await authedPost<ListingSnapshot>("/vehicle/preview-listing", { listingUrl: data.listingUrl });
        setFetchedListing(listing);
        setListingBudget({ 
          totalBudget: data.totalBudget, 
          askingPrice: data.askingPrice,
          registration: data.registration
        });
        setStage("confirm-listing");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't fetch that listing. Check the link or try manual entry.");
      } finally {
        setIsLoading(false);
      }
    } else if (data.registration) {
      analyse({ 
        registration: data.registration, 
        totalBudget: data.totalBudget, 
        askingPrice: data.askingPrice 
      });
    } else {
      setError("Please provide a registration or listing URL.");
      setIsLoading(false);
    }
  };

  const handleConfirmListing = (_e: React.FormEvent, edited: ListingSnapshot) => {
    if (!listingBudget) return;
    analyse({ 
      registration: listingBudget.registration,
      listing: edited, 
      totalBudget: listingBudget.totalBudget, 
      askingPrice: listingBudget.askingPrice 
    });
  };

  // --- Manual: fill → confirm/edit → analyse ---
  const handleReviewManual = (draft: ManualDraft) => {
    setManualDraft(draft);
    setStage("confirm-manual");
  };
  const handleConfirmManual = () => {
    if (!manualDraft) return;
    analyse({ manual: manualDraft.manual, totalBudget: manualDraft.totalBudget, askingPrice: manualDraft.askingPrice });
  };

  const handleReset = () => {
    setReport(null);
    setError("");
    setStage("input");
    setFetchedListing(null);
    setListingBudget(null);
    setManualDraft(null);
    if (savedId) {
      router.push("/dashboard/verdict");
    } else {
      window.history.replaceState(null, "", "/dashboard/verdict");
    }
  };

  function switchTab(next: Tab) {
    setTab(next);
    setStage("input");
    setError("");
    setFetchedListing(null);
    setManualDraft(null);
  }

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
        <div className="mx-auto w-full max-w-3xl">
          <VerdictReport report={savedReport} onReset={handleReset} />
        </div>
      </div>
    );
  }

  // ---- Fresh report ----
  if (report) {
    return (
      <div className="dashboard-page">
        <div className="mx-auto w-full max-w-3xl">
          <VerdictReport report={report} onReset={handleReset} />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="mx-auto w-full max-w-3xl">
        {/* Input method tabs */}
        <div className="mb-5 flex gap-2">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => switchTab(id)}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[0.9rem] font-[750] transition-colors ${
                  active
                    ? "border-[var(--blue)] bg-[rgba(47,98,233,0.08)] text-[var(--blue)]"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>

        {tab === "smart" && stage === "input" && (
          <VerdictSmartForm onSubmit={handleHybridSubmit} isLoading={isLoading} error={error} />
        )}

        {tab === "smart" && stage === "confirm-listing" && fetchedListing && (
          <ConfirmListing
            listing={fetchedListing}
            registration={listingBudget?.registration}
            submitting={isLoading}
            error={error || null}
            onBack={() => setStage("input")}
            onConfirm={handleConfirmListing}
          />
        )}

        {tab === "manual" && stage === "input" && (
          <ManualForm initial={manualDraft ?? undefined} onReview={handleReviewManual} isLoading={isLoading} error={error} />
        )}
        {tab === "manual" && stage === "confirm-manual" && manualDraft && (
          <ManualConfirm
            draft={manualDraft}
            submitting={isLoading}
            error={error || null}
            onEdit={() => setStage("input")}
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
