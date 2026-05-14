import { createServerFn } from "@tanstack/react-start";

const SYSTEM = `You are ARIA — Automated Regulatory Intelligence Agent. You are a KYC compliance analysis system built exclusively for SEBI-registered Indian wealth management and PMS firms. You analyse client documents and data for KYC compliance under PMLA 2002, RBI KYC Master Direction 2016 (amended August 2025), SEBI KRA Guidelines, and FATF Recommendations.

When given client information, provide a structured compliance analysis in these exact sections:
STAGE 1 — INTAKE AGENT: Document completeness assessment
STAGE 2 — GUARDIAN AGENT: Document quality assessment and specific re-photograph guidance if needed
STAGE 3 — VERITAS AGENT: Cross-document verification and data extraction
STAGE 4 — COMPLIANCE AGENT: Regulatory checks with exact law citations (PMLA section numbers, RBI direction clauses, SEBI circular references)
STAGE 4B — NETWORK INTELLIGENCE: Financial crime pattern detection (layering, PEP networks, synthetic identity, shell companies)
STAGE 5 — RISK AGENT: Final RAG score 0-100 with Green/Yellow/Red classification
STAGE 6 — REPORT AGENT: Officer recommendations and next steps

Always cite exact regulatory provisions. Always remind that the human compliance officer makes every final decision. Flag STR requirements under PMLA Section 16 when money laundering patterns are detected. Apply anti-tipping provisions when fraud is suspected.`;

export const runAriaAnalysis = createServerFn({ method: "POST" })
  .inputValidator((input: { prompt: string }) => {
    if (!input || typeof input.prompt !== "string" || !input.prompt.trim()) {
      throw new Error("prompt is required");
    }
    if (input.prompt.length > 20000) {
      throw new Error("prompt too long");
    }
    return { prompt: input.prompt };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "GEMINI_API_KEY is not configured on the server." };
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM }] },
            contents: [{ parts: [{ text: data.prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
          }),
        },
      );

      if (!res.ok) {
        const t = await res.text();
        return { ok: false as const, error: `Gemini API error (${res.status}): ${t.slice(0, 300)}` };
      }

      const json = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text =
        json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("\n") ??
        "No response received.";
      return { ok: true as const, text };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Unknown error" };
    }
  });
