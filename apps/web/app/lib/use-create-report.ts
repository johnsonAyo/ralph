import { useMutation } from "@tanstack/react-query";
import { reportSnapshotSchema, ReportSnapshot } from "@ralph/shared";
import { API_BASE_URL } from "../constants";
import { getSupabaseBrowserClient } from "./supabase";
import { CreateReportInput } from "@/app/types";
async function createReport(input: CreateReportInput): Promise<ReportSnapshot> {
    const supabase = getSupabaseBrowserClient();
    const accessToken = supabase
        ? (await supabase.auth.getSession()).data.session?.access_token
        : null;
    const response = await fetch(`${API_BASE_URL}/reports`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
            listingUrl: input.listingUrl,
            totalUserBudget: input.totalUserBudget,
            postcode: input.postcode,
            riskTolerance: input.riskTolerance,
            listing: input.listing,
        }),
    });
    if (response.status === 401) {
        throw new Error("UNAUTHENTICATED");
    }
    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error((payload as {
            message?: string;
        }).message ?? "Failed to create report.");
    }
    return reportSnapshotSchema.parse(await response.json());
}
export function useCreateReport() {
    return useMutation({
        mutationFn: createReport,
    });
}
