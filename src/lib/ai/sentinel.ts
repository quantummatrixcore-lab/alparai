export interface SentinelResult {
  passed: boolean;
  threats: SentinelThreat[];
  summary: string;
  score: number;
}

export interface SentinelThreat {
  type: ThreatType;
  severity: "low" | "medium" | "high" | "critical";
  match: string;
  rawMatch?: string;
  context: string;
  line: number;
  recommendation: string;
}

export type ThreatType =
  | "api_key"
  | "jwt_token"
  | "aws_key"
  | "github_token"
  | "private_key"
  | "database_url"
  | "auth_token"
  | "password"
  | "credit_card"
  | "ssn"
  | "email"
  | "ip_address"
  | "base64_secret"
  | "hex_secret"
  | "entropy_high"
  | "encryption_key"
  | "webhook_url"
  | "generic_secret";

const PATTERNS: Record<ThreatType, RegExp> = {
  api_key: /(?:(?:sk|pk|rk|tk)_[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z\-_]{35}|[Ss][Kk]-[a-zA-Z0-9]{20,})/g,
  jwt_token: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
  aws_key: /(?:AKIA|ASIA)[0-9A-Z]{16}/g,
  github_token:
    /gh[ps]_[a-zA-Z0-9]{36,}|github_pat_[a-zA-Z0-9]{22,}|[a-zA-Z0-9]{40,}(?:repo|admin|delete_repo)/g,
  private_key: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
  database_url: /(?:postgres|mysql|mongodb|redis|rediss):\/\/[^\s]{5,}/g,
  auth_token: /(?:access_token|auth_token|api_token|secret_token)[:=]["']?[a-zA-Z0-9_\-]{16,}/gi,
  password: /(?:password|passwd|pwd)[:=]["']?[^"'\s]{8,}/gi,
  credit_card: /\b(?:\d[ -]?){13,16}\b/g,
  ssn: /\b(?!000|666|9\d{2})\d{3}[ -]?(?!00)\d{2}[ -]?(?!0000)\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  ip_address: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
  base64_secret: /(?:[A-Za-z0-9+/]{40,}={0,2}|[A-Za-z0-9_-]{40,})/g,
  hex_secret: /\b(?:[0-9a-fA-F]{32,}|0x[0-9a-fA-F]{16,})\b/g,
  entropy_high: /\b(?![a-zA-Z]+$)(?![0-9]+$)[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}|;:',.<>?/~`]{30,}\b/g,
  encryption_key:
    /(?:encrypt(?:ion)?_key|secret_key|cipher_key|master_key)[:=]["']?[a-zA-Z0-9_\-]{16,}/gi,
  webhook_url:
    /https?:\/\/(?:hooks\.slack\.com|outlook\.office\.com|discord\.com\/api\/webhooks|requestbin\.com|webhook\.site)\/[^\s]+/g,
  generic_secret: /(?:secret|token|key|credential)[\s]*[:=][\s]*["']?[a-zA-Z0-9_\-\.]{16,}/gi,
};

export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    const digitChar = digits[i];
    if (digitChar === undefined) continue;
    let n = parseInt(digitChar, 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function shannonEntropy(data: string): number {
  const len = data.length;
  if (len === 0) return 0;
  const freq: Record<string, number> = {};
  for (const ch of data) freq[ch] = (freq[ch] || 0) + 1;
  return Object.values(freq).reduce((e, c) => {
    const p = c / len;
    return e - p * Math.log2(p);
  }, 0);
}

export function detectEncodeBypass(data: string): string[] {
  const detections: string[] = [];
  if (
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(data) &&
    data.length > 20
  ) {
    try {
      const decoded = Buffer.from(data, "base64").toString("utf-8");
      if (/[A-Za-z]/.test(decoded)) detections.push("base64");
    } catch (e) {
      console.error("Ignored error:", e);
    }
  }
  if (/^(?:[0-9a-fA-F]{2})+$/.test(data) && data.length > 10) {
    try {
      const decoded = Buffer.from(data, "hex").toString("utf-8");
      if (/[A-Za-z]/.test(decoded)) detections.push("hex");
    } catch (e) {
      console.error("Ignored error:", e);
    }
  }
  if (data.length > 3) {
    const rot13 = data.replace(/[a-zA-Z]/g, (c) => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + 13) % 26) + 65);
      if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + 13) % 26) + 97);
      return c;
    });
    if (rot13 !== data && /\b(?:secret|key|token|password|api|auth)\b/i.test(rot13))
      detections.push("rot13");
  }
  if (/&#x?[0-9A-Fa-f]{2,};/.test(data)) detections.push("html_entity");
  if (/\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|[nrt"\\])/.test(data)) detections.push("js_escape");
  if (/^(?:01|10|00|11){32,}$/.test(data.replace(/\s/g, ""))) detections.push("binary");
  if (/^[0oO01lI]{20,}$/.test(data.replace(/\s/g, ""))) detections.push("hey_obfuscation");
  return detections;
}

export function scanLine(line: string, lineNumber: number, _content: string): SentinelThreat[] {
  const threats: SentinelThreat[] = [];
  const startTime = typeof performance !== "undefined" ? performance.now() : Date.now();

  // Truncate excessively long lines to prevent ReDoS on complex regex patterns
  const safeLine = line.length > 4096 ? line.substring(0, 4096) : line;

  for (const [type, pattern] of Object.entries(PATTERNS) as [ThreatType, RegExp][]) {
    // ReDoS guard: abort if matching exceeds 50ms
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - startTime > 50) {
      break;
    }

    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(safeLine)) !== null) {
      if (type === "credit_card") {
        const cardNum = match[0].replace(/\D/g, "");
        if (!luhnCheck(cardNum)) continue;
        if (cardNum.length < 13 || cardNum.length > 19) continue;
      }
      if (type === "email" && /@example\.(com|org|net)$/i.test(match[0])) continue;
      if (
        type === "ip_address" &&
        /^127\.|^10\.|^172\.(1[6-9]|2[0-9]|3[01])\.|^192\.168\./.test(match[0])
      )
        continue;
      if (type === "base64_secret" || type === "hex_secret" || type === "entropy_high") {
        const entropy = shannonEntropy(match[0]);
        if (entropy < 4.0) continue;
      }

      const severity = getSeverity(type, match[0]);
      threats.push({
        type: type as ThreatType,
        severity,
        match: maskMatch(match[0], severity),
        rawMatch: match[0],
        context: extractContext(safeLine, match.index),
        line: lineNumber,
        recommendation: getRecommendation(type as ThreatType),
      });
    }
  }

  return threats;
}

