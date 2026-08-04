import { test, expect } from "@playwright/test";
import { setupAuthenticatedPage, mockSupabaseResponse } from "../helpers/auth";

const MOCK_USER = [
  {
    id: "u1",
    email: "user@test.com",
    full_name: "Test User",
    role: "user",
    is_verified: true,
    created_at: "2026-01-01",
  },
];

const MOCK_POLLS = [
  {
    id: "poll-1",
    title: "Should AI development be paused?",
    title_tr: "AI geliştirmesi durdurulmalı mı?",
    is_active: true,
    yes_count: 120,
    no_count: 80,
    unsure_count: 30,
    created_at: "2026-06-01T00:00:00Z",
  },
];

const MOCK_SUGGESTIONS = [
  {
    id: "sug-1",
    title: "Create a public registry",
    description: "A public registry of all AI incidents",
    title_tr: null,
    description_tr: null,
    category: "policy",
    status: "open",
    upvotes_count: 42,
    comments_count: 7,
    created_at: "2026-06-10T00:00:00Z",
    user_id: "u2",
  },
];

const MOCK_INCIDENTS = [
  {
    id: "inc-1",
    title_masked: "Incident with AI system",
    description_masked: "Description of the incident",
    title_tr: null,
    description_tr: null,
    severity: "high",
    status: "published",
    category: "safety",
    is_anonymous: true,
    incident_date: "2026-06-15",
    views_count: 150,
    upvotes_count: 25,
    created_at: "2026-06-15T10:00:00Z",
    published_at: "2026-06-15T12:00:00Z",
    ai_provider_id: "prov-1",
    user_id: "u2",
    cross_audit_truth_score: null,
    cross_audit_confidence: null,
    comments_count: 3,
    shares_count: 10,
    affected_users_count: 500,
  },
];

const MOCK_PROVIDERS = [
  {
    id: "prov-1",
    slug: "test-provider",
    name: "Test Provider",
    description: "A test AI provider",
    logo_url: null,
    website_url: "https://example.com",
    is_verified: true,
    trust_score: 72,
  },
];

const MOCK_NEWS = [
  {
    id: "news-1",
    title_en: "AI Regulation Update",
    title_tr: "AI Düzenleme Güncellemesi",
    source: "Tech News",
    severity: "info",
    published_at: "2026-07-01T08:00:00Z",
  },
];

test.beforeEach(async ({ page }) => {
  await setupAuthenticatedPage(page);
  await mockSupabaseResponse(page, "users*", MOCK_USER);
  await mockSupabaseResponse(page, "ai_polls*", MOCK_POLLS);
});

test.describe("Authenticated Pages — Rendering", () => {
  test("dilemmas page renders", async ({ page }) => {
    await mockSupabaseResponse(page, "suggestions*", MOCK_SUGGESTIONS);
    await page.goto("/en/dilemmas");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });

  test("feed page renders", async ({ page }) => {
    await mockSupabaseResponse(page, "incidents*", MOCK_INCIDENTS);
    await mockSupabaseResponse(page, "ai_providers*", MOCK_PROVIDERS);
    await mockSupabaseResponse(page, "ecosystem_news*", MOCK_NEWS);
    await page.goto("/en/feed");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });
});
