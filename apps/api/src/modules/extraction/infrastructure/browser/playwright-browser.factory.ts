import { Injectable } from "@nestjs/common";
import { BrowserContext, chromium } from "playwright";
import { EXTRACTION_BROWSER_LOCALE, EXTRACTION_BROWSER_USER_AGENT, } from "@/modules/extraction/domain/constants/browser.constants";
@Injectable()
export class PlaywrightBrowserFactory {
    async createContext(): Promise<BrowserContext> {
        const browser = await chromium.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ],
        });
        return browser.newContext({
            locale: EXTRACTION_BROWSER_LOCALE,
            userAgent: EXTRACTION_BROWSER_USER_AGENT,
        });
    }
}
