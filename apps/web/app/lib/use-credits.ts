import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "./supabase";

export interface CreditSummary {
    balance: number;
    total: number;
}

const EMPTY: CreditSummary = { balance: 0, total: 0 };

async function fetchCreditSummary(): Promise<CreditSummary> {
    const supabase = getSupabaseBrowserClient();
    if (!supabase)
        return EMPTY;
    const { data, error } = await supabase
        .from("credits_ledger")
        .select("amount");
    if (error) {
        throw error;
    }
    const rows = data ?? [];
    return rows.reduce<CreditSummary>(
        (acc, item) => ({
            balance: acc.balance + item.amount,
            total: acc.total + (item.amount > 0 ? item.amount : 0),
        }),
        { ...EMPTY },
    );
}

export function useCredits(userId?: string) {
    return useQuery({
        queryKey: ["credits", userId],
        queryFn: fetchCreditSummary,
        staleTime: 30000,
        enabled: !!userId,
    });
}
