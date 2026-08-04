export const revalidate = 60;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container, Section } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { getAllPosts } from "@/content/blog-posts";
import {
  BookOpen,
  Clock,
  Shield,
  FileText,
  Database,
  AlertTriangle,
  ShieldAlert,
  Cpu,
  Search,
} from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { NewsletterForm } from "@/components/marketing/newsletter-form";

const CARD_GRADIENTS = [
  "from-brand-900/50 via-purple-900/30 to-rose-900/50 border-brand-500/10",
  "from-blue-900/50 via-cyan-900/30 to-teal-900/50 border-blue-500/10",
  "from-amber-900/50 via-orange-900/30 to-rose-900/50 border-amber-500/10",
  "from-emerald-900/50 via-teal-900/30 to-cyan-900/50 border-emerald-500/10",
  "from-violet-900/50 via-purple-900/30 to-pink-900/50 border-violet-500/10",
  "from-indigo-900/50 via-blue-900/30 to-cyan-900/50 border-indigo-500/10",
];

function getPostIcon(slug: string) {
  const s = slug.toLowerCase();
  if (s.includes("accountability-matters")) {
    return (
      <Shield className="text-brand-400 h-10 w-10 transition duration-300 group-hover:scale-110" />
    );
  }
  if (s.includes("report-ai-incident")) {
    return (
      <FileText className="h-10 w-10 text-blue-400 transition duration-300 group-hover:scale-110" />
    );
  }
  if (s.includes("public-record")) {
    return (
      <Database className="h-10 w-10 text-emerald-400 transition duration-300 group-hover:scale-110" />
    );
  }
  if (s.includes("top-10-ai-incidents")) {
    return (
      <AlertTriangle className="h-10 w-10 text-rose-400 transition duration-300 group-hover:scale-110" />
    );
  }
  if (s.includes("pii-guardian")) {
    return (
      <ShieldAlert className="text-warning-400 h-10 w-10 transition duration-300 group-hover:scale-110" />
    );
  }
  if (s.includes("claude-banned")) {
    return (
      <Cpu className="h-10 w-10 text-purple-400 transition duration-300 group-hover:scale-110" />
    );
  }

  return (
    <BookOpen className="text-brand-400 h-10 w-10 transition duration-300 group-hover:scale-110" />
  );
}

