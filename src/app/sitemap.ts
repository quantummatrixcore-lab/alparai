import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { APP_URL, SUPPORTED_LOCALES } from "@/lib/constants";
import { getAllPosts } from "@/content/blog-posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = SUPPORTED_LOCALES;

  const supabase = await createServerClient();
  const [{ data: incidents }, { data: providers }, { data: models }] = await Promise.all([
    supabase
      .from("incidents")
      .select("id, created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(500),
    supabase.from("ai_providers").select("slug"),
    supabase.from("ai_models").select("id, provider_id, released_at"),
  ]);

  const base: MetadataRoute.Sitemap = [
    { url: `${APP_URL}`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${APP_URL}/incidents`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    { url: `${APP_URL}/models`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    {
      url: `${APP_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/dilemmas`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${APP_URL}/security`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${APP_URL}/dmca`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${APP_URL}/moderation`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${APP_URL}/transparency`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/ai-act`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${APP_URL}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${APP_URL}/legal/takedown`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${APP_URL}/legal/cookies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${APP_URL}/press-kit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${APP_URL}/academy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/experts`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${APP_URL}/invest`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ].flatMap((route) =>
    locales.map(
      (l) =>
        ({
          ...route,
          url: route.url.replace(`${APP_URL}`, `${APP_URL}/${l}`),
        }) as MetadataRoute.Sitemap[number],
    ),
  );

  if (incidents) {
    for (const i of (incidents as Array<{ id: string; created_at: string }>) ?? []) {
      for (const locale of locales) {
        base.push({
          url: `${APP_URL}/${locale}/incidents/${i.id}`,
          lastModified: new Date(i.created_at),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  }

  if (models) {
    for (const m of (models as Array<{
      id: string;
      provider_id: string;
      released_at: string | null;
    }>) ?? []) {
      for (const locale of locales) {
        base.push({
          url: `${APP_URL}/${locale}/models/${m.provider_id}/${m.id}`,
          lastModified: m.released_at ? new Date(m.released_at) : new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  }

  for (const p of (providers as Array<{ slug: string }>) ?? []) {
    for (const locale of locales) {
      base.push({
        url: `${APP_URL}/${locale}/press-kit/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.7,
      });
      base.push({
        url: `${APP_URL}/${locale}/incidents/provider/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  }

  const staticPosts = getAllPosts();
  const { data: dbPosts } = await supabase
    .from("blog_posts")
    .select("slug, published_at, created_at")
    .eq("status", "published");

  const allPostSlugs = new Map<string, Date>();

  for (const post of staticPosts) {
    allPostSlugs.set(post.slug, new Date(post.date));
  }

  if (dbPosts) {
    for (const post of (dbPosts as Array<{
      slug: string;
      published_at: string | null;
      created_at: string;
    }>) ?? []) {
      allPostSlugs.set(post.slug, new Date(post.published_at ?? post.created_at));
    }
  }

  for (const [slug, date] of allPostSlugs.entries()) {
    for (const locale of locales) {
      base.push({
        url: `${APP_URL}/${locale}/blog/${slug}`,
        lastModified: date,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return base;
}
