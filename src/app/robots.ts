import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/en",
          "/tr",
          "/incidents",
          "/leaderboard",
          "/suggestions",
          "/about",
          "/contact",
          "/blog",
          "/blog/*",
          "/press-kit",
          "/press-kit/*",
          "/pricing",
          "/trust-center",
          "/academy",
          "/transparency",
          "/ai-act",
          "/experts",
          "/invest",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/*/admin",
          "/*/admin/*",
          "/investor-portal",
          "/investor-portal/*",
          "/*/investor-portal",
          "/*/investor-portal/*",
          "/api/*",
          "/auth/*",
          "/profile",
          "/my-incidents",
          "/settings",
          "/legal/takedown",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
