"use client";
import "../dashboard.css";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { VerdictForm } from "./verdict-form";
import { VerdictReport } from "./verdict-report";
import type { VehicleVerdictRequest, VehicleVerdictReport } from "@ralph/shared";
import { getSupabaseBrowserClient } from "../../lib/supabase";
import { useReport } from "../../lib/use-report";
import { API_BASE_URL } from "../../constants";

function VerdictPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const savedId = searchParams.get("id") ?? undefined;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<VehicleVerdictReport | null>(null);

  // When opened from history (?id=), load the saved report back from the DB.
  const { data: saved, isLoading: loadingSaved, isError: savedError } = useReport(savedId);
  const savedReport: VehicleVerdictReport | null =
    saved && saved.type === "reg_check" && saved.result
      ? {
          request: saved.request,
          profile: saved.profile,
          result: saved.result,
          generatedAt: saved.updatedAt,
        }
      : null;

  const handleSubmit = async (data: VehicleVerdictRequest) => {
    setIsLoading(true);
    setError("");
    try {
      const supabase = getSupabaseBrowserClient();
      const accessToken = supabase
        ? (await supabase.auth.getSession()).data.session?.access_token
        : null;

      const response = await fetch(`${API_BASE_URL}/vehicle/verdict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch vehicle verdict. Please check the registration and try again.");
      }

      const result = await response.json();
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setError("");
    if (savedId) {
      router.push("/dashboard/verdict");
    }
  };

  // Reopening a saved report from history.
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
            <Link href="/dashboard/verdict" className="font-bold text-[var(--blue)] hover:underline">
              Run a new check
            </Link>
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

  return (
    <div className="dashboard-page">
      <div className="mx-auto w-full max-w-3xl">
        {!report ? (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-[1.7rem]">
                MOT & Reg Check
              </h1>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-[var(--muted)] max-w-2xl">
                Enter a UK registration and your budget. Ralph will analyse the MOT history, typical market value, and upcoming running costs to give you a definitive verdict.
              </p>
            </header>
            <VerdictForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
          </>
        ) : (
          <VerdictReport report={report} onReset={handleReset} />
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
