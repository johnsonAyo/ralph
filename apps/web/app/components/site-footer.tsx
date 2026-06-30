"use client";
import { usePathname } from "next/navigation";
import "./site-footer/site-footer.css";
import { landingLabels } from "../labels";
import CTA from "./cta";
export default function SiteFooter() {
    const pathname = usePathname() ?? "/";
    const isOnDashboard = pathname.startsWith("/dashboard");
    const isAuthPage = pathname.startsWith("/auth");
    if (isOnDashboard || isAuthPage) {
        return null;
    }
    return (<footer className="footer">
      <h2>{landingLabels.footer.title}</h2>
      <CTA>{landingLabels.hero.cta}</CTA>
      <p>{landingLabels.footer.copy}</p>
    </footer>);
}
