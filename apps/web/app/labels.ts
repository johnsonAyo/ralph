export const landingLabels = {
    hero: {
        eyebrow: "Ralph guides your decision before you buy",
        title: "Found a car online? Ask Ralph before you buy.",
        copy: "Paste a listing or start with the information you have. Ralph checks the price, mileage, damage, history, photos and your budget.",
        cta: "Ask Ralph About This Car",
        subtext: "An intelligence layer that guides your decision before you buy. One sample check is on us.",
    },
    aiExplainer: {
        title: "How Ralph turns a listing into a budget-fit report.",
        copy: "Ralph takes the car details, your budget, and your risk appetite, then estimates a cost-effective target price with a full breakdown from auction to your door. A good car at the wrong price is still the wrong buy.",
    },
    form: {
        introTitle: "Tell Ralph what you know",
        introCopy: "Manual details and photo upload come inside the full check flow.",
        sourceLabel: "Listing source",
        sourceHint: "Works best when the listing has photos, mileage, price and damage notes.",
        sourceOptions: {
            marketplace: "Marketplace listing",
            auction: "Auction listing",
            dealer: "Dealer listing",
            private: "Private seller",
        },
        budgetLabel: "Budget range",
        budgetHint: "Ralph will target the best deal within your range.",
        listingUrlLabel: "Listing URL",
        listingUrlHint: "Paste the car advert, auction lot or dealer page.",
        postcodeLabel: "Your postcode",
        postcodeHint: "Used for delivery and distance pressure.",
        riskLabel: "How cautious should the check be?",
        riskHint: "Careful is recommended when you do not know the car market well.",
        riskOptions: {
            cautious: { title: "Careful", desc: "Best for normal buyers" },
            balanced: { title: "Balanced", desc: "Some repair risk is okay" },
            flexible: { title: "Experienced", desc: "For buyers with repair support" },
        },
        buttonText: "Ask Ralph About This Car",
        buttonLoadingText: "Running check...",
    },
    answers: {
        title: "Ralph answers the questions every buyer should ask, but most don't.",
    },
    budget: {
        title: "Ralph adds up the costs the auction page leaves out.",
        copy: "Most buyers only see the asking price. Ralph breaks down every cost from auction to your doorstep: fees, delivery, repairs, and risk buffer, so you know your real spend before you commit.",
    },
    why: {
        title: "Check the car before the auction price decides for you.",
    },
    pricing: {
        title: "Choose how much help you want from Ralph.",
        note: "Start with a free check on one car, analyse a shortlist, or go Protected when you want an expert to validate Ralph's analysis before you hand over your money.",
    },
    about: {
        title: "How Ask Ralph works, what he reads, and where he stops.",
    },
    faqs: {
        title: "The questions Ralph hears most often.",
    },
    footer: {
        title: "Don't buy blind. Let Ralph check it first.",
        copy: "Ralph guides your decision before you buy, from the listing price to your door.",
    },
};
export const dashboardLabels = {
    title: "Ralph checks",
    sub: "Every check you run is saved here. Revisit verdicts, bid guidance, and the evidence Ralph used.",
    emptyState: "No reports or check available yet. Your checks will appear here.",
};
export const profileLabels = {
    signInLinkCopy: "Send a sign-in link to your email to access Ask Ralph on another device.",
    signOutCopy: "You will be redirected to the home page.",
};
export const successLabels = {
    title: "Thank you for your purchase!",
    sub: "Your payment has been processed successfully. Your account balance is being updated with your new credits.",
};
export const authLabels = {
    title: "Sign in or create an account",
    copy: "Enter your email to continue. We'll send a secure sign-in link to your inbox.",
    platformsKicker: "Ralph reads live listings from these auction platforms",
    buttonText: "Continue with Email",
    buttonLoadingText: "Sending link...",
    successMessage: "A secure sign-in link has been sent to your email.",
    legalDisclaimer: "By continuing, you agree to Ask Ralph's Terms of Service, Privacy Policy, and Cookie Policy."
};
export const reportPreviewLabels = {
    nav: [
        { href: "#report-bid-limit", label: "Bid limit" },
        { href: "#report-reasons", label: "Reasons" },
        { href: "#report-noticed", label: "Noticed" },
        { href: "#report-repairs", label: "Repairs" },
        { href: "#report-verify", label: "Verify" },
        { href: "#report-before-bid", label: "Before you bid" },
    ],
    summaryChips: [
        ["Budget fit", "Tight but possible"],
        ["Ralph's certainty", "Medium"],
        ["Main concern", "Front-left impact"],
        ["Expert review", "Could help"],
    ],
    reasons: [
        {
            level: "Major",
            title: "The front-left damage may need more than cosmetic work",
            evidence: "Photos, damage field, and wheel angle all point to possible suspension or alignment work.",
        },
        {
            level: "Watch",
            title: "Ralph thinks the budget is workable only if bidding stays controlled",
            evidence: "The current bid still leaves a narrow but real bidding window before Ralph's suggested skip point.",
        },
        {
            level: "Helpful",
            title: "The mileage pattern looks steady enough to support the report",
            evidence: "Visible history does not show an obvious mileage jump, which helps confidence without proving condition.",
        },
    ],
    noticed: [
        {
            photo: "Photo 4",
            title: "Front-left corner",
            note: "Ralph would not treat this as a simple bumper-only repair because the wheel area is not fully clear.",
        },
        {
            photo: "Photo 6",
            title: "Headlight and wing",
            note: "The gap pattern suggests paint and panel work may be part of the real repair allowance.",
        },
        {
            photo: "Photo 8",
            title: "Wheel stance",
            note: "The wheel angle makes suspension and alignment checks hard to dismiss.",
        },
    ],
    repairWork: [
        "bumper / trim",
        "headlight",
        "paint blending",
        "wheel or suspension check",
    ],
    hiddenChecks: [
        "suspension alignment",
        "radiator support",
        "wheel area",
    ],
    missingInfo: [
        "Final delivery quote is not locked unless you enter it.",
        "Ralph could not verify the suspension area from the available photos.",
        "A missing registration number would stop MOT history from being checked.",
    ],
    beforeBid: [
        "Confirm the auction delivery quote before increasing the bid.",
        "Recheck the front-left wheel area in the listing photos.",
        "Use Ralph's suggested skip point if bidding moves fast.",
        "Open expert review if the suspension area still feels unclear.",
    ],
    drawerToc: [
        { id: "reasons", label: "Reasons" },
        { id: "noticed", label: "Photos" },
        { id: "repairs", label: "Repairs" },
        { id: "budget", label: "Budget" },
        { id: "verify", label: "Missing info" },
    ],
    drawers: {
        summaryText: "Ralph does not dodge the decision. This car stays in the Consider below £1,850 lane because the visible damage can still fit, but only with controlled bidding and enough repair headroom.",
        reasonsText: "Ralph's reason is a mix of vehicle uncertainty and money pressure. The report is not saying the car is broken; it is saying the visible clues do not justify loose bidding.",
        noticedText: "Ralph is not just restating the listing. The photos matter because they change the repair allowance and the confidence around hidden work.",
        repairsText: "Ralph allowed a repair range rather than a quote because the photos can hint at work, but they cannot verify the full cost.",
        repairsDescription: "The range is an allowance, not a mechanic quote. It is meant to protect the user from being surprised by paint, panel, or alignment work after the auction.",
        budgetText: "Budget fit is only useful when it is tied back to the vehicle. Ralph keeps the surface simple and hides the arithmetic unless the user wants the rabbit hole.",
        verifyText: "Ralph tells you what could not be verified because the missing information affects certainty, not because the report wants to sound cautious.",
        expertText: "Expert review is not the main verdict. It is the extra confidence layer when the photos leave a real judgement gap.",
    }
};
