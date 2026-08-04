/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import { test, expect } from "@playwright/test";

test.describe("SSE Status Tracking in Submit Flow", () => {
  test("should submit incident, show progress stages, and redirect to detail page", async ({
    page,
  }) => {
    // Log console and errors from browser
    page.on("console", (msg) => {
      console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
    });
    page.on("pageerror", (err) => {
      console.error(`[BROWSER ERROR] ${err.message}\nStack: ${err.stack}`);
    });
    page.on("request", (req) => {
      console.log(`[NETWORK REQ] ${req.method()} ${req.url()}`);
    });
    page.on("response", async (res) => {
      if (res.request().method() === "POST") {
        console.log(`[NETWORK RES] POST ${res.url()} status = ${res.status()}`);
        try {
          const text = await res.text();
          console.log(`[NETWORK RES BODY] ${text.slice(0, 1000)}`);
        } catch (e) {
          console.log(`[NETWORK RES BODY ERROR] Failed to read body: ${e}`);
        }
      }
    });
    page.on("requestfailed", (req) => {
      console.error(`[NETWORK FAIL] ${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
    });

    // 1. Mock EventSource and Server Action Fetch before page load
    await page.addInitScript(() => {
      // Mock EventSource
      class MockEventSource extends EventTarget {
        url: string;
        onmessage: ((ev: MessageEvent) => void) | null = null;
        onerror: (() => void) | null = null;

        constructor(url: string) {
          super();
          this.url = url;
          // Trigger stages sequentially after a short delay
          setTimeout(() => {
            this.emitStage("queued");
          }, 100);
          setTimeout(() => {
            this.emitStage("analyzing");
          }, 400);
          setTimeout(() => {
            this.emitStage("scoring");
          }, 700);
          setTimeout(() => {
            this.emitStage("complete");
          }, 1000);
        }

        emitStage(stage: string) {
          const event = new MessageEvent("message", {
            data: JSON.stringify({ stage }),
            origin: window.location.origin,
          });
          if (this.onmessage) this.onmessage(event);
          this.dispatchEvent(event);
        }

        close() {
          // Closed mock connection
        }
      }

      // Assign mock to window
      (window as any).EventSource = MockEventSource;
    });

    // 2. Set consent cookie to bypass onboarding banner if needed
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "alpar_cookie_consent",
        JSON.stringify({ level: "all", at: Date.now() }),
      );
    });

    // 3. Go to submit page
    await page.goto("/en/submit");

    // 4. Fill form fields to enable submit button
    await page.fill("input[name='title']", "Mock Incident Title for Testing SSE Flow");
    await page.fill(
      "textarea[name='description']",
      "This is a detailed description of the mocked AI incident with sufficient length for test.",
    );

    // Select provider via combobox (custom add to avoid db dependency)
    const providerBtn = page.locator("button[aria-haspopup='listbox']").first();
    await providerBtn.waitFor({ state: "visible", timeout: 5000 });
    await providerBtn.click();
    const providerInput = page.locator("input[placeholder*='Search']").first();
    await providerInput.waitFor({ state: "visible", timeout: 5000 });
    await providerInput.fill("OpenAI");
    await page.click("button:has-text('Add \"OpenAI\"')");

    // Select model via autocomplete combobox (custom add to avoid db dependency)
    const modelBtn = page.locator("button[aria-haspopup='listbox']").nth(1);
    await modelBtn.waitFor({ state: "visible", timeout: 5000 });
    await modelBtn.click();
    const modelInput = page.locator("input[placeholder*='Search']").first();
    await modelInput.waitFor({ state: "visible", timeout: 5000 });
    await modelInput.fill("GPT-4");
    await page.click("button:has-text('Add \"GPT-4\"')");

    // Select category (combobox/select)
    await page.selectOption("select[name='category']", "hallucination");

    // Set date-time local
    await page.fill("input[name='incident_date']", "2026-07-07T12:00");

    // Agree to all consents
    await page.check("input[name='consent_truth']");
    await page.check("input[name='consent_age']");
    await page.check("input[name='consent_terms']");

    // Print values and validity state
    const titleVal = await page.$eval(
      "input[name='title']",
      (el) => (el as HTMLInputElement).value,
    );
    const descVal = await page.$eval(
      "textarea[name='description']",
      (el) => (el as HTMLTextAreaElement).value,
    );
    const catVal = await page.$eval(
      "select[name='category']",
      (el) => (el as HTMLSelectElement).value,
    );
    const dateVal = await page.$eval(
      "input[name='incident_date']",
      (el) => (el as HTMLInputElement).value,
    );
    const truthChecked = await page.$eval(
      "input[name='consent_truth']",
      (el) => (el as HTMLInputElement).checked,
    );
    const ageChecked = await page.$eval(
      "input[name='consent_age']",
      (el) => (el as HTMLInputElement).checked,
    );
    const termsChecked = await page.$eval(
      "input[name='consent_terms']",
      (el) => (el as HTMLInputElement).checked,
    );
    const providerVal = await page.$eval(
      "input[name='provider_id']",
      (el) => (el as HTMLInputElement).value,
    );
    const modelVal = await page.$eval(
      "input[name='model_id']",
      (el) => (el as HTMLInputElement).value,
    );

    console.log("TEST DIAGNOSTICS - BEFORE SUBMIT:");
    console.log("  title =", titleVal);
    console.log("  description =", descVal);
    console.log("  category =", catVal);
    console.log("  incident_date =", dateVal);
    console.log("  consent_truth checked =", truthChecked);
    console.log("  consent_age checked =", ageChecked);
    console.log("  consent_terms checked =", termsChecked);
    console.log("  provider_id =", providerVal);
    console.log("  model_id =", modelVal);

    // 5. Submit the form
    const submitBtn = page.getByRole("button", { name: /Submit report|Raporu gönder/i });
    await expect(submitBtn).toBeEnabled();
    const submitDisabledProp = await submitBtn.getAttribute("disabled");
    const submitTypeProp = await submitBtn.getAttribute("type");
    console.log("  submit button disabled attribute =", submitDisabledProp);
    console.log("  submit button type attribute =", submitTypeProp);

    // Call requestSubmit on the form to guarantee triggering React 19's form action
    await page.locator("form").evaluate((form) => {
      (form as HTMLFormElement).requestSubmit();
    });

    // 6. Assert real-time progress card stages appear
    await expect(page.getByText(/Analyzing Your Report|Raporunuz Analiz Ediliyor/i)).toBeVisible({
      timeout: 5000,
    });

    // Check that we see the stages appearing sequentially
    await expect(page.getByText(/Report queued|Rapor sıraya alındı/i)).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText(/Checking safety|Güvenlik, uyumluluk/i)).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText(/Analyzing impact|Yapay zeka etki/i)).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText(/Analysis complete|Analiz tamamlandı/i)).toBeVisible({
      timeout: 5000,
    });

    // 7. Verify redirection to mock incident detail page
    await page.waitForURL(/\/incidents\/mock-incident-123/, { timeout: 5000 });
    expect(page.url()).toContain("/incidents/mock-incident-123");
  });
});
