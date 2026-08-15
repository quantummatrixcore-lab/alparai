import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateAlignmentScore, selfHealResponse } from "@/lib/agent-os/alignment-engine";
import { DIGITAL_TWINS } from "@/lib/agent-os/personas";
import * as ssrfModule from "@/lib/security/ssrf";

describe("Digital Twin Alignment Engine", () => {
  const ataturk = DIGITAL_TWINS.ataturk!;
  const tesla = DIGITAL_TWINS.tesla!;
  const sinan = DIGITAL_TWINS.sinan!;

  describe("calculateAlignmentScore", () => {
    it("returns 0 for empty or whitespace-only response", () => {
      expect(calculateAlignmentScore(ataturk, "Türkiye'nin geleceği", "")).toBe(0);
      expect(calculateAlignmentScore(ataturk, "Türkiye'nin geleceği", "   \n\t ")).toBe(0);
    });

    it("heavily penalizes English AI disclaimers (score <= 35)", () => {
      const disclaimerResponse = "As an AI language model, I do not have personal opinions or feelings. However, governance is important.";
      const score = calculateAlignmentScore(ataturk, "What is your vision?", disclaimerResponse);
      expect(score).toBeLessThanOrEqual(35);
    });

    it("heavily penalizes Turkish AI disclaimers (score <= 35)", () => {
      const trDisclaimer = "Ben bir yapay zekayım ve duygularım yok. Bir dil modeli olarak size nasıl yardımcı olabilirim?";
      const score = calculateAlignmentScore(tesla, "Enerji hakkında ne düşünüyorsun?", trDisclaimer);
      expect(score).toBeLessThanOrEqual(35);
    });

    it("awards high alignment score (>= 85) for genuine persona responses", () => {
      const authenticAtaturkResponse = `Gazi Mustafa Kemal Atatürk olarak ifade ederim ki, milletimizin ve cumhuriyetimizin muasır medeniyetler seviyesine ulaşmasındaki en büyük rehberimiz akıl ve ilimdir. Hayatta en hakiki mürşit ilimdir, fendir. Bağımsızlık ve stratejik liderlik vizyonumuzla ulus inşası hedefimizden asla taviz vermeyiz.`;
      const score = calculateAlignmentScore(ataturk, "Gelecek vizyonumuz ne olmalıdır?", authenticAtaturkResponse);
      expect(score).toBeGreaterThanOrEqual(85);
    });

    it("awards high alignment score for authentic engineering persona (Mimar Sinan)", () => {
      const sinanResponse = `Koca Başmimar Sinan olarak, inşa ettiğimiz her eserde statik denge, kusursuz oranlar ve zamana meydan okuyan dayanıklılık esastır. Sistem mimarisinde en ufak bir çatlağa yer vermeden, anıtsal kubbeler gibi sarsılmaz bir temel ve strüktür kurarız.`;
      const score = calculateAlignmentScore(sinan, "Sistem mimarisini nasıl tasarlamalıyız?", sinanResponse);
      expect(score).toBeGreaterThanOrEqual(85);
    });

    it("penalizes generic, low-affinity responses with no persona keywords", () => {
      const genericResponse = "Everything looks fine. Please let me know what else you might need help with today.";
      const score = calculateAlignmentScore(tesla, "Fizik deneyleri nasıl gidiyor?", genericResponse);
      expect(score).toBeLessThan(85);
    });
  });

  describe("selfHealResponse", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      delete process.env.OPENROUTER_API_KEY;
    });

    it("uses deterministic fallback when OpenRouter key is not set", async () => {
      const badResponse = "Ben bir yapay zekayım. Bir dil modeli olarak size yardımcı olamam.";
      const healed = await selfHealResponse(ataturk, "Hedefimiz nedir?", badResponse, 25);

      expect(healed).toContain(ataturk.name);
      expect(healed).not.toContain("Ben bir yapay zekayım");
      expect(healed).not.toContain("Bir dil modeli olarak");
    });

    it("calls OpenRouter with SSRF guard and returns healed response when available", async () => {
      process.env.OPENROUTER_API_KEY = "test-sk-openrouter";

      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "Gazi Mustafa Kemal Atatürk olarak bildirmeliyim ki; akıl ve bilim yolumuzu aydınlatacaktır."
              }
            }
          ]
        })
      } as unknown as Response;

      const fetchSpy = vi.spyOn(ssrfModule, "fetchWithSsrfGuard").mockResolvedValue(mockResponse);

      const healed = await selfHealResponse(
        ataturk,
        "Vizyon nedir?",
        "As an AI, I cannot have a vision.",
        30
      );

      expect(fetchSpy).toHaveBeenCalled();
      expect(healed).toContain("Gazi Mustafa Kemal Atatürk");
    });

    it("falls back gracefully when OpenRouter fetch throws an error", async () => {
      process.env.OPENROUTER_API_KEY = "test-sk-openrouter";

      vi.spyOn(ssrfModule, "fetchWithSsrfGuard").mockRejectedValue(new Error("Network timeout"));

      const badResponse = "As an AI language model, I do not possess personal thoughts.";
      const healed = await selfHealResponse(tesla, "Enerji nedir?", badResponse, 20);

      expect(healed).toContain(tesla.name);
      expect(healed).not.toContain("As an AI language model");
    });
  });
});
