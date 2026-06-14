import assert from "node:assert/strict";
import test from "node:test";
import { AuctionPlatformCode, ExtractionConfidence } from "@ralph/shared";
import { extractCachedCopartLotDetails } from "@/modules/extraction/infrastructure/copart/copart-html.parser";
import {
  normalizeCopartImagesResponse,
} from "@/modules/extraction/infrastructure/copart/copart-image.parser";
import { buildCopartListingSnapshot } from "@/modules/extraction/infrastructure/copart/copart-snapshot.mapper";


test("Copart extraction strategy builds a complete snapshot from cached JSON and image payload", () => {
  const cachedDetails = {
    lotNumberStr: "49254916",
    ld: "2014 VAUXHALL ASTRA 2.0 CDTI 16V SRI 5DR AUTO",
    lcy: 2014,
    mkn: "VAUXHALL",
    lm: "ASTRA SRI",
    orr: 96638,
    hb: 1500,
    bnp: 2300,
    ad: Date.parse("2026-06-15T09:00:00.000Z"),
    yn: "NEWBURY",
    td: "N REPAIRABLE NON STRUCTURAL",
    dd: "FRONT END",
    sdd: "MINOR DENTS/SCRATCHES",
    lcd: "RUNS AND DRIVES",
    hk: "yes",
    v5s: "Physical V5 Available",
    la: 3258,
    cuc: "GBP",
    dynamicLotDetails: {
      currentBid: 1500,
      buyTodayBid: 2300,
    },
  };

  const html = `
    <html>
      <body>
        <script>
          cachedSolrLotDetailsStr: ${JSON.stringify(JSON.stringify(cachedDetails))}
        </script>
      </body>
    </html>
  `;

  const extractedCachedDetails = extractCachedCopartLotDetails(html);
  const images = normalizeCopartImagesResponse({
    data: {
      imagesList: {
        content: [
          {
            fullUrl: "https://cdn.example.test/1_ful.jpg",
            thumbnailUrl: "https://cdn.example.test/1_thb.jpg",
            highResUrl: "https://cdn.example.test/1_hrs.jpg",
            imageSeqNumber: 1,
            imageLabelCode: "NSF",
          },
          {
            fullUrl: "https://cdn.example.test/2_ful.jpg",
            thumbnailUrl: "https://cdn.example.test/2_thb.jpg",
            highResUrl: "https://cdn.example.test/2_hrs.jpg",
            imageSeqNumber: 2,
            imageLabelCode: "OSF",
          },
        ],
      },
    },
  });

  const snapshot = buildCopartListingSnapshot({
    listingUrl:
      "https://www.copart.co.uk/lot/49254916/clean-title-2014-vauxhall-astra-2-0-cdti-16v-sri-5dr-auto-newbury",
    cachedLotDetails: extractedCachedDetails,
    vehicle: {
      brand: { name: "VAUXHALL" },
      vehicleModelDate: 2014,
      model: "ASTRA SRI",
      mileageFromOdometer: { value: 96638, unitCode: "MI" },
      offers: { price: 1500 },
      name: "2014 VAUXHALL ASTRA 2.0 CDTI 16V SRI 5DR AUTO",
    },
    product: {
      sku: "49254916",
      name: "2014 VAUXHALL ASTRA 2.0 CDTI 16V SRI 5DR AUTO",
      offers: { price: 1500 },
    },
    lines: ["Lot number: 49254916", "Buy It Now: £2,300"],
    images,
  });

  assert.equal(snapshot.platform, AuctionPlatformCode.CopartUk);
  assert.equal(snapshot.lotNumber, "49254916");
  assert.equal(snapshot.title, "2014 VAUXHALL ASTRA 2.0 CDTI 16V SRI 5DR AUTO");
  assert.equal(snapshot.year, 2014);
  assert.equal(snapshot.make, "VAUXHALL");
  assert.equal(snapshot.model, "ASTRA SRI");
  assert.equal(snapshot.mileage, 96638);
  assert.equal(snapshot.mileageUnit, "MI");
  assert.equal(snapshot.currentBid, 1500);
  assert.equal(snapshot.buyItNowPrice, 2300);
  assert.equal(snapshot.saleDate, "2026-06-15T09:00:00.000Z");
  assert.equal(snapshot.location, "NEWBURY");
  assert.equal(snapshot.category, "N REPAIRABLE NON STRUCTURAL");
  assert.equal(snapshot.primaryDamage, "FRONT END");
  assert.equal(snapshot.secondaryDamage, "MINOR DENTS/SCRATCHES");
  assert.equal(snapshot.runCondition, "RUNS AND DRIVES");
  assert.equal(snapshot.hasKeys, true);
  assert.equal(snapshot.v5Status, "Physical V5 Available");
  assert.equal(snapshot.estimatedRetailValue, 3258);
  assert.equal(snapshot.extractionConfidence, ExtractionConfidence.High);
  assert.deepEqual(snapshot.missingFields, []);
  assert.equal(snapshot.images.length, 2);
});
