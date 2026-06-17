import { ArrowRight, Car, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";

interface RecentReport {
  verdict: string;
  verdictClass: "ok" | "avoid";
  title: string;
  source: string;
  note: string;
  when: string;
  bidRange: string;
}

const recentReports: readonly RecentReport[] = [
  {
    verdict: "Consider below £1,850",
    verdictClass: "ok",
    title: "Ford Focus 1.0 EcoBoost",
    source: "Copart UK",
    note: "Slight rear panel work, MOT clean",
    when: "2 days ago",
    bidRange: "£1,600 – £1,850",
  },
  {
    verdict: "Avoid",
    verdictClass: "avoid",
    title: "Vauxhall Corsa 1.2",
    source: "BCA",
    note: "Front-end damage spreads beyond panels",
    when: "5 days ago",
    bidRange: "—",
  },
  {
    verdict: "Consider below £5,200",
    verdictClass: "ok",
    title: "BMW 118i SE",
    source: "IAA",
    note: "Clean history, panel marks only",
    when: "1 week ago",
    bidRange: "£4,800 – £5,200",
  },
];

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      {/* Hero / welcome */}
      <section className="dash-hero">
        <div className="dash-hero-left">
          <p className="dash-kicker">Dashboard</p>
          <h1 className="dash-title">Your Ralph checks</h1>
          <p className="dash-sub">
            Every check you run is saved here. Revisit verdicts, bid guidance, and the evidence Ralph used.
          </p>
          <a className="button" href="/#check">
            Ask Ralph about a car
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>

        <div className="dash-stat-grid">
          <div className="dash-stat">
            <Car size={18} aria-hidden="true" />
            <strong>3</strong>
            <span>Checks run</span>
          </div>
          <div className="dash-stat">
            <CheckCircle2 size={18} aria-hidden="true" />
            <strong>2</strong>
            <span>Worth bidding</span>
          </div>
          <div className="dash-stat dash-stat--warn">
            <AlertTriangle size={18} aria-hidden="true" />
            <strong>1</strong>
            <span>Advised to skip</span>
          </div>
          <div className="dash-stat">
            <TrendingDown size={18} aria-hidden="true" />
            <strong>£1,700</strong>
            <span>Guided savings</span>
          </div>
        </div>
      </section>

      {/* Report list */}
      <section className="dash-section">
        <header className="dash-section-head">
          <div>
            <p className="dash-kicker">History</p>
            <h2 className="dash-section-title">Recent reports</h2>
          </div>
        </header>

        <div className="dash-report-list">
          {recentReports.map((report) => (
            <article key={report.title} className="dash-card">
              {/* Verdict band */}
              <div className={`dash-card-band ${report.verdictClass}`}>
                <div className="dash-card-dot" />
                <span>{report.verdict}</span>
              </div>

              <div className="dash-card-body">
                <h3>{report.title}</h3>
                <p className="dash-card-source">{report.source}</p>
                <p className="dash-card-note">{report.note}</p>
              </div>

              <div className="dash-card-meta">
                <div className="dash-card-bid">
                  <span>Ralph's range</span>
                  <strong>{report.bidRange}</strong>
                </div>
                <div className="dash-card-footer">
                  <span className="dash-card-when">{report.when}</span>
                  <a className="dash-card-link" href="#">
                    Open report
                    <ArrowRight size={13} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
