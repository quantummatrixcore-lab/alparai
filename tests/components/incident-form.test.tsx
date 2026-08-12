// @vitest-environment jsdom
import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { expect, test, describe, vi, beforeEach } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key;
    t.rich = (key: string) => key;
    return t;
  },
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

vi.mock("@/actions/incidents", () => ({
  submitIncident: vi.fn(),
}));

vi.mock("@/hooks/use-form-autosave", () => ({
  useFormAutosave: vi.fn(),
  clearDraft: vi.fn(),
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/utils/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("@/lib/utils/fingerprint", () => ({ getFingerprint: () => Promise.resolve("test-fp") }));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
    isLoading,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
    isLoading?: boolean;
  }) => (
    <button type={type ?? "button"} onClick={onClick} disabled={disabled}>
      {isLoading ? "Loading..." : null}
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/provider-combobox", () => ({
  ProviderCombobox: () => <div data-testid="provider-combobox" />,
}));

vi.mock("@/components/ui/model-autocomplete", () => ({
  ModelAutocomplete: () => <div data-testid="model-autocomplete" />,
}));

vi.mock("./evidence-uploader", () => ({
  EvidenceUploader: () => <div data-testid="evidence-uploader" />,
  SubmitButton: ({ disabled, children }: { disabled?: boolean; children?: React.ReactNode }) => (
    <button type="submit" disabled={disabled}>
      {children}
    </button>
  ),
}));

describe("IncidentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders provider combobox and model autocomplete", async () => {
    const { IncidentForm } = await import("@/components/incidents/incident-form");
    await act(async () => {
      render(<IncidentForm providers={[]} models={[]} />);
    });
    expect(screen.getByTestId("provider-combobox")).toBeDefined();
    expect(screen.getByTestId("model-autocomplete")).toBeDefined();
  });

  test("renders title and description fields", async () => {
    const { IncidentForm } = await import("@/components/incidents/incident-form");
    await act(async () => {
      render(<IncidentForm providers={[]} models={[]} />);
    });
    expect(screen.getByPlaceholderText("https://chatgpt.com/share/...")).toBeDefined();
  });

  test("import URL validation rejects invalid domains", async () => {
    const { IncidentForm } = await import("@/components/incidents/incident-form");
    await act(async () => {
      render(<IncidentForm providers={[]} models={[]} />);
    });
    const importInput = screen.getByPlaceholderText("https://chatgpt.com/share/...");
    await act(async () => {
      fireEvent.change(importInput, {
        target: { value: "https://example.com/share/123" },
      });
      fireEvent.click(screen.getByText("Import"));
    });
    expect(
      await screen.findByText("Only ChatGPT, Claude, Grok, and Gemini share links are supported."),
    ).toBeDefined();
  });

  test("import URL validation accepts known domain", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ title: "Test", description: "Desc" }), { status: 200 }),
      );
    const { IncidentForm } = await import("@/components/incidents/incident-form");
    await act(async () => {
      render(<IncidentForm providers={[]} models={[]} />);
    });
    const importInput = screen.getByPlaceholderText("https://chatgpt.com/share/...");
    await act(async () => {
      fireEvent.change(importInput, {
        target: { value: "https://chatgpt.com/share/abc" },
      });
      fireEvent.click(screen.getByText("Import"));
    });
    await vi.waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/v1/extract", expect.any(Object)),
    );
  });

  test("renders privacy banner", async () => {
    const { IncidentForm } = await import("@/components/incidents/incident-form");
    await act(async () => {
      render(<IncidentForm providers={[]} models={[]} />);
    });
    expect(screen.getByText("🔒 KVKK/GDPR SAFE")).toBeDefined();
  });
});
