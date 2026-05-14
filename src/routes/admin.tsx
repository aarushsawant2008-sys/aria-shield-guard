import { createFileRoute } from "@tanstack/react-router";
import { TrendingDown, Sparkles, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
  head: () => ({
    meta: [
      { title: "Admin Panel — ARIA" },
      { name: "description", content: "ARIA intelligence and process insights." },
    ],
  }),
});

interface BottleneckRow {
  label: string;
  value: string;
  trend?: string;
}

const BOTTLENECKS: BottleneckRow[] = [
  { label: "Average officer review time", value: "4.7 min", trend: "↓ from 6.2 min last month" },
  { label: "Slowest stage", value: "Document Re-upload (avg 48hr wait for client)" },
  { label: "Fastest stage", value: "Intake Agent (1.2 seconds)" },
  { label: "STR filings this month", value: "2 (both filed within 24hrs of detection)" },
];

function AdminPanel() {
  const [applied, setApplied] = useState(false);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">ARIA Intelligence — May 2026</h1>
        <p className="mt-1.5 text-sm text-muted-foreground font-mono">
          aria-kyc-agent · Gemini 2.5 Pro · us-west1
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { value: "47", label: "KYC Files Processed This Month" },
          { value: "38s", label: "Average ARIA Processing Time" },
          { value: "2", label: "Financial Crime Flags Raised" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-6">
            <div className="text-4xl font-bold tracking-tight text-primary">{s.value}</div>
            <div className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-semibold">ARIA Suggestion Engine</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          ARIA identifies patterns across all cases and suggests process improvements. Every suggestion
          requires your one-click approval.
        </p>

        <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-5">
          <div className="flex items-start gap-4">
            <div className="text-2xl">📊</div>
            <div className="flex-1">
              <h3 className="font-semibold">23% of rejections cite outdated address proof</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                ARIA recommends adding this line to your client onboarding email:{" "}
                <span className="text-foreground italic">
                  "Please ensure your address proof is dated within the last 2 years as required by RBI KYC
                  Master Direction 2016 Section 38."
                </span>
              </p>
              <button
                onClick={() => setApplied(true)}
                disabled={applied}
                className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold ${
                  applied
                    ? "bg-primary/20 text-primary cursor-default"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {applied ? (<><Check className="w-4 h-4" /> Applied</>) : "Approve This Change"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingDown className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-semibold">Monthly Bottleneck Report</h2>
        </div>
        <table className="zebra w-full text-sm">
          <tbody>
            {BOTTLENECKS.map((r) => (
              <tr key={r.label} className="border-b border-border/60 last:border-0">
                <td className="py-3.5 px-4 text-muted-foreground w-1/2">{r.label}</td>
                <td className="py-3.5 px-4 font-medium">
                  {r.value}
                  {r.trend && <span className="ml-2 text-xs text-primary font-semibold">({r.trend})</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
