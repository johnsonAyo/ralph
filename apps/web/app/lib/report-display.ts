import { ReportSnapshot, ReportStatusCode, ReportVerdictCode, VehicleVerdictCode } from "@ralph/shared";

const REG_VERDICT_LABEL: Record<string, string> = {
  [VehicleVerdictCode.SoundBuy]: "Sound buy",
  [VehicleVerdictCode.ConsiderWithCaution]: "Consider with caution",
  [VehicleVerdictCode.BudgetStretch]: "A stretch for the budget",
  [VehicleVerdictCode.InsufficientData]: "Not enough to say",
};

const STATUS_LABEL: Record<string, string> = {
  [ReportStatusCode.Queued]: "Queued",
  [ReportStatusCode.Extracting]: "Fetching details",
  [ReportStatusCode.Analysing]: "Analysing",
  [ReportStatusCode.NeedsUserConfirmation]: "Needs confirmation",
  [ReportStatusCode.Completed]: "Completed",
  [ReportStatusCode.Failed]: "Failed",
};

function hostnameLabel(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

export function reportTitle(snapshot: ReportSnapshot): string {
  if (snapshot.type === "reg_check") {
    return snapshot.request.registration;
  }
  return (
    snapshot.listing?.title ??
    hostnameLabel(snapshot.request.listingUrl) ??
    "Manual entry"
  );
}

export function reportHeadline(snapshot: ReportSnapshot): string {
  if (snapshot.type === "reg_check") {
    return REG_VERDICT_LABEL[snapshot.result?.verdict] ?? STATUS_LABEL[snapshot.status] ?? snapshot.status;
  }
  if (snapshot.status === ReportStatusCode.Completed && snapshot.result) {
    const { verdict, hardCeiling } = snapshot.result;
    if (verdict === ReportVerdictCode.GoodCandidate) return "Good candidate";
    if (verdict === ReportVerdictCode.ConsiderBelowCeiling) {
      return hardCeiling
        ? `Consider below £${hardCeiling.toLocaleString("en-GB")}`
        : "Consider with caution";
    }
    if (verdict === ReportVerdictCode.HighRisk) return "Avoid";
    if (verdict === ReportVerdictCode.InsufficientConfidence) return "Low confidence";
  }
  return STATUS_LABEL[snapshot.status] ?? snapshot.status;
}

export function reportTone(snapshot: ReportSnapshot): "ok" | "avoid" | "pending" {
  const verdict = snapshot.result?.verdict;
  if (snapshot.type === "reg_check") {
    if (verdict === VehicleVerdictCode.SoundBuy || verdict === VehicleVerdictCode.ConsiderWithCaution) {
      return "ok";
    }
    if (verdict === VehicleVerdictCode.BudgetStretch) return "avoid";
    return "pending";
  }
  if (
    verdict === ReportVerdictCode.GoodCandidate ||
    verdict === ReportVerdictCode.ConsiderBelowCeiling
  ) {
    return "ok";
  }
  if (verdict === ReportVerdictCode.HighRisk || snapshot.status === ReportStatusCode.Failed) {
    return "avoid";
  }
  return "pending";
}

export function reportBidRange(snapshot: ReportSnapshot): string {
  if (snapshot.type === "reg_check") {
    const amount = snapshot.request.askingPrice || snapshot.request.totalBudget;
    return amount ? `£${amount.toLocaleString("en-GB")}` : "—";
  }
  const { safeBidMin, safeBidMax } = snapshot.result ?? {};
  if (safeBidMin && safeBidMax) {
    return `£${safeBidMin.toLocaleString("en-GB")} – £${safeBidMax.toLocaleString("en-GB")}`;
  }
  return "—";
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}
