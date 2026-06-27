"use client";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { successLabels } from "../../labels";
export default function PaymentSuccessPage() {
    const queryClient = useQueryClient();
    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ["credits"] });
    }, [queryClient]);
    return (<div className="payment-success-page" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            textAlign: "center",
            padding: "2rem",
        }}>
      <div style={{
            background: "rgba(16, 185, 129, 0.1)",
            color: "#10b981",
            borderRadius: "50%",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            display: "inline-flex",
        }}>
        <CheckCircle2 size={48} aria-hidden="true"/>
      </div>

      <p className="dash-kicker" style={{ color: "#10b981", fontWeight: 600 }}>Payment successful</p>
      <h1 className="dash-title" style={{ marginTop: "0.5rem" }}>{successLabels.title}</h1>
      <p className="dash-sub" style={{ maxWidth: "480px", margin: "1rem auto 2rem" }}>
        {successLabels.sub}
      </p>

      <div style={{ display: "flex", gap: "1rem" }}>
        <Link href="/dashboard" className="button">
          Go to dashboard
          <ArrowRight size={16} aria-hidden="true" style={{ marginLeft: "0.5rem" }}/>
        </Link>
        <Link href="/#check" className="button secondary">
          Check a car
        </Link>
      </div>
    </div>);
}
