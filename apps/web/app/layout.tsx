import { ReactNode } from "react";
import { Plus_Jakarta_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import SiteHeader from "./components/site-header";
import SiteFooter from "./components/site-footer";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});
const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const fontVars = `${sans.variable} ${serif.variable} ${mono.variable}`;

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Ask Ralph | Check if a car is a good buy",
  description:
    "Ask Ralph before you buy a car. Get budget fit, price guidance, visible risk notes, damage signals, mileage context and expert review when it matters.",
  openGraph: {
    title: "Found a car online? Ask Ralph before you buy.",
    description:
      "Ralph checks the price, damage, mileage, history and your budget before you commit.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Found a car online? Ask Ralph before you buy.",
    description: "Budget fit and risk guidance from Ralph before you buy.",
  },
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
      <html lang="en-GB" className={fontVars}>
        <body className="bg-background font-sans text-foreground antialiased">
          <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 px-6">
            <h1 className="font-serif text-2xl font-semibold tracking-tight">
              Ralph web is missing environment variables
            </h1>
            <p className="text-sm text-muted-foreground">
              Add the keys below to{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                apps/web/.env.local
              </code>
              , then rebuild or restart the dev server:
            </p>
            <ul className="flex flex-col gap-1">
              {missing.map((key) => (
                <li key={key}>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {key}
                  </code>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">
              See{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                apps/web/.env.example
              </code>{" "}
              for the full template.
            </p>
          </main>
        </body>
      </html>
    );
  }

  return (
    <html
      lang="en-GB"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={fontVars}
    >
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <Providers>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
