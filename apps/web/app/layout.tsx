import { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";
import SiteHeader from "./components/site-header";

import SiteFooter from "./components/site-footer";

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
    <html lang="en-GB" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="global-layout-wrapper">
        <Providers>
          <SiteHeader />
          <div className="global-main-content">
            {children}
          </div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
