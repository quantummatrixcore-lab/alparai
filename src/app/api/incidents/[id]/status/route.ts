import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await createClient();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (stage: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ stage })}\n\n`));
        } catch {
          // Stream may already be closed by client disconnect
        }
      };

      let lastStage = "";
      const maxTime = 90 * 1000; // 90 seconds timeout
      const startTime = Date.now();
      const interval = 1000; // 1 second poll interval

      while (Date.now() - startTime < maxTime) {
        const { data, error } = await admin
          .from("incidents")
          .select("processing_stage")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          sendEvent("failed");
          break;
        }

        if (!data) {
          sendEvent("not_found");
          break;
        }

        const currentStage = (data as { processing_stage?: string }).processing_stage || "queued";

        if (currentStage !== lastStage) {
          sendEvent(currentStage);
          lastStage = currentStage;
        }

        if (currentStage === "complete") {
          break;
        }

        // Sleep for 1 second
        await new Promise((resolve) => setTimeout(resolve, interval));
      }

      try {
        controller.close();
      } catch {
        // Stream may already be closed
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
