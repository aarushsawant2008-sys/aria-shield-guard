// ARIA — Automated Regulatory Intelligence Agent (Edge Function)
// Powered by Lovable AI Gateway (no user-managed API key required).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `You are ARIA — Automated Regulatory Intelligence Agent. You analyse client KYC documents for SEBI-registered Indian wealth management and PMS firms under PMLA 2002, RBI KYC Master Direction 2016 (amended August 2025), SEBI KRA Guidelines, and FATF Recommendations.

Produce a structured 6-stage compliance report. For every case, return:
- A clientName (echo or correct it from the inputs)
- extractedData with at minimum panNumber (echo or extracted from image/text)
- 6 stages: Intake Agent, Guardian Agent, Veritas Agent, Compliance Agent, Network Intelligence, Risk Agent — each with name, agent, status (ok|warn|fail), and a detailed finding (1-3 sentences citing specific regulatory provisions where relevant)
- A riskScore 0-100 (lower = higher risk)
- ragStatus: RED (<30), YELLOW (30-69), GREEN (>=70), or QUALITY_RECOVERY when the case is held pending document re-upload
- ragLabel: short uppercase label (e.g. "CRITICAL", "MEDIUM", "QUALITY RECOVERY", "LOW")
- isCriticalSTR: true ONLY when money-laundering patterns warrant STR filing under PMLA §16
- citations: array of exact regulatory provisions cited
- keyFlag: a single short sentence (<=80 chars) summarising the top concern

Always cite exact provisions. Always remind that the human officer makes the final decision.`;

interface AriaRequest {
  clientName: string;
  clientPAN: string;
  caseDetails: string;
  imageBase64?: string;
  imageMimeType?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as AriaRequest;
    const { clientName, clientPAN, caseDetails, imageBase64, imageMimeType } = body;

    if (!clientName?.trim() || !clientPAN?.trim() || !caseDetails?.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "clientName, clientPAN and caseDetails are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userContent: Array<Record<string, unknown>> = [
      {
        type: "text",
        text: `CLIENT NAME: ${clientName}\nCLIENT PAN: ${clientPAN}\n\nCASE DETAILS:\n${caseDetails}`,
      },
    ];
    if (imageBase64 && imageMimeType) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${imageMimeType};base64,${imageBase64}` },
      });
    }

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        clientName: { type: "string" },
        extractedData: {
          type: "object",
          additionalProperties: true,
          properties: { panNumber: { type: "string" } },
          required: ["panNumber"],
        },
        riskScore: { type: "integer", minimum: 0, maximum: 100 },
        ragStatus: { type: "string", enum: ["RED", "YELLOW", "GREEN", "QUALITY_RECOVERY"] },
        ragLabel: { type: "string" },
        isCriticalSTR: { type: "boolean" },
        keyFlag: { type: "string" },
        citations: { type: "array", items: { type: "string" } },
        stages: {
          type: "array",
          minItems: 6,
          maxItems: 6,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              agent: { type: "string" },
              status: { type: "string", enum: ["ok", "warn", "fail"] },
              finding: { type: "string" },
            },
            required: ["name", "agent", "status", "finding"],
          },
        },
      },
      required: [
        "clientName",
        "extractedData",
        "riskScore",
        "ragStatus",
        "ragLabel",
        "isCriticalSTR",
        "keyFlag",
        "citations",
        "stages",
      ],
    };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userContent },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "aria_report", strict: true, schema },
        },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit reached. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI credits exhausted. Top up workspace credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: `AI gateway error (${aiRes.status}): ${errText.slice(0, 300)}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;

    return new Response(
      JSON.stringify({ success: true, ...parsed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
