/**
 * PII Guardian — Server-side personal data masking.
 *
 * Detects and redacts Turkish + international PII patterns:
 *  - TC Kimlik No (Turkish national ID)
 *  - Turkish phone numbers
 *  - Email addresses
 *  - IBAN
 *  - Credit card numbers (Luhn-aware)
 *  - IPv4 addresses
 *  - URLs containing tokens/keys
 *  - Passport numbers (TR + general)
 *  - Date of birth patterns
 *  - Turkish address patterns
 *
 * Pure-function: no I/O, no dependencies. Safe for edge runtime.
 */

import { Sentinel } from "../ai/sentinel";

const PATTERNS: ReadonlyArray<{
  name: string;
  re: RegExp;
  mask: string;
  luhn?: boolean;
  tcKimlik?: boolean;
  ibanMod97?: boolean;
}> = [
  // IBAN (TR + general) - MUST be matched before phone/TC to prevent partial masking of digit sequences
  {
    name: "iban",
    re: /\bTR\d{2}\s?(?:\d{4}\s?){5}\d{2}\b|\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g,
    mask: "[REDACTED-IBAN]",
    ibanMod97: true,
  },
  { name: "tc_kimlik", re: /\b[1-9](?:[\s.-]?\d){10}\b/g, mask: "[REDACTED-TC]", tcKimlik: true },
  {
    name: "vergi_kimlik",
    re: /(?:(?:vergi|VKN|tax)\s*(?:kimlik|id|number|no|numaras\u0131)?\s*(?:no|numaras\u0131)?\s*[:.]?\s*)\d{10}\b/gi,
    mask: "[REDACTED-TAX-ID]",
  },
  // Turkish phone (mobile + landline)
  {
    name: "phone_tr",
    re: /(?:\+90|0)\s?(?:\(?\d{3}\)?\s?\d{3}\s?\d{2}\s?\d{2}|\d{10,11})/g,
    mask: "[REDACTED-PHONE]",
  },
  // International phone (rough)
  {
    name: "phone_intl",
    re: /\+\d{1,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g,
    mask: "[REDACTED-PHONE]",
  },
  // Email
  {
    name: "email",
    re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    mask: "[REDACTED-EMAIL]",
  },
  // Credit card (13-19 digits, optional separators, Luhn-valid)
  {
    name: "credit_card",
    re: /\b(?:\d[ -]?){12,18}\d\b/g,
    mask: "[REDACTED-CARD]",
    luhn: true,
  },
  {
    name: "ipv4",
    re: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\b/g,
    mask: "[REDACTED-IP]",
  },
  {
    name: "ipv6",
    re: /(?:^|(?<=\s))(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(?=$|\s)|(?:^|(?<=\s))(?:[0-9a-fA-F]{1,4}:){1,7}:|::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}(?=$|\s)/g,
    mask: "[REDACTED-IP]",
  },
  // URLs with tokens / API keys
  {
    name: "url_token",
    re: /(https?:\/\/[^\s]+(?:token|key|apikey|api_key|access_token|secret|password|pwd)=[^\s&"'>]+)/gi,
    mask: "[REDACTED-URL-TOKEN]",
  },
  // Generic API key patterns (sk-…, ghp_…, AKIA…)
  {
    name: "api_key",
    re: /\b(?:sk-[A-Za-z0-9-]{20,}|ghp_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|xai-[A-Za-z0-9]{20,})\b/g,
    mask: "[REDACTED-API-KEY]",
  },
  // Turkish passport (letter + 8 digits) — heuristic
  {
    name: "passport_tr",
    re: /\b[A-Z]\d{8}\b/g,
    mask: "[REDACTED-PASSPORT]",
  },
  // Date of birth (Turkish + ISO formats: DD.MM.YYYY or YYYY-MM-DD)
  {
    name: "dob",
    re: /\b(?:(?:0?[1-9]|[12]\d|3[01])[./-](?:0?[1-9]|1[0-2])[./-](?:19|20)\d{2}|(?:19|20)\d{2}[./-](?:0?[1-9]|1[0-2])[./-](?:0?[1-9]|[12]\d|3[01]))\b/g,
    mask: "[REDACTED-DATE]",
  },
  // Turkish address patterns: built via RegExp to avoid TS parsing issues with Unicode
  {
    name: "address_tr",
    re: new RegExp(
      "\\b(?:[A-Z][a-zA-Z\u00c0-\u017e]*(?:\\s+[A-Z][a-zA-Z\u00c0-\u017e]*)*?" +
        "(?:\\s+(?:Mahallesi|Mh|Mah|Caddesi|Cad|Cd|Bulvar\u0131|Bul|Yolu|Meydan\u0131|\u00c7\u0131kmaz\u0131))?" +
        "(?:[,\\s]+\\d+)?" +
        "(?:\\s+(?:Sokak|Sk|Sok|Cad|Cd))?" +
        "\\s+(?:No|Nu|Nr)[.:]?\\s*\\d+(?:\\s*/\\s*\\d+)?" +
        "[\\s,]+[A-Z][a-zA-Z\u00c0-\u017e]*(?:[\\s,]+[A-Z][a-zA-Z\u00c0-\u017e]*)*" +
        "[\\s,]*\\d{5})\\b",
      "g",
    ),
    mask: "[REDACTED-ADDRESS]",
  },
];

export interface PiiDetection {
  type: string;
  count: number;
  samples: string[]; // first few raw matches (truncated)
}

export interface PiiScanResult {
  masked: string;
  detections: PiiDetection[];
  piiFound: boolean;
  redactedCount: number;
}

/**
 * Mask all detected PII in a text. Returns masked text + detection metadata.
 */
export function maskPII(input: string): PiiScanResult {
  if (!input) {
    return { masked: "", detections: [], piiFound: false, redactedCount: 0 };
  }

  let masked = input;
  const detectionMap = new Map<string, PiiDetection>();
  let totalRedactions = 0;

  for (const { name, re, mask, luhn, tcKimlik, ibanMod97 } of PATTERNS) {
    let currentMatchCount = 0;
    const samples: string[] = [];

    masked = masked.replace(re, (match) => {
      let valid = true;
      if (luhn) valid = isLuhnValid(match);
      else if (tcKimlik) valid = isTcKimlikValid(match);
      else if (ibanMod97) valid = isIbanMod97Valid(match);

      if (valid) {
        currentMatchCount++;
        totalRedactions++;
        if (samples.length < 3) samples.push(truncateSample(match));
        return mask;
      }
      return match;
    });

    if (currentMatchCount > 0) {
      detectionMap.set(name, {
        type: name,
        count: currentMatchCount,
        samples,
      });
    }
  }

  // Run Sentinel Scanner to intercept and redact credentials / secrets
  try {
    const sentinel = new Sentinel();
    const sentinelResult = sentinel.scan(masked);
    for (const threat of sentinelResult.threats) {
      if (threat.rawMatch) {
        const escaped = threat.rawMatch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const single = new RegExp(escaped, "g");
        masked = masked.replace(single, "[REDACTED-SECRET]");
        totalRedactions++;

        const existing = detectionMap.get(threat.type);
        if (existing) {
          existing.count++;
          if (existing.samples.length < 3) {
            existing.samples.push(threat.type);
          }
        } else {
          detectionMap.set(threat.type, {
            type: threat.type,
            count: 1,
            samples: [threat.type],
          });
        }
      }
    }
  } catch (_err) {
    // Fallback if sentinel fails or is not configured
  }

  const finalDetections = Array.from(detectionMap.values());
  return {
    masked,
    detections: finalDetections,
    piiFound: finalDetections.length > 0,
    redactedCount: totalRedactions,
  };
}

/**
 * Quick boolean check: does this text contain any PII?
 */
export function hasPII(input: string): boolean {
  if (!input) return false;
  return PATTERNS.some(({ re, luhn, tcKimlik, ibanMod97 }) => {
    re.lastIndex = 0;
    if (!re.test(input)) return false;
    if (luhn || tcKimlik || ibanMod97) {
      re.lastIndex = 0;
      const matches = [...input.matchAll(re)];
      const validator = luhn ? isLuhnValid : tcKimlik ? isTcKimlikValid : isIbanMod97Valid;
      return matches.some((m) => validator(m[0]));
    }
    return true;
  });
}

/**
 * Get all PII types detected in the text.
 */
export function detectPIITypes(input: string): string[] {
  if (!input) return [];
  const types: string[] = [];
  for (const { name, re, luhn, tcKimlik, ibanMod97 } of PATTERNS) {
    re.lastIndex = 0;
    if (!re.test(input)) continue;
    if (luhn || tcKimlik || ibanMod97) {
      re.lastIndex = 0;
      const matches = [...input.matchAll(re)];
      const validator = luhn ? isLuhnValid : tcKimlik ? isTcKimlikValid : isIbanMod97Valid;
      if (matches.some((m) => validator(m[0]))) types.push(name);
    } else {
      types.push(name);
    }
  }
  return types;
}

export type ContentWarningType = "non_consensual_intimate_imagery_csam";

const CONTENT_WARNING_PATTERNS: ReadonlyArray<{
  type: ContentWarningType;
  re: RegExp;
}> = [
  {
    type: "non_consensual_intimate_imagery_csam",
    re: new RegExp(
      [
        "non[\\s-]?consensual\\s+intimate\\s+(?:imagery|image|images|photo|photos|content)",
        "non[\\s-]?consensual\\s+deepfake",
        "non[\\s-]?consensual\\s+porn",
        "\\bcsam\\b",
        "child\\s+sexual\\s+abuse\\s+material",
        "child\\s+pornography",
        "revenge\\s+porn",
        "intimate\\s+image\\s+abuse",
        "deepfake\\s+porn",
        "[Rr]\u0131zas\u0131z\\s+mahrem\\s+[Gg]\u00f6r\u00fcnt\u00fc",
        "[\u00c7\u00e7]ocuk\\s+istismar\u0131\\s+[Mm]ateryali",
        "[\u00c7\u00e7]ocuk\\s+pornografisi",
      ].join("|"),
      "gi",
    ),
  },
];

export const SENSITIVE_CATEGORIES: ReadonlySet<string> = new Set([
  "non_consensual_intimate_imagery_csam",
]);

export function isSensitiveCategory(category: string): boolean {
  return SENSITIVE_CATEGORIES.has(category);
}

export interface ContentWarningResult {
  warnings: ContentWarningType[];
  flagged: boolean;
}

/**
 * Flag text that likely describes non-consensual intimate imagery (NCII) or
 * child sexual abuse material (CSAM) so it can be routed to staff review.
 */
export function detectContentWarning(input: string): ContentWarningResult {
  if (!input) return { warnings: [], flagged: false };
  const warnings: ContentWarningType[] = [];
  for (const { type, re } of CONTENT_WARNING_PATTERNS) {
    re.lastIndex = 0;
    if (re.test(input)) warnings.push(type);
  }
  return { warnings, flagged: warnings.length > 0 };
}

/**
 * Quick boolean check: does this text require a sensitive-content warning?
 */
export function hasContentWarning(input: string): boolean {
  return detectContentWarning(input).flagged;
}

function truncateSample(s: string, max = 8): string {
  if (s.length <= max) return s;
  return s.slice(0, 4) + "…" + s.slice(-2);
}

/**
 * Luhn check for credit card numbers.
 */
function isLuhnValid(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i] ?? "0", 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

function isTcKimlikValid(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (digits[0] === "0") return false;

  const d: number[] = [];
  for (let i = 0; i < 11; i++) {
    d.push(parseInt(digits[i] ?? "0", 10));
  }

  const oddSum = (d[0] ?? 0) + (d[2] ?? 0) + (d[4] ?? 0) + (d[6] ?? 0) + (d[8] ?? 0);
  const evenSum = (d[1] ?? 0) + (d[3] ?? 0) + (d[5] ?? 0) + (d[7] ?? 0);
  const d10Raw = (oddSum * 7 - evenSum) % 10;
  const d10Check = d10Raw < 0 ? d10Raw + 10 : d10Raw;
  if (d10Check !== d[9]) return false;

  let sumFirst10 = 0;
  for (let i = 0; i < 10; i++) {
    sumFirst10 += d[i] ?? 0;
  }
  if (sumFirst10 % 10 !== d[10]) return false;

  return true;
}

function isIbanMod97Valid(iban: string): boolean {
  // Clean up whitespace and non-alphanumeric characters
  const clean = iban.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (clean.length < 15 || clean.length > 34) return false;

  // Rearrange: move first 4 chars to the end
  const rearranged = clean.slice(4) + clean.slice(0, 4);

  // Convert characters to digits
  let digitStr = "";
  for (let i = 0; i < rearranged.length; i++) {
    const char = rearranged[i];
    if (!char) continue;
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      // A-Z
      digitStr += String(code - 55); // A=10, B=11, ...
    } else if (code >= 48 && code <= 57) {
      // 0-9
      digitStr += char;
    } else {
      return false; // Invalid character
    }
  }

  try {
    const num = BigInt(digitStr);
    return num % 97n === 1n;
  } catch {
    return false;
  }
}
