import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl) && Boolean(supabaseAnonKey);
}

let browserClient: SupabaseClient | null = null;

/**
 * Returns the singleton browser Supabase client, or `null` if Supabase isn't
 * configured on this deployment. Callers must check for `null` and render an
 * appropriate fallback (e.g. a "Setup required" panel) instead of crashing.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
  }

  return browserClient;
}

/**
 * TanStack Query hook that resolves the current Supabase session and
 * stays in sync with auth state changes (e.g. when detectSessionInUrl
 * finishes processing a magic-link hash fragment).
 *
 * - Initial data comes from getSession() (localStorage or network).
 * - A subscription to onAuthStateChange pushes live updates into the
 *   query cache so the component re-renders when the session changes.
 */
export function useSession() {
  const queryClient = useQueryClient();

  // Subscribe to auth state changes for the lifetime of the component.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const client = getSupabaseBrowserClient();
    if (!client) return;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
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
      if (!client) return null;

      const { data } = await client.auth.getSession();
      return data.session?.user ?? null;
    },
    staleTime: Infinity,
    enabled: isSupabaseConfigured(),
  });
}

export type RalphUser = User;
