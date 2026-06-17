import { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Ask Ralph | Check if a car is a good buy",
  description:
    "Ask Ralph before you buy a car. Get budget fit, price guidance, visible risk notes, damage signals, mileage context and expert review when it matters.",
  openGraph: {
    title: "Found a car online? Ask Ralph before you buy.",
    description:
      "Ralph checks the price, damage, mileage, history and your budget before you commit.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Found a car online? Ask Ralph before you buy.",
    description: "Budget fit and risk guidance from Ralph before you buy."
  }
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const hasSupabaseConfig =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!hasSupabaseConfig && process.env.NODE_ENV === "production") {
    const missing: string[] = [];
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      missing.push("NEXT_PUBLIC_SUPABASE_URL");
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }

    return (
      <html lang="en-GB">
        <body>
          <main className="setup-missing">
            <h1>Ralph web is missing environment variables</h1>
            <p>
              Add the keys below to <code>apps/web/.env.local</code>, then rebuild or restart the dev server:
            </p>
            <ul>
              {missing.map((key) => (
                <li key={key}>
                  <code>{key}</code>
                </li>
              ))}
            </ul>
            <p>
              See <code>apps/web/.env.example</code> for the full template.
            </p>
          </main>
        </body>
      </html>
    );
  }

  return (
    // `suppressHydrationWarning` on the root <html> silences a benign dev-only
    // mismatch where Next.js 16 / React 19 (or a browser extension) attaches
    // `data-processed-<id>` attributes to `<html>` during hydration that
    // are not present in the SSR HTML. We do not emit these attributes from
    // user code, so suppressing them here is the supported workaround.
    <html lang="en-GB" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
