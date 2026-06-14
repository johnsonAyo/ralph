import { PricingItem } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const reportAnswers: string[] = [
  "Is this car a good buy for my budget?",
  "What price range makes sense?",
  "What is the maximum I should pay?",
  "What costs am I missing?",
  "What do the mileage, damage and photos suggest?",
  "When would an expert check improve confidence?"
];

export const pricing: PricingItem[] = [
  [
    "Starter",
    "1 car check",
    "£19",
    [
      "Ralph's full budget-fit report",
      "Smart price range and maximum sensible price",
      "Mileage, damage and history notes",
      "One saved report"
    ]
  ],
  [
    "Buyer",
    "5 car checks",
    "£69",
    [
      "Everything in Starter",
      "Check multiple cars before choosing",
      "Photo and manual detail upload",
      "Saved report history"
    ]
  ],
  [
    "Protected",
    "10 car checks",
    "£149",
    [
      "Everything in Buyer",
      "One standard expert review included",
      "Priority support on unclear reports",
      "Best for serious buyers comparing options"
    ]
  ]
];

export const aiInputs: string[] = [
  "asking price or bid",
  "your full budget",
  "mileage",
  "damage photos",
  "damage type",
  "vehicle history",
  "delivery distance",
  "repair allowance"
];
