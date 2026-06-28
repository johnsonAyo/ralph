import { FormEvent, useCallback, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RiskTolerance } from "@/app/types";
import { useCreateReport } from "./use-create-report";
function parseAmount(raw: string): number | null {
    const cleaned = raw.replace(/[£,\s]/g, "");
    const value = parseFloat(cleaned);
    return Number.isNaN(value) || value <= 0 ? null : value;
}
export function useReportForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { mutateAsync, isPending } = useCreateReport();
    const [listingUrl, setListingUrl] = useState(searchParams?.get("url") ?? "");
    const [budgetMin, setBudgetMin] = useState("");
    const [budgetMax, setBudgetMax] = useState("");
    const [postcode, setPostcode] = useState("");
    const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("cautious");
    const [formError, setFormError] = useState("");
    const min = parseAmount(budgetMin);
    const max = parseAmount(budgetMax);
    const isReady = listingUrl.trim().length > 0 &&
        postcode.trim().length > 0 &&
        min !== null &&
        max !== null &&
        min < max;
    const submit = useCallback(async (event: FormEvent, confirmedListing?: any) => {
        event.preventDefault();
        setFormError("");
        const min = parseAmount(budgetMin);
        const max = parseAmount(budgetMax);
        if (!min || min <= 0) {
            setFormError("Please enter a minimum budget (e.g. £3,000).");
            return;
        }
        if (!max || max <= 0) {
            setFormError("Please enter a maximum budget (e.g. £6,000).");
            return;
        }
        if (min >= max) {
            setFormError("Your maximum budget must be higher than your minimum.");
            return;
        }
        // Manual entry supplies `confirmedListing` directly and may have no URL.
        if (!confirmedListing && !listingUrl.trim()) {
            setFormError("Please paste a listing URL.");
            return;
        }
        if (!postcode.trim()) {
            setFormError("Please enter your postcode.");
            return;
        }
        try {
            const report = await mutateAsync({
                listingUrl: listingUrl.trim() || undefined,
                totalUserBudget: max,
                postcode: postcode.trim(),
                riskTolerance,
                listing: confirmedListing,
            });
            return report;
        }
        catch (err) {
            if (err instanceof Error && err.message === "UNAUTHENTICATED") {
                const next = encodeURIComponent(`/dashboard/new`);
                router.push(`/auth?next=${next}`);
                return;
            }
            setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        }
    }, [budgetMin, budgetMax, listingUrl, mutateAsync, postcode, riskTolerance, router]);
    return {
        listingUrl,
        setListingUrl,
        budgetMin,
        setBudgetMin,
        budgetMax,
        setBudgetMax,
        postcode,
        setPostcode,
        riskTolerance,
        setRiskTolerance,
        formError,
        isSubmitting: isPending,
        isReady,
        submit,
    };
}
