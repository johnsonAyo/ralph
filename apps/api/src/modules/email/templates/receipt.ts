import { wrapEmailLayout } from "./layout";

export function getPurchaseReceiptHtml(credits: number, tierName: string): string {
    const innerHtml = `
        <h1 style="margin: 0 0 12px 0; font-size: 26px; font-weight: 900; letter-spacing: -0.04em; color: #1a1a1a;">
          Payment Successful!
        </h1>
        <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.5; color: #625c52; font-weight: 500;">
          Your payment for the <strong>${tierName}</strong> plan was successful. We've just added <strong>${credits} credits</strong> to your account! You're ready to run your next vehicle check.
        </p>
        <a href="https://askralph.co.uk/dashboard/new" style="display: inline-block; background-color: #2f62e9; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 16px 32px; border-radius: 14px; box-shadow: 0 4px 12px rgba(47,98,233,0.25);">
          Run a Check
        </a>
    `.trim();

    return wrapEmailLayout("Payment Successful", innerHtml);
}
