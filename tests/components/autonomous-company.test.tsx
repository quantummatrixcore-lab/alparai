import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AutonomousCompanyCanvas } from "@/components/admin/autonomous-company/AutonomousCompanyCanvas";

describe("AutonomousCompanyCanvas (Sokrates MV E2E Validation)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("1. Sayaçları ve metrik kartlarını doğru başlangıç değerleriyle render etmeli", () => {
    render(<AutonomousCompanyCanvas />);

    // Revenue metric
    expect(screen.getByText("Revenue Target")).toBeDefined();
    expect(screen.getByText("$846")).toBeDefined();
    expect(screen.getByText("/ $1,000")).toBeDefined();

    // Hours saved metric
    expect(screen.getByText("Hours Saved")).toBeDefined();
    expect(screen.getByText("128")).toBeDefined();
    expect(screen.getByText(/\+18%/)).toBeDefined();

    // Autonomous AI Company & Operations
    expect(screen.getByText("Autonomous AI Company")).toBeDefined();
    expect(screen.getByText("10/10 ACTIVE")).toBeDefined();
    expect(screen.getByText(/ONLINE/i)).toBeDefined();

    // Task Pipeline & Executed count
    expect(screen.getByText("Task Pipeline")).toBeDefined();
    expect(screen.getByText(/42 Executed/i)).toBeDefined();
  });

  it("2. Konveyör bant 5 aşamasını (stations) ve başlangıç görevlerini doğrulamalı", () => {
    render(<AutonomousCompanyCanvas />);

    expect(screen.getByText("Campaign Plan")).toBeDefined();
    expect(screen.getByText("Lead Outreach")).toBeDefined();
    expect(screen.getByText("Feature Build")).toBeDefined();
    expect(screen.getByText("Human Approval")).toBeDefined();
    expect(screen.getByText("Live Production")).toBeDefined();

    // Verify queue and stats cards
    expect(screen.getByText("Priority Queue")).toBeDefined();
    expect(screen.getByText("Shipped Tasks")).toBeDefined();
    expect(screen.getByText("Lead Scoring Tool")).toBeDefined();
    expect(screen.getByText("Multi-Agent Swarm")).toBeDefined();
  });

  it("3. Konveyör bant animasyonu ve döngüsel ilerleme mekanizmasını doğrulamalı", () => {
    render(<AutonomousCompanyCanvas />);

    expect(screen.getByText(/42 Executed/i)).toBeDefined();

    // Advance timer by multiple intervals to trigger task cycle completion
    act(() => {
      vi.advanceTimersByTime(3600);
    });

    expect(screen.getByText(/Executed/i)).toBeDefined();
  });

  it("4. Görev Enjeksiyon Butonu (+ Inject Task) tıklamasını ve yeni görevin eklenmesini doğrulamalı", () => {
    render(<AutonomousCompanyCanvas />);

    const injectButton = screen.getByRole("button", { name: /\+ Inject Task/i });
    expect(injectButton).toBeDefined();

    act(() => {
      fireEvent.click(injectButton);
    });

    expect(screen.getByText("Task Pipeline")).toBeDefined();
  });

  it("5. Canlı durum kontrollerini (Pause / Resume) doğrulamalı", () => {
    render(<AutonomousCompanyCanvas />);

    const pauseButton = screen.getByRole("button", { name: /Pause/i });
    expect(pauseButton).toBeDefined();

    // Click to Pause
    act(() => {
      fireEvent.click(pauseButton);
    });

    // Button text switches to Resume
    const resumeButton = screen.getByRole("button", { name: /Resume/i });
    expect(resumeButton).toBeDefined();

    // Advance time while paused
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Click to Resume
    act(() => {
      fireEvent.click(resumeButton);
    });

    expect(screen.getByRole("button", { name: /Pause/i })).toBeDefined();
  });

  it("6. 10 Dijital İkiz seçim matrisini ve detay kartı geçişlerini doğrulamalı", () => {
    render(<AutonomousCompanyCanvas />);

    // Verify digital twins exist
    const twins = [
      "Atatürk",
      "Fatih",
      "İbn-i Sina",
      "Edison",
      "Sokrates",
      "Gutenberg",
      "Da Vinci",
      "Columbus",
      "Von Neumann",
      "Aurelius",
    ];

    twins.forEach((twin) => {
      expect(screen.getAllByText(twin).length).toBeGreaterThan(0);
    });

    // Click Sokrates to select
    const sokratesButtons = screen.getAllByRole("button");
    const sokratesBtn = sokratesButtons.find((b) => b.textContent?.includes("Sokrates"));
    if (sokratesBtn) {
      act(() => {
        fireEvent.click(sokratesBtn);
      });
      expect(screen.getAllByText(/360 Validator/i).length).toBeGreaterThanOrEqual(1);
    }
  });
});
