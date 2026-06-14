import { AuctionPlatformCode } from "@ralph/shared";

export function detectPlatform(listingUrl: string): AuctionPlatformCode {
  const url = new URL(listingUrl);
  const host = url.hostname.toLowerCase();

  if (host.endsWith("copart.co.uk")) {
    return AuctionPlatformCode.CopartUk;
  }

  if (host.includes("iaai") || host.includes("synetiq")) {
    return AuctionPlatformCode.IaaSynetiqUk;
  }

  return AuctionPlatformCode.Other;
}
