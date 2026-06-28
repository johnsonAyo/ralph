import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "../constants";
import { getSupabaseBrowserClient } from "./supabase";

async function deleteReport(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const accessToken = supabase
    ? (await supabase.auth.getSession()).data.session?.access_token
    : null;
  const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
    method: "DELETE",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to delete report.");
  }
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
