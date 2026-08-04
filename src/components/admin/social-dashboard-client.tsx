"use client";

import * as React from "react";
import { useState, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { EmptyStateIllustration } from "./admin-design-kit";
import {
  Calendar,
  FileText,
  Sparkles,
  BarChart3,
  Plus,
  Edit3,
  Copy,
  ExternalLink,
  Check,
  AlertCircle,
  Linkedin,
  Twitter,
  Instagram,
  Send,
  RefreshCw,
  X,
  Brain,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createSocialPost, updateSocialPost, publishDraftToLinkedInAction } from "@/actions/social";
import { fetchContentFromUrl, generateStrategicResponse } from "@/actions/social-intelligence";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";

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

export interface Props {
  initialPosts: SocialPost[];
  initialTemplates: SocialTemplate[];
  initialAssets: SocialAsset[];
  initialAccounts: SocialAccount[];
  initialMarketingDrafts?: MarketingDraft[];
}

export function SocialDashboardClient({
  initialPosts,
  initialTemplates,
  initialAssets: _initialAssets,
  initialAccounts,
  initialMarketingDrafts = [],
}: Props) {
  const t = useTranslations("admin");
  const tAdmin = useTranslations("admin");
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [marketingDrafts, setMarketingDrafts] = useState<MarketingDraft[]>(initialMarketingDrafts);
  const [activeTab, setActiveTab] = useState<
    "queue" | "calendar" | "drafts" | "templates" | "analytics" | "intelligence"
  >("queue");
  const [isPending, startTransition] = useTransition();

  // Intelligence Tab states
  const [intelligenceUrl, setIntelligenceUrl] = useState("");
  const [intelligenceText, setIntelligenceText] = useState("");
  const [intelligencePersona, setIntelligencePersona] = useState<
    "visionary" | "diplomatic" | "punchy"
  >("visionary");
  const [intelligencePlatform, setIntelligencePlatform] = useState<
    "youtube" | "linkedin" | "x" | "general"
  >("youtube");
  const [generatedDrafts, setGeneratedDrafts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  // Form states for creating/editing posts
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formPlatform, setFormPlatform] = useState<
    "linkedin" | "x" | "instagram" | "facebook" | "whatsapp"
  >("linkedin");
  const [formContentType, setFormContentType] = useState<
    "manifesto" | "case_study" | "weekly_report" | "incident_spotlight" | "thread" | "poll"
  >("manifesto");
  const [formStatus, setFormStatus] = useState<"draft" | "scheduled" | "published" | "archived">(
    "draft",
  );
  const [formScheduledAt, setFormScheduledAt] = useState("");
  const [formExternalUrl, setFormExternalUrl] = useState("");
  const [formImagePrompt, setFormImagePrompt] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<string>("1:1");

  // Copy indicator states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter states
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateImage = () => {
    if (!editingPost || !formImagePrompt) return;
    setIsGeneratingImage(true);
    startTransition(async () => {
      try {
        const { generateSocialImageAction } = await import("@/actions/social-image");
        const res = await generateSocialImageAction(
          editingPost.id,
          formImagePrompt,
          imageAspectRatio,
        );
        if (res.ok) {
          setFormImageUrl(res.imageUrl);
          toast.success("Image generated successfully!");
          setPosts((prev) =>
            prev.map((p) =>
              p.id === editingPost.id
                ? { ...p, image_url: res.imageUrl, image_prompt: formImagePrompt }
                : p,
            ),
          );
        } else {
          toast.error(res.error || "Failed to generate image.");
        }
      } catch (err) {
        logger.error("Failed to generate image", undefined, err instanceof Error ? err : undefined);
        toast.error("An error occurred during image generation.");
      } finally {
        setIsGeneratingImage(false);
      }
    });
  };

  const handleOpenForm = (post?: SocialPost) => {
    if (post) {
      setEditingPost(post);
      setFormTitle(post.title);
      setFormBody(post.body_text);
      setFormPlatform(post.platform);
      setFormContentType(post.content_type);
      setFormStatus(post.status);
      setFormScheduledAt(
        post.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : "",
      );
      setFormExternalUrl(post.external_url || "");
      setFormImagePrompt(post.image_prompt || "");
      setFormImageUrl(post.image_url || "");
      setImageAspectRatio("1:1");
    } else {
      setEditingPost(null);
      setFormTitle("");
      setFormBody("");
      setFormPlatform("linkedin");
      setFormContentType("manifesto");
      setFormStatus("draft");
      setFormScheduledAt("");
      setFormExternalUrl("");
      setFormImagePrompt("");
      setFormImageUrl("");
      setImageAspectRatio("1:1");
    }
    setShowFormModal(true);
  };

  const handleUseTemplate = (template: SocialTemplate) => {
    setEditingPost(null);
    setFormTitle(`Draft from template: ${template.name}`);
    setFormBody(template.template_body);
    setFormPlatform(
      template.platform === "all" ? "linkedin" : (template.platform as SocialPost["platform"]),
    );
    setFormContentType(template.content_type);
    setFormStatus("draft");
    setFormScheduledAt("");
    setFormExternalUrl("");
    setFormImagePrompt("");
    setFormImageUrl("");
    setImageAspectRatio("1:1");
    setActiveTab("drafts");
    setShowFormModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const payload = {
          title: formTitle,
          body_text: formBody,
          platform: formPlatform,
          content_type: formContentType,
          status: formStatus,
          scheduled_at: formScheduledAt ? new Date(formScheduledAt).toISOString() : null,
          external_url: formExternalUrl || null,
          image_prompt: formImagePrompt || null,
          image_url: formImageUrl || null,
        };

        if (editingPost) {
          await updateSocialPost(editingPost.id, payload);
          setPosts((prev) =>
            prev.map((p) =>
              p.id === editingPost.id
                ? ({ ...p, ...payload, updated_at: new Date().toISOString() } as SocialPost)
                : p,
            ),
          );
        } else {
          await createSocialPost(payload);
          // Reload page to get new post list or just simulate append
          window.location.reload();
        }
        setShowFormModal(false);
      } catch (err) {
        logger.error("Failed to save post", undefined, err instanceof Error ? err : undefined);
        alert("Error saving social post");
      }
    });
  };

  const handleQuickPublish = (post: SocialPost) => {
    startTransition(async () => {
      try {
        await updateSocialPost(post.id, {
          status: "published",
          published_at: new Date().toISOString(),
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? ({
                  ...p,
                  status: "published",
                  published_at: new Date().toISOString(),
                } as SocialPost)
              : p,
          ),
        );
      } catch (err) {
        logger.error("Failed to publish", undefined, err instanceof Error ? err : undefined);
      }
    });
  };

  const handlePublishLinkedIn = (draftId: string) => {
    startTransition(async () => {
      try {
        const res = await publishDraftToLinkedInAction(draftId);
        if (res.success) {
          toast.success("Successfully published to LinkedIn!");
          setMarketingDrafts((prev) =>
            prev.map((d) => (d.id === draftId ? { ...d, status: "published" } : d)),
          );
        } else {
          toast.error(res.error || "Failed to publish.");
        }
      } catch (err) {
        logger.error("Failed to publish draft", undefined, err instanceof Error ? err : undefined);
        toast.error(err instanceof Error ? err.message : "An error occurred.");
      }
    });
  };

  const handleUpdateAnalytics = (
    post: SocialPost,
    fields: {
      likes?: number;
      comments_count?: number;
      shares_count?: number;
      estimated_reach?: number;
    },
  ) => {
    startTransition(async () => {
      try {
        await updateSocialPost(post.id, fields);
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? ({ ...p, ...fields } as SocialPost) : p)),
        );
      } catch (err) {
        logger.error(
          "Failed to update analytics",
          undefined,
          err instanceof Error ? err : undefined,
        );
      }
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return <Linkedin className="h-4 w-4 text-[#0077b5]" />;
      case "x":
        return <Twitter className="h-4 w-4 text-white" />;
      case "instagram":
        return <Instagram className="h-4 w-4 text-[#e1306c]" />;
      default:
        return <Send className="text-brand-400 h-4 w-4" />;
    }
  };

  const getPlatformLimit = (platform: string) => {
    if (platform === "x") return 280;
    if (platform === "instagram") return 2200;
    return 3000; // linkedin default limit
  };

  const getShareLink = (post: SocialPost) => {
    const encodedText = encodeURIComponent(post.body_text);
    if (post.platform === "x") return `https://x.com/intent/tweet?text=${encodedText}`;
    if (post.platform === "linkedin") return `https://www.linkedin.com/feed/`;
    return "#";
  };

  const handleFetchUrl = async () => {
    if (!intelligenceUrl) return;
    setIsFetchingUrl(true);
    try {
      const res = await fetchContentFromUrl(intelligenceUrl);
      if (res.ok && res.content) {
        setIntelligenceText(res.content);
        toast.success(
          tAdmin("intelligenceFetched", { defaultValue: "Content fetched successfully!" }),
        );
      } else {
        toast.error(
          res.error ||
            tAdmin("intelligenceFetchError", {
              defaultValue: "Could not fetch content from this URL.",
            }),
        );
      }
    } catch {
      toast.error(
        tAdmin("intelligenceFetchError", {
          defaultValue: "Could not fetch content from this URL.",
        }),
      );
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleGenerateResponse = () => {
    if (!intelligenceText) {
      toast.error("Please provide some context text or URL content.");
      return;
    }
    setIsGenerating(true);
    setGeneratedDrafts([]);
    startTransition(async () => {
      try {
        const res = await generateStrategicResponse(
          intelligenceText,
          intelligencePersona,
          intelligencePlatform,
        );
        if (res.ok && res.drafts) {
          setGeneratedDrafts(res.drafts);
          toast.success("Strategic response alternatives generated!");
        } else {
          if (res.error === "API_KEY_NOT_FOUND") {
            toast.error("Google Gemini API Key is missing. Please add it in the API Keys page.");
          } else {
            toast.error(
              res.error ||
                tAdmin("intelligenceError", { defaultValue: "Failed to generate response." }),
            );
          }
        }
      } catch {
        toast.error(tAdmin("intelligenceError", { defaultValue: "Failed to generate response." }));
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const handleSaveIntelligenceDraft = (draftText: string) => {
    startTransition(async () => {
      try {
        const platformMap: Record<
          string,
          "x" | "linkedin" | "instagram" | "facebook" | "whatsapp"
        > = {
          youtube: "x",
          linkedin: "linkedin",
          x: "x",
          general: "linkedin",
        };
        const targetPlatform = platformMap[intelligencePlatform] || "linkedin";

        await createSocialPost({
          platform: targetPlatform,
          status: "draft",
          content_type: "manifesto",
          title: `AI Response Draft - ${new Date().toLocaleDateString()}`,
          body_text: draftText,
        });
        toast.success(tAdmin("intelligenceSaved", { defaultValue: "Saved as draft!" }));
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        toast.error("Failed to save draft.");
      }
    });
  };

  const tabs = [
    {
      id: "queue",
      label: tAdmin("tabQueue", { defaultValue: "Approval Queue" }),
      icon: AlertCircle,
    },
    { id: "drafts", label: tAdmin("tabDrafts", { defaultValue: "Drafts" }), icon: FileText },
    {
      id: "calendar",
      label: tAdmin("tabCalendar", { defaultValue: "Content Calendar" }),
      icon: Calendar,
    },
    {
      id: "intelligence",
      label: tAdmin("tabIntelligence", { defaultValue: "Intelligence" }),
      icon: Brain,
    },
    {
      id: "templates",
      label: tAdmin("tabTemplates", { defaultValue: "Templates" }),
      icon: Sparkles,
    },
    {
      id: "analytics",
      label: tAdmin("tabAnalytics", { defaultValue: "Analytics" }),
      icon: BarChart3,
    },
  ] as const;

  const chartData = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    // Reverse to process oldest to newest, assuming initial is newest first
    const sorted = [...posts].reverse();

    const grouped = sorted.reduce(
      (acc, post) => {
        // Use created_at or published_at
        const date = new Date(post.published_at || post.created_at);
        const day = format(date, "MMM dd");
        if (!acc[day]) acc[day] = { date: day, reach: 0, likes: 0, comments: 0 };

        acc[day].reach += post.estimated_reach || 0;
        acc[day].likes += post.likes || 0;
        acc[day].comments += post.comments_count || 0;

        return acc;
      },
      {} as Record<string, { date: string; reach: number; likes: number; comments: number }>,
    );

    return Object.values(grouped);
  }, [posts]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* 360° Observe: Social Performance Trend */}
      <div className="rounded-xl border border-white/5 bg-neutral-950/40 p-6">
        <h3 className="text-fg-primary mb-6 text-sm font-bold tracking-wide">
          {t("social_performance_trend_engagement")}
        </h3>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                />
                <RechartsTooltip
                  cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: "#0E1622",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ fontSize: "12px" }}
                  labelStyle={{ color: "#9CA3AF", fontSize: "12px", marginBottom: "4px" }}
                />
                <Line
                  type="monotone"
                  dataKey="likes"
                  name="Likes"
                  stroke="#00FF88"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#00FF88", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="comments"
                  name="Comments"
                  stroke="#00D2FF"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#00D2FF", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyStateIllustration
              title={t("no_engagement_data")}
              description={t("there_is_no_social_post_data_to_visualiz")}
              icon={BarChart3}
            />
          )}
        </div>
      </div>

      {/* Platform Connections */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {initialAccounts.map((account) => {
          const isLinkedin = account.platform === "linkedin";
          return (
            <div
              key={account.id}
              className="bg-bg-secondary border-border-subtle group hover:border-brand-500/30 relative overflow-hidden rounded-xl border p-6 transition-colors"
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100",
                  isLinkedin ? "from-blue-500/5" : "from-sky-500/5",
                )}
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "rounded-lg border p-3",
                      isLinkedin
                        ? "border-blue-500/20 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                        : "border-sky-500/20 bg-sky-500/10 shadow-[0_0_15px_rgba(14,165,233,0.15)]",
                    )}
                  >
                    {getPlatformIcon(account.platform)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white capitalize">
                      {account.platform} {account.account_name && `- ${account.account_name}`}
                    </h3>
                    <p className="text-fg-muted flex items-center gap-2 text-sm">
                      <span
                        className={`flex h-2 w-2 rounded-full ${account.connection_status === "connected" ? "bg-emerald-500" : "bg-red-500"}`}
                      />
                      <span className="capitalize">{account.connection_status}</span>
                    </p>
                  </div>
                </div>
                <button className="border-border-subtle bg-bg-tertiary rounded-md border px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/5">
                  {t("manage")}
                </button>
              </div>
            </div>
          );
        })}
        {initialAccounts.length === 0 && (
          <div className="text-fg-muted border-border-subtle col-span-full rounded-xl border border-dashed py-4 text-center text-sm">
            {t("no_social_accounts_connected")}
          </div>
        )}
      </div>

      {/* Title Header */}
      <div className="border-border-subtle flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-fg-primary text-3xl font-bold tracking-tight">
            {tAdmin("growthHub", { defaultValue: "Growth Hub" })}
          </h1>
          <p className="text-fg-muted mt-2 max-w-2xl text-sm">
            {tAdmin("growthHubDesc", {
              defaultValue:
                "Manage your AI safety calendar, pre-written manifesto campaigns, templates, and track published analytics.",
            })}
          </p>
        </div>
        <div>
          <button
            onClick={() => handleOpenForm()}
            className="from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 flex items-center gap-2 rounded-xl bg-gradient-to-r px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            {tAdmin("createCampaignPost", { defaultValue: "Create Campaign Post" })}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-border-subtle flex gap-2 overflow-x-auto border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all duration-300",
                isActive
                  ? "border-brand-500 text-brand-400"
                  : "text-fg-secondary hover:text-fg-primary border-transparent",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter and Content Area */}
      <div className="space-y-6">
        {/* Tab 0: Approval Queue */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            <div className="border-border-subtle/50 flex items-center justify-between border-b pb-3">
              <h2 className="text-fg-primary flex items-center gap-2 text-lg font-bold">
                <AlertCircle className="text-warning-400 h-5 w-5" />
                {tAdmin("pendingApprovalQueue", { defaultValue: "Pending Approval Queue" })}
              </h2>
              <span className="bg-brand-500/10 text-brand-400 rounded-full px-2.5 py-0.5 text-xs font-bold">
                {tAdmin("itemsPending", {
                  count: posts.filter((p) => p.status === "draft").length,
                  defaultValue: "items pending review",
                })}
              </span>
            </div>

            <div className="space-y-4">
              {posts
                .filter((p) => p.status === "draft")
                .map((post) => {
                  const limit = getPlatformLimit(post.platform);
                  const isOverLimit = post.body_text.length > limit;
                  return (
                    <div
                      key={post.id}
                      className="bg-bg-secondary/40 border-border-subtle hover:border-brand-500/30 flex flex-col justify-between gap-4 rounded-2xl border p-5 transition-all duration-300"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="text-fg-primary flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold">
                              {getPlatformIcon(post.platform)}
                              <span className="capitalize">{post.platform}</span>
                            </div>
                            <span className="text-warning-400 bg-warning-500/10 border-warning-500/20 rounded border px-2 py-0.5 text-[10px] font-bold uppercase">
                              {post.content_type.replace("_", " ")}
                            </span>
                          </div>
                          <h3 className="text-fg-primary text-base font-bold">{post.title}</h3>
                          <p className="text-fg-secondary border-border-subtle/50 rounded-lg border bg-black/20 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                            {post.body_text}
                          </p>
                        </div>

                        {post.image_url && (
                          <div className="h-36 w-full shrink-0 overflow-hidden rounded-lg border border-white/10 md:w-36">
                            <img
                              src={post.image_url}
                              alt={post.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div className="border-border-subtle/50 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                        <div className="text-fg-muted flex items-center gap-3 text-[10px] font-semibold">
                          <span>
                            {t("characters")}{" "}
                            <span
                              className={cn(
                                isOverLimit ? "text-danger-400 font-bold" : "text-fg-secondary",
                              )}
                            >
                              {post.body_text.length}
                            </span>
                            /{limit}
                          </span>
                          <span>
                            {t("created")}
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                          <button
                            onClick={() => handleCopy(post.id, post.body_text)}
                            className="text-fg-secondary hover:text-fg-primary rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/10"
                            title={t("copy_to_clipboard")}
                          >
                            {copiedId === post.id ? (
                              <Check className="text-success-400 h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenForm(post)}
                            className="text-fg-secondary hover:text-fg-primary rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/10"
                            title={t("edit_draft")}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleQuickPublish(post)}
                            className="from-success-600 to-success-500 hover:from-success-500 hover:to-success-400 flex items-center gap-2 rounded-xl bg-gradient-to-r px-4 py-2 text-xs font-bold text-white shadow-lg transition-all"
                          >
                            <Check className="h-3.5 w-3.5" />
                            {t("approve_post")}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {posts.filter((p) => p.status === "draft").length === 0 && (
                <div className="border-border-subtle w-full rounded-2xl border border-dashed p-12 text-center">
                  <Check className="text-success-400 mx-auto mb-3 h-8 w-8" />
                  <div className="text-fg-muted py-8 text-center text-sm">
                    {tAdmin("allApproved", {
                      defaultValue: "All campaign posts approved! Approval queue is empty.",
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Drafts */}
        {activeTab === "drafts" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-fg-secondary text-xs font-bold tracking-wider uppercase">
                {tAdmin("platform", { defaultValue: "Platform:" })}
              </span>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="bg-bg-secondary border-border-subtle text-fg-primary rounded-lg border px-2 py-1 text-xs focus:outline-none"
              >
                <option value="all">
                  {tAdmin("allPlatforms", { defaultValue: "All Platforms" })}
                </option>
                <option value="linkedin">{t("linkedin")}</option>
                <option value="x">{t("x_twitter")}</option>
                <option value="instagram">{t("instagram")}</option>
              </select>
            </div>

            {/* LinkedIn Pending Approval Drafts Section */}
            {marketingDrafts.filter((d) => d.status === "pending_approval").length > 0 && (
              <div className="mb-6 space-y-4 border-b border-white/10 pb-6">
                <h3 className="text-fg-primary flex items-center gap-2 text-sm font-bold">
                  <Linkedin className="text-brand-400 h-4 w-4" />
                  {t("linkedin_drafts_pending_founder_approval")}
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {marketingDrafts
                    .filter((d) => d.status === "pending_approval")
                    .map((draft) => (
                      <div
                        key={draft.id}
                        className="bg-bg-secondary/40 border-brand-500/20 hover:border-brand-500/40 flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300"
                      >
                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <div className="text-fg-primary flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold">
                              <Linkedin className="text-brand-400 h-3 w-3" />
                              <span>{t("linkedin")}</span>
                            </div>
                            <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
                              {t("pending_approval")}
                            </span>
                          </div>
                          <p className="text-fg-secondary border-border-subtle/50 line-clamp-6 rounded-lg border bg-black/20 p-3 font-mono text-xs whitespace-pre-wrap">
                            {draft.content}
                          </p>
                          {draft.media_url && (
                            <div className="mt-3 max-h-[150px] overflow-hidden rounded-lg border border-white/10">
                              <img
                                src={draft.media_url}
                                alt="Draft attachment"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        <div className="border-border-subtle/50 mt-4 flex flex-col gap-3 border-t pt-4">
                          <div className="text-fg-muted flex items-center justify-between text-[10px] font-semibold">
                            <span>
                              {t("created")}
                              {new Date(draft.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleCopy(draft.id, draft.content)}
                              className="text-fg-secondary hover:text-fg-primary rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/10"
                              title={t("copy_to_clipboard")}
                            >
                              {copiedId === draft.id ? (
                                <Check className="text-success-400 h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handlePublishLinkedIn(draft.id)}
                              disabled={isPending}
                              className="bg-brand-500 hover:bg-brand-600 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all disabled:opacity-50"
                            >
                              <Send className="h-3 w-3" />
                              {isPending ? "Publishing..." : "Publish to LinkedIn"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {posts
                .filter(
                  (p) =>
                    p.status === "draft" &&
                    (platformFilter === "all" || p.platform === platformFilter),
                )
                .map((post) => {
                  const limit = getPlatformLimit(post.platform);
                  const isOverLimit = post.body_text.length > limit;
                  return (
                    <div
                      key={post.id}
                      className="bg-bg-secondary/40 border-border-subtle hover:border-brand-500/30 flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300"
                    >
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-fg-primary flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold">
                            {getPlatformIcon(post.platform)}
                            <span className="capitalize">{post.platform}</span>
                          </div>
                          <span className="text-warning-400 bg-warning-500/10 border-warning-500/20 rounded border px-2 py-0.5 text-[10px] font-bold uppercase">
                            {post.content_type.replace("_", " ")}
                          </span>
                        </div>
                        <h3 className="text-fg-primary mb-2 text-sm font-bold">{post.title}</h3>
                        <p className="text-fg-secondary border-border-subtle/50 line-clamp-6 rounded-lg border bg-black/20 p-3 font-mono text-xs whitespace-pre-wrap">
                          {post.body_text}
                        </p>
                      </div>

                      <div className="border-border-subtle/50 mt-4 flex flex-col gap-3 border-t pt-4">
                        <div className="text-fg-muted flex items-center justify-between text-[10px] font-semibold">
                          <span>
                            {t("characters")}{" "}
                            <span
                              className={cn(
                                isOverLimit ? "text-danger-400 font-bold" : "text-fg-secondary",
                              )}
                            >
                              {post.body_text.length}
                            </span>
                            /{limit}
                          </span>
                          <span>
                            {t("created")}
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopy(post.id, post.body_text)}
                            className="text-fg-secondary hover:text-fg-primary rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/10"
                            title={t("copy_to_clipboard")}
                          >
                            {copiedId === post.id ? (
                              <Check className="text-success-400 h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                          <a
                            href={getShareLink(post)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleQuickPublish(post)}
                            className="text-fg-secondary hover:text-fg-primary rounded-lg border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/10"
                            title={t("open_platform")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleOpenForm(post)}
                            className="text-fg-primary flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold transition-all hover:bg-white/10"
                          >
                            <Edit3 className="h-3 w-3" /> {t("edit")}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {posts.filter((p) => p.status === "draft").length === 0 && (
                <div className="border-border-subtle col-span-full rounded-2xl border border-dashed p-12 text-center">
                  <AlertCircle className="text-fg-muted mx-auto mb-3 h-8 w-8" />
                  <div className="text-fg-muted py-8 text-center text-sm">
                    {tAdmin("noCampaignDrafts", {
                      defaultValue: "No campaign drafts currently in queue.",
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Calendar */}
        {activeTab === "calendar" && (
          <div className="bg-bg-secondary/40 border-border-subtle space-y-4 rounded-2xl border p-6">
            <h2 className="text-fg-primary mb-6 flex items-center gap-2 text-xl font-bold">
              <Calendar className="text-brand-500 h-5 w-5" />
              {tAdmin("timelineOverview", { defaultValue: "Timeline Overview" })}
            </h2>
            <div className="border-border-subtle relative ml-3 space-y-6 border-l pl-6">
              {posts
                .filter((p) => p.status === "scheduled" || p.status === "published")
                .sort(
                  (a, b) =>
                    new Date(a.scheduled_at || a.published_at || a.created_at).getTime() -
                    new Date(b.scheduled_at || b.published_at || b.created_at).getTime(),
                )
                .map((post) => {
                  const date = new Date(post.scheduled_at || post.published_at || post.created_at);
                  const isScheduled = post.status === "scheduled";
                  return (
                    <div key={post.id} className="relative">
                      {/* Timeline Dot */}
                      <span
                        className={cn(
                          "absolute top-1.5 -left-[31px] flex h-4.5 w-4.5 items-center justify-center rounded-full border",
                          isScheduled
                            ? "bg-warning-500/10 border-warning-500"
                            : "bg-success-500/10 border-success-500",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isScheduled ? "bg-warning-400" : "bg-success-400",
                          )}
                        />
                      </span>

                      <div className="border-border-subtle/50 flex flex-col justify-between gap-4 rounded-xl border bg-black/10 p-4 md:flex-row">
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                              {date.toLocaleString()}
                            </span>
                            <span
                              className={cn(
                                "rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase",
                                isScheduled
                                  ? "bg-warning-500/10 border-warning-500/20 text-warning-400"
                                  : "bg-success-500/10 border-success-500/20 text-success-400",
                              )}
                            >
                              {post.status}
                            </span>
                          </div>
                          <h4 className="text-fg-primary flex items-center gap-2 text-sm font-bold">
                            {getPlatformIcon(post.platform)} {post.title}
                          </h4>
                          <p className="text-fg-secondary mt-1 line-clamp-2 max-w-2xl font-mono text-xs">
                            {post.body_text}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 self-end md:self-center">
                          <button
                            onClick={() => handleOpenForm(post)}
                            className="text-fg-primary flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold transition-all hover:bg-white/10"
                          >
                            <Edit3 className="h-3 w-3" /> {t("edit")}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {posts.filter((p) => p.status === "scheduled" || p.status === "published").length ===
                0 && (
                <div className="py-6 text-center">
                  <p className="text-fg-muted text-xs">
                    {t("no_scheduled_or_published_timeline_items")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Templates */}
        {activeTab === "templates" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {initialTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-bg-secondary/40 border-border-subtle hover:border-brand-500/30 flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-brand-400 bg-brand-500/10 border-brand-500/20 rounded-full border px-2.5 py-1 text-xs font-bold capitalize">
                      {t("hook")}
                      {template.psychology_hook}
                    </span>
                    <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                      {template.content_type.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-fg-primary mb-2 text-sm font-black">{template.name}</h3>
                  <div className="border-border-subtle/50 mb-3 rounded-xl border bg-black/20 p-4">
                    <p className="text-fg-secondary line-clamp-6 font-mono text-xs leading-relaxed whitespace-pre-line whitespace-pre-wrap">
                      {template.template_body}
                    </p>
                  </div>
                  {template.example_output && (
                    <div className="text-fg-muted mt-2 text-[11px]">
                      <span className="text-fg-secondary font-bold">{t("example_output")}</span>
                      <p className="mt-1 line-clamp-2 italic">{template.example_output}</p>
                    </div>
                  )}
                </div>
                <div className="border-border-subtle/50 mt-4 flex justify-end border-t pt-4">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="bg-brand-500 hover:bg-brand-400 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> {t("use_template")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === "analytics" && (
          <div className="bg-bg-secondary/40 border-border-subtle overflow-hidden rounded-2xl border p-6">
            <h2 className="text-fg-primary mb-6 flex items-center gap-2 text-xl font-bold">
              <BarChart3 className="text-brand-500 h-5 w-5" />
              {tAdmin("postReachMetrics", { defaultValue: "Post Reach & Metrics Tracker" })}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-border-subtle text-fg-muted border-b text-[10px] font-bold tracking-wider uppercase">
                    <th className="px-4 py-3">{t("post_title")}</th>
                    <th className="px-4 py-3">{t("platform")}</th>
                    <th className="px-4 py-3 text-right">{t("reach")}</th>
                    <th className="px-4 py-3 text-right">{t("likes")}</th>
                    <th className="px-4 py-3 text-right">{t("comments")}</th>
                    <th className="px-4 py-3 text-right">{t("shares")}</th>
                    <th className="px-4 py-3 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-border-subtle/50 text-fg-primary divide-y">
                  {posts
                    .filter((p) => p.status === "published")
                    .map((post) => (
                      <tr key={post.id} className="hover:bg-black/10">
                        <td
                          className="max-w-[200px] truncate px-4 py-4 font-semibold"
                          title={post.title}
                        >
                          {post.title}
                        </td>
                        <td className="flex items-center gap-1.5 px-4 py-4 capitalize">
                          {getPlatformIcon(post.platform)} {post.platform}
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-bold">
                          {post.estimated_reach.toLocaleString()}
                        </td>
                        <td className="text-fg-secondary px-4 py-4 text-right font-mono">
                          {post.likes.toLocaleString()}
                        </td>
                        <td className="text-fg-secondary px-4 py-4 text-right font-mono">
                          {post.comments_count.toLocaleString()}
                        </td>
                        <td className="text-fg-secondary px-4 py-4 text-right font-mono">
                          {post.shares_count.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => {
                              const r = prompt("Estimated Reach:", post.estimated_reach.toString());
                              const l = prompt("Likes:", post.likes.toString());
                              const c = prompt("Comments:", post.comments_count.toString());
                              const s = prompt("Shares:", post.shares_count.toString());
                              if (r !== null || l !== null || c !== null || s !== null) {
                                handleUpdateAnalytics(post, {
                                  estimated_reach: r ? parseInt(r) || 0 : post.estimated_reach,
                                  likes: l ? parseInt(l) || 0 : post.likes,
                                  comments_count: c ? parseInt(c) || 0 : post.comments_count,
                                  shares_count: s ? parseInt(s) || 0 : post.shares_count,
                                });
                              }
                            }}
                            className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold transition-all hover:bg-white/10"
                          >
                            {t("update")}
                          </button>
                        </td>
                      </tr>
                    ))}

                  {posts.filter((p) => p.status === "published").length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-fg-muted py-8 text-center">
                        {tAdmin("noPublishedPosts", {
                          defaultValue: "No published posts listed for analytics tracking.",
                        })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Intelligence */}
        {activeTab === "intelligence" && (
          <div className="bg-bg-secondary/40 border-border-subtle space-y-6 rounded-2xl border bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 p-6">
            <div>
              <h2 className="text-fg-primary flex items-center gap-2 text-xl font-bold">
                <Brain className="text-brand-500 h-5 w-5" />
                {tAdmin("intelligenceTitle", { defaultValue: "ALPAR AI Intelligence" })}
              </h2>
              <p className="text-fg-muted mt-1.5 text-sm">
                {tAdmin("intelligenceDesc", {
                  defaultValue:
                    "Generate brand-consistent strategic responses with AI-powered engagement engine.",
                })}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                {/* URL Fetch Input */}
                <div className="space-y-1.5">
                  <label className="text-fg-secondary text-xs font-bold">
                    {tAdmin("intelligenceUrlLabel", { defaultValue: "Target URL" })}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder={tAdmin("intelligenceUrlPlaceholder", {
                        defaultValue: "https://youtube.com/watch?v=...",
                      })}
                      value={intelligenceUrl}
                      onChange={(e) => setIntelligenceUrl(e.target.value)}
                      className="bg-bg-primary border-border-subtle text-fg-primary focus:ring-brand-500 flex-1 rounded-xl border px-3.5 py-2.5 text-sm focus:ring-2 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleFetchUrl}
                      disabled={!intelligenceUrl || isFetchingUrl}
                      className="bg-bg-tertiary/40 border-border-subtle hover:bg-bg-tertiary/60 text-fg-primary inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {isFetchingUrl ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {t("fetching")}
                        </>
                      ) : (
                        tAdmin("intelligenceFetchBtn", { defaultValue: "Fetch Content" })
                      )}
                    </button>
                  </div>
                </div>

                {/* Direct Text input */}
                <div className="space-y-1.5">
                  <label className="text-fg-secondary text-xs font-bold">
                    {tAdmin("intelligenceTextLabel", { defaultValue: "Or paste content directly" })}
                  </label>
                  <textarea
                    rows={8}
                    placeholder={tAdmin("intelligenceTextPlaceholder", {
                      defaultValue:
                        "Paste the video transcript, post content, or article text here...",
                    })}
                    value={intelligenceText}
                    onChange={(e) => setIntelligenceText(e.target.value)}
                    className="bg-bg-primary border-border-subtle text-fg-primary focus:ring-brand-500 w-full rounded-xl border p-3 text-sm focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-6">
                {/* Platform selector */}
                <div className="space-y-2">
                  <label className="text-fg-secondary text-xs font-bold">
                    {tAdmin("intelligencePlatformLabel", { defaultValue: "Target Platform" })}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: "youtube", label: "YouTube" },
                        { id: "linkedin", label: "LinkedIn" },
                        { id: "x", label: "X / Twitter" },
                        { id: "general", label: "General" },
                      ] as const
                    ).map((plat) => (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => setIntelligencePlatform(plat.id)}
                        className={cn(
                          "border-border-subtle bg-bg-primary/50 text-fg-primary hover:bg-bg-primary cursor-pointer rounded-xl border px-4 py-3 text-center text-xs font-bold transition-all",
                          intelligencePlatform === plat.id &&
                            "border-brand-500 ring-brand-500/25 bg-bg-primary ring-2",
                        )}
                      >
                        {plat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Persona selector */}
                <div className="space-y-2">
                  <label className="text-fg-secondary text-xs font-bold">
                    {tAdmin("intelligencePersonaLabel", { defaultValue: "Response Persona" })}
                  </label>
                  <div className="space-y-2">
                    {(
                      [
                        {
                          id: "visionary",
                          title: tAdmin("personaVisionary", { defaultValue: "Visionary" }),
                          desc: tAdmin("personaVisionaryDesc", {
                            defaultValue: "Deep, thought-provoking, opens questions",
                          }),
                        },
                        {
                          id: "diplomatic",
                          title: tAdmin("personaDiplomatic", { defaultValue: "Diplomatic" }),
                          desc: tAdmin("personaDiplomaticDesc", {
                            defaultValue: "Academic, balanced, regulation-focused",
                          }),
                        },
                        {
                          id: "punchy",
                          title: tAdmin("personaPunchy", { defaultValue: "Punchy" }),
                          desc: tAdmin("personaPunchyDesc", {
                            defaultValue: "Short, sharp, high-engagement",
                          }),
                        },
                      ] as const
                    ).map((pers) => (
                      <button
                        key={pers.id}
                        type="button"
                        onClick={() => setIntelligencePersona(pers.id)}
                        className={cn(
                          "border-border-subtle bg-bg-primary/50 text-fg-primary hover:bg-bg-primary flex w-full cursor-pointer flex-col gap-0.5 rounded-xl border p-3 text-left transition-all",
                          intelligencePersona === pers.id &&
                            "border-brand-500 ring-brand-500/25 bg-bg-primary ring-2",
                        )}
                      >
                        <span className="text-xs font-bold">{pers.title}</span>
                        <span className="text-fg-muted text-[10px]">{pers.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateResponse}
                  disabled={!intelligenceText || isGenerating}
                  className="from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-3 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {tAdmin("intelligenceGenerating", { defaultValue: "AI is thinking..." })}
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      {tAdmin("intelligenceGenerate", {
                        defaultValue: "Generate Strategic Response",
                      })}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated results */}
            {generatedDrafts.length > 0 && (
              <div className="border-border-subtle/50 space-y-4 border-t pt-6">
                <h3 className="text-fg-secondary text-sm font-bold">
                  {tAdmin("generatedAlternatives", { defaultValue: "Generated Alternatives" })}
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {generatedDrafts.map((draft, idx) => (
                    <div
                      key={idx}
                      className="bg-bg-primary/45 border-border-subtle/80 relative flex flex-col justify-between rounded-xl border p-4 backdrop-blur-sm"
                    >
                      <div className="bg-brand-500/10 text-brand-400 absolute top-2 right-2 rounded px-1.5 py-0.5 text-[9px] font-bold">
                        {tAdmin("intelligenceResult", { defaultValue: "Alt" })} {idx + 1}
                      </div>
                      <p className="text-fg-primary mt-2 pr-6 text-xs leading-relaxed whitespace-pre-wrap">
                        {draft}
                      </p>
                      <div className="border-border-subtle/40 mt-4 flex gap-2 border-t pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(draft);
                            toast.success(
                              tAdmin("intelligenceCopied", {
                                defaultValue: "Copied to clipboard!",
                              }),
                            );
                          }}
                          className="text-fg-secondary hover:text-fg-primary bg-bg-tertiary/20 hover:bg-bg-tertiary/45 border-border-subtle/50 inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition-all"
                        >
                          <Copy className="h-3 w-3" />
                          {tAdmin("intelligenceCopy", { defaultValue: "Copy" })}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveIntelligenceDraft(draft)}
                          className="text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 ml-auto inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all"
                        >
                          <Plus className="h-3 w-3" />
                          {tAdmin("intelligenceSaveAsDraft", { defaultValue: "Save as Draft" })}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-bg-secondary border-border-subtle w-full max-w-lg space-y-4 rounded-2xl border p-6 shadow-2xl">
            <h3 className="text-fg-primary text-lg font-bold">
              {editingPost
                ? tAdmin("editCampaignPost", { defaultValue: "Edit Campaign Post" })
                : tAdmin("createCampaignPost", { defaultValue: "Create Campaign Post" })}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-fg-secondary text-xs font-bold">
                  {tAdmin("internalTitle", { defaultValue: "Internal Title / Reference" })}
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-bg-primary border-border-subtle text-fg-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:outline-none"
                  placeholder={t("hook_post_passport_lie")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-fg-secondary text-xs font-bold">
                    {tAdmin("platformLabel", { defaultValue: "Platform" })}
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as SocialPost["platform"])}
                    className="bg-bg-primary border-border-subtle text-fg-primary w-full rounded-xl border px-3 py-2 focus:outline-none"
                  >
                    <option value="linkedin">{t("linkedin")}</option>
                    <option value="x">{t("x_twitter")}</option>
                    <option value="instagram">{t("instagram")}</option>
                    <option value="facebook">{t("facebook")}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-fg-secondary text-xs font-bold">
                    {tAdmin("campaignType", { defaultValue: "Campaign Type" })}
                  </label>
                  <select
                    value={formContentType}
                    onChange={(e) =>
                      setFormContentType(e.target.value as SocialPost["content_type"])
                    }
                    className="bg-bg-primary border-border-subtle text-fg-primary w-full rounded-xl border px-3 py-2 focus:outline-none"
                  >
                    <option value="manifesto">
                      {tAdmin("typeManifesto", { defaultValue: "Manifesto" })}
                    </option>
                    <option value="case_study">
                      {tAdmin("typeCaseStudy", { defaultValue: "Case Study" })}
                    </option>
                    <option value="weekly_report">
                      {tAdmin("typeWeeklyReport", { defaultValue: "Weekly Report" })}
                    </option>
                    <option value="incident_spotlight">
                      {tAdmin("typeIncidentSpotlight", { defaultValue: "Incident Spotlight" })}
                    </option>
                    <option value="thread">
                      {tAdmin("typeThread", { defaultValue: "Thread" })}
                    </option>
                    <option value="poll">{tAdmin("typePoll", { defaultValue: "Poll" })}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-fg-primary mb-2 block text-sm font-semibold">
                    {tAdmin("postContent", { defaultValue: "Post Content" })}
                  </label>
                  <span
                    className={cn(
                      "text-[10px] font-semibold",
                      formBody.length > getPlatformLimit(formPlatform)
                        ? "text-danger-400 font-bold"
                        : "text-fg-muted",
                    )}
                  >
                    {formBody.length}/{getPlatformLimit(formPlatform)}
                  </span>
                </div>
                <textarea
                  required
                  rows={6}
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  className="bg-bg-primary border-border-subtle text-fg-primary focus:ring-brand-500 w-full rounded-xl border px-3 py-2 font-mono whitespace-pre-wrap focus:ring-2 focus:outline-none"
                  placeholder={t("i_asked_an_ai_for_help_with_a_passport_a")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-fg-secondary text-xs font-bold">
                    {tAdmin("statusLabel", { defaultValue: "Status" })}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as SocialPost["status"])}
                    className="bg-bg-primary border-border-subtle text-fg-primary w-full rounded-xl border px-3 py-2 focus:outline-none"
                  >
                    <option value="draft">
                      {tAdmin("statusDraft", { defaultValue: "Draft" })}
                    </option>
                    <option value="scheduled">
                      {tAdmin("statusScheduled", { defaultValue: "Scheduled" })}
                    </option>
                    <option value="published">
                      {tAdmin("statusPublished", { defaultValue: "Published" })}
                    </option>
                    <option value="archived">
                      {tAdmin("statusArchived", { defaultValue: "Archived" })}
                    </option>
                  </select>
                </div>
                {formStatus === "scheduled" && (
                  <div className="space-y-1">
                    <label className="text-fg-secondary text-xs font-bold">
                      {tAdmin("scheduleDateTime", { defaultValue: "Schedule Date & Time" })}
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formScheduledAt}
                      onChange={(e) => setFormScheduledAt(e.target.value)}
                      className="bg-bg-primary border-border-subtle text-fg-primary w-full rounded-xl border px-3 py-2 focus:outline-none"
                    />
                  </div>
                )}
                {formStatus === "published" && (
                  <div className="space-y-1">
                    <label className="text-fg-secondary text-xs font-bold">
                      {tAdmin("externalPostUrl", { defaultValue: "External Post URL (Optional)" })}
                    </label>
                    <input
                      type="url"
                      value={formExternalUrl}
                      onChange={(e) => setFormExternalUrl(e.target.value)}
                      className="bg-bg-primary border-border-subtle text-fg-primary w-full rounded-xl border px-3 py-2 focus:outline-none"
                      placeholder={t("https_linkedin_com_posts")}
                    />
                  </div>
                )}
              </div>

              <div className="border-border-subtle/30 space-y-2 border-t pt-3">
                <label className="text-fg-primary block text-sm font-semibold">
                  {t("ai_image_generation_vertex_imagen_3")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formImagePrompt}
                    onChange={(e) => setFormImagePrompt(e.target.value)}
                    className="bg-bg-primary border-border-subtle text-fg-primary focus:ring-brand-500 flex-1 rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
                    placeholder={t("enter_prompt_to_generate_image")}
                  />
                  {editingPost ? (
                    <button
                      type="button"
                      disabled={isGeneratingImage || !formImagePrompt}
                      onClick={handleGenerateImage}
                      className="bg-brand-500 hover:bg-brand-600 flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all disabled:opacity-50"
                    >
                      {isGeneratingImage ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          {t("generating")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          {t("generate")}
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-fg-muted self-center text-xs">
                      {t("save_post_to_enable_image_generation")}
                    </span>
                  )}
                </div>

                {/* Aspect Ratio Selector */}
                {editingPost && (
                  <div className="flex items-center gap-4 pt-1">
                    <span className="text-fg-secondary text-xs font-semibold">
                      {t("aspect_ratio")}
                    </span>
                    <div className="flex gap-3">
                      {[
                        { value: "1:1", label: "1:1 Square" },
                        { value: "4:3", label: "4:3 Article" },
                        { value: "16:9", label: "16:9 Banner" },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-center gap-1.5 text-xs"
                        >
                          <input
                            type="radio"
                            name="image_aspect_ratio"
                            value={opt.value}
                            checked={imageAspectRatio === opt.value}
                            onChange={(e) => setImageAspectRatio(e.target.value)}
                            className="text-brand-500 focus:ring-brand-500 border-border-subtle h-3.5 w-3.5"
                          />
                          <span
                            className={cn(
                              "text-fg-muted hover:text-fg-primary font-medium transition-colors",
                              imageAspectRatio === opt.value && "text-brand-400 font-bold",
                            )}
                          >
                            {opt.value}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {!editingPost && (
                  <p className="text-fg-muted text-[10px]">
                    {t("save_the_post_as_a_draft_first_to_enable")}
                  </p>
                )}
                {formImageUrl ? (
                  <div className="border-border-subtle relative mt-2 aspect-square max-w-[120px] overflow-hidden rounded-xl border">
                    <img
                      src={formImageUrl}
                      alt="Generated Asset"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormImageUrl("")}
                      className="absolute top-1 right-1 rounded-full bg-black/75 p-1 text-white transition-all hover:bg-black/90"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-border-subtle bg-bg-secondary text-fg-muted mt-2 flex aspect-square max-w-[120px] items-center justify-center rounded-xl border border-dashed text-[10px] font-bold tracking-wider uppercase">
                    {t("l_lmedi")}
                  </div>
                )}
              </div>

              <div className="border-border-subtle/50 flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="text-fg-secondary rounded-xl bg-white/5 px-4 py-2 text-sm font-bold transition-all hover:bg-white/10"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-brand-500 hover:bg-brand-400 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg transition-all"
                >
                  {isPending && <RefreshCw className="h-4.5 w-4.5 animate-spin" />}
                  {tAdmin("savePost", { defaultValue: "Save Post" })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
