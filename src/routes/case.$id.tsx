import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, FileText, Bot, AlertTriangle, X } from "lucide-react";
import { getCase, ragBadgeClass, riskColorClass, type StageStatus, type Case } from "@/lib/cases";
import { runAriaClaude } from "@/lib/aria-claude";

export const Route = createFileRoute("/case/$id")({
  component: CaseReport,
  head: ({ params }) => ({
    meta: [
      { title: `Case ${params.id} — ARIA` },
      { name: "description", content: "ARIA case report." },
    ],
  }),
  notFoundComponent: () => (
    <div className="text-center py-20">
      <h1 className="text-2xl font-semibold">Case not found</h1>
      <Link to="/" className="mt-4 inline-block text-primary">← Back to queue</Link>
    </div>
  ),
});

function statusIcon(s: StageStatus) {
  if (s === "ok") return <span className="text-primary">✅</span>;
  if (s === "warn") return <span className="text-warning">🟡</span>;
  return <span className="text-destructive">🔴</span>;
}

function statusBorder(s: StageStatus) {
  if (s === "ok") return "border-primary/30";
  if (s === "warn") return "border-warning/40";
  return "border-destructive/50";
}

type Tab = "summary" | "aria";
type DecisionState = null | { label: string; tone: "ok" | "warn" | "fail"; success: string };

function CaseReport() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const c = getCase(id);

  const [tab, setTab] = useState<Tab>("summary");
  const [confirm, setConfirm] = useState<DecisionState>(null);
  const [done, setDone] = useState<DecisionState>(null);

  if (!c) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold">Case not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary">← Back to queue</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Compliance Queue
        </button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">{c.name}</h1>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide ${ragBadgeClass(c.rag)}`}>
            {c.ragLabel}
          </span>
          <span className={`text-sm font-semibold ${riskColorClass(c.riskScore)}`}>
            Risk {c.riskScore}<span className="text-muted-foreground font-normal">/100</span>
          </span>
        </div>
        <div className="text-xs text-muted-foreground font-mono">PAN {c.pan}</div>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-card border border-border rounded-lg p-1 mb-6">
        {[
          { key: "summary" as Tab, icon: FileText, label: "Summary" },
          { key: "aria" as Tab, icon: Bot, label: "Full ARIA Analysis" },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "summary" ? <SummaryTab c={c} /> : <AriaTab />}

      <OfficerDecision
        c={c}
        onClick={(d) => setConfirm(d)}
        done={done}
      />

      {confirm && (
        <ConfirmModal
          decision={confirm}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            setDone(confirm);
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}

function SummaryTab({ c }: { c: Case }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {c.stages.map((stage) => (
          <div
            key={stage.name}
            className={`bg-card border ${statusBorder(stage.status)} rounded-xl p-5`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{stage.name}</div>
                <div className="text-base font-semibold mt-0.5">{stage.agent}</div>
              </div>
              <div className="text-xl">{statusIcon(stage.status)}</div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{stage.summary}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span className="text-primary">§</span> Regulatory Citations
        </h3>
        <div className="flex flex-wrap gap-2">
          {c.citations.map((cite) => (
            <span
              key={cite}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-accent/40 border border-border text-xs font-mono"
            >
              {cite}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AriaTab() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const analyse = useServerFn(runAriaAnalysis);

  async function run() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const result = await analyse({ data: { prompt: input } });
      if (result.ok) setOutput(result.text);
      else setError(result.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Paste the client case details below and ARIA will provide a complete regulatory analysis powered by
        Gemini 2.5 Pro.
      </p>

      <textarea
        rows={10}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste client details here: name, PAN, documents submitted, any flags noticed, source of wealth information..."
        className="w-full rounded-xl bg-card border border-border p-4 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
      />

      <button
        onClick={run}
        disabled={loading || !input.trim()}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:opacity-90"
      >
        🤖 Run ARIA Analysis
      </button>

      <div className="rounded-xl bg-card border border-border p-5 min-h-[180px]">
        {loading ? (
          <div className="text-sm text-muted-foreground">
            <span className="loading-dots">⏳ ARIA is analysing across 6 compliance stages</span>
          </div>
        ) : error ? (
          <div className="text-sm text-destructive whitespace-pre-wrap">{error}</div>
        ) : output ? (
          <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{output}</pre>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            ARIA analysis will appear here. Submit a case above to receive a full compliance report.
          </p>
        )}
      </div>
    </div>
  );
}

interface DecisionBtn {
  label: string;
  variant: "primary" | "warn" | "destructive" | "destructive-outline";
  successMsg: string;
}

function OfficerDecision({
  c,
  onClick,
  done,
}: {
  c: Case;
  onClick: (d: DecisionState) => void;
  done: DecisionState;
}) {
  const buttons: DecisionBtn[] = c.isCriticalSTR
    ? [
        {
          label: "🚨 Reject + File STR with FIU-IND",
          variant: "destructive",
          successMsg: "STR filed with FIU-IND. Case archived under PMLA Section 16. Anti-tipping provision active — no client communication.",
        },
        {
          label: "📋 Request Internal Compliance Review",
          variant: "warn",
          successMsg: "Internal compliance review requested. Case escalated to Head of Compliance.",
        },
      ]
    : [
        {
          label: "✅ Approve KYC",
          variant: "primary",
          successMsg: "KYC approved. Approval email sent to client. Account activation in progress.",
        },
        {
          label: "📋 Request Additional Documents",
          variant: "warn",
          successMsg: "Document request email sent to client. Case re-queued upon receipt.",
        },
        {
          label: "❌ Reject Application",
          variant: "destructive-outline",
          successMsg: "Application rejected. Standard rejection notice sent to client.",
        },
      ];

  function classes(v: DecisionBtn["variant"]) {
    switch (v) {
      case "primary":
        return "bg-primary text-primary-foreground hover:opacity-90";
      case "warn":
        return "bg-warning/15 text-warning border border-warning/40 hover:bg-warning/25";
      case "destructive":
        return "bg-destructive text-destructive-foreground hover:opacity-90";
      case "destructive-outline":
        return "bg-transparent text-destructive border border-destructive/50 hover:bg-destructive/10";
    }
  }

  function tone(v: DecisionBtn["variant"]): "ok" | "warn" | "fail" {
    if (v === "primary") return "ok";
    if (v === "warn") return "warn";
    return "fail";
  }

  return (
    <section className="mt-10 bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold">Officer Decision</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        ARIA analysis is complete. The final decision rests entirely with you. ARIA never approves or rejects
        autonomously.
      </p>

      {c.isCriticalSTR && (
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/40 p-4">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">
            <strong>PMLA Anti-Tipping Provision Active</strong> — Do not contact or inform this client of any investigation.
          </p>
        </div>
      )}

      {done ? (
        <div className="mt-5 rounded-lg bg-primary/10 border border-primary/40 p-5">
          <div className="flex items-center gap-2 font-semibold text-primary">
            ✅ Decision recorded: {done.label}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{done.success}</p>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3">
          {buttons.map((b) => (
            <button
              key={b.label}
              onClick={() =>
                onClick({ label: b.label, tone: tone(b.variant), success: b.successMsg })
              }
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold ${classes(b.variant)}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function ConfirmModal({
  decision,
  onCancel,
  onConfirm,
}: {
  decision: NonNullable<DecisionState>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold">Confirm this decision?</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          You are about to record: <span className="text-foreground font-medium">{decision.label}</span>
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90"
          >
            Yes, confirm
          </button>
        </div>
      </div>
    </div>
  );
}
