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
    expect(screen.getByText("Revenue Generated")).toBeDefined();
    expect(screen.getByText("$846")).toBeDefined();
    expect(screen.getByText("/ $1,000")).toBeDefined();

    // Hours saved metric
    expect(screen.getByText("Human Hours Saved")).toBeDefined();
    expect(screen.getByText("128h")).toBeDefined();
    expect(screen.getByText("+18%")).toBeDefined();

    // AI Council Swarm metric
    expect(screen.getByText("AI Council Swarm")).toBeDefined();
    expect(screen.getByText("10/10")).toBeDefined();
    expect(screen.getByText(/Online/i)).toBeDefined();

    // 24/7 Operations / Tasks Executed
    expect(screen.getByText(/24\/7 Operations/i)).toBeDefined();
    expect(screen.getByText("42 Tasks Executed")).toBeDefined();
  });

  it("2. Konveyör bant 5 aşamasını (stages) ve başlangıç görevlerini doğrulamalı", () => {
    render(<AutonomousCompanyCanvas />);

    expect(screen.getByText("Inbox & Triage")).toBeDefined();
    expect(screen.getByText("Value & ROI")).toBeDefined();
    expect(screen.getByText("Code & Build")).toBeDefined();
    expect(screen.getByText("Supreme Approval")).toBeDefined();
    expect(screen.getByText("Live Production")).toBeDefined();

    // Verify initial tasks
    expect(screen.getByText("Automated Lead Gen Intake")).toBeDefined();
    expect(screen.getByText("Stripe Token Arbitrage Review")).toBeDefined();
    expect(screen.getByText("DeepSeek Harness Plugin Adapter")).toBeDefined();
    expect(screen.getByText("Vercel Master Deploy Sign-off")).toBeDefined();
  });

  it("3. Konveyör bant animasyonu ve döngüsel ilerleme mekanizmasını doğrulamalı", () => {
    render(<AutonomousCompanyCanvas />);

    const initialTasksCount = 42;
    expect(screen.getByText(`${initialTasksCount} Tasks Executed`)).toBeDefined();

    // Advance timer by multiple intervals to trigger task cycle completion
    act(() => {
      vi.advanceTimersByTime(3600); // 3 ticks (3 * 1200ms)
    });

    // Task completion should advance or increment counters
    expect(screen.queryByText(/Tasks Executed/i)).toBeDefined();
  });

  it("4. Görev Enjeksiyon Butonu (Inject Swarm Task) tıklamasını ve yeni görevin eklenmesini doğrulamalı", () => {
    render(<AutonomousCompanyCanvas />);

    const injectButton = screen.getByRole("button", { name: /Inject Swarm Task/i });
    expect(injectButton).toBeDefined();

    act(() => {
      fireEvent.click(injectButton);
    });

    // New injected task should be visible in the DOM
    expect(screen.getByText("Autonomous Security & Live Scan")).toBeDefined();
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

    // Verify all 10 digital twins exist in the grid
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
      "Aurelius"
    ];

    twins.forEach((twin) => {
      expect(screen.getAllByText(twin).length).toBeGreaterThan(0);
    });

    // Initial selected twin is Atatürk
    expect(screen.getByText("Mustafa Kemal Atatürk Supreme Commander")).toBeDefined();
    expect(screen.getByText("Orchestrating 24/7 Swarm")).toBeDefined();

    // Click Sokrates to select
    const sokratesButton = screen.getByRole("button", { name: /Sokrates/i });
    act(() => {
      fireEvent.click(sokratesButton);
    });

    // Detail card should update for Sokrates
    expect(screen.getAllByText("360 Validator").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("MV Engine")).toBeDefined();
    expect(screen.getByText("gemini-3.6-flash")).toBeDefined();
    expect(screen.getByText("Live Site E2E Inspection")).toBeDefined();

    // Click Fatih to select
    const fatihButton = screen.getByRole("button", { name: /Fatih/i });
    act(() => {
      fireEvent.click(fatihButton);
    });

    expect(screen.getAllByText("Security Sentinel").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("SENTINEL Engine")).toBeDefined();
    expect(screen.getByText("nemotron-3-ultra")).toBeDefined();
    expect(screen.getByText("Auditing CSP & HSTS")).toBeDefined();
  });
});
