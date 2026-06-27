import { SupabaseClient, User } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export function isSupabaseConfigured(): boolean {
    return Boolean(supabaseUrl) && Boolean(supabaseAnonKey);
}
let browserClient: SupabaseClient | null = null;
export function getSupabaseBrowserClient(): SupabaseClient | null {
    if (!isSupabaseConfigured()) {
        return null;
    }
    if (!browserClient) {
        browserClient = createBrowserClient(supabaseUrl as string, supabaseAnonKey as string);
    }
    return browserClient;
}
export function useSession() {
    const queryClient = useQueryClient();
    useEffect(() => {
        if (!isSupabaseConfigured())
            return;
        const client = getSupabaseBrowserClient();
        if (!client)
            return;
        const { data: { subscription }, } = client.auth.onAuthStateChange((_event, session) => {
            queryClient.setQueryData(["session"], session?.user ?? null);
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [queryClient]);
    return useQuery({
        queryKey: ["session"],
        queryFn: async (): Promise<User | null> => {
            const client = getSupabaseBrowserClient();
            if (!client)
                return null;
            const { data } = await client.auth.getSession();
            return data.session?.user ?? null;
        },
        staleTime: Infinity,
        enabled: isSupabaseConfigured(),
    });
}
export type RalphUser = User;