export function scanContent(content: string): SentinelResult {
  const lines = content.split("\n");
  const allThreats: SentinelThreat[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;
    const threats = scanLine(line, i + 1, content);
    allThreats.push(...threats);
  }

  const firstLine = lines[0];
  const bypassDetections =
    lines.length === 1 && firstLine !== undefined ? detectEncodeBypass(firstLine) : [];
  const criticalCount = allThreats.filter((t) => t.severity === "critical").length;
  const highCount = allThreats.filter((t) => t.severity === "high").length;

  const score = Math.max(0, 100 - criticalCount * 20 - highCount * 10 - allThreats.length * 2);
  const passed = criticalCount === 0 && highCount === 0;
  const bypassNote =
    bypassDetections.length > 0 ? ` (bypass detected: ${bypassDetections.join(", ")})` : "";

  return {
    passed,
    threats: allThreats,
    summary: `${allThreats.length} threat(s) found. Critical: ${criticalCount}, High: ${highCount}${bypassNote}`,
    score,
  };
}

export function generateHtmlReport(result: SentinelResult, label: string): string {
  const rows = result.threats
    .map(
      (t) => `<tr>
      <td>${t.line}</td>
      <td><span class="sev-${t.severity}">${t.severity}</span></td>
      <td>${t.type}</td>
      <td><code>${escapeHtml(t.match)}</code></td>
      <td>${escapeHtml(t.context)}</td>
      <td>${escapeHtml(t.recommendation)}</td>
    </tr>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Sentinel Report — ${escapeHtml(label)}</title>
<style>
  body { font-family: monospace; background: #1a1a2e; color: #e0e0e0; padding: 20px; }
  h1 { color: #e94560; }
  .score { font-size: 2em; font-weight: bold; }
  .pass { color: #4ecca3; } .fail { color: #e94560; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #333; }
  th { background: #16213e; }
  code { background: #0f3460; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; word-break: break-all; }
  .sev-critical { color: #e94560; font-weight: bold; }
  .sev-high { color: #f5a623; }
  .sev-medium { color: #f5d623; }
  .sev-low { color: #4ecca3; }
  .summary { background: #16213e; padding: 15px; border-radius: 8px; margin: 20px 0; }
</style></head>
<body>
  <h1>🔍 Sentinel Scan: ${escapeHtml(label)}</h1>
  <div class="summary">
    <div class="score ${result.passed ? "pass" : "fail"}">${result.score}/100</div>
    <p>${escapeHtml(result.summary)}</p>
    <p>Status: <strong>${result.passed ? "✅ PASSED" : "❌ FAILED"}</strong></p>
  </div>
  ${
    result.threats.length > 0
      ? `<table>
    <tr><th>Line</th><th>Severity</th><th>Type</th><th>Match</th><th>Context</th><th>Recommendation</th></tr>
    ${rows}
  </table>`
      : "<p>No threats detected.</p>"
  }
</body></html>`;
}

function getSeverity(type: ThreatType, _match: string): SentinelThreat["severity"] {
  if (type === "private_key" || type === "aws_key" || type === "credit_card") return "critical";
  if (
    type === "api_key" ||
    type === "github_token" ||
    type === "database_url" ||
    type === "encryption_key"
  )
    return "high";
  if (type === "jwt_token" || type === "auth_token" || type === "ssn" || type === "webhook_url")
    return "medium";
  if (type === "base64_secret" || type === "hex_secret" || type === "entropy_high") return "medium";
  return "low";
}

function getRecommendation(type: ThreatType): string {
  const recs: Partial<Record<ThreatType, string>> = {
    private_key: "Revoke and regenerate immediately. Use vault or env var.",
    aws_key: "Revoke in AWS IAM. Use IAM roles instead of keys.",
    credit_card: "Never store raw PAN. Use PCI-compliant tokenization.",
    api_key: "Rotate key. Store in vault/env var, not in code.",
    github_token: "Revoke on GitHub. Use GitHub Actions secrets.",
    database_url: "Use connection pooling with IAM auth. Rotate password.",
    encryption_key: "Rotate key. Use KMS or vault for key management.",
    jwt_token: "This is a live token. Revoke and regenerate.",
    auth_token: "Remove from code. Use env var or secret manager.",
    ssn: "Mask display. Store encrypted with access audit.",
    password: "Remove hardcoded password. Use env var.",
    webhook_url: "Verify this endpoint is secured. Rotate if exposed.",
    email: "Verify this email is intended to be public.",
    ip_address: "Use env var or config, not hardcoded.",
  };
  return recs[type] || "Review and remove if sensitive.";
}

function maskMatch(match: string, severity: SentinelThreat["severity"]): string {
  if (severity === "low") return match;
  if (match.length <= 8) return match;
  const keep = severity === "critical" ? 2 : 4;
  return (
    match.substring(0, keep) +
    "*".repeat(Math.min(match.length - keep * 2, 20)) +
    match.substring(match.length - keep)
  );
}

function extractContext(line: string, index: number): string {
  const start = Math.max(0, index - 15);
  const end = Math.min(line.length, index + 30);
  let ctx = line.substring(start, end);
  if (start > 0) ctx = "..." + ctx;
  if (end < line.length) ctx = ctx + "...";
  return ctx.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function createSentinel(): Sentinel {
  return new Sentinel();
}

export class Sentinel {
  scan(content: string): SentinelResult {
    return scanContent(content);
  }

  scanFile(content: string, label: string): SentinelResult & { htmlReport: string } {
    const result = scanContent(content);
    return { ...result, htmlReport: generateHtmlReport(result, label) };
  }

  quickCheck(value: string): { safe: boolean; entropy: number; threats: string[] } {
    const entropy = shannonEntropy(value);
    const bypasses = detectEncodeBypass(value);
    const result = scanContent(value);
    return {
      safe: result.passed && bypasses.length === 0,
      entropy,
      threats: [...new Set(result.threats.map((t) => t.type as string))].concat(bypasses),
    };
  }
}
