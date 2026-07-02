import { Building2, Gavel, Handshake, ClipboardList, type LucideIcon } from "lucide-react";
import { VehicleSourceType } from "@ralph/shared";

// One place for everything that changes per source: the card copy, the icon, and
// the label the price field takes (a dealer price, an auction bid and a private
// ask are different things, so we name them differently).
export interface SourceMeta {
  type: VehicleSourceType;
  label: string;
  blurb: string;
  examples: string;
  priceLabel: string;
  priceHint: string;
  Icon: LucideIcon;
}

export const SOURCE_META: Record<VehicleSourceType, SourceMeta> = {
  [VehicleSourceType.Dealership]: {
    type: VehicleSourceType.Dealership,
    label: "Dealership",
    blurb: "A forecourt or dealer website",
    examples: "Main dealer, car supermarket, AutoTrader dealer ad",
    priceLabel: "Dealer's price (£)",
    priceHint: "The price on the forecourt. Ralph judges if it's fair for what you get.",
    Icon: Building2,
  },
  [VehicleSourceType.Auction]: {
    type: VehicleSourceType.Auction,
    label: "Auction website",
    blurb: "A car auction",
    examples: "Copart, IAA, BCA, salvage lots",
    priceLabel: "Current bid (£)",
    priceHint: "Where the bidding is now. Ralph advises a max sensible bid and a walk-away point.",
    Icon: Gavel,
  },
  [VehicleSourceType.Private]: {
    type: VehicleSourceType.Private,
    label: "Private / Marketplace",
    blurb: "A private seller or classifieds ad",
    examples: "Facebook Marketplace, Gumtree, private AutoTrader",
    priceLabel: "Asking price (£)",
    priceHint: "What they're asking. The price is negotiable, so Ralph advises what's worth offering.",
    Icon: Handshake,
  },
  [VehicleSourceType.OffMarket]: {
    type: VehicleSourceType.OffMarket,
    label: "I just have the details",
    blurb: "Not listed anywhere yet",
    examples: "A car you've seen, been offered, or are researching",
    priceLabel: "Asking price (£)",
    priceHint: "The price on the table, if there is one.",
    Icon: ClipboardList,
  },
};

export const SOURCE_ORDER: VehicleSourceType[] = [
  VehicleSourceType.Dealership,
  VehicleSourceType.Auction,
  VehicleSourceType.Private,
  VehicleSourceType.OffMarket,
];
