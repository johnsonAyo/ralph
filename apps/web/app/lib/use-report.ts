import { useQuery } from "@tanstack/react-query";
import { reportSnapshotSchema, ReportSnapshot } from "@ralph/shared";
import { API_BASE_URL } from "../constants";
import { getSupabaseBrowserClient } from "./supabase";

async function fetchReport(id: string): Promise<ReportSnapshot> {
    const supabase = getSupabaseBrowserClient();
    const accessToken = supabase
        ? (await supabase.auth.getSession()).data.session?.access_token
        : null;
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (response.status === 404) {
        throw new Error("Report not found.");
    }
    if (!response.ok) {
        throw new Error("Failed to load report.");
    }
    return reportSnapshotSchema.parse(await response.json());
}

export function useReport(id: string | undefined) {
    return useQuery({
        queryKey: ["report", id],
        queryFn: () => fetchReport(id as string),
        enabled: !!id,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status === "completed" || status === "failed" ? false : 4000;
        },
    });
}
