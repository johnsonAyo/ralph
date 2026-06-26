

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

import { StripePriceLookupKey } from "@/app/types";

const TIER_TO_LOOKUP: Record<string, StripePriceLookupKey> = {
  Starter: "starter",
  Buyer: "buyer",
  Protected: "protected",
};

export function getStripeLookupKey(displayTier: string): StripePriceLookupKey {
  const key = TIER_TO_LOOKUP[displayTier];
  if (!key) {
    throw new Error(
      `Unknown pricing tier "${displayTier}". Add it to TIER_TO_LOOKUP.`,
    );
  }
  return key;
}
