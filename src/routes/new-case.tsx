import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { ArrowLeft, Upload, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/new-case")({
  component: NewCasePage,
  head: () => ({
    meta: [
      { title: "New Case — ARIA" },
      { name: "description", content: "Submit a new client for ARIA KYC analysis." },
    ],
  }),
});

interface StageOut {
  name: string;
  agent: string;
  status: "ok" | "warn" | "fail";
  finding: string;
}

interface AriaResult {
  success: boolean;
  error?: string;
  clientName: string;
  extractedData: { panNumber: string; [k: string]: unknown };
  riskScore: number;
  ragStatus: "RED" | "YELLOW" | "GREEN" | "QUALITY_RECOVERY";
  ragLabel: string;
  isCriticalSTR: boolean;
  keyFlag: string;
  citations: string[];
  stages: StageOut[];
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function NewCasePage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [clientName, setClientName] = useState("");
  const [clientPAN, setClientPAN] = useState("");
  const [caseDetails, setCaseDetails] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = clientName.trim() && clientPAN.trim() && caseDetails.trim() && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;
      if (imageFile) {
        const { base64, mimeType } = await fileToBase64(imageFile);
        imageBase64 = base64;
        imageMimeType = mimeType;
      }

      const { data, error: invokeError } = await supabase.functions.invoke<AriaResult>(
        "aria-analyse",
        {
          body: { clientName, clientPAN, caseDetails, imageBase64, imageMimeType },
        },
      );

      if (invokeError) throw new Error(invokeError.message);
      if (!data || data.success === false) throw new Error(data?.error ?? "ARIA analysis failed.");

      const stages = data.stages.map((s) => ({
        name: s.name,
        agent: s.agent,
        status: s.status,
        summary: s.finding,
      }));

      const flag = (data.stages[3]?.finding ?? data.keyFlag ?? "").slice(0, 60);

      const { data: inserted, error: insertError } = await supabase
        .from("cases")
        .insert({
          name: data.clientName,
          pan: data.extractedData.panNumber,
          score: data.riskScore,
          rag: data.ragStatus,
          rag_label: data.ragLabel,
          flag,
          submitted: "just now",
          is_critical_str: data.isCriticalSTR,
          result: { stages, citations: data.citations },
        })
        .select("id")
        .single();

      if (insertError) throw new Error(insertError.message);

      navigate({ to: "/case/$id", params: { id: inserted.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        <ArrowLeft className="w-4 h-4" /> Compliance Queue
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight">New Case</h1>
      <p className="mt-1.5 text-sm text-muted-foreground mb-8">
        Submit client details for full ARIA 6-stage KYC analysis.
      </p>

      <div className="space-y-5 bg-card border border-border rounded-xl p-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Client Name
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Arjun Verma"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            PAN
          </label>
          <input
            type="text"
            value={clientPAN}
            onChange={(e) => setClientPAN(e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            maxLength={10}
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-background border border-border px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Case Details
          </label>
          <textarea
            rows={8}
            value={caseDetails}
            onChange={(e) => setCaseDetails(e.target.value)}
            placeholder="Documents submitted, source of wealth, transaction history, any flags noticed…"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-background border border-border px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y disabled:opacity-60"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Document Image (optional)
          </label>
          <div className="mt-2">
            {imageFile ? (
              <div className="flex items-center justify-between gap-3 rounded-lg bg-background border border-border px-4 py-3">
                <span className="text-sm truncate">{imageFile.name}</span>
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  disabled={loading}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-60"
              >
                <Upload className="w-4 h-4" /> Upload PAN / Aadhaar / Passport
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setImageFile(f);
              }}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/40 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:opacity-90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> ARIA is analysing…
            </>
          ) : (
            <>🤖 Run ARIA Analysis</>
          )}
        </button>
      </div>
    </div>
  );
}
