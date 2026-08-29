export interface SocialPost {
  id: string;
  platform: "linkedin" | "x" | "instagram" | "facebook" | "whatsapp";
  status: "draft" | "scheduled" | "published" | "archived";
  content_type:
    "manifesto" | "case_study" | "weekly_report" | "incident_spotlight" | "thread" | "poll";
  title: string;
  body_text: string;
  image_prompt: string | null;
  image_url: string | null;
  video_url: string | null;
  hashtags: string[];
  linked_incident_id: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  external_url: string | null;
  estimated_reach: number;
  likes: number;
  comments_count: number;
  shares_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: string;
  platform: string;
  account_name: string | null;
  connection_status: string;
  created_at: string;
}

export interface SocialTemplate {
  id: string;
  name: string;
  platform: "linkedin" | "x" | "instagram" | "all";
  content_type:
    "manifesto" | "case_study" | "weekly_report" | "incident_spotlight" | "thread" | "poll";
  template_body: string;
  example_output: string | null;
  psychology_hook:
    "fear" | "authority" | "social_proof" | "urgency" | "scarcity" | "reciprocity" | "unity";
  created_at: string;
}

export interface SocialAsset {
  id: string;
  asset_type: "image" | "video" | "carousel" | "reel" | "story";
  title: string;
  file_url: string;
  thumbnail_url: string | null;
  linked_post_id: string | null;
  tags: string[];
  created_at: string;
}

export interface MarketingDraft {
  id: string;
  platform: string;
  content: string;
  media_url: string | null;
  status: "draft" | "pending_approval" | "published" | "rejected";
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
}
