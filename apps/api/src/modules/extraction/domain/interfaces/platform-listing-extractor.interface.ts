import { AuctionPlatformCode, ListingSnapshot } from "@auction-risk/shared";

export interface PlatformListingExtractor {
  readonly platform: AuctionPlatformCode;
  extract(listingUrl: string): Promise<ListingSnapshot>;
}
