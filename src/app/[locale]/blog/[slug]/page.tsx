import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/layout";
import { Link } from "@/i18n/routing";
import { getAllPosts, getPostBySlug } from "@/content/blog-posts";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { BlogArticleJsonLd } from "@/components/seo/json-ld";
import { APP_URL } from "@/lib/constants";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const post = getPostBySlug(slug);
  if (post) {
    const title = locale === "tr" ? post.title_tr : post.title;
    const description = locale === "tr" ? post.description_tr : post.description;
    const author = locale === "tr" && post.author_tr ? post.author_tr : post.author;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        publishedTime: post.date,
        authors: [author],
        locale,
      },
    };
  }

  const supabase = await createServerClient();
  const { data: dbPost } = await supabase
    .from("blog_posts")
    .select("title_en, title_tr, content_en, content_tr, published_at, created_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!dbPost) return {};

  const title = locale === "tr" ? dbPost.title_tr : dbPost.title_en;
  const content = locale === "tr" ? dbPost.content_tr : dbPost.content_en;
  const desc = content.slice(0, 155) + "...";
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: "article",
      publishedTime: dbPost.published_at ?? dbPost.created_at,
      authors: [t("author")],
      locale,
    },
  };
}

function renderMarkdown(content: string): string {
  const lines = content.split("\n");
  const out: string[] = [];
  let inList = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("### ")) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("- ")) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${escapeHtml(trimmed.slice(2))}</li>`);
    } else if (trimmed.startsWith("*(More") || trimmed.startsWith("*(More")) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<p><em>${escapeHtml(trimmed.replace(/^\*\(|\)\*$/g, ""))}</em></p>`);
    } else if (trimmed.length > 0) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<p>${escapeHtml(trimmed)}</p>`);
    } else if (inList) {
      out.push("</ul>");
      inList = false;
    }
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });

  const staticPost = getPostBySlug(slug);
  let title = "";
  let description = "";
  let author = "";
  let content = "";
  let date = "";
  let readingTime = 1;
  let tags: string[] = [];

  if (staticPost) {
    title = locale === "tr" ? staticPost.title_tr : staticPost.title;
    description = locale === "tr" ? staticPost.description_tr : staticPost.description;
    author = locale === "tr" && staticPost.author_tr ? staticPost.author_tr : staticPost.author;
    content = locale === "tr" ? staticPost.content_tr : staticPost.content;
    date = staticPost.date;
    readingTime = staticPost.readingTime;
    tags = staticPost.tags;
  } else {
    const supabase = await createServerClient();
    const { data: dbPost } = await supabase
      .from("blog_posts")
      .select("title_en, title_tr, content_en, content_tr, published_at, created_at")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!dbPost) notFound();

    title = locale === "tr" ? dbPost.title_tr : dbPost.title_en;
    content = locale === "tr" ? dbPost.content_tr : dbPost.content_en;
    description = content.slice(0, 160) + "...";
    author = t("author");
    date = dbPost.published_at ?? dbPost.created_at;
    readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
    tags = ["report", "autopilot"];
  }

  const html = renderMarkdown(content);

  return (
    <Container size="narrow" className="py-12">
      <BlogArticleJsonLd
        title={title}
        description={description}
        datePublished={date}
        url={`${APP_URL}/${locale}/blog/${slug}`}
        authorName={author}
      />
      <Link
        href="/blog"
        className="text-fg-muted hover:text-brand-400 mb-8 inline-flex items-center gap-2 text-sm font-semibold"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      <article>
        <header className="mb-8 space-y-4">
          <h1 className="text-fg-primary text-4xl leading-tight font-black tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="text-fg-secondary text-lg">{description}</p>
          <div className="text-fg-muted flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={date}>
                {new Date(date).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readingTime} {t("min")}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const displayTag = t("tags." + tag.toLowerCase(), { defaultValue: tag });
              return (
                <span
                  key={tag}
                  className="bg-bg-tertiary text-fg-muted rounded px-2 py-0.5 text-xs font-semibold tracking-wider uppercase"
                >
                  {displayTag}
                </span>
              );
            })}
          </div>
        </header>

        <div
          className="prose prose-invert [&_h2]:text-fg-primary [&_h3]:text-fg-primary [&_p]:text-fg-secondary [&_ul]:text-fg-secondary max-w-none [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:my-1 [&_p]:my-4 [&_p]:leading-relaxed [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </Container>
  );
}
