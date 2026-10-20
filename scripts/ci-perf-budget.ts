// FAZ2: Core Web Vitals CI bütçe kapısı (iskelet).
// Gerçek Lighthouse koşusu yok; bütçe sabitleri CI tarafından okunur.
// LCP<=2.0s, CLS<=0.05, INP<=100ms, TTFB<=600ms aşılırsa CI fail verir.
export const PERF_BUDGET = {
  LCP_MS: 2000,
  CLS: 0.05,
  INP_MS: 100,
  TTFB_MS: 600,
} as const;

export function checkPerfBudget(m: {
  lcpMs: number;
  cls: number;
  inpMs: number;
  ttfbMs: number;
}): string[] {
  const fails: string[] = [];
  if (m.lcpMs > PERF_BUDGET.LCP_MS) fails.push(`LCP ${m.lcpMs}ms > ${PERF_BUDGET.LCP_MS}ms`);
  if (m.cls > PERF_BUDGET.CLS) fails.push(`CLS ${m.cls} > ${PERF_BUDGET.CLS}`);
  if (m.inpMs > PERF_BUDGET.INP_MS) fails.push(`INP ${m.inpMs}ms > ${PERF_BUDGET.INP_MS}ms`);
  if (m.ttfbMs > PERF_BUDGET.TTFB_MS) fails.push(`TTFB ${m.ttfbMs}ms > ${PERF_BUDGET.TTFB_MS}ms`);
  return fails;
}

if (require.main === module) {
  const sample = { lcpMs: 1500, cls: 0.02, inpMs: 80, ttfbMs: 400 };
  const fails = checkPerfBudget(sample);
  if (fails.length > 0) {
    console.error("PERF BUDGET FAILED:", fails.join("; "));
    process.exit(1);
  }
  console.log("PERF BUDGET OK");
}
