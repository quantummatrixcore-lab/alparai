"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { triggerOrchestratorAction } from "@/actions/admin/orchestrator";
import { Button } from "@/components/ui/button";

export function OrchestratorTriggerButton() {
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    setLoading(true);
    try {
      await triggerOrchestratorAction();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTrigger}
      disabled={loading}
      className="bg-emerald-600 text-white hover:bg-emerald-700"
    >
      <Play className="mr-2 h-4 w-4" />
      {loading ? "Çalışıyor..." : "Otonom Sistemi Başlat"}
    </Button>
  );
}
