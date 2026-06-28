import { AuctionPlatformCode } from "@ralph/shared";

export type PlatformRegion = "uk" | "us";

export interface PlatformDescriptor {
    /** Stable code stored on the snapshot. */
    code: AuctionPlatformCode;
    /** Human-friendly name for UI/logs. */
    label: string;
    region: PlatformRegion;
    /** Hostname suffixes/fragments that identify this platform. */
    hosts: string[];
}

/**
 * The single place we recognise auction sites. Adding a new UK listing site is a
 * one-line entry here — the generic LLM extractor handles the actual scraping, so
 * no new extractor/selectors/mappers are needed. US sites are listed only so we
 * can detect and politely refuse them while we are UK-only.
 */
export const PLATFORM_REGISTRY: PlatformDescriptor[] = [
    // --- UK ---
    { code: AuctionPlatformCode.CopartUk, label: "Copart UK", region: "uk", hosts: ["copart.co.uk"] },
    { code: AuctionPlatformCode.IaaSynetiqUk, label: "IAA / SYNETIQ UK", region: "uk", hosts: ["iaai.co.uk", "synetiq.co.uk", "synetiq-auctions.co.uk"] },
    { code: AuctionPlatformCode.BcaUk, label: "BCA (British Car Auctions)", region: "uk", hosts: ["bca.co.uk"] },
    { code: AuctionPlatformCode.ManheimUk, label: "Manheim UK", region: "uk", hosts: ["manheim.co.uk"] },
    { code: AuctionPlatformCode.E2eUk, label: "e2e Total Loss", region: "uk", hosts: ["e2etotalloss.com", "e2eauctions.com"] },
    { code: AuctionPlatformCode.G3Uk, label: "G3 Vehicle Auctions", region: "uk", hosts: ["g3vehicleauctions.com"] },
    { code: AuctionPlatformCode.HillsUk, label: "Hills Motors", region: "uk", hosts: ["hillsmotors.com", "hillssalvage.co.uk"] },
    { code: AuctionPlatformCode.WilsonsUk, label: "Wilsons Auctions", region: "uk", hosts: ["wilsonsauctions.com"] },
    { code: AuctionPlatformCode.JohnPyeUk, label: "John Pye Auctions", region: "uk", hosts: ["johnpye.co.uk", "johnpyevehicles.co.uk"] },
    { code: AuctionPlatformCode.AstonBarclayUk, label: "Aston Barclay", region: "uk", hosts: ["astonbarclay.net"] },
    { code: AuctionPlatformCode.Raw2kUk, label: "Raw2k", region: "uk", hosts: ["raw2k.co.uk"] },

    // --- US (recognised so we can refuse for now) ---
    { code: AuctionPlatformCode.CopartUs, label: "Copart US", region: "us", hosts: ["copart.com"] },
    { code: AuctionPlatformCode.IaaUs, label: "IAA US", region: "us", hosts: ["iaai.com"] },
];

export function findPlatform(host: string): PlatformDescriptor | undefined {
    const normalized = host.toLowerCase().replace(/^www\./, "");
    return PLATFORM_REGISTRY.find((descriptor) =>
        descriptor.hosts.some((candidate) => normalized === candidate || normalized.endsWith(`.${candidate}`)),
    );
}
