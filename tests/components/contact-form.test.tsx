// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, test, describe, vi } from "vitest";
import { useActionState } from "react";
import { ContactForm } from "@/components/marketing/contact-form";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import * as React from "react";
// Mock react useActionState
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof React>("react");
  return {
    ...actual,
    useActionState: vi.fn((fn, initial) => [initial, fn, false]),
  };
});

// Mock react-dom useFormStatus
vi.mock("react-dom", () => ({
  useFormStatus: vi.fn(() => ({ pending: false })),
}));

// Mock submitContact action
vi.mock("@/actions/contact", () => ({
  submitContact: vi.fn(),
}));

describe("ContactForm Component", () => {
  test("renders form inputs correctly", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText("name", { exact: false })).toBeDefined();
    expect(screen.getByLabelText("email", { exact: false })).toBeDefined();
    expect(screen.getByLabelText("category", { exact: false })).toBeDefined();
    expect(screen.getByLabelText("subject", { exact: false })).toBeDefined();
    expect(screen.getByLabelText("message", { exact: false })).toBeDefined();
    expect(screen.getByRole("button", { name: "form.submit" })).toBeDefined();
  });

  test("renders success state card when state.ok is true", () => {
    vi.mocked(useActionState).mockImplementationOnce(() => [{ ok: true }, vi.fn(), false]);

    render(<ContactForm />);
    expect(screen.getByText("form.sent_title")).toBeDefined();
    expect(screen.getByText("form.sent_desc")).toBeDefined();
    expect(screen.queryByLabelText("name")).toBeNull();
  });

  test("renders formError alert when state.formError is present", () => {
    vi.mocked(useActionState).mockImplementationOnce(() => [
      { ok: false, formError: "Invalid submission" },
      vi.fn(),
      false,
    ]);

    render(<ContactForm />);
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Invalid submission")).toBeDefined();
  });

  test("renders fieldErrors under respective inputs", () => {
    vi.mocked(useActionState).mockImplementationOnce(() => [
      {
        ok: false,
        fieldErrors: {
          name: ["Name is too short"],
          email: ["Email is invalid"],
        },
      },
      vi.fn(),
      false,
    ]);

    render(<ContactForm />);
    expect(screen.getByText("Name is too short")).toBeDefined();
    expect(screen.getByText("Email is invalid")).toBeDefined();
  });
});
