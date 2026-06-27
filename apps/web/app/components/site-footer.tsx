"use client";
import { usePathname } from "next/navigation";
import { Container } from "@ralph/ui";
import { landingLabels } from "../labels";
import CTA from "./cta";

export default function SiteFooter() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/dashboard")) {
    return null;
  }
  return (
    <footer className="border-t border-border bg-muted/40">
      <Container className="flex flex-col items-center gap-6 py-20 text-center">
        <h2 className="max-w-2xl text-balance font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {landingLabels.footer.title}
        </h2>
        <p className="max-w-md text-pretty text-muted-foreground">
          {landingLabels.footer.copy}
        </p>
        <CTA>{landingLabels.hero.cta}</CTA>
        <p className="mt-8 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Ask Ralph. Independent of every
          auction house and dealer.
        </p>
      </Container>
    </footer>
  );
}
