import "server-only";
import { randomBytes } from "node:crypto";
import { COUPON_PERCENT, PASS_SCORE, getLesson } from "./lessons";

// Saf sınav ve belge mantığı (test edilir).

export function gradeQuiz(slug: string, answers: number[]): { score: number; passed: boolean } {
  const lesson = getLesson(slug);
  if (!lesson) return { score: 0, passed: false };
  const total = lesson.tr.quiz.length;
  if (total === 0 || answers.length !== total) return { score: 0, passed: false };
  let correct = 0;
  lesson.tr.quiz.forEach((q, i) => {
    if (answers[i] === q.answer) correct += 1;
  });
  const score = Math.round((correct / total) * 100);
  return { score, passed: score >= PASS_SCORE };
}

// Belge kodu her iki dilde de doğrulanır (sorular dil-bağımsız indekslenir).
export function gradeQuizLocalized(
  slug: string,
  locale: "tr" | "en",
  answers: number[],
): { score: number; passed: boolean } {
  const lesson = getLesson(slug);
  if (!lesson) return { score: 0, passed: false };
  const quiz = locale === "en" ? lesson.en.quiz : lesson.tr.quiz;
  if (quiz.length === 0 || answers.length !== quiz.length) return { score: 0, passed: false };
  let correct = 0;
  quiz.forEach((q, i) => {
    if (answers[i] === q.answer) correct += 1;
  });
  const score = Math.round((correct / quiz.length) * 100);
  return { score, passed: score >= PASS_SCORE };
}

// EYK-2026-XXXXXX — Etik Kullanıcı Katılım Belgesi. Diploma DEĞİLDİR.
export function makeCertCode(): string {
  const year = new Date().getFullYear();
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `EYK-${year}-${rand}`;
}

export function isValidCertCode(code: string): boolean {
  return /^EYK-\d{4}-[0-9A-F]{6}$/.test((code || "").trim().toUpperCase());
}

// ALPAR-XXXXXX — tek kullanımlık %15 kupon kodu.
export function makeCouponCode(): string {
  return `ALPAR-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function isValidCouponCode(code: string): boolean {
  return /^ALPAR-[0-9A-F]{6}$/.test((code || "").trim().toUpperCase());
}

export { COUPON_PERCENT, PASS_SCORE };
