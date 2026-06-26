export const STARTER_CREDITS = 1;
export const BUYER_CREDITS = 5;
export const PROTECTED_CREDITS = 10;

export const CREDIT_TOPUP_EVENT_TYPE = "credit_purchase";

export const STRIPE_PRICE_LOOKUP_KEY_STARTER = "starter";
export const STRIPE_PRICE_LOOKUP_KEY_BUYER = "buyer";
export const STRIPE_PRICE_LOOKUP_KEY_PROTECTED = "protected";

export const CREDITS_BY_TIER: Record<string, number> = {
  [STRIPE_PRICE_LOOKUP_KEY_STARTER]: STARTER_CREDITS,
  [STRIPE_PRICE_LOOKUP_KEY_BUYER]: BUYER_CREDITS,
  [STRIPE_PRICE_LOOKUP_KEY_PROTECTED]: PROTECTED_CREDITS,
};

export const STRIPE_CHECKOUT_SUCCESS_PATH = "/dashboard/payment-success";
export const STRIPE_CHECKOUT_CANCEL_PATH = "/#pricing";
