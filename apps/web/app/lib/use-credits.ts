import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "./supabase";
async function fetchCreditBalance(): Promise<number> {
    const supabase = getSupabaseBrowserClient();
    if (!supabase)
        return 0;
    const { data, error } = await supabase
        .from("credits_ledger")
        .select("amount");
    if (error) {
        throw error;
    }
    return (data ?? []).reduce((sum, item) => sum + item.amount, 0);
}
export function useCredits() {
    return useQuery({
        queryKey: ["credits"],
        queryFn: fetchCreditBalance,
        staleTime: 30000,
    });
}
