import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/dehost/admin";
import { z } from "zod";

const webhookSchema = z.object({
  url: z.string().url(),
  secret: z.string().min(8),
  provider_filter: z.string().optional(),
});

// @auth: requireAuth (verifyWebhook / WEBHOOK_SECRET)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = webhookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { url, secret, provider_filter } = parsed.data;

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const expectedToken = process.env.WEBHOOK_SECRET || process.env.API_SECRET_KEY;
    if (!token || !expectedToken || token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dehost = createAdminClient();

    const { data, error } = await dehost
      .from("webhooks")
      .insert({ url, secret, provider_filter })
      .select("id, url, provider_filter, created_at")
      .single();

    if (error) {
      console.error("[WEBHOOK_INSERT_ERROR]", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[WEBHOOK_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
