import { createFileRoute, Link } from "@tanstack/react-router";
import { CASES, riskColorClass, ragBadgeClass } from "@/lib/cases";
import { Clock, CheckCircle2, AlertTriangle, Activity, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: ComplianceQueue,
  head: () => ({
    meta: [
      { title: "Compliance Queue — ARIA" },
      { name: "description", content: "Pending KYC officer reviews." },
    ],
  }),
});

interface StatCard {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "warn" | "ok" | "fail" | "info";
}

const STATS: StatCard[] = [
  { value: "4", label: "Pending Review", icon: Clock, tone: "warn" },
  { value: "7", label: "Approved Today", icon: CheckCircle2, tone: "ok" },
  { value: "1", label: "Financial Crime Flags", icon: AlertTriangle, tone: "fail" },
  { value: "38s", label: "Avg ARIA Processing", icon: Activity, tone: "info" },
];

function toneClasses(tone: StatCard["tone"]) {
  switch (tone) {
    case "ok": return "text-primary bg-primary/10 border-primary/30";
    case "warn": return "text-warning bg-warning/10 border-warning/30";
    case "fail": return "text-destructive bg-destructive/10 border-destructive/30";
    default: return "text-foreground bg-accent/40 border-border";
  }
}

function ComplianceQueue() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Compliance Queue</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Cases awaiting human officer review. ARIA never approves or rejects autonomously.
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-bold tracking-tight">{s.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground uppercase tracking-wide">{s.label}</div>
                </div>
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${toneClasses(s.tone)}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="bg-card border border-border rounded-xl overflow-hidden">
        <header className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Pending Officer Review</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sorted by risk — highest first</p>
          </div>
          <span className="text-xs text-muted-foreground">{CASES.length} cases</span>
        </header>

        <div className="overflow-x-auto">
          <table className="zebra w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3 px-5 font-medium">Client Name</th>
                <th className="py-3 px-5 font-medium">PAN</th>
                <th className="py-3 px-5 font-medium">Risk Score</th>
                <th className="py-3 px-5 font-medium">RAG Status</th>
                <th className="py-3 px-5 font-medium">Key Flag</th>
                <th className="py-3 px-5 font-medium">Submitted</th>
                <th className="py-3 px-5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {CASES.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0">
                  <td className="py-4 px-5 font-medium">{c.name}</td>
                  <td className="py-4 px-5 font-mono text-xs text-muted-foreground">{c.pan}</td>
                  <td className={`py-4 px-5 font-semibold ${riskColorClass(c.riskScore)}`}>
                    {c.riskScore}<span className="text-muted-foreground font-normal">/100</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide ${ragBadgeClass(c.rag)}`}>
                      {c.ragLabel}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-muted-foreground max-w-md">{c.keyFlag}</td>
                  <td className="py-4 px-5 text-muted-foreground text-xs whitespace-nowrap">{c.submitted}</td>
                  <td className="py-4 px-5 text-right">
                    <Link
                      to="/case/$id"
                      params={{ id: c.id }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
                    >
                      Review Case <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
