import assert from "node:assert/strict";
import test from "node:test";
import { ConfigService } from "@nestjs/config";
import { AuctionPlatformCode } from "@ralph/shared";
import { AppError, ValidationError } from "@/common/errors/app.error";
import { detectPlatform } from "@/modules/extraction/application/detect-platform";
import { reduceListingPage } from "@/modules/extraction/infrastructure/generic/html-reducer";
import { buildGenericListingSnapshot } from "@/modules/extraction/infrastructure/generic/generic-snapshot.mapper";
import { GenericExtraction } from "@/modules/extraction/infrastructure/generic/generic-extraction.schema";
import { GenericListingExtractor } from "@/modules/extraction/infrastructure/generic/generic-listing.extractor";

test("detectPlatform maps known UK hosts and falls back to Other", () => {
    assert.equal(detectPlatform("https://www.copart.co.uk/lot/123/x"), AuctionPlatformCode.CopartUk);
    assert.equal(detectPlatform("https://auctions.iaai.co.uk/auction/items/details/x/50019823"), AuctionPlatformCode.IaaSynetiqUk);
    assert.equal(detectPlatform("https://www.bca.co.uk/vehicle/abc"), AuctionPlatformCode.BcaUk);
    assert.equal(detectPlatform("https://some-unknown-auction.co.uk/lot/9"), AuctionPlatformCode.Other);
});

test("detectPlatform rejects US listings while UK-only", () => {
    assert.throws(() => detectPlatform("https://www.copart.com/lot/123"), (err: unknown) => {
        assert(err instanceof ValidationError);
        assert.match(err.message, /UK-only/);
        return true;
    });
    assert.throws(() => detectPlatform("https://www.iaai.com/vehicle/123"), ValidationError);
});

test("reduceListingPage keeps vehicle photos and drops site chrome", () => {
    const listingUrl = "https://auctions.iaai.co.uk/auction/items/details/x/50019823";
    const html = `
    <html><body>
      <img src="/templates/domains/main/assets/img/IAA_Logo.png" />
      <img src="https://s3.eu-west-2.amazonaws.com/assets.synetiq-auctions.co.uk/assets/img/img-800x600.jpg" />
      <img data-src="https://s3.eu-west-2.amazonaws.com/assets.synetiq-auctions.co.uk/images/items/0026/50019823/abc123.jpg" />
      <img data-src="https://s3.eu-west-2.amazonaws.com/assets.synetiq-auctions.co.uk/images/items/0026/50019823/def456.jpg" />
      <img src="https://cdn.example.com/flags/gb.png" />
      <p>Odometer Info Unverified 167,040 Category Structurally damaged repairable S</p>
    </body></html>`;

    const { text, imageCandidates } = reduceListingPage(html, listingUrl);

    assert.equal(imageCandidates.length, 2, "only the two real vehicle photos survive");
    assert(imageCandidates.every((url) => url.includes("/images/items/")));
    assert(!imageCandidates.some((url) => /logo|flag|img-800x600/i.test(url)));
    assert.match(text, /Odometer Info Unverified 167,040/);
});

test("buildGenericListingSnapshot maps fields and rejects hallucinated images", () => {
    const candidates = [
        "https://cdn.example.com/items/1.jpg",
        "https://cdn.example.com/items/2.jpg",
    ];
    const extraction: GenericExtraction = {
        lotNumber: "50019823",
        title: "2006 BMW 3 SERIES 325I",
        year: 2006,
        make: "BMW",
        model: "3 SERIES 325I",
        mileage: 167040,
        mileageUnit: "MI",
        currentBid: 1500,
        buyItNowPrice: null,
        currency: null,
        saleDate: "2026-06-30T09:00:00.000Z",
        location: "IAA UK SO32 2HL",
        category: "Structurally damaged repairable S",
        primaryDamage: "Accident damage",
        secondaryDamage: null,
        runCondition: "Engine starts: Yes",
        hasKeys: true,
        v5Status: "No",
        estimatedRetailValue: null,
        // second URL is real; the third was invented by the model and must be dropped
        imageUrls: [
            "https://cdn.example.com/items/2.jpg",
            "https://cdn.example.com/hallucinated.jpg",
        ],
    };

    const snapshot = buildGenericListingSnapshot({
        platform: AuctionPlatformCode.IaaSynetiqUk,
        listingUrl: "https://auctions.iaai.co.uk/auction/items/details/x/50019823",
        extraction,
        imageCandidates: candidates,
    });

    assert.equal(snapshot.platform, AuctionPlatformCode.IaaSynetiqUk);
    assert.equal(snapshot.lotNumber, "50019823");
    assert.equal(snapshot.make, "BMW");
    assert.equal(snapshot.mileage, 167040);
    assert.equal(snapshot.currency, "GBP", "defaults currency when null");
    assert.equal(snapshot.buyItNowPrice, undefined, "null becomes undefined");
    assert.equal(snapshot.images.length, 1, "hallucinated image dropped");
    assert.equal(snapshot.images[0].fullUrl, "https://cdn.example.com/items/2.jpg");
    assert.equal(snapshot.images[0].sequence, 1);
});

test("GenericListingExtractor reports a clear configuration error when no OpenAI client is available", async () => {
    const scrapeClient = {
        fetchHtml: async () => "<html><body><p>2006 BMW 3 Series</p></body></html>",
    };
    const extractor = new GenericListingExtractor(
        scrapeClient as any,
        null,
        { get: () => undefined } as unknown as ConfigService,
    );

    await assert.rejects(() => extractor.extract("https://auctions.iaai.co.uk/auction/items/details/x/50019823"), (err: unknown) => {
        assert.ok(err instanceof AppError);
        assert.equal((err as AppError).code, "OPENAI_NOT_CONFIGURED");
        return true;
    });
});
