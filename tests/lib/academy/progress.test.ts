import { describe, expect, it } from "vitest";
import {
  gradeQuiz,
  gradeQuizLocalized,
  isValidCertCode,
  isValidCouponCode,
  makeCertCode,
  makeCouponCode,
} from "@/lib/academy/progress";

describe("academy progress", () => {
  it("grades all-correct as 100 and passes", () => {
    expect(gradeQuiz("guvenli-yapay-zeka", [2, 1, 2])).toEqual({ score: 100, passed: true });
  });
  it("fails below 70", () => {
    expect(gradeQuiz("guvenli-yapay-zeka", [0, 0, 2]).passed).toBe(false);
  });
  it("rejects wrong answer counts and unknown slugs", () => {
    expect(gradeQuiz("guvenli-yapay-zeka", [2, 1]).passed).toBe(false);
    expect(gradeQuiz("yok-boyle-ders", [0]).passed).toBe(false);
  });
  it("grades EN quiz independently", () => {
    expect(gradeQuizLocalized("guvenli-yapay-zeka", "en", [2, 1, 2])).toEqual({
      score: 100,
      passed: true,
    });
  });
  it("mints valid unique cert codes", () => {
    const a = makeCertCode();
    const b = makeCertCode();
    expect(isValidCertCode(a)).toBe(true);
    expect(a).not.toBe(b);
    expect(isValidCertCode("DIPLOMA-123")).toBe(false);
  });
  it("mints valid unique coupon codes", () => {
    const a = makeCouponCode();
    expect(isValidCouponCode(a)).toBe(true);
    expect(isValidCouponCode("INDIRIM-50")).toBe(false);
  });
});
