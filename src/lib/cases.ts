import { supabase } from "@/integrations/supabase/client";

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

interface CaseRow {
  id: string;
  name: string;
  pan: string;
  score: number;
  rag: string;
  rag_label: string;
  flag: string;
  submitted: string;
  is_critical_str: boolean;
  result: {
    stages?: Array<{ name: string; agent: string; status: StageStatus; summary?: string; finding?: string }>;
    citations?: string[];
  } | null;
}

function rowToCase(r: CaseRow): Case {
  const stagesRaw = r.result?.stages ?? [];
  const stages: Stage[] = stagesRaw.map((s) => ({
    name: s.name,
    agent: s.agent,
    status: s.status,
    summary: s.summary ?? s.finding ?? "",
  }));
  return {
    id: r.id,
    name: r.name,
    pan: r.pan,
    riskScore: r.score,
    rag: r.rag as RAG,
    ragLabel: r.rag_label,
    keyFlag: r.flag,
    submitted: r.submitted,
    isCriticalSTR: r.is_critical_str,
    stages,
    citations: r.result?.citations ?? [],
  };
}

export async function fetchCases(): Promise<Case[]> {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("score", { ascending: true });
  if (error) throw error;
  return (data as CaseRow[]).map(rowToCase);
}

export async function fetchCase(id: string): Promise<Case | null> {
  const { data, error } = await supabase.from("cases").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToCase(data as CaseRow) : null;
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
