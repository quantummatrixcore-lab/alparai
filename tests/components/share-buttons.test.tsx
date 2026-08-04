// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, describe, beforeEach, vi } from "vitest";
import { ShareButtons } from "@/components/incidents/share-buttons";
import { toast } from "sonner";

const mockLoggerError = vi.hoisted(() => vi.fn());

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: mockLoggerError,
  },
}));

describe("ShareButtons Component", () => {
  const defaultProps = {
    url: "/incidents/incident-123",
    title: "Test Incident Title",
  };

  const writeTextMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup clipboard mock
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });
  });

  test("renders social sharing buttons and links", () => {
    render(<ShareButtons {...defaultProps} />);
    expect(screen.getByText("share")).toBeDefined();

    const xLink = screen.getByLabelText("share_x");
    const liLink = screen.getByLabelText("share_linkedin");
    expect(xLink.getAttribute("href")).toContain("twitter.com/intent/tweet");
    expect(xLink.getAttribute("href")).toContain(encodeURIComponent("Test Incident Title"));
    expect(liLink.getAttribute("href")).toContain("linkedin.com/sharing/share-offsite");
  });

  test("calls navigator.clipboard.writeText on copy button click", async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    render(<ShareButtons {...defaultProps} />);

    const copyBtn = screen.getByLabelText("share_copy");
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining("/incidents/incident-123"));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("share_copy"));
    });
  });

  test("logs error and triggers error toast when clipboard copy fails", async () => {
    const copyError = new Error("Clipboard permission denied");
    writeTextMock.mockRejectedValueOnce(copyError);

    render(<ShareButtons {...defaultProps} />);

    const copyBtn = screen.getByLabelText("share_copy");
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(mockLoggerError).toHaveBeenCalledWith("Clipboard copy failed", undefined, copyError);
      expect(toast.error).toHaveBeenCalledWith("Copy failed");
    });
  });
});
