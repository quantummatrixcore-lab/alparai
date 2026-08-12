"use server";

import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import type {
  SocialPost,
  SocialTemplate,
  SocialAsset,
  SocialAccount,
} from "@/components/admin/social-dashboard-client";

export async function getSocialPosts(): Promise<SocialPost[]> {
  await requireAdmin();
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as SocialPost[];
}

export async function getSocialTemplates(): Promise<SocialTemplate[]> {
  await requireAdmin();
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("social_templates").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data || []) as SocialTemplate[];
}

export async function getSocialAssets(): Promise<SocialAsset[]> {
  await requireAdmin();
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("social_assets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as SocialAsset[];
}

export async function createSocialPost(post: {
  platform: "linkedin" | "x" | "instagram" | "facebook" | "whatsapp";
  status: "draft" | "scheduled" | "published" | "archived";
  content_type:
    "manifesto" | "case_study" | "weekly_report" | "incident_spotlight" | "thread" | "poll";
  title: string;
  body_text: string;
  image_prompt?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  hashtags?: string[];
  linked_incident_id?: string | null;
  scheduled_at?: string | null;
  published_at?: string | null;
  external_url?: string | null;
  estimated_reach?: number;
  likes?: number;
  comments_count?: number;
  shares_count?: number;
}) {
  const user = await requireAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase.from("social_posts").insert({
    ...post,
    created_by: user.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/social", "page");
  return { success: true };
}

export async function updateSocialPost(
  id: string,
  updates: {
    platform?: "linkedin" | "x" | "instagram" | "facebook" | "whatsapp";
    status?: "draft" | "scheduled" | "published" | "archived";
    content_type?:
      "manifesto" | "case_study" | "weekly_report" | "incident_spotlight" | "thread" | "poll";
    title?: string;
    body_text?: string;
    image_prompt?: string | null;
    image_url?: string | null;
    video_url?: string | null;
    hashtags?: string[];
    linked_incident_id?: string | null;
    scheduled_at?: string | null;
    published_at?: string | null;
    external_url?: string | null;
    estimated_reach?: number;
    likes?: number;
    comments_count?: number;
    shares_count?: number;
  },
) {
  await requireAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("social_posts")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  // If status is updated to published, check auto-post connectors
  if (updates.status === "published") {
    const { data: post, error: fetchErr } = await supabase
      .from("social_posts")
      .select("platform, body_text, title")
      .eq("id", id)
      .single();

    if (!fetchErr && post) {
      if (post.platform === "x" && process.env.MARKETING_AUTOPOST_X === "true") {
        const { publishToX } = await import("@/lib/marketing/publishers/x");
        const res = await publishToX(post.body_text);
        if (res.success && res.postId) {
          await supabase
            .from("social_posts")
            .update({ external_url: `https://x.com/status/${res.postId}` })
            .eq("id", id);
        }
      } else if (
        post.platform === "linkedin" &&
        process.env.MARKETING_AUTOPOST_LINKEDIN === "true"
      ) {
        const { publishToLinkedIn } = await import("@/lib/marketing/publishers/linkedin");
        const res = await publishToLinkedIn(post.body_text, post.title);
        if (res.success && res.shareId) {
          await supabase
            .from("social_posts")
            .update({ external_url: `https://linkedin.com/feed/update/${res.shareId}` })
            .eq("id", id);
        }
      }
    }
  }

  revalidatePath("/admin/social", "page");
  return { success: true };
}

export async function getSocialAccounts(): Promise<SocialAccount[]> {
  await requireAdmin();
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("social_accounts" as never)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as unknown as SocialAccount[];
}

export async function getMarketingDrafts(): Promise<unknown[]> {
  await requireAdmin();
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("marketing_drafts" as never)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function publishDraftToLinkedInAction(
  draftId: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAdmin();
  if (!user) throw new Error("Unauthorized");

  if (process.env.DISABLE_LINKEDIN_POSTING === "true") {
    throw new Error("LinkedIn publishing is disabled.");
  }

  const supabase = await createServerClient();

  const { data: draft, error: fetchError } = await supabase
    .from("marketing_drafts" as never)
    .select("*")
    .eq("id", draftId)
    .single();

  if (fetchError || !draft) {
    throw new Error("Draft not found.");
  }

  const typedDraft = draft as Record<string, unknown>;
  if (typedDraft["status"] !== "pending_approval") {
    throw new Error("Draft is not pending approval.");
  }

  const { publishToLinkedIn } = await import("@/lib/marketing/publishers/linkedin");
  const res = await publishToLinkedIn(String(typedDraft["content"] || ""), "ALPAR AI Update");

  if (!res.success) {
    throw new Error(res.error || "LinkedIn publishing failed.");
  }

  // Update draft status
  await supabase
    .from("marketing_drafts" as never)
    .update({ status: "published", updated_at: new Date().toISOString() } as never)
    .eq("id", draftId);

  // Write audit log
  await supabase.from("audit_log").insert({
    actor_id: user.id,
    action: "social.publish_linkedin",
    entity_type: "marketing_draft",
    entity_id: draftId,
    before_data: { status: "pending_approval" },
    after_data: { status: "published", share_id: res.shareId },
  });

  revalidatePath("/admin/social", "page");
  return { success: true };
}