function getPostCategory(
  tags: string[],
): "AI Ethics" | "Case Studies" | "Technical" | "Regulatory" {
  const lowercaseTags = tags.map((t) => t.toLowerCase());

  if (lowercaseTags.some((t) => t === "ai-ethics" || t === "ethics" || t === "opinion")) {
    return "AI Ethics";
  }
  if (
    lowercaseTags.some(
      (t) =>
        t === "annual-report" || t === "research" || t === "case-study" || t === "case-studies",
    )
  ) {
    return "Case Studies";
  }
  if (
    lowercaseTags.some(
      (t) =>
        t === "regulation" ||
        t === "governance" ||
        t === "ai-governance" ||
        t === "policy" ||
        t === "regulatory",
    )
  ) {
    return "Regulatory";
  }

  return "Technical"; // Default fallback
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return { title: t("title"), description: t("description") };
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { locale } = await params;
  const { category = "all", q = "" } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });

  const supabase = await createServerClient();
  const { data: dbPostsRaw } = await supabase
    .from("blog_posts")
    .select("slug, title_en, title_tr, content_en, content_tr, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const dbPosts = (dbPostsRaw ?? []).map((p) => ({
    slug: p.slug,
    title: p.title_en,
    title_tr: p.title_tr,
    description: (p.content_en ?? "").slice(0, 160) + "...",
    description_tr: (p.content_tr ?? "").slice(0, 160) + "...",
    author: t("author"),
    author_tr: t("author"),
    date: p.published_at ?? p.created_at,
    readingTime: Math.max(
      1,
      Math.ceil(
        (locale === "tr" ? (p.content_tr ?? "") : (p.content_en ?? "")).split(/\s+/).length / 200,
      ),
    ),
    tags: ["report", "autopilot"],
  }));

  const allPosts = [...dbPosts, ...getAllPosts()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Filter posts
  const filteredPosts = allPosts.filter((post) => {
    // 1. Category Filter
    if (category && category !== "all") {
      const postCat = getPostCategory(post.tags);
      const categoryMap: Record<string, string> = {
        "ai-ethics": "AI Ethics",
        "case-studies": "Case Studies",
        technical: "Technical",
        regulatory: "Regulatory",
      };
      if (categoryMap[category] !== postCat) {
        return false;
      }
    }

    // 2. Search Filter
    if (q) {
      const searchLower = q.toLowerCase();
      const title = locale === "tr" ? post.title_tr || post.title : post.title || post.title_tr;
      const description =
        locale === "tr"
          ? post.description_tr || post.description
          : post.description || post.description_tr;
      const matchesSearch =
        title.toLowerCase().includes(searchLower) ||
        description.toLowerCase().includes(searchLower);
      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });

  const categories = [
    { slug: "all", label: t("category_all") },
    { slug: "ai-ethics", label: t("category_ethics") },
    { slug: "case-studies", label: t("category_studies") },
    { slug: "technical", label: t("category_technical") },
    { slug: "regulatory", label: t("category_regulatory") },
  ];

  return (
    <Container className="space-y-12 py-12">
      <header className="max-w-3xl">
        <div className="border-brand-500/30 bg-brand-500/10 text-brand-400 mb-4 inline-flex items-center gap-2 rounded-sm border px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase">
          <BookOpen className="h-4 w-4" />
          {t("eyebrow")}
        </div>
        <h1 className="text-fg-primary mb-3 text-4xl font-black tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="text-fg-muted text-lg">{t("description")}</p>
      </header>

      {/* Filter Section */}
      <div className="border-border-subtle/50 flex flex-col gap-6 border-b pb-6 md:flex-row md:items-center md:justify-between">
        {/* Category Navigation Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = category === cat.slug;
            const queryParams = {
              ...(cat.slug !== "all" && { category: cat.slug }),
              ...(q && { q }),
            };
            const queryString = new URLSearchParams(queryParams).toString();
            const href = `/blog${queryString ? `?${queryString}` : ""}`;

            return (
              <Link
                key={cat.slug}
                href={href}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold tracking-wide transition-all ${
                  isActive
                    ? "bg-brand-500/15 border-brand-500 text-brand-400"
                    : "border-border-subtle bg-bg-secondary/30 text-fg-secondary hover:border-white/20"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Server-Side GET Form for Search */}
        <form method="GET" action="" className="relative flex w-full max-w-sm gap-2">
          <div className="relative flex-1">
            <Search className="text-fg-muted absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder={t("search_placeholder")}
              className="bg-bg-secondary/40 border-border-subtle text-fg-primary placeholder:text-fg-muted/65 focus:border-brand-500/80 focus:ring-brand-500/20 w-full rounded-lg border py-2 pr-4 pl-10 text-sm transition-all focus:ring-1 focus:outline-none"
            />
            {category && category !== "all" && (
              <input type="hidden" name="category" value={category} />
            )}
          </div>
        </form>
      </div>

      {/* Blog Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, idx) => {
            const title =
              locale === "tr" ? post.title_tr || post.title : post.title || post.title_tr;
            const description =
              locale === "tr"
                ? post.description_tr || post.description
                : post.description || post.description_tr;
            const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group focus-visible:ring-brand-500 rounded-xl focus-visible:ring-2 focus-visible:outline-none"
              >
                <Card className="group-hover:border-brand-500/40 h-full overflow-hidden transition-all duration-350 group-hover:-translate-y-1">
                  <div
                    className={`relative h-44 w-full bg-gradient-to-br ${gradient} flex flex-col justify-between overflow-hidden border-b p-4`}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] bg-[size:14px_14px] opacity-40" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_70%)]" />

                    <div className="relative z-10 flex flex-1 items-center justify-center">
                      <div className="bg-bg-primary/60 group-hover:bg-bg-primary/80 group-hover:border-brand-500/20 rounded-2xl border border-white/5 p-3 shadow-2xl backdrop-blur-md transition duration-300 group-hover:scale-105">
                        {getPostIcon(post.slug)}
                      </div>
                    </div>

                    <div className="relative z-10 mt-2 flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => {
                        const displayTag = t("tags." + tag.toLowerCase(), { defaultValue: tag });
                        return (
                          <span
                            key={tag}
                            className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white/90 uppercase backdrop-blur-sm"
                          >
                            {displayTag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <CardContent className="space-y-3 p-6 text-left">
                    <div className="text-fg-muted flex items-center gap-3 text-xs">
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString(locale, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTime} {t("min")}
                      </span>
                    </div>
                    <h2 className="text-fg-primary group-hover:text-brand-400 text-xl font-bold transition-colors">
                      {title}
                    </h2>
                    <p className="text-fg-muted line-clamp-3 text-sm">{description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="border-border-subtle/50 bg-bg-secondary/10 rounded-xl border py-24 text-center">
          <BookOpen className="text-fg-muted mx-auto mb-4 h-12 w-12" />
          <h3 className="text-fg-primary text-lg font-bold">{t("no_articles")}</h3>
          <p className="text-fg-muted mt-1 text-sm">{t("no_articles_desc")}</p>
        </div>
      )}

      {/* Premium Newsletter Signup Box */}
      <Section className="border-border-subtle/50 border-t pt-16">
        <div className="mx-auto max-w-4xl">
          <Card variant="glass" className="relative overflow-hidden">
            {/* Cybersecurity style bg element */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:24px_24px] opacity-30" />
            <CardContent className="relative z-10 flex flex-col items-center gap-8 p-8 text-left sm:p-12 md:flex-row">
              <div className="flex-1 space-y-3">
                <span className="text-brand-400 block text-xs font-black tracking-widest uppercase">
                  {t("newsletter_title")}
                </span>
                <h2 className="text-fg-primary text-2xl font-black tracking-tight sm:text-3xl">
                  Stay updated with ALPAR Insights
                </h2>
                <p className="text-fg-muted max-w-lg text-sm leading-relaxed">
                  {t("newsletter_desc")}
                </p>
              </div>
              <div className="w-full md:w-auto md:min-w-[380px]">
                <NewsletterForm />
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </Container>
  );
}
