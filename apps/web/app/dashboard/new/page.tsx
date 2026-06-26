"use client";

import CheckForm from "../../components/check-form";

export default function NewCheckPage() {
  return (
    <div className="dashboard-page">
      <section className="dash-section">
        <header className="dash-section-head" style={{ marginBottom: "2rem" }}>
          <div>
            <p className="dash-kicker">New Check</p>
            <h1 className="dash-section-title">Ask Ralph about a car</h1>
          </div>
        </header>

        <div style={{ maxWidth: "600px" }}>
          <CheckForm />
        </div>
      </section>
    </div>
  );
}
