export type StripePriceLookupKey = "starter" | "buyer" | "protected";

export type CheckoutSessionMetadata = {
  userId: string;
  tier: StripePriceLookupKey;
};

export type CreateCheckoutRequest = {
  tier: StripePriceLookupKey;
};
