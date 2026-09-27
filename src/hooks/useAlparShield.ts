"use client";

import { useEffect, useRef, useCallback } from "react";
import { type KineticEvent, type ShieldVerificationResult } from "@/lib/security/alpar-shield";

export function useAlparShield() {
  const trajectoryRef = useRef<KineticEvent[]>([]);
  const lastClickDwellRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  // Stream mouse movement into trajectory buffer transparently
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      trajectoryRef.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
        isTrusted: e.isTrusted,
      });

      // Keep last 50 waypoints to optimize memory
      if (trajectoryRef.current.length > 50) {
        trajectoryRef.current.shift();
      }
    };

    const handleMouseDown = () => {
      lastClickDwellRef.current.start = Date.now();
    };

    const handleMouseUp = () => {
      lastClickDwellRef.current.end = Date.now();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  /**
   * Tıklama öncesi şeffaf doğrulama çağrısı
   */
  const verifyAction = useCallback(async (targetId?: string): Promise<ShieldVerificationResult> => {
    const dwellTimeMs = Math.max(
      0,
      lastClickDwellRef.current.end - lastClickDwellRef.current.start,
    );

    const payload = {
      trajectory: trajectoryRef.current,
      clickEvent: {
        targetId,
        isTrusted: true, // evaluated on server & client
        dwellTimeMs,
        cdpFlagDetected: Boolean((window as unknown as { cdpActive?: boolean }).cdpActive),
      },
    };

    try {
      const res = await fetch("/api/shield/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return await res.json();
    } catch {
      return {
        allowed: false,
        trustScore: 0,
        riskScore: 100,
        reason: "SHIELD_VERIFICATION_NETWORK_FAILURE",
        merkleProofHash: "",
        verifiedAt: new Date().toISOString(),
      };
    }
  }, []);

  const executeVerification = useCallback(
    async (options?: { buttonId?: string }): Promise<{ success: boolean; proofHash?: string; reason?: string }> => {
      const res = await verifyAction(options?.buttonId);
      return {
        success: res.allowed,
        proofHash: res.merkleProofHash,
        reason: res.reason,
      };
    },
    [verifyAction],
  );

  const recordClick = useCallback((targetId?: string | unknown) => {
    lastClickDwellRef.current.end = Date.now();
  }, []);

  return { verifyAction, executeVerification, recordClick, getTrajectory: () => trajectoryRef.current };
}
