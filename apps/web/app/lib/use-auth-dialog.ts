"use client";

import { useEffect, useState } from "react";

export type AuthDialogMode = "drawer" | "modal";
type State = { open: boolean; mode: AuthDialogMode };

const EVT = "ralph:auth-dialog";
let current: State = { open: false, mode: "modal" };

function emit(next: State) {
  current = next;
  window.dispatchEvent(new CustomEvent<State>(EVT, { detail: next }));
}

// Global auth-dialog state. The form opens as a drawer (from the nav "Sign in")
// or a modal (from a CTA button) — not a separate page. Event-based so any
// trigger and the dialog itself stay in sync.
export function openAuth(mode: AuthDialogMode) {
  emit({ open: true, mode });
}
export function closeAuth() {
  emit({ open: false, mode: current.mode });
}

export function useAuthDialog() {
  const [state, setState] = useState<State>(current);
  useEffect(() => {
    const on = (e: Event) => setState((e as CustomEvent<State>).detail);
    window.addEventListener(EVT, on as EventListener);
    return () => window.removeEventListener(EVT, on as EventListener);
  }, []);
  return { isOpen: state.open, mode: state.mode, close: closeAuth };
}
