# 🏛️ ALPAR AI — Multi-Model Analysis Protocol

## Version: 1.0 | June 2026

### 1. ANALYSIS FLOW

[1] Fetch analysis from each AI model using the same prompt
[2] Store responses in a standardized format
[3] Flag conflicting or inconsistent findings
[4] Create a consolidated report
[5] Send to Google Antigravity

### 2. PROMPT STANDARD

```
ROLE: You are a platform quality inspector.
TASK: Analyze the following platform status report.
FORMAT:
  - Strengths (at least 3)
  - Weaknesses (at least 3)
  - Critical Issues (at least 2)
  - Recommendations (in order of priority)
  - Scoring (out of 100, with rationale)
CONSTRAINT: Do not use technical jargon; provide actionable recommendations.
```

### 3. MODEL SPECIFICATIONS

| Model             | Strong Area        | Weak Area  | Intended Use Case                   |
| ----------------- | ------------------ | ---------- | ----------------------------------- |
| Gemini 2.5 Pro    | Code, analysis     | Creativity | Technical analysis, code generation |
| Claude 3.5 Sonnet | Writing, logic     | Speed      | Content analysis, strategy          |
| GPT-4o            | General, versatile | Cost       | General evaluation                  |
| DeepSeek          | Cost, code         | English    | Fast scanning, code                 |
| Perplexity        | Research           | Depth      | Source scanning                     |

### 4. CONSOLIDATION RULES

- If 3+ models flag the same finding → CRITICAL
- If 2 models flag it → IMPORTANT
- If 1 model flags it → EVALUATE
- If no model flags it → IGNORE

### 5. ANTIGRAVITY INTEGRATION

- Convert the consolidated report into an Antigravity prompt
- For each action: Specify File, Line, and Change
- Include test cases
- Create a feedback loop

---

# Multi-Model Analysis Checklist

## Before Each Analysis

- [ ] Are API keys active for all models?
- [ ] Has rate limit checking been performed?
- [ ] Is the prompt version up to date?
- [ ] Is the output format standardized?

## During Analysis

- [ ] Was a response received from every model?
- [ ] Are responses timestamped?
- [ ] Were inconsistencies noted?

## After Analysis

- [ ] Has a consolidated report been created?
- [ ] Have conflicting findings been resolved?
- [ ] Has the Antigravity prompt been prepared?
- [ ] Has a test plan been appended?

## After Antigravity Run

- [ ] Have changes been tested?
- [ ] Was regression testing performed?
- [ ] Was deployment approval obtained?
