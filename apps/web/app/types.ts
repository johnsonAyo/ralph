import { ReactNode } from "react";

export interface CTAProps {
  children?: ReactNode;
  variant?: "primary" | "secondary" | string;
}

export type PricingItem = [string, string, string, string[]];

export type OutcomeType = "bought" | "walked-away" | "negotiated" | "deciding" | null;
