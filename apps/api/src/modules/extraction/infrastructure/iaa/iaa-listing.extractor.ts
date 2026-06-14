import { Injectable } from "@nestjs/common";
import { AuctionPlatformCode, ListingSnapshot } from "@ralph/shared";
import {
  DOM_CONTENT_LOADED_TIMEOUT_MS,
  IAA_POST_LOAD_WAIT_MS,
} from "@/modules/extraction/domain/constants/browser.constants";
import {
  IAA_IMAGE_SELECTOR,
  IAA_PAGE_TITLE_SUFFIX_PATTERN,
} from "@/modules/extraction/domain/constants/iaa.constants";
import { PlatformListingExtractor } from "@/modules/extraction/domain/interfaces/platform-listing-extractor.interface";
import { PlaywrightBrowserFactory } from "@/modules/extraction/infrastructure/browser/playwright-browser.factory";
import { buildIaaListingSnapshot } from "./iaa-snapshot.mapper";


@Injectable()
export class IaaListingExtractor implements PlatformListingExtractor {
  readonly platform = AuctionPlatformCode.IaaSynetiqUk;

  constructor(private readonly browserFactory: PlaywrightBrowserFactory) {}

  async extract(listingUrl: string): Promise<ListingSnapshot> {
    const context = await this.browserFactory.createContext();
    const browser = context.browser();

    try {
      const page = await context.newPage();

      await page.goto(listingUrl, {
        waitUntil: "domcontentloaded",
        timeout: DOM_CONTENT_LOADED_TIMEOUT_MS,
      });

      await page.waitForTimeout(IAA_POST_LOAD_WAIT_MS);

      const pageData = await page.evaluate(
        ({ imageSelector, titleSuffixPattern }) => {
          const lines = (document.body?.innerText ?? "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          const title =
            document.querySelector("h1")?.textContent?.trim() ??
            document.title.replace(new RegExp(titleSuffixPattern, "i"), "").trim();

          const images = [...document.querySelectorAll(imageSelector)]
            .map((image) => image.getAttribute("src"))
            .filter((src): src is string => Boolean(src))
            .map((src) => new URL(src, window.location.href).href);

          return {
            finalUrl: window.location.href,
            html: document.documentElement.outerHTML,
            lines,
            title,
            images,
          };
        },
        {
          imageSelector: IAA_IMAGE_SELECTOR,
          titleSuffixPattern: IAA_PAGE_TITLE_SUFFIX_PATTERN.source,
        },
      );

      return buildIaaListingSnapshot({
        listingUrl: pageData.finalUrl || listingUrl,
        title: pageData.title,
        html: pageData.html,
        lines: pageData.lines,
        images: pageData.images,
      });
    } finally {
      await context.close();
      await browser?.close();
    }
  }
}
