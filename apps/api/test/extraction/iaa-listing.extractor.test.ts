import assert from "node:assert/strict";
import test from "node:test";
import { AuctionPlatformCode, ExtractionConfidence } from "@ralph/shared";
import { buildIaaListingSnapshot } from "@/modules/extraction/infrastructure/iaa/iaa-snapshot.mapper";


test("IAA extraction strategy builds a complete snapshot from the rendered listing text", () => {
  const html = `
    <html>
      <body>
        <footer>Copyright IAA UK Auctions Ltd 2026</footer>
      </body>
    </html>
  `;

  const snapshot = buildIaaListingSnapshot({
    listingUrl:
      "https://auctions.iaai.co.uk/auction/items/details/2025-bmw-x1-sdrive-18d-sport-1995cc-turbo-diesel-semi-auto-5-door-estate/50017277",
    title: "2025 BMW X1 SDRIVE 18D SPORT 1995cc TURBO DIESEL SEMI AUTO 5 DOOR ESTATE",
    html,
    lines: [
      "2025 BMW X1 SDRIVE 18D SPORT 1995cc TURBO DIESEL SEMI AUTO 5 DOOR ESTATE",
      "Vehicle",
      "2025 BMW X1 SDRIVE 18D SPORT 1995cc TURBO DIESEL SEMI AUTO 5 DOOR ESTATE",
      "Odometer",
      "Info 23,463 MI",
      "£5,270",
      "Mon 15/06 09:56:00",
      "Category",
      "Structurally damaged repairable S",
      "Description",
      "Accident damage",
      "Keys",
      "Yes",
      "V5 Document",
      "No",
      "Engine starts",
      "No",
      "Drivetrain drives",
      "No",
      "IAA UK",
      "SO32 2HL",
    ],
    images: [
      "https://s3.eu-west-2.amazonaws.com/assets.synetiq-auctions.co.uk/images/items/0026/50017277/1.jpg",
      "https://s3.eu-west-2.amazonaws.com/assets.synetiq-auctions.co.uk/images/items/0026/50017277/2.jpg",
    ],
  });

  assert.equal(snapshot.platform, AuctionPlatformCode.IaaSynetiqUk);
  assert.equal(snapshot.lotNumber, "50017277");
  assert.equal(snapshot.title, "2025 BMW X1 SDRIVE 18D SPORT 1995cc TURBO DIESEL SEMI AUTO 5 DOOR ESTATE");
  assert.equal(snapshot.year, 2025);
  assert.equal(snapshot.make, "BMW");
  assert.equal(snapshot.model, "X1 SDRIVE 18D SPORT 1995cc TURBO DIESEL SEMI AUTO");
  assert.equal(snapshot.mileage, 23463);
  assert.equal(snapshot.mileageUnit, "MI");
  assert.equal(snapshot.currentBid, 5270);
  assert.equal(snapshot.currency, "GBP");
  assert.equal(snapshot.saleDate, "2026-06-15T08:56:00.000Z");
  assert.equal(snapshot.location, "IAA UK SO32 2HL");
  assert.equal(snapshot.category, "Structurally damaged repairable S");
  assert.equal(snapshot.primaryDamage, "Accident damage");
  assert.equal(snapshot.runCondition, "Engine starts: No; Drivetrain drives: No");
  assert.equal(snapshot.hasKeys, true);
  assert.equal(snapshot.v5Status, "No");
  assert.equal(snapshot.extractionConfidence, ExtractionConfidence.High);
  assert.deepEqual(snapshot.missingFields, []);
  assert.equal(snapshot.images.length, 2);
});
