import type { Page } from "@playwright/test";

export async function setupAuthenticatedPage(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({ level: "all", at: Date.now() }),
    );
  });
}

export async function mockSupabaseResponse(page: Page, path: string, responseBody: unknown) {
  await page.route(`**/mock-supabase.supabase.co/rest/v1/${path}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(responseBody),
    });
  });
}
