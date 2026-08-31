import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CognitiveDNA } from "../../src/components/admin/widgets/CognitiveDNA";

describe("CognitiveDNA Widget", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the widget correctly", () => {
    render(<CognitiveDNA />);
    expect(screen.getByText("Cognitive DNA")).toBeDefined();
    expect(screen.getByText("Gen-UI")).toBeDefined();
    expect(screen.getByPlaceholderText(/Show me the churn rate/i)).toBeDefined();
    expect(screen.getByText("Waiting for intent...")).toBeDefined();
  });

  it("simulates generative UI creation", () => {
    render(<CognitiveDNA />);
    const input = screen.getByPlaceholderText(/Show me the churn rate/i) as HTMLInputElement;
    const button = screen.getByRole("button", { name: /Generate/i });

    // Type query
    fireEvent.change(input, { target: { value: "Test metrics" } });
    expect(input.value).toBe("Test metrics");

    // Click generate
    fireEvent.click(button);
    expect(screen.getByText("Synthesizing UI...")).toBeDefined();

    // Fast-forward simulation timer (1500ms)
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Check if widget was generated
    expect(screen.queryByText("Synthesizing UI...")).toBeNull();
    expect(screen.getByText("Generated: Test metrics")).toBeDefined();
    expect(screen.getByText(/Dynamic visual data for "Test metrics"/i)).toBeDefined();
  });
});
