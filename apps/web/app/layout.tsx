import { ReactNode } from "react";
import "./globals.css";

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
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
