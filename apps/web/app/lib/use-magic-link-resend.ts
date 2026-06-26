import { FormEvent, useCallback, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "./supabase";

const DEFAULT_COOLDOWN_MS = 60_000;

interface UseMagicLinkResendOptions {
  email: string | undefined;
  
  emailRedirectTo: string;
  cooldownMs?: number;
}

export function useMagicLinkResend({
  email,
  emailRedirectTo,
  cooldownMs = DEFAULT_COOLDOWN_MS,
}: UseMagicLinkResendOptions) {
  const lastSentAt = useRef<number | null>(null);

  const [resendMessage, setResendMessage] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!email) return;

      if (lastSentAt.current && Date.now() - lastSentAt.current < cooldownMs) {
        setResendMessage("Please wait a moment before resending.");
        return;
      }

      setIsSubmitting(true);
      setResendMessage("");
      setResendSuccess(false);

      try {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          setResendMessage("Sign-in is not configured on this deployment.");
          return;
        }

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo },
        });

        if (error) throw error;

        lastSentAt.current = Date.now();
        setResendSuccess(true);
        setResendMessage("Magic link sent. Check your inbox.");
      } catch (err) {
        setResendMessage(
          err instanceof Error ? err.message : "Failed to send magic link.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [cooldownMs, email, emailRedirectTo],
  );

  return { resendMessage, resendSuccess, isSubmitting, submit };
}
