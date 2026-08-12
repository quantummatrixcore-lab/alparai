"use server";

import { requireAdmin } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { VertexImagenAdapter } from "@/lib/ai/adapters/vertex-imagen";
import { revalidatePath } from "next/cache";

export async function generateSocialImageAction(
  postId: string,
  prompt: string,
  aspectRatio = "1:1",
): Promise<{ ok: true; imageUrl: string } | { ok: false; error: string }> {
  try {
    // 1. Require admin auth
    await requireAdmin();

    if (!postId || !prompt) {
      return { ok: false, error: "Post ID and Prompt are required." };
    }

    // 2. Generate image using VertexImagenAdapter
    const adapter = new VertexImagenAdapter();
    const res = await adapter.generateImage(prompt, aspectRatio);
    if (!res.ok) {
      return { ok: false, error: res.error };
    }

    const { base64, mimeType } = res;
    const buffer = Buffer.from(base64, "base64");

    const supabase = await createServerClient();
    const fileExt = mimeType === "image/png" ? "png" : "jpg";
    const fileName = `${postId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("social-assets")
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      return { ok: false, error: `Storage upload failed: ${uploadError.message}` };
    }

    // 4. Get Public URL
    const { data } = supabase.storage.from("social-assets").getPublicUrl(fileName);

    const publicUrl = data?.publicUrl;
    if (!publicUrl) {
      return { ok: false, error: "Failed to retrieve public URL for uploaded asset." };
    }

    // 5. Update DB (social_posts table: image_url and image_prompt)
    const { error: dbError } = await supabase
      .from("social_posts")
      .update({
        image_url: publicUrl,
        image_prompt: prompt,
      })
      .eq("id", postId);

    if (dbError) {
      return { ok: false, error: `Database update failed: ${dbError.message}` };
    }

    revalidatePath("/admin/social", "page");

    return { ok: true, imageUrl: publicUrl };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}
