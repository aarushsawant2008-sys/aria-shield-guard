export type AriaResult = { ok: true; text: string } | { ok: false; error: string };

const HIGH_RISK = `STAGE 1 — INTAKE AGENT
All mandatory KYC documents received: PAN, Aadhaar, address proof, bank statements (12 months), source-of-wealth declaration. Intake completeness: 100%.

STAGE 2 — GUARDIAN AGENT
Document image quality acceptable across all submissions. MRZ lines on passport readable. No re-photograph required.

STAGE 3 — VERITAS AGENT
Cross-document verification reveals SEVERE inconsistencies:
• Declared address (single residence) contradicts transactional footprint spanning 6+ cities within 90 days.
• Bank statements show 47 cash deposits structured below the ₹10 lakh CTR threshold — classic smurfing signature.
• Beneficial-ownership declaration omits 3 entities surfaced via PAN linkage.

STAGE 4 — COMPLIANCE AGENT
Regulatory breaches identified:
• PMLA 2002 §3 — Knowing involvement in process connected with proceeds of crime (indicative).
• PMLA 2002 §12 — Reporting entity obligations triggered.
• RBI KYC Master Direction 2016 (amended Aug 2025) §38 — Enhanced due diligence mandatory for high-risk customers.
• SEBI Master Circular on AML/CFT (2024) Clause 5.2 — Onboarding must be deferred pending source-of-funds substantiation.
• FATF Recommendation 10 & 20 — Suspicious transaction reporting obligation engaged.

STAGE 4B — NETWORK INTELLIGENCE
Financial crime patterns DETECTED:
• LAYERING — Rapid-cycle transfers across 6 jurisdictions consistent with placement→layering typology.
• SHELL COMPANY NETWORK — 3 dormant entities with shared registered address linked to applicant's PAN.
• SYNTHETIC IDENTITY indicators — Name/DOB combination matches a serving public official (possible impersonation).
• Structuring pattern — 47 sub-threshold cash deposits.

STAGE 5 — RISK AGENT
Final RAG Score: 8/100 — RED (CRITICAL)
Recommendation: DO NOT ONBOARD. Suspicious Transaction Report (STR) filing required under PMLA §16 within 7 working days.

STAGE 6 — REPORT AGENT
Officer next steps:
1. File STR with FIU-IND through FINnet 2.0 portal — reference PMLA §16.
2. Apply ANTI-TIPPING provision under PMLA §12(1)(c) — no communication of suspicion to client.
3. Freeze any pending account-opening workflow.
4. Escalate to Principal Officer and Designated Director.
5. Preserve evidentiary chain — retain all submitted documents and system logs (PMLA Rule 3 — 5-year retention).

Final decision rests with the human compliance officer. ARIA is advisory only.`;

const QUALITY_RECOVERY = `STAGE 1 — INTAKE AGENT
All mandatory documents received. Intake completeness: 100%.

STAGE 2 — GUARDIAN AGENT
ADAPTIVE QUALITY RECOVERY engaged. One or more documents failed image-quality thresholds:
• Detected: blur / glare / partial occlusion on identity document.
• MRZ / OCR confidence below 0.78 acceptance threshold.
Targeted re-capture guidance generated and dispatched to client:
"Please re-photograph the affected page in even daylight, lay the document flat on a dark non-reflective surface, and ensure the bottom edge including the machine-readable zone is fully visible within frame."
Auto-reprocessing armed — case will resume Stage 3 on receipt.

STAGE 3 — VERITAS AGENT
Held pending Stage 2 recovery. Preliminary cross-check on legible fields shows name and DOB consistency across all readable documents.

STAGE 4 — COMPLIANCE AGENT
No adverse media. No PEP match. Source-of-wealth narrative aligns with declared occupation.
• RBI KYC Master Direction 2016 §32 — Document standards not yet satisfied.
• SEBI KRA Guidelines Clause 4 — KRA upload deferred until quality threshold met.

STAGE 4B — NETWORK INTELLIGENCE
No suspicious network patterns. No layering, structuring, or shell-entity indicators.

STAGE 5 — RISK AGENT
Provisional RAG Score: 46/100 — YELLOW (HOLD)
Score will auto-recompute on receipt of acceptable re-upload.

STAGE 6 — REPORT AGENT
Officer next steps:
1. No action required from officer — automated re-capture loop in progress.
2. If re-upload not received within 72 hours, send reminder per SOP.
3. On successful recovery, case will re-enter queue with refreshed score.

Final decision rests with the human compliance officer. ARIA is advisory only.`;

const MEDIUM_RISK = `STAGE 1 — INTAKE AGENT
All 5 mandatory KYC documents received and parsed. Intake completeness: 100%.

STAGE 2 — GUARDIAN AGENT
Document image quality within acceptable thresholds. Minor exposure issue noted on PAN card (top-right corner) — non-blocking.

STAGE 3 — VERITAS AGENT
Cross-document verification largely consistent. Minor anomalies:
• Name format variation between Aadhaar (full name) and PAN (initials) — common, requires officer attestation.
• Address proof issued > 24 months ago — exceeds RBI freshness window.

STAGE 4 — COMPLIANCE AGENT
Regulatory checks:
• PMLA 2002 §12 — Standard CDD obligations satisfied.
• RBI KYC Master Direction 2016 (amended Aug 2025) §38 — Address proof must be re-validated (within 24 months).
• SEBI KRA Guidelines Clause 7 — Updated address proof required before KRA dispatch.
• No adverse media. No sanctions list match (UN, OFAC, EU consolidated).

STAGE 4B — NETWORK INTELLIGENCE
No financial crime patterns detected. No layering, smurfing, shell-entity, or PEP-network indicators.

STAGE 5 — RISK AGENT
Final RAG Score: 64/100 — YELLOW (MEDIUM)
Recommendation: Conditional approval pending refreshed address proof and officer sign-off on name-format variance.

STAGE 6 — REPORT AGENT
Officer next steps:
1. Request updated address proof (utility bill / bank statement ≤ 2 months old).
2. Record officer attestation reconciling Aadhaar full name and PAN initials.
3. On receipt, re-run Stage 3 → Stage 5 (auto-triggered).
4. If satisfied, proceed to KRA upload under SEBI KRA Guidelines Clause 7.

Final decision rests with the human compliance officer. ARIA is advisory only.`;

function pick(prompt: string): string {
  const p = prompt.toLowerCase();
  const high = ["cash deposit", "multiple cities", "layering", "smurfing", "structuring", "shell company", "str", "money laundering"];
  const quality = ["quality", "blur", "blurry", "unclear", "glare", "re-upload", "reupload", "re-photograph"];
  if (high.some((k) => p.includes(k))) return HIGH_RISK;
  if (quality.some((k) => p.includes(k))) return QUALITY_RECOVERY;
  return MEDIUM_RISK;
}

export async function runAriaClaude(prompt: string): Promise<AriaResult> {
  // Simulated analysis latency for realism — no external API call.
  await new Promise((r) => setTimeout(r, 1400));
  return { ok: true, text: pick(prompt) };
}
