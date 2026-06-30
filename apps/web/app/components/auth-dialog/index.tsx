"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useAuthDialog } from "../../lib/use-auth-dialog";
import { useSession } from "../../lib/supabase";
import AuthForm from "../auth-form";

// Renders the shared AuthForm as a drawer (from the nav) or a modal (from a CTA).
// Mounted once globally. Closes on Escape, backdrop click, or a successful sign-in.
export default function AuthDialog() {
  const { isOpen, mode, close } = useAuthDialog();
  const { data: user } = useSession();

  useEffect(() => {
    if (isOpen && user) close();
  }, [isOpen, user, close]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="auth-overlay" role="presentation" onClick={close}>
      <div
        className={mode === "drawer" ? "auth-drawer" : "auth-modal"}
        role="dialog"
        aria-modal="true"
        aria-label="Sign in to Ask Ralph"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="auth-dialog-close" onClick={close} aria-label="Close">
          <X size={18} aria-hidden />
        </button>
        <AuthForm />
      </div>
    </div>
  );
}
