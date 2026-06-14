import { AuctionPlatformCode, ListingSnapshot } from "@ralph/shared";

export interface PlatformListingExtractor {
  readonly platform: AuctionPlatformCode;
  extract(listingUrl: string): Promise<ListingSnapshot>;
}
