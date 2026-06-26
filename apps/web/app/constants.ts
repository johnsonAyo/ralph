import { PricingItem, AuthPlatform, WhyUseCard, AboutSection, FaqItem } from "@/app/types";

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

export const authPlatforms: AuthPlatform[] = [
  {
    id: "copart",
    name: "Copart UK",
    subtitle: "Salvage and clean vehicle lots",
    iconName: "Warehouse"
  },
  {
    id: "iaa",
    name: "IAA",
    subtitle: "Insurance Auto Auctions",
    iconName: "ScrollText"
  }
];

export const signInBenefits: Array<{
  title: string;
  body: string;
  iconName: "BookmarkCheck" | "History" | "Lock";
}> = [
  {
    title: "Save your reports",
    body: "Every check lands in your account for later.",
    iconName: "BookmarkCheck"
  },
  {
    title: "Revisit on any device",
    body: "Magic-link sign-in keeps the session in sync.",
    iconName: "History"
  },
  {
    title: "Encrypted at rest",
    body: "Reports and photos are encrypted by Supabase.",
    iconName: "Lock"
  }
];

export const whyUseCards: WhyUseCard[] = [
  {
    title: "Reads the listing",
    body: "Ralph pulls the title, photos, damage notes, mileage and price straight from the auction.",
    iconName: "FileSearch"
  },
  {
    title: "Calls the cost honestly",
    body: "Auction fees, delivery, repair allowance and a risk buffer — added up before the bid.",
    iconName: "Receipt"
  },
  {
    title: "Independent of sellers",
    body: "Ralph is paid by you. Not by any auction house, dealer or commission structure.",
    iconName: "ShieldCheck"
  },
  {
    title: "Smart price range",
    body: "A target range and a skip point, not just good or bad. Ralph shows his working.",
    iconName: "Target"
  },
  {
    title: "Reads the photos",
    body: "Ralph flags what's visible, what's cropped, and what is not shown in the photo set.",
    iconName: "Camera"
  },
  {
    title: "Expert review when needed",
    body: "Human review is a paid add-on. Ralph surfaces it where the photos leave a real gap.",
    iconName: "Users"
  }
];

export const aboutIntro =
  "Ask Ralph reads live Copart and IAA listings and turns each into a budget-fit report you can act on. Here is exactly how he reads the data, what he gives you, where he stops and what happens after you sign in.";

export const aboutSections: AboutSection[] = [
  {
    id: "about-data",
    heading: "Where Ralph gets his data",
    body:
      "Ralph reads live listings from Copart UK and IAA. He uses the listing title, photo set, damage description, mileage, current bid and the auction site. Each report names which platform the data came from so you can verify the source."
  },
  {
    id: "about-outputs",
    heading: "What Ralph gives you",
    body:
      "A verdict (Consider, Negotiation or Skip), a target price range, a sensible maximum bid, a repair allowance, a total-cost breakdown, photo notes, the things he could not verify, and a recommendation on whether expert review would help."
  },
  {
    id: "about-verdict",
    heading: "How Ralph decides",
    body:
      "Damage pattern + your full budget + delivery quote + repair allowance + fees = a budget-fit verdict. Ralph keeps the surface simple and hides the arithmetic unless you want to drill in."
  },
  {
    id: "about-limits",
    heading: "Where Ralph stops",
    body:
      "Ralph reads the listing. He cannot drive the car, photograph panels the seller did not include, or guarantee where the auction will land. Expert review exists for that gap — Ralph surfaces it where it actually matters."
  },
  {
    id: "about-pricing",
    heading: "Sign-in and pricing",
    body:
      "Magic-link sign-in via Supabase. Starter is £19 for one check, Buyer is £69 for five, and Protected is £149 for ten including one standard expert review. One sample check is free so you can see a full report before paying."
  }
];

export const faqs: FaqItem[] = [
  {
    question: "What is Ask Ralph?",
    answer:
      "Ralph is an intelligence layer that reads a Copart or IAA listing — title, photos, damage, mileage and price — and turns it into a budget-fit report before you bid."
  },
  {
    question: "Which auction platforms does Ralph check?",
    answer:
      "Copart UK and IAA. Each report shows the platform and the auction site the listing came from so you can trace every figure Ralph used."
  },
  {
    question: "Does Ralph tell me whether to bid?",
    answer:
      "Ralph gives you a target range, a sensible maximum and a verdict (Consider, Negotiation or Skip). He does not bid on your behalf — the decision stays with you."
  },
  {
    question: "What does Ralph's report include?",
    answer:
      "Verdict, target price range, repair allowance, full budget breakdown, the photo clues that matter, what Ralph could not verify, and a recommendation on expert review."
  },
  {
    question: "How is Ralph different from a vehicle history check?",
    answer:
      "A history check looks at the past record of the car. Ralph looks at the listing in front of you — price, condition, mileage pattern and your budget — and decides whether the package lines up."
  },
  {
    question: "What is expert review?",
    answer:
      "A paid human review you can add when Ralph's certainty is low. It is useful when the wheel area or front damage is unclear, or when the budget fit is borderline and a real judgement call is needed."
  },
  {
    question: "How much does Ralph cost?",
    answer:
      "Starter is £19 for one check, Buyer is £69 for five, and Protected is £149 for ten. Expert review is included once on Protected and can be added on the others. One sample check is free."
  }
];
