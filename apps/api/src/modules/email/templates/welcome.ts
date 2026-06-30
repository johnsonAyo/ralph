import { wrapEmailLayout } from "./layout";

export function getWelcomeEmailHtml(): string {
    const innerHtml = `
        <h1 style="margin: 0 0 12px 0; font-size: 26px; font-weight: 900; letter-spacing: -0.04em; color: #1a1a1a;">
          Welcome to Ask Ralph!
        </h1>
        <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.5; color: #625c52; font-weight: 500;">
          We're thrilled to have you on board. You can now run independent vehicle checks to ensure the car you're buying is safe, reliable, and fairly priced.
        </p>
        <a href="https://askralph.co.uk/dashboard" style="display: inline-block; background-color: #2f62e9; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 16px 32px; border-radius: 14px; box-shadow: 0 4px 12px rgba(47,98,233,0.25);">
          Go to Dashboard
        </a>
    `.trim();

    return wrapEmailLayout("Welcome to Ask Ralph", innerHtml);
}
