"use client";
import "../dashboard.css";
import { ExternalLink, MapPin, Globe } from "lucide-react";
import { useState } from "react";
import { SUPPORTED_SITES } from "./constants";

function SiteCard({ site }: { site: typeof SUPPORTED_SITES[0] }) {
  const [logoError, setLogoError] = useState(false);
  const domain = new URL(site.url).hostname.replace("www.", "");
  const fallbackLogoUrl = `https://icon.horse/icon/${domain}`;

  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_-8px_rgba(47,98,233,0.3)] hover:border-[rgba(47,98,233,0.4)] bg-[var(--surface)] border border-[var(--line)] shadow-sm"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(47,98,233,0.05)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
      
      <div className="relative z-10 flex justify-between items-start gap-4 mb-4">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-[var(--line)] shadow-sm overflow-hidden p-2 transition-transform duration-300 group-hover:scale-105">
            {!logoError ? (
              <img 
                src={site.logo} 
                alt={`${site.name} logo`} 
                className="w-full h-full object-contain"
                onLoad={(e) => {
                  if (e.currentTarget.naturalWidth <= 1) {
                    if (e.currentTarget.src === site.logo) {
                      e.currentTarget.src = fallbackLogoUrl;
                    } else {
                      setLogoError(true);
                    }
                  }
                }}
                onError={(e) => {
                  if (e.currentTarget.src === site.logo) {
                    e.currentTarget.src = fallbackLogoUrl;
                  } else {
                    setLogoError(true);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgb(47,98,233)] to-indigo-600 text-white font-bold text-xl rounded-xl shadow-inner">
                {site.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-[1.2rem] font-semibold m-0 truncate transition-colors group-hover:text-[rgb(47,98,233)]">
              {site.name}
            </h3>
            <span className="text-[0.85rem] opacity-60 truncate flex items-center gap-1.5 mt-1 font-medium">
              <Globe size={12} className="opacity-70" />
              {domain}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--surface-dim)] flex items-center justify-center transition-all duration-300 group-hover:bg-[rgb(47,98,233)] group-hover:text-white group-hover:rotate-12 group-hover:scale-110">
          <ExternalLink size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <p className="relative z-10 text-[1rem] opacity-80 flex-1 leading-relaxed m-0 mb-6 font-medium">
        {site.desc}
      </p>

      <div className="relative z-10 flex items-center gap-2 flex-wrap mt-auto pt-5 border-t border-[var(--line)]">
        <span className="flex items-center gap-1.5 text-[0.8rem] font-bold px-3 py-1.5 rounded-full bg-[rgba(47,98,233,0.1)] text-[rgb(47,98,233)] border border-[rgba(47,98,233,0.2)]">
          <MapPin size={12} />
          {site.region}
        </span>
        {site.tags.map((tag) => (
          <span
            key={tag}
            className="text-[0.8rem] font-semibold px-3 py-1.5 rounded-full bg-[var(--surface-dim)] border border-[var(--line)] transition-colors hover:bg-[var(--line)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}

export default function ListingsPage() {
  return (
    <div className="dashboard-page pb-12">
      <section className="dash-section mx-auto w-full max-w-[1400px]">
        <header className="flex flex-col items-start gap-6 mb-10 border-b border-[var(--line)] pb-8">
          <div className="max-w-3xl">
            <h1 className="dash-section-title text-4xl font-extrabold tracking-tight mb-3">Car Listings</h1>
            <p className="dash-sub text-[1.1rem] leading-relaxed m-0 opacity-70 font-medium">
              Browse our directory of supported UK platforms to find your next car. Once you find a vehicle, copy its link and paste it into Ralph for deep analysis.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {SUPPORTED_SITES.map((site) => (
            <SiteCard key={site.name} site={site} />
          ))}
        </div>
      </section>
    </div>
  );
}
