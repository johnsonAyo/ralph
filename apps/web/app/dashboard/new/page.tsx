"use client";
import CheckForm from "../../components/check-form";
export default function NewCheckPage() {
    return (<div className="dashboard-page">
      <section className="dash-section">
        <div style={{ maxWidth: "720px" }}>
          <CheckForm variant="dashboard" hideIntro/>
        </div>
      </section>
    </div>);
}
