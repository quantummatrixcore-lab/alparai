/**
 * TCSFL (Tactical Command & Synergy Flow Logic) AST/Regex Gate
 * Deterministik (Sıfır-LLM) doğrulama katmanı.
 * LLM token yakmadan önce kodun / verinin temel güvenlik ve şema sınırlarını denetler.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  astTrace?: unknown;
}

// Güvenlik kuralları ve yasaklı anahtar kelimeler
const FORBIDDEN_PATTERNS = [
  /eval\s*\(/i,
  /setTimeout\s*\(\s*['"]/i, // String execution in setTimeout
  /process\.env/i, // Hardcoded env access bypassing safe wrappers
];

/**
 * Hephaestus'tan gelen kod taslağını Regex/AST mantığıyla doğrular
 */
export function validateHephaestusOutput(codePayload: string): ValidationResult {
  const errors: string[] = [];

  // 1. Basic Syntax & Pattern Check (Zero-LLM Fast-Fail)
  if (!codePayload || codePayload.trim() === "") {
    return { isValid: false, errors: ["Empty payload received from Hephaestus."] };
  }

  // 2. Forbidden Pattern Analysis
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(codePayload)) {
      errors.push(`Security violation: Detected forbidden pattern ${pattern.toString()}`);
    }
  }

  // 3. (Mock) AST Parsing Gate - In reality, uses acorn/tree-sitter bindings
  const hasSyntaxError = checkBasicBrackets(codePayload);
  if (hasSyntaxError) {
    errors.push("Syntax Error: Unmatched brackets or braces.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Extremely basic structural check for bracket matching (simulating AST step 1)
 */
function checkBasicBrackets(code: string): boolean {
  const stack = [];
  const map: Record<string, string> = { "}": "{", "]": "[", ")": "(" };
  for (const char of code) {
    if (char === "{" || char === "[" || char === "(") stack.push(char);
    else if (char === "}" || char === "]" || char === ")") {
      if (stack.pop() !== map[char]) return true; // Error
    }
  }
  return stack.length !== 0;
}
