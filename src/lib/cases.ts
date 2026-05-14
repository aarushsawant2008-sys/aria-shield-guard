export type RAG = "RED" | "YELLOW" | "GREEN" | "QUALITY_RECOVERY";
export type StageStatus = "ok" | "warn" | "fail";

export interface Stage {
  name: string;
  agent: string;
  status: StageStatus;
  summary: string;
}

export interface Case {
  id: string;
  name: string;
  pan: string;
  riskScore: number;
  rag: RAG;
  ragLabel: string;
  keyFlag: string;
  submitted: string;
  stages: Stage[];
  citations: string[];
  isCriticalSTR?: boolean;
}

export const CASES: Case[] = [
  {
    id: "arjun-verma",
    name: "Arjun Verma",
    pan: "CXYZ9012H",
    riskScore: 10,
    rag: "RED",
    ragLabel: "CRITICAL",
    keyFlag: "Money laundering pattern — STR required",
    submitted: "1 hr ago",
    isCriticalSTR: true,
    stages: [
      { name: "Stage 1", agent: "Intake Agent", status: "ok", summary: "Documents received." },
      { name: "Stage 2", agent: "Guardian Agent", status: "ok", summary: "Document quality acceptable." },
      { name: "Stage 3", agent: "Veritas Agent", status: "fail", summary: "CRITICAL — Address shows Andheri West, Mumbai but 47 transfers across 6 cities in 90 days. Possible synthetic identity — name matches serving IAS officer." },
      { name: "Stage 4", agent: "Compliance Agent", status: "fail", summary: "PMLA Section 12 indicators. Rapid-cycle fund transfers — classic layering pattern. Incomplete prior KYC at 2 other institutions." },
      { name: "Stage 4B", agent: "Network Intelligence", status: "fail", summary: "FINANCIAL CRIME DETECTED — (1) Layering via 6 jurisdictions (2) Synthetic identity/impersonation (3) Shell company network — 3 dormant entities linked. STR filing recommended under PMLA Section 16." },
      { name: "Stage 5", agent: "Risk Agent", status: "fail", summary: "Score 10/100 — CRITICAL. Do not engage client. Anti-tipping provision applies." },
    ],
    citations: ["PMLA 2002 §16 (STR obligation)", "PMLA §12 (anti-tipping)", "FATF Recommendation 20"],
  },
  {
    id: "priya-nair",
    name: "Priya Nair",
    pan: "BPQRS5678G",
    riskScore: 46,
    rag: "QUALITY_RECOVERY",
    ragLabel: "QUALITY RECOVERY",
    keyFlag: "Passport bottom half unclear — re-upload sent",
    submitted: "25 min ago",
    stages: [
      { name: "Stage 1", agent: "Intake Agent", status: "ok", summary: "All documents received." },
      { name: "Stage 2", agent: "Guardian Agent", status: "warn", summary: 'ADAPTIVE QUALITY RECOVERY — Passport biometric page bottom half unclear. Targeted guidance sent: "Re-photograph specifically the bottom half of passport page 2, ensuring MRZ lines are visible."' },
      { name: "Stage 3", agent: "Veritas Agent", status: "ok", summary: "All documents consistent — names and DOB match." },
      { name: "Stage 4", agent: "Compliance Agent", status: "ok", summary: "No adverse media, no PEP flags, source of wealth adequate." },
      { name: "Stage 4B", agent: "Network Intelligence", status: "ok", summary: "No suspicious patterns." },
      { name: "Stage 5", agent: "Risk Agent", status: "warn", summary: "Score held at 46/100 pending quality re-upload. Auto-reprocesses on receipt." },
    ],
    citations: ["RBI KYC Master Direction 2016 §32", "SEBI KRA Guidelines Clause 4"],
  },
  {
    id: "vikram-singh",
    name: "Vikram Singh",
    pan: "DLMNO3456I",
    riskScore: 55,
    rag: "YELLOW",
    ragLabel: "MEDIUM",
    keyFlag: "PEP network detected + PAN anomaly",
    submitted: "2 hrs ago",
    stages: [
      { name: "Stage 1", agent: "Intake Agent", status: "ok", summary: "All documents received." },
      { name: "Stage 2", agent: "Guardian Agent", status: "ok", summary: "Document quality acceptable." },
      { name: "Stage 3", agent: "Veritas Agent", status: "warn", summary: "PAN number format anomaly detected — possible invalidated PAN." },
      { name: "Stage 4", agent: "Compliance Agent", status: "warn", summary: "PEP flag — subject appears in political connection network. Requires enhanced due diligence per PMLA Section 12A." },
      { name: "Stage 4B", agent: "Network Intelligence", status: "warn", summary: "PEP-adjacent network — 2 connections to known politically exposed persons." },
      { name: "Stage 5", agent: "Risk Agent", status: "warn", summary: "Score 55/100 — Medium Risk. Enhanced due diligence required." },
    ],
    citations: ["PMLA 2002 §12A (PEP enhanced due diligence)", "SEBI KRA Guidelines Clause 9"],
  },
  {
    id: "rajesh-mehta",
    name: "Rajesh Mehta",
    pan: "ABCDE1234F",
    riskScore: 64,
    rag: "YELLOW",
    ragLabel: "MEDIUM",
    keyFlag: "Name mismatch + outdated address proof",
    submitted: "10 min ago",
    stages: [
      { name: "Stage 1", agent: "Intake Agent", status: "ok", summary: "All 5 documents received and complete." },
      { name: "Stage 2", agent: "Guardian Agent", status: "warn", summary: "PAN card top-right corner overexposed — re-photograph guidance sent." },
      { name: "Stage 3", agent: "Veritas Agent", status: "warn", summary: 'Name mismatch — Aadhaar: "Rajesh Kumar Mehta" vs PAN: "R.K. Mehta".' },
      { name: "Stage 4", agent: "Compliance Agent", status: "warn", summary: "Address proof dated March 2021 — exceeds 2-year RBI validity window." },
      { name: "Stage 4B", agent: "Network Intelligence", status: "ok", summary: "No financial crime patterns detected." },
      { name: "Stage 5", agent: "Risk Agent", status: "warn", summary: "Score 64/100 — Medium Risk. Human review required before any decision." },
    ],
    citations: ["PMLA 2002 §12", "RBI KYC Master Direction 2016 §38", "SEBI KRA Guidelines Clause 7"],
  },
];

export function getCase(id: string): Case | undefined {
  return CASES.find((c) => c.id === id);
}

export function riskColorClass(score: number): string {
  if (score < 30) return "text-destructive";
  if (score < 70) return "text-warning";
  return "text-primary";
}

export function ragBadgeClass(rag: RAG): string {
  if (rag === "RED") return "rag-red";
  if (rag === "GREEN") return "rag-green";
  return "rag-yellow";
}
