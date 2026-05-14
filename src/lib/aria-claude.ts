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

export type AriaResult = { ok: true; text: string } | { ok: false; error: string };

export async function runAriaClaude(prompt: string): Promise<AriaResult> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY as string | undefined;
  if (!apiKey) {
    return {
      ok: false,
      error: "VITE_CLAUDE_API_KEY is not configured. Add it in your project environment variables.",
    };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        temperature: 0.3,
        system: SYSTEM,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      return { ok: false, error: `Claude API error (${res.status}): ${t.slice(0, 400)}` };
    }

    const json = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text =
      json.content
        ?.filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("\n") || "No response received.";
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
