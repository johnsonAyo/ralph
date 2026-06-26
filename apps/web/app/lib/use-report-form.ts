import { FormEvent, useCallback, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RiskTolerance } from "@/app/types";
import { useCreateReport } from "./use-create-report";

const BUDGET_PATTERN = /^[£]?\s*([\d,]+)/;

function parseBudget(raw: string): number | null {
  const match = raw.match(BUDGET_PATTERN);
  if (!match) return null;
  const value = parseFloat(match[1].replace(/,/g, ""));
  return Number.isNaN(value) ? null : value;
}

export function useReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync, isPending } = useCreateReport();

  const [listingUrl, setListingUrl] = useState(searchParams?.get("url") ?? "");
  const [budget, setBudget] = useState("");
  const [postcode, setPostcode] = useState("");
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("cautious");
  const [formError, setFormError] = useState("");

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setFormError("");

      const totalUserBudget = parseBudget(budget);
      if (!totalUserBudget || totalUserBudget <= 0) {
        setFormError("Please enter a valid budget (e.g. £4,000).");
        return;
      }

      if (!listingUrl.trim()) {
        setFormError("Please paste a listing URL.");
        return;
      }

      if (!postcode.trim()) {
        setFormError("Please enter your postcode.");
        return;
      }

      try {
        const report = await mutateAsync({
          listingUrl: listingUrl.trim(),
          totalUserBudget,
          postcode: postcode.trim(),
          riskTolerance,
        });
        router.push(`/reports/${report.id}`);
      } catch (err) {
        if (err instanceof Error && err.message === "UNAUTHENTICATED") {
          const next = encodeURIComponent(`/reports/pending`);
          router.push(`/auth?next=${next}`);
          return;
        }
        setFormError(
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
        );
      }
    },
    [budget, listingUrl, mutateAsync, postcode, riskTolerance, router],
  );

  return {
    listingUrl,
    setListingUrl,
    budget,
    setBudget,
    postcode,
    setPostcode,
    riskTolerance,
    setRiskTolerance,
    formError,
    isSubmitting: isPending,
    submit,
  };
}
