import { useQuery } from "@tanstack/react-query";
import { reportSnapshotSchema, ReportSnapshot } from "@ralph/shared";
import { z } from "zod";
import { API_BASE_URL } from "../constants";
import { getSupabaseBrowserClient } from "./supabase";
const reportsArraySchema = z.array(reportSnapshotSchema);
async function fetchReports(): Promise<ReportSnapshot[]> {
    const supabase = getSupabaseBrowserClient();
    const accessToken = supabase
        ? (await supabase.auth.getSession()).data.session?.access_token
        : null;
    const response = await fetch(`${API_BASE_URL}/reports`, {
        headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
    });
    if (!response.ok) {
        throw new Error("Failed to load reports.");
    }
    const payload = await response.json();
    return reportsArraySchema.parse(payload);
}
export function useReports() {
    return useQuery({
        queryKey: ["reports"],
        queryFn: fetchReports,
        staleTime: 30000,
    });
}
