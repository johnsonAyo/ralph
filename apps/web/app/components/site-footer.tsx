"use client";
import { usePathname } from "next/navigation";
import { landingLabels } from "../labels";
import CTA from "./cta";
import Link from "next/link";
export default function SiteFooter() {
    const pathname = usePathname() ?? "/";
    const isOnDashboard = pathname.startsWith("/dashboard");
    if (isOnDashboard) {
        return null;
    }
    return (<footer className="footer">
      <h2>{landingLabels.footer.title}</h2>
      <CTA>{landingLabels.hero.cta}</CTA>
      <p>{landingLabels.footer.copy}</p>
    </footer>);
}
