import { useMutation } from "@tanstack/react-query";
import { API_BASE_URL } from "../constants";
import { getSupabaseBrowserClient } from "./supabase";
import { StripePriceLookupKey } from "@/app/types";
async function startCheckout(tier: StripePriceLookupKey): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const accessToken = supabase
        ? (await supabase.auth.getSession()).data.session?.access_token
        : null;
    if (!accessToken) {
        window.location.href = "/auth?next=/#pricing";
        return;
    }
    const response = await fetch(`${API_BASE_URL}/payments/checkout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tier }),
    });
    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error((payload as {
            message?: string;
        }).message ?? "Failed to start checkout.");
    }
    const { url } = (await response.json()) as {
        url: string;
    };
    window.location.href = url;
}
export function useCheckout() {
    return useMutation<void, Error, StripePriceLookupKey>({
        mutationFn: startCheckout,
    });
}
