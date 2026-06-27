"use client";
import { ExternalLink } from "lucide-react";
const SUPPORTED_SITES = [
    {
        name: "Copart UK",
        url: "https://www.copart.co.uk/",
        desc: "Online vehicle auctions for salvage and used cars.",
        tags: ["Auction", "Salvage"],
    },
    {
        name: "AutoTrader UK",
        url: "https://www.autotrader.co.uk/",
        desc: "Buy and sell new and used cars.",
        tags: ["Marketplace", "Dealer", "Private"],
    },
    {
        name: "eBay Motors UK",
        url: "https://www.ebay.co.uk/b/Cars-Motorcycles-Vehicles/9800/bn_1865324",
        desc: "Used cars, salvage, and parts from private sellers and dealers.",
        tags: ["Marketplace", "Auction"],
    },
    {
        name: "Motors.co.uk",
        url: "https://www.motors.co.uk/",
        desc: "Search for used cars from trusted dealers across the UK.",
        tags: ["Marketplace", "Dealer"],
    },
];
export default function ListingsPage() {
    return (<div className="dashboard-page">
      <section className="dash-section">
        <header className="dash-section-head" style={{ marginBottom: "2rem" }}>
          <div>
            <h1 className="dash-section-title">Car Listings</h1>
            <p className="dash-sub" style={{ marginTop: '8px', opacity: 0.8 }}>
              Browse our supported platforms to find your next car. Once you find a vehicle, copy its link and paste it into Ralph for analysis.
            </p>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {SUPPORTED_SITES.map((site) => (<a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer" className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{site.name}</h3>
                <ExternalLink size={18} style={{ opacity: 0.5 }}/>
              </div>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '0.95rem', flex: 1 }}>
                {site.desc}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                {site.tags.map((tag) => (<span key={tag} style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--surface-dim)', borderRadius: '12px', fontWeight: 600 }}>
                    {tag}
                  </span>))}
              </div>
            </a>))}
        </div>
      </section>
    </div>);
}
